// Builds the optional bass-separation engine into assets/separator/ (not committed: ~210 MB).
//   node tools/build-separator.js
// It fetches pinned packages from npm: the Demucs port with its weights, ONNX Runtime Web and
// esbuild; bundles separator/worker.js; and copies the runtime and the model beside it.
// Without that folder Manico works as before and simply does not offer the separation.
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const work = join(root, '.separator');
const out = join(root, 'assets', 'separator');
const DEMUCS = '1.0.0';
const packages = {
  'onnxruntime-web': '1.23.0',
  mediabunny: '1.61.3',
  '@mediabunny/mp3-encoder': '1.61.3',
  esbuild: '0.25.10'
};
const run = (command, args, cwd = work) => execFileSync(command, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });

mkdirSync(work, { recursive: true });
writeFileSync(join(work, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: packages }, null, 2));
run('npm', ['install', '--no-audit', '--no-fund', '--ignore-scripts']);

// The Demucs port is unpacked by hand, outside node_modules: installing it would also pull the
// Node runtime, which is not needed here.
const demucs = join(work, 'demucs');
if (!existsSync(join(demucs, 'htdemucs.onnx'))) {
  run('npm', ['pack', `demucs@${DEMUCS}`, '--silent']);
  rmSync(demucs, { recursive: true, force: true });
  mkdirSync(demucs, { recursive: true });
  run('tar', ['-xzf', `demucs-${DEMUCS}.tgz`, '-C', demucs, '--strip-components=1']);
  rmSync(join(work, `demucs-${DEMUCS}.tgz`));
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
run(join(work, 'node_modules', '.bin', 'esbuild'), [
  join(root, 'separator', 'worker.js'), '--bundle', '--format=iife', '--minify',
  '--alias:onnxruntime-node=onnxruntime-web', `--alias:demucs=${demucs}`, `--outfile=${join(out, 'worker.js')}`, '--log-level=warning'
], work);
const runtime = join(work, 'node_modules', 'onnxruntime-web', 'dist');
for (const name of readdirSync(runtime)) {
  if (/^ort-wasm-simd-threaded\.jsep\.(mjs|wasm)$/.test(name)) cpSync(join(runtime, name), join(out, name));
}
cpSync(join(demucs, 'htdemucs.onnx'), join(out, 'htdemucs.onnx'));
cpSync(join(demucs, 'LICENSE.md'), join(out, 'DEMUCS-LICENSE.md'));

let total = 0;
for (const name of readdirSync(out)) total += statSync(join(out, name)).size;
console.log(`assets/separator: ${readdirSync(out).length} files, ${(total / 1048576).toFixed(0)} MB`);
