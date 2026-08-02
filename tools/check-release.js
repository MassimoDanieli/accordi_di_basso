import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
const errors = [];
const read = filename => readFileSync(join(root, filename), 'utf8');
const expect = (condition, message) => { if (!condition) errors.push(message); };
const validScript = (source, name) => {
  try { new Script(source, { filename: name }); }
  catch (error) { errors.push(`${name}: invalid JavaScript (${error.message})`); }
};

for (const filename of ['index.html', 'app.html', 'index.en.html']) {
  const html = read(filename);
  expect(html.includes(`data-versione="${version}"`), `${filename}: version is not ${version}`);
  for (const match of html.matchAll(/\?v=([^"'<>\s]+)/g)) {
    expect(match[1] === version, `${filename}: cache token ${match[1]} instead of ${version}`);
  }
}
for (const filename of ['assets/app.bundle.js', 'dist/manico.html']) {
  const path = join(root, filename);
  expect(existsSync(path), `${filename}: missing`);
  if (existsSync(path)) expect(statSync(path).size > 1000, `${filename}: empty`);
}
validScript(read('assets/app.bundle.js'), 'assets/app.bundle.js');
const standalone = read('dist/manico.html');
expect(standalone.includes(`data-versione="${version}"`), 'dist/manico.html: stale version');
expect(!/<script[^>]+src="(?:assets|src)\//.test(standalone), 'dist/manico.html: external local script remains');
expect(!/<link[^>]+href="assets\//.test(standalone), 'dist/manico.html: external local stylesheet remains');
[...standalone.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .forEach((match, index) => validScript(match[1], `dist/manico.html#script-${index + 1}`));
if (errors.length) {
  console.error('Inconsistent release:');
  errors.forEach(error => console.error(`  - ${error}`));
  process.exit(1);
}
console.log(`Release ${version} is consistent.`);
