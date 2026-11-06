import { error } from '@sveltejs/kit';
import { componentPage, kitPages } from '../kit.server.js';

/* One component of the family kit (kit.server.ts). */
export const prerender = true;

export function entries() {
	return kitPages.map((p) => ({ id: p.id }));
}

export function GET({ params }: { params: { id: string } }) {
	const body = componentPage(params.id);
	if (body === null) error(404, `No component page "${params.id}"`);
	return new Response(body, { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
}
