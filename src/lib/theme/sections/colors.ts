/**
 * Section — Colours.
 *
 * The tokens every other section derives from. No components of its own.
 *
 * **A theme sets nine colours** — surface-1 and the eight semantics — instead
 * of fifteen. Surfaces 2 to 4, the ink and the border ship in Derived mode,
 * show the colour they resolve to, and are tiles you open to override rather
 * than questions you must answer.
 *
 * `--color-on-<semantic>` stays derived and is **never a control**: nobody
 * knows at authoring time what a theme's accent will be, and a control there
 * would be a control that undoes an automatic contrast check.
 *
 * Spec: `docs/specs/theme-generator/01-colours.md`.
 */

import type { Control, Section } from '../schema.js';
import { box } from './shared.js';

/**
 * Light or dark. Two exclusive buttons, above every section — it is the first
 * thing you answer and it is not a section of its own.
 */
export const scheme: Control = {
	id: 'color-scheme',
	label: 'Scheme',
	type: 'choice',
	default: 'light',
	options: [
		{ value: 'light', label: 'Light' },
		{ value: 'dark', label: 'Dark' }
	],
	vars: ['color-scheme']
};

/** The eight meanings, with the seed each ships at. */
const SEMANTICS: [name: string, seed: string][] = [
	['primary', 'oklch(55% 0.21 264)'],
	['secondary', 'oklch(60% 0.2 330)'],
	['accent', 'oklch(65% 0.18 165)'],
	['neutral', 'oklch(28% 0.01 285)'],
	['info', 'oklch(70% 0.13 230)'],
	['success', 'oklch(72% 0.16 145)'],
	['warning', 'oklch(80% 0.15 85)'],
	['error', 'oklch(63% 0.22 25)']
];

export const colors: Section = {
	id: 'colors',
	label: 'Colours',
	prefixes: ['color'],
	help: 'Set surface-1 and the eight semantics. Everything else derives, and shows what it derived to.',
	internal: [

		/* Derived in `_derived-content.scss` from the seeds above, and never a
		   control: a control here would undo an automatic contrast check. */
		...SEMANTICS.map(([c]) => `color-on-${c}`),
		/* Declared, editable by hand in the file, and deliberately NOT a
		   question this form asks. Most are geometry the section's Size
		   moves together — nobody edits a calc() in a form — and the rest
		   are the second level of the cascade, where a component restates
		   its section's answer under its own name.

		   Built by running `node scripts/check-theme-vars.mjs` and pasting
		   what it named. Never from memory. */
		'color-accent',
		'color-border',
		'color-error',
		'color-info',
		'color-neutral',
		'color-on-surface',
		'color-primary',
		'color-secondary',
		'color-success',
		'color-surface-1',
		'color-surface-2',
		'color-surface-3',
		'color-surface-4',
		'color-warning'
	],
	controls: [
		scheme,

		{
			id: 'color-surfaces',
			label: 'Surfaces',
			layout: 'row',
			help: 'surface-1 is the seed, so its box offers Custom only. The rest derive from it — a light seed darkens, a dark seed lightens, so the same numbers serve a theme and its dark twin.',
			vars: [
				'color-surface-1-color',
				'color-surface-1-shade',
				'color-surface-2-color',
				'color-surface-2-shade',
				'color-surface-3-color',
				'color-surface-3-shade',
				'color-surface-4-color',
				'color-surface-4-shade',
				'color-on-surface-color',
				'color-on-surface-shade',
				'color-border-color',
				'color-border-shade'
			],
			controls: [
				box('color-surface-1', 'Surface 1', {
					sources: [],
					source: 'oklch(100% 0 0)',
					help: 'The seed. It has nothing to derive from, so this box is Custom only.'
				}),
				box('color-on-surface', 'Surface 1', {
					inkOf: 'color-surface-1',
					kind: 'contrast',
					sources: [],
					source: 'own',
					follows: 'surface 1',
					help: 'Full contrast against the seed, not a shade of it: it snaps to near-black or near-white and keeps a whisper of the seed’s hue. The intensity trims that result; 0 leaves it alone.'
				}),
				box('color-surface-2', 'Surface 2', {
					sources: [],
					source: 'color-surface-1',
					shade: 0.04
				}),
				box('color-surface-3', 'Surface 3', {
					sources: [],
					source: 'color-surface-1',
					shade: 0.08
				}),
				box('color-surface-4', 'Surface 4', {
					sources: [],
					source: 'color-surface-1',
					shade: 0.12
				}),
				box('color-border', 'Border', {
					sources: [],
					source: 'color-surface-1',
					shade: 0.1,
					help: 'A hairline is the surface a few points away. Deriving it from the ink instead gives a dark grey rule, which is almost never what a border is.'
				})
			]
		},

		{
			id: 'color-semantics',
			label: 'Semantics',
			layout: 'row',
			help: 'The eight meanings. What is written ON each of them is derived automatically and is never a control.',
			vars: SEMANTICS.flatMap(([c]) => [
				`color-${c}-color`,
				`color-${c}-shade`,
				`color-on-${c}-color`,
				`color-on-${c}-shade`
			]),
			/* Two tiles per meaning: the colour, and what is written on it.
			   The ink ships DERIVED — a full-contrast reading of the colour
			   beside it, which is right far more often than not — and is a
			   control because "far more often than not" is not always, and a
			   brand's own text colour is a real thing to want. */
			controls: SEMANTICS.flatMap(([c, seed]) => [
				box(`color-${c}`, c[0].toUpperCase() + c.slice(1), {
					sources: [],
					source: seed
				}),
				box(`color-on-${c}`, c[0].toUpperCase() + c.slice(1), {
					sources: [],
					/* `own` — the colour it is written on. It writes nothing, and
					   `_derived-content.scss` derives from `--color-${c}`. */
					source: 'own',
					kind: 'contrast',
					follows: c,
					inkOf: `color-${c}`,
					help: `What is written on ${c}. Derived it reads the colour beside it and flips; Custom states an ink of your own.`
				})
			])
		}
	]
};
