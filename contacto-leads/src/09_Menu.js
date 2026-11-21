/* =================== Menú de la hoja, configuración y disparadores =================== */

const MANEJADORES = ['trigResumen', 'trigHorario'];

const MENSAJES_INICIALES = [
  [MSG.PRIMER, '1er mensaje',
    '¡Hola, {primer_nombre}! 👋 ¿Cómo vas?\nSoy {remitente} de AIESEC Colombia. Vi que te interesó vivir una experiencia en el exterior y quería contarte cómo funciona.\n\nCon Voluntario Global puedes viajar a otro país por 6 a 8 semanas, vivir una experiencia intercultural y aportar a un proyecto social conectado con los ODS de la ONU. 🌍\n\nEsta semana tenemos sesiones informativas grupales por Google Meet (puedes invitar a tu familia). Elige la que mejor te quede aquí:\n{link}\n\nY cuéntame: ¿qué es lo que más te llama la atención de irte al exterior? 😊',
    'Basado en el Mensaje 1 del discurso oGV de Black November. {link} es SU link personal para agendar.'],
  [MSG.SEGUIMIENTO, 'Seguimiento',
    '¡Hola de nuevo, {primer_nombre}! 😊 Te escribo por si no alcanzaste a ver mi mensaje. Los cupos para las próximas salidas son limitados y el beneficio de Black November tiene fecha límite. Todavía hay espacio en las sesiones informativas de esta semana:\n{link}',
    'Para quienes no respondieron después de 1-2 días.'],
  [MSG.RECORDATORIO, 'Recordatorio',
    '¡Hola, {primer_nombre}! Te recuerdo la sesión informativa de Voluntario Global el {fecha_reunion} a las {hora_reunion} (hora Colombia). 🙌 Si quieres, invita a tu familia.\n\nLink de Google Meet: {meet}\n\nSi necesitas cambiar el horario, puedes hacerlo aquí: {link}',
    'Para el día anterior a la reunión. Sale con un botón en el resumen de las 8 p. m.'],
  [MSG.PRIMER + '_GT', '1er mensaje (oGT)',
    '¡Hola, {primer_nombre}! 👋 ¿Cómo vas?\nSoy {remitente} de AIESEC Colombia. Vi que te interesó una experiencia profesional en el exterior y quería contarte cómo funciona Talento Global.\n\nCon Talento Global haces una práctica o experiencia profesional en una empresa o proyecto en otro país, en un área afín a tu carrera, ganas experiencia internacional y vives una cultura distinta. 🌍\n\nEsta semana tenemos sesiones informativas grupales por Google Meet (puede acompañarte tu familia). Elige la que mejor te quede aquí:\n{link}\n\nY cuéntame: ¿qué estudias o a qué te dedicas, y qué te gustaría lograr con una experiencia en el exterior? 😊',
    'Versión para leads de oGT (Talento Global). Se usa sola cuando el lead tiene "GT" en su programa.'],
  [MSG.SEGUIMIENTO + '_GT', 'Seguimiento (oGT)',
    '¡Hola de nuevo, {primer_nombre}! 😊 Te escribo por si no alcanzaste a ver mi mensaje sobre Talento Global. Una experiencia profesional internacional es un gran impulso para tu hoja de vida, y por Black November hay un beneficio con fecha límite. Todavía hay espacio en las sesiones de esta semana:\n{link}',
    'Seguimiento para leads de oGT.'],
  ['RESP_DESPUES_SEMESTRE', 'Más adelante',
    'Te entiendo, {primer_nombre}, y es válido querer tomarte tu tiempo. Las fechas de salida y los cupos por proyecto son limitados y el beneficio de Black November tiene fecha límite, pero no tienes que viajar ya: puedes asegurar tu proceso ahora y escoger una fecha de salida más adelante. Te cuento todo en la sesión: {link}',
    'Objeción "hablemos más adelante" (discurso oGV). Confirmen la política de cambio de fecha.'],
  ['RESP_PAGAR', '¿Por qué pagar?',
    'Es una duda muy válida. 😊 No pagas por "trabajar gratis": el valor cubre la gestión y el acompañamiento del programa, la preparación antes del viaje, el soporte en el destino y los costos del proyecto. Tú aportas tu tiempo y talento a una comunidad real. En la sesión te mostramos el detalle de lo que incluye: {link}',
    'Objeción "si es voluntariado, ¿por qué pago?" (discurso oGV). Confirmen qué incluye el valor.'],
  ['RESP_MIEDO', 'Miedo / seguridad',
    'Es normal sentir eso y habla bien de ti. No viajas solo/a: AIESEC te acompaña antes, durante y después, tienes contacto en el destino y vives con voluntarios de varios países. Si quieres, tu familia puede entrar a la sesión para resolver sus dudas: {link}',
    'Objeción de miedo o seguridad (discurso oGV).'],
  ['RESP_QUE_ES', '¿Qué es AIESEC?',
    'AIESEC es una organización juvenil presente en más de 120 países que conecta a jóvenes de 18 a 30 años con experiencias internacionales para desarrollar su liderazgo y generar impacto social. 🌎 En la sesión te contamos cómo funciona y qué opciones hay para ti: {link}',
    'EJEMPLO de respuesta rápida. Edítala o bórrala. Las claves que empiezan por RESP_ aparecen en "Respuestas" del panel.'],
  ['RESP_COSTO', '¿Tiene costo?',
    'Depende del programa y del destino que elijas. 😊 En la llamada te explicamos los costos, qué incluye cada opción y las facilidades que hay. ¿Agendamos? {link}',
    'EJEMPLO. Reemplázalo por la respuesta oficial de tu comité.'],
  ['RESP_REQUISITOS', 'Requisitos',
    'Los requisitos dependen del programa, pero en general buscamos personas con muchas ganas de vivir una experiencia internacional. En la llamada revisamos tu caso: {link}',
    'EJEMPLO. Reemplázalo por la respuesta oficial de tu comité.'],
  ['RESP_DESPUES', 'No puede ahora',
    '¡Claro que sí, {primer_nombre}! Sin afán. 🙌 Cuando tengas un espacio, eliges el horario aquí y listo: {link}',
    'EJEMPLO. Para cuando dicen "ahora no puedo".'],
];

