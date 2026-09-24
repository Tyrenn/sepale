/**
 * The groups that every drawing section has, built once and instantiated per
 * section.
 *
 * A section calls `border('action')` and gets a group whose controls write
 * `--action-border-*`; Fields calls `border('field')` and gets the same group
 * over `--field-border-*`. The instances differ only by prefix, which is what
 * lets the form merge them into one widget in Basic mode and render them
 * separately in Advanced (ADR 0011).
 *
 * There is **no global variable**. A Basic widget writes the matching control
 * in every section at once; it holds no value of its own.
 *
 * `shadow` and `scale` live here too, for the same reason — every section has
 * one — but they are deliberately **not** `shared`: measured over the
 * nineteen shipped themes, shadow agrees across sections in 15 of 19 and
 * scale in 0 of 19. A button and a panel want different shadows, and no two
 * sections have ever agreed on a size.
 */

import {
	registerWriters,
	sidesOf,
	splitLength,
	type ColorControl,
	type ColorSource,
	type Control,
	type Group,
	type Sides,
	type Vars
} from '../schema.js';

const ALL: Sides = { top: true, right: true, bottom: true, left: true };

/* ------------------------------------------------------------------ *
 * The colour box
 * ------------------------------------------------------------------ */

/**
 * One box. It writes `--<id>-color` and `--<id>-shade`, always.
 *
 * `sources` lists only what that component's stylesheet can actually mix
 * from. `own` belongs where a `--_` slot exists to fall back to — that is
 * what makes a `.btn-primary` take a primary-tinted edge while a plain button
 * takes a grey one.
 */
export function box(
	id: string,
	label: string,
	opts: {
		sources: ColorSource[];
		source?: string;
		shade?: number;
		help?: string;
		/** `contrast` for anything written ON its source: an ink, a mark. */
		kind?: 'shade' | 'contrast';
		follows?: string;
		inkOf?: string;
	}
): ColorControl {
	return {
		id,
		label,
		type: 'color',
		help: opts.help,
		kind: opts.kind,
		follows: opts.follows,
		inkOf: opts.inkOf,
		sources: opts.sources,
		default: { source: opts.source ?? 'own', shade: opts.shade ?? 0 },
		vars: [`${id}-color`, `${id}-shade`]
	};
}

/* ------------------------------------------------------------------ *
 * Size — never shared
 * ------------------------------------------------------------------ */

export function scale(p: string, help: string): Control {
	return {
		id: `${p}-scale`,
		label: 'Size',
		help,
		type: 'number',
		default: 1,
		min: 0.75,
		max: 2,
		step: 0.05,
		vars: [`${p}-scale`]
	};
}

/* ------------------------------------------------------------------ *
 * Border — shared
 * ------------------------------------------------------------------ */

/**
 * Width and edges are ONE control over ONE variable.
 *
 * `border-width: 1px 0 1px 0` already says both things — the parts at `0` are
 * the edges that are off — so there is no second variable and no sentinel.
 * The shorthand is its own record.
 */
const borderWidth = (p: string): Control => ({
	id: `${p}-border-width`,
	label: 'Width',
	help: 'A number and the edges it is drawn on. All four, or a bottom rule, or an L.',
	type: 'edge-width',
	default: { width: '1px', sides: ALL },
	min: 0,
	max: 6,
	step: 0.5,
	units: ['px', 'em', 'rem'],
	vars: [`${p}-border-width`]
});

const borderColor = (p: string, sources: ColorSource[]): Control =>
	box(`${p}-border`, 'Colour', {
		sources,
		source: 'own',
		shade: 0.1,
		help: 'Derived from the element’s own fill, a coloured button takes a coloured edge. Derived from a token, every element takes the same one.'
	});

/** The three painted styles share their controls; only the style differs. */
const painted = (p: string, sources: ColorSource[]) => [borderWidth(p), borderColor(p, sources)];

