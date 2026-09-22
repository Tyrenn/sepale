/**
 * The component gallery's navigation, and nothing else.
 *
 * What used to live here as well — the active family, the active theme and the
 * edited tokens — is in `$lib/theme/store.svelte.ts` now. There is one
 * stylesheet (ADR 0010), so there is no family to pick and the theme is a
 * draft rather than a list of tokens.
 *
 * Which group a page belongs to, and in what order, is editorial: no rule says
 * a toggle is a form control and a chip is not.
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
	{ group: 'Other', ids: ['join', 'validator'] }
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
