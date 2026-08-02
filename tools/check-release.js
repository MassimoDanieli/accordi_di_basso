import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const version = pkg.version;
const errors = [];
const read = name => readFileSync(join(root, name), 'utf8');

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function expectScript(source, name) {
  try {
    new Script(source, { filename: name });
  } catch (error) {
    errors.push(`${name}: JavaScript non valido (${error.message})`);
  }
}

for (const name of ['app.html', 'index.html', 'index.en.html', 'audio-import.html']) {
  const html = read(name);
  expect(html.includes(`data-versione="${version}"`), `${name}: data-versione non e' ${version}`);

  for (const match of html.matchAll(/\?v=([^"'<>\s]+)/g)) {
    expect(match[1] === version, `${name}: cache token ${match[1]} invece di ${version}`);
  }

  const visible = html.match(/<span class="ver">v([^<]+)<\/span>/);
  if (visible) expect(visible[1] === version, `${name}: versione visibile ${visible[1]} invece di ${version}`);
}

const audioUi = read('src/audio-import-ui.js');
expect(!/const ASSET_VERSION\s*=\s*['"][^'"]+['"]/.test(audioUi),
  'src/audio-import-ui.js: ASSET_VERSION non deve essere fissata a mano');
expectScript(audioUi, 'src/audio-import-ui.js');
expectScript(read('src/audio-transcriber.js'), 'src/audio-transcriber.js');
expectScript(read('assets/app.bundle.js'), 'assets/app.bundle.js');

for (const name of ['assets/app.bundle.js', 'dist/manico.html']) {
  const path = join(root, name);
  expect(existsSync(path), `${name}: artefatto mancante`);
  if (existsSync(path)) expect(statSync(path).size > 1000, `${name}: artefatto vuoto o incompleto`);
}

if (existsSync(join(root, 'dist/manico.html'))) {
  const standalone = read('dist/manico.html');
  expect(standalone.includes(`data-versione="${version}"`),
    `dist/manico.html: data-versione non e' ${version}`);
  expect(!/<script[^>]+src="(?:assets|src)\//.test(standalone),
    'dist/manico.html: contiene ancora script locali esterni');
  expect(!/<link[^>]+href="assets\//.test(standalone),
    'dist/manico.html: contiene ancora CSS locale esterno');

  const scripts = [...standalone.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
  expect(scripts.length >= 3, 'dist/manico.html: script incorporati mancanti');
  scripts.forEach((match, index) => expectScript(match[1], `dist/manico.html#script-${index + 1}`));
}

if (errors.length) {
  console.error('Release incoerente:');
  errors.forEach(error => console.error(`  - ${error}`));
  process.exit(1);
}

console.log(`Release ${version} coerente.`);
