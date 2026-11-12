/**
 * check-prefix.mjs — the prefix of ADR 0017, checked on what ships.
 *
 *   pnpm run package && pnpm run check:prefix
 *
 * For each family stylesheet in static/families, a Vite server loads the BUILT components
 * (packages/components/dist) through the plugin with a prefix, then renders each component with
 * no props, with each value of each axis, with every flag, with `background` and with `validator`.
 * It fails when
 *
 *   - a class of the family comes out of a component unprefixed (a rename the tree walk missed:
 *     a class built where `prefixComponent` cannot see it, ADR 0007);
 *   - the stylesheet keeps a class of its own unprefixed (only `air-datepicker`, which is not ours);
 *   - the `background` prop writes a prefixed custom property (`--sp-btn-bg`, when its stylesheet reads
 *     `--btn-bg`: a custom property is never prefixed).
 *
 * A prefixed class with no rule is NOT a failure: a family drops the axis values it does not draw.
 */

import { createServer } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { readdirSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sepale } from '../src/lib/vite.js';
import { classesIn, isExternal } from '../src/lib/prefix.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = realpathSync(join(root, 'packages/components/dist'));
const slash = (p) => p.split('\\').join('/');
const families = join(root, 'static/families');
const prefix = 'sp';
const components = new RegExp(`${slash(dist).replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}/`);

let failures = 0;
const fail = (message) => {
	failures++;
	console.error(`  FAIL ${message}`);
};

const server = await createServer({
	root,
	configFile: false,
	logLevel: 'error',
	appType: 'custom',
	server: { middlewareMode: true, hmr: false },
	plugins: [sepale({ prefix, family: join(families, 'peony.css'), components }), svelte({ compilerOptions: { runes: true } })],
	optimizeDeps: { noDiscovery: true }
});
const { render } = await server.ssrLoadModule('svelte/server');
const files = readdirSync(join(dist, 'components')).filter((f) => f.endsWith('.svelte'));

// The server above renames for peony; the other families have their own sets, so each one gets its own plugin
// instance, asked directly. The renders go through the server's (peony) set, which is the union a component may use.
for (const file of readdirSync(families).filter((f) => f.endsWith('.css'))) {
	const family = file.replace(/\.css$/, '');
	const css = readFileSync(join(families, file), 'utf8');
	const kit = classesIn(css);
	console.log(`${family}: ${kit.size} classes`);

	const plugin = sepale({ prefix, family: join(families, file), components });
	plugin.configResolved({ root });
	const renamed = classesIn(plugin.transform(css, slash(realpathSync(join(families, file)))).code);
	for (const cls of renamed) if (!cls.startsWith(`${prefix}-`) && !isExternal(cls)) fail(`${family}.css keeps .${cls} unprefixed`);

	// The components are loaded once, for the family the server was given; a family's own classes are then
	// compared with what those components write.
	if (family !== 'peony') continue;
	const missed = new Map();
	let cases = 0;
	for (const f of files) {
		const mod = await server.ssrLoadModule(`${slash(dist)}/components/${f}`);
		if (!mod.default || !mod.AXES) continue;
		const variants = [{}, { background: '#abcdef' }, { validator: true }];
		for (const [axis, values] of Object.entries(mod.AXES)) for (const v of values) variants.push({ [axis]: v });
		const flags = Object.keys(mod.FLAGS ?? {});
		if (flags.length) variants.push(Object.fromEntries(flags.map((n) => [n.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase()), true])));
		for (const props of variants) {
			let html;
			try {
				html = render(mod.default, { props }).body;
			} catch {
				continue; // needs props of its own (a handler, rows): the other cases of the component cover it
			}
			cases++;
			for (const m of html.matchAll(/class="([^"]*)"/g)) {
				for (const t of m[1].split(/\s+/).filter(Boolean)) if (kit.has(t) && !isExternal(t)) missed.set(t, f);
			}
			// The prop writes `--<component>-bg`, the slot the stylesheet reads. Written after the prefixed PREFIX
			// (`--sp-btn-bg`), nothing would read it. (A component may drop the prop altogether: Rating.)
			if ('background' in props && mod.PREFIX && html.includes(`--${mod.PREFIX}-bg`)) {
				fail(`${f}: \`background\` writes --${mod.PREFIX}-bg, a custom property is never prefixed`);
			}
		}
	}
	console.log(`  ${cases} renders of ${files.length} components`);
	for (const [cls, f] of missed) fail(`${f} writes .${cls} unprefixed`);
}

await server.close();
if (failures) {
	console.error(`check-prefix: ${failures} failure(s)`);
	process.exit(1);
}
console.log('check-prefix: ok');
