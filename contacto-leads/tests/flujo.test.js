const test = require('node:test');
const assert = require('node:assert/strict');
const { crearEntorno } = require('./entorno');

const URL = 'https://script.google.com/macros/s/AKfyTEST/exec';

/** Entorno configurado, con URL publicada y 4 leads importados (uno repetido y uno inválido). */
function preparado(opciones = {}) {
  const env = crearEntorno(Object.assign({ ui: true }, opciones));
  env.llamar('menuConfigurar');
  env.config('URL de la app web', URL);
  env.config('Nombres del equipo', 'David, Ana');
  env.config('Correos invitados a cada reunión', 'entrevistas@example.com');
  if (!opciones.sesiones) env.config('Duración de la reunión (minutos)', '30');
  if (!opciones.sesiones) env.hoja('Sesiones').data.forEach((f, i) => { if (i > 0) f[6] = 'NO'; }); // modo horario semanal
  const imp = env.hoja('Importar');
  imp.data = [
    ['full_name', 'phone_number', 'email', 'campaign_name', 'city', 'ad_id'],
    ['MARIA PEREZ', 'p:+573001112233', 'MARIA@EXAMPLE.COM', 'Ads Nov', 'Medellín', '123'],
    ['juan gómez', '3104445566', '', 'Ads Nov', 'Bogotá', '124'],
    ['Repetida', '+57 300 111 2233', '', 'Ads Nov', '', '125'],
    ['Fijo Raro', '6041234567', 'fijo@example.com', 'Ads Nov', '', '126'],
  ];
  const res = env.llamar('importarPestanaImportar_');
  return { env, res };
}

const contactos = (env) => env.hoja('Contactos').objetos();
const porNombre = (env, n) => contactos(env).find((c) => c.Nombre === n);

test('Configurar crea pestañas, calendario aparte, clave del panel y disparadores 12:00/20:00', () => {
  const env = crearEntorno({ ui: true });
  env.llamar('menuConfigurar');
  const nombres = env.libro.hojas.map((h) => h.nombre);
  for (const n of ['Inicio', 'Contactos', 'Agendados', 'Importar', 'Mensajes', 'Config', 'Registro']) assert.ok(nombres.includes(n), n);
  assert.ok(env.props.get('ID_CALENDARIO').endsWith('@group.calendar.google.com'));
  assert.equal(Object.values(env.calendarios)[0].getName(), 'AIESEC · Entrevistas');
  assert.match(env.props.get('CLAVE_PANEL'), /^[0-9a-f]{16}$/);
  const t = env.triggers();
  assert.deepEqual(t.filter((x) => x.conf.fn === 'trigResumen').map((x) => x.conf.hora), [12, 20]);
  assert.equal(t.filter((x) => x.conf.fn === 'trigHorario').length, 1);
  assert.equal(t.find((x) => x.conf.fn === 'trigResumen').conf.tz, 'America/Bogota');
  // Correo del dueño como destinatario por defecto del resumen
  assert.ok(env.hoja('Config').data.some((f) => f[0] === 'Correos que reciben el resumen' && f[1] === 'dueno@example.com'));
  assert.ok(env.hoja('Mensajes').objetos().some((m) => m.Clave === 'PRIMER_CONTACTO'));
  // Volver a configurar no duplica nada
  env.llamar('menuConfigurar');
  assert.equal(env.triggers().length, 3);
  assert.equal(Object.keys(env.calendarios).length, 1);
  assert.equal(env.hoja('Config').objetos().filter((f) => f['Parámetro'] === 'Horario lunes').length, 1);
  // Otra persona del equipo no puede reconfigurar (crearía el calendario en su cuenta)
  env.props.set('DUENO', 'otra@example.com');
  env.llamar('menuConfigurar');
  assert.match(String(env.registro.alertas.at(-1)[0]), /Solo otra@example\.com/);
  assert.equal(env.triggers().length, 3);
});

test('Cambiar la clave del panel invalida el link anterior', () => {
  const env = crearEntorno({ ui: true });
  env.llamar('menuConfigurar');
  const vieja = env.props.get('CLAVE_PANEL');
  env.llamar('menuNuevaClave');
  assert.notEqual(env.props.get('CLAVE_PANEL'), vieja);
  assert.throws(() => env.llamar('panelDatos', vieja), /no autorizado/);
});

