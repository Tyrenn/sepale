/**
 * Section — Container.
 *
 * `navbar`, `dock`, `menu`, `list`. `card` joins later.
 *
 * From **90 variables**, forty of them `menu` alone — the worst place in the
 * form and the biggest single win. `menu` was also the clearest evidence for
 * ADR 0010: forty slots that every family was already filling, a theme's worth
 * of declarations sitting in a family file.
 *
 * The section is named after the prefix it owns, like every other one: Action
 * owns `--action-*`, Field owns `--field-*`, Container owns `--container-*`.
 * "Layout" would own nothing.
 *
 * `tabs` and `breadcrumbs` have moved to Action.
 *
 * Spec: `docs/specs/theme-generator/06-container.md`.
 */

import type { Section } from '../schema.js';
import { border, box, disabled, handDrawn, registerShared, scale, shadow } from './shared.js';

const P = 'container';

registerShared(P, { border: true, disabled: true, handdrawn: true });

export const container: Section = {
	id: 'container',
	label: 'Container',
	prefixes: ['container', 'navbar', 'dock', 'menu', 'list'],
	help: 'The boxes that hold things: bars, docks, menus and lists.',
	internal: [
		/* Declared, editable by hand in the file, and deliberately NOT a
		   question this form asks. Most are geometry the section's Size
		   moves together — nobody edits a calc() in a form — and the rest
		   are the second level of the cascade, where a component restates
		   its section's answer under its own name.

		   Built by running `node scripts/check-theme-vars.mjs` and pasting
		   what it named. Never from memory. */
		'container-bg',
		'container-fg',
		'container-item-corners',
		'dock-bg',
		'dock-border-color',
		'dock-border-width',
		'dock-disabled-color',
		'list-active-bg',
		'list-active-fg',
		'list-bg',
		'list-divider-color',
		'list-divider-width',
		'list-hover-bg',
		'list-suggestions-border-color',
		'list-suggestions-shadow',
		'menu-active-bg',
		'menu-active-fg',
		'menu-bg',
		'menu-border',
		'menu-border-width',
		'menu-disabled-bg',
		'menu-disabled-fg',
		'menu-divider',
		'menu-divider-gap',
		'menu-divider-inset',
		'menu-divider-size',
		'menu-fg',
		'menu-focus-offset',
		'menu-focus-outline',
		'menu-gap',
		'menu-hover-bg',
		'menu-hover-fg',
		'menu-item-active-line',
		'menu-item-active-weight',
		'menu-item-bg',
		'menu-item-fg',
		'menu-item-gap',
		'menu-item-hover-line',
		'menu-item-line',
		'menu-item-px',
		'menu-item-py',
		'menu-item-radius',
		'menu-item-rotate',
		'menu-item-rotate-alt',
		'menu-item-transition',
		'menu-item-weight',
		'menu-p',
		'menu-rest-rotate',
		'menu-shadow',
		'menu-sub-indent',
		'menu-sub-transition',
		'menu-title-fg',
		'menu-title-px',
		'menu-title-py',
		'menu-title-size',
		'menu-title-tracking',
		'menu-title-transform',
		'menu-title-weight',
		'navbar-bg',
		'navbar-border',
		'navbar-border-width',
		'navbar-fg',
		'navbar-gap',
		'navbar-h',
		'navbar-px',
		'navbar-py',
		'navbar-shadow',
		'navbar-sticky-top'
	],
	controls: [
		scale(P, 'Grows the padding and the spacing of every box: menus, lists, the bars.'),

			box('container-bg', 'Box', { sources: [], source: 'color-surface-1' }),
			box('container-fg', 'Box', {
				kind: 'contrast',
				inkOf: 'container-bg',
				follows: 'the box’s own fill',
				sources: [],
				source: 'own'
			}),


		/* Boxes are twice the radius of the things inside them — daisyUI's own
		   `--radius-box` against `--radius-field`, and true in all 13 daisy
		   themes. That factor is what lets one Basic widget serve both. */
		border(P, ['own', 'text', 'surface'], '0.5rem'),
		shadow(P),

		{
			id: 'container-item',
			label: 'Item',
			layout: 'row',
			help: 'A row of a menu, a row of a list, and nothing else. Today these two answers are asked ELEVEN times across menu, list and dock. A hover is a wash of ink over the surface; an active row is the accent colour. The foreground of each follows by contrast, derived, never asked.',
			vars: [
				'container-item-hover-color',
				'container-item-hover-shade',
				'container-item-active-color',
				'container-item-active-shade'
			],
			controls: [
				box('container-item-hover', 'Hover', {
					sources: [],
					source: 'own',
					shade: 0.07
				}),
				box('container-item-active', 'Active', {
					sources: [],
					source: 'color-primary'
				})
			]
		},

		{
			id: 'container-divider',
			label: 'Divider',
			vars: [
				'container-divider-width',
				'container-divider-color',
				'container-divider-shade'
			],
			controls: [
				{
					id: 'container-divider-width',
					label: 'Width',
					type: 'length',
					default: '1px',
					min: 0,
					max: 4,
					step: 0.5,
					units: ['px'],
					vars: ['container-divider-width']
				},
				box('container-divider', 'Colour', {
					sources: [],
					source: 'own',
					shade: 0.08
				})
			]
		},

		disabled(P),
		handDrawn(P)
	]
};
