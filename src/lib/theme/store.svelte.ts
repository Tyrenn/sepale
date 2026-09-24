/**
 * The generator's state.
 *
 * The state is `vars` — the variables themselves. A control has no value of
 * its own: it reads one out to show and writes variables when it is moved
 * (ADR 0011). That is the whole reason the Basic / Advanced switch can be
 * purely visual.
 */

import {
	isGroup,
	neutralVars,
	readMode,
	serialise,
	splitLength,
	writeMode,
	writeValue,
	type Control,
	type Entry,
	type Group,
	type Section,
	type Vars
} from './schema.js';

import { parse } from './schema.js';
import { PRESETS } from './presets.js';
import { colors } from './sections/colors.js';
import { action } from './sections/action.js';
import { field } from './sections/field.js';
import { selectors } from './sections/selectors.js';
import { container } from './sections/container.js';
import { markers, feedback } from './sections/rest.js';

export const SECTIONS: Section[] = [colors, action, field, selectors, container, markers, feedback];

/** Every variable at its default: the baseline a theme is a diff against. */
export const NEUTRAL: Vars = neutralVars(SECTIONS);

export const generator = $state({
	vars: { ...NEUTRAL } as Vars,
	/** Purely visual. Nothing is written when it flips. */
	advanced: false,
	open: ['colors'] as string[],
	preset: ''
});

/* ------------------------------------------------------------------ *
 * The view: which controls are on screen, and what a write mirrors to
 * ------------------------------------------------------------------ */

/**
 * A group and the other instances of it that a Basic write mirrors into.
 *
 * `peers` is empty in Advanced, and in Basic it holds the same group as every
 * other section declares it — built by the same factory, so the controls line
 * up by index and no id has to be parsed.
 */
export interface ViewEntry {
	entry: Entry;
	peers: Group[];
}

export interface ViewSection {
	id: string;
	label: string;
	help?: string;
	entries: ViewEntry[];
}

const sharedOf = (e: Entry): string | undefined => (isGroup(e) ? e.shared : undefined);

/** Every instance of every shared group, in section order. */
function sharedInstances(): Map<string, Group[]> {
	const out = new Map<string, Group[]>();
	for (const s of SECTIONS) {
		for (const e of s.controls) {
			const id = sharedOf(e);
			if (!id) continue;
			(out.get(id) ?? out.set(id, []).get(id)!).push(e as Group);
		}
	}
	return out;
}

export function view(): ViewSection[] {
	if (generator.advanced) {
		return SECTIONS.map((s) => ({
			id: s.id,
			label: s.label,
			help: s.help,
			entries: s.controls.map((entry) => ({ entry, peers: [] }))
		}));
	}

	const shared = sharedInstances();
	const sections: ViewSection[] = SECTIONS.map((s) => ({
		id: s.id,
		label: s.label,
		help: s.help,
		entries: s.controls.filter((e) => !sharedOf(e)).map((entry) => ({ entry, peers: [] }))
	}));

	/* Common sits between Colours and the first drawing section: it is the
	   answer you give once, before you start tuning anything in particular. */
	const common: ViewSection = {
		id: 'common',
		label: 'Common',
		help: 'These settings are written into every section at once. Tick Advanced to set them section by section.',
		entries: [...shared.values()].map(([first, ...peers]) => ({ entry: first, peers }))
	};

	return [sections[0], common, ...sections.slice(1)];
}

/* ------------------------------------------------------------------ *
 * Writing
 * ------------------------------------------------------------------ */

const apply = (v: Vars) => {
	generator.vars = { ...generator.vars, ...v };
};

/** The control at the same position in a peer group. The factories match. */
function peerControl(group: Group, peer: Group, c: Control): Control | undefined {
	const i = group.controls.indexOf(c);
	if (i >= 0) return peer.controls[i];
	for (const m of group.type?.modes ?? []) {
		const j = m.controls.indexOf(c);
		if (j < 0) continue;
		return peer.type?.modes.find((x) => x.id === m.id)?.controls[j];
	}
	return undefined;
}

/**
 * Scale a value for a peer whose section draws at a different ratio.
 *
 * Only Corners uses this: boxes are twice the radius of the things inside
 * them, in every daisy theme. One Basic widget, two correct radii.
 */
function forPeer(value: unknown, group: Group, peer: Group): unknown {
	const from = group.sharedFactor ?? 1;
	const to = peer.sharedFactor ?? 1;
	if (from === to || typeof value !== 'string') return value;
	const [n, u] = splitLength(value);
	return `${(n / from) * to}${u}`;
}

export function setValue(c: Control, value: unknown, group?: Group, peers: Group[] = []) {
	apply(writeValue(c, value, generator.vars, group));
	if (!group) return;
	for (const peer of peers) {
		const pc = peerControl(group, peer, c);
		if (pc) apply(writeValue(pc, forPeer(value, group, peer), generator.vars, peer));
	}
}

export function setMode(group: Group, mode: string, peers: Group[] = []) {
	apply(writeMode(group, mode, generator.vars));
	for (const peer of peers) apply(writeMode(peer, mode, generator.vars));
}

/** Whether a Basic widget's instances disagree — the `≠` marker. */
export function diverges(group: Group, peers: Group[]): boolean {
	if (!peers.length) return false;
	const here = readMode(group, generator.vars);
	return peers.some((p) => readMode(p, generator.vars) !== here);
}

/* ------------------------------------------------------------------ *
 * In and out
 * ------------------------------------------------------------------ */

/** The theme, as it would be downloaded: only what differs from neutral. */
export function css(): string {
	return serialise(generator.vars, NEUTRAL);
}

/**
 * Every value as declarations, for the <style> the layout injects.
 *
 * ALL of them, not the diff `css()` writes. A downloaded theme lands on
 * `:root` of a page with nothing under it, so stating only what differs is
 * right there. The preview sits inside an app that has a theme of its own,
 * and anything the draft left out would show through it — so the scope has
 * to state the whole set, neutral values included.
 */
export function inlineStyle(): string {
	return Object.entries({ ...NEUTRAL, ...generator.vars })
		.map(([k, v]) => `--${k}:${v};`)
		.join('');
}

/** Load a shipped theme by name. A theme is a file, so this is a fetch. */
export async function selectPreset(name: string) {
	if (!name) return reset();
	const p = PRESETS.find((x) => x.name === name);
	if (!p) return;
	const res = await fetch(p.url);
	load(parse(await res.text()), name);
}

export function reset() {
	generator.vars = { ...NEUTRAL };
	generator.preset = '';
}

/** Load a theme. A theme IS its variables, so this is an assignment. */
export function load(vars: Vars, name = '') {
	generator.vars = { ...NEUTRAL, ...vars };
	generator.preset = name;
}

export function toggleSection(id: string) {
	generator.open = generator.open.includes(id)
		? generator.open.filter((x) => x !== id)
		: [...generator.open, id];
}
