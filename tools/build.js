// Costruisce dist/manico.html: un unico file autonomo, con il CSS e tutti i moduli
// incorporati. Serve per aprire il tool con un doppio clic, senza server, e per
// distribuirlo come allegato singolo. I sorgenti restano quelli in src/.
//
//   node tools/build.js

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// L'ordine conta: un modulo deve comparire prima di chi lo importa.
const MODULES = ['theory', 'voicings', 'audio', 'render', 'tab', 'ireal', 'library', 'theme', 'app'];

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
  src = src.replace(/^export\s+(const|let|function|class)\s+(\w+)/gm, (_, kind, id) => {
    exported.push(id);
    return `${kind} ${id}`;
  });

  const body = src.split('\n').map(l => (l ? '  ' + l : l)).join('\n');
  return `__mod.${name} = (function () {\n${prelude.join('\n')}\n${body}\n`
    + `  return { ${exported.join(', ')} };\n})();`;
}

const bundle = ['(function () {', '"use strict";', 'const __mod = {};']
  .concat(MODULES.map(wrap))
  .concat(['})();'])
  .join('\n\n');

const css = readFileSync(join(root, 'assets', 'styles.css'), 'utf8');

let html = readFileSync(join(root, 'app.html'), 'utf8')
  .replace(/<link rel="stylesheet" href="assets\/styles\.css[^"]*">/, `<style>\n${css}\n</style>`)
  .replace(/<script type="module" src="src\/app\.js[^"]*"><\/script>/, `<script>\n${bundle}\n</script>`)
  // Nel file unico la guida non e' accanto: si punta al sito.
  .replace(/href="index\.html"/g, 'href="https://basso.massimodanieli.com/"')
  .replace(/\?v=[0-9.]+/g, '');

mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist', 'manico.html'), html);

console.log(`dist/manico.html scritto, ${(html.length / 1024).toFixed(0)} kB`);
