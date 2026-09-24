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
	readValue,
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
	/** Sections whose copy of a shared group is detached from Common.
	
	    TypeScript, never a CSS variable: a theme is its variables (ADR 0011)
	    and this is not one of them. It is only needed for the moment between
	    ticking a section and moving its control, when the values still agree
	    and cannot say so themselves. Keyed `<section>:<shared>`. */
	detached: [] as string[],
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
	/** Set on a section's own copy of a shared group — the one behind a tick.
	    Absent on Common's copy, and on everything that is not shared. */
	override?: { shared: string; section: string };
}

export interface ViewSection {
	id: string;
	label: string;
	help?: string;
	entries: ViewEntry[];
}

/* ------------------------------------------------------------------ *
 * Common, and what detaches from it
 * ------------------------------------------------------------------ */

/**
 * There is ONE mode. A shared group appears in **Common**, where moving it
 * writes every section at once, and again at the end of each section it
 * belongs to, where moving it writes that section alone.
 *
 * Whether a section is detached is **not stored**. It is read off the values:
 * bucket the sections by the answer they hold, and the biggest bucket IS
 * Common's answer — the rest have drifted from it. Two sections agreeing are
 * enough to set the reference; all six disagreeing means every one of them is
 * an override and Common has nothing to say.
 *
 * That is what keeps ADR 0011 intact. No `--common-*` variable, no second
 * level of cascade, and no sentinel: a theme is still exactly its variables,
 * and a hand-written file opens with its overrides already marked.
 *
 * The tick the user can set themselves lives in `generator.detached` — a
 * TypeScript array beside `generator.open`, never a CSS variable. It exists
 * for the one moment the values cannot speak for themselves: between ticking
 * a section and actually moving its control, the two still agree, and without
 * the tick Common would drag it back.
 */

/** Every instance of every shared group, in section order. */
function sharedInstances(): Map<string, { section: Section; group: Group }[]> {
	const out = new Map<string, { section: Section; group: Group }[]>();
	for (const s of SECTIONS) {
		for (const e of s.controls) {
			if (!isGroup(e) || !e.shared) continue;
			const list = out.get(e.shared) ?? [];
			list.push({ section: s, group: e });
			out.set(e.shared, list);
		}
	}
	return out;
}

/** Every control of a group, keyed by POSITION so the factories line up. */
function slots(g: Group): { key: string; control: Control }[] {
	const out: { key: string; control: Control }[] = [];
	g.controls.forEach((c, i) => out.push({ key: `own:${i}`, control: c }));
	for (const m of g.type?.modes ?? []) {
		m.controls.forEach((c, i) => out.push({ key: `${m.id}:${i}`, control: c }));
	}
	return out;
}

/**
 * One instance's answer, as a string to compare.
 *
 * Divided by the corner factor first. Boxes are twice the radius of the things
 * inside them, so `container-radius: 1rem` and `action-radius: 0.5rem` are the
 * SAME answer said at two scales — compare them raw and Container looks
 * detached in every theme. `forPeer` multiplies the factor back in when the
 * value travels the other way; this is the same arithmetic reversed.
 */
function answer(g: Group, vars: Vars): string {
	const f = g.sharedFactor ?? 1;
	const norm = (v: unknown) => {
		if (f === 1 || typeof v !== 'string') return JSON.stringify(v);
		const m = v.match(/^(-?[\d.]+)(px|rem|em)$/);
		/* One shape for both branches: a bare string on one side and a quoted
		   one on the other made an identical answer compare unequal. */
		return JSON.stringify(m ? `${parseFloat(m[1]) / f}${m[2]}` : v);
	};
	const mode = readMode(g, vars);
	const parts = [mode];
	for (const { key, control } of slots(g)) {
		/* A mode's controls only count when the modes agree; otherwise the
		   question does not arise and comparing them says nothing. */
		if (!key.startsWith('own:') && !key.startsWith(`${mode}:`)) continue;
		parts.push(norm(readValue(control, vars)));
	}
	return parts.join('|');
}

