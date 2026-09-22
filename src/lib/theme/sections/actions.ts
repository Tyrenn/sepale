import type { Section } from '../schema.js';
/* Importing the section registers its writers (see ../schema.ts). */
import './actions-writers.js';

/**
 * Section — Actions.
 *
 * One component so far (`button`); `join` is deliberately not themed, it is
 * geometry that reads its neighbours' corners.
 *
 * Every control here answers a question a person can answer without reading
 * CSS: how thick, which edges, how much darker on hover. The arithmetic that
 * turns those answers into `box-shadow` layers and `translate` offsets is in
 * `../schema.ts`, and the recipes that have to resolve on the element — the
 * relief that tints with the button's own fill, the border that is the fill a
 * touch darker — are in `src/scss/components/button.scss`.
 */
export const actions: Section = {
	id: 'actions',
	label: 'Actions',
	prefixes: ['action'],
	help: 'Buttons: what they are made of, and what they do when you touch them.',
	controls: [
		/* ── Fill ─────────────────────────────────────────────────── */
		{
			id: 'action-bg',
			label: 'Background',
			help: 'The fill of a button with no colour variant on it.',
			type: 'color',
			default: 'var(--color-surface-2)',
			vars: ['action-bg']
		},
		{
			id: 'action-fg',
			label: 'Text',
			type: 'color',
			default: 'var(--color-on-surface)',
			vars: ['action-fg']
		},

		/* ── Border ───────────────────────────────────────────────── */
		{
			id: 'action-border',
			label: 'Border width',
			help: 'Paired with the edges below: together they write one shorthand.',
			type: 'length',
			default: '0',
			min: 0,
			max: 6,
			step: 0.5,
			units: ['px', 'em', 'rem'],
			vars: ['action-border-width']
		},
		{
			id: 'action-border-sides',
			label: 'Edges',
			help: 'Which sides the border is drawn on. All four, or a bottom rule, or an L.',
			type: 'sides',
			default: { top: true, right: true, bottom: true, left: true },
			vars: ['action-border-sides']
		},
		{
			id: 'action-border-color',
			label: 'Border colour',
			type: 'color',
			default: 'transparent',
			vars: ['action-border-color']
		},
		{
			id: 'action-border-from-fill',
			label: 'Border takes the fill',
			help: 'How much of the button’s own colour is blended into its border. At 95% over black, the border is the fill five percent darker — which is the whole of daisyUI’s edge.',
			type: 'percent',
			default: 0,
			min: 0,
			max: 100,
			step: 1,
			vars: ['action-border-from-fill']
		},
		{
			id: 'action-border-style',
			label: 'Border style',
			type: 'select',
			default: 'solid',
			options: [
				{ value: 'solid', label: 'Solid' },
				{ value: 'dashed', label: 'Dashed' },
				{ value: 'dotted', label: 'Dotted' }
			],
			vars: ['action-border-style']
		},

		/* ── Corners ──────────────────────────────────────────────── */
		{
			id: 'action-corner',
			label: 'Corners',
			type: 'effect',
			default: 'radius',
			vars: ['action-corner'],
			modes: [
				{
					id: 'radius',
					label: 'Rounded',
					controls: [
						{
							id: 'action-radius',
							label: 'Radius',
							type: 'length',
							default: '0.25rem',
							min: 0,
							max: 3,
							step: 0.05,
							units: ['rem', 'px', 'em'],
							vars: ['action-radius', 'action-corners']
						}
					]
				},
				{
					id: 'wobble',
					label: 'Hand-drawn',
					help: 'Eight radii, no two corners alike. At amplitude 0 it is exactly the rounded mode, which is why the two are one control and not two.',
					controls: [
						{
							id: 'action-radius',
							label: 'Base radius',
							type: 'length',
							default: '0.75rem',
							min: 0,
							max: 3,
							step: 0.05,
							units: ['rem', 'px', 'em'],
							vars: ['action-radius', 'action-corners']
						},
						{
							id: 'action-wobble',
							label: 'Amplitude',
							help: 'The drift is in pixels, so a small control clamps it and reads nearly symmetric — a button will always wobble less than a panel.',
							type: 'number',
							default: 1,
							min: 0,
							max: 1,
							step: 0.05,
							vars: ['action-corners', 'action-wobble']
						}
					]
				}
			]
		},

		/* ── Shadow ───────────────────────────────────────────────── */
		{
			id: 'action-shadow',
			label: 'Shadow',
			type: 'effect',
			default: 'none',
			vars: ['action-shadow'],
			modes: [
				{ id: 'none', label: 'None', controls: [] },
				{
					id: 'soft',
					label: 'Soft',
					controls: [shadowSides(), shadowOffset('2px'), shadowBlur('6px'), shadowColor('#0003')]
				},
				{
					id: 'hard',
					label: 'Hard',
					help: 'No blur at all, so the colour is a flat block. Pair it with the Push press and the button moves into its own shadow.',
					controls: [shadowSides(), shadowOffset('0.25em'), shadowColor('#000')]
				},
				{
					id: 'inset',
					label: 'Inside',
					controls: [shadowSides(), shadowOffset('2px'), shadowBlur('4px'), shadowColor('#0003')]
				},
				{
					id: 'depth',
					label: 'Relief',
					help: 'A retro edge tinted with the button’s own fill. It has to resolve on the element, so only its amount is here.',
					controls: [
						{
							id: 'action-depth',
							label: 'Amount',
							type: 'number',
							default: 1,
							min: 0,
							max: 1,
							step: 0.05,
							vars: ['action-depth']
						}
					]
				}
			]
		},

		/* ── States ───────────────────────────────────────────────── */
		{
			id: 'action-hover-mix',
			label: 'Hover shift',
			help: 'How far the fill moves towards the colour beside it. 100% is that colour outright.',
			type: 'percent',
			default: 0,
			min: 0,
			max: 100,
			step: 1,
			vars: ['action-hover-mix']
		},
		{
			id: 'action-hover-mix-color',
			label: 'Hover shift towards',
			type: 'color',
			default: '#0000',
			vars: ['action-hover-mix-color']
		},
		{
			id: 'action-press-mix',
			label: 'Press shift',
			type: 'percent',
			default: 0,
			min: 0,
			max: 100,
			step: 1,
			vars: ['action-press-mix']
		},
		{
			id: 'action-press-mix-color',
			label: 'Press shift towards',
			type: 'color',
			default: '#0000',
			vars: ['action-press-mix-color']
		},
		{
			id: 'action-hover-border-mix',
			label: 'Hover border shift',
			help: 'The same move, applied to the edge rather than the fill. A look whose border is derived from its fill usually wants both.',
			type: 'percent',
			default: 0,
			min: 0,
			max: 100,
			step: 1,
			vars: ['action-hover-border-mix']
		},
		{
			id: 'action-hover-border-mix-color',
			label: 'Hover border towards',
			type: 'color',
			default: '#0000',
			vars: ['action-hover-border-mix-color']
		},
		{
			id: 'action-press-border-mix',
			label: 'Press border shift',
			type: 'percent',
			default: 0,
			min: 0,
			max: 100,
			step: 1,
			vars: ['action-press-border-mix']
		},
		{
			id: 'action-press-border-mix-color',
			label: 'Press border towards',
			type: 'color',
			default: '#0000',
			vars: ['action-press-border-mix-color']
		},

		/* ── Press ────────────────────────────────────────────────── */
		{
			id: 'action-press',
			label: 'Press',
			help: 'What the button does under the finger. Four numbers, whichever one you pick.',
			type: 'effect',
			default: 'none',
			vars: [
				'action-press',
				'action-hover-x',
				'action-hover-y',
				'action-hover-rotate',
				'action-hover-shadow-scale',
				'action-rest-rotate'
			],
			modes: [
				{ id: 'none', label: 'None', controls: [] },
				{
					id: 'sink',
					label: 'Sink',
					help: 'A half-pixel down and the shadow gone. Barely visible, which is the point.',
					controls: [pressAmount('0.5px')]
				},
				{
					id: 'push',
					label: 'Push',
					help: 'The button travels exactly as far as its shadow sits, and the shadow shrinks to nothing under it.',
					controls: [pressAmount('0.25em')]
				},
				{
					id: 'tilt',
					label: 'Tilt',
					help: 'Off true at rest, straight on hover, tipped the other way when pressed. Small angles read as drawn; large ones read as broken.',
					controls: [
						{
							id: 'action-press-angle',
							label: 'Angle',
							type: 'length',
							default: '0.4deg',
							min: 0,
							max: 3,
							step: 0.1,
							units: ['deg'],
							vars: ['action-press-angle', 'action-press-rotate', 'action-rest-rotate']
						}
					]
				}
			]
		},

		/* ── Typography and geometry ──────────────────────────────── */
		{
			id: 'action-font-weight',
			label: 'Weight',
			type: 'number',
			default: 400,
			min: 100,
			max: 900,
			step: 50,
			vars: ['action-font-weight']
		},
		{
			id: 'action-letter-spacing',
			label: 'Letter spacing',
			type: 'length',
			default: 'normal',
			min: -0.05,
			max: 0.2,
			step: 0.005,
			units: ['em'],
			vars: ['action-letter-spacing']
		},
		{
			id: 'action-text-transform',
			label: 'Case',
			type: 'select',
			default: 'none',
			options: [
				{ value: 'none', label: 'As written' },
				{ value: 'uppercase', label: 'Uppercase' },
				{ value: 'lowercase', label: 'Lowercase' },
				{ value: 'capitalize', label: 'Capitalised' }
			],
			vars: ['action-text-transform']
		},
		{
			id: 'action-height',
			label: 'Height',
			help: 'In em, so it follows the font size rather than the viewport.',
			type: 'length',
			default: 'calc(2.5em * var(--scale))',
			min: 1.5,
			max: 4,
			step: 0.05,
			units: ['em'],
			vars: ['action-height']
		},
		{
			id: 'action-padding-x',
			label: 'Side padding',
			type: 'length',
			default: 'calc(1em * var(--scale))',
			min: 0,
			max: 3,
			step: 0.05,
			units: ['em'],
			vars: ['action-padding-x']
		},
		{
			id: 'action-gap',
			label: 'Icon gap',
			type: 'length',
			default: 'calc(0.375em * var(--scale))',
			min: 0,
			max: 1.5,
			step: 0.025,
			units: ['em'],
			vars: ['action-gap']
		},

		/* ── Variant tuning ───────────────────────────────────────── */
		{
			id: 'action-soft-mix',
			label: 'Soft strength',
			help: 'How much colour bleeds into .btn-soft.',
			type: 'percent',
			default: 8,
			min: 0,
			max: 40,
			step: 1,
			vars: ['action-soft-mix']
		},
		{
			id: 'action-tint',
			label: 'Tint strength',
			help: 'The same, for the two Radix weights .btn-surface and .btn-classic. 0 makes them grey.',
			type: 'number',
			default: 1,
			min: 0,
			max: 3,
			step: 0.1,
			vars: ['action-tint']
		},
		{
			id: 'action-variant-border-width',
			label: 'Drawn-variant border',
			help: 'The width dash, surface and classic fall back to when the look itself draws no border.',
			type: 'length',
			default: '1px',
			min: 0,
			max: 4,
			step: 0.5,
			units: ['px', 'em'],
			vars: ['action-variant-border-width']
		},
		{
			id: 'action-transition-duration',
			label: 'Transition',
			type: 'length',
			default: 'var(--transition-duration)',
			min: 0,
			max: 1,
			step: 0.01,
			units: ['s'],
			vars: ['action-transition-duration']
		},
		{
			id: 'action-transition-easing',
			label: 'Easing',
			type: 'select',
			default: 'var(--transition-easing)',
			options: [
				{ value: 'var(--transition-easing)', label: 'Inherit' },
				{ value: 'linear', label: 'Linear' },
				{ value: 'ease-out', label: 'Ease out' },
				{ value: 'cubic-bezier(0.34, 1.56, 0.64, 1)', label: 'Overshoot' }
			],
			vars: ['action-transition-easing']
		},
		{
			id: 'action-disabled-mix',
			label: 'Disabled fill',
			type: 'percent',
			default: 10,
			min: 0,
			max: 50,
			step: 1,
			vars: ['action-disabled-mix']
		},
		{
			id: 'action-disabled-fg-mix',
			label: 'Disabled text',
			type: 'percent',
			default: 20,
			min: 0,
			max: 80,
			step: 1,
			vars: ['action-disabled-fg-mix']
		}
	]
};

