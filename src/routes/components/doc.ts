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
 *   $lib/generated/    DERIVED — which classes the kit ships, and how its
 *   classes.ts         component classifies each one. Written by
 *                      scripts/gen-classes.mjs, which fails the build when
 *                      the stylesheet ships a class no component accounts
 *                      for — so a page cannot describe what is not there,
 *                      and nothing is there that no page can describe.
 *
 * A class with no prose still gets a row, with a sentence derived from its
 * classification. Nobody has to write 180 sentences for the page to work.
 */

import type { Component } from 'svelte';
import { classes, axes as axesOf } from '$lib/generated/classes.js';

export { classes };

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

/** Every class the kit ships in this page's namespaces, classified. */
export function classRows(id: string): ClassRow[] {
	const doc = pages[id]?.doc;
	if (!doc) return [];
	const mine = (cls: string) =>
		doc.namespaces.some((ns) => cls === ns || cls.startsWith(ns + '-'));

	return Object.entries(classes)
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
 * Every prop a component takes. With one stylesheet there is nothing left to
 * filter these against: an axis the kit ships is an axis the component offers,
 * which is the whole of what the per-family narrowing used to compute.
 */
export function propRows(id: string): PropRow[] {
	const doc = pages[id]?.doc;
	if (!doc) return [];
	const rows: PropRow[] = [];

	/* Driven by the components that own the classes, NOT by the hand-written
	   prose: `Loading` is all axes and no prose, and it still has props. */
	for (const component of componentsOf(id)) {
		const props = doc.props?.[component] ?? [];
		const componentAxes = axesOf[component] ?? {};

		/* An axis first: it is the prop whose type is a list of class names. */
		for (const [axis, values] of Object.entries(componentAxes)) {
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

		for (const p of props) rows.push({ ...p, component });
	}
	return rows;
}

/**
 * Every class the kit knows about. A class in an example that is not in here
 * is the app's own markup and none of our business.
 */
export const knownClasses = new Set(Object.keys(classes));

/** The wrappers that own this page's classes. */
export function componentsOf(id: string): string[] {
	const doc = pages[id]?.doc;
	if (!doc) return [];
	const names = new Set<string>();
	for (const [cls, info] of Object.entries(classes)) {
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
export function hasWrapper(id: string): boolean {
	return componentsOf(id).length > 0;
}