/* ------------------------------ Menú ------------------------------ */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🌍 AIESEC')
    .addItem('⚙️ Configurar / reparar', 'menuConfigurar')
    .addItem('🔗 Ver links (panel y agendamiento)', 'menuLinks')
    .addSeparator()
    .addItem('📥 Importar leads de la pestaña "Importar"', 'menuImportar')
    .addItem('📨 Enviar el resumen ahora', 'menuResumen')
    .addItem('🔑 Cambiar la clave del panel', 'menuNuevaClave')
    .addSeparator()
    .addSubMenu(ui.createMenu('🔔 Avisos por Telegram (opcional)')
      .addItem('Conectar Telegram', 'menuTelegram')
      .addItem('Desconectar Telegram', 'menuQuitarTelegram'))
    .addSubMenu(ui.createMenu('🤖 WhatsApp API (opcional)')
      .addItem('1. Guardar credenciales', 'menuCredencialesAPI')
      .addItem('2. Enviarme un mensaje de prueba', 'menuProbarAPI')
      .addItem('3. Enviar invitación a todos los pendientes', 'menuEnviarAPI'))
    .addToUi();
}

/** Lanza un error si NO se ejecuta desde la hoja (bloquea llamadas desde la app web). */
function uiHoja_() {
  return SpreadsheetApp.getUi();
}

/** Solo el dueño (la cuenta que configuró la primera vez) puede reconfigurar: los disparadores y el calendario viven en su cuenta. */
/** Si la hoja es una COPIA (Archivo → Hacer una copia), olvida el dueño, calendario y clave de la hoja original. */
function esCopia_() {
  const id = props_().getProperty('ID_HOJA');
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return !!(id && ss && ss.getId() !== id);
}

function reiniciarCopia_() {
  const p = props_();
  ['DUENO', 'ID_HOJA', 'ID_CALENDARIO', 'CLAVE_PANEL', 'URL_WEB_AUTO', 'ULTIMO_RESUMEN', 'TELEGRAM_TOKEN', 'TELEGRAM_CHAT_ID'].forEach(function (k) { p.deleteProperty(k); });
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJAS.CONFIG);
  if (sh) {
    const vals = sh.getRange(1, 1, Math.max(sh.getLastRow(), 1), 1).getValues();
    vals.forEach(function (f, i) {
      const et = normalizarTexto_(f[0]);
      if (et === normalizarTexto_('URL de la app web')) sh.getRange(i + 1, 2).setValue('');
      if (et === normalizarTexto_('Correos que reciben el resumen')) sh.getRange(i + 1, 2).setValue(Session.getEffectiveUser().getEmail());
    });
  }
}

function esDueno_() {
  if (esCopia_()) return true;
  const dueno = props_().getProperty('DUENO');
  const yo = Session.getEffectiveUser().getEmail();
  return !dueno || !yo || dueno === yo;
}

