/**
 * The theme generator's schema.
 *
 * This file is hand-written and is NOT derived from the CSS (ADR 0010). The
 * generator is a form, not a rendering of a stylesheet, and the two are kept
 * honest by `scripts/check-theme-vars.mjs`, which fails the build when a
 * control writes a variable `_defaults.scss` does not declare, or when a
 * variable is declared and no control can reach it.
 *
 * The words, as `CONTEXT.md` defines them:
 *
 *   variable  a CSS custom property. What a theme writes.
 *   control   one field in this form. It may write several variables, and
 *             several controls may write one — `sides` and `offset` both
 *             feed the same pair of `box-shadow` layers.
 *   group     a named, enclosed set of controls, optionally with a `type`:
 *             its own exclusive setting, which decides how many controls
 *             appear under it. This is what used to be called an `effect`.
 *   shared    a group whose answer is the same in every section that has it.
 *             In Basic it is shown once and writes every section at once; in
 *             Advanced it is shown per section. See ADR 0011: there is no
 *             global variable and no second level of cascade.
 *   box       the one colour control: a fixed colour, or one derived from
 *             another by an intensity. Always exactly two variables.
 *
 * A control never writes a formula that mentions a `--_` slot. Those resolve
 * on the element, and a `:root` rule that reads one freezes it at root. When a
 * look needs that kind of derivation, the recipe belongs in the component
 * stylesheet, gated by a scalar this form sets.
 *
 * Full specification: `docs/specs/theme-generator/`.
 */

/**
 * The state of a theme: variable name (no `--`) → value.
 *
 * There is no record of "what each control was set to". A theme **is** its
 * variables (`CONTEXT.md`), and a control is a view onto them: it reads a
 * value out to show, and writes variables when it is moved. That is what
 * makes the Basic / Advanced switch purely visual (ADR 0011).
 */
export type Vars = Record<string, string>;

interface Base {
	id: string;
	label: string;
	help?: string;
	/**
	 * `<group id>:<mode id>` — hide this control while that group is in that
	 * mode, because another control has taken the question over.
	 *
	 * The one case: turning the hand-drawn look on moves the radius into its
	 * group, where it is the base the wobble is built from. Two radius
	 * sliders, one of which quietly feeds the other, is worse than one that
	 * moves.
	 */
	hiddenWhen?: string;
	/** Every variable this control can write. The drift check reads this. */
	vars: string[];
}

/* ------------------------------------------------------------------ *
 * The colour box
 *
 * One control for all ~34 colours in the form. It writes two variables,
 * always: the source and the shade.
 *
 * The source doubles as the mode, because the mode is readable from it and a
 * second field would be a second thing to keep in step:
 *
 *   'own'            derive from the element's own fill. The theme writes
 *                    `initial` — guaranteed-invalid — so the component's
 *                    `var(--x, var(--_slot))` falls back to the slot and it
 *                    resolves on the element instead of freezing at root.
 *   'color-primary'  derive from a token of the theme.
 *   '#0b0b0b'        a fixed colour. Shade is forced to 0: it IS the colour.
 *
 * Direction is never a control. A light source darkens and a dark one
 * lightens, which is why one answer serves a theme and its dark twin:
 *
 *   calc(l + clamp(-1, (0.66 - l) * 999, 1) * var(--x-shade))
 * ------------------------------------------------------------------ */

export interface ColorValue {
	/** `own`, a `color-*` token name, or a literal colour. */
	source: string;
	/** Points of OKLCH lightness, 0 to 0.5. Ignored when the source is literal. */
	shade: number;
}

/** Which sources a box offers. `own` only where a `--_` slot exists. */
export type ColorSource = 'own' | 'text' | 'surface' | 'semantic';

