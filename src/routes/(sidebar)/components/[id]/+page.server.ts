import { specimensOf } from '../specimens.server.js';

/* The DOM tab's trees, rendered once at prerender time (specimens.server.ts). */
export function load({ params }: { params: { id: string } }) {
	return { specimens: specimensOf(params.id) };
}
