/* =================== Agenda: horarios, reservas y Google Calendar =================== */

function calendarioId_() {
  const id = props_().getProperty('ID_CALENDARIO');
  if (!id) throw new Error('Falta el calendario de AIESEC. Ejecuta el menú AIESEC → Configurar.');
  return id;
}

function horarioSemanal_(cfg) {
  const h = {};
  for (let d = 0; d < 7; d++) h[d] = parseHorario_(cfg['H' + d]);
  return h;
}

/** Lee la pestaña Sesiones: [{dow, inicioMin, duracion, anfitrion, correos, cupos}] (vacío = usar horarios de Config). */
function leerSesiones_() {
  const sh = libro_().getSheetByName(HOJAS.SESIONES);
  if (!sh || sh.getLastRow() < 2) return [];
  const cfg = getConfig_();
  return leerTabla_(sh).filas.map(function (f) {
    let hora = f['Hora'];
    if (esFecha_(hora)) hora = Utilities.formatDate(hora, zona_(), 'HH:mm');
    const activa = String(f['Activa'] === undefined ? 'SI' : f['Activa']).trim();
    return {
      dow: DIAS_NORM[normalizarTexto_(f['Día'])],
      inicioMin: parseHora_(hora),
      duracion: Math.max(5, Number(f['Duración (min)']) || cfg.DURACION),
      anfitrion: String(f['Quién la da'] || '').trim(),
      correos: listaCorreos_(f['Correos de quien la da']),
      cupos: Math.max(1, Math.floor(Number(f['Cupos']) || cfg.CUPOS)),
      activa: activa === '' || siNo_(activa),
    };
  }).filter(function (s) { return s.activa && s.dow !== undefined && s.inicioMin !== null && s.anfitrion; });
}

function aplicantesDe_(ev) {
  const p = (ev.extendedProperties && ev.extendedProperties.private) || {};
  return String(p.aplicantes || p.contactoId || '').split(',').filter(String);
}

function esReserva_(ev) {
  return !!(ev.extendedProperties && ev.extendedProperties.private && ev.extendedProperties.private.aiesecReserva === '1');
}

function intervaloEvento_(ev, offMin) {
  if (ev.start && ev.start.dateTime) {
    return { inicio: new Date(ev.start.dateTime).getTime(), fin: new Date(ev.end.dateTime).getTime() };
  }
  const a = String(ev.start.date).split('-').map(Number);
  const b = String(ev.end.date).split('-').map(Number);
  return { inicio: fechaDesdeLocal_(a[0], a[1], a[2], 0, offMin).getTime(), fin: fechaDesdeLocal_(b[0], b[1], b[2], 0, offMin).getTime() };
}

function eventosEnRango_(calId, desde, hasta) {
  const items = [];
  let pageToken = null;
  do {
    const opciones = { timeMin: desde.toISOString(), timeMax: hasta.toISOString(), singleEvents: true, showDeleted: false, maxResults: 2500 };
    if (pageToken) opciones.pageToken = pageToken;
    const r = Calendar.Events.list(calId, opciones);
    (r.items || []).forEach(function (ev) { items.push(ev); });
    pageToken = r.nextPageToken || null;
  } while (pageToken);
  return items;
}

