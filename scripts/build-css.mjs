/**
 * build-css.mjs — compile every family and every theme.
 *
 * A family is a self-contained directory (ADR 0010): `families/<name>/index.scss`
 * pulls in its page layer and its own file per component. The sass CLI's directory mode cannot express "compile only the index", so the
 * build runs through the JS API instead.
 *
 *   src/scss/families/<name>/index.scss  ->  static/families/<name>.css
 *   src/scss/themes/<family>/<name>.scss ->  static/themes/<family>/<name>.css
 *   src/scss/reset.scss                  ->  static/reset.css
 *
 * The reset is compiled on its own because it is optional: a page that
 * already has one does not load it, and no family depends on it.
 */

import { compile } from 'sass';
import { readdirSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const familiesDir = join(root, 'src/scss/families');
const themesDir = join(root, 'src/scss/themes');
const outFamilies = join(root, 'static/families');
const outThemes = join(root, 'static/themes');

const options = { style: 'expanded', sourceMap: false };

function write(file, css) {
	mkdirSync(dirname(file), { recursive: true });
	writeFileSync(file, css);
}

let count = 0;

const families = readdirSync(familiesDir).filter((name) => {
	const entry = join(familiesDir, name);
	return statSync(entry).isDirectory() && existsSync(join(entry, 'index.scss'));
});

for (const family of families) {
	const { css } = compile(join(familiesDir, family, 'index.scss'), options);
	write(join(outFamilies, `${family}.css`), css);
	count++;

	const dir = join(themesDir, family);
	if (!existsSync(dir)) continue;
	for (const file of readdirSync(dir).filter((f) => f.endsWith('.scss') && !f.startsWith('_'))) {
		const { css: themeCss } = compile(join(dir, file), options);
		write(join(outThemes, family, file.replace(/\.scss$/, '.css')), themeCss);
		count++;
	}
}

/* Optional, and therefore separate (CONTEXT.md: the bundle ships the family's
   stylesheet, theme.css and "an optional reset.css"). */
const { css: resetCss } = compile(join(root, 'src/scss/reset.scss'), options);
write(join(root, 'static/reset.css'), resetCss);
count++;

console.log(`css: ${families.length} families, ${count} files -> static/`);
