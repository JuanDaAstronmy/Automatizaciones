/* =================== Resúmenes de las 12:00 y 20:00 + avisos =================== */

/**
 * Arma el resumen (función pura, fácil de probar).
 * o = { contactos, desdeMs, ahoraMs, offMin, org, urlHoja, urlPanel, urlCalendario,
 *       textoSeguimiento, textoRecordatorio, horasSeguimiento, linkDe(id) }
 */
function construirResumen_(o) {
  const off = o.offMin;
  const ahora = new Date(o.ahoraMs);
  const hoy = partesLocales_(ahora, off);
  const finManana = fechaDesdeLocal_(hoy.y, hoy.m, hoy.d + 2, 0, off).getTime();
  const inicioManana = fechaDesdeLocal_(hoy.y, hoy.m, hoy.d + 1, 0, off).getTime();
  const cs = o.contactos;
  const vars = function (c) {
    return {
      nombre: c.nombre, primer_nombre: c.primerNombre, link: o.linkDe(c.id), remitente: '', organizacion: o.org,
      fecha_reunion: c.fechaReunion ? formatearDia_(c.fechaReunion, off) : '',
      hora_reunion: c.fechaReunion ? formatearHora_(c.fechaReunion, off) : '', meet: c.linkReunion,
    };
  };
  const porFecha = function (a, b) { return a.fechaReunion.getTime() - b.fechaReunion.getTime(); };

  const nuevos = cs.filter(function (c) {
    return c.estado === ESTADO.AGENDADO && c.agendadoEl && c.agendadoEl.getTime() > o.desdeMs && c.fechaReunion;
  }).sort(porFecha);
  const proximas = cs.filter(function (c) {
    return c.estado === ESTADO.AGENDADO && c.fechaReunion && c.fechaReunion.getTime() >= o.ahoraMs - 30 * MS_MIN && c.fechaReunion.getTime() < finManana;
  }).sort(porFecha);
  const limiteSeg = o.ahoraMs - (o.horasSeguimiento || 48) * 3600000;
  const seguimiento = cs.filter(function (c) {
    return c.estado === ESTADO.CONTACTADO && c.ultimoContacto && c.ultimoContacto.getTime() <= limiteSeg && c.intentos < 3;
  }).sort(function (a, b) { return a.ultimoContacto.getTime() - b.ultimoContacto.getTime(); });

  const conteo = {};
  LISTA_ESTADOS.forEach(function (e) { conteo[e] = 0; });
  cs.forEach(function (c) { conteo[c.estado] = (conteo[c.estado] || 0) + 1; });
  const contactados = cs.filter(function (c) { return c.estado !== ESTADO.PENDIENTE && c.estado !== ESTADO.INVALIDO; }).length;
  const agendadosTotal = conteo[ESTADO.AGENDADO] + conteo[ESTADO.ASISTIO] + conteo[ESTADO.NO_ASISTIO];
  const conversion = contactados ? Math.round((agendadosTotal / contactados) * 100) : 0;

  const momento = hoy.h < 16 ? 'del mediodía' : 'de la noche';
  const desdeTxt = formatearDiaCorto_(new Date(o.desdeMs), off) + ', ' + formatearHora_(new Date(o.desdeMs), off);
  const asunto = o.org + ' · Resumen ' + momento + ': ' +
    (nuevos.length ? nuevos.length + (nuevos.length === 1 ? ' nuevo agendado' : ' nuevos agendados') : 'sin agendados nuevos');

  const e = escaparHtml_;
  const fechaCorta = function (c) { return formatearDiaCorto_(c.fechaReunion, off) + ' · ' + formatearHora_(c.fechaReunion, off); };
  const boton = function (href, txt, color) {
    return '<a href="' + e(href) + '" style="display:inline-block;padding:4px 10px;border-radius:6px;background:' + (color || '#037ef3') + ';color:#fff;text-decoration:none;font-size:12px;margin:2px 4px 2px 0">' + e(txt) + '</a>';
  };
  const fila = function (celdas) { return '<tr>' + celdas.map(function (x) { return '<td style="padding:8px 10px;border-bottom:1px solid #eef0f3;vertical-align:top">' + x + '</td>'; }).join('') + '</tr>'; };
  const tabla = function (filas) { return '<table style="border-collapse:collapse;width:100%;font-size:14px">' + filas.join('') + '</table>'; };
  const titulo = function (t) { return '<h3 style="margin:24px 0 8px;font-size:16px;color:#111827">' + t + '</h3>'; };

  let html = '<div style="font-family:Arial,Helvetica,sans-serif;color:#1f2937;max-width:640px">';
  html += '<div style="background:#037ef3;color:#fff;padding:16px 20px;border-radius:10px">' +
    '<div style="font-size:13px;opacity:.9">' + e(o.org) + ' · ' + e(formatearDia_(ahora, off)) + '</div>' +
    '<div style="font-size:20px;font-weight:bold;margin-top:4px">Resumen ' + momento + '</div></div>';

  html += titulo('🗓️ Nuevos agendados desde ' + e(desdeTxt) + ': ' + nuevos.length);
  html += nuevos.length ? tabla(nuevos.map(function (c) {
    return fila([
      '<b>' + e(c.nombre) + '</b><br><span style="color:#6b7280">' + e(formatearTelefono_(c.telefono)) + (c.correo ? ' · ' + e(c.correo) : '') + '</span>',
      e(fechaCorta(c)) + (c.responsable ? '<br><span style="color:#6b7280">Contactó: ' + e(c.responsable) + '</span>' : ''),
      c.linkReunion ? boton(c.linkReunion, 'Meet') : '',
    ]);
  })) : '<p style="color:#6b7280;margin:0">Nadie agendó en este periodo.</p>';

  html += titulo('⏰ Reuniones de hoy y mañana: ' + proximas.length);
  html += proximas.length ? tabla(proximas.map(function (c) {
    const esManana = c.fechaReunion.getTime() >= inicioManana;
    const recordatorio = o.textoRecordatorio && c.telefono ? boton(linkWhatsApp_(c.telefono, renderPlantilla_(o.textoRecordatorio, vars(c))), 'Enviar recordatorio', '#25d366') : '';
    return fila([
      '<b>' + e(fechaCorta(c)) + '</b>' + (esManana ? '' : ' <span style="color:#037ef3">(hoy)</span>'),
      e(c.nombre) + '<br><span style="color:#6b7280">' + e(formatearTelefono_(c.telefono)) + '</span>',
      (c.linkReunion ? boton(c.linkReunion, 'Meet') : '') + recordatorio,
    ]);
  })) : '<p style="color:#6b7280;margin:0">No hay reuniones programadas para hoy ni mañana.</p>';

  html += titulo('📊 Cómo vamos');
  html += '<p style="margin:0;line-height:1.8">' +
    '<b>' + cs.length + '</b> leads · ' +
    '<b>' + conteo[ESTADO.PENDIENTE] + '</b> por contactar · ' +
    '<b>' + conteo[ESTADO.CONTACTADO] + '</b> contactados sin respuesta · ' +
    '<b>' + conteo[ESTADO.RESPONDIO] + '</b> respondieron · ' +
    '<b>' + conteo[ESTADO.AGENDADO] + '</b> agendados · ' +
    '<b>' + conteo[ESTADO.ASISTIO] + '</b> asistieron · ' +
    '<b>' + conteo[ESTADO.NO_INTERESADO] + '</b> no interesados · ' +
    '<b>' + conteo[ESTADO.INVALIDO] + '</b> números por revisar<br>' +
    'Conversión (agendados / contactados): <b>' + conversion + '%</b></p>';

  if (seguimiento.length) {
    html += titulo('🔁 Sugeridos para seguimiento: ' + seguimiento.length);
    html += tabla(seguimiento.slice(0, 10).map(function (c) {
      const seg = o.textoSeguimiento && c.telefono ? boton(linkWhatsApp_(c.telefono, renderPlantilla_(o.textoSeguimiento, vars(c))), 'Enviar seguimiento', '#25d366') : '';
      return fila([
        '<b>' + e(c.nombre) + '</b><br><span style="color:#6b7280">' + e(formatearTelefono_(c.telefono)) + '</span>',
        'Último mensaje ' + e(haceCuanto_(c.ultimoContacto.getTime(), o.ahoraMs)) + (c.responsable ? '<br><span style="color:#6b7280">' + e(c.responsable) + '</span>' : ''),
        seg,
      ]);
    }));
    if (seguimiento.length > 10) html += '<p style="color:#6b7280">…y ' + (seguimiento.length - 10) + ' más en el panel.</p>';
  }

  html += '<p style="margin-top:28px">' +
    (o.urlPanel ? boton(o.urlPanel, 'Abrir panel') : '') +
    (o.urlHoja ? boton(o.urlHoja, 'Abrir hoja', '#374151') : '') +
    (o.urlCalendario ? boton(o.urlCalendario, 'Ver calendario', '#374151') : '') + '</p>';
  html += '<p style="color:#9ca3af;font-size:12px">Mensaje automático de AIESEC · Contacto de leads.</p></div>';

  // Versión corta (Telegram / texto plano)
  const t = [];
  t.push('<b>' + e(o.org) + ' · Resumen ' + momento + '</b>');
  t.push('');
  t.push('🗓️ <b>Nuevos agendados: ' + nuevos.length + '</b>');
  nuevos.slice(0, 15).forEach(function (c) { t.push('• ' + e(c.nombre) + ' — ' + e(fechaCorta(c)) + (c.linkReunion ? ' · <a href="' + e(c.linkReunion) + '">Meet</a>' : '')); });
  t.push('');
  t.push('⏰ <b>Hoy y mañana: ' + proximas.length + '</b>');
  proximas.slice(0, 15).forEach(function (c) { t.push('• ' + e(fechaCorta(c)) + ' — ' + e(c.nombre)); });
  t.push('');
  t.push('📊 ' + cs.length + ' leads · ' + conteo[ESTADO.PENDIENTE] + ' por contactar · ' + conteo[ESTADO.CONTACTADO] + ' sin respuesta · ' + conteo[ESTADO.AGENDADO] + ' agendados · ' + conversion + '% conversión');
  if (seguimiento.length) t.push('🔁 ' + seguimiento.length + ' para seguimiento');
  if (o.urlPanel) t.push('\n<a href="' + e(o.urlPanel) + '">Abrir panel</a>');
  const texto = t.join('\n');

  return { asunto: asunto, html: html, texto: texto, nuevos: nuevos.length, proximas: proximas.length, seguimiento: seguimiento.length };
}