/** Horarios libres considerando: horario semanal, festivos, reservas, bloqueos y (opcional) tu calendario personal. */
function horariosDisponibles_(ahora) {
  const cfg = getConfig_();
  const off = offsetMinutos_(ahora);
  const desde = new Date(ahora.getTime() - MS_DIA);
  const hasta = new Date(ahora.getTime() + (cfg.DIAS + 1) * MS_DIA);
  const reservas = [], bloqueos = [];
  eventosEnRango_(calendarioId_(), desde, hasta).forEach(function (ev) {
    if (ev.status === 'cancelled') return;
    const it = intervaloEvento_(ev, off);
    if (esReserva_(ev)) {
      const n = Math.max(1, aplicantesDe_(ev).length);
      for (let i = 0; i < n; i++) reservas.push(it);
    }
    else if (ev.transparency !== 'transparent') bloqueos.push(it);
  });
  if (cfg.REVISAR_PRINCIPAL) {
    try {
      const fb = Calendar.Freebusy.query({ timeMin: desde.toISOString(), timeMax: hasta.toISOString(), items: [{ id: 'primary' }] });
      const ocupado = (fb.calendars && fb.calendars.primary && fb.calendars.primary.busy) || [];
      ocupado.forEach(function (b) { bloqueos.push({ inicio: new Date(b.start).getTime(), fin: new Date(b.end).getTime() }); });
    } catch (e) {
      console.warn('No se pudo revisar el calendario principal: ' + e);
    }
  }
  const festivos = {};
  if (cfg.FESTIVOS) {
    const y = partesLocales_(ahora, off).y;
    [y, y + 1].forEach(function (a) { const f = festivosColombia_(a); Object.keys(f).forEach(function (k) { festivos[k] = true; }); });
  }
  return calcularHorarios_({
    ahora: ahora, offMin: off, horario: horarioSemanal_(cfg), duracionMin: cfg.DURACION, pasoMin: cfg.PASO,
    anticipacionMin: cfg.ANTICIPACION * 60, dias: cfg.DIAS, cupos: cfg.CUPOS, reservas: reservas, bloqueos: bloqueos,
    festivos: festivos, fechasBloqueadas: listaTexto_(cfg.FECHAS_BLOQUEADAS), sesiones: leerSesiones_(),
  });
}

function linkMeet_(ev) {
  if (!ev) return '';
  if (ev.hangoutLink) return ev.hangoutLink;
  const eps = (ev.conferenceData && ev.conferenceData.entryPoints) || [];
  const v = eps.filter(function (e) { return e.entryPointType === 'video'; })[0];
  return v ? v.uri : '';
}

/** Crea el evento en el calendario de AIESEC con link de Google Meet e invita al aplicante y al equipo. */
function crearEventoReunion_(contacto, inicioMs) {
  const cfg = getConfig_();
  const calId = calendarioId_();
  const off = offsetMinutos_(new Date(inicioMs));
  const finMs = inicioMs + cfg.DURACION * MS_MIN;
  const asistentes = [];
  if (correoValido_(contacto.correo)) asistentes.push({ email: contacto.correo, displayName: contacto.nombre });
  listaCorreos_(cfg.CORREOS_INVITADOS).forEach(function (e) {
    if (e.toLowerCase() !== String(contacto.correo).toLowerCase()) asistentes.push({ email: e });
  });
  const link = linkAgenda_(contacto.id);
  const descripcion = [
    cfg.DESCRIPCION,
    '',
    'Aplicante: ' + contacto.nombre,
    contacto.telefono ? 'WhatsApp: ' + formatearTelefono_(contacto.telefono) : '',
    contacto.correo ? 'Correo: ' + contacto.correo : '',
    link ? '\n¿Necesitas cambiar el horario? Usa este link: ' + link : '',
  ].filter(function (x, i) { return i < 2 || x; }).join('\n');
  const recurso = {
    summary: cfg.TIPO_REUNION + ' · ' + contacto.nombre,
    description: descripcion,
    start: { dateTime: isoConOffset_(new Date(inicioMs), off), timeZone: zona_() },
    end: { dateTime: isoConOffset_(new Date(finMs), off), timeZone: zona_() },
    attendees: asistentes,
    guestsCanSeeOtherGuests: false,
    conferenceData: { createRequest: { requestId: Utilities.getUuid(), conferenceSolutionKey: { type: 'hangoutsMeet' } } },
    extendedProperties: { private: { aiesecReserva: '1', contactoId: contacto.id } },
    reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 30 }, { method: 'popup', minutes: 10 }] },
  };
  let ev = Calendar.Events.insert(recurso, calId, { conferenceDataVersion: 1, sendUpdates: asistentes.length ? 'all' : 'none' });
  let meet = linkMeet_(ev);
  for (let i = 0; !meet && i < 4; i++) {
    Utilities.sleep(1500);
    ev = Calendar.Events.get(calId, ev.id);
    meet = linkMeet_(ev);
  }
  return { eventoId: ev.id, meet: meet, htmlLink: ev.htmlLink || '' };
}

