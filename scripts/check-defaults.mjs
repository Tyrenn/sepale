/**
 * check-defaults.mjs — the form's neutral and the stylesheet's must agree.
 *
 * The fourth check, and it exists because the other three cannot see this
 * failure. A theme file only carries what DIFFERS from the form's neutral
 * (`serialise`), so when the form believes the neutral is X and
 * `_defaults.scss` draws Y:
 *
 *   - a theme that wants X writes nothing, and renders as Y;
 *   - `gen:themes` still passes — every variable it writes is read, and the
 *     file round-trips byte for byte;
 *   - `check:theme` still passes — every variable is declared and reachable.
 *
 * That is exactly how `daisy-retro` asked for 0.25rem selectors and shipped
 * with 0.5rem ones, silently, in a repo with three green checks. Measured the
 * day this was written: fourteen disagreements.
 *
 * What it deliberately does NOT compare:
 *
 *   - nothing, as of the day the pair sources were fixed. `neutralVars`
 *     used to write `var(--color-background)` where the stylesheet declares
 *     `initial`, and this check had to excuse it. It no longer does: a
 *     stated source BEATS the recipe's fallback, and that is how a card came
 *     out the colour of the page in the scoped preview.
 *   - anything the stylesheet resolves with `var()`, `calc()` or `#{}`: those
 *     are recipes, and a recipe has no literal to compare.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadSchema, root } from './_schema.mjs';

/* Known and argued, one line each. Anything else is a bug. */
const EXCEPTIONS = {
	/* Three of the four old families left a link's weight alone so it kept the
	   weight of the sentence around it; sunflower set 700. So the neutral has
	   to be `inherit` and the control has to be a number — the two cannot say
	   the same thing, and `inherit` is the one that renders right. */
	'link-weight': 'inherit'
};

const { schema, sections } = await loadSchema();
const NEUTRAL = schema.neutralVars(sections);

const css = readFileSync(join(root, 'src/scss/_defaults.scss'), 'utf8');
const declared = new Map();
for (const [, name, value] of css.matchAll(/^\t(--[a-z0-9-]+):\s*([^;]+);/gm)) {
	declared.set(name.slice(2), value.trim());   // last wins, as the cascade does
}

const problems = [];
for (const [name, want] of Object.entries(NEUTRAL)) {
	const got = declared.get(name);
	if (got === undefined) continue;
	if (/#\{|var\(|calc\(/.test(got)) continue;
	if (EXCEPTIONS[name] === got) continue;
	if (String(want) === got) continue;
	problems.push(`  --${name} — the form's neutral is \`${want}\`, _defaults.scss draws \`${got}\``);
}

if (problems.length) {
	console.error(`defaults: ${problems.length} disagreement(s) between the form and the stylesheet\n`);
	console.error(problems.join('\n'));
	console.error('\nFix one side, or argue the case in EXCEPTIONS in this file.');
	process.exit(1);
}
console.log(`defaults: ok — ${declared.size} declared, every literal agrees with the form`);
