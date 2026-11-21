/**
 * AIESEC · Correo masivo personalizado (script independiente)
 * ------------------------------------------------------------
 * Se instala en la cuenta de AIESEC desde la que deben salir los correos.
 * Lee los contactos de la hoja "Contactos" del sistema de leads, toma un BORRADOR
 * de Gmail de esta cuenta y se lo envía a cada persona cambiando [Nombre] por su nombre.
 * Marca la columna "Correo enviado" para no repetir.
 *
 * USO: arriba en el editor elige la función y toca "Ejecutar":
 *   1) enviarPrueba        → te llega uno a ti con el nombre "Prueba"
 *   2) enviarALosQueFaltan → envía a todos los pendientes (si se acaba el cupo diario, vuelve a correrla mañana)
 */

// ====================== CONFIGURA AQUÍ ======================
const URL_HOJA = 'PEGA_AQUI_EL_LINK_DE_TU_HOJA_DE_LEADS';
const ASUNTO_BORRADOR = 'voluntariado en el exterior'; // una parte del asunto del borrador
const PROGRAMA = 'GV';            // 'GV', 'GT' o 'TODOS'
const NOMBRE_REMITENTE = 'AIESEC Colombia';
// =============================================================

const PESTANA = 'Contactos';
const ESTADOS_EXCLUIDOS = ['no cumple', 'no interesado'];

function enviarPrueba() {
  const p = plantilla_();
  const yo = Session.getEffectiveUser().getEmail();
  enviar_(yo, p, 'Prueba', 'Prueba Ejemplo');
  console.log('✅ Prueba enviada a ' + yo + '. Revísala antes de enviar a todos.');
}

function enviarALosQueFaltan() {
  const p = plantilla_();
  const sh = SpreadsheetApp.openByUrl(URL_HOJA).getSheetByName(PESTANA);
  if (!sh) throw new Error('No encuentro la pestaña "' + PESTANA + '" en la hoja.');
  const vals = sh.getDataRange().getValues();
  const enc = vals[0].map(function (h) { return String(h).trim(); });
  const col = function (n) { return enc.indexOf(n); };
  const cNombre = col('Nombre'), cCorreo = col('Correo'), cEstado = col('Estado'), cInfo = col('Info del formulario'), cOrigen = col('Origen');
  let cEnviado = col('Correo enviado');
  if (cNombre < 0 || cCorreo < 0) throw new Error('La pestaña Contactos debe tener las columnas "Nombre" y "Correo".');
  if (cEnviado < 0) { cEnviado = enc.length; sh.getRange(1, cEnviado + 1).setValue('Correo enviado').setFontWeight('bold'); }

  let cupo = MailApp.getRemainingDailyQuota() - 2;
  const res = { enviados: 0, pendientes: 0, omitidos: 0, errores: [] };
  const inicio = Date.now();
  for (let r = 1; r < vals.length; r++) {
    const fila = vals[r];
    const correo = String(fila[cCorreo] || '').trim().toLowerCase();
    const nombre = String(fila[cNombre] || '').trim();
    if (!/^[^\s@,;]+@[^\s@,;]+\.[a-z]{2,}$/i.test(correo) || String(fila[cEnviado] || '').trim()) continue;
    const estado = String(cEstado >= 0 ? fila[cEstado] : '').trim().toLowerCase();
    if (ESTADOS_EXCLUIDOS.indexOf(estado) >= 0) { res.omitidos++; continue; }
    const texto = (cInfo >= 0 ? fila[cInfo] : '') + ' ' + (cOrigen >= 0 ? fila[cOrigen] : '');
    const prog = /\bGT\b|talento|profesor/i.test(texto) ? 'GT' : 'GV';
    if (PROGRAMA !== 'TODOS' && prog !== PROGRAMA) continue;
    if (cupo <= 0 || Date.now() - inicio > 270000) { res.pendientes++; continue; }
    try {
      enviar_(correo, p, primerNombre_(nombre), nombre);
      sh.getRange(r + 1, cEnviado + 1).setValue(new Date());
      res.enviados++;
      cupo--;
      Utilities.sleep(400);
    } catch (e) {
      res.errores.push(nombre + ' (' + correo + '): ' + e.message);
    }
  }
  console.log('✅ Enviados: ' + res.enviados + ' · ⏳ Pendientes (cupo de hoy agotado): ' + res.pendientes +
    ' · Omitidos (No cumple / No interesado): ' + res.omitidos + (res.errores.length ? '\n❌ ' + res.errores.join('\n❌ ') : ''));
  return res;
}

function plantilla_() {
  const buscado = normalizar_(ASUNTO_BORRADOR);
  const d = GmailApp.getDrafts().filter(function (x) { return normalizar_(x.getMessage().getSubject()).indexOf(buscado) >= 0; })[0];
  if (!d) throw new Error('No encontré un borrador cuyo asunto contenga "' + ASUNTO_BORRADOR + '" en ' + Session.getEffectiveUser().getEmail());
  const m = d.getMessage();
  return { asunto: m.getSubject(), html: m.getBody(), texto: m.getPlainBody(), adjuntos: m.getAttachments({ includeInlineImages: false }) };
}

function enviar_(para, p, primer, completo) {
  const pon = function (t) {
    return String(t || '').replace(/\[\s*nombre\s*\]/gi, primer).replace(/\{primer_nombre\}/gi, primer).replace(/\{nombre\}/gi, completo);
  };
  // Los emojis "largos" (📈😊🔗🎉) se dañan al enviar desde Apps Script: se convierten a códigos HTML.
  const o = { to: para, subject: pon(p.asunto), body: pon(p.texto), htmlBody: emojisSeguros_(pon(p.html)), name: NOMBRE_REMITENTE };
  if (p.adjuntos.length) o.attachments = p.adjuntos;
  MailApp.sendEmail(o);
}

function emojisSeguros_(html) {
  return String(html).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function (par) {
    return '&#x' + par.codePointAt(0).toString(16).toUpperCase() + ';';
  });
}

function primerNombre_(n) {
  const t = String(n || '').replace(/\s+/g, ' ').trim().split(' ')[0] || '';
  return t ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : '';
}

function normalizar_(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