/**
 * Sesión grupal: todos los que agendan la misma sesión entran al MISMO evento (mismo Meet).
 * Quien la da recibe la invitación una vez; a cada aplicante le llega su propio correo de confirmación.
 */
function unirseASesion_(contacto, slot) {
  const cfg = getConfig_();
  const calId = calendarioId_();
  const sesion = leerSesiones_().filter(function (s) { return s.anfitrion === slot.anfitrion; })[0] || { correos: [] };
  const clave = 'S' + slot.ms;
  const existente = eventosEnRango_(calId, new Date(slot.ms - MS_MIN), new Date(slot.ms + MS_MIN)).filter(function (ev) {
    return ev.status !== 'cancelled' && esReserva_(ev) && ev.extendedProperties.private.sesion === clave;
  })[0];
  let ev;
  if (existente) {
    const ids = aplicantesDe_(existente);
    if (ids.indexOf(contacto.id) < 0) ids.push(contacto.id);
    const asistentes = (existente.attendees || []).slice();
    if (correoValido_(contacto.correo) && !asistentes.some(function (a) { return String(a.email).toLowerCase() === contacto.correo.toLowerCase(); })) {
      asistentes.push({ email: contacto.correo, displayName: contacto.nombre });
    }
    const priv = Object.assign({}, existente.extendedProperties.private, { aplicantes: ids.join(',') });
    ev = Calendar.Events.patch({ attendees: asistentes, extendedProperties: { private: priv } }, calId, existente.id, { sendUpdates: 'none' });
  } else {
    const off = offsetMinutos_(new Date(slot.ms));
    const asistentes = sesion.correos.map(function (e) { return { email: e }; });
    listaCorreos_(cfg.CORREOS_INVITADOS).forEach(function (e) { if (sesion.correos.indexOf(e) < 0) asistentes.push({ email: e }); });
    if (correoValido_(contacto.correo)) asistentes.push({ email: contacto.correo, displayName: contacto.nombre });
    ev = Calendar.Events.insert({
      summary: cfg.TIPO_REUNION + ' · con ' + slot.anfitrion,
      description: cfg.DESCRIPCION + '\n\nDa la sesión: ' + slot.anfitrion + '\nSesión grupal: los inscritos se ven en la hoja (pestaña Agendados).',
      start: { dateTime: isoConOffset_(new Date(slot.ms), off), timeZone: zona_() },
      end: { dateTime: isoConOffset_(new Date(slot.ms + slot.duracion * MS_MIN), off), timeZone: zona_() },
      attendees: asistentes,
      guestsCanSeeOtherGuests: false,
      conferenceData: { createRequest: { requestId: Utilities.getUuid(), conferenceSolutionKey: { type: 'hangoutsMeet' } } },
      extendedProperties: { private: { aiesecReserva: '1', sesion: clave, aplicantes: contacto.id, anfitrion: slot.anfitrion } },
      reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 30 }, { method: 'popup', minutes: 10 }] },
    }, calId, { conferenceDataVersion: 1, sendUpdates: asistentes.length ? 'all' : 'none' });
  }
  let meet = linkMeet_(ev);
  for (let i = 0; !meet && i < 4; i++) { Utilities.sleep(1500); ev = Calendar.Events.get(calId, ev.id); meet = linkMeet_(ev); }
  if (existente) confirmarPorCorreo_(contacto, slot, meet);
  return { eventoId: ev.id, meet: meet, htmlLink: ev.htmlLink || '' };
}

