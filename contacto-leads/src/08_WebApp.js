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
