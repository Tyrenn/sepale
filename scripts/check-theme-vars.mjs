/**
 * check-theme-vars.mjs — the theme generator and the stylesheets agree.
 *
 * The generator's schema is hand-written and NOT derived from the CSS
 * (ADR 0010), which buys the freedom to have one control write four
 * variables — and costs the guarantee that the names on both sides match.
 * Nothing about a stale name is visible: a theme writes `--btn-press-x`,
 * the CSS reads `--action-press-x`, and the button simply does not move.
 *
 * So: every variable a control can write must be declared in
 * `_defaults.scss`, and every variable declared there under a section's
 * prefix must be reachable from some control. Both directions, because a
 * variable nobody can set is as much a bug as a control nobody reads.
 *
 * Only the prefixes of the sections that exist are audited, so the sections
 * still to be written cost nothing.
 *
 *   node scripts/check-theme-vars.mjs
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadSchema, root } from './_schema.mjs';

/* ── What the stylesheets declare ── */
const scss = readFileSync(join(root, 'src/scss/_defaults.scss'), 'utf8');
const declared = new Set([...scss.matchAll(/^\s*--([a-z0-9-]+)\s*:/gm)].map((m) => m[1]));

/* ── What the schema can write ── */
const { schema, sections } = await loadSchema();
const reachable = schema.declaredVars(sections);

/* ── Compare, in both directions ── */
const problems = [];

for (const name of reachable) {
	if (!declared.has(name)) {
		problems.push(`a control writes --${name}, _defaults.scss does not declare it`);
	}
}

const under = (s, n) => s.prefixes.some((p) => n.startsWith(p + '-'));
const audited = [...declared].filter((n) => sections.some((s) => under(s, n)));

for (const section of sections) {
	for (const name of audited) {
		if (!under(section, name)) continue;
		if (!reachable.has(name)) {
			problems.push(
				`_defaults.scss declares --${name}, no control in "${section.label}" can reach it`
			);
		}
	}
}

if (problems.length) {
	console.error(`theme vars: ${problems.length} problem(s)\n`);
	for (const p of problems.sort()) console.error('  ' + p);
	process.exit(1);
}

console.log(`theme vars: ok — ${reachable.size} reachable, ${audited.length} declared under audited prefixes`);
