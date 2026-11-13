/**
 * The component pages, assembled.
 *
 * Two halves meet here, and the split is the whole point:
 *
 *   docs/<id>.svelte   HAND-WRITTEN — the prose (what the component is, what
 *                      each class does, what each prop means) and the
 *                      examples. Plus `namespaces`, the one structural fact
 *                      nothing can derive: that `.title` belongs to `text`.
 *
 *   $lib/generated/    DERIVED — which classes the ACTIVE FAMILY ships, and
 *   components.ts      how its component classifies each one. Written by
 *                      scripts/gen-components.mjs in the same pass that
 *                      narrows the components themselves, so a page cannot
 *                      offer what the stylesheet has never heard of.
 *
 * A class with no prose still gets a row, with a sentence derived from its
 * classification. Nobody has to write 180 sentences for the page to work.
 */

import type { Component } from 'svelte';
import { classesByFamily, schema, statesByClass } from '$lib/generated/components.js';
import { camel } from '../../classify.js';
/* The active family may be one loaded from disk: ask through the playground. */
import { classesFor, axesFor, flagsFor } from '../../playground.svelte.js';

export { classesByFamily };

export interface PropDoc {
	name: string;
	type: string;
	default?: string;
	description: string;
}

export interface ComponentDoc {
	/** Which class namespaces this page documents. `text` owns three. */
	namespaces: string[];
	/** One or two sentences: what it is, and what it is not. */
	description: string;
	/** Class name → what it does. Optional: a missing one is derived. */
	classes: Record<string, string>;
	/** Component name → its props. Empty when there is no Svelte wrapper. */
	props: Record<string, PropDoc[]>;
}

interface DocModule {
	default: Component<{ }>;
	DOC: ComponentDoc;
}

/* Eager, so a page is a static import and the route still prerenders. A file
   added to docs/ appears on its own — there is no list to forget to update. */
const modules = import.meta.glob('./docs/*.svelte', { eager: true }) as Record<string, DocModule>;

export const pages: Record<string, { examples: Component<{ }>; doc: ComponentDoc }> =
	Object.fromEntries(
		Object.entries(modules).map(([path, mod]) => [
			path.slice('./docs/'.length, -'.svelte'.length),
			{ examples: mod.default, doc: mod.DOC }
		])
	);

export const ids = Object.keys(pages).sort();

/** One row of the CSS table. */
export interface ClassRow {
	/** One class, or every value of one axis on one element: they read as one row. */
	names: string[];
	effect: string;
	/** In an axis row, the values that have prose of their own. */
	notes: { name: string; effect: string }[];
	/** `axis color`, `flag`, `part`, `root`, or `—` when nobody classifies it. */
	type: string;
	/** Ordering only: the root first, then axes, flags, parts, strays. */
	rank: number;
}

const RANK = { root: 0, axis: 1, flag: 2, part: 3, unclassified: 4 } as const;

/** Every class the active family ships in this page's namespaces, classified. */
export function classRows(id: string, family: string): ClassRow[] {
	const doc = pages[id]?.doc;
	if (!doc) return [];
	const shipped = classesFor(family);
	const mine = (cls: string) =>
		doc.namespaces.some((ns) => cls === ns || cls.startsWith(ns + '-'));

	/* The values of one axis on one element are one row: `.btn-xs … .btn-xl`
	   says "the size axis" once, not five times. Keyed by the class minus its
	   value, so `.tabs-sm` and `.tabs-item-sm` would stay apart. */
	const axes = new Map<string, ClassRow>();
	for (const [name, info] of Object.entries(shipped)) {
		if (!mine(name) || info.kind !== 'axis') continue;
		const value = info.value ?? '';
		const key = `${value ? name.slice(0, -(value.length + 1)) : name}|${info.axis}`;
		let row = axes.get(key);
		if (!row) {
			row = { names: [], effect: `Sets ${info.axis}, one class per value.`, notes: [], type: `axis ${info.axis}`, rank: RANK.axis };
			axes.set(key, row);
		}
		row.names.push(name);
		const written = doc.classes?.[name];
		if (written) row.notes.push({ name, effect: written });
	}
	/* The values in the order the family declares them (xs before xl), not the
	   alphabetical one the stylesheet hands over. */
	const declared = axesFor(family);
	const rank = (cls: string) => {
		const info = shipped[cls]!;
		const values: readonly string[] = (info.component && info.axis && declared[info.component]?.[info.axis]) || [];
		const i = values.indexOf(info.value ?? '');
		return i < 0 ? Number.MAX_SAFE_INTEGER : i;
	};
	for (const row of axes.values()) row.names.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));

	/* An axis of a single value is no group: its prose, if any, is the effect. */
	for (const row of axes.values()) {
		if (row.names.length === 1) {
			row.effect = row.notes[0]?.effect ?? row.effect;
			row.notes = [];
		}
	}

	const singles = Object.entries(shipped)
		.filter(([cls, info]) => mine(cls) && info.kind !== 'axis')
		.map(([name, info]): ClassRow => {
			const written = doc.classes?.[name];
			let effect = written ?? '';
			let type: string = info.kind;
			if (info.kind === 'root') {
				effect ||= doc.description;
				type = 'root';
			} else if (info.kind === 'flag') {
				effect ||= `Written by the ${info.prop} prop.`;
				type = 'flag';
			} else if (info.kind === 'part') {
				effect ||= 'Drawn by the component; you never opt into it.';
				type = 'part';
			} else {
				/* No Svelte wrapper classifies it, which is the design for `text`,
				   `link` and `validator` — one class on one element, nothing to
				   wrap. The column has nothing to say, so it says nothing; the
				   build warns about the classes that are a real gap. */
				type = '';
			}
			return { names: [name], effect, notes: [], type, rank: RANK[info.kind] };
		});

	/* Rows sort by kind, then by their first class. */
	return [...axes.values(), ...singles].sort(
		(a, b) => a.rank - b.rank || a.names[0]!.localeCompare(b.names[0]!)
	);
}

