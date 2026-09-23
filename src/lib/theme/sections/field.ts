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
import { border, box, disabled, focus, handDrawn, radius, registerShared, scale, shadow } from './shared.js';

const P = 'field';

registerShared(P, { border: true, focus: true, disabled: true, handdrawn: true, shadow: true });

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
	internal: [],
	controls: [
		scale(
			P,
			'Grows every frame a field has — its height, its padding, its inner gap — and never its text.'
		),

		{
			id: 'field-fill',
			label: 'Fill',
			layout: 'row',
			vars: [
				'field-bg-color',
				'field-bg-shade',
				'field-fg-color',
				'field-fg-shade',
				'field-placeholder-color',
				'field-placeholder-shade'
			],
			controls: [
				box('field-bg', 'Background', {
					sources: ['surface'],
					source: 'color-surface-1'
				}),
				box('field-fg', 'Text', { sources: ['text', 'surface'], source: 'color-on-surface' }),
				box('field-placeholder', 'Placeholder', {
					sources: ['own', 'text'],
					source: 'own',
					shade: 0.35,
					help: 'Derived from Own, it fades the field’s own text rather than picking a grey that stops working on a dark theme.'
				})
			]
		},

		radius(P),
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
					sources: ['own', 'surface'],
					source: 'own'
				})
			]
		},

		disabled(P),
		handDrawn(P)
	]
};
