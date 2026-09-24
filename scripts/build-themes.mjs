/**
 * build-themes.mjs — the shipped themes are real themes.
 *
 * A theme **is** its variables (`CONTEXT.md`), so a theme is a CSS file and
 * nothing else. There is no longer a TypeScript draft to generate one from,
 * and therefore no drift between the two to check — the file the form loads
 * is byte for byte the file a user downloads.
 *
 * What is left to check is that each shipped file still says something the
 * kit can hear. A theme that sets `--action-hover-mix` after the control that
 * wrote it was replaced still parses, still loads, and renders as neutral:
 * **nothing about a stale theme is visible**, which is exactly the failure
 * mode this project keeps paying for. So: every variable a theme sets must be
 * one `_defaults.scss` declares.
 *
 *   node scripts/build-themes.mjs
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadSchema, root } from './_schema.mjs';

const { schema, sections } = await loadSchema();

const declared = new Set(
	[...readFileSync(join(root, 'src/scss/_defaults.scss'), 'utf8').matchAll(/^\s*--([a-z0-9-]+)\s*:/gm)].map(
		(m) => m[1]
	)
);
/* Sentinels are declared in `_defaults.scss` too, but a group's mode is also
   a legitimate thing for a theme to carry, so both sides are allowed. */
const reachable = schema.declaredVars(sections);

const dir = join(root, 'static/themes');
const files = readdirSync(dir).filter((f) => f.endsWith('.css'));

const neutral = schema.neutralVars(sections);

let bad = 0;
for (const f of files) {
	const text = readFileSync(join(dir, f), 'utf8');
	const vars = schema.parse(text);

	/* The round trip. A theme that does not survive being read back and
	   written again is a theme the form cannot reopen — and nothing about
	   that is visible until someone tries. */
	const again = schema.serialise({ ...neutral, ...vars }, neutral);
	if (again.trim() !== text.slice(text.indexOf(':root')).trim()) {
		bad++;
		console.error(`${f}: does not survive the round trip`);
		continue;
	}
	const stale = Object.keys(vars).filter(
		(v) => v !== 'color-scheme' && !declared.has(v) && !reachable.has(v)
	);
	if (!stale.length) continue;
	bad++;
	console.error(
		`${f}: ${stale.length} variable(s) nothing reads — ${stale.slice(0, 6).join(', ')}${
			stale.length > 6 ? ', …' : ''
		}`
	);
}

if (bad) {
	console.error(
		`\n${bad} of ${files.length} themes are stale. They load without error and render as neutral,\n` +
			'which is why this check exists. See docs/specs/theme-generator/99-migration.md.'
	);
	process.exit(1);
}
console.log(`themes: ok — ${files.length} files, every variable is one the kit reads`);