/** One row of the Svelte table. */
export interface PropRow extends PropDoc {
	/** Which component it belongs to — a page may document more than one. */
	component: string;
}

/**
 * Which of a component's boolean props are FLAGS — that is, props that write a
 * class. Read from what the component declares, not from any family, because
 * a family that does not ship one is exactly the case we are trying to catch.
 */
const flagNames = (() => {
	const cache = new Map<string, Set<string>>();
	return (component: string) => {
		let set = cache.get(component);
		if (!set) {
			set = new Set((schema[component]?.flags ?? []).map(camel));
			cache.set(component, set);
		}
		return set;
	};
})();

/**
 * The props the active family leaves standing. An axis it does not ship loses
 * its prop entirely (see AxisProps), so the table says the same thing the
 * generated component's type does.
 */
export function propRows(id: string, family: string): PropRow[] {
	const doc = pages[id]?.doc;
	if (!doc) return [];
	const rows: PropRow[] = [];

	/* Driven by the components that own the classes, NOT by the hand-written
	   prose: `Loading` is all axes and no prose, and it still has props. */
	for (const component of componentsOf(id, family)) {
		const props = doc.props?.[component] ?? [];
		const axes = axesFor(family)[component] ?? {};
		const flags = flagsFor(family)[component] ?? [];

		/* An axis first: it is the prop whose type changes with the family. */
		for (const [axis, values] of Object.entries(axes)) {
			rows.push({
				component,
				name: axis,
				type: values.map((v) => `"${v}"`).join(' | '),
				/* `variant` is the name we keep for an exclusive group with no
				   better one, so it must not stutter into "variant variant". */
				description:
					axis === 'variant' ? 'Which variant to draw.' : `Which ${axis} variant to draw.`
			});
		}

		for (const p of props) {
			/* A flag the family cannot paint is a prop that does nothing. Only a
			   real flag is filtered: `validator` is a boolean too, and it is not
			   a class this or any family ships. */
			if (flagNames(component).has(p.name) && !flags.includes(p.name)) continue;
			rows.push({ ...p, component });
		}
	}
	return rows;
}

/**
 * Every class the kit knows about, in any family. A class in an example that is
 * in here but not in the active family is a demo that family cannot honour; a
 * class that is in neither is the app's own markup and none of our business.
 */
export const knownClasses = new Set(
	Object.values(classesByFamily).flatMap((m) => Object.keys(m))
);

/** The wrappers that own this page's classes, in the active family. */
export function componentsOf(id: string, family: string): string[] {
	const doc = pages[id]?.doc;
	if (!doc) return [];
	const shipped = classesFor(family);
	const names = new Set<string>();
	for (const [cls, info] of Object.entries(shipped)) {
		if (!info.component) continue;
		if (doc.namespaces.some((ns) => cls === ns || cls.startsWith(ns + '-'))) names.add(info.component);
	}
	return [...names].sort();
}

/**
 * Whether a Svelte wrapper owns any of this page's classes.
 *
 * Not "does it have props": `Label` has none of its own beyond `class` and
 * `children`, and it is still a component. The answer comes from the
 * classification — a class whose owner is named has a wrapper, one with no
 * owner (`text`, `link`, `validator`) has none.
 */
export function hasWrapper(id: string, family: string): boolean {
	return componentsOf(id, family).length > 0;
}

/**
 * What a family must honour on this page beyond its classes, read from what
 * is generated (gen-components.mjs): the states the families draw on each
 * class (`:checked`, `[aria-selected=true]`), and the custom properties each
 * wrapper writes on its elements. Family-independent: it is the contract, not
 * one family's take on it. Shown in the DOM tab, printed in the family kit.
 */
export function contractOf(id: string): {
	states: { cls: string; states: string[] }[];
	hooks: { component: string; hooks: string[] }[];
} {
	const doc = pages[id]?.doc;
	if (!doc) return { states: [], hooks: [] };
	const mine = (cls: string) => doc.namespaces.some((ns) => cls === ns || cls.startsWith(ns + '-'));
	const states = Object.entries(statesByClass)
		.filter(([cls]) => mine(cls))
		.map(([cls, list]) => ({ cls, states: list }));
	const hooks = Object.entries(schema)
		.filter(([, s]) => doc.namespaces.includes(s.prefix))
		.map(([component, s]) => ({ component, hooks: s.hooks }));
	return { states, hooks };
}
