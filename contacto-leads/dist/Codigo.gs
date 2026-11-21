// Archivo generado con "npm run build" a partir de src/. No lo edites a mano.

// ==================== 00_Config.js ====================
/**
 * AIESEC · Contacto de leads → agendamiento → resumen diario
 * --------------------------------------------------------------
 * Google Apps Script vinculado a una Hoja de cálculo de Google.
 *
 * Seguridad: TODA función cuyo nombre termina en "_" es privada (no se
 * puede llamar desde el navegador). Las funciones públicas que usa la app
 * web validan su propio acceso (link personal o clave del panel).
 */

const VERSION = '1.0.0';

const HOJAS = {
  INICIO: 'Inicio',
  CONTACTOS: 'Contactos',
  SESIONES: 'Sesiones',
  AGENDADOS: 'Agendados',
  IMPORTAR: 'Importar',
  MENSAJES: 'Mensajes',
  CONFIG: 'Config',
  REGISTRO: 'Registro',
};

/** Encabezados de la pestaña Contactos (el código los busca por nombre, no por posición). */
const COL = {
  ID: 'ID',
  NOMBRE: 'Nombre',
  TELEFONO: 'Teléfono',
  CORREO: 'Correo',
  ESTADO: 'Estado',
  RESPONSABLE: 'Responsable',
  INTENTOS: 'Intentos',
  ULTIMO_CONTACTO: 'Último contacto',
  FECHA_REUNION: 'Fecha reunión',
  LINK_REUNION: 'Link reunión',
  AGENDADO_EL: 'Agendado el',
  NOTAS: 'Notas',
  ORIGEN: 'Origen',
  LINK_AGENDA: 'Link para agendar',
  INFO_EXTRA: 'Info del formulario',
  CREADO: 'Creado',
  SESION: 'Sesión con',
  EVENTO_ID: 'Evento (técnico)',
};

const COLUMNAS_CONTACTOS = [
  COL.ID, COL.NOMBRE, COL.TELEFONO, COL.CORREO, COL.ESTADO, COL.RESPONSABLE,
  COL.INTENTOS, COL.ULTIMO_CONTACTO, COL.FECHA_REUNION, COL.SESION, COL.LINK_REUNION,
  COL.AGENDADO_EL, COL.NOTAS, COL.ORIGEN, COL.LINK_AGENDA, COL.INFO_EXTRA,
  COL.CREADO, COL.EVENTO_ID,
];

/** Pestaña Agendados: la "otra herramienta" con la info de cada aplicante agendado. */
const COLA = {
  ID: 'ID',
  REUNION: 'Reunión',
  SESION: 'Quién la da',
  NOMBRE: 'Nombre',
  TELEFONO: 'Teléfono',
  CORREO: 'Correo',
  LINK: 'Link reunión',
  RESPONSABLE: 'Responsable',
  ESTADO: 'Estado reunión',
  AGENDADO_EL: 'Agendado el',
  RESULTADO: 'Resultado',
  NOTAS: 'Notas de la entrevista',
};
const COLUMNAS_AGENDADOS = [
  COLA.REUNION, COLA.SESION, COLA.NOMBRE, COLA.TELEFONO, COLA.CORREO, COLA.LINK, COLA.RESPONSABLE,
  COLA.ESTADO, COLA.RESULTADO, COLA.NOTAS, COLA.AGENDADO_EL, COLA.ID,
];
const RESULTADOS = ['Asistió', 'No asistió', 'Reprogramar'];

/**
 * Pestaña Sesiones (opcional): sesiones fijas y grupales, cada una con quien la da.
 * Si tiene al menos una fila activa, reemplaza los "Horario lunes…domingo" de Config.
 */
const COLUMNAS_SESIONES = ['Día', 'Hora', 'Duración (min)', 'Quién la da', 'Correos de quien la da', 'Cupos', 'Activa'];
const SESIONES_INICIALES = [
  ['Miércoles', '15:00', 60, 'Ana', '', 15, 'SI'],
  ['Jueves', '15:00', 60, 'Ana', '', 15, 'SI'],
  ['Viernes', '19:00', 60, 'Aleja', '', 15, 'SI'],
  ['Sábado', '09:00', 60, 'Aleja', '', 15, 'SI'],
  ['Miércoles', '18:00', 60, 'Leidy y Cristian', '', 15, 'SI'],
];

