/**
 * The theme generator's schema.
 *
 * This file is hand-written and is NOT derived from the CSS (ADR 0010). The
 * generator is a form, not a rendering of a stylesheet, and the two are kept
 * honest by `scripts/check-theme-vars.mjs`, which fails the build when a
 * control writes a variable `_defaults.scss` does not declare, or when a
 * variable is declared and no control can reach it.
 *
 * The three words, as `CONTEXT.md` defines them:
 *
 *   variable  a CSS custom property. What a theme writes.
 *   control   one field in this form. It may write several variables, and
 *             several controls may write one — `sides` and `offset` both
 *             feed the same pair of `box-shadow` layers.
 *   effect    a control that is off by default and reveals its own controls
 *             when turned on. Some are mutually exclusive: a corner is a
 *             radius or a wobble, never both.
 *
 * A control never writes a formula that mentions a `--_` slot. Those resolve
 * on the element, and a `:root` rule that reads one freezes it at root. When a
 * look needs that kind of derivation, the recipe belongs in the component
 * stylesheet, gated by a scalar this form sets. That is what an effect is.
 */

export type Draft = Record<string, unknown>;

/** What a control produces: variable name (no `--`) → value. */
export type Vars = Record<string, string>;

interface Base {
	id: string;
	label: string;
	help?: string;
	/** Every variable this control can write. The drift check reads this. */
	vars: string[];
}

export interface ColorControl extends Base {
	type: 'color';
	default: string;
}

export interface LengthControl extends Base {
	type: 'length';
	default: string;
	min: number;
	max: number;
	step: number;
	units: string[];
}

export interface NumberControl extends Base {
	type: 'number';
	default: number;
	min: number;
	max: number;
	step: number;
}

export interface PercentControl extends Base {
	type: 'percent';
	default: number;
	min: number;
	max: number;
	step: number;
}

export interface SelectControl extends Base {
	type: 'select';
	default: string;
	options: { value: string; label: string }[];
}

/** Which edges something is drawn on. Four booleans, one control. */
export interface SidesControl extends Base {
	type: 'sides';
	default: Sides;
}

export interface Sides {
	top: boolean;
	right: boolean;
	bottom: boolean;
	left: boolean;
}

/**
 * A mode of an effect: one entry in its exclusive list, with the controls it
 * reveals and what it writes.
 */
export interface Mode {
	id: string;
	label: string;
	help?: string;
	controls: Control[];
}

export interface EffectControl extends Base {
	type: 'effect';
	/** Modes are mutually exclusive by construction. `none` is the default. */
	default: string;
	modes: Mode[];
}

export type Control =
	| ColorControl
	| LengthControl
	| NumberControl
	| PercentControl
	| SelectControl
	| SidesControl
	| EffectControl;

export interface Section {
	id: string;
	label: string;
	help?: string;
	/**
	 * The variable prefixes this section owns — `field` plus the component
	 * names for Fields, because a two-level cascade puts `--textarea-corners`
	 * in the same section as `--field-corners`. The drift check audits exactly
	 * the variables under the prefixes of the sections that exist, so a
	 * section still to be written costs no false alarm and joins the audit the
	 * day it lands.
	 */
	prefixes: string[];
	controls: Control[];
}

/* ------------------------------------------------------------------ *
 * Shadow geometry
 *
 * A `box-shadow` layer offset diagonally covers two adjacent sides; one
 * offset on an axis covers one. Two layers therefore cover every
 * combination of edges there is:
 *
 *   1 side      one axis-aligned layer
 *   2 adjacent  one diagonal layer — the corner
 *   2 opposite  two axis-aligned layers
 *   3 sides     two diagonal layers, sharing the middle edge
 *   4 sides     one layer at the origin, spread outwards
 *
 * Which is why `_defaults.scss` declares exactly two, and no theme has
 * ever needed a third.
 * ------------------------------------------------------------------ */

type Layer = { x: string; y: string; spread: string };