/* The shadow controls repeat verbatim across four modes: same questions,
   different numbers. Factored so adding a fifth mode is one line. */
function shadowSides() {
	return {
		id: 'action-shadow-sides',
		label: 'Edges',
		help: 'Which sides the shadow falls on. Two layers cover every combination there is, including three sides and all four.',
		type: 'sides' as const,
		default: { top: false, right: true, bottom: true, left: false },
		vars: ['action-shadow-sides']
	};
}

function shadowOffset(d: string) {
	return {
		id: 'action-shadow-offset',
		label: 'Distance',
		type: 'length' as const,
		default: d,
		min: 0,
		max: 1,
		step: 0.025,
		units: ['em', 'px', 'rem'],
		vars: ['action-shadow-offset']
	};
}

function shadowBlur(d: string) {
	return {
		id: 'action-shadow-blur',
		label: 'Blur',
		type: 'length' as const,
		default: d,
		min: 0,
		max: 40,
		step: 1,
		units: ['px', 'em'],
		vars: ['action-shadow-blur']
	};
}

function shadowColor(d: string) {
	return {
		id: 'action-shadow-color',
		label: 'Colour',
		type: 'color' as const,
		default: d,
		vars: ['action-shadow-color']
	};
}

/* The shadow layers themselves are written by the effect's writer, not by
   any single control, so they are attributed here — the drift check needs
   to know they are reachable. */
actions.controls
	.filter((c) => c.id === 'action-shadow')
	.forEach((c) => {
		c.vars = [
			'action-shadow',
			...[1, 2].flatMap((n) =>
				['inset', 'x', 'y', 'blur', 'spread', 'color'].map((k) => `action-shadow-${n}-${k}`)
			),
			'action-depth'
		];
	});

function pressAmount(d: string) {
	return {
		id: 'action-press-amount',
		label: 'Distance',
		type: 'length' as const,
		default: d,
		min: 0,
		max: 1,
		step: 0.025,
		units: ['em', 'px', 'rem'],
		vars: ['action-press-amount', 'action-press-x', 'action-press-y', 'action-press-shadow-scale']
	};
}
