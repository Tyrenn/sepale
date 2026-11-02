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
import { classesByFamily, axesByFamily, flagsByFamily } from '$lib/generated/components.js';

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
	name: string;
	effect: string;
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
	const shipped = classesByFamily[family] ?? {};
	const mine = (cls: string) =>
		doc.namespaces.some((ns) => cls === ns || cls.startsWith(ns + '-'));

	return Object.entries(shipped)
		.filter(([cls]) => mine(cls))
		.map(([name, info]) => {
			const written = doc.classes?.[name];
			let effect = written ?? '';
			let type: string = info.kind;
			if (info.kind === 'root') {
				effect ||= doc.description;
				type = 'root';
			} else if (info.kind === 'axis') {
				effect ||= `Sets ${info.axis} to “${info.value}”.`;
				type = `axis ${info.axis}`;
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
			return { name, effect, type, rank: RANK[info.kind] };
		})
		.sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name));
}

/** One row of the Svelte table. */
export interface PropRow extends PropDoc {
	/** Which component it belongs to — a page may document more than one. */
	component: string;
}

/**
 * Which of a component's boolean props are FLAGS — that is, props that write a
 * class. Read as the union over every family, because a family that does not
 * ship one is exactly the case we are trying to catch.
 */
const flagNames = (() => {
	const cache = new Map<string, Set<string>>();
	return (component: string) => {
		let set = cache.get(component);
		if (!set) {
			set = new Set(Object.values(flagsByFamily).flatMap((m) => m[component] ?? []));
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
		const axes = axesByFamily[family]?.[component] ?? {};
		const flags = flagsByFamily[family]?.[component] ?? [];

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
	const shipped = classesByFamily[family] ?? {};
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
