import { COMPONENTS } from '../../playground.svelte.js';

/** Every component page is known at build time, so the route can prerender. */
export function entries() {
	return COMPONENTS.flatMap((g) => g.items).map((i) => ({ id: i.id }));
}

export function load({ params }: { params: { id: string } }) {
	return { id: params.id };
}