const COLUMNAS_REGISTRO = ['Fecha', 'Acción', 'ID', 'Nombre', 'Detalle', 'Por'];
const COLUMNAS_MENSAJES = ['Clave', 'Nombre del botón', 'Texto', 'Para qué sirve'];

const ESTADO = {
  PENDIENTE: 'Pendiente',
  CONTACTADO: 'Contactado',
  RESPONDIO: 'Respondió',
  AGENDADO: 'Agendado',
  ASISTIO: 'Asistió',
  NO_ASISTIO: 'No asistió',
  NO_INTERESADO: 'No interesado',
  INVALIDO: 'Número inválido',
};
const LISTA_ESTADOS = Object.keys(ESTADO).map(function (k) { return ESTADO[k]; });

const COLOR_ESTADO = {
  'Pendiente': '#fff4ce',
  'Contactado': '#dbeafe',
  'Respondió': '#ede9fe',
  'Agendado': '#d1fae5',
  'Asistió': '#a7f3d0',
  'No asistió': '#fde2e1',
  'No interesado': '#e5e7eb',
  'Número inválido': '#fecaca',
};

/** Mensajes con clave fija. Las respuestas rápidas usan claves que empiezan por RESP_. */
const MSG = {
  PRIMER: 'PRIMER_CONTACTO',
  SEGUIMIENTO: 'SEGUIMIENTO',
  RECORDATORIO: 'RECORDATORIO',
  PREFIJO_RESPUESTA: 'RESP_',
};

/**
 * Parámetros editables desde la pestaña Config (columna "Valor").
 * tipo: texto | num | sino | horario
 */
