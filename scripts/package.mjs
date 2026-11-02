/**
 * package.mjs — finish the two npm packages (ADR 0014). Runs after svelte-package,
 * which has written the components into packages/components/dist.
 *
 *   static/families/<family>.css         -> packages/style/dist/<family>.css
 *   static/themes/<family>/<theme>.css   -> packages/style/dist/<family>/themes/<theme>.css
 *   static/reset.css                     -> packages/style/dist/reset.css
 *
 * All reached through one `./*.css` export: `@sepale/style/daisy.css`,
 * `@sepale/style/daisy/themes/light.css`.
 *
 * The packages are versioned together, from the root package.json: the types of
 * `@sepale/components/<family>` are read from the CSS of the same build.
 */

import { readdirSync, readFileSync, writeFileSync, cpSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const style = join(root, 'packages/style');
const components = join(root, 'packages/components');
const dist = join(style, 'dist');
const families = join(root, 'static/families');
const themes = join(root, 'static/themes');

if (!existsSync(join(components, 'dist'))) throw new Error('package: run svelte-package first (no packages/components/dist)');

rmSync(dist, { recursive: true, force: true });
let n = 0;
for (const file of readdirSync(families).filter((f) => f.endsWith('.css'))) {
	const family = file.replace(/\.css$/, '');
	cpSync(join(families, file), join(dist, file));
	const dir = join(themes, family);
	if (existsSync(dir)) cpSync(dir, join(dist, family, 'themes'), { recursive: true });
	n++;
}
cpSync(join(root, 'static/reset.css'), join(dist, 'reset.css'));

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