const radiusControl = (p: string, dflt: string, id = `${p}-radius`, hidden?: string): Control => ({
	id,
	label: 'Radius',
	type: 'length',
	default: dflt,
	min: 0,
	max: 3,
	step: 0.05,
	units: ['rem', 'px', 'em'],
	hiddenWhen: hidden,
	vars: [`${p}-radius`]
});

export function border(
	p: string,
	sources: ColorSource[] = ['own', 'text', 'surface'],
	radiusDefault = '0.25rem',
	/* How many times this section's radius is the shared one. Container is
	   the only 2: a box is twice the radius of the things inside it, so
	   `container-radius: 0.5rem` and `action-radius: 0.25rem` are the SAME
	   answer said at two scales. Without it Container reads as detached in
	   every theme — and the field was declared in the schema and never set
	   by anyone, so the factor the comments described did not exist. */
	factor = 1
): Group {
	return {
		id: `${p}-border`,
		label: 'Border',
		shared: 'border',
		sharedFactor: factor,
		help: 'The style is the group’s own setting: no border is a style, not a width of zero you have to think about.',
		vars: [
			`${p}-border`,
			`${p}-border-style`,
			`${p}-border-width`,
			`${p}-border-color`,
			`${p}-border-shade`,
			`${p}-radius`
		],
		/* The corner is part of the border, not a group of its own: it is the
		   same edge, and asking about it twenty lines further down made two
		   questions out of one. It stays visible whatever the style, because a
		   borderless box still has corners. */
		controls: [radiusControl(p, radiusDefault, `${p}-radius`, `${p}-handdrawn:on`)],
		type: {
			default: 'none',
			modes: [
				{ id: 'none', label: 'None', controls: [] },
				{ id: 'solid', label: 'Solid', controls: painted(p, sources) },
				{ id: 'dashed', label: 'Dashed', controls: painted(p, sources) },
				{ id: 'dotted', label: 'Dotted', controls: painted(p, sources) }
			]
		}
	};
}

export function registerBorder(p: string) {
	/* Only the style. The width control writes its own variable, edges
	   included, so there is nothing left to recombine. `None` is the one
	   mode that has to say something: no border is a width of zero. */
	const style = (name: string) => () => ({ [`${p}-border-style`]: name });
	registerWriters({
		[`${p}-border:none`]: () => ({
			[`${p}-border-style`]: 'solid',
			[`${p}-border-width`]: '0'
		}),
		[`${p}-border:solid`]: style('solid'),
		[`${p}-border:dashed`]: style('dashed'),
		[`${p}-border:dotted`]: style('dotted')
	});
}


/* ------------------------------------------------------------------ *
 * Focus — shared
 * ------------------------------------------------------------------ */

const focusWidth = (p: string): Control => ({
	id: `${p}-focus-width`,
	label: 'Width',
	type: 'length',
	default: '2px',
	min: 0,
	max: 6,
	step: 0.5,
	units: ['px'],
	vars: [`${p}-focus-width`]
});

const focusColor = (p: string): Control =>
	box(`${p}-focus`, 'Colour', { sources: [], source: 'own', shade: 0 });

export function focus(p: string): Group {
	return {
		id: `${p}-focus`,
		label: 'Focus',
		shared: 'focus',
		help: 'An invisible focus ring is an accessibility bug, not a look. None is for looks that focus another way, not for looks that do not focus.',
		vars: [
			`${p}-focus`,
			`${p}-focus-width`,
			`${p}-focus-color`,
			`${p}-focus-shade`,
			`${p}-focus-ring-width`,
			`${p}-focus-ring-color`,
			`${p}-focus-outline-width`,
			`${p}-focus-cast-blur`
		],
		controls: [],
		type: {
			default: 'ring',
			modes: [
				{ id: 'none', label: 'None', controls: [] },
				{
					id: 'ring',
					label: 'Ring',
					help: 'A box-shadow spread with no blur — a hard halo that follows the shape exactly.',
					controls: [focusWidth(p), focusColor(p)]
				},
				{
					id: 'outline',
					label: 'Outline',
					help: 'A real outline, offset from the element, which the browser draws for free at any shape.',
					controls: [focusWidth(p), focusColor(p)]
				},
				{
					id: 'glow',
					label: 'Glow',
					help: 'The same shadow, blurred. Softer, and it reads at a distance.',
					controls: [focusWidth(p), focusColor(p)]
				}
			]
		}
	};
}