test('Importar: normaliza, no duplica, marca números raros y limpia la pestaña', () => {
  const { env, res } = preparado();
  assert.deepEqual({ ...res }, { nuevos: 3, duplicados: 1, invalidos: 1, vacios: 0 });
  const maria = porNombre(env, 'Maria Perez');
  assert.equal(maria['Teléfono'], '573001112233');
  assert.equal(maria.Correo, 'maria@example.com');
  assert.equal(maria.Estado, 'Pendiente');
  assert.equal(maria.Origen, 'Ads Nov');
  assert.equal(maria['Info del formulario'], 'city: Medellín');
  assert.equal(maria['Link para agendar'], URL + '?id=' + maria.ID);
  assert.equal(porNombre(env, 'Fijo Raro').Estado, 'Número inválido');
  assert.equal(env.hoja('Importar').getLastRow(), 1, 'deja solo los encabezados');
  // Importar otra vez lo mismo no agrega nada
  env.hoja('Importar').data.push(['Maria Perez', '3001112233', '', '', '', '']);
  assert.equal(env.llamar('importarPestanaImportar_').duplicados, 1);
  assert.equal(contactos(env).length, 3);
});

test('Importa sola desde una hoja externa (Google Form / Zapier) en el disparador horario', () => {
  const { env } = preparado();
  env.nuevaFuente('https://docs.google.com/spreadsheets/d/FORM/edit', [
    ['Marca temporal', 'Nombre completo', 'Número de celular (WhatsApp)', 'Correo electrónico'],
    ['2026-11-19', 'Laura Ríos', '315 222 3344', 'laura@example.com'],
  ]);
  env.config('Hoja externa de leads (opcional)', 'https://docs.google.com/spreadsheets/d/FORM/edit');
  env.llamar('trigHorario', { triggerUid: env.triggerUid('trigHorario') });
  assert.equal(porNombre(env, 'Laura Ríos')['Teléfono'], '573152223344');
});

