import type { Control, Section } from '../schema.js';
import { registerWriters } from '../schema.js';

/**
 * Section — Selectors (`checkbox`, `radio`, `toggle`).
 *
 * What makes this section read differently from Fields: a selector's two
 * states are not hover and press, they are checked and not. So the fill, the
 * edge and the mark are asked twice rather than as a shift from one to the
 * other — because three of the four looks this replaces change all three at
 * once when you tick the box, and "darken by 8%" cannot say that.
 *
 * The same two-level cascade as Fields, and two components use it for real:
 *   - a radio keeps its ground when checked, because its accent is the disc
 *     inside it rather than the fill behind it;
 *   - a toggle has a track and a thumb, which is not the same pair as a box
 *     and a mark. daisy's thumb is its text colour at half strength while its
 *     tick is that colour at full.
 *
 * A radio's roundness is not here at all. It is pinned in `radio.scss`: a
 * square radio is a checkbox with the wrong behaviour, and `.radio-square`
 * exists for the one case where someone really means it.
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

export const selectors: Section = {
	id: 'selectors',
	label: 'Selectors',
	prefixes: ['selector', 'checkbox', 'radio', 'toggle', 'range', 'swatch', 'tabs'],
	help: 'The things you tick, drag and pick: checkboxes, radios, toggles, sliders, colour samples and tab strips. Checked and unchecked are painted separately, because most looks change everything at once.',
	controls: [
		/* ── The box, unchecked ───────────────────────────────────── */
		len('selector-size', 'Size', 'calc(1.5em * var(--scale))', 0.75, 3, 0.05, ['em'],
			'In em, so a selector beside larger text grows with it.'),
		len('selector-padding', 'Inner padding', 'calc(0.1667em * var(--scale))', 0, 0.75, 0.0083, ['em'],
			'How far the mark sits in from the edge. On a toggle it is the gap around the thumb.'),
		c('selector-bg', 'Background', '#0000', 'Transparent is a real answer here and three of four looks give it.'),
		c('selector-mark', 'Mark', 'var(--color-on-surface)', 'The tick, the disc, the thumb.'),
		len('selector-border-width', 'Border width', '1px', 0, 6, 0.5, ['px', 'em']),
		c('selector-border-color', 'Border colour', 'var(--color-border)'),
		{
			id: 'selector-border-style',
			label: 'Border style',
			type: 'select',
			default: 'solid',
			options: [
				{ value: 'solid', label: 'Solid' },
				{ value: 'dashed', label: 'Dashed' },
				{ value: 'dotted', label: 'Dotted' }
			],
			vars: ['selector-border-style']
		},

		/* ── Corners ──────────────────────────────────────────────── */
		{
			id: 'selector-corner',
			label: 'Corners',
			type: 'effect',
			default: 'radius',
			vars: ['selector-corner', 'selector-corners', 'selector-radius'],
			modes: [
				{
					id: 'radius',
					label: 'Rounded',
					controls: [
						len('selector-radius', 'Radius', '0.5rem', 0, 2, 0.025, ['rem', 'px', 'em'])
					]
				},
				{
					id: 'wobble',
					label: 'Hand-drawn',
					help: 'A selector is small, so the drift clamps hard and reads as a soft irregularity rather than a scrawl. That is the honest result, not a failure.',
					controls: [
						len('selector-radius', 'Base radius', '0.5rem', 0, 2, 0.025, ['rem', 'px', 'em']),
						{
							id: 'selector-wobble',
							label: 'Amplitude',
							type: 'number',
							default: 0.7,
							min: 0,
							max: 1,
							step: 0.05,
							vars: ['selector-wobble', 'selector-corners']
						}
					]
				}
			]
		},

		/* ── The box, checked ─────────────────────────────────────── */
		c('selector-checked-bg', 'Checked background', '#0000'),
		c('selector-checked-border-color', 'Checked border', 'var(--selector-border-color)'),
		c('selector-checked-mark', 'Checked mark', 'var(--color-on-surface)'),

		/* ── Everything else ──────────────────────────────────────── */
		{
			id: 'selector-depth',
			label: 'Relief',
			help: 'A groove at the top of the box and a highlight under the mark. 0 is off.',
			type: 'number',
			default: 0,
			min: 0,
			max: 1,
			step: 0.05,
			vars: ['selector-depth']
		},
		{
			id: 'selector-disabled-opacity',
			label: 'Disabled opacity',
			type: 'number',
			default: 0.2,
			min: 0,
			max: 1,
			step: 0.05,
			vars: ['selector-disabled-opacity']
		},
		len('selector-focus-width', 'Focus ring', 'var(--focus-width)', 0, 6, 0.5, ['px', 'em']),
		len('selector-focus-offset', 'Focus offset', 'var(--focus-offset)', 0, 6, 0.5, ['px', 'em']),
		c('selector-focus-color', 'Focus colour', 'var(--color-on-surface)'),
		len('selector-transition-duration', 'Transition', 'var(--transition-duration)', 0, 1, 0.01, ['s']),
		{
			id: 'selector-transition-easing',
			label: 'Easing',
			type: 'select',
			default: 'var(--transition-easing)',
			options: [
				{ value: 'var(--transition-easing)', label: 'Inherit' },
				{ value: 'linear', label: 'Linear' },
				{ value: 'ease-out', label: 'Ease out' }
			],
			vars: ['selector-transition-easing']
		},
		len('checkbox-mark-duration', 'Tick speed', '0.3s', 0, 1, 0.01, ['s'],
			'The tick draws itself rather than appearing. Slower than a colour change, on purpose.'),

		/* ── The radio ────────────────────────────────────────────── */
		c('radio-checked-bg', 'Radio checked ground', 'var(--color-surface-1)',
			'A checked radio keeps its ground: the accent is the disc inside it.'),
		c('radio-checked-border-color', 'Radio checked ring', 'var(--selector-checked-border-color)'),
		c('radio-checked-mark', 'Radio disc', 'var(--selector-checked-mark)'),

		/* ── The toggle ───────────────────────────────────────────── */
		len('toggle-size', 'Toggle size', 'var(--selector-size)', 0.75, 3, 0.05, ['em'],
			'A toggle needs room for its thumb to travel, so it is often larger than the boxes beside it.'),
		len('toggle-padding', 'Toggle padding', 'var(--selector-padding)', 0, 0.75, 0.0083, ['em']),
		len('toggle-corners', 'Track corners', 'var(--selector-corners)', 0, 2, 0.025, ['rem', 'px'],
			'A toggle is usually a pill even where the checkboxes are square.'),
		c('toggle-track-bg', 'Track', 'var(--selector-bg)'),
		c('toggle-track-border-color', 'Track border', 'var(--selector-border-color)'),
		c('toggle-thumb-bg', 'Thumb', 'var(--selector-mark)'),
		len('toggle-thumb-corners', 'Thumb corners', 'var(--selector-corners)', 0, 2, 0.025, ['rem', 'px']),
		{
			id: 'toggle-thumb-shadow',
			label: 'Thumb shadow',
			help: 'A thumb that floats above its track needs one; a drawn one does not.',
			type: 'select',
			default: 'none',
			options: [
				{ value: 'none', label: 'None' },
				{
					value:
						'0 0 1px 1px color-mix(in oklab, var(--color-on-surface) 8%, #0000), 0 1px 2px color-mix(in oklab, var(--color-on-surface) 12%, #0000)',
					label: 'Lifted'
				},
				{
					value: '0 0 0 calc(0.1em * var(--scale)) var(--color-surface-1)',
					label: 'Haloed'
				}
			],
			vars: ['toggle-thumb-shadow']
		},
		c('toggle-checked-track-bg', 'Checked track', 'var(--selector-checked-bg)'),
		c('toggle-checked-track-border-color', 'Checked track border', 'var(--selector-checked-border-color)'),
		c('toggle-checked-thumb-bg', 'Checked thumb', 'var(--selector-checked-mark)'),

		/* ── The slider ───────────────────────────────── */
		len('range-thumb-size', 'Thumb size', 'calc(1.5em * var(--scale))', 0.5, 3, 0.05, ['em']),
		len('range-rail', 'Rail height', 'calc(var(--range-thumb-size) * 0.5)', 0.1, 2, 0.05, ['em']),
		len('range-trail-height', 'Trail height', 'var(--range-rail)', 0.1, 3, 0.05, ['em'],
			'How tall the filled part is. Match it to the rail and the slider reads as one line; match it to the thumb and the fill sits proud of the rail, which is daisyUI’s look and nobody else’s. This one length is the whole of what looked like two different components.'),
		c('range-track-bg', 'Rail', 'color-mix(in oklab, var(--color-on-surface) 10%, #0000)'),
		c('range-progress', 'Fill', 'var(--color-primary)'),
		{
			id: 'range-fill',
			label: 'Fill the rail',
			help: '0 leaves the whole rail empty and only the thumb moves.',
			type: 'number' as const,
			default: 1,
			min: 0,
			max: 1,
			step: 1,
			vars: ['range-fill']
		},
		len('range-track-border-width', 'Rail border', '0px', 0, 6, 0.5, ['px', 'em']),
		c('range-track-border-color', 'Rail border colour', '#0000'),
		len('range-track-corners', 'Rail corners', '999px', 0, 2, 0.025, ['rem', 'px']),
		c('range-thumb-bg', 'Thumb', 'var(--color-surface-1)'),
		len('range-thumb-border-width', 'Thumb border', '0px', 0, 1, 0.025, ['em', 'px'],
			'A thick one reads as a ring around the knob, which is how daisyUI draws it.'),
		c('range-thumb-border-color', 'Thumb border colour', 'currentColor'),
		len('range-thumb-corners', 'Thumb corners', '999px', 0, 2, 0.025, ['rem', 'px']),
		len('range-thumb-halo', 'Thumb halo', '0.125em', 0, 1, 0.025, ['em', 'px'],
			'How far past the thumb the clip keeps painting. It has to clear the thumb’s own border, or the ring gets cut off.'),
		{
			id: 'range-thumb-shadow',
			label: 'Thumb shadow',
			type: 'select' as const,
			default: '0 0 #0000',
			options: [
				{ value: '0 0 #0000', label: 'None' },
				{
					value:
						'0 0 0 1px color-mix(in oklab, var(--color-on-surface) 22%, #0000), 0 1px 3px color-mix(in oklab, var(--color-on-surface) 18%, #0000)',
					label: 'Lifted'
				}
			],
			vars: ['range-thumb-shadow']
		},

		/* ── The colour sample ───────────────────────── */
		len('swatch-size', 'Sample size', 'calc(2em * var(--scale))', 0.75, 6, 0.05, ['em']),
		len('swatch-corners', 'Sample corners', 'var(--selector-corners)', 0, 2, 0.025, ['rem', 'px']),
		len('swatch-border-width', 'Sample border', 'var(--selector-border-width)', 0, 6, 0.5, ['px', 'em']),
		c('swatch-border-color', 'Sample border colour', 'var(--selector-border-color)'),
		{
			id: 'swatch-shadow',
			label: 'Sample shadow',
			type: 'select' as const,
			default: 'none',
			options: [
				{ value: 'none', label: 'None' },
				{
					value: 'inset 0 0 0 1px color-mix(in oklab, var(--color-on-surface) 12%, #0000)',
					label: 'Inner hairline'
				},
				{
					value:
						'var(--action-shadow-1-x) var(--action-shadow-1-y) 0 0 var(--action-shadow-1-color)',
					label: 'Same as a button'
				}
			],
			vars: ['swatch-shadow']
		},
		{
			id: 'swatch-font-weight',
			label: 'Sample label weight',
			type: 'number' as const,
			default: 600,
			min: 100,
			max: 900,
			step: 50,
			vars: ['swatch-font-weight']
		},
		len('swatch-rest-rotate', 'Sample angle', '0deg', -3, 3, 0.1, ['deg']),
		{
			id: 'swatch-checks',
			label: 'Behind a transparent sample',
			help: 'A transparent sample has to read as transparent, so something shows through it.',
			type: 'select' as const,
			default:
				'conic-gradient(from 90deg, var(--color-surface-3) 25%, var(--color-surface-2) 0 50%, var(--color-surface-3) 0 75%, var(--color-surface-2) 0)',
			options: [
				{
					value:
						'conic-gradient(from 90deg, var(--color-surface-3) 25%, var(--color-surface-2) 0 50%, var(--color-surface-3) 0 75%, var(--color-surface-2) 0)',
					label: 'Chequerboard'
				},
				{
					value: 'linear-gradient(var(--color-surface-2), var(--color-surface-2))',
					label: 'Flat ground'
				}
			],
			vars: ['swatch-checks']
		},
		len('swatch-check-size', 'Checkerboard', 'calc(0.5em * var(--scale))', 0.1, 2, 0.05, ['em'],
			'The squares behind a transparent sample, so transparent reads as transparent.'),
		len('swatch-transition-duration', 'Sample transition', 'var(--selector-transition-duration)', 0, 1, 0.01, ['s']),
		{
			id: 'swatch-active-shadow',
			label: 'Selected sample',
			help: 'A ring drawn outside the sample with a gap of ground, so it reads on any colour.',
			type: 'select' as const,
			default: '0 0 0 2px var(--color-surface-1), 0 0 0 4px var(--color-primary)',
			options: [
				{
					value: '0 0 0 2px var(--color-surface-1), 0 0 0 4px var(--color-primary)',
					label: 'Ring'
				},
				{
					value: '0 0 0 2px var(--color-surface-1), 0 0 0 4px var(--color-border)',
					label: 'Ink ring'
				},
				{ value: '0 0 0 0 #0000', label: 'None' }
			],
			vars: ['swatch-active-shadow']
		},
		len('swatch-active-x', 'Selected shift across', '0px', -1, 1, 0.025, ['em', 'px']),
		len('swatch-active-y', 'Selected shift down', '0px', -1, 1, 0.025, ['em', 'px']),

		/* ── The strip of tabs ───────────────────────── */
		len('tabs-height-item', 'Tab height', 'calc(2.5em * var(--scale))', 1.5, 4, 0.05, ['em']),
		len('tabs-padding-x', 'Tab padding', 'calc(0.75em * var(--scale))', 0, 3, 0.05, ['em']),
		len('tabs-font-size', 'Tab text', '0.875rem', 0.5, 2, 0.025, ['rem', 'em']),
		len('tabs-border-width', 'Tab border', '1px', 0, 6, 0.5, ['px', 'em']),
		c('tabs-border-color', 'Tab border colour', 'var(--color-border)'),
		len('tabs-corners', 'Tab corners', 'var(--selector-corners)', 0, 2, 0.025, ['rem', 'px']),
		len('tabs-box-corners', 'Boxed strip corners', '0.5rem', 0, 2, 0.025, ['rem', 'px']),
		c('tabs-box-bg', 'Boxed strip ground', 'var(--color-surface-2)'),
		c('tabs-active-bg', 'Active tab', 'var(--color-surface-1)'),
		c('tabs-active-color', 'Active tab text', 'var(--color-on-surface)'),
		c('tabs-idle-color', 'Idle tab text', 'color-mix(in oklch, var(--color-on-surface) 50%, #0000)'),
		{
			id: 'tabs-depth',
			label: 'Active tab relief',
			type: 'number' as const,
			default: 0,
			min: 0,
			max: 1,
			step: 0.05,
			vars: ['tabs-depth']
		},
		c('tabs-shadow-color', 'Active tab shadow', 'var(--color-neutral)'),
		len('tabs-rest-rotate', 'Tab angle', '0deg', -3, 3, 0.1, ['deg']),
		{
			id: 'tabs-disabled-opacity',
			label: 'Disabled tab',
			type: 'number' as const,
			default: 0.4,
			min: 0,
			max: 1,
			step: 0.05,
			vars: ['tabs-disabled-opacity']
		},
		c('tabs-focus-color', 'Tab focus ring', 'currentColor'),
		len('tabs-focus-offset', 'Tab focus offset', '-5px', -10, 6, 0.5, ['px'],
			'Negative, because a tab’s ring is drawn inside it: an outside ring would collide with its neighbours.'),
		len('tabs-transition-duration', 'Tab transition', 'var(--selector-transition-duration)', 0, 1, 0.01, ['s']),
		{
			id: 'tabs-transition-easing',
			label: 'Tab easing',
			type: 'select' as const,
			default: 'var(--selector-transition-easing)',
			options: [
				{ value: 'var(--selector-transition-easing)', label: 'Inherit' },
				{ value: 'linear', label: 'Linear' },
				{ value: 'ease-out', label: 'Ease out' }
			],
			vars: ['tabs-transition-easing']
		}
	]
};

/* A selector is small enough that the wobble clamps to almost nothing, so it
   uses the same recipe as everything else and the amplitude does the work. */
const wobbleRecipe = (r: string, a: string) => {
	const v = (px: number) => `calc(${r} + ${a} * ${px}px)`;
	return `${v(0)} ${v(240)} ${v(210)} ${v(0)} / ${v(240)} ${v(0)} ${v(0)} ${v(210)}`;
};

registerWriters({
	'selector-corner:radius': (d) => ({
		'selector-radius': String(d['selector-radius']),
		'selector-corners': 'var(--selector-radius)'
	}),
	'selector-corner:wobble': (d) => {
		const r = String(d['selector-radius']);
		return {
			'selector-radius': r,
			'selector-corners': wobbleRecipe(r, String(d['selector-wobble']))
		};
	}
});
