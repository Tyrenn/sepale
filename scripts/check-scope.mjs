/**
 * check-scope.mjs — a variable is an INPUT or a RESOLUTION, never both.
 *
 * A custom property is substituted WHERE IT IS DECLARED, and that cuts both
 * ways. Two rules, and every scoped theme depends on them:
 *
 *   1. A RESOLUTION — anything that reads another custom property — must be
 *      declared on `:where(*)`. On `:root` it resolves against the ROOT and the
 *      frozen result inherits down, so a theme applied to `.preview`, to a
 *      `[data-theme]` block or to one panel of a page moves the inputs and
 *      nothing follows.
 *
 *   2. An INPUT — anything the FORM writes — must be declared on `:root` with a
 *      LITERAL value. On `:where(*)` the declaration is re-made on every
 *      element, which BLOCKS inheritance: a scope sets it, and every descendant
 *      overrides it straight back.
 *
 * So a variable that is both — the form writes it AND it reads another
 * property — cannot be declared correctly anywhere. That is a design fault, not
 * a placement one, and the fix is to split it: the form writes the input, the
 * stylesheet resolves the rest from it.
 *
 * Between them these two rules cover every freeze this kit has shipped: the 35
 * geometric lengths, the colour pairs, 88 more found later, and then 36 inputs
 * that the fix for those 88 had pushed the other way.
 *
 * Rule 1 has one sound exception, and it is checked rather than trusted: a
 * `:root` declaration MAY read a property the form never writes, because no
 * scope will ever move it, so there is nothing to freeze.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadSchema, root } from './_schema.mjs';

const { schema, sections } = await loadSchema();

/** Every variable the form writes. */
const written = new Set();
for (const s of sections) {
	for (const e of s.controls) {
		schema.eachControl([e], (c) => (c.vars ?? []).forEach((v) => written.add(v)));
		for (const v of e.vars ?? []) written.add(v);
		if (schema.isGroup(e)) written.add(e.id);
	}
}

const FILES = ['src/scss/_defaults.scss', 'src/scss/_derived-content.scss'];
const DECL = /^\t(--[a-z0-9-]+):\s*(.+);$/;
const reads = (v) => /var\(--/.test(v);

const frozen = [];
const blocked = [];
const both = [];

for (const rel of FILES) {
	const lines = readFileSync(join(root, rel), 'utf8').split(/\r?\n/);
	let scope = null;
	lines.forEach((l, i) => {
		if (l.startsWith(':where(:root)') || l.startsWith(':root')) scope = 'root';
		else if (l.startsWith(':where(*)')) scope = 'all';
		else if (l === '}') scope = null;
		const m = l.match(DECL);
		if (!m || !scope) return;
		const name = m[1].slice(2);
		const input = written.has(name);
		const where = `${rel}:${i + 1}`;
		const refs = [...m[2].matchAll(/var\(\s*(--[a-z0-9-]+)/g)].map((x) => x[1].slice(2));
		const readsAnInput = refs.some((r) => written.has(r));
		/* An input that reads a NON-input is sound on `:root`: the thing it reads
		   is never moved by a scope, so there is nothing to freeze. It is only
		   a fault when an input reads another INPUT — then the outer one cannot
		   be declared correctly anywhere. */
		if (input && readsAnInput) {
			both.push(`  ${where}  ${m[1]}: ${m[2].slice(0, 44)}`);
		} else if (scope === 'root' && reads(m[2])) {
			/* Sound only while nothing it reads is an input. */
			if (readsAnInput) frozen.push(`  ${where}  ${m[1]}: ${m[2].slice(0, 44)}`);
		} else if (scope === 'all' && input) {
			blocked.push(`  ${where}  ${m[1]}: ${m[2].slice(0, 44)}`);
		}
	});
}

const say = (title, list, why) => {
	if (!list.length) return 0;
	console.error(`\n${title} — ${list.length}\n${why}\n`);
	console.error(list.join('\n'));
	return list.length;
};

const n =
	say('BOTH an input and a resolution', both,
		'  The form writes these AND they read another property, so no scope can\n' +
		'  declare them correctly. Split them: the form writes the input, the\n' +
		'  stylesheet resolves the rest on `:where(*)`.') +
	say('FROZEN at :root', frozen,
		'  Each reads a variable the form writes, so it resolves at the root and the\n' +
		'  frozen value inherits. Move to the `:where(*)` block.') +
	say('INHERITANCE BLOCKED on :where(*)', blocked,
		'  The form writes these, so a scope has to be able to set them — and a\n' +
		'  `:where(*)` declaration is re-made on every descendant. Move to `:root`.');

if (n) {
	console.error('');
	process.exit(1);
}
console.log('scope: ok — every input inherits from :root, every resolution substitutes per element');
