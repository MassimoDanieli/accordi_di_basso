// Costruisce assets/app.bundle.js e dist/manico.html.
// Il file in dist e' autonomo: CSS, motore principale e importatore MP3 sono
// incorporati, quindi non dipende da file locali accanto alla pagina.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// L'ordine conta: un modulo deve comparire prima di chi lo importa.
const MODULES = ['theory', 'voicings', 'audio', 'render', 'tab', 'forma', 'ireal', 'musicxml', 'testo', 'canzoniere', 'library', 'theme', 'i18n', 'app'];

const IMPORT_NAMED = /^import\s*\{([^}]+)\}\s*from\s*['"]\.\/(\w+)\.js['"];?\s*$/gm;
const IMPORT_STAR = /^import\s*\*\s*as\s*(\w+)\s*from\s*['"]\.\/(\w+)\.js['"];?\s*$/gm;

/** Trasforma un modulo ES in una funzione anonima che restituisce i suoi export. */
function wrap(name) {
  let src = readFileSync(join(root, 'src', `${name}.js`), 'utf8');
  const prelude = [];

  src = src.replace(IMPORT_STAR, (_, alias, from) => {
    prelude.push(`  const ${alias} = __mod.${from};`);
    return '';
  });
  src = src.replace(IMPORT_NAMED, (_, names, from) => {
    const clean = names.split(',').map(s => s.trim()).filter(Boolean).join(', ');
    prelude.push(`  const { ${clean} } = __mod.${from};`);
    return '';
  });

  const exported = [];
  src = src.replace(/^export\s+(async\s+function|const|let|function|class)\s+(\w+)/gm, (_, kind, id) => {
    exported.push(id);
    return `${kind} ${id}`;
  });

  const body = src.split('\n').map(line => (line ? `  ${line}` : line)).join('\n');
  return `__mod.${name} = (function () {\n${prelude.join('\n')}\n${body}\n`
    + `  return { ${exported.join(', ')} };\n})();`;
}

const bundle = ['(function () {', '"use strict";', 'const __mod = {};']
  .concat(MODULES.map(wrap))
  .concat(['})();'])
  .join('\n\n');

// Il sito carica questo bundle, non i singoli moduli del motore principale.
writeFileSync(join(root, 'assets', 'app.bundle.js'), bundle);

const css = readFileSync(join(root, 'assets', 'styles.css'), 'utf8');
const audioUi = readFileSync(join(root, 'src', 'audio-import-ui.js'), 'utf8');
const audioTranscriber = readFileSync(join(root, 'src', 'audio-transcriber.js'), 'utf8');
let audioImportPage = readFileSync(join(root, 'audio-import.html'), 'utf8')
  .replace(/<script src="src\/audio-transcriber\.js[^"]*"><\/script>/,
    `<script>\n${audioTranscriber}\n<\/script>`);

// Una stringa dentro <script> non deve contenere una chiusura script letterale.
const audioImportLiteral = JSON.stringify(audioImportPage).replace(/<\/script/gi, '<\\/script');
const standaloneAudio = `<script>\nwindow.MANICO_AUDIO_IMPORT_SRCDOC = ${audioImportLiteral};\n<\/script>\n`
  + `<script>\n${audioUi}\n<\/script>`;

let html = readFileSync(join(root, 'app.html'), 'utf8')
  .replace(/<link rel="stylesheet" href="assets\/styles\.css[^"]*">/, `<style>\n${css}\n</style>`)
  .replace(/<script src="src\/audio-import-ui\.js[^"]*"><\/script>/, standaloneAudio)
  .replace(/<script src="assets\/app\.bundle\.js[^"]*"><\/script>/, `<script>\n${bundle}\n<\/script>`)
  // Nel file unico la guida non e' accanto: si punta al sito.
  .replace(/href="index\.html"/g, 'href="https://basso.massimodanieli.com/"')
  // Il backtick e' escluso: altrimenti si mangia la chiusura dei template literal.
  .replace(/\?v=[^"'`<>\s]+/g, '');

mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist', 'manico.html'), html);

console.log(`assets/app.bundle.js scritto, ${(bundle.length / 1024).toFixed(0)} kB`);
console.log(`dist/manico.html scritto, ${(html.length / 1024).toFixed(0)} kB`);
