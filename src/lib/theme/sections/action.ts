/**
 * Section — Action.
 *
 * Everything you click: `button`, `link`, `join`, `tabs`, `breadcrumbs`.
 *
 * `join` is deliberately unthemed — it is geometry that reads its neighbours'
 * corners. `breadcrumbs` declares no decoration of its own and reads the Link
 * group; its colour variants are **classes**, not theme controls, because the
 * theme decides what a breadcrumb looks like and the page decides which
 * colour this one is.
 *
 * `tabs` reads `--action-*` for its **shape** — corners, border width, weight,
 * motion, press — and keeps only two colours of its own. Never `--action-bg`:
 * a tab that took the button's fill would be a filled button, and `tabs-lift`
 * would die. Reading another component's namespace without owning it is the
 * pattern ADR 0009 sanctions.
 *
 * Spec: `docs/specs/theme-generator/03-action.md`.
 */

import type { ColorValue, Group, Section, Vars } from '../schema.js';
import { registerWriters, sourceToCss, splitLength } from '../schema.js';
import {
	border,
	box,
	disabled,
	focus,
	handDrawn,
	radius,
	registerShared,
	scale,
	shadow,
	typography
} from './shared.js';

const P = 'action';

registerShared(P, {
	border: true,
	focus: true,
	disabled: true,
	handdrawn: true,
	shadow: { relief: true }
});

/* ------------------------------------------------------------------ *
 * Hover — one box, because direction is automatic
 *
 * The four old modes (none / darken / lighten / tint) collapse into the
 * source: Own fill is the darken-or-lighten every flat look does, and Text is
 * dahlia's tint, which keeps the theme rather than going grey.
 *
 * The press derives from the hover at 1.6, as it always has. A press
 * identical to its hover reads as nothing having happened.
 * ------------------------------------------------------------------ */

const hover: Group = {
	id: 'action-hover',
	label: 'Hover',
	layout: 'row',
	help: 'Derived from the button’s own fill, this is the plain darken — or lighten, on a dark theme, decided by the fill itself rather than by you.',
	vars: [
		'action-hover-color',
		'action-hover-shade',
		'action-press-color',
		'action-press-shade'
	],
	controls: [
		box('action-hover', 'Hover', {
			sources: ['own', 'text', 'semantic'],
			source: 'own',
			shade: 0.07
		})
	]
};

registerWriters({
	/* The box writes its own pair; this adds the press, which is the same
	   colour a little further. A press identical to its hover reads as
	   nothing having happened. */
	'action-hover': (value): Vars => {
		const v = (value as ColorValue) ?? { source: 'own', shade: 0 };
		return {
			'action-press-color': sourceToCss(v.source),
			'action-press-shade': String(Math.round(v.shade * 1.6 * 1000) / 1000)
		};
	}
});

/* ------------------------------------------------------------------ *
 * Press animation — second to last
 * ------------------------------------------------------------------ */

const press: Group = {
	id: 'action-press',
	label: 'Press animation',
	help: 'What the button does under the finger. Whichever shape you pick, releasing takes twice as long as pressing — an instant press that relaxes slowly is what reads well, and the reverse feels broken.',
	vars: [
		'action-press',
		'action-press-x',
		'action-press-y',
		'action-press-rotate',
		'action-press-scale',
		'action-press-shadow-scale',
		'action-hover-x',
		'action-hover-y',
		'action-hover-shadow-scale',
		'action-press-amount',
		'action-transition-duration'
	],
	controls: [
		{
			id: 'action-transition-duration',
			label: 'Duration',
			help: 'The only motion setting left in the generator. Everything else that animates does so at a duration its own component fixed.',
			type: 'length',
			default: '150ms',
			min: 0,
			max: 400,
			step: 10,
			units: ['ms'],
			vars: ['action-transition-duration']
		}
	],
	type: {
		default: 'none',
		modes: [
			{ id: 'none', label: 'None', controls: [] },
			{
				id: 'sink',
				label: 'Sink',
				help: 'A half-pixel down and the shadow gone. Barely visible, which is the point.',
				controls: [
					{
						id: 'action-press-amount',
						label: 'Depth',
						type: 'length',
						default: '0.5px',
						min: 0,
						max: 2,
						step: 0.25,
						units: ['px', 'em'],
						vars: ['action-press-amount']
					}
				]
			},
			{
				id: 'push',
				label: 'Push',
				help: 'The button travels exactly as far as its shadow sits, and the shadow shrinks to nothing under it. It reads the Shadow group, so it needs no control of its own.',
				controls: []
			},
			{
				id: 'scale',
				label: 'Scale',
				help: 'The Material and iOS standard: the whole button shrinks a touch.',
				controls: [
					{
						id: 'action-press-scale',
						label: 'Amount',
						type: 'number',
						default: 0.97,
						min: 0.92,
						max: 1,
						step: 0.005,
						vars: ['action-press-scale']
					}
				]
			}
		]
	}
};