function menuConfigurar() {
  const ui = uiHoja_();
  if (!esDueno_()) {
    ui.alert('Solo ' + props_().getProperty('DUENO') + ' puede usar "Configurar", porque el calendario y los avisos automáticos están en su cuenta. Tú puedes usar el resto del menú y el panel.');
    return;
  }
  const r = configurarTodo_();
  const faltaUrl = !urlWeb_();
  ui.alert('✅ Configuración lista',
    'Calendario: "' + r.calendario + '" (separado de tu calendario personal).\n' +
    'Resúmenes automáticos: ' + r.horas.join(' y ') + ' h todos los días.\n\n' +
    (faltaUrl
      ? 'SIGUIENTE PASO: publica la app web\n1) Arriba a la derecha en Apps Script: Implementar → Nueva implementación → Tipo: App web.\n2) Ejecutar como: Yo. Quién tiene acceso: Cualquier persona.\n3) Copia la URL (termina en /exec) y pégala en la pestaña Config → "URL de la app web".\n4) Luego usa AIESEC → Ver links.'
      : 'Usa AIESEC → Ver links para copiar el link del panel.'),
    ui.ButtonSet.OK);
}

function menuLinks() {
  const ui = uiHoja_();
  getConfig_.cache = null;
  if (!urlWeb_()) {
    ui.alert('Falta la URL de la app web', 'Publica la app web (Implementar → Nueva implementación → App web, acceso: Cualquier persona) y pega la URL /exec en la pestaña Config → "URL de la app web".', ui.ButtonSet.OK);
    return;
  }
  refrescarLinks_();
  escribirInicio_();
  const e = escaparHtml_;
  const enlace = function (t, u, d) {
    return '<p style="margin:0 0 14px"><b>' + e(t) + '</b><br><span style="color:#6b7280;font-size:12px">' + e(d) + '</span><br>' +
      '<a href="' + e(u) + '" target="_blank" style="word-break:break-all">' + e(u) + '</a></p>';
  };
  const html = '<div style="font-family:Arial,sans-serif;font-size:14px">' +
    enlace('Panel del equipo', urlPanel_(), 'Compártelo SOLO con el equipo: permite ver y contactar a los leads.') +
    enlace('Link general para agendar', urlWeb_(), 'Para redes o estados. Cada lead tiene además su link personal (columna "Link para agendar").') +
    enlace('Calendario de AIESEC', urlCalendario_(), 'Aparece como un calendario aparte en tu Google Calendar.') + '</div>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(330), '🔗 Links');
}

function menuImportar() {
  const ui = uiHoja_();
  const r = importarPestanaImportar_();
  ui.alert('📥 Importación',
    r.nuevos + ' leads nuevos\n' + r.duplicados + ' repetidos (no se duplicaron)\n' + r.invalidos + ' con número para revisar (quedaron como "Número inválido")' +
    (r.vacios ? '\n' + r.vacios + ' filas vacías ignoradas' : '') +
    (r.nuevos + r.duplicados + r.vacios === 0 ? '\n\nLa pestaña "Importar" estaba vacía: pega tus leads con los encabezados en la fila 1.' : ''),
    ui.ButtonSet.OK);
}

function menuResumen() {
  const ui = uiHoja_();
  const r = enviarResumen_();
  const correos = listaCorreos_(getConfig_().CORREOS_REPORTE);
  ui.alert('📨 Resumen enviado', (correos.length ? 'Correo a: ' + correos.join(', ') : 'No hay correos en Config → "Correos que reciben el resumen".') +
    (props_().getProperty('TELEGRAM_CHAT_ID') ? '\nTambién por Telegram.' : '') +
    '\n\nNuevos agendados: ' + r.nuevos + ' · Reuniones hoy/mañana: ' + r.proximas, ui.ButtonSet.OK);
}

function menuNuevaClave() {
  const ui = uiHoja_();
  if (ui.alert('🔑 Cambiar la clave del panel', 'El link actual del panel dejará de funcionar y tendrás que compartir el nuevo con el equipo. ¿Continuar?', ui.ButtonSet.YES_NO) !== ui.Button.YES) return;
  props_().setProperty('CLAVE_PANEL', Utilities.getUuid().replace(/-/g, '').slice(0, 16));
  escribirInicio_();
  ui.alert('Listo. El nuevo link está en la pestaña Inicio (y en AIESEC → Ver links).');
}

