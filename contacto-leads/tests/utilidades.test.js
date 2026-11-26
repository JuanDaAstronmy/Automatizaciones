const test = require('node:test');
const assert = require('node:assert/strict');
const { crearEntorno } = require('./entorno');

const env = crearEntorno();
const g = env.ctx;
const OFF = -300;

test('normaliza teléfonos colombianos en todos los formatos comunes', () => {
  const casos = {
    '3001234567': '573001234567',
    '300 123 4567': '573001234567',
    '+57 300 123 4567': '573001234567',
    '(+57) 300-123-4567': '573001234567',
    'p:+573001234567': '573001234567', // export de Meta Lead Ads
    '573001234567': '573001234567',
    '00573001234567': '573001234567',
    '03001234567': '573001234567',
    '3001234567.0': '573001234567',
  };
  for (const [entrada, esperado] of Object.entries(casos)) {
    const r = g.normalizarTelefono_(entrada, '57');
    assert.equal(r.telefono, esperado, entrada);
    assert.equal(r.valido, true, entrada);
  }
  assert.equal(g.normalizarTelefono_(3001234567, '57').telefono, '573001234567', 'número leído como Number');
});

test('marca como inválidos fijos, números cortos y datos dañados por Excel', () => {
  assert.equal(g.normalizarTelefono_('6041234567', '57').valido, false); // fijo de Medellín
  assert.equal(g.normalizarTelefono_('12345', '57').valido, false);
  assert.equal(g.normalizarTelefono_('5.73001E+11', '57').valido, false);
  assert.equal(g.normalizarTelefono_('', '57').valido, false);
});

test('acepta números de otros países si traen indicativo', () => {
  const r = g.normalizarTelefono_('+52 1 55 1234 5678', '57');
  assert.equal(r.telefono, '5215512345678');
  assert.equal(r.valido, true);
});

test('festivos de Colombia 2026 (Ley Emiliani + Semana Santa)', () => {
  const esperados = ['2026-01-01', '2026-01-12', '2026-03-23', '2026-04-02', '2026-04-03', '2026-05-01', '2026-05-18',
    '2026-06-08', '2026-06-15', '2026-06-29', '2026-07-20', '2026-08-07', '2026-08-17', '2026-10-12', '2026-11-02',
    '2026-11-16', '2026-12-08', '2026-12-25'];
  assert.deepEqual(Object.keys(g.festivosColombia_(2026)).sort(), esperados);
});

test('festivos 2025 incluyen el doble festivo del 30 de junio', () => {
  const f = g.festivosColombia_(2025);
  ['2025-01-06', '2025-03-24', '2025-04-17', '2025-04-18', '2025-06-02', '2025-06-23', '2025-06-30', '2025-08-18', '2025-10-13', '2025-11-03', '2025-11-17']
    .forEach((d) => assert.ok(f[d], d));
  assert.equal(Object.keys(f).length, 17); // 18 festivos, dos caen el mismo día
});

test('lee horarios escritos de varias formas', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(g.parseHorario_('09:00-12:00, 14:00-18:00'))), [[540, 720], [840, 1080]]);
  assert.deepEqual(JSON.parse(JSON.stringify(g.parseHorario_('9-12 y 2pm-6pm'))), [[540, 720], [840, 1080]]);
  assert.deepEqual(JSON.parse(JSON.stringify(g.parseHorario_('14:30 - 16:00'))), [[870, 960]]);
  assert.equal(g.parseHorario_('').length, 0);
  assert.equal(g.parseHorario_('cerrado').length, 0);
});

test('formatea fechas y horas en español', () => {
  const d = new Date('2026-11-23T14:30:00-05:00');
  assert.equal(g.formatearHora_(d, OFF), '2:30\u00a0p.\u00a0m.');
  assert.equal(g.formatearHora_(new Date('2026-11-23T12:00:00-05:00'), OFF), '12:00\u00a0p.\u00a0m.');
  assert.equal(g.formatearHora_(new Date('2026-11-23T09:05:00-05:00'), OFF), '9:05\u00a0a.\u00a0m.');
  assert.equal(g.formatearDia_(d, OFF), 'lunes 23 de noviembre');
  assert.equal(g.formatearDiaCorto_(d, OFF), 'lun 23 nov');
  assert.equal(g.isoConOffset_(d, OFF), '2026-11-23T14:30:00-05:00');
});

const HORARIO = { 0: [], 1: [[540, 720]], 2: [[540, 720]], 3: [[540, 720]], 4: [[540, 720]], 5: [[540, 720]], 6: [] };
const base = (extra) => Object.assign({
  ahora: new Date('2026-11-20T10:00:00-05:00'), // viernes
  offMin: OFF, horario: HORARIO, duracionMin: 30, pasoMin: 30, anticipacionMin: 180, dias: 7, cupos: 1,
  reservas: [], bloqueos: [], festivos: {}, fechasBloqueadas: [],
}, extra);

test('calcula horarios: respeta anticipación, fines de semana y duración', () => {
  const dias = g.calcularHorarios_(base());
  assert.equal(dias[0].fecha, '2026-11-23'); // viernes ya pasó (anticipación 3 h), sábado y domingo sin horario
  assert.equal(dias[0].horarios.length, 6); // 9:00 a 11:30
  assert.equal(dias[0].horarios[0].inicio, '2026-11-23T09:00:00-05:00');
  assert.equal(dias[0].horarios[5].etiqueta, '11:30\u00a0a.\u00a0m.');
  assert.equal(dias[0].etiqueta, 'lun 23 nov');
});

