/* =================== Importación de leads =================== */

/** Columnas técnicas de los exports de Meta Lead Ads que no aportan al equipo. */
const COLUMNAS_IGNORADAS = ['id', 'ad_id', 'adset_id', 'campaign_id', 'form_id', 'is_organic', 'platform', 'lead_status', 'inbox_url', 'ad_name', 'adset_name', 'campaign_name', 'form_name'];

/**
 * Detecta qué columna es el nombre, el teléfono, el correo, etc. a partir de los encabezados
 * (sirve para exports de Meta Lead Ads, Google Forms, Typeform, Excel propio…).
 */
function mapearEncabezados_(encabezados) {
  const n = encabezados.map(normalizarTexto_);
  const mejor = function (puntaje) {
    let idx = -1, max = 0;
    n.forEach(function (h, i) { const p = h ? puntaje(h) : 0; if (p > max) { max = p; idx = i; } });
    return idx;
  };
  const esCampana = function (h) { return /(campaign|adset|ad_name|form_name|^ad_)/.test(h); };
  const mapa = {
    telefono: mejor(function (h) {
      if (/(documento|cedula|identificacion|^id$|_id$)/.test(h)) return 0;
      if (h.indexOf('whatsapp') >= 0) return 6;
      if (h.indexOf('celular') >= 0) return 5;
      if (h.indexOf('telefono') >= 0 || h.indexOf('phone') >= 0) return 4;
      if (h.indexOf('movil') >= 0) return 3;
      if (h === 'numero' || h.indexOf('numero_de_contacto') === 0 || h === 'tel') return 2;
      return 0;
    }),
    correo: mejor(function (h) {
      if (h.indexOf('correo') >= 0 || h.indexOf('email') >= 0 || h === 'e_mail') return 3;
      if (h === 'mail') return 2;
      return 0;
    }),
    nombre: mejor(function (h) {
      if (esCampana(h)) return 0;
      if (/(full_name|nombre_completo|nombres_y_apellidos|nombre_y_apellido)/.test(h)) return 5;
      if (['nombre', 'nombres', 'name', 'tu_nombre', 'cual_es_tu_nombre'].indexOf(h) >= 0) return 4;
      if (h.indexOf('nombre') >= 0 && h.indexOf('apellido') < 0) return 2;
      if (h === 'first_name' || h === 'primer_nombre') return 1;
      return 0;
    }),
    apellido: mejor(function (h) { return (h.indexOf('apellido') >= 0 && h.indexOf('nombre') < 0) || h === 'last_name' ? 1 : 0; }),
    origen: mejor(function (h) {
      if (h === 'origen' || h === 'fuente') return 5;
      if (h === 'campaign_name') return 4;
      if (h === 'form_name') return 3;
      if (h === 'ad_name') return 2;
      return 0;
    }),
  };
  const usados = [mapa.telefono, mapa.correo, mapa.nombre, mapa.apellido, mapa.origen];
  mapa.extra = [];
  n.forEach(function (h, i) {
    if (h && usados.indexOf(i) < 0 && COLUMNAS_IGNORADAS.indexOf(h) < 0) mapa.extra.push(i);
  });
  return mapa;
}

/**
 * Convierte filas crudas en contactos nuevos y los agrega a Contactos, sin duplicar
 * (compara por teléfono normalizado y, si no hay teléfono, por correo).
 * @return {{nuevos:number, duplicados:number, invalidos:number, vacios:number}}
 */