const DEF_CONFIG = [
  { k: 'ORG', tipo: 'texto', def: 'AIESEC', etiqueta: 'Nombre de la organización', ayuda: 'Aparece en la página de agendamiento y en los mensajes ({organizacion}).' },
  { k: 'TIPO_REUNION', tipo: 'texto', def: 'Sesión informativa AIESEC', etiqueta: 'Nombre de la reunión', ayuda: 'Título de la página y del evento en el calendario.' },
  { k: 'DESCRIPCION', tipo: 'texto', def: 'Una sesión grupal por Google Meet para contarte cómo funciona Voluntario Global, los proyectos y el beneficio de Black November, y resolver tus dudas. Puedes invitar a tu familia.', etiqueta: 'Descripción para el aplicante', ayuda: 'Texto corto que ve el aplicante al abrir su link.' },
  { k: 'URL_WEB', tipo: 'texto', def: '', etiqueta: 'URL de la app web', ayuda: 'Pega aquí la URL que termina en /exec (Implementar → Nueva implementación → App web).' },
  { k: 'EQUIPO', tipo: 'texto', def: '', etiqueta: 'Nombres del equipo', ayuda: 'Separados por coma. Aparecen en el panel para elegir "¿Quién eres?" y llenan {remitente}.' },
  { k: 'CORREOS_REPORTE', tipo: 'texto', def: '', etiqueta: 'Correos que reciben el resumen', ayuda: 'Separados por coma. Reciben el resumen de las 12:00 y las 20:00.' },
  { k: 'CORREOS_INVITADOS', tipo: 'texto', def: '', etiqueta: 'Correos invitados a cada reunión', ayuda: 'Separados por coma. Quienes harán las entrevistas: les llega la invitación con el Meet.' },
  { k: 'DURACION', tipo: 'num', def: 60, etiqueta: 'Duración de la reunión (minutos)', ayuda: '' },
  { k: 'PASO', tipo: 'num', def: 30, etiqueta: 'Cada cuántos minutos empieza un horario', ayuda: 'Ej.: 30 → 9:00, 9:30, 10:00…' },
  { k: 'CUPOS', tipo: 'num', def: 1, etiqueta: 'Reuniones a la misma hora', ayuda: 'Pon 2 si dos personas del equipo pueden entrevistar en paralelo.' },
  { k: 'ANTICIPACION', tipo: 'num', def: 3, etiqueta: 'Anticipación mínima para agendar (horas)', ayuda: 'Evita que alguien agende para dentro de 10 minutos.' },
  { k: 'DIAS', tipo: 'num', def: 10, etiqueta: 'Días hacia adelante que se muestran', ayuda: '' },
  { k: 'H1', tipo: 'horario', def: '09:00-12:00, 14:00-18:00', etiqueta: 'Horario lunes', ayuda: 'Formato 09:00-12:00, 14:00-18:00. Déjalo vacío si ese día no hay reuniones.' },
  { k: 'H2', tipo: 'horario', def: '09:00-12:00, 14:00-18:00', etiqueta: 'Horario martes', ayuda: '' },
  { k: 'H3', tipo: 'horario', def: '09:00-12:00, 14:00-18:00', etiqueta: 'Horario miércoles', ayuda: '' },
  { k: 'H4', tipo: 'horario', def: '09:00-12:00, 14:00-18:00', etiqueta: 'Horario jueves', ayuda: '' },
  { k: 'H5', tipo: 'horario', def: '09:00-12:00, 14:00-18:00', etiqueta: 'Horario viernes', ayuda: '' },
  { k: 'H6', tipo: 'horario', def: '09:00-12:00', etiqueta: 'Horario sábado', ayuda: '' },
  { k: 'H0', tipo: 'horario', def: '', etiqueta: 'Horario domingo', ayuda: '' },
  { k: 'FESTIVOS', tipo: 'sino', def: 'SI', etiqueta: 'Bloquear festivos de Colombia', ayuda: 'SI / NO' },
  { k: 'FECHAS_BLOQUEADAS', tipo: 'texto', def: '', etiqueta: 'Fechas bloqueadas', ayuda: 'AAAA-MM-DD separadas por coma. También puedes crear un evento en el calendario de AIESEC para bloquear un rato.' },
  { k: 'REVISAR_PRINCIPAL', tipo: 'sino', def: 'NO', etiqueta: 'Evitar choques con mi calendario personal', ayuda: 'SI = no ofrece horarios en los que tengas algo en tu calendario principal (los eventos NO se mezclan).' },
  { k: 'REPORTE_H1', tipo: 'num', def: 12, etiqueta: 'Hora del primer resumen (0-23)', ayuda: 'Si la cambias, vuelve a correr AIESEC → Configurar.' },
  { k: 'REPORTE_H2', tipo: 'num', def: 20, etiqueta: 'Hora del segundo resumen (0-23)', ayuda: 'Si la cambias, vuelve a correr AIESEC → Configurar.' },
  { k: 'AVISO_INMEDIATO', tipo: 'sino', def: 'NO', etiqueta: 'Avisar al instante cuando alguien agenda', ayuda: 'SI = además del resumen, llega un aviso (Telegram si está conectado; si no, correo).' },
  { k: 'HORAS_SEGUIMIENTO', tipo: 'num', def: 48, etiqueta: 'Sugerir seguimiento tras (horas sin agendar)', ayuda: '' },
  { k: 'ORIGEN', tipo: 'texto', def: 'Ads', etiqueta: 'Origen por defecto de los leads', ayuda: 'Se usa si el archivo importado no trae nombre de campaña.' },
  { k: 'PAIS', tipo: 'texto', def: '57', etiqueta: 'Indicativo de país por defecto', ayuda: '57 = Colombia. Se agrega a los números de 10 dígitos.' },
  { k: 'FUENTE_URL', tipo: 'texto', def: '', etiqueta: 'Hoja externa de leads (opcional)', ayuda: 'URL de otra hoja (ej. respuestas de un Google Form o Zapier). Se importa sola cada hora.' },
  { k: 'FUENTE_PESTANA', tipo: 'texto', def: '', etiqueta: 'Pestaña de la hoja externa', ayuda: 'Vacío = la primera pestaña.' },
  { k: 'PERMITIR_GENERAL', tipo: 'sino', def: 'SI', etiqueta: 'Permitir agendar con el link general', ayuda: 'SI = el link sin ?id= también funciona (pide nombre y WhatsApp).' },
  { k: 'MODO_WA', tipo: 'texto', def: 'MANUAL', etiqueta: 'Modo de envío de WhatsApp', ayuda: 'MANUAL (gratis, 1 toque por persona desde el panel) o API (WhatsApp Cloud API, ver docs).' },
  { k: 'AUTO_API', tipo: 'sino', def: 'NO', etiqueta: 'Enviar solo a leads nuevos por API', ayuda: 'Solo en modo API: cada hora envía la invitación a los leads Pendientes.' },
  { k: 'TEL_PRUEBA', tipo: 'texto', def: '', etiqueta: 'Teléfono para pruebas de la API', ayuda: 'Tu número con indicativo, ej. 573001234567.' },
];

