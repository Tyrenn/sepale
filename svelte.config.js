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
		prerender: { handleMissingId: 'warn' }
	}
};

export default config;
