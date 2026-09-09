/**
 * Theme model.
 *
 * A *family* (the compiled CSS classes) owns the look — borders, elevation,
 * shadow recipes. A *theme* only tunes what is meant to be customized. This
 * module describes those editable tokens per family and serialises them back
 * to a drop-in `:root { … }` stylesheet.
 *
 * On-colors (`--color-on-*`) are never editable: every family derives them
 * from the seed color in CSS (see families/_derived-content.scss). So is
 * `--color-border`, which a theme may still set outright.
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

/** Semantic color slots shared by every family (same list as daisyUI). */
const SEMANTICS: { name: string; label: string; description: string }[] = [
	{ name: 'primary', label: 'Primary', description: 'Main brand/action color.' },
	{ name: 'secondary', label: 'Secondary', description: 'Secondary brand color.' },
	{ name: 'accent', label: 'Accent', description: 'Accent / highlight color.' },
	{ name: 'neutral', label: 'Neutral', description: 'Neutral dark color for plain buttons.' },
	{ name: 'info', label: 'Info', description: 'Informational state color.' },
	{ name: 'success', label: 'Success', description: 'Success state color.' },
	{ name: 'warning', label: 'Warning', description: 'Warning state color.' },
	{ name: 'error', label: 'Error', description: 'Error / danger state color.' }
];

/** Neutral light defaults used when a theme doesn't provide a value. */
const DEFAULTS: Record<string, string> = {
	'color-surface': 'oklch(100% 0 0)',
	'color-surface-high': 'oklch(96% 0 0)',
	'color-surface-peak': 'oklch(92% 0 0)',
	'color-primary': 'oklch(55% 0.21 264)',
	'color-secondary': 'oklch(60% 0.2 330)',
	'color-accent': 'oklch(65% 0.18 165)',
	'color-neutral': 'oklch(28% 0.01 285)',
	'color-info': 'oklch(70% 0.13 230)',
	'color-success': 'oklch(72% 0.16 145)',
	'color-warning': 'oklch(80% 0.15 85)',
	'color-error': 'oklch(63% 0.22 25)'
};

const color = (name: string, label: string, group: string, description: string): ThemeToken => ({
	name,
	label,
	group,
	type: 'color',
	value: DEFAULTS[name] ?? 'oklch(50% 0 0)',
	description
});

/** Color tokens. Content colors are not part of any schema — each family
 *  derives them from the seed color in CSS. */
function colorTokens(): ThemeToken[] {
	return [
		color('color-surface', 'Surface', 'Colors', 'The ground: page background, and the inside of fields — a field is a hole cut in the page.'),
		color('color-surface-high', 'Surface high', 'Colors', 'Objects resting on the ground: plain buttons, chips, skeletons.'),
		color('color-surface-peak', 'Surface peak', 'Colors', 'The most raised surface: the dock.'),
		...SEMANTICS.map((s) => color(`color-${s.name}`, s.label, 'Colors', s.description))
	];
}

/** Corner radii — themed in every family (same three slots as daisyUI). */
function shapeTokens(): ThemeToken[] {
	return [
		{ name: 'radius-field', label: 'Field radius', group: 'Shape', type: 'length', value: '0.5rem', min: 0, max: 2, step: 0.05, unit: 'rem', units: LENGTH_UNITS, description: 'Corner radius of fields: buttons, inputs, selects.' },
		{ name: 'radius-box', label: 'Box radius', group: 'Shape', type: 'length', value: '1rem', min: 0, max: 3, step: 0.05, unit: 'rem', units: LENGTH_UNITS, description: 'Corner radius of larger boxes: cards, lists, modals.' },
		{ name: 'radius-selector', label: 'Selector radius', group: 'Shape', type: 'length', value: '1rem', min: 0, max: 2, step: 0.05, unit: 'rem', units: LENGTH_UNITS, description: 'Corner radius of selectors: checkboxes, toggles, tabs.' }
	];
}

/** The element-size coefficient. Its own group: it is neither a colour nor a
 *  shape, and it is the one control that touches every component at once. */
function sizeTokens(): ThemeToken[] {
	return [
		{ name: 'scale', label: 'Element size', group: 'Size', type: 'number', value: '1', min: 0.75, max: 2, step: 0.05, description: "Grows every component's frame — paddings, heights, spacing. Text size is unaffected." }
	];
}

/** daisyUI effect variables — only the daisy family exposes them, matching
 *  the upstream theme API (--border / --depth). */
function daisyEffectTokens(): ThemeToken[] {
	return [
		{ name: 'border', label: 'Border width', group: 'Effects', type: 'length', value: '1px', min: 0, max: 3, step: 0.5, unit: 'px', units: LENGTH_UNITS, description: 'Width of component borders (daisyUI --border).' },
		{ name: 'depth', label: 'Depth', group: 'Effects', type: 'number', value: '1', min: 0, max: 1, step: 0.05, description: 'Subtle 3D depth effect on fields and selectors (daisyUI --depth, 0 or 1).' }
	];
}

/** Default theme — the generic token set (used as the schema by
 *  `tokensFromVars` and as a neutral baseline). */
export const defaultTheme: ThemeToken[] = [...colorTokens(), ...shapeTokens(), ...sizeTokens()];

/** Human label of each family's design language, shown in the UI. */
export const familyCategory: Record<string, string> = {
	daisy: 'Flat',
	poppy: 'Material'
};

/**
 * Family-specific look knobs, appended to the common tokens. Each family
 * exposes a different elevation/relief system, so the editor form changes
 * with the family. The family CSS reads these custom properties (with
 * fallbacks), so editing them re-skins the preview live.
 */
export const familyExtras: Record<string, ThemeToken[]> = {
	// Flat: daisyUI's own effect variables.
	daisy: daisyEffectTokens(),
	// Material: a soft directional drop shadow.
	poppy: [
		{ name: 'light-intensity', label: 'Shadow strength', group: 'Elevation', type: 'number', value: '1.4', min: 0, max: 3, step: 0.1, description: 'Opacity of the cast shadow. 0 = flat, higher = more lifted off the page.' },
		{ name: 'light-depth', label: 'Elevation height', group: 'Elevation', type: 'number', value: '2', min: 1, max: 5, step: 0.5, description: 'How far the shadow is thrown — the apparent height above the page.' }
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
 * Editable tokens for a given family: colors, radii, plus that family's own
 * look knobs (`familyExtras`). Values are seeded from `vars` (a theme's
 * parsed custom properties) where present, otherwise the schema default.
 */
export function tokensForFamily(family: string, vars: Record<string, string> = {}): ThemeToken[] {
	const schema = [
		...colorTokens(),
		...shapeTokens(),
		...sizeTokens(),
		...(familyExtras[family] ?? [])
	];
	return schema.map((t) => ({ ...t, value: vars[t.name] ?? t.value }));
}
