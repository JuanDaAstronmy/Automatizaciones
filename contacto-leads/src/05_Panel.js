/* =================== Panel del equipo (protegido con clave) =================== */

function validarClave_(clave) {
  const real = props_().getProperty('CLAVE_PANEL');
  if (!real || String(clave || '') !== real) {
    throw new Error('Acceso no autorizado. Pide al equipo el link correcto del panel.');
  }
}

/** Lo que el panel necesita de cada contacto (sin objetos Date: google.script.run no los acepta). */
function contactoParaPanel_(c, url, ahoraMs) {
  const off = offsetMinutos_(c.fechaReunion || new Date(ahoraMs));
  return {
    id: c.id,
    nombre: c.nombre,
    primerNombre: c.primerNombre,
    telefono: c.telefono,
    telefonoTexto: formatearTelefono_(c.telefono),
    valido: normalizarTelefono_(c.telefono, getConfig_().PAIS).valido,
    correo: c.correo,
    estado: c.estado,
    responsable: c.responsable,
    intentos: c.intentos,
    ultimoContacto: c.ultimoContacto ? c.ultimoContacto.getTime() : null,
    ultimoContactoTexto: c.ultimoContacto ? haceCuanto_(c.ultimoContacto.getTime(), ahoraMs) : '',
    fechaReunion: c.fechaReunion ? c.fechaReunion.getTime() : null,
    fechaReunionTexto: c.fechaReunion ? formatearDiaCorto_(c.fechaReunion, off) + ' · ' + formatearHora_(c.fechaReunion, off) + (c.sesion ? ' · con ' + c.sesion : '') : '',
    linkReunion: c.linkReunion,
    notas: c.notas,
    origen: c.origen,
    programa: c.programa,
    creado: c.creado ? c.creado.getTime() : null,
    link: url && c.id ? url + '?id=' + c.id : '',
    vars: {
      nombre: c.nombre,
      primer_nombre: c.primerNombre,
      link: url && c.id ? url + '?id=' + c.id : '',
      organizacion: getConfig_().ORG,
      fecha_reunion: c.fechaReunion ? formatearDia_(c.fechaReunion, off) : '',
      hora_reunion: c.fechaReunion ? formatearHora_(c.fechaReunion, off) : '',
      meet: c.linkReunion || '',
    },
  };
}

function panelDatos(clave) {
  validarClave_(clave);
  const cfg = getConfig_();
  const url = urlWeb_();
  const ahora = Date.now();
  return {
    org: cfg.ORG,
    equipo: listaTexto_(cfg.EQUIPO),
    estados: LISTA_ESTADOS,
    mensajes: leerMensajes_(),
    contactos: leerContactos_().map(function (c) { return contactoParaPanel_(c, url, ahora); }),
    urlAgenda: url,
    urlHoja: libro_().getUrl(),
    modo: cfg.MODO_WA,
    sinUrl: !url,
    ahora: ahora,
  };
}

function cambiarContacto_(clave, id, fn) {
  validarClave_(clave);
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) throw new Error('La hoja está ocupada, intenta de nuevo.');
  try {
    const r = buscarContacto_(id);
    if (!r) throw new Error('No encontré ese contacto (¿lo borraron de la hoja?). Actualiza el panel.');
    const cambios = fn(r.contacto) || {};
    actualizarFila_(r.tabla, r.contacto._fila, cambios);
    const actualizado = buscarContacto_(id).contacto;
    return contactoParaPanel_(actualizado, urlWeb_(), Date.now());
  } finally {
    lock.releaseLock();
  }
}

/**
 * Se llama cuando alguien del equipo toca un botón de WhatsApp en el panel.
 * claveMensaje: PRIMER_CONTACTO, SEGUIMIENTO, RECORDATORIO o RESP_*
 */
function panelRegistrarEnvio(clave, id, claveMensaje, remitente) {
  claveMensaje = String(claveMensaje || '').toUpperCase().slice(0, 40);
  remitente = String(remitente || '').trim().slice(0, 60);
  return cambiarContacto_(clave, id, function (c) {
    const cambios = {};
    const esIntento = claveMensaje === MSG.PRIMER || claveMensaje === MSG.SEGUIMIENTO;
    cambios[COL.ULTIMO_CONTACTO] = new Date();
    if (esIntento) cambios[COL.INTENTOS] = c.intentos + 1;
    if (c.estado === ESTADO.PENDIENTE && esIntento) cambios[COL.ESTADO] = ESTADO.CONTACTADO;
    if (claveMensaje.indexOf(MSG.PREFIJO_RESPUESTA) === 0 && (c.estado === ESTADO.PENDIENTE || c.estado === ESTADO.CONTACTADO)) {
      cambios[COL.ESTADO] = ESTADO.RESPONDIO;
    }
    if (!c.responsable && remitente) cambios[COL.RESPONSABLE] = remitente;
    registrar_('WhatsApp: ' + claveMensaje, c.id, c.nombre, '', remitente);
    return cambios;
  });
}