export interface ColorControl extends Base {
	type: 'color';
	default: ColorValue;
	sources: ColorSource[];
	/**
	 * Which of the two recipes this colour is.
	 *
	 * `shade` — the colour sits BESIDE its source: a border, a hover, a
	 * track. A few points of lightness away, direction automatic.
	 *
	 * `contrast` — the colour is written ON its source: a mark, an ink, a
	 * placeholder. The lightness snaps to one end instead of stepping.
	 *
	 * The distinction is not cosmetic. A `contrast` box in **Custom** mode
	 * means "this IS the ink", not "derive an ink from this" — so its value
	 * is written through untouched, and only the derived modes run the
	 * recipe. Getting that backwards paints white text on a white page, and
	 * every shipped theme states its own ink.
	 */
	kind?: 'shade' | 'contrast';
	/** What Derived follows, in words. Defaults to a reading of the source. */
	follows?: string;
	/**
	 * The id of the box this one is the ink of.
	 *
	 * The two render as a single pair under a single label, and this tile
	 * shows an `A` in its own colour on its partner's — which is the only way
	 * to judge an ink, and the reason a contrast number is not enough.
	 */
	inkOf?: string;
	/** Exactly two: the source variable, then the shade variable. */
	vars: [source: string, shade: string];
}

export const isOwn = (source: string) => source === 'own';
export const isToken = (source: string) => source.startsWith('color-');
export const isLiteral = (source: string) => !isOwn(source) && !isToken(source);

/** A source as the theme writes it. */
export function sourceToCss(source: string): string {
	if (isOwn(source)) return 'initial';
	if (isToken(source)) return `var(--${source})`;
	return source;
}

/** And back, for reopening a theme. An absent variable means `own`. */
export function sourceFromCss(raw: string | undefined): string {
	if (raw === undefined || raw.trim() === 'initial') return 'own';
	const m = raw.trim().match(/^var\(\s*--(color-[a-z0-9-]+)\s*\)$/);
	return m ? m[1] : raw.trim();
}

/* ------------------------------------------------------------------ *
 * The other controls
 * ------------------------------------------------------------------ */

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

/**
 * A finite set of values, rendered as a row of exclusive buttons.
 *
 * There is no `select` in this form. A dropdown hides its own options, which
 * is the wrong trade for three or four of them, and every choice here is three
 * or four.
 */
export interface ChoiceControl extends Base {
	type: 'choice';
	default: string;
	options: { value: string; label: string }[];
}

/** Which edges something is drawn on. Four booleans, one control. */
export interface SidesControl extends Base {
	type: 'sides';
	default: Sides;
}

/**
 * A width and the edges it is drawn on, as ONE control over ONE variable.
 *
 * `border-width: 1px 0 1px 0` already says both things: the parts at `0` ARE
 * the edges that are off. So there is no second variable holding the edges
 * and no sentinel — the shorthand is its own record, and the control reads
 * itself straight back out of it.
 */
export interface EdgeWidthControl extends Base {
	type: 'edge-width';
	default: EdgeWidth;
	min: number;
	max: number;
	step: number;
	units: string[];
}

export interface EdgeWidth {
	width: string;
	sides: Sides;
}

export interface Sides {
	top: boolean;
	right: boolean;
	bottom: boolean;
	left: boolean;
}

/**
 * A list of `box-shadow` layers, edited as a list.
 *
 * It writes ONE variable holding the whole `box-shadow` value, which is what
 * `chip` and `menu` already read — so the twelve flat `--x-shadow-N-*`
 * variables and the `shadowLayers` geometry that filled them both go. Modes
 * (soft / hard / inset) go with them: they were four presets over a thing
 * that is naturally a list, and a look that wants two shadows could not say
 * so.
 */
export interface ShadowsControl extends Base {
	type: 'shadows';
	default: ShadowLayer[];
}

export interface ShadowLayer {
	x: string;
	y: string;
	blur: string;
	spread: string;
	color: string;
	inset: boolean;
}

/** The layers as CSS. An empty list is `none`, not an empty string. */
export function shadowsToCss(layers: ShadowLayer[]): string {
	if (!layers.length) return 'none';
	return layers
		.map((l) => `${l.inset ? 'inset ' : ''}${l.x} ${l.y} ${l.blur} ${l.spread} ${l.color}`)
		.join(', ');
}

/**
 * And back. Splits on the commas that separate layers — not the ones inside
 * `color-mix(…)` or `oklch(… / …)`, which is why this counts parentheses
 * instead of calling `split(',')`.
 */
