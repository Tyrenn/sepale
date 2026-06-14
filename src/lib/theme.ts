/**
 * Theme model.
 *
 * A *family* (the compiled CSS classes) owns the look — borders, elevation,
 * shadow recipes. A *theme* only tunes what is meant to be customized:
 * colors and corner radii. This module describes those editable tokens and
 * serialises them back to a drop-in `:root { … }` stylesheet that overrides
 * the family's own fallbacks.
 */

export type TokenType = 'color' | 'length' | 'number';

export interface ThemeToken {
	/** CSS custom property name without the leading `--`. */
	name: string;
	label: string;
	group: string;
	type: TokenType;
	value: string;
}

/** Default theme — a neutral light baseline derived from the flat family. */
export const defaultTheme: ThemeToken[] = [
	// Surfaces
	{ name: 'color-base-100', label: 'Base 100', group: 'Surfaces', type: 'color', value: 'oklch(100% 0 0)' },
	{ name: 'color-base-200', label: 'Base 200', group: 'Surfaces', type: 'color', value: 'oklch(96% 0 0)' },
	{ name: 'color-base-300', label: 'Base 300', group: 'Surfaces', type: 'color', value: 'oklch(92% 0 0)' },
	{ name: 'color-base-content', label: 'Base content', group: 'Surfaces', type: 'color', value: 'oklch(21% 0.006 285)' },
	// Semantic colors
	{ name: 'color-primary', label: 'Primary', group: 'Colors', type: 'color', value: 'oklch(55% 0.21 264)' },
	{ name: 'color-primary-content', label: 'Primary content', group: 'Colors', type: 'color', value: 'oklch(98% 0.01 264)' },
	{ name: 'color-secondary', label: 'Secondary', group: 'Colors', type: 'color', value: 'oklch(60% 0.2 330)' },
	{ name: 'color-secondary-content', label: 'Secondary content', group: 'Colors', type: 'color', value: 'oklch(98% 0.01 330)' },
	{ name: 'color-accent', label: 'Accent', group: 'Colors', type: 'color', value: 'oklch(65% 0.18 165)' },
	{ name: 'color-accent-content', label: 'Accent content', group: 'Colors', type: 'color', value: 'oklch(98% 0.01 165)' },
	{ name: 'color-neutral', label: 'Neutral', group: 'Colors', type: 'color', value: 'oklch(28% 0.01 285)' },
	{ name: 'color-neutral-content', label: 'Neutral content', group: 'Colors', type: 'color', value: 'oklch(96% 0 0)' },
	{ name: 'color-info', label: 'Info', group: 'Colors', type: 'color', value: 'oklch(70% 0.13 230)' },
	{ name: 'color-info-content', label: 'Info content', group: 'Colors', type: 'color', value: 'oklch(20% 0.03 230)' },
	{ name: 'color-success', label: 'Success', group: 'Colors', type: 'color', value: 'oklch(72% 0.16 145)' },
	{ name: 'color-success-content', label: 'Success content', group: 'Colors', type: 'color', value: 'oklch(20% 0.03 145)' },
	{ name: 'color-warning', label: 'Warning', group: 'Colors', type: 'color', value: 'oklch(80% 0.15 85)' },
	{ name: 'color-warning-content', label: 'Warning content', group: 'Colors', type: 'color', value: 'oklch(25% 0.04 85)' },
	{ name: 'color-error', label: 'Error', group: 'Colors', type: 'color', value: 'oklch(63% 0.22 25)' },
	{ name: 'color-error-content', label: 'Error content', group: 'Colors', type: 'color', value: 'oklch(98% 0.01 25)' },
	// Shape — the only structural knob a theme controls; the family owns the rest.
	{ name: 'radius-field', label: 'Field radius', group: 'Shape', type: 'length', value: '0.5rem' },
	{ name: 'radius-box', label: 'Box radius', group: 'Shape', type: 'length', value: '1rem' },
	{ name: 'radius-selector', label: 'Selector radius', group: 'Shape', type: 'length', value: '1rem' }
];

/** Convert tokens into an inline `style` string for a preview element. */
export function tokensToInlineStyle(tokens: ThemeToken[]): string {
	return tokens.map((t) => `--${t.name}:${t.value}`).join(';');
}

/** Serialise tokens into a drop-in `:root { … }` stylesheet. */
export function serializeTheme(tokens: ThemeToken[]): string {
	const lines = tokens.map((t) => `\t--${t.name}: ${t.value};`);
	return `:root {\n${lines.join('\n')}\n}\n`;
}

/** Deep copy so callers can edit without mutating the default. */
export function cloneTheme(tokens: ThemeToken[] = defaultTheme): ThemeToken[] {
	return tokens.map((t) => ({ ...t }));
}
