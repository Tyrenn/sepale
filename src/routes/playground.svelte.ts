import { families, themesByFamily, familyCategory } from '$lib/index.js';
import { parseTheme, tokensFrom, type ThemeToken } from '$lib/theme.js';
import {
	paramsByFamily,
	familyDocs,
	type ThemeData,
	type FamilyDoc,
	type FamilyParam
} from '$lib/generated/registry.js';
import {
	classesByFamily,
	axesByFamily,
	flagsByFamily,
	type ClassInfo
} from '$lib/generated/components.js';
import { asset } from '$app/paths';
import { pageIds } from './(sidebar)/components/page-ids.js';
import { local, type LocalFamily } from './local-families.svelte.js';

/** The families compiled here, the ones the build knows. */
export { families };

/* ── Built and local families, read the same way ───────────────────────
   A family loaded from disk (local-families.svelte.ts) is read by the app
   rather than by the build, so nothing generated knows it. Everything that
   asks about "the active family" asks through these and gets either answer. */

const localOf = (family: string): LocalFamily | undefined => local.list.find((f) => f.name === family);

/** Whether a family was loaded from disk rather than built here. */
export const isLocal = (family: string) => localOf(family) !== undefined;

/** Every family the sidebar offers: the built ones, then the loaded ones. */
export function allFamilies(): string[] {
	return [...families, ...local.list.map((f) => f.name)];
}

export function paramsFor(family: string): FamilyParam[] {
	return localOf(family)?.params ?? paramsByFamily[family] ?? [];
}

export function docFor(family: string): FamilyDoc {
	return localOf(family)?.doc ?? familyDocs[family] ?? { title: family, after: '', blurb: '', changes: [] };
}

/** Every class the family ships, classified. */
export function classesFor(family: string): Record<string, ClassInfo> {
	return localOf(family)?.classification.classes ?? classesByFamily[family] ?? {};
}

/** component → axis → the values this family ships. */
export function axesFor(family: string): Record<string, Record<string, string[]>> {
	return localOf(family)?.classification.axes ?? axesByFamily[family] ?? {};
}

/** component → the flags this family can paint. */
export function flagsFor(family: string): Record<string, string[]> {
	return localOf(family)?.classification.flags ?? flagsByFamily[family] ?? {};
}

/** Where the page loads the family's stylesheet from. */
export function stylesheetFor(family: string): string {
	return localOf(family)?.url ?? asset(`/families/${family}.css`);
}

/** The stylesheet itself, for an export or a bundle. */
export async function stylesheetText(family: string): Promise<string> {
	const loaded = localOf(family);
	if (loaded) return loaded.css;
	const res = await fetch(asset(`/families/${family}.css`));
	if (!res.ok) throw new Error(`/families/${family}.css: ${res.status}`);
	return res.text();
}

/** Design language label for a family (Flat, Material, …). */
export function categoryFor(family: string): string {
	const loaded = localOf(family);
	if (loaded) return loaded.doc.after.replace(/^after /, '') || 'local';
	return familyCategory[family] ?? '';
}