function importarFilas_(encabezados, filas, origenPorDefecto) {
  const cfg = getConfig_();
  const mapa = mapearEncabezados_(encabezados);
  const tabla = tablaContactos_();
  const existentesTel = {}, existentesCorreo = {};
  tabla.filas.forEach(function (f) {
    if (!f[COL.ID]) return;
    const t = String(f[COL.TELEFONO] === undefined ? '' : f[COL.TELEFONO]).replace(/\D/g, '');
    if (t) existentesTel[t] = true;
    const c = String(f[COL.CORREO] || '').trim().toLowerCase();
    if (c) existentesCorreo[c] = true;
  });
  const ahora = new Date();
  const res = { nuevos: 0, duplicados: 0, invalidos: 0, vacios: 0 };
  const nuevos = [];
  const celda = function (fila, i) { return i >= 0 ? fila[i] : ''; };

  filas.forEach(function (fila) {
    let nombre = String(celda(fila, mapa.nombre) || '').trim();
    const apellido = String(celda(fila, mapa.apellido) || '').trim();
    if (apellido && nombre.toLowerCase().indexOf(apellido.toLowerCase()) < 0) nombre = nombre + ' ' + apellido;
    nombre = limpiarNombre_(nombre);
    const tel = normalizarTelefono_(celda(fila, mapa.telefono), cfg.PAIS);
    const correo = String(celda(fila, mapa.correo) || '').trim().toLowerCase();
    if (!nombre && !tel.telefono && !correo) { res.vacios++; return; }
    if ((tel.telefono && existentesTel[tel.telefono]) || (!tel.telefono && correo && existentesCorreo[correo])) {
      res.duplicados++;
      return;
    }
    const extra = mapa.extra.map(function (i) {
      let v = fila[i];
      if (esFecha_(v)) v = Utilities.formatDate(v, zona_(), 'yyyy-MM-dd HH:mm');
      v = String(v === null || v === undefined ? '' : v).trim();
      return v ? encabezados[i] + ': ' + v : '';
    }).filter(String).join(' · ');
    const id = generarId_();
    const o = {};
    o[COL.ID] = id;
    o[COL.NOMBRE] = nombre;
    o[COL.TELEFONO] = tel.telefono;
    o[COL.CORREO] = correoValido_(correo) ? correo : '';
    o[COL.ESTADO] = tel.valido ? ESTADO.PENDIENTE : ESTADO.INVALIDO;
    o[COL.INTENTOS] = 0;
    o[COL.ORIGEN] = String(celda(fila, mapa.origen) || '').trim() || origenPorDefecto || cfg.ORIGEN;
    o[COL.LINK_AGENDA] = linkAgenda_(id);
    o[COL.INFO_EXTRA] = extra.slice(0, 2000);
    o[COL.CREADO] = ahora;
    nuevos.push(o);
    if (tel.telefono) existentesTel[tel.telefono] = true;
    if (correo) existentesCorreo[correo] = true;
    res.nuevos++;
    if (!tel.valido) res.invalidos++;
  });

  agregarFilas_(tabla, nuevos);
  if (res.nuevos) registrar_('Importación', '', '', res.nuevos + ' nuevos, ' + res.duplicados + ' repetidos, ' + res.invalidos + ' con número para revisar', origenPorDefecto || '');
  return res;
}

/** Importa lo que haya en la pestaña "Importar" (fila 1 = encabezados) y la deja limpia. */
function importarPestanaImportar_() {
  const sh = hoja_(HOJAS.IMPORTAR);
  const lr = sh.getLastRow(), lc = sh.getLastColumn();
  if (lr < 2 || lc < 1) return { nuevos: 0, duplicados: 0, invalidos: 0, vacios: 0 };
  const vals = sh.getRange(1, 1, lr, lc).getValues();
  const res = importarFilas_(vals[0].map(String), vals.slice(1), '');
  sh.getRange(2, 1, lr - 1, lc).clearContent();
  return res;
}

/** Importa desde una hoja externa (Google Form, Zapier/Make, etc.) configurada en Config. */
function importarDesdeFuente_() {
  const cfg = getConfig_();
  if (!cfg.FUENTE_URL) return null;
  const ss = SpreadsheetApp.openByUrl(cfg.FUENTE_URL);
  const sh = cfg.FUENTE_PESTANA ? ss.getSheetByName(cfg.FUENTE_PESTANA) : ss.getSheets()[0];
  if (!sh) throw new Error('No encuentro la pestaña "' + cfg.FUENTE_PESTANA + '" en la hoja externa.');
  const lr = sh.getLastRow(), lc = sh.getLastColumn();
  if (lr < 2) return { nuevos: 0, duplicados: 0, invalidos: 0, vacios: 0 };
  const vals = sh.getRange(1, 1, lr, lc).getValues();
  return importarFilas_(vals[0].map(String), vals.slice(1), '');
}

/** Rellena la columna "Link para agendar" (útil después de pegar la URL de la app web). */
function refrescarLinks_() {
  const tabla = tablaContactos_();
  const c = tabla.idx[COL.LINK_AGENDA];
  if (c === undefined || tabla.filas.length === 0) return 0;
  const url = urlWeb_();
  const valores = tabla.filas.map(function (f) {
    const id = String(f[COL.ID] || '').trim();
    return [url && id ? url + '?id=' + id : ''];
  });
  tabla.sh.getRange(2, c + 1, valores.length, 1).setValues(valores);
  return valores.length;
}
