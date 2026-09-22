/**
 * shoot-baseline.mjs — capture the reference rendering of the four families
 * BEFORE they are merged into a single one.
 *
 * This is the only proof that the rebuilt kit still looks like what it
 * replaces, and it is irrecoverable: once families/ is deleted, the images
 * cannot be retaken. Run it before the first line of the migration, and
 * again after, into a second directory, then compare.
 *
 *   node scripts/shoot-baseline.mjs                     # -> .shots/baseline/
 *   node scripts/shoot-baseline.mjs --out .shots/after  # the comparison run
 *   UU_URL=http://localhost:5173 node scripts/shoot-baseline.mjs
 *
 * Matrix, chosen to spend shots where the risk is:
 *   - the theme page, for all 19 themes we keep   -> colour work
 *   - every component page, for one light and one dark theme per ex-family
 *     -> decoration work, which is the part being rewritten
 *
 * Output: <out>/<family>-<theme>--<page>.png (git-ignored). System Edge, so
 * no browser download.
 */

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = process.env.UU_URL ?? 'http://localhost:5173';

/* The theme page moved from /components/... nothing; `/` IS the generator. */

const argv = process.argv.slice(2);
const outArg = argv.indexOf('--out');
const outDir = join(root, outArg === -1 ? '.shots/baseline' : argv[outArg + 1]);

/* The 19 themes that survive the merge. Everything else is a colour variant
   of one of these and proves nothing the theme page does not already show. */
const KEEP = {
	daisy: [
		'light', 'dark', 'bumblebee', 'retro', 'halloween', 'forest', 'lofi',
		'autumn', 'business', 'night', 'nord', 'coffee', 'caramellatte'
	],
	dahlia: ['light', 'jade'],
	cosmos: ['paper', 'slate'],
	sunflower: ['light', 'mint']
};

/* One light and one dark per ex-family get the full component sweep.
   sunflower is light-only by design, so it contributes two light readings. */
const DEEP = [
	['daisy', 'light'], ['daisy', 'night'],
	['dahlia', 'light'], ['dahlia', 'jade'],
	['cosmos', 'paper'], ['cosmos', 'slate'],
	['sunflower', 'light'], ['sunflower', 'mint']
];

const PAGES = [
	'button', 'input', 'select', 'textarea', 'checkbox', 'radio', 'toggle',
	'range', 'file-input', 'fieldset', 'label', 'floating-label', 'chip',
	'badge', 'tabs', 'loading', 'progress', 'radial-progress', 'skeleton',
	'list', 'text', 'link', 'swatch', 'breadcrumbs', 'menu', 'navbar',
	'dock', 'join', 'validator'
];

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1500, height: 1400 } });

let shots = 0;

/** Pick a theme. One select now: the family picker is gone (ADR 0010). */
async function pick(family, theme) {
	const selects = await page.$$('.side-select select');
	await selects[selects.length - 1].selectOption(`${family}-${theme}`);
	await page.waitForTimeout(400);
}

/* .shell is 100dvh/overflow:hidden and .content is the real scroller, so
   Playwright's fullPage — which only extends the document scroll — captures
   the first viewport and nothing else. Release both, once per load. */
async function unclip() {
	await page.addStyleTag({
		content:
			'.shell,.content,.side{height:auto!important;max-height:none!important;overflow:visible!important}'
	});
}

async function snap(family, theme, slug) {
	await page.screenshot({ path: join(outDir, `${family}-${theme}--${slug}.png`), fullPage: true });
	shots += 1;
	console.log(`${shots} ${family}/${theme} ${slug}`);
}

/* The playground store is module state with no persistence, so a full page
   load resets family and theme. Pick once, then navigate client-side. */
async function visit(family, theme, pages) {
	await page.goto(base, { waitUntil: 'networkidle' });
	await pick(family, theme);
	await unclip();
	await snap(family, theme, 'theme');

	for (const id of pages) {
		await page.click(`.side-nav a[href="/components/${id}"]`);
		await page.waitForURL(`**/components/${id}`);
		await page.waitForTimeout(250);
		await snap(family, theme, id);
	}
}

const deep = new Set(DEEP.map(([f, t]) => `${f}/${t}`));

for (const [family, themes] of Object.entries(KEEP)) {
	for (const theme of themes) {
		await visit(family, theme, deep.has(`${family}/${theme}`) ? PAGES : []);
	}
}

await browser.close();
console.log(`
${shots} shots -> ${outDir}`);
