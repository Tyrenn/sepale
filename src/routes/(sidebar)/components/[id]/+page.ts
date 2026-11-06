import { ids } from '../doc.js';
import type { Specimen } from '../dom.js';

/**
 * Every component page is known at build time, so the route can prerender.
 * The list comes from the doc files themselves (src/routes/(sidebar)/components/docs/),
 * so adding a page is adding a file — there is no second list to update.
 */
export function entries() {
	return ids.map((id) => ({ id }));
}

export function load({ params, data }: { params: { id: string }; data: { specimens: Specimen[] } }) {
	return { id: params.id, specimens: data.specimens };
}