test('Agendar: muestra horarios, crea el evento con Meet en el calendario de AIESEC y llena las pestañas', () => {
  const { env } = preparado();
  const maria = porNombre(env, 'Maria Perez');
  const d = env.llamar('agendaDatos', maria.ID);
  assert.equal(d.contacto.primerNombre, 'Maria');
  assert.equal(d.contacto.correo, 'maria@example.com');
  assert.equal(d.dias[0].fecha, '2026-11-20');
  assert.equal(d.dias[0].horarios[0].inicio, '2026-11-20T14:00:00-05:00', 'hoy a las 10 a. m. + 3 h de anticipación → 2\u00a0p.\u00a0m.');
  // Sábado solo en la mañana; domingo sin horario
  const sabado = d.dias.find((x) => x.fecha === '2026-11-21');
  assert.equal(sabado.horarios.at(-1).etiqueta, '11:30\u00a0a.\u00a0m.');
  assert.ok(!d.dias.some((x) => x.fecha === '2026-11-22'));

  const r = env.llamar('agendaReservar', maria.ID, '2026-11-23T09:00:00-05:00', { nombre: 'Maria Perez', correo: '' });
  assert.equal(r.ok, true);
  assert.equal(r.dia, 'lunes 23 de noviembre');
  assert.equal(r.hora, '9:00\u00a0a.\u00a0m.');
  assert.match(r.meet, /^https:\/\/meet\.google\.com\//);

  const ev = [...env.eventos.values()][0];
  assert.equal(ev._cal, env.props.get('ID_CALENDARIO'), 'el evento va al calendario de AIESEC, no al personal');
  assert.equal(ev.summary, 'Sesión informativa AIESEC · Maria Perez');
  assert.deepEqual(ev.attendees.map((a) => a.email), ['maria@example.com', 'entrevistas@example.com']);
  assert.equal(ev.extendedProperties.private.contactoId, maria.ID);
  assert.equal(env.registro.sendUpdates[0], 'all');

  const c = porNombre(env, 'Maria Perez');
  assert.equal(c.Estado, 'Agendado');
  assert.equal(c['Link reunión'], r.meet);
  assert.equal(new Date(c['Fecha reunión']).toISOString(), '2026-11-23T14:00:00.000Z');
  const ag = env.hoja('Agendados').objetos();
  assert.equal(ag.length, 1);
  assert.equal(ag[0].Nombre, 'Maria Perez');
  assert.equal(ag[0]['Estado reunión'], 'Programada');
  assert.ok(env.hoja('Registro').objetos().some((x) => x['Acción'] === 'Agendó'));

  // Ese horario ya no aparece y nadie más puede tomarlo
  const d2 = env.llamar('agendaDatos', '');
  const lunes = d2.dias.find((x) => x.fecha === '2026-11-23');
  assert.equal(lunes.horarios[0].etiqueta, '9:30\u00a0a.\u00a0m.');
  const juan = porNombre(env, 'Juan Gómez');
  const choque = env.llamar('agendaReservar', juan.ID, '2026-11-23T09:00:00-05:00', { nombre: 'Juan' });
  assert.equal(choque.ok, false);
  assert.equal(choque.ocupado, true);
  // Reabrir su link muestra la reserva existente
  assert.equal(env.llamar('agendaDatos', maria.ID).contacto.reserva.hora, '9:00\u00a0a.\u00a0m.');
});

test('Reprogramar borra el evento anterior; cancelar libera el horario', () => {
  const { env } = preparado();
  const id = porNombre(env, 'Maria Perez').ID;
  env.llamar('agendaReservar', id, '2026-11-23T09:00:00-05:00', { nombre: 'Maria' });
  const r = env.llamar('agendaReservar', id, '2026-11-24T10:00:00-05:00', { nombre: 'Maria' });
  assert.equal(r.reprogramada, true);
  assert.deepEqual(env.registro.eventosBorrados, ['ev1']);
  assert.equal(env.eventos.size, 1);
  const ag = env.hoja('Agendados').objetos();
  assert.equal(ag.length, 1);
  assert.equal(ag[0]['Estado reunión'], 'Reprogramada');

  env.llamar('agendaCancelar', id);
  assert.equal(env.eventos.size, 0);
  const c = porNombre(env, 'Maria Perez');
  assert.equal(c.Estado, 'Respondió');
  assert.equal(c['Link reunión'], '');
  assert.equal(env.hoja('Agendados').objetos()[0]['Estado reunión'], 'Cancelada');
  assert.ok(env.llamar('agendaDatos', '').dias.find((x) => x.fecha === '2026-11-24').horarios.some((h) => h.etiqueta === '10:00\u00a0a.\u00a0m.'));
});

test('Si su reunión anterior ya pasó (ej. no asistió), agendar de nuevo no borra el historial', () => {
  const { env } = preparado();
  const id = porNombre(env, 'Maria Perez').ID;
  env.llamar('agendaReservar', id, '2026-11-23T09:00:00-05:00', { nombre: 'Maria' });
  // Simula que esa reunión ya ocurrió
  const pasado = new Date('2026-11-18T09:00:00-05:00');
  const c = env.hoja('Contactos'); c.data[1][c.data[0].indexOf('Fecha reunión')] = pasado;
  const a = env.hoja('Agendados'); a.data[1][a.data[0].indexOf('Reunión')] = pasado;
  const r = env.llamar('agendaReservar', id, '2026-11-24T09:00:00-05:00', { nombre: 'Maria' });
  assert.equal(r.reprogramada, false);
  assert.deepEqual(env.registro.eventosBorrados, []);
  assert.equal(env.hoja('Agendados').objetos().length, 2);
});

test('Link general: pide WhatsApp, crea el contacto y lo agenda; links falsos no sirven', () => {
  const { env } = preparado();
  assert.throws(() => env.llamar('agendaReservar', '', '2026-11-23T11:00:00-05:00', { nombre: 'Pedro', telefono: '123' }), /WhatsApp/);
  const r = env.llamar('agendaReservar', '', '2026-11-23T11:00:00-05:00', { nombre: 'pedro lópez', telefono: '320 999 8877', correo: 'pedro@example.com' });
  assert.equal(r.ok, true);
  const p = porNombre(env, 'Pedro López');
  assert.equal(p.Origen, 'Link general');
  assert.equal(p.Estado, 'Agendado');
  assert.ok(env.llamar('agendaDatos', 'noexiste123').error);
  // Un horario inventado (fuera de la disponibilidad) se rechaza
  assert.equal(env.llamar('agendaReservar', p.ID, '2026-11-23T03:00:00-05:00', {}).ok, false);
});

test('Respeta eventos de bloqueo en el calendario y, si se pide, el calendario personal', () => {
  const { env } = preparado({
    ocupadoPrincipal: [{ start: '2026-11-23T14:00:00-05:00', end: '2026-11-23T16:00:00-05:00' }],
  });
  const calId = env.props.get('ID_CALENDARIO');
  env.eventos.set('bloqueo', { _cal: calId, id: 'bloqueo', summary: 'Asamblea', start: { dateTime: '2026-11-23T09:00:00-05:00' }, end: { dateTime: '2026-11-23T12:00:00-05:00' } });
  let lunes = env.llamar('agendaDatos', '').dias.find((x) => x.fecha === '2026-11-23');
  assert.equal(lunes.horarios[0].etiqueta, '2:00\u00a0p.\u00a0m.');
  env.config('Evitar choques con mi calendario personal', 'SI');
  lunes = env.llamar('agendaDatos', '').dias.find((x) => x.fecha === '2026-11-23');
  assert.equal(lunes.horarios[0].etiqueta, '4:00\u00a0p.\u00a0m.');
});

test('Panel: exige la clave y registra envíos, estados, notas y quién contactó', () => {
  const { env } = preparado();
  const clave = env.props.get('CLAVE_PANEL');
  assert.throws(() => env.llamar('panelDatos', 'mala'), /no autorizado/);
  const d = env.llamar('panelDatos', clave);
  assert.equal(d.contactos.length, 3);
  assert.deepEqual(Array.from(d.equipo), ['David', 'Ana']);
  const maria = d.contactos.find((c) => c.nombre === 'Maria Perez');
  assert.equal(maria.link, URL + '?id=' + maria.id);
  assert.equal(maria.telefonoTexto, '+57 300 111 2233');
  assert.equal(maria.valido, true);
  assert.equal(d.contactos.find((c) => c.nombre === 'Fijo Raro').valido, false);

  const r = env.llamar('panelReclamar', clave, maria.id, 'Ana');
  assert.equal(r.ok, true);
  assert.equal(env.llamar('panelReclamar', clave, maria.id, 'David').ok, false, 'otra persona no puede tomarlo');
  assert.equal(env.llamar('panelLiberar', clave, maria.id, 'David').responsable, 'Ana', 'solo quien lo apartó lo suelta');
  assert.equal(env.llamar('panelLiberar', clave, maria.id, 'Ana').responsable, '', 'si salta el contacto, queda libre');
  assert.equal(env.llamar('panelReclamar', clave, maria.id, 'Ana').ok, true);

  const tras = env.llamar('panelRegistrarEnvio', clave, maria.id, 'PRIMER_CONTACTO', 'Ana');
  assert.equal(tras.estado, 'Contactado');
  assert.equal(tras.intentos, 1);
  assert.equal(tras.responsable, 'Ana');
  assert.equal(env.llamar('panelRegistrarEnvio', clave, maria.id, 'RESP_COSTO', 'Ana').estado, 'Respondió');
  assert.equal(env.llamar('panelCambiarEstado', clave, maria.id, 'No interesado', 'Ana').estado, 'No interesado');
  assert.throws(() => env.llamar('panelCambiarEstado', clave, maria.id, 'Inventado', 'Ana'));
  assert.equal(env.llamar('panelGuardarNota', clave, maria.id, 'Prefiere la tarde', 'Ana').notas, 'Prefiere la tarde');

  const nuevo = env.llamar('panelNuevoContacto', clave, { nombre: 'Sofía', telefono: '3011234567' }, 'Ana');
  assert.equal(nuevo.telefono, '573011234567');
  assert.throws(() => env.llamar('panelNuevoContacto', clave, { nombre: 'Otra', telefono: '301 123 4567' }, 'Ana'), /ya está/);
});

test('Seguridad: las funciones de menú y disparadores no se pueden usar desde la app web', () => {
  const { env } = preparado();
  const web = crearEntorno(); // sin interfaz de hoja = contexto de la app web
  assert.throws(() => web.llamar('menuConfigurar'), /getUi/);
  // Disparador falso: no envía nada
  env.llamar('trigResumen', { triggerUid: 'inventado' });
  env.llamar('trigResumen', undefined);
  assert.equal(env.registro.correos.length, 0);
  // Disparador real: sí
  env.llamar('trigResumen', { triggerUid: env.triggerUid('trigResumen') });
  assert.equal(env.registro.correos.length, 1);
});

test('Resumen: lista nuevos agendados, reuniones de hoy/mañana y botones de recordatorio', () => {
  const { env } = preparado();
  const id = porNombre(env, 'Maria Perez').ID;
  env.llamar('agendaReservar', id, '2026-11-21T09:00:00-05:00', { nombre: 'Maria', correo: 'maria@example.com' });
  const r = env.llamar('enviarResumen_');
  assert.equal(r.nuevos, 1);
  assert.equal(r.proximas, 1);
  const correo = env.registro.correos.at(-1);
  assert.equal(correo.to, 'dueno@example.com');
  assert.equal(correo.subject, 'AIESEC · Resumen del mediodía: 1 nuevo agendado');
  assert.match(correo.htmlBody, /Maria Perez/);
  assert.match(correo.htmlBody, /meet\.google\.com/);
  assert.match(correo.htmlBody, /wa\.me\/573001112233\?text=/, 'botón de recordatorio por WhatsApp');
  // El siguiente resumen solo cuenta lo nuevo desde el anterior
  assert.equal(env.llamar('enviarResumen_').nuevos, 0);
});

test('Resumen por Telegram cuando está conectado', () => {
  const { env } = preparado({ props: {}, fetch: () => ({ code: 200, body: { ok: true } }) });
  env.props.set('TELEGRAM_TOKEN', '123:abc');
  env.props.set('TELEGRAM_CHAT_ID', '-100');
  env.llamar('enviarResumen_');
  const tg = env.registro.fetch.find((f) => f.url.includes('api.telegram.org'));
  assert.equal(tg.payload.chat_id, '-100');
  assert.match(tg.payload.text, /Resumen del mediodía/);
});

test('WhatsApp API: envía la plantilla solo a pendientes válidos, con nombre y link personal', () => {
  let n = 0;
  const { env } = preparado({ fetch: () => ({ code: 200, body: { messages: [{ id: 'wamid.' + (++n) }] } }) });
  env.props.set('WA_TOKEN', 'TOKEN');
  env.props.set('WA_PHONE_NUMBER_ID', '999');
  env.props.set('WA_PLANTILLA', 'invitacion_agendar');
  const r = env.llamar('envioMasivoAPI_', 250);
  assert.equal(r.enviados, 2);
  const envios = env.registro.fetch.filter((f) => f.url.includes('graph.facebook.com'));
  assert.equal(envios[0].url, 'https://graph.facebook.com/v23.0/999/messages');
  assert.equal(envios[0].o.headers.Authorization, 'Bearer TOKEN');
  const p = envios.find((f) => f.payload.to === '573001112233').payload;
  const maria = porNombre(env, 'Maria Perez');
  assert.equal(p.template.name, 'invitacion_agendar');
  assert.equal(p.template.components[0].parameters[0].text, 'Maria');
  assert.equal(p.template.components[1].parameters[0].text, maria.ID);
  assert.equal(maria.Estado, 'Contactado');
  assert.equal(maria.Responsable, 'WhatsApp API');
  assert.equal(env.llamar('envioMasivoAPI_', 250).enviados, 0, 'no repite');
});

test('WhatsApp API: se detiene ante un error de configuración', () => {
  const { env } = preparado({ fetch: () => ({ code: 401, body: { error: { code: 190, message: 'Token expirado' } } }) });
  env.props.set('WA_TOKEN', 'X');
  env.props.set('WA_PHONE_NUMBER_ID', '1');
  const r = env.llamar('envioMasivoAPI_', 250);
  assert.equal(r.enviados, 0);
  assert.equal(r.fallidos, 1);
  assert.match(r.detenido, /190/);
  assert.equal(porNombre(env, 'Maria Perez').Estado, 'Pendiente');
});

test('Marcar "Asistió" en Agendados actualiza el estado en Contactos', () => {
  const { env } = preparado();
  const id = porNombre(env, 'Maria Perez').ID;
  env.llamar('agendaReservar', id, '2026-11-23T09:00:00-05:00', { nombre: 'Maria' });
  const sh = env.libro.getSheetByName('Agendados');
  const enc = env.hoja('Agendados').data[0];
  const col = enc.indexOf('Resultado') + 1;
  sh.getRange(2, col).setValue('Asistió');
  env.llamar('onEdit', { range: sh.getRange(2, col), source: env.libro, value: 'Asistió' });
  assert.equal(porNombre(env, 'Maria Perez').Estado, 'Asistió');
});

test('Sesiones grupales: cada persona tiene su horario y todos entran al mismo Meet', () => {
  const { env } = preparado({ sesiones: true });
  const ses = env.hoja('Sesiones');
  ses.data[1][4] = 'ana@example.com'; // Ana, miércoles 3 p. m.
  ses.data[1][5] = 2;                  // 2 cupos para probar el límite
  const d = env.llamar('agendaDatos', '');
  // Viernes 20 nov (hoy, 10 a. m.) → viernes 7 p. m. con Aleja es la primera
  assert.equal(d.dias[0].fecha, '2026-11-20');
  assert.equal(d.dias[0].horarios[0].anfitrion, 'Aleja');
  assert.equal(d.dias[0].horarios[0].etiqueta, '7:00\u00a0p.\u00a0m.');
  const mie = d.dias.find((x) => x.fecha === '2026-11-25');
  assert.deepEqual(Array.from(mie.horarios, (h) => h.anfitrion), ['Ana', 'Leidy y Cristian']);
  assert.equal(mie.horarios[0].duracion, 60);

  const [maria, juan] = [porNombre(env, 'Maria Perez'), porNombre(env, 'Juan Gómez')];
  const r1 = env.llamar('agendaReservar', maria.ID, '2026-11-25T15:00:00-05:00', { nombre: 'Maria', correo: 'maria@example.com' });
  const r2 = env.llamar('agendaReservar', juan.ID, '2026-11-25T15:00:00-05:00', { nombre: 'Juan', correo: 'juan@example.com' });
  assert.equal(r1.anfitrion, 'Ana');
  assert.equal(r1.meet, r2.meet, 'mismo Meet para el grupo');
  assert.equal(env.eventos.size, 1);
  const ev = [...env.eventos.values()][0];
  assert.equal(ev.summary, 'Sesión informativa AIESEC · con Ana');
  assert.deepEqual(ev.attendees.map((a) => a.email).sort(), ['ana@example.com', 'entrevistas@example.com', 'juan@example.com', 'maria@example.com']);
  assert.equal(env.registro.correos.at(-1).to, 'juan@example.com', 'confirmación propia al que se une');
  assert.equal(porNombre(env, 'Juan Gómez')['Sesión con'], 'Ana');
  assert.equal(env.hoja('Agendados').objetos()[0]['Quién la da'], 'Ana');
  // 2 cupos llenos → la sesión de Ana desaparece
  const mie2 = env.llamar('agendaDatos', '').dias.find((x) => x.fecha === '2026-11-25');
  assert.deepEqual(Array.from(mie2.horarios, (h) => h.anfitrion), ['Leidy y Cristian']);

  // Juan cancela: Maria sigue en el evento; luego Maria se pasa a otra sesión y el evento vacío se borra
  env.llamar('agendaCancelar', juan.ID);
  assert.equal(env.eventos.size, 1);
  assert.ok(![...env.eventos.values()][0].attendees.some((a) => a.email === 'juan@example.com'));
  env.llamar('agendaReservar', maria.ID, '2026-11-25T18:00:00-05:00', { nombre: 'Maria' });
  assert.equal(env.eventos.size, 1);
  assert.equal([...env.eventos.values()][0].summary, 'Sesión informativa AIESEC · con Leidy y Cristian');
});
