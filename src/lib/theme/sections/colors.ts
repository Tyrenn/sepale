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
	help: 'Five fills named for what they paint, one ink, and the eight semantics. Everything else derives, and shows what it derived to.',
	internal: [

		/* Derived from the fill each is written ON, and never a control: a
		   control there would undo an automatic contrast check. The eight
		   semantics resolve in `_derived-content.scss`, the four other fills
		   in `_defaults.scss` — sharing the page ink's shade, so that "how
		   soft is the text" stays ONE answer. */
		...SEMANTICS.map(([c]) => `color-on-${c}`),
		'color-on-card',
		'color-on-panel',
		'color-on-action',
		'color-on-field',
		/* Declared, editable by hand in the file, and deliberately NOT a
		   question this form asks. Most are geometry the section's Size
		   moves together — nobody edits a calc() in a form — and the rest
		   are the second level of the cascade, where a component restates
		   its section's answer under its own name.

		   Built by running `node scripts/check-theme-vars.mjs` and pasting
		   what it named. Never from memory. */
		'color-accent',
		'color-action',
		'color-background',
		'color-border',
		'color-card',
		'color-error',
		'color-field',
		'color-info',
		'color-neutral',
		'color-on-background',
		'color-panel',
		'color-primary',
		'color-secondary',
		'color-success',
		'color-warning'
	],
	controls: [
		scheme,

		{
			id: 'color-fills',
			label: 'Fills',
			layout: 'row',
			help: 'Five fills named for what they paint, not numbered. Background is the seed; the other four step away from it, and the direction is automatic — a light page darkens, a dark page lightens, so the same numbers serve a theme and its dark twin.',
			vars: [
				'color-background-color',
				'color-background-shade',
				'color-card-color',
				'color-card-shade',
				'color-panel-color',
				'color-panel-shade',
				'color-action-color',
				'color-action-shade',
				'color-field-color',
				'color-field-shade',
				'color-on-background-color',
				'color-on-background-shade',
				'color-border-color',
				'color-border-shade'
			],
			controls: [
				box('color-background', 'Background', {
					sources: [],
					source: 'oklch(100% 0 0)',
					help: 'The page. The seed every other fill steps away from, so this box is Custom only — it has nothing to follow.'
				}),
				box('color-on-background', 'Background', {
					inkOf: 'color-background',
					kind: 'contrast',
					sources: [],
					source: 'own',
					follows: 'the page',
					help: 'The ONE ink of the kit. Full contrast against the page, not a shade of it: it snaps to near-black or near-white and keeps a whisper of the page’s hue. Its intensity trims that result, and the other four fills reuse it, so how soft the text is stays one answer. A coloured text is a class — .text-primary — not a theme value.'
				}),
				box('color-card', 'Card', {
					sources: [],
					source: 'color-background',
					shade: 0.04,
					help: 'A card, a dropdown, a list, a menu — anything resting ON the page and counted.'
				}),
				box('color-panel', 'Panel', {
					sources: [],
					source: 'color-background',
					shade: 0.08,
					help: 'Chrome pinned to an edge of the screen: a navbar, a dock.'
				}),
				box('color-action', 'Action', {
					sources: [],
					source: 'color-background',
					shade: 0.12,
					help: 'What you press or pick: a plain button, a tab, a chip.'
				}),
				box('color-field', 'Field', {
					sources: [],
					source: 'color-background',
					shade: 0,
					help: 'The inside of an input, a select, a textarea. Equal to the page in most themes — but sunflower tints the page and leaves the fields white, which is why it has a name.'
				}),
				box('color-border', 'Border', {
					sources: [],
					source: 'color-background',
					shade: 0.1,
					help: 'A hairline is the page a few points away. Deriving it from the ink instead gives a dark grey rule, which is almost never what a border is.'
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
