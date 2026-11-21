/**
 * Simulador mínimo de Google Apps Script para probar dist/Codigo.gs en Node:
 * Sheets, Calendar (servicio avanzado), CalendarApp, Properties, Lock, Mail, UrlFetch, ScriptApp.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const CODIGO = path.join(__dirname, '..', 'dist', 'Codigo.gs');

/** Envuelve un objeto para que cualquier método desconocido (formatos, estilos…) sea un no-op encadenable. */
function conNoOps(obj) {
  const proxy = new Proxy(obj, {
    get(t, p) {
      if (typeof p === 'symbol') return t[p];
      if (p in t) {
        const v = t[p];
        if (typeof v !== 'function') return v;
        return (...args) => { const r = v.apply(t, args); return r === t ? proxy : r; };
      }
      if (p === 'then') return undefined;
      return () => proxy;
    },
  });
  return proxy;
}

const vacio = (v) => v === '' || v === null || v === undefined;

class FakeSheet {
  constructor(nombre) { this.nombre = nombre; this.data = []; this.maxRows = 1000; this.maxCols = 26; this.reglas = []; this.ocultas = []; this.notas = {}; }
  getName() { return this.nombre; }
  getLastRow() {
    for (let r = this.data.length; r > 0; r--) if ((this.data[r - 1] || []).some((v) => !vacio(v))) return r;
    return 0;
  }
  getLastColumn() {
    let m = 0;
    this.data.forEach((fila) => { for (let c = fila.length; c > 0; c--) if (!vacio(fila[c - 1])) { m = Math.max(m, c); break; } });
    return m;
  }
  getMaxRows() { return this.maxRows; }
  getMaxColumns() { return this.maxCols; }
  insertRowsAfter(_, n) { this.maxRows += n; return this; }
  insertColumnsAfter(_, n) { this.maxCols += n; return this; }
  getRange(r, c, nr = 1, nc = 1) {
    if (r < 1 || c < 1 || nr < 1 || nc < 1) throw new Error(`Rango inválido ${r},${c},${nr},${nc}`);
    if (r + nr - 1 > this.maxRows || c + nc - 1 > this.maxCols) throw new Error('The coordinates of the range are outside the dimensions of the sheet.');
    return conNoOps(new FakeRange(this, r, c, nr, nc));
  }
  appendRow(fila) {
    const r = this.getLastRow() + 1;
    if (r > this.maxRows) this.maxRows = r;
    if (fila.length > this.maxCols) this.maxCols = fila.length;
    this._set(r, 1, [fila]);
    return this;
  }
  clear() { this.data = []; return this; }
  getConditionalFormatRules() { return this.reglas; }
  setConditionalFormatRules(r) { this.reglas = r; return this; }
  hideColumns(c) { this.ocultas.push(c); return this; }
  _get(r, c) { const f = this.data[r - 1]; return f && f[c - 1] !== undefined ? f[c - 1] : ''; }
  _set(r, c, vals) {
    vals.forEach((fila, i) => fila.forEach((v, j) => {
      const rr = r + i - 1;
      while (this.data.length <= rr) this.data.push([]);
      this.data[rr][c + j - 1] = v;
    }));
  }
  /** Ayuda para pruebas: filas como objetos según la fila 1. */
  objetos() {
    const [enc, ...filas] = this.data;
    return filas.filter((f) => f.some((v) => !vacio(v))).map((f) => Object.fromEntries(enc.map((h, i) => [h, f[i] === undefined ? '' : f[i]])));
  }
}

class FakeRange {
  constructor(sh, r, c, nr, nc) { Object.assign(this, { sh, r, c, nr, nc }); }
  getValues() { return Array.from({ length: this.nr }, (_, i) => Array.from({ length: this.nc }, (_, j) => this.sh._get(this.r + i, this.c + j))); }
  setValues(v) {
    if (v.length !== this.nr || v.some((f) => f.length !== this.nc)) throw new Error(`setValues: dimensiones ${v.length}x${v[0] && v[0].length} ≠ ${this.nr}x${this.nc}`);
    this.sh._set(this.r, this.c, v);
    return this;
  }
  getValue() { return this.sh._get(this.r, this.c); }
  setValue(v) { this.sh._set(this.r, this.c, [[v]]); return this; }
  clearContent() { this.sh._set(this.r, this.c, Array.from({ length: this.nr }, () => Array(this.nc).fill(''))); return this; }
  getRow() { return this.r; }
  getColumn() { return this.c; }
  getNumRows() { return this.nr; }
  getSheet() { return this.sh._proxy; }
  setNote(n) { this.sh.notas[`${this.r},${this.c}`] = n; return this; }
  sort(o) {
    const filas = this.getValues();
    const k = o.column - this.c;
    filas.sort((a, b) => {
      const x = a[k] && a[k].getTime ? a[k].getTime() : a[k];
      const y = b[k] && b[k].getTime ? b[k].getTime() : b[k];
      return (x > y ? 1 : x < y ? -1 : 0) * (o.ascending === false ? -1 : 1);
    });
    this.sh._set(this.r, this.c, filas);
    return this;
  }
}

