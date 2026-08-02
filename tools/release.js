import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const version = pkg.version;
const htmlFiles = ['app.html', 'index.html', 'index.en.html', 'audio-import.html'];
const publicAssets = [
  'assets/styles.css',
  'assets/app.bundle.js',
  'src/audio-import-ui.js',
  'src/audio-transcriber.js',
  'src/theme.js'
];
const assetPattern = new RegExp(`(${publicAssets.map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\?v=[^"'<>\\s]+`, 'g');

for (const name of htmlFiles) {
  const path = join(root, name);
  let html = readFileSync(path, 'utf8');

  if (/data-versione="[^"]*"/.test(html)) {
    html = html.replace(/data-versione="[^"]*"/g, `data-versione="${version}"`);
  } else {
    html = html.replace(/<html([^>]*)>/, `<html$1 data-versione="${version}">`);
  }

  html = html
    .replace(assetPattern, (_, asset) => `${asset}?v=${version}`)
    .replace(/<span class="ver">v[^<]+<\/span>/g, `<span class="ver">v${version}</span>`);

  writeFileSync(path, html);
}

execFileSync(process.execPath, [join(root, 'tools', 'build.js')], {
  cwd: root,
  stdio: 'inherit'
});

console.log(`Release ${version} sincronizzata e costruita.`);
