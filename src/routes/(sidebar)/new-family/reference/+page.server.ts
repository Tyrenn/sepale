import { kitPages, referenceOf, type Reference } from '../../../family-kit/kit.server.js';

/* The same data as the family kit (kit.server.ts), for reading by a person:
   every component, its classes, states, custom properties, motion and DOM.
   Prerendered into the page's __data.json. */
export function load() {
	return {
		references: kitPages.map((p) => referenceOf(p.id)).filter((r): r is Reference => r !== null)
	};
}
