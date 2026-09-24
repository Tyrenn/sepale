/**
 * Section — Field.
 *
 * `input`, `textarea`, `select`, `file-input`, `label`, `floating-label`,
 * `fieldset`, `validator`.
 *
 * From 26 top-level controls and 58 `--field-*` variables. The two-level
 * cascade — `var(--input-x, var(--field-x))` — stays in the CSS and **leaves
 * the form**: asking the same question once per component is what made this
 * section heavy.
 *
 * `validator` drives a field's accent to signal validity, referencing the
 * namespace without owning it (ADR 0009). It needs no control of its own.
 *
 * Spec: `docs/specs/theme-generator/04-field.md`.
 */

import type { Section } from '../schema.js';
import { border, box, disabled, focus, handDrawn, registerShared, scale, shadow } from './shared.js';

const P = 'field';

registerShared(P, { border: true, focus: true, disabled: true, handdrawn: true });

export const field: Section = {
	id: 'field',
	label: 'Field',
	prefixes: [
		'field',
		'input',
		'textarea',
		'select',
		'file-input',
		'label',
		'floating-label',
		'fieldset',
		'validator'
	],
	help: 'Everything you type into, and the labels around it.',
	internal: [
		/* Declared, editable by hand in the file, and deliberately NOT a
		   question this form asks. Most are geometry the section's Size
		   moves together — nobody edits a calc() in a form — and the rest
		   are the second level of the cascade, where a component restates
		   its section's answer under its own name.

		   Built by running `node scripts/check-theme-vars.mjs` and pasting
		   what it named. Never from memory. */
		'field-accent-color',
		'field-bg',
		'field-corners',
		'field-depth',
		'field-fg',
		'field-focus-accent-color',
		'field-focus-border-color',
		'field-focus-cast-color',
		'field-focus-cast-x',
		'field-focus-cast-y',
		'field-focus-outline-color',
		'field-focus-outline-offset',
		'field-focus-shadow-scale',
		'field-focus-x',
		'field-focus-y',
		'field-gap',
		'field-height',
		'field-padding-x',
		'field-picker-radius',
		'field-rest-rotate',
		'field-transition-duration',
		'field-transition-easing',
		'fieldset-label-fg',
		'fieldset-legend-fg',
		'file-input-button-gap',
		'file-input-button-padding-x',
		'file-input-button-size',
		'floating-label-bg',
		'floating-label-duration',
		'floating-label-padding-x',
		'floating-label-radius',
		'floating-label-rest-top',
		'floating-label-scale',
		'floating-label-size',
		'label-divider-mix',
		'label-divider-width',
		'label-gap',
		'label-inset',
		'label-mix',
		'select-chevron-inset',
		'select-chevron-size',
		'textarea-corners',
		'textarea-min-height',
		'textarea-padding-y',
		'validator-hint-gap'
	],
	controls: [
		scale(
			P,
			'Grows every frame a field has — its height, its padding, its inner gap — and never its text.'
		),

			box('field-bg', 'Field', {
				sources: [],
				source: 'color-background'
			}),
			box('field-fg', 'Field', {
				kind: 'contrast',
				inkOf: 'field-bg',
				follows: 'the field’s own fill',
				sources: [],
				source: 'own'
			}),
			box('field-placeholder', 'Placeholder', {
				kind: 'contrast',
				sources: [],
				source: 'own',
				shade: 0.35,
				help: 'Derived from Own, it fades the field’s own text rather than picking a grey that stops working on a dark theme.'
			}),


		border(P),
		shadow(P),
		focus(P),

		{
			id: 'field-label',
			label: 'Label',
			layout: 'row',
			help: 'A floating label sits on top of the field’s edge and paints over it. If its background does not match the field’s, you see a seam through the border — which is why this one stays a control while the rest of the label variables do not.',
			vars: ['floating-label-bg-color', 'floating-label-bg-shade'],
			controls: [
				box('floating-label-bg', 'Floating background', {
					sources: [],
					source: 'own'
				})
			]
		},

		disabled(P),
		handDrawn(P)
	]
};