test('calcula horarios: quita reservas llenas, bloqueos, festivos y fechas bloqueadas', () => {
  const ms = (iso) => new Date(iso).getTime();
  const dias = g.calcularHorarios_(base({
    reservas: [{ inicio: ms('2026-11-23T09:00:00-05:00'), fin: ms('2026-11-23T09:30:00-05:00') }],
    bloqueos: [{ inicio: ms('2026-11-23T10:00:00-05:00'), fin: ms('2026-11-23T11:00:00-05:00') }],
    festivos: { '2026-11-24': true },
    fechasBloqueadas: ['2026-11-25'],
  }));
  assert.deepEqual(Array.from(dias[0].horarios, (h) => h.etiqueta), ['9:30\u00a0a.\u00a0m.', '11:00\u00a0a.\u00a0m.', '11:30\u00a0a.\u00a0m.']);
  assert.deepEqual(Array.from(dias, (d) => d.fecha), ['2026-11-23', '2026-11-26']);
});

test('calcula horarios: con 2 cupos una reserva no llena el horario', () => {
  const ms = (iso) => new Date(iso).getTime();
  const dias = g.calcularHorarios_(base({ cupos: 2, reservas: [{ inicio: ms('2026-11-23T09:00:00-05:00'), fin: ms('2026-11-23T09:30:00-05:00') }] }));
  assert.equal(dias[0].horarios[0].etiqueta, '9:00\u00a0a.\u00a0m.');
});

test('rellena las plantillas y deja visibles las variables mal escritas', () => {
  const t = g.renderPlantilla_('Hola {primer_nombre}, agenda aquí: {link} {Remitente} {meet} {nombr}', { primer_nombre: 'Ana', link: 'https://x/y?id=1', remitente: 'David', meet: '' });
  assert.equal(t, 'Hola Ana, agenda aquí: https://x/y?id=1 David  {nombr}');
});

test('limpia nombres en mayúsculas o minúsculas', () => {
  assert.equal(g.limpiarNombre_('MARIA JOSÉ  PÉREZ'), 'Maria José Pérez');
  assert.equal(g.limpiarNombre_('juan david'), 'Juan David');
  assert.equal(g.limpiarNombre_('Ana de la Cruz'), 'Ana de la Cruz');
  assert.equal(g.primerNombre_('maría josé'), 'María');
});

test('detecta columnas de un export de Meta Lead Ads', () => {
  const enc = ['id', 'created_time', 'ad_id', 'ad_name', 'adset_id', 'adset_name', 'campaign_id', 'campaign_name', 'form_id', 'form_name',
    'is_organic', 'platform', '¿qué_programa_te_interesa?', 'full_name', 'phone_number', 'email', 'city'];
  const m = g.mapearEncabezados_(enc);
  assert.equal(enc[m.nombre], 'full_name');
  assert.equal(enc[m.telefono], 'phone_number');
  assert.equal(enc[m.correo], 'email');
  assert.equal(enc[m.origen], 'campaign_name');
  assert.deepEqual(Array.from(m.extra).map((i) => enc[i]), ['created_time', '¿qué_programa_te_interesa?', 'city']);
});

test('detecta columnas de un Google Form y no confunde la cédula con el teléfono', () => {
  const enc = ['Marca temporal', 'Nombre completo', 'Número de documento', 'Número de celular (WhatsApp)', 'Correo electrónico', 'Universidad'];
  const m = g.mapearEncabezados_(enc);
  assert.equal(enc[m.nombre], 'Nombre completo');
  assert.equal(enc[m.telefono], 'Número de celular (WhatsApp)');
  assert.equal(enc[m.correo], 'Correo electrónico');
  assert.equal(m.origen, -1);
});

test('une nombre y apellido cuando vienen separados', () => {
  const m = g.mapearEncabezados_(['first_name', 'last_name', 'phone']);
  assert.equal(m.nombre, 0);
  assert.equal(m.apellido, 1);
  assert.equal(m.telefono, 2);
});

test('días mínimos de anticipación: un jueves con 2 días solo deja agendar desde el sábado', () => {
  const H = { 0: [], 1: [[540, 600]], 2: [[540, 600]], 3: [[540, 600]], 4: [[540, 600]], 5: [[540, 600]], 6: [[540, 600]] };
  const dias = g.calcularHorarios_(base({ ahora: new Date('2026-11-26T08:00:00-05:00'), horario: H, anticipacionMin: 0, diasMin: 2, dias: 3 }));
  assert.deepEqual(Array.from(dias, (d) => d.fecha), ['2026-11-28', '2026-11-30']);
});

test('sesiones con inscritos se marcan como recomendadas', () => {
  const ms = (iso) => new Date(iso).getTime();
  const ses = [{ dow: 3, inicioMin: 900, duracion: 60, anfitrion: 'Ana', cupos: 15 }, { dow: 3, inicioMin: 1080, duracion: 60, anfitrion: 'Leidy', cupos: 15 }];
  const dias = g.calcularHorarios_(base({ sesiones: ses, anticipacionMin: 0, reservas: [{ inicio: ms('2026-11-25T15:00:00-05:00'), fin: ms('2026-11-25T16:00:00-05:00') }] }));
  const mie = dias.find((d) => d.fecha === '2026-11-25');
  assert.deepEqual(Array.from(mie.horarios, (h) => h.recomendado), [true, false]);
  assert.equal(mie.recomendado, true);
});
