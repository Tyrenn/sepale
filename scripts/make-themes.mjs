/**
 * make-themes.mjs — rewrite the nineteen shipped themes against the new
 * control set. Run ONCE; it is not a mechanism the repo keeps.
 *
 * The themes are not translated key by key. They are **re-derived through the
 * schema**: the script picks the modes and moves the controls a person would
 * have moved, and `serialise()` writes the result. So a shipped theme is by
 * construction a file the form could have produced, and it round-trips —
 * which is the property `build-themes.mjs` checks and the old drafts kept
 * losing.
 *
 * Colours come from the files being replaced: a colour is a colour whichever
 * pass wrote it, and the nineteen palettes are the part of the old work worth
 * keeping.
 *
 *   node scripts/make-themes.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadSchema, root } from './_schema.mjs';

const { schema, sections } = await loadSchema();
const NEUTRAL = schema.neutralVars(sections);

/* ── Finding a control or a group by id, anywhere in the tree ── */
const groups = new Map();
const controls = new Map();
for (const s of sections) {
	for (const e of s.controls) {
		if (schema.isGroup(e)) groups.set(e.id, e);
		schema.eachControl([e], (c) => controls.set(c.id, c));
	}
}

function build(recipe) {
	let vars = { ...NEUTRAL };
	for (const [id, value] of recipe) {
		if (groups.has(id)) {
			Object.assign(vars, schema.writeMode(groups.get(id), value, vars));
		} else if (controls.has(id)) {
			const c = controls.get(id);
			const owner = [...groups.values()].find(
				(g) =>
					g.controls.includes(c) || (g.type?.modes ?? []).some((m) => m.controls.includes(c))
			);
			Object.assign(vars, schema.writeValue(c, value, vars, owner));
		} else {
			throw new Error(`no control or group "${id}"`);
		}
	}
	return vars;
}

/* ── What each look is, said in the controls that survived ── */

const col = (source, shade = 0) => ({ source, shade });
const P = ['action', 'field', 'selector', 'container', 'marker'];

/** daisy — a plain flat look: a hairline edge and a fill that darkens. */
const daisy = [
	...P.map((p) => [`${p}-border`, 'solid']),
	['action-hover', col('own', 0.07)],
	['action-press', 'sink'],
	['action-focus', 'ring']
];

/**
 * dahlia — smaller boxes, tighter containers, and a hover that keeps the
 * theme rather than going grey. The one look that needs Advanced: its buttons
 * carry an edge its fields do not.
 */
const dahlia = [
	['action-border', 'solid'],
	['selector-border', 'solid'],
	['selector-scale', 0.67],
	['container-scale', 0.9],
	['action-hover', col('color-on-surface', 0.08)],
	['action-radius', '0.375rem'],
	['container-radius', '0.625rem'],
	['field-radius', '0.25rem'],
	['action-focus', 'ring']
];

/**
 * sunflower — the boxes shrink, nothing shifts colour on hover, and the whole
 * feedback is the push: the button travels exactly as far as its shadow sits.
 */
const sunflower = [
	...P.map((p) => [`${p}-border`, 'solid']),
	['selector-scale', 0.67],
	['action-shadow', [{ x: '0px', y: '4px', blur: '0px', spread: '0px', color: 'currentColor', inset: false }]],
	['action-press', 'push'],
	['action-hover', col('own', 0)],
	['action-focus', 'outline']
];

/** cosmos — everything it draws sits a little off true. */
const cosmos = [
	...P.map((p) => [`${p}-border`, 'solid']),
	['action-radius', '0.75rem'],
	['container-radius', '0.5rem'],
	['action-shadow', [{ x: '2px', y: '2px', blur: '0px', spread: '0px', color: 'currentColor', inset: false }]],
	['action-hover', col('own', 0)],
	...P.map((p) => [`${p}-handdrawn`, 'on']),
	...P.map((p) => [`${p}-handdrawn-tilt`, '0.4deg']),
	['action-focus', 'outline']
];

const LOOK = { daisy, dahlia, sunflower, cosmos };

const FAMILIES = {
	daisy: ['light','dark','bumblebee','retro','halloween','forest','lofi','autumn','business','night','nord','coffee','caramellatte'],
	dahlia: ['light', 'jade'],
	cosmos: ['paper', 'slate'],
	sunflower: ['light', 'mint']
};

/* ── The palettes, read out of the files being replaced ── */
function palette(file) {
	const css = readFileSync(file, 'utf8');
	const out = [];
	for (const [, name, value] of css.matchAll(/--(color-[a-z0-9-]+):\s*([^;]+);/g)) {
		/* The files being read may already be in the new shape, where a colour
		   is the PAIR `--x-color` / `--x-shade`. Take the source and drop the
		   shade: the control id is the stem either way, so a re-run is
		   idempotent instead of failing on names it wrote itself. */
		if (name.endsWith('-shade')) continue;
		const id = name.endsWith('-color') ? name.slice(0, -'-color'.length) : name;
		if (value.trim() === 'initial') continue;
		out.push([id, value.trim()]);
	}
	const m = css.match(/color-scheme:\s*(\w+)/);
	return { colors: out, scheme: m ? m[1] : 'light' };
}

let n = 0;
for (const [family, names] of Object.entries(FAMILIES)) {
	for (const name of names) {
		const file = join(root, `static/themes/${family}-${name}.css`);
		const { colors, scheme } = palette(file);
		/* A palette entry is a Custom box: the theme states the colour. */
		const recipe = [
			['color-scheme', scheme],
			...colors.map(([k, v]) => [k, col(v)]),
			...LOOK[family]
		];
		const vars = build(recipe);
		const css = `/* ${family} ${name} — generated by scripts/make-themes.mjs */\n${schema.serialise(vars, NEUTRAL)}`;
		writeFileSync(file, css);
		n++;
	}
}
console.log(`${n} themes rewritten`);
