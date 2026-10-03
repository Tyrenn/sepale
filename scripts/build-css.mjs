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

/* The app's own chrome — sidebar, editor, tables, tabs — is NOT a preview: it
   wears daisy in a sober theme whatever family is being looked at. Both are
   loaded on one page, so the chrome's copy is renamed out of the way: every
   class `.x` becomes `.ui-x`, every custom property `--x` becomes `--ui-x`,
   and `:root` becomes `.app-ui`. Nothing in it can then touch, or be touched
   by, the family under preview. App tooling only: the kit itself has no
   prefix (ADR 0007). */
const CHROME_FAMILY = 'daisy';
const CHROME_THEME = 'corporate';
const chromeSrc =
	compile(join(familiesDir, CHROME_FAMILY, 'index.scss'), options).css +
	'\n' +
	compile(join(themesDir, CHROME_FAMILY, `${CHROME_THEME}.scss`), options).css;
write(join(root, 'static/app-ui.css'), prefixChrome(chromeSrc));
count++;

console.log(`css: ${families.length} families, ${count} files -> static/`);

/**
 * Rename a compiled stylesheet into the `ui-` space. Comments, strings and
 * url() are copied untouched — a `w3.org` inside an inline SVG is not a class.
 * Keyframes are dropped: their names are global, the chrome animates nothing,
 * and the family's own must win.
 */
function prefixChrome(css) {
	let src = css.replace(/\/\*[\s\S]*?\*\//g, '');
	src = dropAtRule(src, /@keyframes\s+[\w-]+\s*\{/g);
	let out = '';
	for (let i = 0; i < src.length; ) {
		const rest = src.slice(i);
		const skip = rest.match(/^(url\([^)]*\)|"[^"\n]*"|'[^'\n]*')/);
		if (skip) {
			out += skip[0];
			i += skip[0].length;
			continue;
		}
		const prev = out[out.length - 1] ?? ' ';
		const cls = rest.match(/^\.([a-z][a-z0-9]*(?:-[a-z0-9]+)*)/);
		if (cls && !/[\w-]/.test(prev)) {
			out += `.ui-${cls[1]}`;
			i += cls[0].length;
			continue;
		}
		const prop = rest.match(/^--([a-z][\w-]*)/);
		if (prop && !/[\w-]/.test(prev)) {
			out += `--ui-${prop[1]}`;
			i += prop[0].length;
			continue;
		}
		if (rest.startsWith(':root')) {
			out += '.app-ui';
			i += 5;
			continue;
		}
		out += src[i++];
	}
	return out;
}

/** Remove every block opened by `re`, braces balanced. */
function dropAtRule(src, re) {
	let m;
	while ((m = re.exec(src))) {
		let depth = 1;
		let j = m.index + m[0].length;
		for (; j < src.length && depth; j++) {
			if (src[j] === '{') depth++;
			else if (src[j] === '}') depth--;
		}
		src = src.slice(0, m.index) + src.slice(j);
		re.lastIndex = m.index;
	}
	return src;
}