class FakeSpreadsheet {
  constructor(id) { this.id = id || 'HOJA123'; this.hojas = []; }
  _nueva(nombre) { const s = new FakeSheet(nombre); s._proxy = conNoOps(s); this.hojas.push(s); return s._proxy; }
  getSheetByName(n) { const s = this.hojas.find((h) => h.nombre === n); return s ? s._proxy : null; }
  insertSheet(n) { return this._nueva(n); }
  getSheets() { return this.hojas.map((h) => h._proxy); }
  deleteSheet(s) { this.hojas = this.hojas.filter((h) => h._proxy !== s); }
  getId() { return this.id; }
  getUrl() { return `https://docs.google.com/spreadsheets/d/${this.id}/edit`; }
  setActiveSheet(s) { this.activa = s; return s; }
  moveActiveSheet() {}
  setSpreadsheetTimeZone() {}
  hoja(n) { return this.hojas.find((h) => h.nombre === n); }
}

/** Formato simple compatible con Utilities.formatDate para Colombia (UTC-5 fijo). */
function formatDate(d, _tz, fmt) {
  if (fmt === 'Z') return '-0500';
  const t = new Date(d.getTime() - 5 * 3600000);
  const p = (n) => String(n).padStart(2, '0');
  return fmt.replace('yyyy', t.getUTCFullYear()).replace('MM', p(t.getUTCMonth() + 1)).replace('dd', p(t.getUTCDate()))
    .replace('HH', p(t.getUTCHours())).replace('mm', p(t.getUTCMinutes()));
}

/**
 * Crea un entorno nuevo.
 * opciones: { ahora: ISO, ui: true, ocupadoPrincipal: [{start,end}], fetch: (url, o) => ({code, body}) }
 */