/** Lee la configuración (pestaña Config + valores por defecto). Se cachea por ejecución. */
function getConfig_() {
  if (getConfig_.cache) return getConfig_.cache;
  const cfg = {};
  const porEtiqueta = {};
  DEF_CONFIG.forEach(function (d) {
    cfg[d.k] = d.def;
    porEtiqueta[normalizarTexto_(d.etiqueta)] = d;
  });
  const sh = libro_().getSheetByName(HOJAS.CONFIG);
  if (sh && sh.getLastRow() > 1) {
    sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues().forEach(function (fila) {
      const d = porEtiqueta[normalizarTexto_(fila[0])];
      if (!d) return;
      const v = fila[1];
      if (d.tipo === 'num') {
        if (v !== '' && v !== null && !isNaN(Number(v))) cfg[d.k] = Number(v);
      } else {
        cfg[d.k] = v === null || v === undefined ? '' : v;
      }
    });
  }
  DEF_CONFIG.forEach(function (d) {
    if (d.tipo === 'sino') cfg[d.k] = siNo_(cfg[d.k]);
    if (d.tipo === 'num') cfg[d.k] = Number(cfg[d.k]);
    if (d.tipo === 'texto' || d.tipo === 'horario') cfg[d.k] = String(cfg[d.k]).trim();
  });
  cfg.MODO_WA = cfg.MODO_WA.toUpperCase() === 'API' ? 'API' : 'MANUAL';
  cfg.DURACION = Math.max(5, cfg.DURACION || 30);
  cfg.PASO = Math.max(5, cfg.PASO || cfg.DURACION);
  cfg.CUPOS = Math.max(1, Math.floor(cfg.CUPOS || 1));
  cfg.DIAS = Math.min(60, Math.max(1, Math.floor(cfg.DIAS || 10)));
  cfg.ANTICIPACION = Math.max(0, cfg.ANTICIPACION || 0);
  getConfig_.cache = cfg;
  return cfg;
}

function props_() {
  return PropertiesService.getScriptProperties();
}

function zona_() {
  return Session.getScriptTimeZone() || 'America/Bogota';
}

/** Desfase en minutos respecto a UTC para la zona del script (Colombia = -300). */
function offsetMinutos_(fecha) {
  const z = Utilities.formatDate(fecha || new Date(), zona_(), 'Z'); // ej. "-0500"
  const m = /^([+-])(\d{2}):?(\d{2})$/.exec(z);
  if (!m) return -300;
  const v = Number(m[2]) * 60 + Number(m[3]);
  return m[1] === '-' ? -v : v;
}

/** URL pública de la app web (la pegada en Config o la detectada al abrirla). */
function urlWeb_() {
  const cfg = getConfig_();
  const url = cfg.URL_WEB || props_().getProperty('URL_WEB_AUTO') || '';
  return String(url).trim().replace(/\?.*$/, '');
}

// ==================== 01_Utilidades.js ====================
/* =================== Utilidades puras (sin servicios de Google) =================== */

