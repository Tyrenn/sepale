/**
 * package.mjs — finish the two npm packages (ADR 0014). Runs after svelte-package,
 * which has written the components into packages/components/dist.
 *
 *   static/families/<family>.css         -> packages/style/dist/<family>.css
 *   static/families/<family>.css.d.ts    -> packages/style/dist/<family>.css.d.ts
 *   static/themes/<family>/<theme>.css   -> packages/style/dist/<family>/themes/<theme>.css
 *   static/reset.css                     -> packages/style/dist/reset.css
 *
 * All reached through one `./*.css` export: `@sepale/style/daisy.css`,
 * `@sepale/style/daisy/themes/light.css`. Its `types` condition points at
 * `<path>.css.d.ts`: a family's registers it (ADR 0015), a theme's and the
 * reset's are empty, so a project under `noUncheckedSideEffectImports` finds a
 * declaration for every import.
 *
 * It REFUSES to run while a private family's stylesheet is in static/
 * (private.mjs): `package` builds with `build:css:public`, which leaves them out.
 *
 * The packages are versioned together, from the root package.json: the types of
 * `@sepale/components/<family>` are read from the CSS of the same build.
 */

import { readdirSync, readFileSync, writeFileSync, cpSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { privateFamilies } from './private.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const style = join(root, 'packages/style');
const components = join(root, 'packages/components');
const dist = join(style, 'dist');
const families = join(root, 'static/families');
const themes = join(root, 'static/themes');

if (!existsSync(join(components, 'dist'))) throw new Error('package: run svelte-package first (no packages/components/dist)');

const leaked = privateFamilies(join(root, 'src/scss/families')).filter(
	(name) => existsSync(join(families, `${name}.css`)) || existsSync(join(themes, name))
);
if (leaked.length) {
	throw new Error(`package: private famil${leaked.length > 1 ? 'ies' : 'y'} ${leaked.join(', ')} in static/ — build with \`build:css:public\``);
}

/** An empty declaration beside a stylesheet that registers nothing. */
const EMPTY_TYPES = '// A stylesheet with no types of its own: it registers no family.\nexport {};\n';

rmSync(dist, { recursive: true, force: true });
let n = 0;
for (const file of readdirSync(families).filter((f) => f.endsWith('.css'))) {
	const family = file.replace(/\.css$/, '');
	cpSync(join(families, file), join(dist, file));
	const types = join(families, `${file}.d.ts`);
	if (!existsSync(types)) throw new Error(`package: ${file} has no types — run gen:components`);
	cpSync(types, join(dist, `${file}.d.ts`));
	const dir = join(themes, family);
	if (existsSync(dir)) {
		cpSync(dir, join(dist, family, 'themes'), { recursive: true });
		for (const theme of readdirSync(dir).filter((f) => f.endsWith('.css'))) {
			writeFileSync(join(dist, family, 'themes', `${theme}.d.ts`), EMPTY_TYPES);
		}
	}
	n++;
}
cpSync(join(root, 'static/reset.css'), join(dist, 'reset.css'));
writeFileSync(join(dist, 'reset.css.d.ts'), EMPTY_TYPES);

const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
for (const pkg of [style, components]) {
	const file = join(pkg, 'package.json');
	const manifest = JSON.parse(readFileSync(file, 'utf8'));
	manifest.version = version;
	if (manifest.peerDependencies?.['@sepale/style']) manifest.peerDependencies['@sepale/style'] = `^${version}`;
	writeFileSync(file, JSON.stringify(manifest, null, '\t') + '\n');
	cpSync(join(root, 'LICENSE'), join(pkg, 'LICENSE'));
}

console.log(`package: ${n} families + their themes -> packages/style/dist, both packages at ${version}`);
