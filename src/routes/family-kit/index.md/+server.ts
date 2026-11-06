import { guidePage } from '../kit.server.js';

/* The family kit's entry point (kit.server.ts). Prerendered to a static file. */
export const prerender = true;

export function GET() {
	return new Response(guidePage(), { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
}
