/**
 * What a loaded family covers, and what is wrong with it.
 *
 * The same questions the build asks of a family it compiles, asked in the
 * browser of one it never saw: does the stylesheet declare its parameters,
 * name itself, style each component page, and ship only classes some
 * component accounts for? The last is the one the build FAILS on
 * (gen-components.mjs): a class under a component's namespace that is no
 * axis, flag or part of it is a typo or an invention.
 */

import { pages } from '../components/doc.js';
import { COMPONENTS } from '../../playground.svelte.js';
import type { LocalFamily } from '../../local-families.svelte.js';

export interface PageCoverage {
	id: string;
	label: string;
	group: string;
	/** Classes of this page the family ships. */
	shipped: number;
	/** Classes of this page the built families ship, at most: the yardstick. */
	known: number;
}

export interface Report {
	styled: PageCoverage[];
	missing: PageCoverage[];
	/** Under a component's namespace, but no axis, flag or part of it: blocking. */
	unclassified: { cls: string; component: string }[];
	/** Under no namespace any page documents: probably a stray. */
	strays: string[];
}

export function reportFor(family: LocalFamily, known: Set<string>): Report {
	const classes = family.classification.classes;
	const names = Object.keys(classes);
	const documented = Object.values(pages).flatMap((p) => p.doc.namespaces);
	const inNs = (ns: string[], cls: string) => ns.some((n) => cls === n || cls.startsWith(n + '-'));

	const styled: PageCoverage[] = [];
	const missing: PageCoverage[] = [];
	for (const group of COMPONENTS) {
		for (const item of group.items) {
			const ns = pages[item.id]?.doc.namespaces ?? [];
			if (!ns.length) continue; /* draws nothing: nothing to style */
			const row: PageCoverage = {
				id: item.id,
				label: item.label,
				group: group.group,
				shipped: names.filter((c) => inNs(ns, c)).length,
				known: [...known].filter((c) => inNs(ns, c)).length
			};
			(row.shipped ? styled : missing).push(row);
		}
	}

	const unclassified = Object.entries(classes)
		.filter(([, info]) => info.kind === 'unclassified' && info.component)
		.map(([cls, info]) => ({ cls, component: info.component! }));
	const strays = Object.entries(classes)
		.filter(([cls, info]) => info.kind === 'unclassified' && !info.component && !inNs(documented, cls))
		.map(([cls]) => cls);

	return { styled, missing, unclassified, strays };
}
