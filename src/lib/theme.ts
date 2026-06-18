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
	/** Short help text shown under the control, explaining what it tunes. */
	description?: string;
	/** Slider bounds for `number` tokens (rendered as range + number input). */
	min?: number;
	max?: number;
	step?: number;
}

/** Default theme — a neutral light baseline shared by every family. These are
 *  the tokens common to all families: surfaces, semantic colors and radii. */
export const defaultTheme: ThemeToken[] = [
	// Surfaces
	{ name: 'color-base-100', label: 'Base 100', group: 'Surfaces', type: 'color', value: 'oklch(100% 0 0)', description: 'Page background — the lowest surface.' },
	{ name: 'color-base-200', label: 'Base 200', group: 'Surfaces', type: 'color', value: 'oklch(96% 0 0)', description: 'Raised surface (cards, sidebar, default buttons).' },
	{ name: 'color-base-300', label: 'Base 300', group: 'Surfaces', type: 'color', value: 'oklch(92% 0 0)', description: 'Borders and the deepest sunken surface.' },
	{ name: 'color-base-content', label: 'Base content', group: 'Surfaces', type: 'color', value: 'oklch(21% 0.006 285)', description: 'Default text/icon color on base surfaces.' },
	// Semantic colors
	{ name: 'color-primary', label: 'Primary', group: 'Colors', type: 'color', value: 'oklch(55% 0.21 264)', description: 'Main brand/action color.' },
	{ name: 'color-primary-content', label: 'Primary content', group: 'Colors', type: 'color', value: 'oklch(98% 0.01 264)', description: 'Text/icon color on a primary fill.' },
	{ name: 'color-secondary', label: 'Secondary', group: 'Colors', type: 'color', value: 'oklch(60% 0.2 330)', description: 'Secondary brand color.' },
	{ name: 'color-secondary-content', label: 'Secondary content', group: 'Colors', type: 'color', value: 'oklch(98% 0.01 330)', description: 'Text/icon color on a secondary fill.' },
	{ name: 'color-accent', label: 'Accent', group: 'Colors', type: 'color', value: 'oklch(65% 0.18 165)', description: 'Accent / highlight color.' },
	{ name: 'color-accent-content', label: 'Accent content', group: 'Colors', type: 'color', value: 'oklch(98% 0.01 165)', description: 'Text/icon color on an accent fill.' },
	{ name: 'color-neutral', label: 'Neutral', group: 'Colors', type: 'color', value: 'oklch(28% 0.01 285)', description: 'Neutral dark color for plain buttons.' },
	{ name: 'color-neutral-content', label: 'Neutral content', group: 'Colors', type: 'color', value: 'oklch(96% 0 0)', description: 'Text/icon color on a neutral fill.' },
	{ name: 'color-info', label: 'Info', group: 'Colors', type: 'color', value: 'oklch(70% 0.13 230)', description: 'Informational state color.' },
	{ name: 'color-info-content', label: 'Info content', group: 'Colors', type: 'color', value: 'oklch(20% 0.03 230)', description: 'Text/icon color on an info fill.' },
	{ name: 'color-success', label: 'Success', group: 'Colors', type: 'color', value: 'oklch(72% 0.16 145)', description: 'Success state color.' },
	{ name: 'color-success-content', label: 'Success content', group: 'Colors', type: 'color', value: 'oklch(20% 0.03 145)', description: 'Text/icon color on a success fill.' },
	{ name: 'color-warning', label: 'Warning', group: 'Colors', type: 'color', value: 'oklch(80% 0.15 85)', description: 'Warning state color.' },
	{ name: 'color-warning-content', label: 'Warning content', group: 'Colors', type: 'color', value: 'oklch(25% 0.04 85)', description: 'Text/icon color on a warning fill.' },
	{ name: 'color-error', label: 'Error', group: 'Colors', type: 'color', value: 'oklch(63% 0.22 25)', description: 'Error / danger state color.' },
	{ name: 'color-error-content', label: 'Error content', group: 'Colors', type: 'color', value: 'oklch(98% 0.01 25)', description: 'Text/icon color on an error fill.' },
	// Shape — corner radii. The family owns elevation/borders; radii are themed.
	{ name: 'radius-field', label: 'Field radius', group: 'Shape', type: 'length', value: '0.5rem', description: 'Corner radius of fields: buttons, inputs, selects.' },
	{ name: 'radius-box', label: 'Box radius', group: 'Shape', type: 'length', value: '1rem', description: 'Corner radius of larger boxes: cards, lists, modals.' },
	{ name: 'radius-selector', label: 'Selector radius', group: 'Shape', type: 'length', value: '1rem', description: 'Corner radius of selectors: checkboxes, toggles, tabs.' }
];