export function shadowLayers(sides: Sides, offset: string): Layer[] {
	const neg = (v: string) => `calc(${v} * -1)`;
	const on = (['top', 'right', 'bottom', 'left'] as const).filter((s) => sides[s]);
	const zero = '0px';

	if (on.length === 0) return [];
	if (on.length === 4) return [{ x: zero, y: zero, spread: offset }];

	const axis = (s: (typeof on)[number]): Layer =>
		s === 'top'
			? { x: zero, y: neg(offset), spread: zero }
			: s === 'bottom'
				? { x: zero, y: offset, spread: zero }
				: s === 'left'
					? { x: neg(offset), y: zero, spread: zero }
					: { x: offset, y: zero, spread: zero };

	if (on.length === 1) return [axis(on[0])];

	const diagonal = (a: string, b: string): Layer => ({
		x: a === 'left' || b === 'left' ? neg(offset) : offset,
		y: a === 'top' || b === 'top' ? neg(offset) : offset,
		spread: zero
	});

	if (on.length === 2) {
		const opposite =
			(sides.top && sides.bottom && !sides.left && !sides.right) ||
			(sides.left && sides.right && !sides.top && !sides.bottom);
		return opposite ? [axis(on[0]), axis(on[1])] : [diagonal(on[0], on[1])];
	}

	/* Three sides: the one that is off names the two corners to draw. */
	const off = (['top', 'right', 'bottom', 'left'] as const).find((s) => !sides[s])!;
	const pairs: Record<typeof off, [string, string][]> = {
		top: [
			['left', 'bottom'],
			['right', 'bottom']
		],
		bottom: [
			['left', 'top'],
			['right', 'top']
		],
		left: [
			['top', 'right'],
			['bottom', 'right']
		],
		right: [
			['top', 'left'],
			['bottom', 'left']
		]
	};
	return pairs[off].map(([a, b]) => diagonal(a, b));
}

/**
 * The two shadow layers, written flat, under a section's prefix. An unused
 * layer is transparent, which costs one entry in the list and draws nothing.
 */
export function shadowVars(
	prefix: string,
	layers: Layer[],
	opts: { blur: string; color: string; inset: boolean }
): Vars {
	const out: Vars = {};
	for (const n of [1, 2]) {
		const l = layers[n - 1];
		const p = `${prefix}-shadow-${n}`;
		out[`${p}-inset`] = l && opts.inset ? 'inset' : ' ';
		out[`${p}-x`] = l ? l.x : '0px';
		out[`${p}-y`] = l ? l.y : '0px';
		out[`${p}-blur`] = l ? opts.blur : '0px';
		out[`${p}-spread`] = l ? l.spread : '0px';
		out[`${p}-color`] = l ? opts.color : '#0000';
	}
	return out;
}

/* ------------------------------------------------------------------ *
 * Expansion
 * ------------------------------------------------------------------ */

/** Every variable any control in these sections can write. */
export function declaredVars(sections: Section[]): Set<string> {
	const out = new Set<string>();
	const walk = (cs: Control[]) => {
		for (const c of cs) {
			c.vars.forEach((v) => out.add(v));
			if (c.type === 'effect') c.modes.forEach((m) => walk(m.controls));
		}
	};
	sections.forEach((s) => walk(s.controls));
	return out;
}

/**
 * Whether a control's answer can be read back out of a theme file.
 *
 * True when one variable carries it verbatim — either one named after the
 * control, or the single variable it writes. False when the answer is folded
 * into something else: an amplitude that became an eight-value recipe, an
 * offset that became two shadow layers. Those get a sentinel instead.
 */
function recoverable(c: Control): boolean {
	return c.type !== 'effect' && (c.vars.includes(c.id) || c.vars.length === 1);
}

/**
 * A length split into its number and its unit, for the slider that edits it.
 * Anything that is not `<number><unit>` — `calc(2.5em * var(--scale))`, `auto`,
 * `normal` — comes back as [0, fallback] and the form shows a text field
 * instead, because those are legitimate answers that no slider can hold.
 */
export function splitLength(value: string, fallbackUnit = 'rem'): [number, string] {
	const m = String(value).trim().match(/^(-?[\d.]+)\s*([a-z%]*)$/i);
	if (!m) return [0, fallbackUnit];
	return [parseFloat(m[1]) || 0, m[2] || fallbackUnit];
}

/** Sides as `top right bottom left`, each 1 or 0. Round-trips through CSS. */
function sidesToCss(v: Sides): string {
	return [v.top, v.right, v.bottom, v.left].map((b) => (b ? 1 : 0)).join(' ');
}

function sidesFromCss(v: string): Sides | undefined {
	const p = v.trim().split(/\s+/);
	if (p.length !== 4 || p.some((n) => n !== '0' && n !== '1')) return undefined;
	return { top: p[0] === '1', right: p[1] === '1', bottom: p[2] === '1', left: p[3] === '1' };
}

/** A control's value as CSS text. The only place a value becomes a string. */
function toCss(c: Control, v: unknown): string {
	return c.type === 'sides' ? sidesToCss(v as Sides) : String(v);
}

/** The value of a control in a draft, falling back to its default. */
function val(draft: Draft, c: Control): unknown {
	return draft[c.id] ?? (c as { default?: unknown }).default;
}

