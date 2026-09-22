import { expand, parse, serialise, type Draft, type Section, type Vars } from './schema.js';
import { colors } from './sections/colors.js';
import { PRESETS } from './presets.js';
import { actions } from './sections/actions.js';
import { fields } from './sections/fields.js';
import { selectors } from './sections/selectors.js';
import { containers } from './sections/containers.js';
import { markers, feedback, textSection } from './sections/rest.js';

/**
 * The generator's state.
 *
 * A draft is control id → value. Everything else is derived: the variables,
 * the stylesheet, the exported file. Nothing here knows what a button looks
 * like — that is `src/scss/components/button.scss`, and the only thing
 * crossing between them is a list of names, which `npm run check:theme`
 * keeps honest.
 */

/** Every section, in the order the form shows them. */
export const SECTIONS: Section[] = [
	colors,
	actions,
	fields,
	selectors,
	containers,
	markers,
	feedback,
	textSection
];

/** The neutral theme: every control at its default. What a theme is a diff of. */
export const NEUTRAL: Vars = expand(SECTIONS, {});

export const generator = $state<{ draft: Draft; paintApp: boolean; preset: string }>({
	draft: {},
	/** Which shipped theme the draft started from. Shown in the picker. */
	preset: PRESETS[0].name,
	/**
	 * Whether the theme paints the generator's own chrome too.
	 *
	 * On is the honest default — a look is judged on a real page, and every
	 * wrong family this project shipped was written without looking at one.
	 * Off is the way back when a draft has pushed the contrast or the corners
	 * far enough that the form itself stops being usable.
	 */
	paintApp: true
});

/** The variables the draft produces, defaults included. */
export function vars(): Vars {
	return expand(SECTIONS, generator.draft);
}

/** `:root { … }` holding only what differs from neutral. What you download. */
export function themeCss(): string {
	return serialise(vars(), NEUTRAL);
}

/** The same, as one inline declaration block for a live `<style>`. */
export function inlineStyle(): string {
	return Object.entries(vars())
		.filter(([k, v]) => NEUTRAL[k] !== v)
		.map(([k, v]) => `--${k}: ${v};`)
		.join('');
}

/** Read a control's current value, or its default. */
export function get(id: string, fallback: unknown): unknown {
	return generator.draft[id] ?? fallback;
}

export function set(id: string, value: unknown) {
	generator.draft[id] = value;
}

/** Drop a control back to its default rather than storing the default. */
export function reset(id: string) {
	delete generator.draft[id];
}

/** Load a theme the generator wrote earlier, or apply a preset's draft. */
export function load(source: string | Draft) {
	generator.draft = typeof source === 'string' ? parse(SECTIONS, source) : { ...source };
}

/** Switch to one of the shipped themes by name. */
export function selectPreset(name: string) {
	const p = PRESETS.find((x) => x.name === name);
	if (!p) return;
	generator.preset = name;
	load(p.draft);
}
