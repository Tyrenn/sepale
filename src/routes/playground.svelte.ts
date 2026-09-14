import { families, themesByFamily, tokensForFamily, familyCategory } from '$lib/index.js';
import type { ThemeToken } from '$lib/theme.js';
import type { ThemeData } from '$lib/generated/registry.js';

export { families };

/** Design language label for a family (Flat, Material, …). */
export function categoryFor(family: string): string {
	return familyCategory[family] ?? '';
}

/**
 * Which group a component page belongs to, and in what order. Editorial: no
 * rule says a toggle is a form control and a chip is not.
 *
 * The LIST of pages is not written here. It is read from the doc files, so a
 * page that exists is a page that appears — the way `fieldset` and `label`
 * had stylesheets, components and no entry in the nav for months.
 */
const GROUPS: { group: string; ids: string[] }[] = [
	{
		group: 'Form',
		ids: [
			'button',
			'input',
			'select',
			'textarea',
			'checkbox',
			'radio',
			'toggle',
			'range',
			'file-input',
			'fieldset',
			'label',
			'floating-label'
		]
	},
	{
		group: 'Display',
		ids: [
			'chip',
			'badge',
			'tabs',
			'loading',
			'progress',
			'radial-progress',
			'skeleton',
			'list',
			'text',
			'link',
			'swatch'
		]
	},
	{ group: 'Navigation', ids: ['breadcrumbs', 'menu', 'navbar', 'dock'] },
	{ group: 'Other', ids: ['join', 'validator', 'rounded'] }
];

/* Paths only — the modules themselves are never loaded here, or the nav would
   import the pages that import the nav. */
const pageIds = Object.keys(import.meta.glob('./components/docs/*.svelte')).map((path) =>
	path.slice('./components/docs/'.length, -'.svelte'.length)
);

/** `file-input` → `File input`, for a page nobody has given a label. */
function labelFor(id: string): string {
	const words = id.replace(/-/g, ' ');
	return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Gallery order: every component page there is, grouped. */
export const COMPONENTS: { group: string; items: { id: string; label: string }[] }[] = (() => {
	const placed = new Set(GROUPS.flatMap((g) => g.ids));
	const groups = GROUPS.map((g) => ({
		group: g.group,
		items: g.ids.filter((id) => pageIds.includes(id)).map((id) => ({ id, label: labelFor(id) }))
	}));
	/* A page nobody grouped still gets a link: the nav follows the files, not
	   the other way round. */
	const loose = pageIds.filter((id) => !placed.has(id)).sort();
	if (loose.length) {
		const other = groups.find((g) => g.group === 'Other')!;
		other.items.push(...loose.map((id) => ({ id, label: labelFor(id) })));
	}
	return groups.filter((g) => g.items.length);
})();

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
