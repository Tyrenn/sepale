/**
 * Theme model.
 *
 * A *family* is a set of opinionated classes **with its own set of
 * variables**. Sharing a variable name with another family is a convenience,
 * never a rule. This module does not decide what a family exposes: it reads
 * the declaration out of the registry and serialises the edited values back
 * to a drop-in `:root { … }` stylesheet.
 *
 * Which inks are parameters is the family's call: daisy exposes every one
 * (`--color-primary-content`, as daisyUI does), the others derive theirs in
 * CSS (`--color-on-primary`, see each family's `_root.scss`). A colour token
 * says which variable holds its ink through `on`; nothing here reads a name.
 */

/**
 * `edge-width` and `shadows` are still ONE variable each — what changes is the
 * control that edits it:
 *
 *   edge-width  a width and the edges it is drawn on, as the `border-width`
 *               shorthand (`1px 0 1px 0`). The parts at `0` ARE the edges that
 *               are off, so the value is its own record.
 *   shadows     a whole `box-shadow` value, edited as a list of layers.
 */
export type TokenType = 'color' | 'length' | 'number' | 'text' | 'edge-width' | 'shadows';

const TOKEN_TYPES: readonly string[] = ['color', 'length', 'number', 'text', 'edge-width', 'shadows'];

export interface ThemeToken {
	/** CSS custom property name without the leading `--`. */
	name: string;
	label: string;
	group: string;
	type: TokenType;
	value: string;
	/** Short help text shown under the control, explaining what it tunes. */
	description?: string;
	/** Slider bounds for `number` and `length` tokens (rendered as range + number input). */
	min?: number;
	max?: number;
	step?: number;
	/** Unit of a `length` token, written back with the number (e.g. `rem`, `px`). */
	unit?: string;
	/** Units the editor offers for this token. A length with several units gets
	 *  a unit picker next to its number; the CSS never cares which one is used. */
	units?: string[];
	/** Colours only: `surface` (a ground), `accent` (a colour things are
	 *  painted with) or `ink` (text and lines drawn over both). */
	kind?: string;
	/** Colours only: the variable (without `--`) holding the ink written on
	 *  this colour — another token of the family, or a value it derives. */
	on?: string;
}

/** Units offered for editable lengths. `%` is excluded on purpose: it is
 *  meaningless on a border and unreadable on a slider. */
export const LENGTH_UNITS = ['px', 'rem', 'em', 'ch'];

/**
 * Split a CSS length into its number and its unit (`"0.5rem"` → `[0.5, 'rem']`).
 *
 * A four-value shorthand — `1px 0 1px 0`, an edge set — reads back as its
 * first non-zero part, which is exactly the number that was typed.
 */
export function splitLength(value: string, fallbackUnit = 'rem'): [number, string] {
	const parts = String(value).trim().split(/\s+/);
	const pick = parts.find((p) => p !== '0' && !/^0[a-z%]*$/i.test(p)) ?? parts[0] ?? '0';
	const m = pick.match(/^(-?[\d.]+)\s*([a-z%]*)$/i);
	if (!m) return [0, fallbackUnit];
	return [parseFloat(m[1]!) || 0, m[2] || fallbackUnit];
}

/* ------------------------------------------------------------------ *
 * Edge width — a width and the edges it is drawn on, in one shorthand
 * ------------------------------------------------------------------ */

export interface Sides {
	top: boolean;
	right: boolean;
	bottom: boolean;
	left: boolean;
}

export interface EdgeWidth {
	width: string;
	sides: Sides;
}

export const SIDES = ['top', 'right', 'bottom', 'left'] as const;

/** A width and its edges as one shorthand. All four on → just the length. */
export function edgeWidthToCss({ width, sides }: EdgeWidth): string {
	const e = (s: keyof Sides) => (sides[s] ? width : '0');
	return sides.top && sides.right && sides.bottom && sides.left
		? width
		: `${e('top')} ${e('right')} ${e('bottom')} ${e('left')}`;
}

/** And back. A part at `0` is an edge that is off. */
export function edgeWidthFromCss(raw: string, fallbackUnit = 'px'): EdgeWidth {
	const p = raw.trim().split(/\s+/);
	const zero = (x: string) => x === '0' || /^0[a-z%]*$/i.test(x);
	const [n, u] = splitLength(raw, fallbackUnit);
	if (p.length !== 4) {
		const on = !zero(p[0] ?? '0');
		return { width: `${n}${u}`, sides: { top: on, right: on, bottom: on, left: on } };
	}
	return {
		width: `${n}${u}`,
		sides: { top: !zero(p[0] ?? '0'), right: !zero(p[1] ?? '0'), bottom: !zero(p[2] ?? '0'), left: !zero(p[3] ?? '0') }
	};
}