function panelCambiarEstado(clave, id, estado, remitente) {
  if (LISTA_ESTADOS.indexOf(estado) < 0) throw new Error('Estado no válido.');
  return cambiarContacto_(clave, id, function (c) {
    const cambios = {};
    cambios[COL.ESTADO] = estado;
    if (!c.responsable && remitente) cambios[COL.RESPONSABLE] = String(remitente).slice(0, 60);
    registrar_('Estado → ' + estado, c.id, c.nombre, 'Antes: ' + c.estado, remitente);
    return cambios;
  });
}

function panelGuardarNota(clave, id, nota, remitente) {
  return cambiarContacto_(clave, id, function (c) {
    const cambios = {};
    cambios[COL.NOTAS] = String(nota || '').slice(0, 2000);
    registrar_('Nota', c.id, c.nombre, String(nota || '').slice(0, 120), remitente);
    return cambios;
  });
}

function panelAsignar(clave, id, responsable) {
  return cambiarContacto_(clave, id, function () {
    const cambios = {};
    cambios[COL.RESPONSABLE] = String(responsable || '').slice(0, 60);
    return cambios;
  });
}

/**
 * Modo rápido: "aparta" un lead pendiente para quien lo va a contactar, así dos personas
 * del equipo no le escriben al mismo tiempo.
 */
function panelReclamar(clave, id, remitente) {
  validarClave_(clave);
  remitente = String(remitente || '').trim().slice(0, 60);
  if (!remitente) throw new Error('Primero elige arriba "¿Quién eres?".');
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) throw new Error('La hoja está ocupada, intenta de nuevo.');
  try {
    const r = buscarContacto_(id);
    if (!r) return { ok: false, responsable: '' };
    const c = r.contacto;
    const url = urlWeb_();
    if (c.estado !== ESTADO.PENDIENTE || (c.responsable && c.responsable !== remitente)) {
      return { ok: false, responsable: c.responsable, contacto: contactoParaPanel_(c, url, Date.now()) };
    }
    if (!c.responsable) {
      const cambios = {};
      cambios[COL.RESPONSABLE] = remitente;
      actualizarFila_(r.tabla, c._fila, cambios);
      c.responsable = remitente;
    }
    return { ok: true, contacto: contactoParaPanel_(c, url, Date.now()) };
  } finally {
    lock.releaseLock();
  }
}

/** Devuelve un lead apartado en modo rápido si al final no se le escribió. */
function panelLiberar(clave, id, remitente) {
  validarClave_(clave);
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) return null;
  try {
    const r = buscarContacto_(id);
    if (!r) return null;
    const c = r.contacto;
    if (c.estado === ESTADO.PENDIENTE && c.intentos === 0 && c.responsable && c.responsable === String(remitente || '').trim()) {
      const cambios = {};
      cambios[COL.RESPONSABLE] = '';
      actualizarFila_(r.tabla, c._fila, cambios);
      c.responsable = '';
    }
    return contactoParaPanel_(c, urlWeb_(), Date.now());
  } finally {
    lock.releaseLock();
  }
}

/** Agrega un contacto a mano desde el panel (ej. alguien que escribió directo al WhatsApp). */
function panelNuevoContacto(clave, datos, remitente) {
  validarClave_(clave);
  datos = datos || {};
  const cfg = getConfig_();
  const tel = normalizarTelefono_(datos.telefono, cfg.PAIS);
  if (!tel.telefono) throw new Error('Escribe el número de WhatsApp.');
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) throw new Error('La hoja está ocupada, intenta de nuevo.');
  try {
    const res = importarFilas_(['Nombre', 'Teléfono', 'Correo', 'Origen'],
      [[datos.nombre || '', tel.telefono, datos.correo || '', datos.origen || 'Agregado desde el panel']], '');
    if (res.duplicados) throw new Error('Ese número ya está en la lista.');
    const c = buscarContactoPorTelefono_(tablaContactos_(), tel.telefono);
    registrar_('Contacto nuevo (panel)', c.id, c.nombre, '', remitente);
    return contactoParaPanel_(c, urlWeb_(), Date.now());
  } finally {
    lock.releaseLock();
  }
}