/** Common's reference for a shared group, and which sections have left it. */
function alignment(shared: string) {
	const instances = sharedInstances().get(shared) ?? [];
	const buckets = new Map<string, { section: Section; group: Group }[]>();
	for (const it of instances) {
		const a = answer(it.group, generator.vars);
		buckets.set(a, [...(buckets.get(a) ?? []), it]);
	}
	/* Biggest bucket wins; on a tie the earliest section does, so the answer
	   never flickers between two equal readings. */
	const ranked = [...buckets.values()].sort((a, b) => b.length - a.length);
	const aligned = ranked[0] ?? [];
	const detachedByValue = new Set(
		instances.filter((it) => !aligned.includes(it)).map((it) => it.section.id)
	);
	/* Plus whatever the user ticked, which the values cannot yet show. */
	for (const it of instances) {
		if (generator.detached.includes(`${it.section.id}:${shared}`)) {
			detachedByValue.add(it.section.id);
		}
	}
	return {
		instances,
		/* Common shows the aligned answer, and writes into the aligned only. */
		reference: aligned.filter((it) => !detachedByValue.has(it.section.id)),
		detached: detachedByValue
	};
}

/** Is this section's copy of a shared group detached from Common? */
export function isDetached(sectionId: string, shared: string): boolean {
	return alignment(shared).detached.has(sectionId);
}

/**
 * Detach a section's group, or fold it back in.
 *
 * Folding back in COPIES Common's answer over it — which is what makes the
 * toggle reversible. Detaching writes nothing: the values are still equal, and
 * the tick is there to say so until one of them moves.
 */
export function setDetached(sectionId: string, shared: string, on: boolean) {
	const key = `${sectionId}:${shared}`;
	if (on) {
		if (!generator.detached.includes(key)) generator.detached = [...generator.detached, key];
		return;
	}
	generator.detached = generator.detached.filter((x) => x !== key);
	const { instances, reference } = alignment(shared);
	const from = reference[0];
	const to = instances.find((it) => it.section.id === sectionId);
	if (!from || !to || from.group === to.group) return;
	/* Replay Common's answer into it, mode first: changing a mode resets that
	   mode's controls, so the values have to follow it. */
	apply(writeMode(to.group, readMode(from.group, generator.vars), generator.vars));
	for (const { key: k, control } of slots(from.group)) {
		const peer = slots(to.group).find((x) => x.key === k)?.control;
		if (!peer) continue;
		const v = forPeer(readValue(control, generator.vars), from.group, to.group);
		apply(writeValue(peer, v, generator.vars, to.group));
	}
}

export function view(): ViewSection[] {
	const shared = sharedInstances();

	const sections: ViewSection[] = SECTIONS.map((s) => ({
		id: s.id,
		label: s.label,
		help: s.help,
		entries: s.controls
			.filter((e) => !isGroup(e) || !e.shared)
			.map((entry) => ({ entry, peers: [] as Group[] }))
	}));

	/* Each section keeps its own copy of every shared group, at the END and
	   behind a tick: a section is read top to bottom, and what it shares with
	   the rest is the last thing you reach for. */
	for (const [id, instances] of shared) {
		for (const it of instances) {
			const target = sections.find((x) => x.id === it.section.id);
			if (!target) continue;
			target.entries.push({ entry: it.group, peers: [], override: { shared: id, section: it.section.id } });
		}
	}

	/* Common sits between Colours and the first drawing section: it is what you
	   answer once, before tuning anything in particular. */
	const common: ViewSection = {
		id: 'common',
		label: 'Common',
		help: 'Answered once for every section. Each section can take any of these over at the end of its own list — and a theme that already disagrees arrives with those marked.',
		entries: [...shared.keys()].flatMap((id) => {
			const { reference, instances } = alignment(id);
			const lead = reference[0] ?? instances[0];
			if (!lead) return [];
			return [{ entry: lead.group, peers: reference.slice(1).map((it) => it.group) }];
		})
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
	/* Any tick the user set belongs to the theme they set it on. A new one
	   arrives with its own overrides already readable in its values. */
	generator.detached = [];
	generator.vars = { ...NEUTRAL };
	generator.preset = '';
}

/** Load a theme. A theme IS its variables, so this is an assignment. */
export function load(vars: Vars, name = '') {
	/* Any tick the user set belongs to the theme they set it on. A new one
	   arrives with its own overrides already readable in its values. */
	generator.detached = [];
	generator.vars = { ...NEUTRAL, ...vars };
	generator.preset = name;
}

export function toggleSection(id: string) {
	generator.open = generator.open.includes(id)
		? generator.open.filter((x) => x !== id)
		: [...generator.open, id];
}
