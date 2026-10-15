/**
 * package-css.mjs — put the stylesheets into the npm package (ADR 0012).
 *
 * svelte-package only sees src/lib; the compiled CSS lives in static/. Run
 * after it:
 *
 *   static/families/<family>.css         -> dist/<family>.css
 *   static/themes/<family>/<theme>.css   -> dist/<family>/themes/<theme>.css
 *
 * Both are reached through one `./*.css` export: `sepale/daisy.css`,
 * `sepale/daisy/themes/light.css`.
 */

import { readdirSync, cpSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const families = join(root, 'static/families');
const themes = join(root, 'static/themes');

if (!existsSync(dist)) throw new Error('package-css: run svelte-package first (no dist/)');

let n = 0;
for (const file of readdirSync(families).filter((f) => f.endsWith('.css'))) {
	const family = file.replace(/\.css$/, '');
	cpSync(join(families, file), join(dist, file));
	const dir = join(themes, family);
	if (existsSync(dir)) cpSync(dir, join(dist, family, 'themes'), { recursive: true });
	n++;
}
console.log(`package-css: ${n} families + their themes -> dist/`);
