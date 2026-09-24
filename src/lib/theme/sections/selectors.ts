/**
 * Section — Selectors.
 *
 * `checkbox`, `radio`, `toggle`, `range`, `swatch` — the five things you tick,
 * drag and pick.
 *
 * From **67** controls. The name was confusing only because `tabs` was in
 * here; it has moved to Action. **`Controls` is a forbidden name** — it is the
 * glossary's word for one field of this form, and a project that deleted
 * "family" over exactly this kind of collision cannot introduce another.
 *
 * Where the 67 came from: the form exposed BOTH levels of the cascade. The
 * CSS already does `var(--radio-checked-bg, var(--selector-checked-bg))`, and
 * the form asked the section-level question and then asked it again for radio,
 * toggle, range and swatch. Those variables keep existing and stop being
 * questions.
 *
 * A per-component control survives only where the component genuinely
 * diverges: `--range-trail-height`.
 *
 * Spec: `docs/specs/theme-generator/05-selectors.md`.
 */

import type { Section } from '../schema.js';
import { border, box, disabled, focus, handDrawn, registerShared, scale, shadow } from './shared.js';

const P = 'selector';

registerShared(P, { border: true, focus: true, disabled: true, handdrawn: true });

export const selectors: Section = {
	id: 'selectors',
	label: 'Selectors',
	prefixes: ['selector', 'checkbox', 'radio', 'toggle', 'range', 'swatch'],
	help: 'The things you tick, drag and pick. Checked and unchecked are painted separately, because most looks change everything at once.',
	internal: [
		/* Declared, editable by hand in the file, and deliberately NOT a
		   question this form asks. Most are geometry the section's Size
		   moves together — nobody edits a calc() in a form — and the rest
		   are the second level of the cascade, where a component restates
		   its section's answer under its own name.

		   Built by running `node scripts/check-theme-vars.mjs` and pasting
		   what it named. Never from memory. */
		'checkbox-mark-duration',
		'radio-checked-bg',
		'radio-checked-border-color',
		'range-corners',
		'range-fill',
		'range-progress',
		'range-rail',
		'range-thumb-bg',
		'range-thumb-border-color',
		'range-thumb-border-width',
		'range-thumb-corners',
		'range-thumb-halo',
		'range-thumb-shadow',
		'range-thumb-size',
		'range-track-bg',
		'range-track-border-color',
		'range-track-border-width',
		'range-track-corners',
		'selector-bg',
		'selector-checked-bg',
		'selector-checked-border-color',
		'selector-checked-mark',
		'selector-corners',
		'selector-depth',
		'selector-disabled-opacity',
		'selector-focus-offset',
		'selector-mark',
		'selector-padding',
		'selector-size',
		'selector-transition-duration',
		'selector-transition-easing',
		'swatch-active-shadow',
		'swatch-active-x',
		'swatch-active-y',
		'swatch-border-color',
		'swatch-border-width',
		'swatch-check-size',
		'swatch-checks',
		'swatch-corners',
		'swatch-font-weight',
		'swatch-rest-rotate',
		'swatch-shadow',
		'swatch-size',
		'swatch-transition-duration',
		'toggle-checked-thumb-bg',
		'toggle-checked-track-bg',
		'toggle-checked-track-border-color',
		'toggle-corners',
		'toggle-padding',
		'toggle-size',
		'toggle-thumb-bg',
		'toggle-thumb-corners',
		'toggle-thumb-shadow',
		'toggle-track-bg',
		'toggle-track-border-color'
	],
	controls: [
		scale(
			P,
			'Grows the boxes you tick, the slider and the swatches. Not the toggle’s travel: its thumb needs room to move whatever the boxes do.'
		),

		{
			id: 'selector-unchecked',
			label: 'Unchecked',
			layout: 'row',
			vars: [
				'selector-bg-color',
				'selector-bg-shade',
				'selector-mark-color',
				'selector-mark-shade'
			],
			controls: [
				box('selector-bg', 'Background', { sources: [], source: 'color-background' }),
				box('selector-mark', 'Mark', {
					kind: 'contrast', sources: [], source: 'own' })
			]
		},

		{
			id: 'selector-checked',
			label: 'Checked',
			layout: 'row',
			help: 'The box’s fill, and the colour of the tick drawn inside it. Two answers because daisy ticks in primary with a white mark and sunflower ticks in white with a black one — and Mark derived from Own means the tick stays legible without anyone setting it.',
			vars: [
				'selector-checked-bg-color',
				'selector-checked-bg-shade',
				'selector-checked-mark-color',
				'selector-checked-mark-shade'
			],
			controls: [
				box('selector-checked-bg', 'Background', {
					sources: [],
					source: 'color-primary'
				}),
				box('selector-checked-mark', 'Mark', {
					kind: 'contrast', sources: [], source: 'own' })
			]
		},

		/* 0.5rem, not the shared 0.25rem: a selector is daisyUI's
		   --radius-selector, and all nineteen themes were measured against
		   that. The form said 0.25 while the stylesheet drew 0.5, so retro
		   asked for 0.25 and got nothing written. */
		border(P, undefined, '0.5rem'),
		shadow(P),
		focus(P),

		{
			id: 'selector-slider',
			label: 'Slider',
			help: 'The trail is the shadow the thumb casts; a clip-path cuts it to a band. The band’s HEIGHT is the entire difference between daisy’s fat bar and everyone else’s thin rail — which is why the slider needed no structural variant after all.',
			vars: [
				'range-trail-height',
				'range-track-color',
				'range-track-shade',
				'range-fill-color',
				'range-fill-shade'
			],
			controls: [
				{
					id: 'range-trail-height',
					label: 'Trail height',
					type: 'length',
					default: '0.5em',
					min: 0.1,
					max: 1,
					step: 0.05,
					units: ['em', 'rem', 'px'],
					vars: ['range-trail-height']
				},
				box('range-track', 'Track', { sources: [], source: 'own', shade: 0.1 }),
				box('range-fill', 'Fill', { sources: [], source: 'color-primary' })
			]
		},

		disabled(P),
		handDrawn(P)
	]
};
