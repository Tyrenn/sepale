/**
 * gen-classes.mjs — what the kit ships, classified.
 *
 * Replaces gen-components.mjs, whose whole job was narrowing each component to
 * one family's class list. There is one kit now (ADR 0010), so there is one
 * list and nothing to narrow: the hand-written component in src/lib/components
 * is what ships, and its AXES / FLAGS / PARTS block is the classification.
 *
 * What survives from the old script is the CHECK, which was the useful half:
 * the build fails if the stylesheet ships a `.prefix-*` class no component
 * accounts for. A class that is neither an axis value, nor a flag, nor a part
 * is either a variant nobody exposed or a part nobody renders, and both need a
 * human.
 *
 *   static/kit.css  ×  src/lib/components/*.svelte  →  src/lib/generated/classes.ts
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'src/lib/components');
const pagesDir = join(root, 'src/routes/components/docs');
const kitFile = join(root, 'static/kit.css');
const outFile = join(root, 'src/lib/generated/classes.ts');

/**
 * Classes we WRITE but do not OWN. They belong to somebody else's stylesheet
 * and we only ever name them to qualify our own selectors. Referencing a
 * namespace is not owning it (CONTEXT.md), but a class name scraped out of
 * compiled CSS cannot tell the two apart, so the list is written down.
 */
const EXTERNAL = new Set(['prose', 'filter']);

/** The namespaces the component pages claim, read straight out of their DOC. */
function documentedNamespaces() {
	if (!existsSync(pagesDir)) return [];
	const out = new Set();
	for (const file of readdirSync(pagesDir).filter((f) => f.endsWith('.svelte'))) {
		const m = readFileSync(join(pagesDir, file), 'utf8').match(/namespaces:\s*\[([^\]]*)\]/);
		if (!m) continue;
		for (const ns of m[1].matchAll(/['"]([^'"]+)['"]/g)) out.add(ns[1]);
	}
	return [...out];
}

/** Every class name in a stylesheet. Comments, strings and url() go first. */
function classesIn(css) {
	const clean = css
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/url\([^)]*\)/g, '')
		.replace(/"[^"\n]*"|'[^'\n]*'/g, '');
	return new Set([...clean.matchAll(/\.([a-z][a-z0-9]*(?:-[a-z0-9]+)*)/g)].map((m) => m[1]));
}