export function registerFocus(p: string) {
	const off = (): Vars => ({
		[`${p}-focus-ring-width`]: '0px',
		[`${p}-focus-outline-width`]: '0px',
		[`${p}-focus-cast-blur`]: '0px'
	});
	const w = (vars: Vars) => String(vars[`${p}-focus-width`] ?? '0px');
	registerWriters({
		[`${p}-focus:none`]: () => off(),
		[`${p}-focus:ring`]: (_, vars) => ({ ...off(), [`${p}-focus-ring-width`]: w(vars) }),
		[`${p}-focus:outline`]: (_, vars) => ({ ...off(), [`${p}-focus-outline-width`]: w(vars) }),
		[`${p}-focus:glow`]: (_, vars) => {
			const [n, u] = splitLength(w(vars), 'px');
			return {
				...off(),
				[`${p}-focus-ring-width`]: w(vars),
				[`${p}-focus-cast-blur`]: `${n * 3}${u}`
			};
		}
	});
}

/* ------------------------------------------------------------------ *
 * Disabled — shared
 * ------------------------------------------------------------------ */

export function disabled(p: string): Group {
	return {
		id: `${p}-disabled`,
		label: 'Disabled',
		shared: 'disabled',
		help: 'Computed is what every shipped theme does. Custom is for a look that paints its disabled state rather than fading it.',
		vars: [
			`${p}-disabled`,
			`${p}-disabled-mix`,
			`${p}-disabled-fg-mix`,
			`${p}-disabled-color`,
			`${p}-disabled-shade`
		],
		controls: [],
		type: {
			default: 'computed',
			modes: [
				{
					id: 'computed',
					label: 'Computed',
					controls: [
						{
							id: `${p}-disabled-fade`,
							label: 'Fade',
							type: 'percent',
							default: 20,
							min: 0,
							max: 100,
							step: 1,
							vars: [`${p}-disabled-mix`, `${p}-disabled-fg-mix`]
						}
					]
				},
				{
					id: 'custom',
					label: 'Custom',
					controls: [box(`${p}-disabled`, 'Colour', { sources: ['surface', 'text'] })]
				}
			]
		}
	};
}

export function registerDisabled(p: string) {
	registerWriters({
		/* The fill mixes from the OPAQUE ink. `--_fld-fg` is translucent and
		   redefined two lines down; mixing from it gives every disabled field
		   a pink cast. */
		[`${p}-disabled:computed`]: (_, vars) => {
			const n = parseFloat(vars[`${p}-disabled-mix`] ?? '20') || 0;
			return {
				[`${p}-disabled-mix`]: `${n}%`,
				[`${p}-disabled-fg-mix`]: `${Math.round(n * 2)}%`
			};
		},
		[`${p}-disabled:custom`]: () => ({
			[`${p}-disabled-mix`]: '0%',
			[`${p}-disabled-fg-mix`]: '0%'
		})
	});
}

/* ------------------------------------------------------------------ *
 * Hand-drawn — shared, and last in every section
 * ------------------------------------------------------------------ */

/**
 * Unanimous in the data: 19 of 19 themes agree across sections on whether the
 * look is hand-drawn. One decision, and cosmos is the only theme that turns
 * it on.
 *
 * Strength alone drives both wobble variables; the base radius comes from the
 * Corners group. Tilt writes the section's angle, which the section's own
 * writer spreads over whatever it actually rotates.
 */
