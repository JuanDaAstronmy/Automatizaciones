/* =================== Acceso a la hoja de cálculo =================== */

function libro_() {
  if (libro_.cache) return libro_.cache;
  let ss = null;
  const id = props_().getProperty('ID_HOJA');
  if (id) {
    try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; }
  }
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('No encuentro la hoja de cálculo. Abre la hoja y ejecuta el menú AIESEC → Configurar.');
  libro_.cache = ss;
  return ss;
}

function hoja_(nombre) {
  const sh = libro_().getSheetByName(nombre);
  if (!sh) throw new Error('Falta la pestaña "' + nombre + '". Ejecuta el menú AIESEC → Configurar.');
  return sh;
}

/** Lee una pestaña como objetos {encabezado: valor, _fila: n}. */
function leerTabla_(sh) {
  const lr = sh.getLastRow(), lc = sh.getLastColumn();
  if (lr < 1 || lc < 1) return { sh: sh, encabezados: [], idx: {}, filas: [] };
  const vals = sh.getRange(1, 1, lr, lc).getValues();
  const encabezados = vals[0].map(function (v) { return String(v).trim(); });
  const idx = {};
  encabezados.forEach(function (h, i) { if (h && !(h in idx)) idx[h] = i; });
  const filas = [];
  for (let r = 1; r < vals.length; r++) {
    const o = { _fila: r + 1 };
    encabezados.forEach(function (h, i) { if (h) o[h] = vals[r][i]; });
    filas.push(o);
  }
  return { sh: sh, encabezados: encabezados, idx: idx, filas: filas };
}

/** Escribe solo las celdas indicadas (no pisa lo que el equipo escribió en otras columnas). */
function actualizarFila_(tabla, fila, cambios) {
  Object.keys(cambios).forEach(function (h) {
    const c = tabla.idx[h];
    if (c === undefined) return;
    tabla.sh.getRange(fila, c + 1).setValue(cambios[h]);
  });
}

/** Agrega filas (objetos por encabezado) al final de la tabla en una sola escritura. */
function agregarFilas_(tabla, objetos) {
  if (!objetos.length) return;
  const sh = tabla.sh;
  const ancho = tabla.encabezados.length;
  const inicio = Math.max(sh.getLastRow(), 1) + 1;
  const faltan = inicio + objetos.length - 1 - sh.getMaxRows();
  if (faltan > 0) sh.insertRowsAfter(sh.getMaxRows(), faltan);
  const valores = objetos.map(function (o) {
    return tabla.encabezados.map(function (h) {
      const v = h && Object.prototype.hasOwnProperty.call(o, h) ? o[h] : '';
      return v === null || v === undefined ? '' : v;
    });
  });
  sh.getRange(inicio, 1, valores.length, ancho).setValues(valores);
}

function registrar_(accion, id, nombre, detalle, por) {
  try {
    const sh = libro_().getSheetByName(HOJAS.REGISTRO);
    if (!sh) return;
    sh.appendRow([new Date(), accion, id || '', nombre || '', String(detalle || '').slice(0, 500), por || '']);
  } catch (e) {
    console.warn('No se pudo registrar: ' + e);
  }
}

/* --------------------------- Contactos --------------------------- */

/** Convierte una fila de la pestaña Contactos en un objeto cómodo de usar. */
function aContacto_(f) {
  const tel = String(f[COL.TELEFONO] === undefined ? '' : f[COL.TELEFONO]).replace(/\D/g, '');
  const nombre = String(f[COL.NOMBRE] || '').trim();
  return {
    _fila: f._fila,
    id: String(f[COL.ID] || '').trim(),
    nombre: nombre,
    primerNombre: primerNombre_(nombre),
    telefono: tel,
    correo: String(f[COL.CORREO] || '').trim(),
    estado: String(f[COL.ESTADO] || '').trim() || ESTADO.PENDIENTE,
    responsable: String(f[COL.RESPONSABLE] || '').trim(),
    intentos: Number(f[COL.INTENTOS]) || 0,
    ultimoContacto: esFecha_(f[COL.ULTIMO_CONTACTO]) ? f[COL.ULTIMO_CONTACTO] : null,
    fechaReunion: esFecha_(f[COL.FECHA_REUNION]) ? f[COL.FECHA_REUNION] : null,
    linkReunion: String(f[COL.LINK_REUNION] || '').trim(),
    agendadoEl: esFecha_(f[COL.AGENDADO_EL]) ? f[COL.AGENDADO_EL] : null,
    notas: String(f[COL.NOTAS] || ''),
    origen: String(f[COL.ORIGEN] || ''),
    eventoId: String(f[COL.EVENTO_ID] || '').trim(),
    sesion: String(f[COL.SESION] || '').trim(),
    programa: /\bGT\b|talento|profesor/i.test(String(f[COL.INFO_EXTRA] || '') + ' ' + String(f[COL.ORIGEN] || '')) ? 'GT' : 'GV',
    creado: esFecha_(f[COL.CREADO]) ? f[COL.CREADO] : null,
  };
}

function tablaContactos_() {
  return leerTabla_(hoja_(HOJAS.CONTACTOS));
}

/** Todos los contactos con ID (ignora filas vacías). */
function leerContactos_(tabla) {
  tabla = tabla || tablaContactos_();
  return tabla.filas.map(aContacto_).filter(function (c) { return c.id; });
}

/** Busca un contacto por ID. Devuelve { tabla, contacto } o null. */
function buscarContacto_(id) {
  id = limpiarId_(id);
  if (!id) return null;
  const tabla = tablaContactos_();
  const fila = tabla.filas.filter(function (f) { return String(f[COL.ID] || '').trim() === id; })[0];
  return fila ? { tabla: tabla, contacto: aContacto_(fila) } : null;
}

function buscarContactoPorTelefono_(tabla, telefono) {
  if (!telefono) return null;
  const fila = tabla.filas.filter(function (f) {
    return String(f[COL.TELEFONO] === undefined ? '' : f[COL.TELEFONO]).replace(/\D/g, '') === telefono && f[COL.ID];
  })[0];
  return fila ? aContacto_(fila) : null;
}

function linkAgenda_(id) {
  const url = urlWeb_();
  return url && id ? url + '?id=' + id : '';
}

/** Mensajes de la pestaña Mensajes: [{clave, nombre, texto}] */
function leerMensajes_() {
  const sh = libro_().getSheetByName(HOJAS.MENSAJES);
  if (!sh) return [];
  return leerTabla_(sh).filas.map(function (f) {
    return {
      clave: String(f['Clave'] || '').trim().toUpperCase(),
      nombre: String(f['Nombre del botón'] || '').trim(),
      texto: String(f['Texto'] || ''),
    };
  }).filter(function (m) { return m.clave && m.texto.trim(); });
}

function mensaje_(clave) {
  const m = leerMensajes_().filter(function (x) { return x.clave === clave; })[0];
  return m ? m.texto : '';
}

/** Variables disponibles para los mensajes de un contacto. */
function variablesContacto_(c, remitente) {
  const cfg = getConfig_();
  const off = offsetMinutos_(c.fechaReunion || new Date());
  return {
    nombre: c.nombre,
    primer_nombre: c.primerNombre || '',
    link: linkAgenda_(c.id),
    remitente: remitente || '',
    organizacion: cfg.ORG,
    fecha_reunion: c.fechaReunion ? formatearDia_(c.fechaReunion, off) : '',
    hora_reunion: c.fechaReunion ? formatearHora_(c.fechaReunion, off) : '',
    meet: c.linkReunion || '',
  };
}