/** Correo de confirmación al aplicante que se une a una sesión ya creada (así no se re-notifica a todo el grupo). */
function confirmarPorCorreo_(contacto, slot, meet) {
  if (!correoValido_(contacto.correo)) return;
  const cfg = getConfig_();
  const off = offsetMinutos_(new Date(slot.ms));
  const cuando = formatearDia_(new Date(slot.ms), off) + ' a las ' + formatearHora_(new Date(slot.ms), off) + ' (hora Colombia)';
  const e = escaparHtml_;
  try {
    MailApp.sendEmail({
      to: contacto.correo,
      subject: cfg.TIPO_REUNION + ': ' + cuando,
      name: cfg.ORG,
      htmlBody: '<p>¡Hola, ' + e(contacto.primerNombre || contacto.nombre) + '! 👋</p><p>Quedaste inscrito/a en la <b>' + e(cfg.TIPO_REUNION) +
        '</b> con ' + e(slot.anfitrion) + ':</p><p style="font-size:16px"><b>🗓️ ' + e(cuando) + '</b></p>' +
        (meet ? '<p><a href="' + e(meet) + '">Entrar a Google Meet</a></p>' : '') +
        (linkAgenda_(contacto.id) ? '<p>¿Necesitas cambiar el horario? <a href="' + e(linkAgenda_(contacto.id)) + '">Hazlo aquí</a>.</p>' : '') +
        '<p>¡Te esperamos!<br>' + e(cfg.ORG) + '</p>',
    });
  } catch (err) {
    console.warn('No se pudo enviar la confirmación: ' + err);
  }
}

/** Saca al aplicante de su reunión: si es sesión grupal solo lo quita a él; si queda vacía (o es individual) borra el evento. */
function liberarReserva_(contacto) {
  if (!contacto.eventoId) return;
  const calId = calendarioId_();
  let ev = null;
  try { ev = Calendar.Events.get(calId, contacto.eventoId); } catch (e) { ev = null; }
  if (!ev || ev.status === 'cancelled') return;
  const priv = (ev.extendedProperties && ev.extendedProperties.private) || {};
  if (!priv.sesion) { borrarEvento_(contacto.eventoId); return; }
  const ids = aplicantesDe_(ev).filter(function (x) { return x !== contacto.id; });
  if (!ids.length) { borrarEvento_(contacto.eventoId); return; }
  const correo = String(contacto.correo || '').toLowerCase();
  const asistentes = (ev.attendees || []).filter(function (a) { return !correo || String(a.email).toLowerCase() !== correo; });
  Calendar.Events.patch({ attendees: asistentes, extendedProperties: { private: Object.assign({}, priv, { aplicantes: ids.join(',') }) } }, calId, ev.id, { sendUpdates: 'none' });
}

function borrarEvento_(eventoId) {
  if (!eventoId) return;
  try {
    Calendar.Events.remove(calendarioId_(), eventoId, { sendUpdates: 'all' });
  } catch (e) {
    console.warn('No se pudo borrar el evento ' + eventoId + ': ' + e);
  }
}

/** Crea o actualiza la fila del aplicante en la pestaña Agendados. */
function upsertAgendado_(c, estadoReunion) {
  const sh = libro_().getSheetByName(HOJAS.AGENDADOS);
  if (!sh) return;
  const tabla = leerTabla_(sh);
  const datos = {};
  datos[COLA.ID] = c.id;
  datos[COLA.REUNION] = c.fechaReunion || '';
  datos[COLA.SESION] = c.sesion || '';
  datos[COLA.NOMBRE] = c.nombre;
  datos[COLA.TELEFONO] = c.telefono;
  datos[COLA.CORREO] = c.correo;
  datos[COLA.LINK] = c.linkReunion;
  datos[COLA.RESPONSABLE] = c.responsable;
  datos[COLA.ESTADO] = estadoReunion;
  datos[COLA.AGENDADO_EL] = c.agendadoEl || '';
  // Se actualiza la fila de su reunión vigente; si su reunión anterior ya pasó, se agrega una fila nueva (queda el historial).
  const limite = Date.now() - 2 * 3600000;
  const fila = tabla.filas.filter(function (f) {
    return String(f[COLA.ID] || '').trim() === c.id && (!esFecha_(f[COLA.REUNION]) || f[COLA.REUNION].getTime() >= limite);
  })[0];
  if (fila) actualizarFila_(tabla, fila._fila, datos);
  else agregarFilas_(tabla, [datos]);
  // Ordena por fecha de reunión (las columnas que llena el equipo se mueven con su fila).
  const lr = sh.getLastRow();
  const col = tabla.idx[COLA.REUNION];
  if (lr > 2 && col !== undefined) sh.getRange(2, 1, lr - 1, sh.getLastColumn()).sort({ column: col + 1, ascending: true });
}

