import type { Control, Section, Vars } from '../schema.js';
import { registerWriters, shadowLayers, shadowVars, sidesOf, type Sides } from '../schema.js';

/**
 * Section — Fields (`input`, `select`, `textarea`).
 *
 * Three components, one set of controls. What makes this section different
 * from Actions is that it is the first to need the two-level cascade: the
 * components read `var(--input-x, var(--field-x))`, so one answer here paints
 * all three — except where a component genuinely disagrees. There is exactly
 * one such case today and it is real: a hand-drawn corner is drawn in pixels,
 * so a tall box takes the full drift while a one-line control clamps it down
 * to nearly nothing. The wobble therefore asks twice, and writes
 * `--field-corners` and `--textarea-corners`.
 *
 * Focus is an effect for the same reason Press is one on a button: every look
 * does something different and all of them reduce to the same six numbers.
 */

const ALL: Sides = { top: true, right: true, bottom: true, left: true };

export const fields: Section = {
	id: 'fields',
	label: 'Fields',
	prefixes: ['field', 'input', 'select', 'textarea', 'file-input', 'label', 'floating-label', 'validator'],
	help: 'Text inputs, selects, text areas and file pickers, plus the labels and hints around them. One frame, several shapes.',
	controls: [
		/* ── Fill ─────────────────────────────────────────────────── */
		{
			id: 'field-bg',
			label: 'Background',
			type: 'color',
			default: 'var(--color-surface-1)',
			vars: ['field-bg']
		},
		{ id: 'field-fg', label: 'Text', type: 'color', default: 'var(--color-on-surface)', vars: ['field-fg'] },
		{
			id: 'field-accent-color',
			label: 'Accent',
			help: 'What a colour variant replaces, and what the relief tints with. Not the border: a look can draw no border at all and still use this.',
			type: 'color',
			default: 'var(--color-border)',
			vars: ['field-accent-color']
		},
		{
			id: 'field-placeholder-mix',
			label: 'Placeholder',
			help: 'How far the placeholder fades towards the background.',
			type: 'percent',
			default: 45,
			min: 0,
			max: 100,
			step: 5,
			vars: ['field-placeholder-mix']
		},

		/* ── Border ───────────────────────────────────────────────── */
		{
			id: 'field-border',
			label: 'Border width',
			type: 'length',
			default: '0',
			min: 0,
			max: 6,
			step: 0.5,
			units: ['px', 'em', 'rem'],
			vars: ['field-border-width']
		},
		{
			id: 'field-border-sides',
			label: 'Edges',
			help: 'A bottom rule alone is a whole design language; so is an L.',
			type: 'sides',
			default: ALL,
			vars: ['field-border-sides']
		},
		{
			id: 'field-border-color',
			label: 'Border colour',
			type: 'color',
			default: 'transparent',
			vars: ['field-border-color']
		},
		{
			id: 'field-border-from-fill',
			label: 'Border takes the fill',
			help: 'How much of the field’s own background is blended into its edge.',
			type: 'percent',
			default: 0,
			min: 0,
			max: 100,
			step: 1,
			vars: ['field-border-from-fill']
		},
		{
			id: 'field-border-style',
			label: 'Border style',
			type: 'select',
			default: 'solid',
			options: [
				{ value: 'solid', label: 'Solid' },
				{ value: 'dashed', label: 'Dashed' },
				{ value: 'dotted', label: 'Dotted' }
			],
			vars: ['field-border-style']
		},

		/* ── Corners ──────────────────────────────────────────────── */
		{
			id: 'field-corner',
			label: 'Corners',
			type: 'effect',
			default: 'radius',
			vars: ['field-corner', 'field-corners', 'textarea-corners', 'field-radius'],
			modes: [
				{
					id: 'radius',
					label: 'Rounded',
					controls: [
						{
							id: 'field-radius',
							label: 'Radius',
							type: 'length',
							default: '0',
							min: 0,
							max: 3,
							step: 0.05,
							units: ['rem', 'px', 'em'],
							vars: ['field-radius', 'field-corners', 'textarea-corners']
						}
					]
				},
				{
					id: 'wobble',
					label: 'Hand-drawn',
					help: 'The drift is in pixels, so a tall box takes all of it while a one-line control clamps it away. That is why this asks twice.',
					controls: [
						{
							id: 'field-radius',
							label: 'Base radius',
							type: 'length',
							default: '0.75rem',
							min: 0,
							max: 3,
							step: 0.05,
							units: ['rem', 'px', 'em'],
							vars: ['field-radius', 'field-corners', 'textarea-corners']
						},
						{
							id: 'field-wobble',
							label: 'Amplitude — controls',
							type: 'number',
							default: 1,
							min: 0,
							max: 1,
							step: 0.05,
							vars: ['field-wobble', 'field-corners']
						},
						{
							id: 'field-box-wobble',
							label: 'Amplitude — boxes',
							help: 'The text area only. Same pen, fewer pixels.',
							type: 'number',
							default: 0.2,
							min: 0,
							max: 1,
							step: 0.05,
							vars: ['field-box-wobble', 'textarea-corners']
						}
					]
				}
			]
		},

		/* ── Shadow ───────────────────────────────────────────────── */
		{
			id: 'field-shadow',
			label: 'Shadow',
			type: 'effect',
			default: 'none',
			vars: [
				'field-shadow',
				'field-depth',
				...[1, 2].flatMap((n) =>
					['inset', 'x', 'y', 'blur', 'spread', 'color'].map((k) => `field-shadow-${n}-${k}`)
				)
			],
			modes: [
				{ id: 'none', label: 'None', controls: [] },
				{
					id: 'soft',
					label: 'Soft',
					controls: [sides(), offset('2px'), blur('6px'), color('#0003')]
				},
				{ id: 'hard', label: 'Hard', controls: [sides(), offset('0.25em'), color('#000')] },
				{
					id: 'inset',
					label: 'Inside',
					help: 'A field that reads as a groove rather than a plate.',
					controls: [sides(), offset('2px'), blur('4px'), color('#0003')]
				},
				{
					id: 'depth',
					label: 'Relief',
					help: 'A hairline groove at the top tinted with the accent, and a highlight at the bottom. It resolves on the element, so only its amount is here.',
					controls: [
						{
							id: 'field-depth',
							label: 'Amount',
							type: 'number',
							default: 1,
							min: 0,
							max: 1,
							step: 0.05,
							vars: ['field-depth']
						}
					]
				}
			]
		},

		/* ── Focus ────────────────────────────────────────────────── */
		{
			id: 'field-focus',
			label: 'Focus',
			help: 'Every look does something different here and all of them are the same six numbers.',
			type: 'effect',
			default: 'none',
			vars: [
				'field-focus',
				'field-focus-ring-width',
				'field-focus-ring-color',
				'field-focus-cast-x',
				'field-focus-cast-y',
				'field-focus-cast-color',
				'field-focus-shadow-scale',
				'field-focus-x',
				'field-focus-y',
				'field-focus-outline-width',
				'field-focus-outline-offset',
				'field-focus-outline-color'
			],
			modes: [
				{ id: 'none', label: 'None', controls: [] },
				{
					id: 'outline',
					label: 'Outline',
					help: 'Outside the frame, so it never moves the layout.',
					controls: [amount('2px')]
				},
				{
					id: 'ring',
					label: 'Ring',
					help: 'A shadow hugging the border, which reads as the border thickening.',
					controls: [amount('1px')]
				},
				{
					id: 'push',
					label: 'Push',
					help: 'The field travels and casts, the way its buttons do.',
					controls: [amount('0.125em')]
				}
			]
		},
		{
			id: 'field-focus-accent-color',
			label: 'Focus accent',
			help: 'What the ring, the outline and the relief take when the field has focus.',
			type: 'color',
			default: 'var(--color-on-surface)',
			vars: ['field-focus-accent-color']
		},
		{
			id: 'field-focus-border-color',
			label: 'Focus border',
			type: 'color',
			default: 'var(--field-border-color)',
			vars: ['field-focus-border-color']
		},

		/* ── Geometry ─────────────────────────────────────────────── */
		{
			id: 'field-height',
			label: 'Height',
			type: 'length',
			default: 'calc(2.5em * var(--scale))',
			min: 1.5,
			max: 4,
			step: 0.05,
			units: ['em'],
			vars: ['field-height']
		},
		{
			id: 'field-padding-x',
			label: 'Side padding',
			type: 'length',
			default: 'calc(0.75em * var(--scale))',
			min: 0,
			max: 3,
			step: 0.05,
			units: ['em'],
			vars: ['field-padding-x']
		},
		{
			id: 'field-gap',
			label: 'Inner gap',
			type: 'length',
			default: 'calc(0.5em * var(--scale))',
			min: 0,
			max: 2,
			step: 0.05,
			units: ['em'],
			vars: ['field-gap']
		},
		{
			id: 'field-rest-rotate',
			label: 'Resting angle',
			help: 'Off true, the way a drawn thing sits.',
			type: 'length',
			default: '0deg',
			min: -3,
			max: 3,
			step: 0.1,
			units: ['deg'],
			vars: ['field-rest-rotate']
		},
		{
			id: 'field-transition-duration',
			label: 'Transition',
			type: 'length',
			default: 'var(--transition-duration)',
			min: 0,
			max: 1,
			step: 0.01,
			units: ['s'],
			vars: ['field-transition-duration']
		},
		{
			id: 'field-transition-easing',
			label: 'Easing',
			type: 'select',
			default: 'var(--transition-easing)',
			options: [
				{ value: 'var(--transition-easing)', label: 'Inherit' },
				{ value: 'linear', label: 'Linear' },
				{ value: 'ease-out', label: 'Ease out' }
			],
			vars: ['field-transition-easing']
		},
		{
			id: 'field-disabled-mix',
			label: 'Disabled fill',
			type: 'percent',
			default: 10,
			min: 0,
			max: 50,
			step: 1,
			vars: ['field-disabled-mix']
		},
		{
			id: 'field-disabled-fg-mix',
			label: 'Disabled text',
			type: 'percent',
			default: 40,
			min: 0,
			max: 90,
			step: 1,
			vars: ['field-disabled-fg-mix']
		},

		/* ── What belongs to one component ────────────────────────── */
		{
			id: 'textarea-min-height',
			label: 'Text area height',
			type: 'length',
			default: 'calc(5em * var(--scale))',
			min: 2,
			max: 16,
			step: 0.25,
			units: ['em'],
			vars: ['textarea-min-height']
		},
		{
			id: 'textarea-padding-y',
			label: 'Text area padding',
			type: 'length',
			default: 'calc(0.5em * var(--scale))',
			min: 0,
			max: 2,
			step: 0.05,
			units: ['em'],
			vars: ['textarea-padding-y']
		},
		{
			id: 'select-chevron-size',
			label: 'Chevron size',
			type: 'length',
			default: '4px',
			min: 2,
			max: 10,
			step: 0.5,
			units: ['px'],
			vars: ['select-chevron-size']
		},
		{
			id: 'select-chevron-inset',
			label: 'Chevron inset',
			type: 'length',
			default: 'calc(1.25em * var(--scale))',
			min: 0.5,
			max: 3,
			step: 0.05,
			units: ['em'],
			vars: ['select-chevron-inset']
		},
		{
			id: 'field-picker-radius',
			label: 'Picker radius',
			help: 'The dropdown a select opens, where the browser lets us style one.',
			type: 'length',
			default: '0.5rem',
			min: 0,
			max: 2,
			step: 0.05,
			units: ['rem', 'px'],
			vars: ['field-picker-radius']
		}
,

		/* ── The button inside a file input ───────────────────────── */
		{
			id: 'file-input-button-size',
			label: 'File button size',
			help: 'It paints from the Actions section — it is a button. Only its geometry is here.',
			type: 'length',
			default: '0.875rem',
			min: 0.5,
			max: 2,
			step: 0.025,
			units: ['rem', 'em'],
			vars: ['file-input-button-size']
		},
		{
			id: 'file-input-button-padding-x',
			label: 'File button padding',
			type: 'length',
			default: 'calc(1em * var(--scale))',
			min: 0,
			max: 3,
			step: 0.05,
			units: ['em'],
			vars: ['file-input-button-padding-x']
		},
		{
			id: 'file-input-button-gap',
			label: 'File button gap',
			type: 'length',
			default: 'calc(1em * var(--scale))',
			min: 0,
			max: 3,
			step: 0.05,
			units: ['em'],
			vars: ['file-input-button-gap']
		},

		/* ── The inline label ─────────────────────────────────────── */
		{
			id: 'label-mix',
			label: 'Label strength',
			help: 'How far the label fades from the text colour beside it.',
			type: 'percent',
			default: 60,
			min: 0,
			max: 100,
			step: 1,
			vars: ['label-mix']
		},
		{
			id: 'label-gap',
			label: 'Label gap',
			type: 'length',
			default: 'calc(0.375em * var(--scale))',
			min: 0,
			max: 2,
			step: 0.025,
			units: ['em'],
			vars: ['label-gap']
		},
		{
			id: 'label-inset',
			label: 'Label inset',
			help: 'How far a prefix or suffix label sits in from the field’s edge.',
			type: 'length',
			default: 'calc(0.5em * var(--scale))',
			min: 0,
			max: 2,
			step: 0.05,
			units: ['em'],
			vars: ['label-inset']
		},
		{
			id: 'label-divider-width',
			label: 'Label divider',
			help: 'The rule between a prefix label and the field’s content. 0 removes it.',
			type: 'length',
			default: '1px',
			min: 0,
			max: 4,
			step: 0.5,
			units: ['px', 'em'],
			vars: ['label-divider-width']
		},
		{
			id: 'label-divider-mix',
			label: 'Divider strength',
			type: 'percent',
			default: 10,
			min: 0,
			max: 100,
			step: 1,
			vars: ['label-divider-mix']
		},

		/* ── The floating label ───────────────────────────────────── */
		{
			id: 'floating-label-bg',
			label: 'Floating label ground',
			help: 'It sits on top of the field’s edge to hide it, so it has to match what the field is drawn on.',
			type: 'color',
			default: 'var(--color-surface-1)',
			vars: ['floating-label-bg']
		},
		{
			id: 'floating-label-size',
			label: 'Floating label size',
			type: 'length',
			default: '0.875rem',
			min: 0.5,
			max: 2,
			step: 0.025,
			units: ['rem', 'em'],
			vars: ['floating-label-size']
		},
		{
			id: 'floating-label-rest-top',
			label: 'Floating label rest',
			help: 'Where the name sits before it floats — the field’s own middle.',
			type: 'length',
			default: 'calc(1.25em * var(--scale))',
			min: 0,
			max: 3,
			step: 0.05,
			units: ['em'],
			vars: ['floating-label-rest-top']
		},
		{
			id: 'floating-label-padding-x',
			label: 'Floating label padding',
			type: 'length',
			default: 'calc(0.25em * var(--scale))',
			min: 0,
			max: 1,
			step: 0.025,
			units: ['em'],
			vars: ['floating-label-padding-x']
		},
		{
			id: 'floating-label-radius',
			label: 'Floating label radius',
			type: 'length',
			default: '2px',
			min: 0,
			max: 1,
			step: 0.05,
			units: ['px', 'rem'],
			vars: ['floating-label-radius']
		},
		{
			id: 'floating-label-scale',
			label: 'Floating label shrink',
			type: 'number',
			default: 0.75,
			min: 0.4,
			max: 1,
			step: 0.05,
			vars: ['floating-label-scale']
		},
		{
			id: 'floating-label-duration',
			label: 'Floating label speed',
			type: 'length',
			default: '0.1s',
			min: 0,
			max: 1,
			step: 0.01,
			units: ['s'],
			vars: ['floating-label-duration']
		},

		/* ── The validation hint ──────────────────────────────────── */
		{
			id: 'validator-hint-gap',
			label: 'Hint gap',
			help: 'The hint holds its space whether or not it is showing, so a form never jumps a line taller.',
			type: 'length',
			default: '0.5em',
			min: 0,
			max: 2,
			step: 0.05,
			units: ['em'],
			vars: ['validator-hint-gap']
		}
	]
};

