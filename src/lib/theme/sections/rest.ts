import type { Control, Section } from '../schema.js';

/**
 * The last three sections: Markers, Feedback and Text.
 *
 * They share a file because each is small, and each is small for the same
 * reason: these components draw almost nothing. A badge positions a chip, a
 * skeleton shimmers, a link underlines. The four families this replaces
 * disagreed about them in single-digit numbers of lines.
 *
 * Two components have NO controls at all, and both earn it:
 *   - `badge` positions a `.chip` against whatever it wraps and paints
 *     nothing. It is Markers' equivalent of `join`.
 *   - `text` (with `title` and `subtitle`) sets weights and sizes from the
 *     type scale, which is the Typography section's business, not its own.
 *
 * Everything here is text-natured or nearly so, which is why `--scale` —
 * the knob that grows frames — does not appear in any of them.
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

const pct = (id: string, label: string, def: number, help?: string): Control =>
	({ id, label, help, type: 'percent', default: def, min: 0, max: 100, step: 1, vars: [id] });

export const markers: Section = {
	id: 'markers',
	label: 'Markers',
	prefixes: ['marker'],
	help: 'Small labels and counts: chips, badges and the trail of a breadcrumb. They mark, they do not act — a chip that reacts to a press is a small button.',
	controls: [
		c('marker-bg', 'Background', 'var(--color-surface-1)'),
		c('marker-fg', 'Text', 'var(--color-on-surface)'),
		c('marker-muted-bg', 'Muted', 'var(--color-surface-2)',
			'What a chip with no colour on it falls back to.'),
		len('marker-border-width', 'Border width', '1px', 0, 6, 0.5, ['px', 'em']),
		c('marker-border-color', 'Border colour', 'var(--color-surface-2)'),
		len('marker-corners', 'Corners', '999px', 0, 2, 0.025, ['rem', 'px'],
			'A pill by default. Square them off and a chip reads as a tag.'),
		{
			id: 'marker-shadow',
			label: 'Shadow',
			type: 'select',
			default: 'none',
			options: [
				{ value: 'none', label: 'None' },
				{
					value: 'var(--action-shadow-1-x) var(--action-shadow-1-y) 0 0 var(--action-shadow-1-color)',
					label: 'Same as a button'
				}
			],
			vars: ['marker-shadow']
		},
		pct('marker-soft-mix', 'Soft strength', 8, 'How much colour bleeds into a soft chip.'),
		pct('marker-soft-border-mix', 'Soft edge strength', 10),
		{
			id: 'marker-font-weight',
			label: 'Weight',
			type: 'number' as const,
			default: 400,
			min: 100,
			max: 900,
			step: 50,
			vars: ['marker-font-weight']
		},
		len('marker-rest-rotate', 'Angle', '0deg', -3, 3, 0.1, ['deg'])
	]
};

export const feedback: Section = {
	id: 'feedback',
	label: 'Feedback',
	prefixes: ['feedback', 'skeleton'],
	help: 'Bars that fill, rings that sweep, spinners and the shimmer of something still loading.',
	controls: [
		c('feedback-fill', 'Fill', 'var(--color-on-surface)',
			'What a bar and a ring take when no colour variant is on them.'),
		len('feedback-corners', 'Corners', '0.5rem', 0, 2, 0.025, ['rem', 'px']),
		len('feedback-border-width', 'Border width', '1px', 0, 6, 0.5, ['px', 'em']),
		{
			id: 'feedback-shadow',
			label: 'Shadow',
			type: 'select',
			default: 'none',
			options: [
				{ value: 'none', label: 'None' },
				{ value: 'var(--container-shadow)', label: 'Same as a container' }
			],
			vars: ['feedback-shadow']
		},
		c('feedback-dot-bg', 'Loading dots', 'var(--color-surface-2)',
			'Three discs drawn as background layers, so each can carry a fill AND a ring at once — which three elements cannot.'),
		c('skeleton-bg', 'Placeholder', 'var(--color-surface-2)'),
		c('skeleton-shimmer', 'Shimmer', 'var(--color-surface-1)',
			'The band that travels across a placeholder. `prefers-reduced-motion` stops it moving.'),
		c('skeleton-mask-edge', 'Shimmer edge', 'color-mix(in oklab, var(--color-on-surface) 20%, transparent)'),
		c('skeleton-mask-peak', 'Shimmer peak', 'var(--color-on-surface)')
	]
};

export const textSection: Section = {
	id: 'text',
	label: 'Text',
	prefixes: ['text', 'link'],
	help: 'Prose and links. They draw no frame, so the size knob that grows everything else leaves them alone.',
	controls: [
		len('text-border-width', 'Rule width', '1px', 0, 6, 0.5, ['px', 'em'],
			'The line under a heading, where a look draws one.'),
		{
			id: 'link-decoration',
			label: 'Underline',
			help: 'Always, or only on hover with `.link-hover`. Never is a legitimate answer and an accessibility risk: without it, colour alone carries the link.',
			type: 'select',
			default: 'underline',
			options: [
				{ value: 'underline', label: 'Always' },
				{ value: 'none', label: 'Never' },
				{ value: 'underline dotted', label: 'Dotted' }
			],
			vars: ['link-decoration']
		},
		{
			id: 'link-hover-decoration',
			label: 'Underline on hover',
			type: 'select',
			default: 'underline',
			options: [
				{ value: 'underline', label: 'Underline' },
				{ value: 'none', label: 'None' }
			],
			vars: ['link-hover-decoration']
		},
		pct('link-hover-mix', 'Hover shift', 20, 'How far a coloured link moves when you hover it.'),
		c('link-hover-mix-color', 'Hover shift towards', '#000'),
		len('link-focus-width', 'Focus ring', 'var(--focus-width)', 0, 6, 0.5, ['px', 'em']),
		len('link-focus-offset', 'Focus offset', 'var(--focus-offset)', 0, 6, 0.5, ['px', 'em']),
		c('link-focus-color', 'Focus colour', 'currentColor'),
		len('link-underline-width', 'Underline width', 'auto', 0, 6, 0.5, ['px', 'em']),
		len('link-underline-offset', 'Underline offset', 'auto', 0, 1, 0.025, ['em', 'px']),
		{
			id: 'link-weight',
			label: 'Weight',
			type: 'number' as const,
			default: 400,
			min: 100,
			max: 900,
			step: 50,
			vars: ['link-weight']
		}
	]
};
