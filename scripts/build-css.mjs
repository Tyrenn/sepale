/**
 * build-css.mjs — compile the kit.
 *
 *   src/scss/kit.scss    ->  static/kit.css
 *   src/scss/reset.scss  ->  static/reset.css
 *
 * The reset is compiled on its own because it is optional: a page that
 * already has one does not load it, and the kit does not depend on it.
 *
 * The themes are not here. They are generator output, written from the drafts
 * in src/lib/theme/presets.ts by scripts/build-themes.mjs — by the same code
 * the download button uses, so a shipped theme and a downloaded one come from
 * one implementation (ADR 0010).
 */

import { compile } from 'sass';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const options = { style: 'expanded', sourceMap: false, loadPaths: [join(root, 'src/scss')] };

function write(file, css) {
	mkdirSync(dirname(file), { recursive: true });
	writeFileSync(file, css);
	return css.length;
}

const kit = write(join(root, 'static/kit.css'), compile(join(root, 'src/scss/kit.scss'), options).css);
const reset = write(join(root, 'static/reset.css'), compile(join(root, 'src/scss/reset.scss'), options).css);

console.log(`css: kit.css ${(kit / 1024) | 0} KB, reset.css ${(reset / 1024) | 0} KB -> static/`);
