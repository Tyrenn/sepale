import type { Draft, Vars } from '../schema.js';
import { registerWriters, shadowLayers, shadowVars, sidesOf, type Sides } from '../schema.js';

/**
 * Writers — the Actions controls that are not one-to-one.
 *
 * They live beside their section rather than in the schema because the
 * arithmetic that turns "push, a quarter em" into four variables is part of
 * what Actions means. The schema owns the machinery; a section owns its
 * answers. `expand()` hands these a draft with every default already filled
 * in, so they read values rather than guessing at fallbacks.
 */

const ALL: Sides = { top: true, right: true, bottom: true, left: true };

const shadow = (d: Draft, inset: boolean): Vars =>
	shadowVars(
		'action',
		shadowLayers(sidesOf(d, 'action-shadow-sides'), String(d['action-shadow-offset'])),
		{
			blur: String(d['action-shadow-blur'] ?? '0px'),
			color: String(d['action-shadow-color']),
			inset
		}
	);

const noShadow = (): Vars => shadowVars('action', [], { blur: '0px', color: '#0000', inset: false });

/** Every press shape is these four numbers, differently filled. */
function press(x: string, y: string, rotate: string, shadowScale: string): Vars {
	return {
		'action-press-x': x,
		'action-press-y': y,
		'action-press-rotate': rotate,
		'action-press-shadow-scale': shadowScale
	};
}

registerWriters({
	/* Width and edges are two controls feeding one shorthand. */
	'action-border': (d) => {
		const w = String(d['action-border'] ?? '0');
		const s = (d['action-border-sides'] as Sides) ?? ALL;
		const e = (side: keyof Sides) => (s[side] ? w : '0');
		const all = s.top && s.right && s.bottom && s.left;
		return {
			'action-border-width': all ? w : `${e('top')} ${e('right')} ${e('bottom')} ${e('left')}`
		};
	},

	'action-shadow:none': () => ({ ...noShadow(), 'action-depth': '0' }),
	'action-shadow:soft': (d) => shadow(d, false),
	'action-shadow:hard': (d) => shadow(d, false),
	'action-shadow:inset': (d) => shadow(d, true),
	'action-shadow:depth': (d) => ({ ...noShadow(), 'action-depth': String(d['action-depth']) }),

	'action-corner:radius': (d) => ({
		'action-radius': String(d['action-radius']),
		'action-corners': 'var(--action-radius)'
	}),
	'action-corner:wobble': (d) => {
		const r = String(d['action-radius']);
		const a = String(d['action-wobble']);
		const c = (px: number) => `calc(${r} + ${a} * ${px}px)`;
		return {
			'action-radius': r,
			'action-corners': `${c(0)} ${c(240)} ${c(210)} ${c(0)} / ${c(240)} ${c(0)} ${c(0)} ${c(210)}`
		};
	},

	'action-press:none': () => press('0px', '0px', '0deg', '1'),
	'action-press:sink': (d) => press('0px', String(d['action-press-amount']), '0deg', '0'),
	'action-press:push': (d) => {
		const o = String(d['action-press-amount']);
		return {
			...press(o, o, '0deg', '0'),
			'action-hover-x': `calc(${o} * 0.5)`,
			'action-hover-y': `calc(${o} * 0.5)`,
			'action-hover-shadow-scale': '0.5'
		};
	},
	'action-press:tilt': (d) => {
		const a = String(d['action-press-angle']);
		return {
			...press('0px', '0px', a, '1'),
			'action-rest-rotate': `calc(${a} * -1)`,
			'action-hover-rotate': '0deg'
		};
	}
});
