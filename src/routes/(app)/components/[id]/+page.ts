import { ids } from '../doc.js';

/**
 * Every component page is known at build time, so the route can prerender.
 * The list comes from the doc files themselves (src/routes/(app)/components/docs/),
 * so adding a page is adding a file — there is no second list to update.
 */
export function entries() {
	return ids.map((id) => ({ id }));
}

export function load({ params }: { params: { id: string } }) {
	return { id: params.id };
}
