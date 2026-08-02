import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
for (const filename of ['index.html', 'app.html', 'index.en.html']) {
  const path = join(root, filename);
  let html = readFileSync(path, 'utf8');
  html = html
    .replace(/data-versione="[^"]+"/g, `data-versione="${version}"`)
    .replace(/assets\/styles\.css\?v=[^"']+/g, `assets/styles.css?v=${version}`)
    .replace(/assets\/app\.bundle\.js\?v=[^"']+/g, `assets/app.bundle.js?v=${version}`);
  writeFileSync(path, html);
}
execFileSync(process.execPath, [join(root, 'tools', 'build.js')], { cwd: root, stdio: 'inherit' });
console.log(`Release ${version} built.`);