function urlPanel_() {
  const url = urlWeb_();
  const clave = props_().getProperty('CLAVE_PANEL');
  return url && clave ? url + '?vista=panel&clave=' + clave : '';
}

function urlCalendario_() {
  const id = props_().getProperty('ID_CALENDARIO');
  return id ? 'https://calendar.google.com/calendar/u/0/r?cid=' + encodeURIComponent(id) : '';
}

/** Envía el resumen por correo (y Telegram si está conectado). */
function enviarResumen_() {
  const cfg = getConfig_();
  const p = props_();
  const ahora = new Date();
  const desde = Number(p.getProperty('ULTIMO_RESUMEN')) || ahora.getTime() - 12 * 3600000;
  const r = construirResumen_({
    contactos: leerContactos_(),
    desdeMs: desde,
    ahoraMs: ahora.getTime(),
    offMin: offsetMinutos_(ahora),
    org: cfg.ORG,
    urlHoja: libro_().getUrl(),
    urlPanel: urlPanel_(),
    urlCalendario: urlCalendario_(),
    textoSeguimiento: mensaje_(MSG.SEGUIMIENTO),
    textoRecordatorio: mensaje_(MSG.RECORDATORIO),
    horasSeguimiento: cfg.HORAS_SEGUIMIENTO,
    linkDe: linkAgenda_,
  });
  const correos = listaCorreos_(cfg.CORREOS_REPORTE);
  if (correos.length) {
    MailApp.sendEmail({ to: correos.join(','), subject: r.asunto, htmlBody: r.html, body: r.texto.replace(/<[^>]+>/g, ''), name: cfg.ORG + ' · Agenda' });
  }
  enviarTelegram_(r.texto);
  p.setProperty('ULTIMO_RESUMEN', String(ahora.getTime()));
  return r;
}

