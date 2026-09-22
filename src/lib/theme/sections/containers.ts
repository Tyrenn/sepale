import type { Control, Section } from '../schema.js';

/**
 * Section — Containers (`fieldset`, `list`, `menu`, `navbar`, `dock`).
 *
 * `join` is in the section's components and has no controls at all. It glues
 * adjacent controls into one group — squaring the corners where they meet and
 * pulling their borders together — by reading its neighbours' radii and
 * writing them back per corner. There is no answer there a look would ever
 * want to change, and the proof is that its 125 rules were byte-identical
 * across all four families before the merge.
 *
 * `menu` is the opposite case and the largest block in the kit: forty values,
 * and every family was already filling exactly these rather than writing
 * rules of its own. It is the clearest evidence for ADR 0010 in the codebase
 * — a theme's worth of declarations that had been living in a family file.
 */

const c = (id: string, label: string, def: string, help?: string): Control => ({
	id,
	label,
	help,
	type: 'color',
	default: def,
	vars: [id]
});

const len = (
	id: string,
	label: string,
	def: string,
	min: number,
	max: number,
	step: number,
	units: string[],
	help?: string
): Control => ({ id, label, help, type: 'length', default: def, min, max, step, units, vars: [id] });

const num = (id: string, label: string, def: number, min: number, max: number, step: number, help?: string): Control =>
	({ id, label, help, type: 'number', default: def, min, max, step, vars: [id] });

const text = (id: string, label: string, def: string, help?: string): Control =>
	({ id, label, help, type: 'length', default: def, min: 0, max: 2, step: 0.025, units: ['em', 'rem'], vars: [id] });

