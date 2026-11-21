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
  // api.whatsapp.com conserva los emojis; wa.me a veces los convierte en "�" al redirigir.
  return 'https://api.whatsapp.com/send?phone=' + d + (texto ? '&text=' + encodeURIComponent(texto) : '');
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