/** Every press shape is these five numbers, differently filled. */
function pressVars(x: string, y: string, rotate: string, scaleTo: string, shadowScale: string): Vars {
	return {
		'action-press-x': x,
		'action-press-y': y,
		'action-press-rotate': rotate,
		'action-press-scale': scaleTo,
		'action-press-shadow-scale': shadowScale
	};
}

registerWriters({
	'action-press:none': () => pressVars('0px', '0px', '0deg', '1', '1'),
	'action-press:sink': (_, vars) =>
		pressVars('0px', String(vars['action-press-amount'] ?? '0.5px'), '0deg', '1', '0'),
	'action-press:push': (_, vars) => {
		/* It travels exactly as far as its shadow sits. Reading the Shadow
		   group is what lets this mode have no control at all. */
		const o = String(vars['action-shadow-offset'] ?? '0.25em');
		const [n, u] = splitLength(o, 'em');
		return {
			...pressVars(o, o, '0deg', '1', '0'),
			'action-hover-x': `${n / 2}${u}`,
			'action-hover-y': `${n / 2}${u}`,
			'action-hover-shadow-scale': '0.5'
		};
	},
	'action-press:scale': (_, vars) =>
		pressVars('0px', '0px', '0deg', String(vars['action-press-scale'] ?? 0.97), '1')
});

/* ------------------------------------------------------------------ *
 * Link and Tabs
 * ------------------------------------------------------------------ */

const link: Group = {
	id: 'link',
	label: 'Link',
	vars: [
		'link-underline',
		'link-color',
		'link-shade',
		'link-decoration',
		'link-hover-decoration',
		'link-weight'
	],
	controls: [
		box('link', 'Colour', { sources: ['text', 'semantic'], source: 'color-primary' }),
		{
			id: 'link-underline',
			label: 'Underline',
			type: 'choice',
			default: 'hover',
			options: [
				{ value: 'none', label: 'None' },
				{ value: 'always', label: 'Always' },
				{ value: 'hover', label: 'On hover' }
			],
			/* A sentinel first: `link-decoration` alone cannot tell `none`
			   from `hover`, since both leave it `none` at rest. */
			vars: ['link-underline', 'link-decoration', 'link-hover-decoration']
		},
		{
			id: 'link-weight',
			label: 'Weight',
			type: 'number',
			default: 400,
			min: 300,
			max: 800,
			step: 100,
			vars: ['link-weight']
		}
	]
};

registerWriters({
	'link-underline': (value) => {
		const v = String(value ?? 'hover');
		return {
			'link-decoration': v === 'always' ? 'underline' : 'none',
			'link-hover-decoration': v === 'none' ? 'none' : 'underline'
		};
	}
});

const tabs: Group = {
	id: 'tabs',
	label: 'Tabs',
	layout: 'row',
	help: 'Only two colours. Everything else a tab draws — its corners, its border, its weight, its motion — it takes from the button above.',
	vars: ['tabs-idle-color', 'tabs-idle-shade', 'tabs-active-color', 'tabs-active-shade'],
	controls: [
		box('tabs-idle', 'Idle', { sources: ['text', 'surface'], source: 'own', shade: 0.25 }),
		box('tabs-active', 'Active', { sources: ['own', 'semantic', 'text'], source: 'own' })
	]
};

/* ------------------------------------------------------------------ *
 * The section
 * ------------------------------------------------------------------ */

export const action: Section = {
	id: 'action',
	label: 'Action',
	prefixes: ['action', 'link', 'tabs'],
	help: 'Everything you click: buttons, links, tabs, breadcrumbs.',
	internal: [
		/* Run `node scripts/check-theme-vars.mjs` and paste what it names.
		   Never write this list from memory. */
	],
	controls: [
		scale(
			P,
			'Grows every frame a button has — its height, its padding, its icon gap — and never its text. One number, because they are one decision.'
		),

		{
			id: 'action-fill',
			label: 'Fill',
			layout: 'row',
			vars: ['action-bg-color', 'action-bg-shade', 'action-fg-color', 'action-fg-shade'],
			controls: [
				box('action-bg', 'Background', {
					sources: ['surface', 'semantic'],
					source: 'color-surface-4'
				}),
				box('action-fg', 'Text', {
					sources: ['text', 'surface'],
					source: 'color-on-surface',
					help: 'The ink a plain button is written in. A colour variant overrides it with its own contrast colour, so this is the unvarianted case.'
				})
			]
		} satisfies Group,

		radius(P),
		border(P),
		typography(P),
		shadow(P, { relief: true }),
		hover,
		link,
		tabs,
		focus(P),
		disabled(P),
		press,
		handDrawn(P)
	]
};
