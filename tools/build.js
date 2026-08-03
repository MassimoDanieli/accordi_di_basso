import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const scripts = ['core', 'storage', 'transcriber', 'defaults', 'app']
  .map(name => readFileSync(join(root, 'src', `${name}.js`), 'utf8'));
const bundle = scripts.join('\n\n');
writeFileSync(join(root, 'assets', 'app.bundle.js'), bundle);

function replaceOnce(source, pattern, replacement, label) {
  let count = 0;
  const result = source.replace(pattern, (...args) => {
    count += 1;
    return typeof replacement === 'function' ? replacement(...args) : replacement;
  });
  if (count !== 1) throw new Error(`${label}: expected one match, found ${count}`);
  return result;
}

const css = readFileSync(join(root, 'assets', 'styles.css'), 'utf8');
let html = readFileSync(join(root, 'index.html'), 'utf8');
html = replaceOnce(html,
  /<link rel="stylesheet" href="assets\/styles\.css(?:\?v=[^"]+)?">/,
  `<style>\n${css}\n</style>`, 'stylesheet');
html = replaceOnce(html,
  /<script src="assets\/app\.bundle\.js(?:\?v=[^"]+)?"><\/script>/,
  `<script>\n${bundle}\n</script>`, 'application bundle');
mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist', 'manico.html'), html);
console.log(`assets/app.bundle.js: ${(bundle.length / 1024).toFixed(0)} kB`);
console.log(`dist/manico.html: ${(html.length / 1024).toFixed(0)} kB`);
