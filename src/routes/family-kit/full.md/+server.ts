import { fullKit } from '../kit.server.js';

/* The whole kit in one file, for an assistant that takes an upload. */
export const prerender = true;

export function GET() {
	return new Response(fullKit(), { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
}
