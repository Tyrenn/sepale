/**
 * shoot-page.mjs — screenshot one route for every family.
 *
 *   node scripts/shoot-page.mjs /components/bubble [family…]
 *
 * Output: .shots/<route>-<family>.png (git-ignored).
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, '.shots');
const base = process.env.UU_URL ?? 'http://localhost:5204';
const [route = '/', ...wanted] = process.argv.slice(2);
const full = process.env.FULL === '1';
/* SEL=css  shoots each matching element instead of the viewport. */
const sel = process.env.SEL;

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1500, height: 1400 }, deviceScaleFactor: Number(process.env.ZOOM ?? (sel ? 2 : 1)) });
mkdirSync(outDir, { recursive: true });
await page.goto(base + '/' + route.replace(/^[/]+/, ''), { waitUntil: 'networkidle' });

const list =
	wanted.length > 0
		? wanted
		: await page.$$eval('.side-select select', (els) => [...els[0].options].map((o) => o.value));

const slug = route.replace(/\W+/g, '-').replace(/^-|-$/g, '') || 'home';
for (const family of list) {
	await page.selectOption('.side-select select', family);
	if (process.env.THEME) await page.selectOption('.side-select select >> nth=1', process.env.THEME);
	await page.waitForTimeout(700);
	if (sel) {
		const els = await page.locator(sel).all();
		for (const [i, el] of els.entries()) {
			await el.scrollIntoViewIfNeeded();
			/* A margin around the box: tails, shadows and rings live outside it. */
			const b = await el.boundingBox();
			if (!b) continue;
			const m = 16;
			await page.screenshot({
				path: join(outDir, `${slug}-${family}-${i}.png`),
				clip: { x: b.x - m, y: b.y - m, width: b.width + 2 * m, height: b.height + 2 * m }
			});
		}
	} else await page.screenshot({ path: join(outDir, `${slug}-${family}.png`), fullPage: full });
	console.log(`shot: ${slug}-${family}`);
}
await browser.close();
