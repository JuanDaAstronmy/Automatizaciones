/* =================== Sincronización con la hoja de seguimiento MC ===================
 * Cada hora (y con el menú) copia el avance del panel a la hoja oficial de seguimiento
 * (ej. "[MC] Campaña Nacional Seguimiento" → pestaña "Campaña Recontacto").
 * Seguridad: solo escribe en filas cuyo teléfono coincide con el lead y que están
 * a nombre de quien configura (columna "Recontactado Por"). Nunca borra casillas marcadas.
 */

/** Estado del panel → valor de la lista "STATUS ACTUAL" de la hoja MC. */
const ESTADO_MC = {
  'Contactado': 'Re contactado',
  'Respondió': 'Contestó',
  'Agendado': 'EPM Agendada',
  'Asistió': 'EPM Agendada',
  'No asistió': 'No asistió a EPM',
  'No interesado': 'No interesado',
  'No cumple': 'Contestó',
  'Número inválido': 'No contestó ',
};
/** Estados que el equipo pone a mano más adelante en el proceso: no se sobrescriben. */
const ESTADOS_MC_AVANZADOS = ['aplicante', 'en_entrevista', 'apd', 'redireccionado_a_otro_programa'];

function ultimos10_(v) {
  const d = String(v === null || v === undefined ? '' : v).replace(/\D/g, '');
  return d.length >= 10 ? d.slice(-10) : '';
}

/** Lo que debería decir la hoja MC para un contacto (función pura). */
function valoresMC_(c, offMin) {
  const notas = [];
  if (c.estado === ESTADO.INVALIDO) notas.push('Número inválido / sin WhatsApp');
  if (c.estado === ESTADO.NO_CUMPLE) notas.push('No cumple requisitos');
  if (c.estado === ESTADO.ASISTIO) notas.push('Asistió a la sesión');
  if (c.estado === ESTADO.AGENDADO && c.fechaReunion) {
    notas.push('Sesión: ' + formatearDiaCorto_(c.fechaReunion, offMin) + ' ' + formatearHora_(c.fechaReunion, offMin).replace(/ /g, ' ') + (c.sesion ? ' con ' + c.sesion : ''));
  }
  if (String(c.notas || '').trim()) notas.push(String(c.notas).trim());
  const intentos = c.intentos || 0;
  return {
    whatsapp: intentos >= 1 || (c.estado !== ESTADO.PENDIENTE),
    fup: [intentos >= 2, intentos >= 3, intentos >= 4],
    fecha: c.ultimoContacto ? Utilities.formatDate(c.ultimoContacto, zona_(), 'dd/MM') : '',
    estado: ESTADO_MC[c.estado] || '',
    comentario: notas.join(' · '),
  };
}

function sincronizarMC_() {
  const cfg = getConfig_();
  if (!cfg.MC_URL) return null;
  const ss = SpreadsheetApp.openByUrl(cfg.MC_URL);
  const sh = ss.getSheetByName(cfg.MC_PESTANA || 'Campaña Recontacto');
  if (!sh) throw new Error('No encuentro la pestaña "' + cfg.MC_PESTANA + '" en la hoja MC.');
  const lr = sh.getLastRow(), lc = sh.getLastColumn();
  const vals = sh.getRange(1, 1, lr, lc).getValues();

  // La fila de encabezados es la que tenga "STATUS ACTUAL" (en esa hoja es la 2).
  let h = -1;
  for (let i = 0; i < Math.min(6, vals.length); i++) {
    if (vals[i].some(function (v) { return normalizarTexto_(v) === 'status_actual'; })) { h = i; break; }
  }
  if (h < 0) throw new Error('No encuentro la columna "STATUS ACTUAL" en la hoja MC.');
  const col = {};
  vals[h].forEach(function (v, i) { const n = normalizarTexto_(v); if (n && !(n in col)) col[n] = i; });
  const C = {
    whatsapp: col['contacto_whatsapp'], fup: [col['fup1'], col['fup2'], col['fup3']],
    por: col['recontactado_por'], fecha: col['fecha_de_recontacto'], estado: col['status_actual'], comentario: col['comentario_actual'],
  };

  // Índice: últimos 10 dígitos del teléfono → fila (solo filas a mi nombre, si está configurado).
  const yo = normalizarTexto_(cfg.MC_NOMBRE);
  const indice = {};
  for (let r = h + 1; r < vals.length; r++) {
    if (yo && C.por !== undefined && normalizarTexto_(vals[r][C.por]) !== yo) continue;
    vals[r].forEach(function (v) { const k = ultimos10_(v); if (k && /^[1-9]\d{9}$/.test(k) && !(k in indice)) indice[k] = r; });
  }

  const off = offsetMinutos_(new Date());
  const res = { actualizados: 0, sinCambios: 0, noEncontrados: 0 };
  const poner = function (r, c, valor) {
    if (c === undefined || valor === '' || valor === null) return false;
    const actual = vals[r][c];
    if (String(actual) === String(valor) || (typeof valor === 'boolean' && (actual === valor || String(actual).toUpperCase() === String(valor).toUpperCase()))) return false;
    sh.getRange(r + 1, c + 1).setValue(valor);
    vals[r][c] = valor;
    return true;
  };

  leerContactos_().forEach(function (c) {
    if (c.estado === ESTADO.PENDIENTE && !c.intentos) return;
    const r = indice[ultimos10_(c.telefono)];
    if (r === undefined) { res.noEncontrados++; return; }
    const v = valoresMC_(c, off);
    let cambio = false;
    if (v.whatsapp) cambio = poner(r, C.whatsapp, true) || cambio;
    v.fup.forEach(function (marcar, i) { if (marcar) cambio = poner(r, C.fup[i], true) || cambio; });
    cambio = poner(r, C.fecha, v.fecha) || cambio;
    const estadoActual = normalizarTexto_(vals[r][C.estado]);
    if (ESTADOS_MC_AVANZADOS.indexOf(estadoActual) < 0) cambio = poner(r, C.estado, v.estado) || cambio;
    cambio = poner(r, C.comentario, v.comentario) || cambio;
    if (cambio) res.actualizados++; else res.sinCambios++;
  });
  props_().setProperty('ULTIMA_SINC_MC', String(Date.now()));
  return res;
}