const DIAS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MS_MIN = 60000;
const MS_DIA = 86400000;

/** "Teléfono Celular (WhatsApp)" → "telefono_celular_whatsapp" */
function normalizarTexto_(s) {
  return String(s === null || s === undefined ? '' : s)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function siNo_(v) {
  if (v === true) return true;
  const n = normalizarTexto_(v);
  return ['si', 's', 'yes', 'y', 'true', 'x', '1', 'verdadero'].indexOf(n) >= 0;
}

function esFecha_(v) {
  return !!v && typeof v === 'object' && typeof v.getTime === 'function' && !isNaN(v.getTime());
}

function listaTexto_(s) {
  return String(s || '').split(/[,;\n]+/).map(function (x) { return x.trim(); }).filter(String);
}

function correoValido_(c) {
  return /^[^\s@,;]+@[^\s@,;]+\.[a-z]{2,}$/i.test(String(c || '').trim());
}

function listaCorreos_(s) {
  return listaTexto_(s).filter(correoValido_);
}

/**
 * Normaliza un número a formato internacional sin "+" (ej. 573001234567).
 * Acepta: "300 123 4567", "+57 (300) 123-4567", "p:+573001234567" (export de Meta),
 * "00573001234567", números leídos como Number desde la hoja, etc.
 */
function normalizarTelefono_(valor, pais) {
  pais = String(pais || '57').replace(/\D/g, '') || '57';
  let s = String(valor === null || valor === undefined ? '' : valor).trim();
  if (!s) return { telefono: '', valido: false };
  s = s.replace(/^p:\s*/i, '');
  if (/^\d+[.,]\d+e\+?\d+$/i.test(s)) return { telefono: '', valido: false }; // 5.73E+11 (dato dañado por Excel)
  s = s.replace(/^(\d+)[.,]0+$/, '$1'); // 3001234567.0
  let d = s.replace(/\D/g, '');
  if (d.indexOf('00') === 0) d = d.slice(2);
  if (pais === '57') {
    if (d.length === 11 && d.indexOf('03') === 0) d = d.slice(1);
    if (d.length === 10) d = '57' + d;
  } else if (d.length <= 10 && d.indexOf(pais) !== 0) {
    d = pais + d;
  }
  let valido = /^[1-9]\d{9,14}$/.test(d);
  if (valido && d.indexOf('57') === 0) valido = /^573\d{9}$/.test(d); // celulares de Colombia
  return { telefono: d, valido: valido };
}

/** 573001234567 → "+57 300 123 4567" */
function formatearTelefono_(tel) {
  const d = String(tel || '').replace(/\D/g, '');
  const m = /^57(\d{3})(\d{3})(\d{4})$/.exec(d);
  if (m) return '+57 ' + m[1] + ' ' + m[2] + ' ' + m[3];
  return d ? '+' + d : '';
}

function capitalizar_(s) {
  return String(s || '').toLowerCase().replace(/(^|[\s'-])(\S)/g, function (_, a, b) { return a + b.toUpperCase(); });
}

/** Limpia un nombre: quita espacios dobles y, si viene TODO en mayúsculas o minúsculas, lo capitaliza. */
function limpiarNombre_(s) {
  const t = String(s || '').replace(/\s+/g, ' ').trim().slice(0, 120);
  if (!t) return '';
  if (t === t.toUpperCase() || t === t.toLowerCase()) return capitalizar_(t);
  return t;
}

function primerNombre_(nombre) {
  const t = limpiarNombre_(nombre).split(' ')[0] || '';
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : '';
}

/** Reemplaza {variable}. Las variables conocidas sin valor quedan vacías; las desconocidas se dejan tal cual. */
function renderPlantilla_(texto, vars) {
  return String(texto || '').replace(/\{([a-z_]+)\}/gi, function (m, k) {
    const key = k.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(vars, key)) {
      const v = vars[key];
      return v === null || v === undefined ? '' : String(v);
    }
    return m;
  }).replace(/[ \t]+\n/g, '\n').trim();
}

function linkWhatsApp_(telefono, texto) {
  const d = String(telefono || '').replace(/\D/g, '');
  return 'https://wa.me/' + d + (texto ? '?text=' + encodeURIComponent(texto) : '');
}

function escaparHtml_(s) {
  return String(s === null || s === undefined ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function limpiarId_(id) {
  return String(id || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40);
}

function generarId_() {
  return Utilities.getUuid().replace(/-/g, '').slice(0, 12);
}

/* ------------------------------ Fechas y horas ------------------------------ */

function pad2_(n) { return (n < 10 ? '0' : '') + n; }

/** Partes de la fecha en la hora local definida por offMin (ej. -300 para Colombia). */
function partesLocales_(fecha, offMin) {
  const t = new Date(fecha.getTime() + offMin * MS_MIN);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate(), h: t.getUTCHours(), mi: t.getUTCMinutes(), dow: t.getUTCDay() };
}

/** Fecha real a partir de día local + minutos desde medianoche. */
function fechaDesdeLocal_(y, m, d, minutosDia, offMin) {
  return new Date(Date.UTC(y, m - 1, d, 0, minutosDia) - offMin * MS_MIN);
}

function claveFecha_(y, m, d) { return y + '-' + pad2_(m) + '-' + pad2_(d); }

function claveFechaLocal_(fecha, offMin) {
  const p = partesLocales_(fecha, offMin);
  return claveFecha_(p.y, p.m, p.d);
}

/** "2026-11-23T09:00:00-05:00" */
function isoConOffset_(fecha, offMin) {
  const p = partesLocales_(fecha, offMin);
  const a = Math.abs(offMin);
  return claveFecha_(p.y, p.m, p.d) + 'T' + pad2_(p.h) + ':' + pad2_(p.mi) + ':00' +
    (offMin < 0 ? '-' : '+') + pad2_(Math.floor(a / 60)) + ':' + pad2_(a % 60);
}

/** "9:00 a. m." (con espacios de no separación para que no se parta en dos líneas) */
function formatearHora_(fecha, offMin) {
  const p = partesLocales_(fecha, offMin);
  const h12 = p.h % 12 === 0 ? 12 : p.h % 12;
  return h12 + ':' + pad2_(p.mi) + (p.h < 12 ? '\u00a0a.\u00a0m.' : '\u00a0p.\u00a0m.');
}

/** "lunes 23 de noviembre" */
function formatearDia_(fecha, offMin) {
  const p = partesLocales_(fecha, offMin);
  return DIAS_ES[p.dow] + ' ' + p.d + ' de ' + MESES_ES[p.m - 1];
}

/** "lun 23 nov" */
function formatearDiaCorto_(fecha, offMin) {
  const p = partesLocales_(fecha, offMin);
  return DIAS_CORTOS[p.dow] + ' ' + p.d + ' ' + MESES_CORTOS[p.m - 1];
}

function formatearFechaHora_(fecha, offMin) {
  return formatearDia_(fecha, offMin) + ', ' + formatearHora_(fecha, offMin);
}

/** "9:00-12:00, 14:00-18:00" → [[540,720],[840,1080]] (minutos desde medianoche). */
function parseHorario_(texto) {
  const t = String(texto || '').trim().toLowerCase();
  if (!t || ['no', '-', 'cerrado', 'ninguno', 'n/a'].indexOf(t) >= 0) return [];
  const tramos = [];
  t.split(/[,;]|\sy\s/).forEach(function (parte) {
    const m = /^\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.?\s?m\.?|p\.?\s?m\.?)?\s*(?:-|–|a|hasta)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.?\s?m\.?|p\.?\s?m\.?)?\s*$/.exec(parte);
    if (!m) return;
    const ini = aMinutos_(m[1], m[2], m[3]);
    const fin = aMinutos_(m[4], m[5], m[6]);
    if (ini !== null && fin !== null && fin > ini) tramos.push([ini, fin]);
  });
  return tramos.sort(function (a, b) { return a[0] - b[0]; });
}

/** "15:00", "3pm", "3:00 p. m." → minutos desde medianoche (o null). */
function parseHora_(texto) {
  const m = /^\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.?\s?m\.?|p\.?\s?m\.?)?\s*$/i.exec(String(texto || '').toLowerCase());
  return m ? aMinutos_(m[1], m[2], m[3]) : null;
}

const DIAS_NORM = { domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6 };

function aMinutos_(h, mi, ampm) {
  h = Number(h); mi = Number(mi || 0);
  if (ampm) {
    const pm = ampm.charAt(0) === 'p';
    if (h === 12) h = pm ? 12 : 0; else if (pm) h += 12;
  }
  if (h > 24 || mi > 59) return null;
  return h * 60 + mi;
}

/** Domingo de Pascua (algoritmo de Meeus/Jones/Butcher), en ms UTC. */
function pascua_(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  return Date.UTC(y, mes - 1, dia);
}

/** Festivos de Colombia (Ley 51 de 1983 "Ley Emiliani"). Devuelve {'AAAA-MM-DD': true}. */
function festivosColombia_(y) {
  const set = {};
  const agregar = function (ms) {
    const t = new Date(ms);
    set[claveFecha_(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate())] = true;
  };
  const lunesSiguiente = function (ms) { return ms + ((8 - new Date(ms).getUTCDay()) % 7) * MS_DIA; };
  [[1, 1], [5, 1], [7, 20], [8, 7], [12, 8], [12, 25]].forEach(function (f) { agregar(Date.UTC(y, f[0] - 1, f[1])); });
  [[1, 6], [3, 19], [6, 29], [8, 15], [10, 12], [11, 1], [11, 11]].forEach(function (f) { agregar(lunesSiguiente(Date.UTC(y, f[0] - 1, f[1]))); });
  const p = pascua_(y);
  agregar(p - 3 * MS_DIA); // Jueves Santo
  agregar(p - 2 * MS_DIA); // Viernes Santo
  agregar(lunesSiguiente(p + 39 * MS_DIA)); // Ascensión
  agregar(lunesSiguiente(p + 60 * MS_DIA)); // Corpus Christi
  agregar(lunesSiguiente(p + 68 * MS_DIA)); // Sagrado Corazón
  return set;
}

/**
 * Calcula los horarios libres.
 * p = { ahora, offMin, horario: {0..6: [[ini,fin]]}, duracionMin, pasoMin, anticipacionMin, dias,
 *       cupos, reservas: [{inicio,fin}], bloqueos: [{inicio,fin}], festivos: {}, fechasBloqueadas: [] }
 * → [{ fecha, etiqueta, etiquetaLarga, horarios: [{ inicio (ISO), ms, etiqueta }] }]
 */
function calcularHorarios_(p) {
  const off = p.offMin;
  const hoy = partesLocales_(p.ahora, off);
  const limite = p.ahora.getTime() + (p.anticipacionMin || 0) * MS_MIN;
  const dur = p.duracionMin * MS_MIN;
  const paso = Math.max(5, p.pasoMin || p.duracionMin) * MS_MIN;
  const festivos = p.festivos || {};
  const bloqueadas = p.fechasBloqueadas || [];
  const reservas = p.reservas || [];
  const bloqueos = p.bloqueos || [];
  const cupos = Math.max(1, p.cupos || 1);
  const dias = [];
  for (let i = 0; i < p.dias; i++) {
    const t = new Date(Date.UTC(hoy.y, hoy.m - 1, hoy.d + i));
    const y = t.getUTCFullYear(), m = t.getUTCMonth() + 1, d = t.getUTCDate();
    const clave = claveFecha_(y, m, d);
    if (festivos[clave] || bloqueadas.indexOf(clave) >= 0) continue;
    const horarios = [];
    (p.sesiones || []).forEach(function (se) {
      if (se.dow !== t.getUTCDay()) return;
      const s = fechaDesdeLocal_(y, m, d, se.inicioMin, off).getTime();
      const e = s + se.duracion * MS_MIN;
      if (s < limite) return;
      if (bloqueos.some(function (b) { return b.inicio < e && b.fin > s; })) return;
      const inscritos = reservas.filter(function (r) { return r.inicio === s; }).length;
      if (inscritos >= se.cupos) return;
      horarios.push({ inicio: isoConOffset_(new Date(s), off), ms: s, etiqueta: formatearHora_(new Date(s), off), anfitrion: se.anfitrion, duracion: se.duracion, cuposLibres: se.cupos - inscritos });
    });
    (p.sesiones && p.sesiones.length ? [] : (p.horario[t.getUTCDay()] || [])).forEach(function (tramo) {
      const finTramo = fechaDesdeLocal_(y, m, d, tramo[1], off).getTime();
      for (let s = fechaDesdeLocal_(y, m, d, tramo[0], off).getTime(); s + dur <= finTramo; s += paso) {
        if (s < limite) continue;
        const e = s + dur;
        if (bloqueos.some(function (b) { return b.inicio < e && b.fin > s; })) continue;
        const ocupados = reservas.filter(function (r) { return r.inicio < e && r.fin > s; }).length;
        if (ocupados >= cupos) continue;
        if (horarios.some(function (h) { return h.ms === s; })) continue;
        horarios.push({ inicio: isoConOffset_(new Date(s), off), ms: s, etiqueta: formatearHora_(new Date(s), off), anfitrion: '', duracion: p.duracionMin });
      }
    });
    if (!horarios.length) continue;
    horarios.sort(function (a, b) { return a.ms - b.ms; });
    const base = fechaDesdeLocal_(y, m, d, 12 * 60, off);
    dias.push({ fecha: clave, etiqueta: formatearDiaCorto_(base, off), etiquetaLarga: formatearDia_(base, off), horarios: horarios });
  }
  return dias;
}

/** Texto relativo: "hace 5 min", "hace 3 h", "hace 2 días". */
function haceCuanto_(ms, ahoraMs) {
  const s = Math.max(0, Math.round((ahoraMs - ms) / 1000));
  if (s < 3600) return 'hace ' + Math.max(1, Math.round(s / 60)) + ' min';
  if (s < 86400) return 'hace ' + Math.round(s / 3600) + ' h';
  const dd = Math.round(s / 86400);
  return 'hace ' + dd + (dd === 1 ? ' día' : ' días');
}

// ==================== 02_Hoja.js ====================
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

// ==================== 03_Leads.js ====================
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

// ==================== 04_Agenda.js ====================
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

// ==================== 05_Panel.js ====================
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

// ==================== 06_Reportes.js ====================
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
  const fechaCorta = function (c) { return formatearDiaCorto_(c.fechaReunion, off) + ' · ' + formatearHora_(c.fechaReunion, off) + (c.sesion ? ' · con ' + c.sesion : ''); };
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

// ==================== 07_WhatsAppAPI.js ====================
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

// ==================== 08_WebApp.js ====================
/* =================== App web: página de agendamiento y panel =================== */

/**
 *  URL/exec            → página para agendar (link general)
 *  URL/exec?id=XXXX    → página para agendar con los datos del aplicante
 *  URL/exec?vista=panel&clave=YYYY → panel del equipo
 */
function doGet(e) {
  const p = (e && e.parameter) || {};
  let org = 'AIESEC';
  try {
    org = getConfig_().ORG;
    recordarUrl_();
  } catch (err) {
    console.warn(err);
  }
  const panel = p.vista === 'panel';
  return HtmlService.createHtmlOutputFromFile(panel ? 'Panel' : 'Agendar')
    .setTitle(panel ? 'Panel de contacto · ' + org : 'Agenda tu reunión · ' + org)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Guarda la URL /exec la primera vez que alguien abre la app (por si no la pegaron en Config). */
function recordarUrl_() {
  const p = props_();
  if (p.getProperty('URL_WEB_AUTO')) return;
  const url = ScriptApp.getService().getUrl();
  if (url && /\/exec$/.test(url)) p.setProperty('URL_WEB_AUTO', url);
}

// ==================== 09_Menu.js ====================
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
function esDueno_() {
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