function menuTelegram() {
  const ui = uiHoja_();
  const r1 = ui.prompt('🔔 Conectar Telegram (1/2)',
    '1) En Telegram abre @BotFather, envía /newbot y sigue los pasos.\n2) Copia el token que te da (algo como 123456:ABC...) y pégalo aquí:', ui.ButtonSet.OK_CANCEL);
  if (r1.getSelectedButton() !== ui.Button.OK) return;
  const token = r1.getResponseText().trim();
  if (!/^\d+:[\w-]{20,}$/.test(token)) { ui.alert('Ese token no parece válido.'); return; }
  ui.alert('🔔 Conectar Telegram (2/2)', 'Ahora abre tu bot en Telegram y envíale "hola" (o agrégalo a un grupo del equipo y escribe algo en el grupo). Luego presiona Aceptar.', ui.ButtonSet.OK);
  const chat = detectarChatTelegram_(token);
  if (!chat) { ui.alert('No vi ningún mensaje para el bot. Escríbele "hola" y vuelve a intentarlo.'); return; }
  const p = props_();
  p.setProperty('TELEGRAM_TOKEN', token);
  p.setProperty('TELEGRAM_CHAT_ID', chat.id);
  enviarTelegram_('✅ Listo: aquí llegarán los resúmenes de ' + escaparHtml_(getConfig_().ORG) + '.');
  ui.alert('✅ Telegram conectado' + (chat.nombre ? ' (' + chat.nombre + ')' : '') + '. Te envié un mensaje de prueba.');
}

function menuQuitarTelegram() {
  const ui = uiHoja_();
  props_().deleteProperty('TELEGRAM_TOKEN');
  props_().deleteProperty('TELEGRAM_CHAT_ID');
  ui.alert('Telegram desconectado.');
}

function menuCredencialesAPI() {
  const ui = uiHoja_();
  const w = waConfig_();
  const pedir = function (titulo, ayuda, actual) {
    const r = ui.prompt(titulo, ayuda + (actual ? '\n\n(Deja vacío para conservar el valor actual)' : ''), ui.ButtonSet.OK_CANCEL);
    if (r.getSelectedButton() !== ui.Button.OK) throw new Error('cancelado');
    return r.getResponseText().trim() || actual;
  };
  try {
    const token = pedir('WhatsApp API (1/4)', 'Token de acceso permanente (usuario del sistema en Meta Business).', w.token);
    const phoneId = pedir('WhatsApp API (2/4)', 'Phone number ID (WhatsApp Manager → Configuración de la API).', w.phoneId);
    const plantilla = pedir('WhatsApp API (3/4)', 'Nombre exacto de la plantilla aprobada (ej. invitacion_agendar).', w.plantilla);
    const idioma = pedir('WhatsApp API (4/4)', 'Código de idioma de la plantilla (ej. es, es_CO, es_MX).', w.idioma);
    const p = props_();
    p.setProperty('WA_TOKEN', token);
    p.setProperty('WA_PHONE_NUMBER_ID', phoneId);
    p.setProperty('WA_PLANTILLA', plantilla);
    p.setProperty('WA_IDIOMA', idioma);
    ui.alert('✅ Credenciales guardadas (solo las ve quien edita el script, no quien ve la hoja).\nAhora usa "2. Enviarme un mensaje de prueba".');
  } catch (e) {
    if (String(e.message) !== 'cancelado') throw e;
  }
}

function menuProbarAPI() {
  const ui = uiHoja_();
  const cfg = getConfig_();
  const tel = normalizarTelefono_(cfg.TEL_PRUEBA, cfg.PAIS);
  if (!tel.valido) { ui.alert('Escribe tu número en Config → "Teléfono para pruebas de la API".'); return; }
  const w = waConfig_();
  if (!waListo_(w)) { ui.alert('Primero guarda las credenciales (paso 1).'); return; }
  const r = enviarWhatsAppAPI_(payloadPlantilla_({ telefono: tel.telefono, primerNombre: 'Prueba', id: 'prueba' }, w), w);
  ui.alert(r.ok ? '✅ Enviado. Revisa tu WhatsApp.' : '❌ Error ' + r.codigo + ': ' + r.mensaje);
}

function menuEnviarAPI() {
  const ui = uiHoja_();
  const w = waConfig_();
  if (!waListo_(w)) { ui.alert('Primero guarda las credenciales (paso 1) y prueba (paso 2).'); return; }
  const n = pendientesAPI_().length;
  if (!n) { ui.alert('No hay leads pendientes con número válido.'); return; }
  const costo = (Math.min(n, 250) * COSTO_APROX_USD_MARKETING_CO).toFixed(2);
  const ok = ui.alert('🤖 Enviar invitación por WhatsApp API',
    'Se enviará la plantilla "' + w.plantilla + '" a ' + Math.min(n, 250) + ' leads pendientes' + (n > 250 ? ' (de ' + n + '; el resto en el siguiente envío)' : '') + '.\n' +
    'Costo aproximado en Meta: USD ' + costo + '.\n\n¿Continuar?', ui.ButtonSet.YES_NO);
  if (ok !== ui.Button.YES) return;
  const r = envioMasivoAPI_(250);
  ui.alert('Resultado', '✅ Enviados: ' + r.enviados + '\n❌ Fallidos: ' + r.fallidos +
    (r.detenido ? '\n\n⚠️ ' + r.detenido : '') +
    (r.errores.length ? '\n\nPrimeros errores:\n' + r.errores.slice(0, 5).join('\n') : ''), ui.ButtonSet.OK);
}