export function shadowsFromCss(raw: string): ShadowLayer[] {
	const v = raw.trim();
	if (!v || v === 'none' || v === 'initial') return [];
	const parts: string[] = [];
	let depth = 0;
	let start = 0;
	for (let i = 0; i < v.length; i++) {
		if (v[i] === '(') depth++;
		else if (v[i] === ')') depth--;
		else if (v[i] === ',' && depth === 0) {
			parts.push(v.slice(start, i));
			start = i + 1;
		}
	}
	parts.push(v.slice(start));

	return parts.map((p) => {
		const t = p.trim();
		const inset = /(^|\s)inset(\s|$)/.test(t);
		const rest = t.replace(/(^|\s)inset(\s|$)/, ' ').trim();
		/* Four lengths at most, then whatever is left is the colour. */
		const tokens: string[] = [];
		let d = 0;
		let acc = '';
		for (const ch of rest) {
			if (ch === '(') d++;
			if (ch === ')') d--;
			if (/\s/.test(ch) && d === 0) {
				if (acc) tokens.push(acc);
				acc = '';
			} else acc += ch;
		}
		if (acc) tokens.push(acc);
		const lengths = tokens.filter((x) => /^-?[\d.]/.test(x) || x.startsWith('calc('));
		const color = tokens.filter((x) => !lengths.includes(x)).join(' ') || 'currentColor';
		return {
			x: lengths[0] ?? '0px',
			y: lengths[1] ?? '0px',
			blur: lengths[2] ?? '0px',
			spread: lengths[3] ?? '0px',
			color,
			inset
		};
	});
}

/** An on/off group header. The group's controls appear only when it is on. */
export interface ToggleControl extends Base {
	type: 'toggle';
	default: boolean;
}

export type Control =
	| ColorControl
	| LengthControl
	| NumberControl
	| PercentControl
	| ChoiceControl
	| SidesControl
	| EdgeWidthControl
	| ShadowsControl
	| ToggleControl;

/* ------------------------------------------------------------------ *
 * Groups
 * ------------------------------------------------------------------ */

export interface Mode {
	id: string;
	label: string;
	help?: string;
	controls: Control[];
}

export interface Group {
	id: string;
	label: string;
	help?: string;
	/**
	 * The group's own exclusive setting, rendered as tabs above its controls.
	 * Picking a mode reveals that mode's controls in addition to the group's
	 * own. `none` is a mode like any other; it reveals nothing.
	 */
	type?: { default: string; modes: Mode[] };
	/** Shown whatever the type. Empty when the type is the whole group. */
	controls: Control[];
	/**
	 * The id of the shared group this one is an instance of — `border`,
	 * `focus`, `handdrawn`. Every section that has it declares its own
	 * instance, built by the same factory in `sections/shared.ts`, so the
	 * instances differ only by prefix.
	 *
	 * In **Advanced** each instance is rendered inside its own section. In
	 * **Basic** they are lifted out, merged into one widget in Common, and
	 * moving that widget writes the matching control in every section at
	 * once.
	 *
	 * So there is only ever one set of controls — the per-section one — and
	 * the draft never changes shape. That is what makes the switch purely
	 * visual, with nothing migrated and nothing bound in two directions
	 * (ADR 0011). There is no global variable and no second level of cascade.
	 */
	shared?: string;
	/**
	 * What this section's value is, relative to the Basic widget's.
	 *
	 * Only Corners uses it. The radius differs across sections in 17 of 19
	 * themes but at a **constant ratio** — every daisy theme is `0.25rem` for
	 * controls and `0.5rem` for boxes, which is daisyUI's own `--radius-field`
	 * and `--radius-box`. So one Basic widget holds the base and each section
	 * multiplies. Themes with genuinely independent radii use Advanced.
	 */
	sharedFactor?: number;
	/** `row` lays the controls side by side. Default: row when all are boxes. */
	layout?: 'row' | 'stack';
	/** Every variable this group can write, its modes included. */
	vars: string[];
}

export type Entry = Control | Group;

/* A control's `type` is a string and it has no `controls`; a group is the
   other way round. One property tells them apart, so use that one. */
export const isGroup = (e: Entry): e is Group => 'controls' in e;

