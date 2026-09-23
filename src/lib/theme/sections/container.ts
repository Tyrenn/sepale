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
import { border, box, disabled, handDrawn, radius, registerShared, scale, shadow } from './shared.js';

const P = 'container';

registerShared(P, { border: true, disabled: true, handdrawn: true, shadow: true });

export const container: Section = {
	id: 'container',
	label: 'Container',
	prefixes: ['container', 'navbar', 'dock', 'menu', 'list'],
	help: 'The boxes that hold things: bars, docks, menus and lists.',
	internal: [],
	controls: [
		scale(P, 'Grows the padding and the spacing of every box: menus, lists, the bars.'),

		{
			id: 'container-surface',
			label: 'Surface',
			layout: 'row',
			help: 'A bar, a dock, a menu and a list are the same surface. A theme that wants a darker navbar sets `--navbar-bg` in the file; it is not a question worth asking four times.',
			vars: [
				'container-bg-color',
				'container-bg-shade',
				'container-fg-color',
				'container-fg-shade'
			],
			controls: [
				box('container-bg', 'Background', { sources: ['surface'], source: 'color-surface-1' }),
				box('container-fg', 'Text', { sources: ['text', 'surface'], source: 'color-on-surface' })
			]
		},

		/* Boxes are twice the radius of the things inside them — daisyUI's own
		   `--radius-box` against `--radius-field`, and true in all 13 daisy
		   themes. That factor is what lets one Basic widget serve both. */
		radius(P, 2, '0.5rem'),
		border(P),
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
					sources: ['own', 'text'],
					source: 'own',
					shade: 0.07
				}),
				box('container-item-active', 'Active', {
					sources: ['semantic', 'own'],
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
					sources: ['own', 'text', 'surface'],
					source: 'own',
					shade: 0.08
				})
			]
		},

		disabled(P),
		handDrawn(P)
	]
};