/* The shadow questions repeat across four modes; same shape as Actions. */
function sides(): Control {
	return {
		id: 'field-shadow-sides',
		label: 'Edges',
		type: 'sides',
		default: { top: false, right: true, bottom: true, left: false },
		vars: ['field-shadow-sides']
	};
}
function offset(d: string): Control {
	return {
		id: 'field-shadow-offset',
		label: 'Distance',
		type: 'length',
		default: d,
		min: 0,
		max: 1,
		step: 0.025,
		units: ['em', 'px', 'rem'],
		vars: ['field-shadow-offset']
	};
}
function blur(d: string): Control {
	return {
		id: 'field-shadow-blur',
		label: 'Blur',
		type: 'length',
		default: d,
		min: 0,
		max: 40,
		step: 1,
		units: ['px', 'em'],
		vars: ['field-shadow-blur']
	};
}
function color(d: string): Control {
	return { id: 'field-shadow-color', label: 'Colour', type: 'color', default: d, vars: ['field-shadow-color'] };
}
function amount(d: string): Control {
	return {
		id: 'field-focus-amount',
		label: 'Thickness',
		type: 'length',
		default: d,
		min: 0,
		max: 1,
		step: 0.025,
		units: ['px', 'em', 'rem'],
		vars: ['field-focus-amount']
	};
}