/* ------------------------------ Disparadores ------------------------------ */

/** Solo acepta ejecuciones que vengan de un disparador real de este proyecto. */
function esTriggerPropio_(e) {
  if (!e || !e.triggerUid) return false;
  const uid = String(e.triggerUid);
  return ScriptApp.getProjectTriggers().some(function (t) { return t.getUniqueId() === uid; });
}

function trigResumen(e) {
  if (!esTriggerPropio_(e)) return;
  enviarResumen_();
}

function trigHorario(e) {
  if (!esTriggerPropio_(e)) return;
  const cfg = getConfig_();
  try { importarPestanaImportar_(); } catch (err) { console.warn('Importar: ' + err); }
  if (cfg.FUENTE_URL) {
    try { importarDesdeFuente_(); } catch (err) { console.warn('Fuente externa: ' + err); }
  }
  if (cfg.MODO_WA === 'API' && cfg.AUTO_API && waListo_(waConfig_())) {
    const r = envioMasivoAPI_(100);
    if (r.detenido) enviarTelegram_('⚠️ WhatsApp API: ' + escaparHtml_(r.detenido));
  }
}

function crearTriggers_() {
  const cfg = getConfig_();
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (MANEJADORES.indexOf(t.getHandlerFunction()) >= 0) ScriptApp.deleteTrigger(t);
  });
  const horas = [cfg.REPORTE_H1, cfg.REPORTE_H2]
    .map(function (h) { return Math.floor(Number(h)); })
    .filter(function (h, i, a) { return h >= 0 && h <= 23 && a.indexOf(h) === i; });
  horas.forEach(function (h) {
    ScriptApp.newTrigger('trigResumen').timeBased().atHour(h).nearMinute(0).everyDays(1).inTimezone(zona_()).create();
  });
  ScriptApp.newTrigger('trigHorario').timeBased().everyHours(1).create();
  return horas;
}

/** Al marcar "Resultado" en Agendados, actualiza el estado del lead en Contactos. */
function onEdit(e) {
  try {
    if (!e || !e.range || !e.source) return;
    const sh = e.range.getSheet();
    if (sh.getName() !== HOJAS.AGENDADOS || e.range.getRow() < 2 || e.range.getNumRows() !== 1) return;
    libro_.cache = e.source;
    const tabla = leerTabla_(sh);
    const col = tabla.idx[COLA.RESULTADO];
    if (col === undefined || e.range.getColumn() !== col + 1) return;
    const nuevo = { 'Asistió': ESTADO.ASISTIO, 'No asistió': ESTADO.NO_ASISTIO }[String(e.value || '')];
    const fila = tabla.filas[e.range.getRow() - 2];
    const id = fila ? String(fila[COLA.ID] || '').trim() : '';
    if (!nuevo || !id) return;
    const tc = leerTabla_(e.source.getSheetByName(HOJAS.CONTACTOS));
    const f = tc.filas.filter(function (x) { return String(x[COL.ID] || '').trim() === id; })[0];
    if (!f) return;
    const cambios = {};
    cambios[COL.ESTADO] = nuevo;
    actualizarFila_(tc, f._fila, cambios);
  } catch (err) {
    console.warn('onEdit: ' + err);
  }
}

/* ------------------------------ Configuración inicial ------------------------------ */

function colLetra_(n) {
  let s = '';
  while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
  return s;
}

/** Crea la pestaña si no existe y agrega los encabezados que falten (sin borrar nada). */
function prepararPestana_(nombre, columnas) {
  const ss = libro_();
  let sh = ss.getSheetByName(nombre);
  if (!sh) sh = ss.insertSheet(nombre);
  if (!columnas) return sh;
  const actuales = sh.getLastColumn() > 0 ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(function (v) { return String(v).trim(); }) : [];
  const vacias = actuales.every(function (v) { return !v; });
  if (vacias) {
    sh.getRange(1, 1, 1, columnas.length).setValues([columnas]);
  } else {
    const faltan = columnas.filter(function (c) { return actuales.indexOf(c) < 0; });
    if (faltan.length) {
      const desde = sh.getLastColumn() + 1;
      if (desde + faltan.length - 1 > sh.getMaxColumns()) sh.insertColumnsAfter(sh.getMaxColumns(), desde + faltan.length - 1 - sh.getMaxColumns());
      sh.getRange(1, desde, 1, faltan.length).setValues([faltan]);
    }
  }
  const lc = sh.getLastColumn();
  sh.getRange(1, 1, 1, lc).setFontWeight('bold').setBackground('#037ef3').setFontColor('#ffffff').setVerticalAlignment('middle');
  sh.setFrozenRows(1);
  return sh;
}