/** Read an `export const NAME = <literal> as const;` out of a component. */
function readConst(src, name) {
	const at = src.indexOf(`export const ${name} =`);
	if (at < 0) return null;
	const start = src.indexOf('=', at) + 1;
	const open = src.slice(start).search(/[[{'"]/);
	const from = start + open;
	const quote = src[from];
	if (quote === "'" || quote === '"') {
		const end = src.indexOf(quote, from + 1);
		return { value: src.slice(from + 1, end) };
	}
	const close = quote === '[' ? ']' : '}';
	let depth = 0;
	for (let i = from; i < src.length; i++) {
		if (src[i] === quote) depth++;
		else if (src[i] === close && --depth === 0) {
			return { value: new Function(`return ${src.slice(from, i + 1)}`)() };
		}
	}
	return null;
}

const components = readdirSync(srcDir)
	.filter((f) => f.endsWith('.svelte') && !f.startsWith('_'))
	.sort()
	.map((file) => ({ file, src: readFileSync(join(srcDir, file), 'utf8') }))
	.filter((c) => c.src.includes('export const AXES'))
	.map((c) => {
		const axes = readConst(c.src, 'AXES').value;
		const flags = readConst(c.src, 'FLAGS')?.value ?? [];
		const parts = readConst(c.src, 'PARTS')?.value ?? [];
		const declared = new Set([...flags, ...parts]);
		for (const axis of Object.values(axes)) {
			for (const suffix of Array.isArray(axis) ? axis : Object.values(axis)) declared.add(suffix);
		}
		return {
			name: c.file.replace(/\.svelte$/, ''),
			prefix: readConst(c.src, 'PREFIX').value,
			axes,
			flags,
			parts,
			declared
		};
	});

/* One namespace, one component (ADR 0009), so this map has one entry each. It
   stays keyed by prefix because the check reads a class name and has to find
   who answers for it. */
const declaredByPrefix = new Map();
for (const c of components) {
	const seen = declaredByPrefix.get(c.prefix) ?? new Set();
	for (const name of c.declared) seen.add(name);
	declaredByPrefix.set(c.prefix, seen);
}

/* Longest prefix wins, so `.textarea-lg` goes to textarea and not to text. */
const byPrefix = [...components].sort((a, b) => b.prefix.length - a.prefix.length);
const ownerOf = (cls) => byPrefix.find((c) => cls === c.prefix || cls.startsWith(`${c.prefix}-`));

const shipped = classesIn(readFileSync(kitFile, 'utf8'));
const documented = documentedNamespaces();
const isDocumented = (cls) => documented.some((ns) => cls === ns || cls.startsWith(ns + '-'));

const problems = [];
const undocumented = [];

for (const [prefix, declared] of declaredByPrefix) {
	for (const cls of shipped) {
		if (!cls.startsWith(`${prefix}-`)) continue;
		const suffix = cls.slice(prefix.length + 1);
		if (!declared.has(suffix)) {
			problems.push(`.${cls} is not an axis, a flag or a part of any ${prefix} component`);
		}
	}
}

/* Every class the kit ships, classified for the page that documents it. A
   class no component classifies is still listed — a component page says what
   a stylesheet contains, and a stylesheet may contain more than the Svelte
   layer wraps (`text`, `link` and `validator` have no wrapper at all). */
const classes = {};
const axes = {};
const flags = {};

for (const cls of [...shipped].sort()) {
	if (EXTERNAL.has(cls)) continue;
	const owner = ownerOf(cls);
	if (!owner) {
		classes[cls] = { kind: 'unclassified' };
		if (!isDocumented(cls)) undocumented.push(`.${cls}`);
		continue;
	}
	if (cls === owner.prefix) {
		classes[cls] = { kind: 'root', component: owner.name };
		continue;
	}
	const suffix = cls.slice(owner.prefix.length + 1);
	let info = null;
	for (const [axis, values] of Object.entries(owner.axes)) {
		const entries = Array.isArray(values) ? values.map((v) => [v, v]) : Object.entries(values);
		const hit = entries.find(([, sfx]) => sfx === suffix);
		if (hit) {
			info = { kind: 'axis', component: owner.name, axis, value: hit[0] };
			break;
		}
	}
	if (!info && owner.flags.includes(suffix)) info = { kind: 'flag', component: owner.name, prop: suffix };
	if (!info && owner.parts.includes(suffix)) info = { kind: 'part', component: owner.name };
	classes[cls] = info ?? { kind: 'unclassified', component: owner.name };
}

/* The prop side: every axis value and every flag the kit can paint. With one
   stylesheet these are simply what the components declare — there is nothing
   left to filter them against. */
for (const c of components) {
	const values = {};
	for (const [key, axis] of Object.entries(c.axes)) {
		const list = Array.isArray(axis) ? [...axis] : Object.keys(axis);
		if (list.length) values[key] = list;
	}
	if (Object.keys(values).length) axes[c.name] = values;
	if (c.flags.length) flags[c.name] = [...c.flags];
}

if (problems.length) {
	console.error(`classes: ${problems.length} unclassified\n`);
	for (const p of problems.sort()) console.error('  ' + p);
	process.exit(1);
}

if (undocumented.length) {
	console.warn(`classes: ${undocumented.length} shipped and documented nowhere`);
	for (const u of undocumented.sort()) console.warn('  ' + u);
}

const J = (v) => JSON.stringify(v, null, '\t');

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(
	outFile,
	`// AUTO-GENERATED by scripts/gen-classes.mjs — do not edit.
//
// What the kit ships, read back out of static/kit.css and classified by the
// components' own AXES / FLAGS / PARTS blocks. The component pages render
// this; the prose beside it is hand-written in src/routes/components/docs/.

/** How a component accounts for one of its classes. */
export interface ClassInfo {
	kind: 'root' | 'axis' | 'flag' | 'part' | 'unclassified';
	/** The wrapper that owns it, if there is one. */
	component?: string;
	/** kind 'axis': the axis it belongs to, and the prop value that writes it. */
	axis?: string;
	value?: string;
	/** kind 'flag': the boolean prop that writes it. */
	prop?: string;
}

/** class name → what that class is. */
export const classes: Record<string, ClassInfo> = ${J(classes)};

/** component → axis → the values it accepts. */
export const axes: Record<string, Record<string, string[]>> = ${J(axes)};

/** component → the boolean props it accepts. */
export const flags: Record<string, string[]> = ${J(flags)};
`
);

console.log(
	`classes: ${Object.keys(classes).length} classified, ${components.length} components -> src/lib/generated/classes.ts`
);
