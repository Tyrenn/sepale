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

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
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
const ALL = { top: true, right: true, bottom: true, left: true };

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
	['action-hover', col('color-on-background', 0.08)],
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
	/* sunflower tints the PAGE with its primary and leaves the fields white.
	   That is the whole reason `--color-field` exists: one look in four needs
	   a field that is not the page. */
	['color-field', col('color-card')],
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
/* ── The palettes and the GEOMETRY, read out of the old files ──────────
   Two sources, because the conversion has two halves:

     static/themes/<family>-<name>.css   the merged palette. It already
       carries the family's defaults with the theme's overrides on top,
       and it is what this script last wrote, so reading it keeps the run
       idempotent.

     static/themes/<family>/<name>.css   the ORIGINAL theme, still on
       disk. The only place the PER-THEME geometry survives, and the
       first pass never looked at it — which is how coffee lost its
       0.1rem fields, retro its radii, daisy its depth and cosmos half
       its pen. A missing variable renders as neutral and no check can
       see it, so this is the read that had to be added.
   ------------------------------------------------------------------ */

const num = (css, name) => {
	const m = css.match(new RegExp('--' + name + ':\s*([^;]+);'));
	return m ? m[1].trim() : null;
};

function palette(file) {
	const css = readFileSync(file, 'utf8');
	const out = [];
	for (const [, name, value] of css.matchAll(/--(color-[a-z0-9-]+):\s*([^;]+);/g)) {
		/* `--color-scheme` is not a colour. It matched this pattern, became a
		   `{source, shade}` pair and stringified over the correct entry — which
		   is where `[object Object]` in seven shipped files came from. */
		if (name === 'color-scheme') continue;
		/* The file may already be in the new shape, where a colour is the PAIR
		   `--x-color` / `--x-shade`. Take the source, drop the shade: the
		   control id is the stem either way, so a re-run is idempotent instead
		   of failing on names it wrote itself. */
		if (name.endsWith('-shade')) continue;
		const id = name.endsWith('-color') ? name.slice(0, -'-color'.length) : name;
		let v = value.trim();
		if (v === 'initial') continue;
		/* One palette shipped broken: `var(--color-mix(in oklab, …))`, a
		   `--color-` glued onto `mix()` during the family migration. Not CSS,
		   so both sunflower themes fell back to plain white. */
		if (v.startsWith('var(--color-mix(')) v = v.slice('var(--'.length, -1);
		out.push([id, v]);
	}
	const m = css.match(/(?:^|[^-])color-scheme:\s*(\w+)/m);
	return { colors: out, scheme: m ? m[1] : 'light' };
}

/** What a theme said about its own geometry, in the controls that carry it. */
function geometry(file) {
	if (!existsSync(file)) return [];
	const css = readFileSync(file, 'utf8');
	const out = [];

	/* The three old radii, and who each served: `--radius-field` drew buttons
	   AND fields, `--radius-box` the containers, `--radius-selector` the
	   checkboxes, toggles and tabs. */
	const rf = num(css, 'radius-field');
	if (rf) out.push(['action-radius', rf], ['field-radius', rf]);
	const rb = num(css, 'radius-box');
	if (rb) out.push(['container-radius', rb]);
	const rs = num(css, 'radius-selector');
	if (rs) out.push(['selector-radius', rs]);

	/* One pen for the whole kit became one width per section. */
	const b = num(css, 'border');
	if (b) for (const p of P) out.push([p + '-border-width', { width: b, sides: ALL }]);

	/* daisy's retro 3D liseré. Only Action carries it now. */
	const d = num(css, 'depth');
	if (d) out.push(['action-depth', parseFloat(d)]);

	/* One global --scale became one per section. Written only when the theme
	   MOVED it: a 1 would overwrite the per-section ratios the look sets. */
	const sc = num(css, 'scale');
	if (sc && parseFloat(sc) !== 1) {
		for (const p of [...P, 'feedback']) out.push([p + '-scale', parseFloat(sc)]);
	}

	/* cosmos split its wobble three ways, by the kind of thing being drawn. */
	const wf = num(css, 'cosmos-wobble-field');
	if (wf) {
		out.push(['action-handdrawn-strength', parseFloat(wf)]);
		out.push(['field-handdrawn-strength', parseFloat(wf)]);
	}
	const wb = num(css, 'cosmos-wobble-box');
	if (wb) out.push(['container-handdrawn-strength', parseFloat(wb)]);
	const ws = num(css, 'cosmos-wobble-selector');
	if (ws) {
		out.push(['selector-handdrawn-strength', parseFloat(ws)]);
		out.push(['marker-handdrawn-strength', parseFloat(ws)]);
	}
	const tilt = num(css, 'cosmos-tilt');
	if (tilt) for (const p of P) out.push([p + '-handdrawn-tilt', parseFloat(tilt) + 'deg']);

	return out;
}

let n = 0;
for (const [family, names] of Object.entries(FAMILIES)) {
	for (const name of names) {
		const file = join(root, 'static/themes/' + family + '-' + name + '.css');
		const origin = join(root, 'static/themes/' + family + '/' + name + '.css');
		const { colors, scheme } = palette(file);
		/* A palette entry is a Custom box: the theme states the colour. */
		const recipe = [
			['color-scheme', scheme],
			...colors.map(([k, v]) => [k, col(v)]),
			...LOOK[family],
			/* LAST, so a theme's own geometry beats its family's — and so a
			   border WIDTH is written after the border MODE that resets it. */
			...geometry(origin)
		];
		const vars = build(recipe);
		const out =
			'/* ' + family + ' ' + name + ' — generated by scripts/make-themes.mjs */\n' +
			schema.serialise(vars, NEUTRAL);
		writeFileSync(file, out);
		n++;
	}
}
console.log(n + ' themes rewritten');
