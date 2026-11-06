import { error } from '@sveltejs/kit';
import { referenceFiles } from '../../kit.server.js';

/* The built families' SCSS, served as text for an assistant to read: the
   mechanism of each component, as five families wrote it. */
export const prerender = true;

export function entries() {
	return Object.keys(referenceFiles).map((path) => ({ path }));
}

export function GET({ params }: { params: { path: string } }) {
	const src = referenceFiles[params.path];
	if (src === undefined) error(404, `No reference file "${params.path}"`);
	return new Response(src, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