/**
 * Turn a draft into variables.
 *
 * The draft only holds what someone changed, so the pass fills in each
 * control's default as it reaches it and hands writers that completed draft
 * rather than the sparse one. Filling in lazily matters: two modes of one
 * effect can offer the same control with different defaults - a rounded
 * corner starts at 0, a hand-drawn one at 0.75rem - and only the mode you
 * picked is walked.
 */
export function expand(sections: Section[], draft: Draft): Vars {
	const out: Vars = {};
	const full: Draft = { ...draft };

	const walk = (controls: Control[]) => {
		for (const c of controls) {
			if (full[c.id] === undefined) full[c.id] = (c as { default?: unknown }).default;
			const v = full[c.id];

			if (c.type === 'effect') {
				const mode = c.modes.find((m) => m.id === v) ?? c.modes[0];
				full[c.id] = mode.id;
				/* The sentinel. No stylesheet reads it; the generator does, to
				   reopen a theme it wrote. Without it an exported theme is a
				   pile of numbers and "push" is unrecoverable (ADR 0010). */
				out[c.id] = mode.id;
				/* The revealed controls run FIRST and the mode's writer last,
				   because the writer is the one that knows how to combine
				   them. A wobble amplitude on its own is the number 1; what
				   belongs in --field-corners is the recipe built out of it. */
				walk(mode.controls);
				Object.assign(out, writers[`${c.id}:${mode.id}`]?.(full) ?? {});
				continue;
			}

			const w = writers[c.id];
			if (w) Object.assign(out, w(full));
			else if (c.vars.length === 1) out[c.vars[0]] = toCss(c, v);

			/* A control nothing carries verbatim writes itself as a sentinel,
			   so reopening the file gives the answer back rather than the
			   mode's default. No stylesheet reads one. */
			if (!recoverable(c)) out[c.id] = toCss(c, v);
		}
	};

	sections.forEach((s) => walk(s.controls));
	return out;
}

/**
 * Read a theme file back into a draft.
 *
 * The sentinels carry the effect modes; every other variable maps back to the
 * control that owns it, which is why a control declares the variables it
 * writes rather than only writing them. A control that folds several answers
 * into one variable — edges and width into a shorthand — cannot be recovered
 * from the file and comes back at the mode's default. `build-themes.mjs`
 * checks that the round trip is exact for every shipped theme, so a control
 * that stops round-tripping fails the build rather than quietly losing an
 * answer.
 */
export function parse(sections: Section[], css: string): Draft {
	const found: Record<string, string> = {};
	for (const [, name, value] of css.matchAll(/--([a-z0-9-]+)\s*:\s*([^;}]+)/g)) {
		found[name] = value.trim();
	}

	const draft: Draft = {};
	const walk = (controls: Control[]) => {
		for (const c of controls) {
			if (c.type === 'effect') {
				const mode = found[c.id];
				if (mode && c.modes.some((m) => m.id === mode)) draft[c.id] = mode;
				c.modes.forEach((m) => walk(m.controls));
				continue;
			}
			/* Its own name first — that is either a variable named after the
			   control or its sentinel — then the single variable it writes. */
			const raw = found[c.id] ?? (c.vars.length === 1 ? found[c.vars[0]] : undefined);
			if (raw === undefined) continue;
			const parsed = c.type === 'sides' ? sidesFromCss(raw) : raw;
			if (parsed !== undefined) draft[c.id] = parsed;
		}
	};
	sections.forEach((s) => walk(s.controls));
	return draft;
}

/** `:root { … }`, sentinels included, holding only what differs from neutral. */
export function serialise(vars: Vars, neutral: Vars): string {
	const lines = Object.entries(vars)
		.filter(([k, v]) => neutral[k] !== v)
		.map(([k, v]) => `\t--${k}: ${v};`);
	return `:root {\n${lines.join('\n')}\n}\n`;
}

/* ------------------------------------------------------------------ *
 * Writers — the controls that are not one-to-one
 * ------------------------------------------------------------------ */

const writers: Record<string, (d: Draft) => Vars> = {};

/**
 * A section registers the logic for its controls that are not one-to-one.
 *
 * It lives with the section rather than here because the arithmetic that
 * turns "push, a quarter em" into four variables is part of what that section
 * means, and a reader looking at Fields should not have to come here to find
 * out what its Focus effect does. Importing a section registers its writers,
 * which is why `expand()` is only ever called on sections that were imported.
 */
export function registerWriters(map: Record<string, (d: Draft) => Vars>) {
	Object.assign(writers, map);
}

/** Which edges a `sides` control is set to, or all four. */
export function sidesOf(d: Draft, key: string): Sides {
	return (d[key] as Sides) ?? { top: true, right: true, bottom: true, left: true };
}

