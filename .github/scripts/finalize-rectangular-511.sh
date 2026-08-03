#!/usr/bin/env bash
set -euo pipefail

python3 - <<'PY'
from pathlib import Path

app_path = Path('src/app.js')
app = app_path.read_text(encoding='utf-8')

old_show = """  function show(view) {
    $('homeView').hidden = view !== 'home';
    $('studioView').hidden = view !== 'studio';
  }
"""
new_show = """  function show(view) {
    $('homeView').hidden = view !== 'home';
    $('studioView').hidden = view !== 'studio';
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
  }
"""
if old_show not in app:
    raise SystemExit('show(view) block not found')
app = app.replace(old_show, new_show, 1)

old_scroll = """    requestAnimationFrame(() => box.querySelector('.current')?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }));
"""
new_scroll = """    requestAnimationFrame(() => {
      const current = box.querySelector('.current');
      if (!current) return;
      const left = current.offsetLeft - (box.clientWidth - current.offsetWidth) / 2;
      box.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
    });
"""
if old_scroll not in app:
    raise SystemExit('timeline scroll line not found')
app = app.replace(old_scroll, new_scroll, 1)
app_path.write_text(app, encoding='utf-8')

css_path = Path('assets/styles.css')
css = css_path.read_text(encoding='utf-8')
marker = '/* Manico 5.1.1 rectangular fretboard polish */'
if marker in css:
    raise SystemExit('polish block already present unexpectedly')
css += '''

/* Manico 5.1.1 rectangular fretboard polish */
.studio-grid{align-items:start}
.board-area{min-height:0;padding:14px;align-items:flex-start;overflow:hidden}
.instrument-stage{padding:12px 10px 8px}
.string-label{font-size:22px}
.fret-number{font-size:17px}
@media(max-width:760px){
  .board-area{min-height:0;padding:8px 0;overflow-x:auto;overflow-y:hidden;justify-content:flex-start;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch}
  .instrument-stage{width:960px;min-width:960px;padding:10px 8px 6px;border-left:0;border-right:0;border-radius:0}
  #fretboard{width:940px;min-width:940px;max-height:none}
}
'''
css_path.write_text(css, encoding='utf-8')
PY

npm test
npm run release
npm run check:release
git diff --check
docker build --tag manico-rectangular-511 .

npm install --prefix /tmp/manico-visual --no-save --package-lock=false --ignore-scripts playwright-core@1.55.0
python3 -m http.server 8080 > /tmp/manico-http.log 2>&1 &
for attempt in $(seq 1 30); do
  if curl --fail --silent http://127.0.0.1:8080/ > /dev/null; then
    break
  fi
  if [ "$attempt" -eq 30 ]; then
    cat /tmp/manico-http.log
    exit 1
  fi
  sleep 1
done

cat > /tmp/capture.mjs <<'JS'
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('/tmp/manico-visual/node_modules/playwright-core');

const executablePath = [
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium'
].find(path => fs.existsSync(path));
if (!executablePath) throw new Error('Chrome executable not found');

const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:8080/', { waitUntil: 'networkidle' });
await page.locator('#demoList .icon-button').first().click();
await page.locator('#fretboard').waitFor({ state: 'visible' });
await page.waitForTimeout(350);

const desktop = await page.evaluate(() => {
  const stage = document.querySelector('.instrument-stage').getBoundingClientRect();
  const svg = document.querySelector('#fretboard');
  return {
    scrollY: window.scrollY,
    width: stage.width,
    height: stage.height,
    markup: svg.innerHTML,
    current: document.querySelector('#nowNote')?.textContent || ''
  };
});
if (desktop.scrollY > 4) throw new Error(`Desktop opened at vertical scroll ${desktop.scrollY}`);
if (desktop.width < 780) throw new Error(`Desktop fretboard too narrow: ${desktop.width}`);
if (desktop.height < 250 || desktop.height > 470) throw new Error(`Desktop fretboard height is unbalanced: ${desktop.height}`);
if (/headWood|pegY|pegX/.test(desktop.markup)) throw new Error('Decorative headstock elements are still present');
if (!desktop.current) throw new Error('Current note is not rendered');
await page.screenshot({ path: 'visual-review-desktop.png' });
await page.locator('.instrument-stage').screenshot({ path: 'visual-review-fretboard.png' });

await page.setViewportSize({ width: 390, height: 844 });
await page.reload({ waitUntil: 'networkidle' });
await page.locator('#demoList .icon-button').first().click();
await page.locator('#fretboard').waitFor({ state: 'visible' });
await page.waitForTimeout(350);

const mobile = await page.evaluate(() => {
  const area = document.querySelector('.board-area');
  area.scrollLeft = 320;
  return {
    scrollY: window.scrollY,
    clientWidth: area.clientWidth,
    scrollWidth: area.scrollWidth,
    after: area.scrollLeft
  };
});
if (mobile.scrollY > 4) throw new Error(`Mobile opened at vertical scroll ${mobile.scrollY}`);
if (mobile.scrollWidth <= mobile.clientWidth * 1.8) throw new Error(`Mobile fretboard is still compressed: ${mobile.scrollWidth}/${mobile.clientWidth}`);
if (mobile.after < 150) throw new Error('Mobile fretboard cannot be scrolled horizontally');
await page.screenshot({ path: 'visual-review-mobile.png' });
await browser.close();
JS
node /tmp/capture.mjs