export interface Section {
	id: string;
	label: string;
	help?: string;
	/**
	 * The variable prefixes this section owns — `field` plus the component
	 * names for Fields, because a two-level cascade puts `--textarea-corners`
	 * in the same section as `--field-corners`. The drift check audits exactly
	 * the variables under the prefixes of the sections that exist.
	 */
	prefixes: string[];
	/**
	 * Variables under those prefixes that DELIBERATELY have no control.
	 *
	 * Every geometric length is one: the form offers a section's scale, and
	 * the formulas stay in `_defaults.scss` where nobody has to edit them.
	 * The rest are details a form would only make heavier. They are still
	 * variables, still declared once, still editable by hand in the file.
	 *
	 * Build this list by running `node scripts/check-theme-vars.mjs` and
	 * pasting what it names. Never from memory.
	 */
	internal?: string[];
	controls: Entry[];
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
 * Walking
 * ------------------------------------------------------------------ */

/** Every control in these entries: a group's own, and its modes'. */
export function eachControl(entries: Entry[], fn: (c: Control) => void): void {
	for (const e of entries) {
		if (isGroup(e)) {
			e.controls.forEach(fn);
			e.type?.modes.forEach((m) => m.controls.forEach(fn));
		} else {
			fn(e);
		}
	}
}

/** Every variable any control in these sections can write. */
export function declaredVars(sections: Section[]): Set<string> {
	const out = new Set<string>();
	for (const s of sections) {
		for (const e of s.controls) {
			if (isGroup(e)) e.vars.forEach((v) => out.add(v));
			eachControl([e], (c) => c.vars.forEach((v) => out.add(v)));
		}
	}
	return out;
}

/* ------------------------------------------------------------------ *
 * Values
 *
 * The state of a theme is its **variables**, not a record of what each
 * control was set to. A control has no value of its own: it reads one out of
 * the variables to show, and writes variables when it is moved.
 *
 * That is what makes Basic and Advanced purely visual (ADR 0011). In Basic
 * one control writes `--a --b --c`; in Advanced three controls write one
 * each. Switching shows different controls over the same variables, and
 * nothing is written until something is moved — so setting the Basic control
 * to 1, switching, and setting the middle one to 2 leaves `--a: 1, --b: 2,
 * --c: 1`, and going back to Basic does not undo it.
 * ------------------------------------------------------------------ */

/**
 * A length split into its number and its unit, for the slider that edits it.
 *
 * A four-value shorthand — `1px 0 1px 0`, an edge set — reads back as its
 * first non-zero part, which is exactly the number that was typed. Anything
 * else that is not `<number><unit>` (`calc(2.5em * var(--scale))`, `auto`,
 * `normal`) comes back as [0, fallback] and the form shows a text field
 * instead, because those are legitimate answers no slider can hold.
 */
export function splitLength(value: string, fallbackUnit = 'rem'): [number, string] {
	const parts = String(value).trim().split(/\s+/);
	const pick = parts.find((p) => p !== '0' && !/^0[a-z%]*$/i.test(p)) ?? parts[0] ?? '0';
	const m = pick.match(/^(-?[\d.]+)\s*([a-z%]*)$/i);
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

/**
 * The variable a control reads itself back from.
 *
 * Its own name when it writes one — that is either a real variable or a
 * sentinel no stylesheet reads — otherwise the first it writes.
 */
export function primaryVar(c: Control): string {
	return c.vars.includes(c.id) ? c.id : c.vars[0];
}

/** A width and its edges as one shorthand. All four on → just the length. */
export function edgeWidthToCss(v: EdgeWidth): string {
	const { width, sides } = v;
	const e = (s: keyof Sides) => (sides[s] ? width : '0');
	return sides.top && sides.right && sides.bottom && sides.left
		? width
		: `${e('top')} ${e('right')} ${e('bottom')} ${e('left')}`;
}

/** And back. A part at `0` is an edge that is off. */
export function edgeWidthFromCss(raw: string, fallbackUnit = 'px'): EdgeWidth {
	const p = raw.trim().split(/\s+/);
	const zero = (x: string) => x === '0' || /^0[a-z%]*$/i.test(x);
	if (p.length !== 4) {
		const [n, u] = splitLength(raw, fallbackUnit);
		const on = !zero(p[0] ?? '0');
		return { width: `${n}${u}`, sides: { top: on, right: on, bottom: on, left: on } };
	}
	const [n, u] = splitLength(raw, fallbackUnit);
	return {
		width: `${n}${u}`,
		sides: { top: !zero(p[0]), right: !zero(p[1]), bottom: !zero(p[2]), left: !zero(p[3]) }
	};
}

/** A control's value as CSS text. The only place a value becomes a string. */
function toCss(c: Control, v: unknown): string {
	if (c.type === 'shadows') return shadowsToCss(v as ShadowLayer[]);
	if (c.type === 'sides') return sidesToCss(v as Sides);
	if (c.type === 'edge-width') return edgeWidthToCss(v as EdgeWidth);
	if (c.type === 'toggle') return v ? '1' : '0';
	return String(v);
}

/**
 * What a box writes: its source, and its shade unless the source is literal.
 *
 * `own` writes `initial`, which is guaranteed-invalid — so the stylesheet's
 * `var(--x-color, <recipe>)` takes its fallback and derives. That is how a
 * `contrast` box tells a STATED ink ("this is the ink") from a derived one
 * ("work one out"): the stated colour is written, the derived one is an
 * absence. Resolving the derivation here instead produced a formula the
 * parser could only read back as a fixed colour, and every ink box reopened
 * in Custom.
 */
export function colorVars(c: ColorControl, v: ColorValue): Vars {
	const [src, shade] = c.vars;
	const out: Vars = {
		[src]: sourceToCss(v.source),
		[shade]: String(isLiteral(v.source) ? 0 : v.shade)
	};
	return out;
}

/** What a control shows, given the variables. Its default when they say nothing. */
export function readValue(c: Control, vars: Vars): unknown {
	if (c.type === 'color') {
		const [srcVar, shadeVar] = c.vars;
		if (vars[srcVar] === undefined && vars[shadeVar] === undefined) return c.default;
		return {
			source: sourceFromCss(vars[srcVar]),
			shade: Number(vars[shadeVar] ?? 0) || 0
		} satisfies ColorValue;
	}

	const raw = vars[primaryVar(c)];
	if (raw === undefined) return c.default;

	switch (c.type) {
		case 'sides':
			return sidesFromCss(raw) ?? c.default;
		case 'edge-width':
			return edgeWidthFromCss(raw, c.units[0]);
		case 'shadows':
			return shadowsFromCss(raw);
		case 'toggle':
			return raw === '1';
		case 'number':
		case 'percent': {
			const n = parseFloat(raw);
			return Number.isFinite(n) ? n : c.default;
		}
		case 'length': {
			const [n, u] = splitLength(raw, c.units[0]);
			return /^-?[\d.]+\s*[a-z%]*$/i.test(raw.trim()) ? raw.trim() : `${n}${u}`;
		}
		default:
			return raw;
	}
}

/**
 * What a control writes.
 *
 * Its own variable verbatim first, so it can always read itself back, then
 * whatever its writer makes of it — which may overwrite that variable with
 * something folded, as Border width does when it swallows the edges into a
 * shorthand. `vars` is the current set, for a writer that reads a sibling:
 * the Push press travels exactly as far as the Shadow group's offset.
 */
export function writeValue(c: Control, value: unknown, vars: Vars, group?: Group): Vars {
	const out: Vars = {};
	if (c.type === 'color') {
		Object.assign(out, colorVars(c, value as ColorValue));
	} else {
		out[primaryVar(c)] = toCss(c, value);
	}
	const w = writers[c.id];
	if (w) Object.assign(out, w(value, { ...vars, ...out }));

	/* A control inside a group re-runs its group's writer, because that is
	   the one that knows how to combine it with its siblings. Moving the
	   Border edges has to rebuild the width shorthand; moving a wobble
	   amplitude has to rebuild the eight-value corner recipe. Without this
	   the slider moves and nothing happens, which is the failure mode this
	   whole design is most prone to. */
	if (group?.type) {
		const mode = readMode(group, { ...vars, ...out });
		const mw = writers[`${group.id}:${mode}`];
		if (mw) Object.assign(out, mw(mode, { ...vars, ...out }));
	}
	return out;
}

/** Which mode of a group the variables are in. */
export function readMode(g: Group, vars: Vars): string {
	const v = vars[g.id];
	const modes = g.type?.modes ?? [];
	return modes.some((m) => m.id === v) ? v : (g.type?.default ?? modes[0]?.id ?? '');
}

/**
 * What picking a mode writes: the sentinel, then any of that mode's controls
 * the variables have nothing to say about, then the mode's own writer.
 *
 * The revealed controls run FIRST and the writer last, because the writer is
 * the one that knows how to combine them. A wobble amplitude on its own is
 * the number 1; what belongs in `--action-corners` is the recipe built from it.
 */
export function writeMode(g: Group, modeId: string, vars: Vars): Vars {
	const mode = g.type?.modes.find((m) => m.id === modeId) ?? g.type?.modes[0];
	if (!mode) return {};

	/* Changing mode resets that mode's controls to their defaults; staying in
	   the same mode keeps what the variables say.
	 *
	 * Without this, picking Solid after None reads the width back as the `0`
	 * that None wrote, and turning Hand-drawn on reads the strength back as
	 * the `0` that Off wrote — so the mode changes and nothing happens. The
	 * sentinel is what says which mode wrote the current numbers, which is a
	 * second job it does for free. Editing a control inside a mode goes
	 * through `writeValue`, not here, so nobody loses a value they typed. */
	const changing = vars[g.id] !== mode.id;

	const out: Vars = { [g.id]: mode.id };
	for (const c of mode.controls) {
		const value = changing ? c.default : readValue(c, vars);
		Object.assign(out, writeValue(c, value, { ...vars, ...out }));
	}
	const w = writers[`${g.id}:${mode.id}`];
	if (w) Object.assign(out, w(mode.id, { ...vars, ...out }));
	return out;
}

/**
 * Every variable at its default: the baseline a theme is a diff against.
 *
 * `serialise()` drops anything equal to it, which is how "default = absence"
 * stays true without any variable being left undeclared.
 */
export function neutralVars(sections: Section[]): Vars {
	const out: Vars = {};
	for (const s of sections) {
		for (const e of s.controls) {
			if (!isGroup(e)) {
				Object.assign(out, writeValue(e, e.default, out));
				continue;
			}
			/* The group's own controls first — a mode's writer may read them,
			   and the Radius a wobble builds on is one of them. */
			for (const c of e.controls) Object.assign(out, writeValue(c, c.default, out, e));
			if (e.type) Object.assign(out, writeMode(e, e.type.default, out));
		}
	}
	return out;
}

/** Read a theme file. A theme *is* its variables, so this is all it takes. */
export function parse(css: string): Vars {
	const out: Vars = {};
	for (const [, name, value] of css.matchAll(/--([a-z0-9-]+)\s*:\s*([^;}]+)/g)) {
		out[name] = value.trim();
	}
	return out;
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

/** `(value, vars) => Vars`. `vars` already holds what the control wrote. */
export type Writer = (value: unknown, vars: Vars) => Vars;

const writers: Record<string, Writer> = {};

/**
 * A section registers the logic for its controls that are not one-to-one.
 *
 * It lives with the section rather than here because the arithmetic that
 * turns "push, a quarter em" into four variables is part of what that section
 * means, and a reader looking at Fields should not have to come here to find
 * out what its Focus group does. Importing a section registers its writers,
 * which is why the form is only ever built from sections that were imported.
 *
 * A key is a control id, or `<group id>:<mode id>` for a mode.
 */
export function registerWriters(map: Record<string, Writer>) {
	Object.assign(writers, map);
}

/** Which edges a `sides` control is set to, or all four. */
export function sidesOf(vars: Vars, key: string): Sides {
	return sidesFromCss(vars[key] ?? '') ?? { top: true, right: true, bottom: true, left: true };
}

/** A box's value out of the variables, for a writer that needs to read one. */
export function colorOf(vars: Vars, id: string): ColorValue {
	return {
		source: sourceFromCss(vars[`${id}-color`]),
		shade: Number(vars[`${id}-shade`] ?? 0) || 0
	};
}