function formatoColumna_(sh, tabla, encabezado, fn) {
  const c = tabla.idx[encabezado];
  if (c === undefined) return;
  fn(sh.getRange(2, c + 1, Math.max(sh.getMaxRows() - 1, 1), 1), c + 1);
}

function formatearContactos_(sh) {
  const t = leerTabla_(sh);
  const fecha = 'dd/mm/yyyy h:mm am/pm';
  formatoColumna_(sh, t, COL.TELEFONO, function (r) { r.setNumberFormat('@'); });
  [COL.ULTIMO_CONTACTO, COL.FECHA_REUNION, COL.AGENDADO_EL, COL.CREADO].forEach(function (h) {
    formatoColumna_(sh, t, h, function (r) { r.setNumberFormat(fecha); });
  });
  formatoColumna_(sh, t, COL.ESTADO, function (r) {
    r.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(LISTA_ESTADOS, true).setAllowInvalid(false).build());
  });
  const colEstado = t.idx[COL.ESTADO];
  if (colEstado !== undefined) {
    const rango = sh.getRange(2, 1, Math.max(sh.getMaxRows() - 1, 1), sh.getLastColumn());
    const letra = colLetra_(colEstado + 1);
    const reglas = sh.getConditionalFormatRules().filter(function (r) {
      const c = r.getBooleanCondition && r.getBooleanCondition();
      return !(c && String(c.getCriteriaValues()[0] || '').indexOf('=$' + letra + '2="') === 0);
    });
    Object.keys(COLOR_ESTADO).forEach(function (estado) {
      reglas.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + letra + '2="' + estado + '"')
        .setBackground(COLOR_ESTADO[estado]).setRanges([rango]).build());
    });
    sh.setConditionalFormatRules(reglas);
  }
  const anchos = {};
  anchos[COL.ID] = 100; anchos[COL.NOMBRE] = 190; anchos[COL.TELEFONO] = 120; anchos[COL.CORREO] = 200;
  anchos[COL.NOTAS] = 240; anchos[COL.LINK_AGENDA] = 220; anchos[COL.INFO_EXTRA] = 320; anchos[COL.LINK_REUNION] = 200;
  Object.keys(anchos).forEach(function (h) { if (t.idx[h] !== undefined) sh.setColumnWidth(t.idx[h] + 1, anchos[h]); });
  if (t.idx[COL.EVENTO_ID] !== undefined) sh.hideColumns(t.idx[COL.EVENTO_ID] + 1);
}

function formatearAgendados_(sh) {
  const t = leerTabla_(sh);
  formatoColumna_(sh, t, COLA.REUNION, function (r) { r.setNumberFormat('ddd dd/mm/yyyy h:mm am/pm'); });
  formatoColumna_(sh, t, COLA.AGENDADO_EL, function (r) { r.setNumberFormat('dd/mm/yyyy h:mm am/pm'); });
  formatoColumna_(sh, t, COLA.TELEFONO, function (r) { r.setNumberFormat('@'); });
  formatoColumna_(sh, t, COLA.RESULTADO, function (r) {
    r.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(RESULTADOS, true).setAllowInvalid(true).build());
  });
  const anchos = {};
  anchos[COLA.REUNION] = 190; anchos[COLA.NOMBRE] = 190; anchos[COLA.CORREO] = 200; anchos[COLA.LINK] = 230; anchos[COLA.NOTAS] = 320;
  Object.keys(anchos).forEach(function (h) { if (t.idx[h] !== undefined) sh.setColumnWidth(t.idx[h] + 1, anchos[h]); });
}

function sembrarConfig_(sh) {
  const tabla = leerTabla_(sh);
  const existentes = {};
  tabla.filas.forEach(function (f) { existentes[normalizarTexto_(f['Parámetro'])] = true; });
  const correoDueno = Session.getEffectiveUser().getEmail();
  const nuevas = DEF_CONFIG.filter(function (d) { return !existentes[normalizarTexto_(d.etiqueta)]; }).map(function (d) {
    const o = { 'Parámetro': d.etiqueta, 'Valor': d.k === 'CORREOS_REPORTE' ? correoDueno : String(d.def), 'Ayuda': d.ayuda };
    return o;
  });
  sh.getRange(1, 2, sh.getMaxRows(), 1).setNumberFormat('@');
  agregarFilas_(tabla, nuevas);
  sh.setColumnWidth(1, 300); sh.setColumnWidth(2, 340); sh.setColumnWidth(3, 520);
  sh.getRange(2, 3, Math.max(sh.getMaxRows() - 1, 1), 1).setFontColor('#6b7280').setWrap(true);
  getConfig_.cache = null;
}