/* ------------------------------------------------------------------ *
 * Shadows — a `box-shadow` value, as a list of layers
 * ------------------------------------------------------------------ */

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

/** Split on the commas at depth 0 — not the ones inside `oklch(…)`. */
function splitTop(v: string, sep: (ch: string) => boolean): string[] {
	const out: string[] = [];
	let depth = 0;
	let acc = '';
	for (const ch of v) {
		if (ch === '(') depth++;
		if (ch === ')') depth--;
		if (depth === 0 && sep(ch)) {
			if (acc.trim()) out.push(acc.trim());
			acc = '';
		} else acc += ch;
	}
	if (acc.trim()) out.push(acc.trim());
	return out;
}

/**
 * And back. A layer is up to four lengths and a colour, in any order the
 * spec allows; whatever is not a length is the colour.
 */
export function shadowsFromCss(raw: string): ShadowLayer[] {
	const v = raw.trim();
	if (!v || v === 'none' || v === 'initial') return [];
	return splitTop(v, (ch) => ch === ',').map((layer) => {
		const words = splitTop(layer, (ch) => /\s/.test(ch));
		const inset = words.includes('inset');
		const rest = words.filter((w) => w !== 'inset');
		const lengths = rest.filter((x) => /^-?[\d.]/.test(x) || x.startsWith('calc('));
		const color = rest.filter((x) => !lengths.includes(x)).join(' ') || 'currentColor';
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

/* ------------------------------------------------------------------ *
 * Theme files
 * ------------------------------------------------------------------ */

/**
 * Read a theme file — any stylesheet of `--name: value;` declarations — back
 * into variables. A theme IS its variables, so this is all it takes; the
 * family then keeps the ones it declares (see `tokensForFamily`).
 */
export function parseTheme(css: string): { vars: Record<string, string>; scheme?: string } {
	const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
	const vars: Record<string, string> = {};
	for (const [, name, value] of clean.matchAll(/--([\w-]+)\s*:\s*([^;}]+)/g)) {
		vars[name!] = value!.trim();
	}
	const scheme = clean.match(/(?:^|[\s;{])color-scheme\s*:\s*([^;}]+)/)?.[1]?.trim();
	return { vars, scheme };
}

import { paramsByFamily, familyDocs } from './generated/registry.js';
import type { FamilyParam } from './generated/registry.js';

/**
 * Every family declares its own parameters in its SCSS; the build reads them
 * back out and the registry hands them here. Nothing in this file decides what
 * a family exposes — a family with five surfaces, or with none, or with a
 * typeface, comes through unchanged.
 */
function fromParam(p: FamilyParam): ThemeToken {
	return {
		name: p.name,
		label: p.label,
		group: p.group,
		type: (TOKEN_TYPES.includes(p.type) ? p.type : 'text') as TokenType,
		value: p.value,
		description: p.description,
		min: p.min,
		max: p.max,
		step: p.step,
		unit: p.unit,
		units: p.units,
		kind: p.kind,
		on: p.on
	};
}

/** A neutral fallback for the rare caller with no family in hand. */
export const defaultTheme: ThemeToken[] = (paramsByFamily[Object.keys(paramsByFamily)[0]!] ?? []).map(
	fromParam
);

/** Human label of each family's design language, taken from its own header. */
export const familyCategory: Record<string, string> = Object.fromEntries(
	Object.entries(familyDocs).map(([name, doc]) => [name, doc.after.replace(/^after /, '')])
);

/** Convert tokens into an inline `style` string for a preview element. */
export function tokensToInlineStyle(tokens: ThemeToken[]): string {
	return tokens.map((t) => `--${t.name}:${t.value}`).join(';');
}

/** Serialise tokens into a drop-in `:root { … }` stylesheet. */
export function serializeTheme(tokens: ThemeToken[]): string {
	const lines = tokens.map((t) => `\t--${t.name}: ${t.value};`);
	return `:root {\n${lines.join('\n')}\n}\n`;
}

/** Deep copy so callers can edit without mutating the schema. */
export function cloneTheme(tokens: ThemeToken[] = defaultTheme): ThemeToken[] {
	return tokens.map((t) => ({ ...t }));
}

/**
 * Editable tokens for a family: exactly the parameters that family declares,
 * seeded from `vars` (a theme's parsed custom properties) where present and
 * from the family's own default otherwise.
 */
export function tokensForFamily(family: string, vars: Record<string, string> = {}): ThemeToken[] {
	return (paramsByFamily[family] ?? []).map((p) => {
		const token = fromParam(p);
		return { ...token, value: vars[p.name] ?? token.value };
	});
}