/** The editable tokens of a family, seeded from a theme's variables. */
export function tokensFor(family: string, vars: Record<string, string> = {}): ThemeToken[] {
	return tokensFrom(paramsFor(family), vars);
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
	{ group: 'Actions', ids: ['button', 'link', 'join'] },
	{ group: 'Form', ids: ['input', 'textarea', 'select', 'combobox', 'number-input', 'date-picker', 'calendar', 'color-picker', 'file-input', 'file-dropzone', 'checkbox', 'radio', 'toggle', 'switch', 'range', 'rating', 'chips-input', 'editable'] },
	{ group: 'Form layout', ids: ['label', 'floating-label', 'fieldset', 'validator'] },
	{ group: 'Display', ids: ['text', 'avatar', 'badge', 'chip', 'swatch', 'bubble', 'card', 'stat', 'carousel'] },
	{ group: 'Feedback', ids: ['alert', 'toast', 'loading', 'progress', 'radial-progress', 'skeleton', 'empty-state'] },
	{ group: 'Data', ids: ['data-handler', 'data-control', 'table', 'grid', 'list', 'kanban', 'file-explorer'] },
	{ group: 'Navigation', ids: ['menu', 'tabs', 'breadcrumbs', 'steps', 'pagination', 'dock'] },
	{ group: 'Layout', ids: ['navbar', 'sidebar', 'drawer', 'footer', 'hero', 'divider', 'collapse', 'accordion'] },
	{ group: 'Overlay', ids: ['dialog', 'dropdown', 'tooltip'] },
	{ group: 'Mockups', ids: ['mobile-frame', 'window-frame', 'laptop-frame'] },
	{ group: 'Other', ids: [] }
];

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
	/* A loaded family brings no theme files: its parameters' defaults are one. */
	if (isLocal(family)) return [{ name: 'default', label: 'Default', scheme: 'light', vars: {} }];
	return themesByFamily[family] ?? themesByFamily[families[0]!] ?? [];
}

/* What a prerendered page is written in, so it opens without a flash of another family. */
const initialFamily = families.includes('peony') ? 'peony' : families[0]!;
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
	tokens: tokensFor(initialFamily, initialTheme?.vars ?? {})
});

function load(theme: ThemeData | undefined) {
	if (!theme) return;
	playground.theme = theme.name;
	playground.scheme = theme.scheme;
	playground.tokens = tokensFor(playground.family, theme.vars);
}

/** A family or a theme has been chosen, by hand or by the draw. */
let chosen = false;

/** Switch family: load that family's first theme into the editor. */
export function selectFamily(family: string) {
	chosen = true;
	playground.family = family;
	load(themesFor(family)[0]);
}

/** Switch theme for the current family. */
export function selectTheme(name: string) {
	chosen = true;
	load(themesFor(playground.family).find((t) => t.name === name));
}

/**
 * Open the app on a family and a theme drawn at random, unless one has been
 * chosen already: what was picked on the home page follows into the app.
 */
export function drawAtRandom() {
	if (chosen) return;
	const pick = <T>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)]!;
	selectFamily(pick(families));
	const theme = pick(themesFor(playground.family));
	if (theme) selectTheme(theme.name);
}

let lastImport: { name: string; css: string } | null = null;

/**
 * Open a theme file in the editor, for the current family.
 *
 * A theme IS its variables, so the file is read back into them and the family
 * keeps the ones it declares; anything else in the file is ignored, and a
 * parameter the file does not mention keeps the family's default. The name is
 * the file's, so an export downloads under the name it came in with.
 */
export function importTheme(css: string, name = 'imported') {
	lastImport = { name, css };
	const { vars, scheme } = parseTheme(css);
	playground.theme = name;
	playground.scheme = scheme ?? playground.scheme;
	playground.tokens = tokensFor(playground.family, vars);
}

/** Reset edits back to the active theme's original values. */
export function resetTheme() {
	/* An imported theme is not in the registry: reset goes back to the file. */
	if (lastImport?.name === playground.theme) importTheme(lastImport.css, lastImport.name);
	else selectTheme(playground.theme);
}

/**
 * A family loaded from disk has just been (re)loaded. Already active, it keeps
 * the values in the editor — an author reloading after each save keeps their
 * theme — and takes the parameters the new file declares; otherwise it
 * becomes the active family.
 */
export function showLoaded(family: string) {
	if (playground.family !== family) return selectFamily(family);
	const values = Object.fromEntries(playground.tokens.map((t) => [t.name, t.value]));
	playground.tokens = tokensFor(family, values);
}

/** A family is gone: leave it if it was the one on show. */
export function leaveFamily(family: string) {
	if (playground.family === family) selectFamily(families.includes('peony') ? 'peony' : families[0]!);
}
