import { families, themesByFamily, tokensForFamily, familyCategory } from '$lib/index.js';
import type { ThemeToken } from '$lib/theme.js';
import type { ThemeData } from '$lib/generated/registry.js';

export { families };

/** Design language label for a family (Flat, Material, …). */
export function categoryFor(family: string): string {
	return familyCategory[family] ?? '';
}

/** Gallery order: every component previewed on the page, grouped. */
export const COMPONENTS: { group: string; items: { id: string; label: string }[] }[] = [
	{
		group: 'Form',
		items: [
			{ id: 'button', label: 'Button' },
			{ id: 'input', label: 'Input' },
			{ id: 'select', label: 'Select' },
			{ id: 'textarea', label: 'Textarea' },
			{ id: 'checkbox', label: 'Checkbox' },
			{ id: 'radio', label: 'Radio' },
			{ id: 'toggle', label: 'Toggle' },
			{ id: 'range', label: 'Range' },
			{ id: 'file-input', label: 'File input' }
		]
	},
	{
		group: 'Display',
		items: [
			{ id: 'chip', label: 'Chip' },
			{ id: 'badge', label: 'Badge' },
			{ id: 'tab', label: 'Tab' },
			{ id: 'loading', label: 'Loading' },
			{ id: 'progress', label: 'Progress' },
			{ id: 'radial-progress', label: 'Radial progress' },
			{ id: 'skeleton', label: 'Skeleton' },
			{ id: 'list', label: 'List' },
			{ id: 'text', label: 'Text' },
			{ id: 'link', label: 'Link' }
		]
	},
	{
		group: 'Navigation',
		items: [
			{ id: 'breadcrumbs', label: 'Breadcrumbs' },
			{ id: 'dock', label: 'Dock' }
		]
	},
	{
		group: 'Other',
		items: [
			{ id: 'join', label: 'Join' },
			{ id: 'validator', label: 'Validator' }
		]
	}
];

/** Themes available for a family (falls back to the first family's). */
export function themesFor(family: string): ThemeData[] {
	return themesByFamily[family] ?? themesByFamily[families[0]] ?? [];
}

const initialFamily = families[0];
const initialTheme = themesFor(initialFamily)[0];

/** Shared, reactive playground state. */
export const playground = $state<{
	family: string;
	theme: string;
	scheme: string;
	tokens: ThemeToken[];
}>({
	family: initialFamily,
	theme: initialTheme?.name ?? '',
	scheme: initialTheme?.scheme ?? 'light',
	tokens: tokensForFamily(initialFamily, initialTheme?.vars ?? {})
});

function load(theme: ThemeData | undefined) {
	if (!theme) return;
	playground.theme = theme.name;
	playground.scheme = theme.scheme;
	playground.tokens = tokensForFamily(playground.family, theme.vars);
}

/** Switch family: load that family's first theme into the editor. */
export function selectFamily(family: string) {
	playground.family = family;
	load(themesFor(family)[0]);
}

/** Switch theme for the current family. */
export function selectTheme(name: string) {
	load(themesFor(playground.family).find((t) => t.name === name));
}

/** Reset edits back to the active theme's original values. */
export function resetTheme() {
	selectTheme(playground.theme);
}