function respuestaContacto_(c) {
  const off = offsetMinutos_(c.fechaReunion || new Date());
  return {
    id: c.id,
    nombre: c.nombre,
    primerNombre: c.primerNombre,
    correo: c.correo,
    reserva: c.estado === ESTADO.AGENDADO && c.fechaReunion && c.fechaReunion.getTime() > Date.now() ? {
      inicio: isoConOffset_(c.fechaReunion, off),
      dia: formatearDia_(c.fechaReunion, off),
      hora: formatearHora_(c.fechaReunion, off),
      meet: c.linkReunion,
      anfitrion: c.sesion || '',
    } : null,
  };
}

/* ------------- Funciones públicas que usa la página de agendamiento ------------- */

/** Datos iniciales de la página: aplicante (si viene con ?id=) y horarios libres. */
function agendaDatos(id) {
  const cfg = getConfig_();
  id = limpiarId_(id);
  let contacto = null;
  if (id) {
    const r = buscarContacto_(id);
    if (!r) return { error: 'Este link no es válido o ya no existe. Escríbenos por WhatsApp y te enviamos uno nuevo.' };
    contacto = respuestaContacto_(r.contacto);
  } else if (!cfg.PERMITIR_GENERAL) {
    return { error: 'Para agendar necesitas el link personal que te enviamos por WhatsApp.' };
  }
  return {
    org: cfg.ORG,
    titulo: cfg.TIPO_REUNION,
    descripcion: cfg.DESCRIPCION,
    duracion: cfg.DURACION,
    contacto: contacto,
    pideTelefono: !contacto,
    dias: horariosDisponibles_(new Date()),
  };
}

/**
 * Reserva un horario. Usa un candado para que dos personas no tomen el mismo cupo.
 * datos = { nombre, correo, telefono }
 */