/* ------------------------------------------------------------------ *
 * Writers
 * ------------------------------------------------------------------ */

const shadow = (d: Record<string, unknown>, o: string, b: string, c: string, inset: boolean): Vars =>
	shadowVars(
		'field',
		shadowLayers(sidesOf(d, 'field-shadow-sides'), String(d['field-shadow-offset'] ?? o)),
		{ blur: String(d['field-shadow-blur'] ?? b), color: String(d['field-shadow-color'] ?? c), inset }
	);

const noShadow = (): Vars => shadowVars('field', [], { blur: '0px', color: '#0000', inset: false });

/** The focus shapes. All four are the same six numbers, differently filled. */
function focus(o: {
	ring?: [string, string];
	outline?: [string, string];
	push?: string;
	scale?: string;
}): Vars {
	return {
		'field-focus-ring-width': o.ring?.[0] ?? '0px',
		'field-focus-ring-color': o.ring?.[1] ?? '#0000',
		'field-focus-outline-width': o.outline?.[0] ?? '0px',
		'field-focus-outline-offset': o.outline?.[1] ?? 'var(--focus-offset)',
		'field-focus-outline-color': o.outline ? 'var(--field-focus-accent-color)' : '#0000',
		'field-focus-x': o.push ?? '0px',
		'field-focus-y': o.push ?? '0px',
		'field-focus-cast-x': o.push ?? '0px',
		'field-focus-cast-y': o.push ?? '0px',
		'field-focus-cast-color': o.push ? 'var(--field-focus-accent-color)' : '#0000',
		'field-focus-shadow-scale': o.scale ?? '1'
	};
}

