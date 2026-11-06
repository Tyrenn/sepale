/**
 * Every component page's examples, rendered on the server and read back as
 * DOM trees (dom.ts).
 *
 * Nothing is written by hand for this: the examples ARE the specimens. Each
 * `<Section>` of a page, rendered with the SPECIMEN context, draws its preview
 * alone in a `<div data-specimen="title">`, and the tree inside it is what the
 * components produce. Read by the DOM tab (`[id]/+page.server.ts`) and the
 * family kit (`/family-kit/…`), at prerender time — the deployed site serves
 * the result as static files.
 *
 * Server-rendered, so what an effect adds after mounting (a ripple's wave, a
 * tooltip positioned on hover) is not in it. Those parts are still listed by
 * the component's classes; the tree is the structure the markup starts with.
 */

import { render } from 'svelte/server';
import { pages } from './doc.js';
import { parseHtml, simplify, isElement, SPECIMEN, type DomNode, type Specimen } from './dom.js';

const cache = new Map<string, Specimen[]>();

/** The `data-specimen` divs of a rendered page, wherever they sit. */
function collect(nodes: DomNode[], into: Specimen[]) {
	for (const n of nodes) {
		if (!isElement(n)) continue;
		const title = n.attrs.find(([k]) => k === 'data-specimen');
		if (title) {
			into.push({ title: title[1] ?? '', nodes: simplify(n.children) });
			continue;
		}
		collect(n.children, into);
	}
}

export function specimensOf(id: string): Specimen[] {
	const hit = cache.get(id);
	if (hit) return hit;
	const entry = pages[id];
	const out: Specimen[] = [];
	if (entry) {
		try {
			const { body } = render(entry.examples, { context: new Map([[SPECIMEN, true]]) });
			collect(parseHtml(body), out);
		} catch (e) {
			/* A page whose examples need the browser has no specimen; the tab
			   says so rather than failing the prerender. */
			console.warn(`specimens: ${id}: ${e instanceof Error ? e.message : e}`);
		}
	}
	const kept = out.filter((s) => s.nodes.length);
	cache.set(id, kept);
	return kept;
}