/** Aviso apenas alguien agenda (si "Avisar al instante" = SI). */
function avisoInmediato_(c, reprogramada) {
  const cfg = getConfig_();
  const off = offsetMinutos_(c.fechaReunion);
  const txt = (reprogramada ? '🔄 <b>Reprogramó</b>: ' : '✅ <b>Nuevo agendado</b>: ') + escaparHtml_(c.nombre) +
    '\n🗓️ ' + escaparHtml_(formatearFechaHora_(c.fechaReunion, off)) +
    '\n📱 ' + escaparHtml_(formatearTelefono_(c.telefono)) +
    (c.linkReunion ? '\n🎥 ' + escaparHtml_(c.linkReunion) : '');
  if (enviarTelegram_(txt)) return;
  const correos = listaCorreos_(cfg.CORREOS_REPORTE);
  if (correos.length) {
    MailApp.sendEmail({ to: correos.join(','), subject: cfg.ORG + ' · ' + (reprogramada ? 'Reprogramó: ' : 'Nuevo agendado: ') + c.nombre, htmlBody: txt.replace(/\n/g, '<br>'), name: cfg.ORG + ' · Agenda' });
  }
}

/* ------------------------------ Telegram (opcional) ------------------------------ */

function enviarTelegram_(textoHtml) {
  const p = props_();
  const token = p.getProperty('TELEGRAM_TOKEN');
  const chat = p.getProperty('TELEGRAM_CHAT_ID');
  if (!token || !chat) return false;
  let texto = String(textoHtml);
  if (texto.length > 3900) texto = texto.slice(0, 3900).replace(/<[^>]*$/, '') + '\n…';
  const r = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    payload: JSON.stringify({ chat_id: chat, text: texto, parse_mode: 'HTML', disable_web_page_preview: true }),
  });
  if (r.getResponseCode() !== 200) {
    console.warn('Telegram respondió ' + r.getResponseCode() + ': ' + r.getContentText());
    return false;
  }
  return true;
}

/** Busca el chat al que le escribieron al bot (para no tener que buscar el chat_id a mano). */
function detectarChatTelegram_(token) {
  const r = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/getUpdates', { muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) throw new Error('El token de Telegram no es válido (' + r.getResponseCode() + ').');
  const res = JSON.parse(r.getContentText()).result || [];
  for (let i = res.length - 1; i >= 0; i--) {
    const m = res[i].message || res[i].channel_post || res[i].my_chat_member;
    if (m && m.chat) return { id: String(m.chat.id), nombre: m.chat.title || m.chat.first_name || '' };
  }
  return null;
}