function sembrarMensajes_(sh) {
  const tabla = leerTabla_(sh);
  const claves = tabla.filas.map(function (f) { return String(f['Clave'] || '').trim().toUpperCase(); });
  const nuevas = MENSAJES_INICIALES.filter(function (m) {
    // Siempre deben existir los 3 mensajes base; los ejemplos RESP_ solo si la pestaña está vacía.
    return claves.indexOf(m[0]) < 0 && (m[0].indexOf(MSG.PREFIJO_RESPUESTA) !== 0 || claves.filter(String).length === 0);
  }).map(function (m) { return { 'Clave': m[0], 'Nombre del botón': m[1], 'Texto': m[2], 'Para qué sirve': m[3] }; });
  agregarFilas_(tabla, nuevas);
  sh.setColumnWidth(1, 170); sh.setColumnWidth(2, 170); sh.setColumnWidth(3, 520); sh.setColumnWidth(4, 360);
  sh.getRange(2, 1, Math.max(sh.getMaxRows() - 1, 1), 4).setWrap(true).setVerticalAlignment('top');
}

function sembrarSesiones_(sh) {
  const tabla = leerTabla_(sh);
  sh.getRange(1, 2, sh.getMaxRows(), 1).setNumberFormat('@');
  if (!tabla.filas.some(function (f) { return String(f['Día'] || '').trim(); })) {
    agregarFilas_(tabla, SESIONES_INICIALES.map(function (s) {
      const o = {};
      COLUMNAS_SESIONES.forEach(function (c, i) { o[c] = s[i]; });
      return o;
    }));
  }
  const t = leerTabla_(sh);
  formatoColumna_(sh, t, 'Día', function (r) {
    r.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'], true).build());
  });
  formatoColumna_(sh, t, 'Activa', function (r) {
    r.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['SI', 'NO'], true).build());
  });
  sh.setColumnWidth(1, 110); sh.setColumnWidth(4, 160); sh.setColumnWidth(5, 320);
  sh.getRange(1, 1).setNote('Sesiones fijas y grupales. Si hay al menos una fila activa, se usan estas en vez de los horarios por día de Config. Hora en formato 24 h (15:00) o 3:00 pm. En "Correos" pon el correo de quien la da (separa varios con coma): le llega la invitación con el Meet.');
}

function asegurarCalendario_() {
  const p = props_();
  const cfg = getConfig_();
  const id = p.getProperty('ID_CALENDARIO');
  let cal = id ? CalendarApp.getCalendarById(id) : null;
  if (!cal) {
    const nombre = cfg.ORG + ' · Entrevistas';
    const existentes = CalendarApp.getOwnedCalendarsByName(nombre);
    cal = existentes.length ? existentes[0] : null;
    if (!cal) {
      try {
        cal = CalendarApp.createCalendar(nombre, { summary: 'Reuniones agendadas por los leads (automatización AIESEC).', timeZone: zona_(), color: CalendarApp.Color.BLUE });
      } catch (e) {
        cal = CalendarApp.createCalendar(nombre);
      }
    }
    p.setProperty('ID_CALENDARIO', cal.getId());
  }
  return cal;
}

