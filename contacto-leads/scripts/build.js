#!/usr/bin/env node
/**
 * Une src/*.js en dist/Codigo.gs y copia las páginas HTML y el manifiesto.
 * Así, para instalar sin herramientas, basta con copiar 4 archivos al editor de Apps Script.
 *   node scripts/build.js          → genera dist/
 *   node scripts/build.js --check  → falla si dist/ no está al día con src/
 */
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const src = path.join(raiz, 'src');
const dist = path.join(raiz, 'dist');

function construir() {
  const archivos = fs.readdirSync(src).filter((f) => f.endsWith('.js')).sort();
  const partes = archivos.map((f) => `// ==================== ${f} ====================\n` + fs.readFileSync(path.join(src, f), 'utf8').trimEnd() + '\n');
  const salida = {
    'Codigo.gs': '// Archivo generado con "npm run build" a partir de src/. No lo edites a mano.\n\n' + partes.join('\n'),
    'Agendar.html': fs.readFileSync(path.join(src, 'Agendar.html'), 'utf8'),
    'Panel.html': fs.readFileSync(path.join(src, 'Panel.html'), 'utf8'),
    'appsscript.json': fs.readFileSync(path.join(src, 'appsscript.json'), 'utf8'),
  };
  return salida;
}

const salida = construir();
if (process.argv.includes('--check')) {
  const desactualizados = Object.keys(salida).filter((f) => {
    const p = path.join(dist, f);
    return !fs.existsSync(p) || fs.readFileSync(p, 'utf8') !== salida[f];
  });
  if (desactualizados.length) {
    console.error('dist/ está desactualizado: ' + desactualizados.join(', ') + '. Corre: npm run build');
    process.exit(1);
  }
  console.log('dist/ está al día.');
} else {
  fs.mkdirSync(dist, { recursive: true });
  Object.keys(salida).forEach((f) => fs.writeFileSync(path.join(dist, f), salida[f]));
  console.log('Generado dist/: ' + Object.keys(salida).join(', '));
}
