/* =================== WhatsApp Cloud API (OPCIONAL, nivel 2) ===================
 * Envía la plantilla aprobada por Meta a los leads pendientes, sin tocar el celular.
 * Credenciales en Propiedades del script (menú AIESEC → WhatsApp API → Guardar credenciales):
 *   WA_TOKEN, WA_PHONE_NUMBER_ID, WA_PLANTILLA, WA_IDIOMA, WA_API_VERSION,
 *   WA_BOTON_URL (SI/NO), WA_NOMBRE_DEFECTO,
 *   WA_URL_MENSAJES + WA_HEADER_AUTH (solo si usas un proveedor compatible, ej. 360dialog)
 * Ver docs/04-whatsapp-api.md
 */

const COSTO_APROX_USD_MARKETING_CO = 0.0144; // tarifa de referencia Colombia 2026; verifícala en Meta.

function waConfig_() {
  const p = props_();
  return {
    token: p.getProperty('WA_TOKEN') || '',
    phoneId: p.getProperty('WA_PHONE_NUMBER_ID') || '',
    version: p.getProperty('WA_API_VERSION') || 'v23.0',
    plantilla: p.getProperty('WA_PLANTILLA') || 'invitacion_agendar',
    idioma: p.getProperty('WA_IDIOMA') || 'es',
    botonUrl: siNo_(p.getProperty('WA_BOTON_URL') || 'SI'),
    nombreDefecto: p.getProperty('WA_NOMBRE_DEFECTO') || 'qué tal',
    urlMensajes: p.getProperty('WA_URL_MENSAJES') || '',
    headerAuth: p.getProperty('WA_HEADER_AUTH') || '',
  };
}

function waListo_(w) {
  return !!(w.token && (w.phoneId || w.urlMensajes));
}

/**
 * Plantilla esperada en Meta (categoría Marketing):
 *   Cuerpo: "¡Hola, {{1}}! ..."  → {{1}} = primer nombre
 *   Botón URL dinámico: https://script.google.com/macros/s/XXXX/exec?id={{1}} → {{1}} = ID del contacto
 */
function payloadPlantilla_(c, w) {
  const componentes = [{ type: 'body', parameters: [{ type: 'text', text: c.primerNombre || w.nombreDefecto }] }];
  if (w.botonUrl) componentes.push({ type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: c.id }] });
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: c.telefono,
    type: 'template',
    template: { name: w.plantilla, language: { code: w.idioma }, components: componentes },
  };
}

function enviarWhatsAppAPI_(payload, w) {
  const url = w.urlMensajes || ('https://graph.facebook.com/' + w.version + '/' + w.phoneId + '/messages');
  const headers = {};
  if (w.headerAuth) headers[w.headerAuth] = w.token; else headers.Authorization = 'Bearer ' + w.token;
  const r = UrlFetchApp.fetch(url, {
    method: 'post', contentType: 'application/json', headers: headers,
    payload: JSON.stringify(payload), muteHttpExceptions: true,
  });
  const codigo = r.getResponseCode();
  let cuerpo = {};
  try { cuerpo = JSON.parse(r.getContentText()); } catch (e) { cuerpo = {}; }
  if (codigo >= 200 && codigo < 300 && cuerpo.messages && cuerpo.messages[0]) return { ok: true, id: cuerpo.messages[0].id };
  const err = cuerpo.error || {};
  return { ok: false, codigo: err.code || codigo, mensaje: (err.error_data && err.error_data.details) || err.message || String(r.getContentText()).slice(0, 300) };
}

/** Errores que indican que no tiene sentido seguir enviando (token, plantilla, pago, límites). */
function esErrorFatal_(codigo) {
  return [0, 3, 10, 190, 200, 131031, 131042, 131048, 132000, 132001, 132005, 132007, 132012, 133010, 401, 403].indexOf(Number(codigo)) >= 0;
}

function pendientesAPI_() {
  const pais = getConfig_().PAIS;
  return leerContactos_().filter(function (c) {
    return c.estado === ESTADO.PENDIENTE && c.intentos === 0 && normalizarTelefono_(c.telefono, pais).valido;
  });
}

/**
 * Envía la plantilla a los pendientes (máx. `limite`). Se detiene antes de los 6 min de Apps Script.
 * @return {{enviados:number, fallidos:number, errores:string[], detenido:string}}
 */
function envioMasivoAPI_(limite) {
  const w = waConfig_();
  if (!waListo_(w)) throw new Error('Faltan las credenciales de WhatsApp API (menú AIESEC → WhatsApp API → Guardar credenciales).');
  const inicio = Date.now();
  const res = { enviados: 0, fallidos: 0, errores: [], detenido: '' };
  const lista = pendientesAPI_().slice(0, limite || 250);
  const tabla = tablaContactos_();
  let seguidos = 0;
  for (let i = 0; i < lista.length; i++) {
    if (Date.now() - inicio > 270000) { res.detenido = 'Tiempo máximo alcanzado; vuelve a ejecutar para continuar.'; break; }
    const c = lista[i];
    const r = enviarWhatsAppAPI_(payloadPlantilla_(c, w), w);
    if (r.ok) {
      const cambios = {};
      cambios[COL.ESTADO] = ESTADO.CONTACTADO;
      cambios[COL.INTENTOS] = c.intentos + 1;
      cambios[COL.ULTIMO_CONTACTO] = new Date();
      if (!c.responsable) cambios[COL.RESPONSABLE] = 'WhatsApp API';
      actualizarFila_(tabla, c._fila, cambios);
      registrar_('WhatsApp API: plantilla', c.id, c.nombre, r.id, 'API');
      res.enviados++;
      seguidos = 0;
    } else {
      seguidos++;
      res.fallidos++;
      res.errores.push(c.nombre + ' (' + formatearTelefono_(c.telefono) + '): ' + r.codigo + ' ' + r.mensaje);
      registrar_('WhatsApp API: error', c.id, c.nombre, r.codigo + ' ' + r.mensaje, 'API');
      if (esErrorFatal_(r.codigo) || seguidos >= 5) { res.detenido = 'Me detuve por un error que se repite (' + r.codigo + '): ' + r.mensaje; break; }
    }
    Utilities.sleep(250);
  }
  return res;
}
