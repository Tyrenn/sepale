import type { Control, Section } from '../schema.js';

/**
 * Section — Colours. Global, and the only section that is not about one kind
 * of component.
 *
 * The `--color-on-{semantic}` values are absent on purpose: they are derived
 * from their seed in CSS, and offering them would be offering a control that
 * undoes an automatic contrast check.
 *
 * Text and hairline are here, because two of the four looks this replaces
 * genuinely need them: a kit drawn in ink wants a solid black edge, not a
 * ten-percent wash of it. Their defaults are the derived expressions, so
 * leaving them alone changes nothing and writes nothing.
 */

const seed = (id: string, label: string, def: string, help?: string): Control => ({
	id,
	label,
	help,
	type: 'color',
	default: def,
	vars: [id]
});

export const colors: Section = {
	id: 'colors',
	label: 'Colours',
	prefixes: ['color'],
	help: 'The seeds. Everything drawn on them is derived, so there are fewer of these than you expect.',
	controls: [
		{
			id: 'color-scheme',
			label: 'Scheme',
			help: 'Which way the browser paints what it still owns — scrollbars, the canvas behind the page, the controls we do not restyle.',
			type: 'select',
			default: 'light',
			options: [
				{ value: 'light', label: 'Light' },
				{ value: 'dark', label: 'Dark' }
			],
			vars: ['color-scheme']
		},
		seed('color-surface-1', 'Surface 1', 'oklch(100% 0 0)', 'The ground: page background, and the inside of fields.'),
		seed('color-surface-2', 'Surface 2', 'oklch(96% 0 0)', 'Objects resting on the ground: plain buttons, chips, skeletons.'),
		seed('color-surface-3', 'Surface 3', 'oklch(92% 0 0)', 'Chrome pinned to the edge of the screen: dock, navbar.'),
		seed('color-surface-4', 'Surface 4', 'oklch(88% 0 0)', 'A fourth ground, for looks that stack more levels.'),
		seed('color-primary', 'Primary', 'oklch(55% 0.21 264)'),
		seed('color-secondary', 'Secondary', 'oklch(60% 0.2 330)'),
		seed('color-accent', 'Accent', 'oklch(65% 0.18 165)'),
		seed('color-neutral', 'Neutral', 'oklch(28% 0.01 285)'),
		seed('color-info', 'Info', 'oklch(70% 0.13 230)'),
		seed('color-success', 'Success', 'oklch(72% 0.16 145)'),
		seed('color-warning', 'Warning', 'oklch(80% 0.15 85)'),
		seed('color-error', 'Error', 'oklch(63% 0.22 25)'),
		seed(
			'color-on-surface',
			'Text',
			'oklch(from var(--color-surface-1) clamp(0.145, (0.66 - l) * 999, 0.97) min(c, 0.03) h)',
			'Derived from Surface 1 by default: a light ground gets near-black text, a dark one near-white.'
		),
		seed(
			'color-border',
			'Hairline',
			'color-mix(in oklab, var(--color-on-surface) 10%, #0000)',
			'A wash of the text colour by default. A look that draws in ink sets it solid.'
		)
	]
};