function agendaReservar(id, inicioISO, datos) {
  datos = datos || {};
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) throw new Error('Hay mucha gente agendando en este momento. Intenta de nuevo en unos segundos.');
  try {
    const cfg = getConfig_();
    id = limpiarId_(id);
    let tabla, contacto;
    if (id) {
      const r = buscarContacto_(id);
      if (!r) throw new Error('Este link no es válido. Escríbenos por WhatsApp y te enviamos uno nuevo.');
      tabla = r.tabla; contacto = r.contacto;
    } else if (!cfg.PERMITIR_GENERAL) {
      throw new Error('Para agendar necesitas el link personal que te enviamos por WhatsApp.');
    }

    const nombre = limpiarNombre_(datos.nombre) || (contacto && contacto.nombre) || '';
    const correo = String(datos.correo || '').trim().toLowerCase().slice(0, 120);
    if (!nombre) throw new Error('Escribe tu nombre, por favor.');
    if (correo && !correoValido_(correo)) throw new Error('Revisa tu correo: parece que tiene un error.');

    const inicio = new Date(String(inicioISO || ''));
    if (isNaN(inicio.getTime())) throw new Error('Elige un horario.');
    const ahora = new Date();
    let slot = null;
    horariosDisponibles_(ahora).forEach(function (d) {
      d.horarios.forEach(function (h) { if (h.ms === inicio.getTime()) slot = h; });
    });
    if (!slot) return { ok: false, ocupado: true, mensaje: 'Ese horario se acaba de ocupar 😕 Elige otro, por favor.' };

    if (!contacto) {
      const tel = normalizarTelefono_(datos.telefono, cfg.PAIS);
      if (!tel.valido) throw new Error('Revisa tu número de WhatsApp (ej. 300 123 4567).');
      tabla = tablaContactos_();
      contacto = buscarContactoPorTelefono_(tabla, tel.telefono);
      if (!contacto) {
        const nuevo = {};
        const nuevoId = generarId_();
        nuevo[COL.ID] = nuevoId;
        nuevo[COL.NOMBRE] = nombre;
        nuevo[COL.TELEFONO] = tel.telefono;
        nuevo[COL.CORREO] = correo;
        nuevo[COL.ESTADO] = ESTADO.RESPONDIO;
        nuevo[COL.INTENTOS] = 0;
        nuevo[COL.ORIGEN] = 'Link general';
        nuevo[COL.LINK_AGENDA] = linkAgenda_(nuevoId);
        nuevo[COL.CREADO] = ahora;
        agregarFilas_(tabla, [nuevo]);
        tabla = tablaContactos_();
        contacto = buscarContactoPorTelefono_(tabla, tel.telefono);
      }
    }

    // Solo se reprograma (y se borra el evento anterior) si la reunión anterior todavía no ha pasado.
    const anterior = contacto.estado === ESTADO.AGENDADO && contacto.eventoId && contacto.fechaReunion &&
      contacto.fechaReunion.getTime() > ahora.getTime() ? contacto.eventoId : '';
    const sinNombre = !contacto.nombre;
    contacto.nombre = contacto.nombre || nombre;
    contacto.primerNombre = primerNombre_(contacto.nombre);
    if (correo) contacto.correo = correo;
    const previo = { id: contacto.id, correo: contacto.correo, eventoId: anterior };
    const ev = slot.anfitrion ? unirseASesion_(contacto, slot) : crearEventoReunion_(contacto, inicio.getTime());
    if (anterior && anterior !== ev.eventoId) liberarReserva_(previo);

    const cambios = {};
    cambios[COL.ESTADO] = ESTADO.AGENDADO;
    cambios[COL.FECHA_REUNION] = inicio;
    cambios[COL.LINK_REUNION] = ev.meet;
    cambios[COL.AGENDADO_EL] = ahora;
    cambios[COL.EVENTO_ID] = ev.eventoId;
    cambios[COL.SESION] = slot.anfitrion || '';
    if (correo) cambios[COL.CORREO] = correo;
    if (sinNombre) cambios[COL.NOMBRE] = nombre;
    actualizarFila_(tabla, contacto._fila, cambios);

    contacto.estado = ESTADO.AGENDADO;
    contacto.fechaReunion = inicio;
    contacto.linkReunion = ev.meet;
    contacto.agendadoEl = ahora;
    contacto.eventoId = ev.eventoId;
    contacto.sesion = slot.anfitrion || '';
    upsertAgendado_(contacto, anterior ? 'Reprogramada' : 'Programada');

    const off = offsetMinutos_(inicio);
    registrar_(anterior ? 'Reprogramó' : 'Agendó', contacto.id, contacto.nombre, formatearFechaHora_(inicio, off), 'Aplicante');
    if (cfg.AVISO_INMEDIATO) {
      try { avisoInmediato_(contacto, !!anterior); } catch (e) { console.warn('Aviso inmediato falló: ' + e); }
    }
    return {
      ok: true,
      nombre: contacto.primerNombre || primerNombre_(nombre),
      dia: formatearDia_(inicio, off),
      hora: formatearHora_(inicio, off),
      inicio: isoConOffset_(inicio, off),
      fin: isoConOffset_(new Date(inicio.getTime() + (slot.duracion || cfg.DURACION) * MS_MIN), off),
      anfitrion: slot.anfitrion || '',
      meet: ev.meet,
      titulo: cfg.TIPO_REUNION,
      conCorreo: correoValido_(contacto.correo),
      reprogramada: !!anterior,
    };
  } finally {
    lock.releaseLock();
  }
}

/** El aplicante cancela su reunión desde su link. */
function agendaCancelar(id) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) throw new Error('Intenta de nuevo en unos segundos.');
  try {
    const r = buscarContacto_(limpiarId_(id));
    if (!r) throw new Error('Este link no es válido.');
    const c = r.contacto;
    if (c.estado !== ESTADO.AGENDADO) return { ok: true };
    liberarReserva_(c);
    const cambios = {};
    cambios[COL.ESTADO] = ESTADO.RESPONDIO;
    cambios[COL.FECHA_REUNION] = '';
    cambios[COL.LINK_REUNION] = '';
    cambios[COL.EVENTO_ID] = '';
    cambios[COL.SESION] = '';
    actualizarFila_(r.tabla, c._fila, cambios);
    upsertAgendado_(c, 'Cancelada');
    registrar_('Canceló', c.id, c.nombre, c.fechaReunion ? formatearFechaHora_(c.fechaReunion, offsetMinutos_(c.fechaReunion)) : '', 'Aplicante');
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}
