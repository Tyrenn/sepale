/**
 * The shipped themes.
 *
 * A theme **is** its variables (`CONTEXT.md`), so a theme is a CSS file and
 * nothing else — there is no TypeScript literal mirroring it any more. The
 * form loads one by fetching it and handing it to `parse()`, which is three
 * lines, and the file it loads is byte for byte the file a user downloads.
 *
 * That removes the whole class of bug where the draft in this file and the
 * CSS in `static/themes/` drift apart, which is what `gen:themes` used to
 * exist to catch.
 *
 * ⚠ MIGRATION PENDING — `docs/specs/theme-generator/99-migration.md`.
 * The nineteen files in `static/themes/` are still written against the OLD
 * variable names (`--action-hover-mix`, `--action-corner`, `--field-focus`…).
 * They load without error and set variables nothing reads, so they render as
 * the neutral theme until they are regenerated.
 */

export interface Preset {
	name: string;
	label: string;
	/** Relative to the site root, as served. */
	url: string;
}

const FAMILIES: [family: string, names: string[]][] = [
	[
		'daisy',
		[
			'light',
			'dark',
			'bumblebee',
			'retro',
			'halloween',
			'forest',
			'lofi',
			'autumn',
			'business',
			'night',
			'nord',
			'coffee',
			'caramellatte'
		]
	],
	['dahlia', ['light', 'jade']],
	['cosmos', ['paper', 'slate']],
	['sunflower', ['light', 'mint']]
];

export const PRESETS: Preset[] = FAMILIES.flatMap(([family, names]) =>
	names.map((n) => ({
		name: `${family}-${n}`,
		label: `${family} ${n}`,
		url: `/themes/${family}-${n}.css`
	}))
);