export const containers: Section = {
	id: 'containers',
	label: 'Containers',
	prefixes: ['container', 'fieldset', 'list', 'menu', 'navbar', 'dock'],
	help: 'The things that hold other things: field groups, row lists, menus, the bar across the top and the bar along the bottom.',
	controls: [
		/* ── Shared by the boxes ──────────────────────────────────── */
		len('container-corners', 'Corners', '0.5rem', 0, 3, 0.025, ['rem', 'px', 'em']),
		len('container-item-corners', 'Row corners', 'var(--container-corners)', 0, 3, 0.025, ['rem', 'px', 'em']),
		len('container-border-width', 'Border width', '1px', 0, 6, 0.5, ['px', 'em']),
		{
			id: 'container-shadow',
			label: 'Shadow',
			type: 'select',
			default: 'none',
			options: [
				{ value: 'none', label: 'None' },
				{
					value:
						'0 1px 3px color-mix(in oklab, var(--color-on-surface) 8%, #0000), 0 3px 8px color-mix(in oklab, var(--color-on-surface) 5%, #0000)',
					label: 'Ambient'
				},
				{
					value: 'var(--action-shadow-1-x) var(--action-shadow-1-y) 0 0 var(--action-shadow-1-color)',
					label: 'Same as a button'
				}
			],
			vars: ['container-shadow']
		},

		/* ── The group of fields ──────────────────────────────────── */
		c('fieldset-legend-fg', 'Legend', 'var(--color-on-surface)'),
		c('fieldset-label-fg', 'Field label', 'color-mix(in oklch, var(--color-on-surface) 60%, #0000)'),

		/* ── The column of rows ───────────────────────────────────── */
		c('list-bg', 'List ground', 'var(--color-surface-1)'),
		len('list-divider-width', 'Row divider', 'var(--container-border-width)', 0, 4, 0.5, ['px', 'em']),
		c('list-divider-color', 'Row divider colour', 'color-mix(in oklab, var(--color-on-surface) 5%, #0000)'),
		c('list-hover-bg', 'Row hover', 'color-mix(in oklab, var(--color-on-surface) 7%, #0000)'),
		c('list-active-bg', 'Row selected', 'color-mix(in oklab, var(--color-primary) 12%, #0000)'),
		c('list-active-fg', 'Row selected text', 'var(--color-primary)'),
		c('list-suggestions-border-color', 'Suggestions border', 'var(--color-surface-2)'),
		{
			id: 'list-suggestions-shadow',
			label: 'Suggestions shadow',
			help: 'A list that floats over the page needs to read as floating.',
			type: 'select',
			default: '0 8px 16px -4px color-mix(in oklab, var(--color-on-surface) 10%, #0000)',
			options: [
				{
					value: '0 8px 16px -4px color-mix(in oklab, var(--color-on-surface) 10%, #0000)',
					label: 'Lifted'
				},
				{ value: '0 0 0 0 #0000', label: 'None' }
			],
			vars: ['list-suggestions-shadow']
		},

		/* ── The bar across the top ───────────────────────────────── */
		c('navbar-bg', 'Top bar', 'var(--color-surface-3)'),
		c('navbar-fg', 'Top bar text', 'var(--color-on-surface)'),
		c('navbar-border', 'Top bar divider', '#0000'),
		len('navbar-border-width', 'Top bar divider width', '0', 0, 6, 0.5, ['px', 'em']),
		{
			id: 'navbar-shadow',
			label: 'Top bar shadow',
			type: 'select',
			default: 'var(--container-shadow)',
			options: [
				{ value: 'var(--container-shadow)', label: 'Inherit' },
				{ value: 'none', label: 'None' },
				{
					value: '0 var(--action-shadow-1-y) 0 0 var(--action-shadow-1-color)',
					label: 'Hard, below'
				}
			],
			vars: ['navbar-shadow']
		},
		len('navbar-h', 'Top bar height', 'calc(4em * var(--scale))', 2, 8, 0.05, ['em'],
			'A minimum: the content may exceed it.'),
		len('navbar-px', 'Top bar side padding', 'calc(0.5em * var(--scale))', 0, 4, 0.05, ['em']),
		len('navbar-py', 'Top bar padding', 'calc(0.5em * var(--scale))', 0, 3, 0.05, ['em']),
		len('navbar-gap', 'Top bar gap', 'calc(0.5em * var(--scale))', 0, 3, 0.05, ['em']),
		len('navbar-sticky-top', 'Sticky bar rest', '0px', 0, 8, 0.25, ['rem', 'px'],
			'Where a sticky bar comes to rest. It answers to the viewport rather than to its content, so it stays absolute.'),

		/* ── The bar along the bottom ─────────────────────────────── */
		c('dock-bg', 'Bottom bar', 'var(--color-surface-3)'),
		len('dock-border-width', 'Bottom bar edge', '0.5px', 0, 4, 0.5, ['px', 'em']),
		c('dock-border-color', 'Bottom bar edge colour', 'color-mix(in oklab, var(--color-on-surface) 5%, #0000)'),
		c('dock-disabled-color', 'Bottom bar disabled', 'color-mix(in oklch, var(--color-on-surface) 10%, #0000)'),

		/* ── The column of links ──────────────────────────────────── */
		c('menu-bg', 'Menu ground', 'var(--color-surface-2)'),
		c('menu-fg', 'Menu text', 'var(--color-on-surface)'),
		c('menu-border', 'Menu border', '#0000'),
		len('menu-border-width', 'Menu border width', '0', 0, 6, 0.5, ['px', 'em']),
		{
			id: 'menu-shadow',
			label: 'Menu shadow',
			type: 'select',
			default: 'none',
			options: [
				{ value: 'none', label: 'None' },
				{ value: 'var(--container-shadow)', label: 'Inherit' },
				{
					value: 'var(--action-shadow-1-x) var(--action-shadow-1-y) 0 0 var(--action-shadow-1-color)',
					label: 'Same as a button'
				}
			],
			vars: ['menu-shadow']
		},
		len('menu-p', 'Menu padding', 'calc(0.5em * var(--scale))', 0, 2, 0.025, ['em']),
		len('menu-gap', 'Between rows', '0px', 0, 1, 0.025, ['em', 'px']),
		len('menu-rest-rotate', 'Menu angle', '0deg', -3, 3, 0.1, ['deg']),

		len('menu-item-py', 'Row padding', 'calc(0.375em * var(--scale))', 0, 2, 0.025, ['em']),
		len('menu-item-px', 'Row side padding', 'calc(0.75em * var(--scale))', 0, 3, 0.025, ['em']),
		len('menu-item-gap', 'Row gap', 'calc(0.5em * var(--scale))', 0, 2, 0.025, ['em']),
		len('menu-item-radius', 'Row corners', 'var(--container-item-corners)', 0, 2, 0.025, ['rem', 'px']),
		c('menu-item-bg', 'Row ground', '#0000'),
		c('menu-item-fg', 'Row text', 'inherit'),
		c('menu-hover-bg', 'Row hover', 'color-mix(in oklab, var(--color-on-surface) 10%, #0000)'),
		c('menu-hover-fg', 'Row hover text', 'var(--color-on-surface)'),
		c('menu-active-bg', 'Row current', 'var(--color-neutral)'),
		c('menu-active-fg', 'Row current text', 'var(--color-on-neutral)'),
		c('menu-disabled-bg', 'Row disabled', '#0000'),
		c('menu-disabled-fg', 'Row disabled text', 'color-mix(in oklab, var(--color-on-surface) 20%, #0000)'),
		{
			id: 'menu-focus-outline',
			label: 'Row focus ring',
			type: 'select',
			default: '2px solid currentColor',
			options: [
				{ value: '2px solid currentColor', label: 'Ink' },
				{ value: '2px solid var(--color-primary)', label: 'Primary' },
				{ value: 'var(--container-border-width) solid var(--color-border)', label: 'Hairline' }
			],
			vars: ['menu-focus-outline']
		},
		len('menu-focus-offset', 'Row focus offset', '2px', -6, 6, 0.5, ['px']),

		/* A row's own line, drawn INSIDE it. Off at transparent. */
		c('menu-item-line', 'Row line', '#0000',
			'Drawn just inside the row rather than around it, so it never fights the focus ring.'),
		c('menu-item-hover-line', 'Row line on hover', 'var(--menu-item-line)'),
		c('menu-item-active-line', 'Row line when current', 'var(--menu-item-line)'),
		len('menu-item-rotate', 'Row angle', '0deg', -3, 3, 0.1, ['deg']),
		len('menu-item-rotate-alt', 'Every other row', '0deg', -3, 3, 0.1, ['deg'],
			'Give it the opposite sign and a column of rows reads as written rather than printed.'),
		num('menu-item-weight', 'Row weight', 400, 100, 900, 50),
		num('menu-item-active-weight', 'Current row weight', 400, 100, 900, 50),

		len('menu-title-py', 'Group label padding', 'calc(0.5em * var(--scale))', 0, 2, 0.025, ['em']),
		len('menu-title-px', 'Group label side padding', 'calc(0.75em * var(--scale))', 0, 3, 0.025, ['em']),
		c('menu-title-fg', 'Group label', 'color-mix(in oklab, var(--color-on-surface) 40%, #0000)'),
		text('menu-title-size', 'Group label size', '1em'),
		num('menu-title-weight', 'Group label weight', 600, 100, 900, 50),
		{
			id: 'menu-title-transform',
			label: 'Group label case',
			type: 'select',
			default: 'none',
			options: [
				{ value: 'none', label: 'As written' },
				{ value: 'uppercase', label: 'Uppercase' }
			],
			vars: ['menu-title-transform']
		},
		text('menu-title-tracking', 'Group label tracking', 'normal'),

		c('menu-divider', 'Divider', 'color-mix(in oklab, var(--color-on-surface) 10%, #0000)'),
		len('menu-divider-size', 'Divider width', '1px', 0, 4, 0.5, ['px', 'em']),
		len('menu-divider-gap', 'Divider spacing', 'calc(0.5em * var(--scale))', 0, 2, 0.025, ['em']),
		len('menu-divider-inset', 'Divider inset', 'calc(1em * var(--scale))', 0, 3, 0.025, ['em']),

		len('menu-sub-indent', 'Sub-menu indent', 'calc(1em * var(--scale))', 0, 3, 0.025, ['em']),
		{
			id: 'menu-item-transition',
			label: 'Row transition',
			type: 'select',
			default:
				'color 0.2s cubic-bezier(0, 0, 0.2, 1), background-color 0.2s cubic-bezier(0, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0, 0, 0.2, 1)',
			options: [
				{
					value:
						'color 0.2s cubic-bezier(0, 0, 0.2, 1), background-color 0.2s cubic-bezier(0, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0, 0, 0.2, 1)',
					label: 'Eased'
				},
				{ value: 'background-color 0.12s, color 0.12s', label: 'Quick' },
				{ value: 'none', label: 'None' }
			],
			vars: ['menu-item-transition']
		},
		{
			id: 'menu-sub-transition',
			label: 'Sub-menu transition',
			type: 'select',
			default: '0.25s cubic-bezier(0, 0, 0.2, 1)',
			options: [
				{ value: '0.25s cubic-bezier(0, 0, 0.2, 1)', label: 'Eased' },
				{ value: '0.16s cubic-bezier(0.16, 1, 0.3, 1)', label: 'Snappy' },
				{ value: '0.15s ease-out', label: 'Quick' }
			],
			vars: ['menu-sub-transition']
		}
	]
};
