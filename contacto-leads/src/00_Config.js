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
const COLUMNAS_SESIONES = ['Día', 'Hora', 'Duración (min)', 'Quién la da', 'Correos de quien la da', 'Cupos', 'Activa', 'Programa'];
const SESIONES_INICIALES = [
  ['Miércoles', '15:00', 60, 'Ana', '', 15, 'SI', 'GV'],
  ['Jueves', '15:00', 60, 'Ana', '', 15, 'SI', 'GV'],
  ['Viernes', '19:00', 60, 'Aleja', '', 15, 'SI', 'GT'],
  ['Sábado', '09:00', 60, 'Aleja', '', 15, 'SI', 'GT'],
  ['Miércoles', '18:00', 60, 'Leidy y Cristian', '', 15, 'SI', 'GT'],
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
  NO_CUMPLE: 'No cumple',
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
  'No cumple': '#fde68a',
  'Número inválido': '#fecaca',
};

/** Mensajes con clave fija. Las respuestas rápidas usan claves que empiezan por RESP_. */
const MSG = {
  PRIMER: 'PRIMER_CONTACTO',
  SEGUIMIENTO: 'SEGUIMIENTO',
  RECORDATORIO: 'RECORDATORIO',
  PREFIJO_RESPUESTA: 'RESP_',
  PREFIJO_NO_CUMPLE: 'RESP_NOCUMPLE_',
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
