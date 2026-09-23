/**
 * Sections — Markers and Feedback.
 *
 * Markers: `badge`, `chip`. `badge` wants zero controls and earns them — it
 * positions a chip and paints nothing.
 *
 * Feedback: `progress`, `radial-progress`, `loading`, `skeleton`. `validator`
 * has moved to Field, where it belongs: it drives a field's accent.
 *
 * Neither has a Focus group: nothing here takes focus. Feedback has no Shadow
 * and no Hand-drawn either — a progress bar is not drawn by hand in any
 * shipped theme, and if one ever is, the shared group is there to be added.
 *
 * Spec: `docs/specs/theme-generator/07-markers.md`, `08-feedback.md`.
 */

import type { Section } from '../schema.js';
import { registerWriters } from '../schema.js';
import {
	border,
	box,
	handDrawn,
	radius,
	registerShared,
	scale,
	shadow,
	typography
} from './shared.js';

/* ------------------------------------------------------------------ *
 * Markers
 * ------------------------------------------------------------------ */

const M = 'marker';
registerShared(M, { border: true, handdrawn: true, shadow: true });

export const markers: Section = {
	id: 'markers',
	label: 'Markers',
	prefixes: ['marker', 'badge', 'chip'],
	help: 'The small labels you pin to something else.',
	internal: [],
	controls: [
		scale(M, 'Grows a chip and a badge.'),

		{
			id: 'marker-fill',
			label: 'Fill',
			layout: 'row',
			vars: ['marker-bg-color', 'marker-bg-shade', 'marker-fg-color', 'marker-fg-shade'],
			controls: [
				box('marker-bg', 'Background', {
					sources: ['semantic', 'surface'],
					source: 'color-surface-3'
				}),
				box('marker-fg', 'Text', { sources: ['own', 'text'], source: 'own' })
			]
		},

		/* No Corners group. `--marker-corners` is 999px: a chip is a pill,
		   always, and Common's Radius does not multiply it. If a look ever
		   wants square chips, that is a class. */
		border(M),
		shadow(M),
		typography(M),
		handDrawn(M)
	]
};

/* ------------------------------------------------------------------ *
 * Feedback
 * ------------------------------------------------------------------ */

const F = 'feedback';
registerShared(F, { border: true });

export const feedback: Section = {
	id: 'feedback',
	label: 'Feedback',
	prefixes: ['feedback', 'progress', 'radial-progress', 'loading', 'skeleton'],
	help: 'Bars, rings, spinners and placeholders — what tells you something is happening.',
	internal: [],
	controls: [
		scale(
			F,
			'Grows a bar, a ring and a placeholder. `progress` takes its height from here: there is no track height shared with the slider, because Selectors has its own Size and that is the per-section rule.'
		),

		{
			id: 'feedback-fill-group',
			label: 'Fill',
			layout: 'row',
			vars: [
				'feedback-fill-color',
				'feedback-fill-shade',
				'feedback-track-color',
				'feedback-track-shade'
			],
			controls: [
				box('feedback-fill', 'Fill', {
					sources: ['semantic', 'text'],
					source: 'color-primary'
				}),
				box('feedback-track', 'Track', {
					sources: ['own', 'text', 'surface'],
					source: 'own',
					shade: 0.1
				})
			]
		},

		radius(F, 2, '0.5rem'),
		border(F),

		{
			id: 'skeleton',
			label: 'Skeleton',
			help: 'Pulse is the accessible default. Shimmer travels; its 15s cycle is fixed in the component and is not a theme decision.',
			vars: ['skeleton', 'skeleton-shimmer', 'skeleton-mask-edge', 'skeleton-mask-peak'],
			controls: [],
			type: {
				default: 'pulse',
				modes: [
					{ id: 'static', label: 'Static', controls: [] },
					{
						id: 'pulse',
						label: 'Pulse',
						controls: [
							{
								id: 'skeleton-intensity',
								label: 'Intensity',
								type: 'percent',
								default: 60,
								min: 0,
								max: 100,
								step: 5,
								vars: ['skeleton-shimmer', 'skeleton-mask-edge', 'skeleton-mask-peak']
							}
						]
					},
					{
						id: 'shimmer',
						label: 'Shimmer',
						controls: [
							{
								id: 'skeleton-intensity',
								label: 'Intensity',
								type: 'percent',
								default: 40,
								min: 0,
								max: 100,
								step: 5,
								vars: ['skeleton-shimmer', 'skeleton-mask-edge', 'skeleton-mask-peak']
							}
						]
					}
				]
			}
		}
	]
};

/* One number becomes the shimmer and its two mask stops. */
registerWriters({
	'skeleton:static': () => ({
		'skeleton-shimmer': '0',
		'skeleton-mask-edge': '0%',
		'skeleton-mask-peak': '0%'
	}),
	'skeleton:pulse': (_, vars) => {
		const n = parseFloat(vars['skeleton-shimmer'] ?? '60') || 0;
		return {
			'skeleton-shimmer': String(n),
			'skeleton-mask-edge': '0%',
			'skeleton-mask-peak': `${n}%`
		};
	},
	'skeleton:shimmer': (_, vars) => {
		const n = parseFloat(vars['skeleton-shimmer'] ?? '40') || 0;
		return {
			'skeleton-shimmer': String(n),
			'skeleton-mask-edge': `${Math.round(n / 2)}%`,
			'skeleton-mask-peak': `${n}%`
		};
	}
});