/** Human label of each family's design language, shown in the UI. */
export const familyCategory: Record<string, string> = {
	daisy: 'Flat',
	poppy: 'Material',
	magnolia: 'Neumorphism',
	iris: 'Glassmorphism'
};

/**
 * Family-specific look knobs, appended to the common tokens. Each family
 * exposes a different elevation/relief system, so the editor form changes
 * with the family. The family CSS reads these custom properties (with
 * fallbacks), so editing them re-skins the preview live.
 */
export const familyExtras: Record<string, ThemeToken[]> = {
	// Flat: no elevation system — colors + radii only.
	daisy: [],
	// Material: a soft directional drop shadow.
	poppy: [
		{ name: 'light-intensity', label: 'Shadow strength', group: 'Elevation', type: 'number', value: '1.4', min: 0, max: 3, step: 0.1, description: 'Opacity of the cast shadow. 0 = flat, higher = more lifted off the page.' },
		{ name: 'light-depth', label: 'Elevation height', group: 'Elevation', type: 'number', value: '2', min: 1, max: 5, step: 0.5, description: 'How far the shadow is thrown — the apparent height above the page.' }
	],
	// Glass: backdrop blur + translucency.
	iris: [
		{ name: 'glass-blur', label: 'Frost blur', group: 'Glass', type: 'length', value: '10px', description: 'Backdrop blur radius behind translucent surfaces.' },
		{ name: 'glass-opacity', label: 'Surface opacity', group: 'Glass', type: 'number', value: '0.5', min: 0.1, max: 0.95, step: 0.05, description: 'Fill opacity of fields. Lower = more see-through glass.' }
	],
	// Neumorphism: a dual light/dark soft relief.
	magnolia: [
		{ name: 'nm-intensity', label: 'Relief intensity', group: 'Relief', type: 'number', value: '0.15', min: 0.03, max: 0.4, step: 0.01, description: 'Contrast between the light and dark shadow. Higher = deeper extrusion.' },
		{ name: 'nm-blur', label: 'Relief softness', group: 'Relief', type: 'number', value: '2', min: 1, max: 4, step: 0.1, description: 'Shadow blur relative to its offset. Higher = softer, puffier surface.' }
	]
};

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

/**
 * Build an editable token array from a `name → value` map (e.g. the parsed
 * vars of a theme file). Keeps the schema (labels/groups/types) from
 * `defaultTheme` and only swaps in matching values.
 */
export function tokensFromVars(vars: Record<string, string>): ThemeToken[] {
	return cloneTheme(defaultTheme).map((t) => ({
		...t,
		value: vars[t.name] ?? t.value
	}));
}

/**
 * Editable tokens for a given family: the common tokens plus that family's
 * own look knobs (`familyExtras`). Values are seeded from `vars` (a theme's
 * parsed custom properties) where present, otherwise the schema default.
 */
export function tokensForFamily(family: string, vars: Record<string, string> = {}): ThemeToken[] {
	const schema = [...defaultTheme, ...(familyExtras[family] ?? [])];
	return schema.map((t) => ({ ...t, value: vars[t.name] ?? t.value }));
}
