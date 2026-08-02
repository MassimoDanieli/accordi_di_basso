import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const version = pkg.version;
const files = ['app.html', 'index.html', 'index.en.html'];

for (const name of files) {
  const path = join(root, name);
  let html = readFileSync(path, 'utf8');
  html = html
    .replace(/data-versione="[0-9.]+"/g, `data-versione="${version}"`)
    .replace(/assets\/styles\.css\?v=[0-9.]+/g, `assets/styles.css?v=${version}`)
    .replace(/assets\/app\.bundle\.js\?v=[0-9.]+/g, `assets/app.bundle.js?v=${version}`)
    .replace(/<span class="ver">v[0-9.]+<\/span>/g, `<span class="ver">v${version}</span>`);
  writeFileSync(path, html);
}

execFileSync(process.execPath, [join(root, 'tools', 'build.js')], {
  cwd: root,
  stdio: 'inherit'
});

console.log(`Release ${version} sincronizzata e costruita.`);
