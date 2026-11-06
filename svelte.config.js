import process from 'node:process';
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		// GitHub Pages serves 404.html for anything unknown.
		adapter: adapter({ fallback: '404.html' }),
		// Served from a sub-path on GitHub Pages: the workflow sets BASE_PATH.
		paths: { base: process.argv.includes('dev') ? '' : (process.env.BASE_PATH ?? '') },
		// The doc examples link to made-up anchors (`#demo`), on purpose.
		prerender: { handleMissingId: 'warn' },
		// Content Security Policy, written by SvelteKit as a <meta> on every
		// prerendered page (GitHub Pages sets no headers): its own scripts are
		// allowed by hash, any other script — inline, injected, an `onerror=`
		// attribute — is refused. The site loads nothing from elsewhere, so
		// neither may a family loaded from disk: no remote font, image or
		// stylesheet, nothing it could report to. Styles stay inline-able
		// (Svelte transitions, the theme <style>) and `blob:` (a loaded family
		// is served to the page as a blob URL).
		csp: {
			mode: 'hash',
			directives: {
				'default-src': ['self'],
				'script-src': ['self'],
				'style-src': ['self', 'unsafe-inline', 'blob:'],
				'img-src': ['self', 'data:', 'blob:'],
				'font-src': ['self', 'data:'],
				'connect-src': ['self'],
				'object-src': ['none'],
				'base-uri': ['self'],
				'form-action': ['self']
			}
		}
	}
};

export default config;
