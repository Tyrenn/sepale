/**
 * shoot.mjs — screenshot the theme preview for every family.
 *
 * The point is blunt: CSS that compiles is not CSS that looks right, and a
 * family is judged by rendering. Run this after touching a family.
 *
 *   node scripts/shoot.mjs                 # every family, default theme
 *   node scripts/shoot.mjs dahlia sunflower
 *
 * Output: .shots/<family>.png (git-ignored). Uses the system Edge, so there
 * is no browser download.
 */

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, '.shots');
const base = process.env.UU_URL ?? 'http://localhost:5204';

const { families } = await import(`file://${join(root, 'src/lib/generated/registry.ts')}`).catch(
	async () => ({ families: null })
);

const wanted = process.argv.slice(2);

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1500, height: 1400 } });

mkdirSync(outDir, { recursive: true });

await page.goto(base + '/theme', { waitUntil: 'networkidle' });

const list =
	wanted.length > 0
		? wanted
		: await page.$$eval('.side-select select', (els) =>
				[...els[0].options].map((o) => o.value)
			);

for (const family of list) {
	await page.selectOption('.side-select select', family);
	// The family stylesheet is swapped by the layout; give it a beat to load.
	await page.waitForTimeout(600);
	await page.screenshot({ path: join(outDir, `${family}.png`), fullPage: false });
	console.log(`shot: ${family}`);
}

await browser.close();