function crearEntorno(opciones = {}) {
  const AHORA = new Date(opciones.ahora || '2026-11-20T10:00:00-05:00').getTime();
  const props = new Map(Object.entries(opciones.props || {}));
  const registro = { correos: [], fetch: [], alertas: [], dialogos: [], eventosBorrados: [], sendUpdates: [] };
  const libro = new FakeSpreadsheet();
  const fuentes = {};
  const calendarios = {};
  const eventos = new Map();
  let nEvento = 0;
  let nTrigger = 0;
  let triggers = [];

  class FechaFija extends Date {
    constructor(...a) { if (a.length === 0) super(AHORA); else super(...a); }
    static now() { return AHORA; }
  }

  const propsSvc = conNoOps({
    getProperty: (k) => (props.has(k) ? props.get(k) : null),
    setProperty: (k, v) => { props.set(k, String(v)); return propsSvc; },
    deleteProperty: (k) => { props.delete(k); return propsSvc; },
  });

  const cadena = () => conNoOps({ build: () => ({ tipo: 'regla' }) });

  const ui = opciones.ui ? {
    ButtonSet: { OK: 'OK', YES_NO: 'YES_NO', OK_CANCEL: 'OK_CANCEL' },
    Button: { OK: 'OK', YES: 'YES', NO: 'NO', CANCEL: 'CANCEL' },
    alert: (...a) => { registro.alertas.push(a); return opciones.respuestaAlerta || 'YES'; },
    prompt: () => ({ getSelectedButton: () => 'OK', getResponseText: () => (opciones.respuestasPrompt || []).shift() || '' }),
    createMenu: () => conNoOps({}),
    showModalDialog: (html, titulo) => registro.dialogos.push(titulo),
  } : null;

  const ctx = {
    console: opciones.verbose ? console : { log() {}, warn() {}, error() {}, info() {} },
    Date: FechaFija,
    Utilities: {
      getUuid: () => crypto.randomUUID(),
      sleep: () => {},
      formatDate,
    },
    PropertiesService: { getScriptProperties: () => propsSvc },
    LockService: { getScriptLock: () => ({ tryLock: () => true, waitLock() {}, releaseLock() {} }) },
    Session: {
      getScriptTimeZone: () => 'America/Bogota',
      getEffectiveUser: () => ({ getEmail: () => 'dueno@example.com' }),
      getActiveUser: () => ({ getEmail: () => '' }),
    },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => libro,
      openById: () => libro,
      openByUrl: (u) => { if (!fuentes[u]) throw new Error('No existe ' + u); return fuentes[u]; },
      newDataValidation: cadena,
      newConditionalFormatRule: cadena,
      getUi: () => { if (!ui) throw new Error('Cannot call SpreadsheetApp.getUi() from this context.'); return ui; },
    },
    CalendarApp: {
      Color: { BLUE: '#2952A3' },
      getCalendarById: (id) => calendarios[id] || null,
      getOwnedCalendarsByName: (n) => Object.values(calendarios).filter((c) => c.getName() === n),
      createCalendar: (nombre) => {
        const id = 'cal' + (Object.keys(calendarios).length + 1) + '@group.calendar.google.com';
        calendarios[id] = { getId: () => id, getName: () => nombre };
        return calendarios[id];
      },
    },
    Calendar: {
      Events: {
        list: (calId, o) => {
          const min = new Date(o.timeMin).getTime(), max = new Date(o.timeMax).getTime();
          const items = [...eventos.values()].filter((e) => e._cal === calId).filter((e) => {
            const s = new Date(e.start.dateTime || e.start.date).getTime(), f = new Date(e.end.dateTime || e.end.date).getTime();
            return s < max && f > min;
          });
          return { items: JSON.parse(JSON.stringify(items)) };
        },
        insert: (recurso, calId, o) => {
          const id = 'ev' + (++nEvento);
          const ev = JSON.parse(JSON.stringify(recurso));
          ev.id = id; ev._cal = calId; ev.htmlLink = 'https://calendar.google.com/event?eid=' + id;
          if (o && o.conferenceDataVersion === 1 && recurso.conferenceData) ev.hangoutLink = 'https://meet.google.com/aaa-bbbb-' + String(nEvento).padStart(3, '0');
          registro.sendUpdates.push(o && o.sendUpdates);
          eventos.set(id, ev);
          return JSON.parse(JSON.stringify(ev));
        },
        get: (calId, id) => JSON.parse(JSON.stringify(eventos.get(id))),
        patch: (recurso, calId, id, o) => {
          const ev = eventos.get(id);
          Object.assign(ev, JSON.parse(JSON.stringify(recurso)));
          registro.sendUpdates.push(o && o.sendUpdates);
          return JSON.parse(JSON.stringify(ev));
        },
        remove: (calId, id) => { registro.eventosBorrados.push(id); eventos.delete(id); },
      },
      Freebusy: { query: () => ({ calendars: { primary: { busy: opciones.ocupadoPrincipal || [] } } }) },
    },
    MailApp: { sendEmail: (o) => registro.correos.push(o) },
    UrlFetchApp: {
      fetch: (url, o) => {
        registro.fetch.push({ url, o, payload: o && o.payload ? JSON.parse(o.payload) : null });
        const r = opciones.fetch ? opciones.fetch(url, o) : { code: 200, body: { ok: true, result: [] } };
        return { getResponseCode: () => r.code, getContentText: () => JSON.stringify(r.body) };
      },
    },
    ScriptApp: {
      getService: () => ({ getUrl: () => 'https://script.google.com/macros/s/AKfyTEST/exec' }),
      getProjectTriggers: () => triggers.slice(),
      deleteTrigger: (t) => { triggers = triggers.filter((x) => x !== t); },
      newTrigger: (fn) => {
        const conf = { fn };
        const b = {
          timeBased: () => b, atHour: (h) => { conf.hora = h; return b; }, nearMinute: () => b, everyDays: () => b,
          everyHours: (h) => { conf.cadaHoras = h; return b; }, inTimezone: (tz) => { conf.tz = tz; return b; },
          create: () => { const uid = 'trig' + (++nTrigger); const t = { getHandlerFunction: () => fn, getUniqueId: () => uid, conf }; triggers.push(t); return t; },
        };
        return b;
      },
    },
    HtmlService: {
      createHtmlOutputFromFile: (f) => conNoOps({ archivo: f }),
      createHtmlOutput: (h) => conNoOps({ html: h }),
    },
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(CODIGO, 'utf8'), ctx, { filename: 'Codigo.gs' });

  const env = {
    ctx, props, libro, registro, eventos, calendarios, fuentes,
    triggers: () => triggers,
    AHORA,
    /** Ejecuta código dentro del entorno (para acceder a constantes). */
    run: (codigo) => vm.runInContext(codigo, ctx),
    /** Simula una ejecución nueva de Apps Script (borra cachés de la ejecución anterior). */
    nuevaEjecucion() { vm.runInContext('getConfig_.cache = null; libro_.cache = null;', ctx); },
    /** Llama una función global como si fuera una ejecución nueva. */
    llamar(nombre, ...args) { env.nuevaEjecucion(); return ctx[nombre](...args); },
    hoja: (n) => libro.hoja(n),
    nuevaFuente(url, filas, pestana) {
      const ss = new FakeSpreadsheet('FUENTE');
      const sh = ss.insertSheet(pestana || 'Respuestas');
      sh.getRange(1, 1, filas.length, filas[0].length).setValues(filas);
      fuentes[url] = ss;
      return ss;
    },
    /** Cambia un valor de la pestaña Config por su etiqueta. */
    config(etiqueta, valor) {
      const sh = libro.hoja('Config');
      const i = sh.data.findIndex((f) => f[0] === etiqueta);
      if (i < 0) throw new Error('No existe el parámetro ' + etiqueta);
      sh.data[i][1] = valor;
    },
    triggerUid: (fn) => (triggers.find((t) => t.getHandlerFunction() === fn) || { getUniqueId: () => null }).getUniqueId(),
  };
  return env;
}

module.exports = { crearEntorno, FakeSpreadsheet };
