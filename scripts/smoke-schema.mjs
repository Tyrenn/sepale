/**
 * smoke-schema.mjs — does the generator's machinery actually RUN?
 *
 * `tsc` proves the shapes line up. It cannot prove that turning a group on
 * changes anything, which is the failure mode this design is most prone to:
 * a control moves, a variable is written, and the one the CSS reads is not
 * that one. Three bugs found here that typechecking could not see:
 *
 *   - picking Solid after None read the width back as the `0` that None
 *     wrote, so the border stayed invisible;
 *   - turning Hand-drawn on read the strength back as the `0` that Off
 *     wrote, so nothing wobbled;
 *   - moving the edge tiles left the width shorthand untouched, so the
 *     border kept all four sides.
 *
 * Run it after every section:  node scripts/smoke-schema.mjs
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const out = mkdtempSync(join(tmpdir(), 'uu-smoke-'));
execFileSync(process.execPath, [
	require.resolve('typescript/lib/tsc.js'),
	'--ignoreConfig', '--outDir', out, '--module', 'esnext', '--target', 'es2022',
	'--moduleResolution', 'bundler', '--skipLibCheck',
	join(root, 'src/lib/theme/schema.ts'),
	join(root, 'src/lib/theme/sections/shared.ts'),
	join(root, 'src/lib/theme/sections/action.ts')
], { stdio: 'inherit' });

const schema = await import(pathToFileURL(join(out, 'schema.js')));
const { action } = await import(pathToFileURL(join(out, 'sections/action.js')));

const neutral = schema.neutralVars([action]);
console.log('neutral vars:', Object.keys(neutral).length);

/* A theme: a dark hand-drawn look with a hard shadow and a push. */
let vars = { ...neutral };
const set = (id, v, group) => {
	const c = [];
	schema.eachControl([group ?? action.controls.find((e) => 'controls' in e && e.controls.some((x) => x.id === id))].filter(Boolean), (x) => c.push(x));
	const ctl = c.find((x) => x.id === id);
	Object.assign(vars, schema.writeValue(ctl, v, vars, group));
};

const g = (id) => action.controls.find((e) => e.id === id);
/* The shadow is a list now, not a mode. */
const sc = g('action-shadow-group').controls.find((c) => c.type === 'shadows');
Object.assign(vars, schema.writeValue(sc, [
  { x: '2px', y: '2px', blur: '0px', spread: '0px', color: 'currentColor', inset: false }
], vars, g('action-shadow-group')));
Object.assign(vars, schema.writeMode(g('action-press'), 'push', vars));
Object.assign(vars, schema.writeMode(g('action-handdrawn'), 'on', vars));
Object.assign(vars, schema.writeMode(g('action-border'), 'solid', vars));

console.log('shadow          :', vars['action-shadow']);
console.log('press y (=offset):', vars['action-press-y']);
/* The form writes the wobble, not the corner. The recipe it feeds lives in
   _defaults.scss: a theme writes scalars, colours and lengths, never a
   formula (CLAUDE.md). */
console.log('wobble          :', vars['action-wobble']);
console.log('corners written  :', 'action-corners' in vars ? 'YES — a theme should not carry a formula' : 'no, resolved in CSS');
console.log('border width    :', vars['action-border-width']);

/* Turn off two edges: one control, one variable, and the shorthand IS the
   record of both. */
const border = g('action-border');
const w = border.type.modes.find((m) => m.id === 'solid').controls.find((c) => c.type === 'edge-width');
Object.assign(vars, schema.writeValue(w, { width: '2px', sides: { top: true, right: false, bottom: true, left: false } }, vars, border));
console.log('border width after edges:', vars['action-border-width'], '  <- shorthand');
console.log('read back             :', JSON.stringify(schema.readValue(w, vars)));

/* Round trip. */
const css = schema.serialise(vars, neutral);
const back = schema.parse(css);
const bad = Object.keys(vars).filter((k) => vars[k] !== neutral[k] && back[k] !== vars[k]);
console.log('round trip:', bad.length ? 'LOST ' + bad.join(', ') : 'exact');
console.log('theme lines:', css.split('\n').length - 2);
rmSync(out, { recursive: true, force: true });
