/* =================== Correo masivo personalizado ===================
 * Envía un BORRADOR de Gmail (de la cuenta dueña del script) a cada lead con correo,
 * cambiando [Nombre] / {primer_nombre} / {nombre} por el nombre de cada persona.
 * - Se envía desde la cuenta dueña de la hoja (o desde un alias "Enviar como" de esa cuenta).
 * - Respeta el cupo diario de Google (cuentas @gmail ≈ 100 destinatarios/día): si se acaba,
 *   continúa al día siguiente con "Enviar a los que faltan".
 * - Marca la columna "Correo enviado" para no repetir.
 */

function personalizarCorreo_(texto, c) {
  const primer = c.primerNombre || '';
  return String(texto || '')
    .replace(/\[\s*nombre\s*\]/gi, primer)
    .replace(/\{primer_nombre\}/gi, primer)
    .replace(/\{nombre\}/gi, c.nombre || primer);
}

/** Busca el borrador cuyo asunto contiene el texto dado. */
function borradorPlantilla_(asunto) {
  const buscado = normalizarTexto_(asunto);
  const d = GmailApp.getDrafts().filter(function (x) {
    return normalizarTexto_(x.getMessage().getSubject()).indexOf(buscado) >= 0;
  })[0];
  if (!d) throw new Error('No encontré un borrador cuyo asunto contenga "' + asunto + '". Revisa la carpeta Borradores de la cuenta dueña de la hoja.');
  const m = d.getMessage();
  return { asunto: m.getSubject(), html: m.getBody(), texto: m.getPlainBody(), adjuntos: m.getAttachments({ includeInlineImages: false }) };
}

/** Destinatarios: con correo válido, sin "Correo enviado", del programa elegido y sin descartar. */
function destinatariosCorreo_(programa) {
  return leerContactos_().filter(function (c) {
    if (!correoValido_(c.correo) || c.correoEnviado) return false;
    if ([ESTADO.NO_CUMPLE, ESTADO.NO_INTERESADO].indexOf(c.estado) >= 0) return false;
    return !programa || programa === 'TODOS' || c.programa === programa;
  });
}

function opcionesEnvio_(cfg, p, adjuntos) {
  const o = { htmlBody: p.html, name: cfg.CORREO_NOMBRE || cfg.ORG };
  if (cfg.CORREO_ALIAS) o.from = cfg.CORREO_ALIAS;
  if (adjuntos && adjuntos.length) o.attachments = adjuntos;
  return o;
}

/** Envía la prueba a la cuenta dueña, con el nombre de ejemplo "Prueba". */
function enviarPruebaCorreo_(asunto) {
  const cfg = getConfig_();
  const p = borradorPlantilla_(asunto);
  const yo = Session.getEffectiveUser().getEmail();
  const ejemplo = { nombre: 'Prueba Ejemplo', primerNombre: 'Prueba' };
  GmailApp.sendEmail(yo, personalizarCorreo_(p.asunto, ejemplo), personalizarCorreo_(p.texto, ejemplo),
    opcionesEnvio_(cfg, { html: personalizarCorreo_(p.html, ejemplo) }, p.adjuntos));
  return yo;
}

/** Envía a todos los que faltan (hasta agotar el cupo diario). */
function enviarCorreoMasivo_(asunto, programa) {
  const cfg = getConfig_();
  const p = borradorPlantilla_(asunto);
  const tabla = tablaContactos_();
  const lista = destinatariosCorreo_(programa);
  const res = { enviados: 0, pendientes: 0, errores: [] };
  let cupo = MailApp.getRemainingDailyQuota() - 3; // deja margen para los resúmenes del día
  const inicio = Date.now();
  lista.forEach(function (c) {
    if (cupo <= 0 || Date.now() - inicio > 270000) { res.pendientes++; return; }
    try {
      GmailApp.sendEmail(c.correo, personalizarCorreo_(p.asunto, c), personalizarCorreo_(p.texto, c),
        opcionesEnvio_(cfg, { html: personalizarCorreo_(p.html, c) }, p.adjuntos));
      const cambios = {};
      cambios[COL.CORREO_ENVIADO] = new Date();
      actualizarFila_(tabla, c._fila, cambios);
      registrar_('Correo masivo', c.id, c.nombre, p.asunto, Session.getEffectiveUser().getEmail());
      res.enviados++;
      cupo--;
      Utilities.sleep(400);
    } catch (e) {
      res.errores.push(c.nombre + ' (' + c.correo + '): ' + e.message);
    }
  });
  return res;
}