const wobbleRecipe = (r: string, a: string) => {
	const c = (px: number) => `calc(${r} + ${a} * ${px}px)`;
	return `${c(0)} ${c(240)} ${c(210)} ${c(0)} / ${c(240)} ${c(0)} ${c(0)} ${c(210)}`;
};

registerWriters({
	'field-border': (d) => {
		const w = (d['field-border'] as string) ?? '0';
		const s = (d['field-border-sides'] as Sides) ?? ALL;
		const e = (k: keyof Sides) => (s[k] ? w : '0');
		const all = s.top && s.right && s.bottom && s.left;
		return {
			'field-border-width': all ? w : `${e('top')} ${e('right')} ${e('bottom')} ${e('left')}`
		};
	},

	'field-corner:radius': (d) => {
		const r = String(d['field-radius'] ?? '0');
		return { 'field-radius': r, 'field-corners': 'var(--field-radius)', 'textarea-corners': 'var(--field-corners)' };
	},
	'field-corner:wobble': (d) => {
		const r = String(d['field-radius'] ?? '0.75rem');
		return {
			'field-radius': r,
			'field-corners': wobbleRecipe(r, String(d['field-wobble'] ?? 1)),
			'textarea-corners': wobbleRecipe(r, String(d['field-box-wobble'] ?? 0.2))
		};
	},

	'field-shadow:none': () => ({ ...noShadow(), 'field-depth': '0' }),
	'field-shadow:soft': (d) => shadow(d, '2px', '6px', '#0003', false),
	'field-shadow:hard': (d) => shadow(d, '0.25em', '0px', '#000', false),
	'field-shadow:inset': (d) => shadow(d, '2px', '4px', '#0003', true),
	'field-shadow:depth': (d) => ({ ...noShadow(), 'field-depth': String(d['field-depth'] ?? 1) }),

	'field-focus:none': () => focus({}),
	'field-focus:outline': (d) =>
		focus({ outline: [String(d['field-focus-amount'] ?? '2px'), 'var(--focus-offset)'] }),
	'field-focus:ring': (d) =>
		focus({ ring: [String(d['field-focus-amount'] ?? '1px'), 'var(--field-focus-accent-color)'], scale: '0' }),
	'field-focus:push': (d) => focus({ push: String(d['field-focus-amount'] ?? '0.125em'), scale: '0' })
});
