// @ts-nocheck — a Node module run by Vite's config (no @types/node here); the plugin's
// behaviour is checked against a real build of the components (ADR 0017).
/**
 * The class prefix of ADR 0007, as a Vite plugin (ADR 0017).
 *
 *   // vite.config.ts
 *   import { sepale } from '@sepale/components/vite';
 *
 *   export default {
 *     plugins: [sepale({ prefix: 'sp', family: '@sepale/style/peony.css' }), sveltekit()]
 *   };
 *
 * The prefix is the app's to choose, so it cannot be published: the plugin applies it while the app
 * builds, to the two things that carry classes —
 *
 *   - the family stylesheet(s), renamed token by token (`prefixCss`): `.btn` -> `.sp-btn`;
 *   - the components of this package, renamed through their syntax tree (`prefixComponent`),
 *     only the words the stylesheet ships.
 *
 * Both are renamed from the same set of classes, so they cannot disagree. Without a `prefix`
 * the plugin does nothing: the kit is the unprefixed one.
 *
 * It needs no dependency of its own — a plugin is a plain object — and reads the stylesheet with
 * Node's resolution, so `family` is a package path (`@sepale/style/peony.css`,
 * `@bm/orchid/orchid.css`) or a path relative to the project.
 */

import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { classesIn, prefixComponent, prefixCss } from './prefix.js';

/** The package's build as it sits in node_modules, whatever the package manager (npm, pnpm's `.pnpm`). */
const COMPONENTS = /\/@sepale\/components\/dist\//;
/** The line of its helper module that carries the prefix (variants.ts, CLASS_PREFIX). */
const MARKER = /export const CLASS_PREFIX = ''/;

/**
 * @typedef {Object} SepaleOptions
 * @property {string} [prefix] Lowercase letters and digits, no dash: `sp` writes `sp-btn`. Omitted, nothing is renamed.
 * @property {string | string[]} [family] The family stylesheet(s) the app imports: a package path
 *   (`@sepale/style/peony.css`) or a path relative to the project. Required with a prefix: the classes
 *   to rename are the ones it ships. Themes carry no class and need not be listed.
 * @property {RegExp} [components] Where the package's build is, tested on a file's `/`-separated path: its
 *   `.svelte` are renamed and its `variants.js` told the prefix. Default: `@sepale/components/dist` in node_modules.
 */

/**
 * @typedef {Object} SepalePlugin
 * @property {string} name
 * @property {'pre'} [enforce]
 * @property {() => { optimizeDeps: { exclude: string[] }, ssr: { noExternal: string[] } }} [config]
 * @property {(config: { root: string }) => void} [configResolved]
 * @property {(id: string) => void} [watchChange]
 * @property {(code: string, id: string) => { code: string, map: null } | undefined} [transform]
 */

/** A path as Vite names it in a module id: real, and with `/`. */
const key = (file) => realpathSync(file).replaceAll('\\', '/');

/**
 * @param {SepaleOptions} [options]
 * @returns {SepalePlugin}
 */
export function sepale(options = {}) {
	const { prefix, family, components = COMPONENTS } = options;

	if (prefix === undefined || prefix === '') return { name: 'sepale:prefix' };
	if (!/^[a-z][a-z0-9]*$/.test(prefix)) {
		throw new Error(`sepale: prefix "${prefix}" is not lowercase letters and digits, starting with a letter (\`sp\` writes \`sp-btn\`)`);
	}
	const families = [family].flat().filter(Boolean);
	if (!families.length) {
		throw new Error('sepale: a prefix needs `family`, the stylesheet whose classes it renames (e.g. family: "@sepale/style/peony.css")');
	}

	let root = process.cwd();
	/** Each stylesheet, by its real path, with the classes it ships. */
	let sheets = new Map();
	/** Every class of every family: what a component may use. */
	let classes = new Set();

	function load() {
		sheets = new Map();
		classes = new Set();
		const require = createRequire(resolve(root, 'noop.js'));
		for (const spec of families) {
			const relative = resolve(root, spec);
			const file = /^\.{0,2}[\\/]/.test(spec) || existsSync(relative) ? relative : require.resolve(spec);
			const set = classesIn(readFileSync(file, 'utf8'));
			sheets.set(key(file), set);
			for (const cls of set) classes.add(cls);
		}
	}

	return {
		name: 'sepale:prefix',
		// Before Vite reads CSS and before vite-plugin-svelte compiles: both must see the renamed classes.
		enforce: 'pre',

		config() {
			return {
				// Prebundled by esbuild, the components would skip the rename
				optimizeDeps: { exclude: ['@sepale/components'] },
				ssr: { noExternal: ['@sepale/components'] }
			};
		},

		configResolved(config) {
			root = config.root;
			load();
		},

		// A family rebuilt while the dev server runs (orchid's `build.mjs --watch`): its classes are read again.
		watchChange(id) {
			if (sheets.has(id.replaceAll('\\', '/'))) load();
		},

		transform(code, id) {
			const file = id.split('?')[0].replaceAll('\\', '/');
			// No source map: a rename moves columns on a line, never lines.
			if (sheets.has(file)) return { code: prefixCss(code, prefix), map: null };
			if (file.endsWith('.svelte') && components.test(file)) {
				return { code: prefixComponent(code, prefix, classes).code, map: null };
			}
			// The one thing a component's rename cannot reach: a custom property is named after the
			// un-prefixed class (`--btn-bg`), so the helper that writes it must know the prefix to strip.
			if (file.endsWith('/variants.js') && components.test(file)) {
				if (!MARKER.test(code)) {
					throw new Error('sepale: this @sepale/components has no CLASS_PREFIX (needs 0.1.1 or later): update it to use a prefix');
				}
				return { code: code.replace(MARKER, `export const CLASS_PREFIX = ${JSON.stringify(prefix)}`), map: null };
			}
		}
	};
}