function escribirInicio_() {
  const sh = libro_().getSheetByName(HOJAS.INICIO);
  if (!sh) return;
  const url = urlWeb_();
  const filas = [
    ['🌍 AIESEC · Contacto de leads', ''],
    ['Versión ' + VERSION, 'Actualizado: ' + Utilities.formatDate(new Date(), zona_(), 'yyyy-MM-dd HH:mm')],
    ['', ''],
    ['LINKS', ''],
    ['Panel del equipo (solo para el equipo)', url ? urlPanel_() : '⚠️ Falta publicar la app web (paso 1)'],
    ['Link general para agendar', url || '⚠️ Falta publicar la app web (paso 1)'],
    ['Calendario de AIESEC', urlCalendario_()],
    ['', ''],
    ['CÓMO SE USA', ''],
    ['1. Publicar la app web (una vez)', 'Extensiones → Apps Script → Implementar → Nueva implementación → App web. Ejecutar como: Yo. Acceso: Cualquier persona. Pega la URL /exec en Config.'],
    ['2. Cargar leads', 'Pega el export de los Ads (con encabezados en la fila 1) en la pestaña Importar y usa AIESEC → Importar. También se importa sola cada hora.'],
    ['3. Escribir los mensajes', 'Pestaña Mensajes. Variables: {primer_nombre} {nombre} {link} {remitente} {organizacion} {fecha_reunion} {hora_reunion} {meet}'],
    ['4. Contactar', 'Abre el Panel en el celular → "Modo rápido" → un toque por persona abre WhatsApp con el mensaje listo.'],
    ['5. Agendan solos', 'Cada lead elige horario en su link: se crea el evento con Google Meet en el calendario de AIESEC y se llena Agendados.'],
    ['6. Resúmenes', 'Llegan a las 12:00 y 20:00 (correo y, si lo conectas, Telegram).'],
  ];
  sh.clear();
  sh.getRange(1, 1, filas.length, 2).setValues(filas).setWrap(true).setVerticalAlignment('top');
  sh.getRange(1, 1).setFontSize(16).setFontWeight('bold');
  sh.getRange(4, 1).setFontWeight('bold').setFontColor('#037ef3');
  sh.getRange(9, 1).setFontWeight('bold').setFontColor('#037ef3');
  sh.getRange(5, 1, 3, 1).setFontWeight('bold');
  sh.setColumnWidth(1, 300);
  sh.setColumnWidth(2, 700);
}

/** Crea/repara todo. Se puede correr varias veces sin perder datos. */
function configurarTodo_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (esCopia_()) reiniciarCopia_();
  libro_.cache = ss;
  getConfig_.cache = null;
  const p = props_();
  p.setProperty('ID_HOJA', ss.getId());
  if (!p.getProperty('DUENO') && Session.getEffectiveUser().getEmail()) p.setProperty('DUENO', Session.getEffectiveUser().getEmail());
  try { ss.setSpreadsheetTimeZone(zona_()); } catch (e) { console.warn(e); }

  prepararPestana_(HOJAS.INICIO, null);
  const shC = prepararPestana_(HOJAS.CONTACTOS, COLUMNAS_CONTACTOS);
  const shA = prepararPestana_(HOJAS.AGENDADOS, COLUMNAS_AGENDADOS);
  const shI = prepararPestana_(HOJAS.IMPORTAR, null);
  const shM = prepararPestana_(HOJAS.MENSAJES, COLUMNAS_MENSAJES);
  const shS = prepararPestana_(HOJAS.SESIONES, COLUMNAS_SESIONES);
  sembrarSesiones_(shS);
  const shCfg = prepararPestana_(HOJAS.CONFIG, ['Parámetro', 'Valor', 'Ayuda']);
  const shR = prepararPestana_(HOJAS.REGISTRO, COLUMNAS_REGISTRO);

  sembrarConfig_(shCfg);
  sembrarMensajes_(shM);
  formatearContactos_(shC);
  formatearAgendados_(shA);
  shR.getRange(2, 1, Math.max(shR.getMaxRows() - 1, 1), 1).setNumberFormat('dd/mm/yyyy h:mm am/pm');
  if (shI.getLastRow() === 0) {
    shI.getRange(1, 1, 1, 4).setValues([['Nombre', 'Teléfono', 'Correo', 'Origen']]).setFontWeight('bold');
    shI.getRange(1, 1).setNote('Pega aquí el export de tus Ads (Meta, Google Forms, Excel…) INCLUYENDO la fila de encabezados. Luego: menú AIESEC → Importar. El sistema detecta solo las columnas de nombre, teléfono y correo.');
  }

  const sobra = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1') || ss.getSheetByName('Hoja1');
  if (sobra && sobra.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(sobra);

  const cal = asegurarCalendario_();
  if (!p.getProperty('CLAVE_PANEL')) p.setProperty('CLAVE_PANEL', Utilities.getUuid().replace(/-/g, '').slice(0, 16));
  const horas = crearTriggers_();
  if (urlWeb_()) refrescarLinks_();
  escribirInicio_();
  [HOJAS.INICIO, HOJAS.CONTACTOS, HOJAS.AGENDADOS, HOJAS.SESIONES, HOJAS.IMPORTAR, HOJAS.MENSAJES, HOJAS.CONFIG, HOJAS.REGISTRO].forEach(function (n, i) {
    const s = ss.getSheetByName(n);
    if (s) { ss.setActiveSheet(s); ss.moveActiveSheet(i + 1); }
  });
  ss.setActiveSheet(ss.getSheetByName(HOJAS.INICIO));
  registrar_('Configuración', '', '', 'Versión ' + VERSION, Session.getEffectiveUser().getEmail());
  return { calendario: cal.getName(), horas: horas };
}