export function handDrawn(p: string): Group {
	return {
		id: `${p}-handdrawn`,
		label: 'Hand-drawn',
		shared: 'handdrawn',
		help: 'Off true, the way a drawn thing sits. Small numbers read as drawn; large ones read as broken.',
		vars: [`${p}-handdrawn`, `${p}-wobble`, `${p}-angle`, `${p}-radius`],
		controls: [],
		type: {
			default: 'off',
			modes: [
				{ id: 'off', label: 'Off', controls: [] },
				{
					id: 'on',
					label: 'On',
					controls: [
						/* The radius the wobble is built from. It is the same
						   variable the Border group offers — which is why that
						   one hides while this is on. */
						radiusControl(p, '0.75rem', `${p}-handdrawn-radius`),
						{
							id: `${p}-handdrawn-strength`,
							label: 'Strength',
							help: 'The drift is in pixels, so a small control clamps it and reads nearly symmetric — a button will always wobble less than a panel.',
							type: 'number',
							default: 1,
							min: 0,
							max: 1,
							step: 0.05,
							vars: [`${p}-wobble`]
						},
						{
							id: `${p}-handdrawn-tilt`,
							label: 'Tilt',
							type: 'length',
							default: '0.4deg',
							min: 0,
							max: 3,
							step: 0.1,
							units: ['deg'],
							vars: [`${p}-angle`]
						}
					]
				}
			]
		}
	};
}

export function registerHandDrawn(p: string) {
	registerWriters({
		[`${p}-handdrawn:off`]: () => ({
			[`${p}-wobble`]: '0',
			[`${p}-angle`]: '0deg'
		}),
		[`${p}-handdrawn:on`]: (_, vars) => ({
			/* Only the two numbers. The corner recipe they feed lives in
			   _defaults.scss now: a theme writes lengths, never a formula. */
			[`${p}-wobble`]: String(vars[`${p}-wobble`] ?? 1),
			[`${p}-angle`]: String(vars[`${p}-angle`] ?? '0deg')
		})
	});
}

/* ------------------------------------------------------------------ *
 * Shadow — per section, never shared
 *
 * One control holding a LIST. The four old modes — soft, hard, inset,
 * relief — were presets over a thing that is naturally a list, and a look
 * wanting two shadows could not say so at all. They are gone, and with them
 * the twelve flat `--x-shadow-N-*` variables and the `shadowLayers`
 * geometry that filled them: the control writes the whole `box-shadow`
 * value, which is what `chip` and `menu` already read.
 * ------------------------------------------------------------------ */

export function shadow(p: string, opts: { relief?: boolean } = {}): Group {
	return {
		id: `${p}-shadow-group`,
		label: 'Shadow',
		vars: [`${p}-shadow`, ...(opts.relief ? [`${p}-depth`] : [])],
		controls: [
			{
				id: `${p}-shadow`,
				label: '',
				type: 'shadows',
				default: [],
				vars: [`${p}-shadow`]
			},
			...(opts.relief
				? [
						{
							id: `${p}-depth`,
							label: 'Relief',
							help: 'A retro edge tinted with the element’s own fill. It has to resolve on the element, so only its amount is here.',
							type: 'number' as const,
							default: 0,
							min: 0,
							max: 1,
							step: 0.05,
							vars: [`${p}-depth`]
						}
					]
				: [])
		]
	};
}

/* ------------------------------------------------------------------ *
 * One call per section
 * ------------------------------------------------------------------ */

/** Register every shared writer a section needs. Call once, at import. */
export function registerShared(
	p: string,
	has: { border?: boolean; focus?: boolean; disabled?: boolean; handdrawn?: boolean }
) {
	if (has.border) registerBorder(p);
	if (has.focus) registerFocus(p);
	if (has.disabled) registerDisabled(p);
	if (has.handdrawn) registerHandDrawn(p);
}
