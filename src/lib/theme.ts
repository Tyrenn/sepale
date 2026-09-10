/**
 * Theme model.
 *
 * A *family* is a set of opinionated classes **with its own set of
 * variables**. Sharing a variable name with another family is a convenience,
 * never a rule. This module does not decide what a family exposes: it reads
 * the declaration out of the registry and serialises the edited values back
 * to a drop-in `:root { … }` stylesheet.
 *
 * On-colors (`--color-on-*`) are never editable: every family derives them
 * from the seed color in CSS (see families/_derived-content.scss). So is
 * `--color-border`, which a theme may still set outright.
 */

export type TokenType = 'color' | 'length' | 'number' | 'text';

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
}

/** Units offered for editable lengths. `%` is excluded on purpose: it is
 *  meaningless on a border and unreadable on a slider. */
export const LENGTH_UNITS = ['px', 'rem', 'em', 'ch'];

/** Split a CSS length into its number and its unit (`"0.5rem"` → `[0.5, 'rem']`). */
export function splitLength(value: string, fallbackUnit = 'rem'): [number, string] {
	const m = String(value).trim().match(/^(-?[\d.]+)\s*([a-z%]*)$/i);
	if (!m) return [0, fallbackUnit];
	return [parseFloat(m[1]) || 0, m[2] || fallbackUnit];
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
		type: (p.type === 'color' || p.type === 'length' ? p.type : p.type === 'number' ? 'number' : 'text') as TokenType,
		value: p.value,
		description: p.description,
		min: p.min,
		max: p.max,
		step: p.step,
		unit: p.unit,
		units: p.units
	};
}

/** A neutral fallback for the rare caller with no family in hand. */
export const defaultTheme: ThemeToken[] = (paramsByFamily[Object.keys(paramsByFamily)[0]] ?? []).map(
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
