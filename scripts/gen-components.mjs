/**
 * gen-components.mjs — classify every family's classes, and write the types
 * its stylesheet carries.
 *
 * Source of truth, as everywhere else in this repo, is the compiled CSS. A
 * component in src/lib/components/ declares what its classes ARE — which axis
 * each one belongs to — and this script says which of them a given family
 * actually ships:
 *
 *   src/lib/components/Button.svelte   hand-written, every axis at full width
 *        ×  static/families/daisy.css  the classes daisy really has
 *        =  static/families/daisy.css.d.ts
 *
 * The `.d.ts` registers daisy in `Sepale.Families`; importing daisy.css loads
 * it, and the components' props narrow to what daisy ships (variants.ts, ADR
 * 0015). Its text comes from src/lib/family-types.ts, the function the app also
 * runs on a family loaded from disk.
 *
 * The script FAILS if a family ships a class this component has not
 * classified: that class is either a variant nobody exposed or a part nobody
 * renders, and both need a human. Run after sass (see build:css).
 *
 * Output: static/families/<family>.css.d.ts, src/lib/generated/components.ts
 * and static/bundle/_generic.json (all git-ignored, regenerated on build).
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
/* Run as TypeScript by Node (type stripping): the same file the app imports. */
import { familyShape, familyTypes } from '../src/lib/family-types.ts';
/* Shared with the prefix rename (ADR 0007): what a class is, and which ones are not ours. */
import { classesIn, isExternal, EXTERNAL, EXTERNAL_PREFIXES } from './prefix.mjs';
/* The states a stylesheet draws on each class — part of the DOM contract. */
import { statesIn } from './states.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'src/lib/components');
const builtDir = join(root, 'static/families');
const docFile = join(root, 'src/lib/generated/components.ts');
const pagesDir = join(root, 'src/routes/(sidebar)/components/docs');


/** The class suffix one axis value writes — the same rules as variants.ts. */
const axisSuffix = (axis, value) =>
	value === 'none' ? `no${axis}` : /^\d+$/.test(value) ? `${axis}${value}` : value;

/** `image-full` → `imageFull`. */
const camel = (name) => name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

/* Vendored code the components import (`../vendor/<lib>/…`): it goes into the
   bundle with them. */
const vendorDir = join(root, 'src/lib/vendor');

/**
 * The namespaces the component pages claim, read straight out of their `DOC`.
 *
 * This is the build script reaching into the app, which it does nowhere else.
 * The alternative is worse: without it, the only thing this script can say is
 * "no COMPONENT classifies this class", which is true of every class on the
 * `text`, `link` and `validator` pages by design, and buries the handful that
 * genuinely nobody documents under four hundred that are perfectly fine.
 */
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

const NL = String.fromCharCode(10);
const TAB = String.fromCharCode(9);

/** Read a `export const NAME = <literal> as const;` out of a component. */
function readConst(src, name) {
	const at = src.indexOf(`export const ${name} =`);
	if (at < 0) return null;
	const start = src.indexOf('=', at) + 1;
	const open = src.slice(start).search(/[[{'"]/);
	const from = start + open;
	const quote = src[from];
	if (quote === "'" || quote === '"') {
		const end = src.indexOf(quote, from + 1);
		return { text: src.slice(from, end + 1), value: src.slice(from + 1, end), from, to: end + 1 };
	}
	const close = quote === '[' ? ']' : '}';
	let depth = 0;
	for (let i = from; i < src.length; i++) {
		if (src[i] === quote) depth++;
		else if (src[i] === close && --depth === 0) {
			const text = src.slice(from, i + 1);
			return { text, value: new Function(`return ${text}`)(), from, to: i + 1 };
		}
	}
	return null;
}

const families = readdirSync(builtDir)
	.filter((f) => f.endsWith('.css'))
	.map((f) => f.replace(/\.css$/, ''))
	.sort();

const components = readdirSync(srcDir)
	.filter((f) => f.endsWith('.svelte') && !f.startsWith('_'))
	.sort()
	.map((file) => ({ file, src: readFileSync(join(srcDir, file), 'utf8') }))
	.filter((c) => c.src.includes('export const AXES'))
	.map((c) => {
		const axes = readConst(c.src, 'AXES');
		const flags = readConst(c.src, 'FLAGS')?.value ?? {};
		if (Array.isArray(flags)) throw new Error(`${c.file}: FLAGS is a map of flag → doc now`);
		const declared = new Set([...Object.keys(flags), ...(readConst(c.src, 'PARTS')?.value ?? [])]);
		for (const [key, axis] of Object.entries(axes.value)) {
			if (!Array.isArray(axis)) throw new Error(`${c.file}: axis ${key} is a list of values now`);
			for (const v of axis) declared.add(axisSuffix(key, v));
		}
		return {
			...c,
			prefix: readConst(c.src, 'PREFIX').value,
			name: c.file.replace(/\.svelte$/, ''),
			flags,
			parts: readConst(c.src, 'PARTS')?.value ?? [],
			axes,
			declared
		};
	});

/* One namespace, one component (ADR 0009), so this map has one entry per
   component. It stays keyed by prefix because the check reads a class name and
   has to find who answers for it. */
const declaredByPrefix = new Map();
for (const c of components) {
	const seen = declaredByPrefix.get(c.prefix) ?? new Set();
	for (const name of c.declared) seen.add(name);
	declaredByPrefix.set(c.prefix, seen);
}

/* What a family's types need to know of each component. */
const decls = Object.fromEntries(components.map((c) => [c.name, { prefix: c.prefix, flags: Object.keys(c.flags) }]));

const problems = [];
let written = 0;

/* What the component pages read. Same pass as the types, on purpose: a page
   cannot describe a class the components do not offer for that family,
   because the two are decided here, once. */
const classesByFamily = {};
const axesByFamily = {};
const flagsByFamily = {};
/* class → the states drawn on it, in any family. */
const statesByClass = {};
const undocumented = [];
const documented = documentedNamespaces();
const isDocumented = (cls) =>
	documented.some((ns) => cls === ns || cls.startsWith(ns + '-'));

/* Longest prefix wins, so `.textarea-lg` goes to textarea and not to text. */
const byPrefix = [...components].sort((a, b) => b.prefix.length - a.prefix.length);
const ownerOf = (cls) =>
	byPrefix.find((c) => cls === c.prefix || cls.startsWith(`${c.prefix}-`));

for (const family of families) {
	const css = readFileSync(join(builtDir, `${family}.css`), 'utf8');
	const shipped = classesIn(css);
	for (const [cls, states] of statesIn(css)) {
		if (isExternal(cls)) continue;
		const seen = (statesByClass[cls] ??= new Set());
		for (const s of states) seen.add(s);
	}

	const famAxes = {};
	const famFlags = {};

	for (const { prefix, name, flags, axes } of components) {
		/* Which values this family accepts for each axis, and which flags it can
		   actually paint: the classes its stylesheet really has. An axis left
		   empty is dropped, and with it the prop. */
		const values = {};
		for (const [key, axis] of Object.entries(axes.value)) {
			const kept = axis.filter((v) => shipped.has(`${prefix}-${axisSuffix(key, v)}`));
			if (kept.length) values[key] = kept;
		}
		if (Object.keys(values).length) famAxes[name] = values;
		const live = Object.keys(flags).filter((f) => shipped.has(`${prefix}-${f}`));
		if (live.length) famFlags[name] = live.map(camel);
	}

	// What the family ships, against what the components say those classes are.
	for (const [prefix, declared] of declaredByPrefix) {
		for (const cls of shipped) {
			if (!cls.startsWith(`${prefix}-`)) continue;
			const suffix = cls.slice(prefix.length + 1);
			if (!declared.has(suffix)) {
				problems.push(`${family}: .${cls} is not an axis, a flag or a part of any ${prefix} component`);
			}
		}
	}

	/* Every class the family ships, classified for the page that documents it.
	   A class no component classifies is still listed — a component page says
	   what a stylesheet contains, and a stylesheet may contain more than the
	   Svelte layer wraps (`text`, `link`, `validator` have no wrapper at all). */
	const classes = {};
	for (const cls of [...shipped].sort()) {
		/* Somebody else's class, named only to qualify one of ours. */
		if (isExternal(cls)) continue;
		const owner = ownerOf(cls);
		if (!owner) {
			classes[cls] = { kind: 'unclassified' };
			/* No wrapper classifies it — which is the design for `text`, `link`
			   and `validator`. Only worth a word when no page claims it either. */
			if (!isDocumented(cls)) undocumented.push(`${family}: .${cls}`);
			continue;
		}
		if (cls === owner.prefix) {
			classes[cls] = { kind: 'root', component: owner.name };
			continue;
		}
		const suffix = cls.slice(owner.prefix.length + 1);
		let info = null;
		for (const [axis, values] of Object.entries(owner.axes.value)) {
			const value = values.find((v) => axisSuffix(axis, v) === suffix);
			if (value !== undefined) {
				info = { kind: 'axis', component: owner.name, axis, value };
				break;
			}
		}
		if (!info && suffix in owner.flags) info = { kind: 'flag', component: owner.name, prop: camel(suffix) };
		if (!info && owner.parts.includes(suffix)) info = { kind: 'part', component: owner.name };
		if (!info) {
			info = { kind: 'unclassified', component: owner.name };
			if (!isDocumented(cls)) undocumented.push(`${family}: .${cls}`);
		}
		classes[cls] = info;
	}

	/* The types its stylesheet carries (ADR 0015). Named `x.css.d.ts`: found
	   beside an imported `x.css` under `bundler` resolution (Vite, SvelteKit)
	   with no option, and mapped by the package's `types` condition otherwise.
	   NOT also `x.d.css.ts`: `bundler` tries that name first and then demands
	   `allowArbitraryExtensions`, so shipping both breaks the default setup. */
	writeFileSync(join(builtDir, `${family}.css.d.ts`), familyTypes(family, familyShape(classes, decls, css)));
	written++;

	classesByFamily[family] = classes;
	axesByFamily[family] = famAxes;
	flagsByFamily[family] = famFlags;
}

if (problems.length) {
	console.error('components: unclassified classes — each one needs a human:');
	for (const p of problems) console.error(`  ${p}`);
	process.exit(1);
}

/* Not an error, by decision: a class nobody documents is a gap in the site, not
   a reason to stop a build. The blocking case is the one above — a class whose
   namespace a component claims but which it classifies nowhere.
   Reported once per class rather than once per family: the same gap repeated
   seven times is one gap. */
if (undocumented.length) {
	const names = [...new Set(undocumented.map((u) => u.split(' .')[1]))].sort();
	console.warn(
		`components: ${names.length} class(es) no component classifies and no page documents:`
	);
	for (const n of names.slice(0, 12)) console.warn(`  .${n}`);
	if (names.length > 12) console.warn(`  … and ${names.length - 12} more`);
}

const json = (v) => JSON.stringify(v, null, '	');

/* The custom properties a wrapper writes on its elements: `style:--x`, and
   `--x:` inside an inline style string. They are inputs a family reads (the
   tab indicator's position, the range's fill), so they belong to the contract. */
const allCss = families.map((f) => readFileSync(join(builtDir, `${f}.css`), 'utf8')).join(NL);
const hooksOf = (src, prefix) => {
	const found = new Set();
	for (const m of src.matchAll(/style:--([a-z][\w-]*)/g)) found.add(`--${m[1]}`);
	for (const m of src.matchAll(/["'`;\s{]--([a-z][\w-]*)\s*:/g)) found.add(`--${m[1]}`);
	for (const m of src.matchAll(/setProperty\(\s*["'`]--([a-z][\w-]*)/g)) found.add(`--${m[1]}`);
	/* `background` writes the fill slot (variants.ts), where a family reads it. */
	if (allCss.includes(`var(--${prefix}-bg`)) found.add(`--${prefix}-bg`);
	return [...found].sort();
};
/**
 * How a wrapper moves, read from its source: the Svelte transitions it plays
 * in JavaScript (`transition:`, `in:`, `out:`, `animate:`), and the CSS events
 * it waits for (`animationend`, `transitionend`), each as one sentence. A
 * family needs both: the first it cannot restyle, the second it must provide.
 */
const motionOf = (src, prefix) => {
	const out = [];
	/* The element a directive sits on, by its class when it has one. */
	const target = (at) => {
		const open = src.lastIndexOf('<', at);
		const tag = src.slice(open, src.indexOf('>', at) + 1);
		const part = tag.match(/class=\{`\$\{PREFIX\}-([\w-]+)`\}/)?.[1];
		if (part) return `\`.${prefix}-${part}\``;
		if (/class=\{classes\}/.test(tag)) return `\`.${prefix}\``;
		return `a \`<${tag.match(/^<([\w-]+)/)?.[1] ?? 'element'}>\``;
	};
	for (const m of src.matchAll(/\b(transition|in|out|animate):(\w+)(?:=\{\{([^}]*)\}\})?/g)) {
		const params = (m[3] ?? '').replace(/\s+/g, ' ').trim();
		const kind = { transition: 'enters and leaves', in: 'enters', out: 'leaves', animate: 'moves between places' }[m[1]];
		out.push(
			`${target(m.index)} ${kind} with Svelte's \`${m[2]}\`${params ? ` (\`${params}\`)` : ''}, played in JavaScript by the component.`
		);
	}
	for (const m of src.matchAll(/onanimationend=/g)) {
		out.push(
			`${target(m.index)} is removed when its CSS animation ends (\`animationend\`): the family must animate it, or it stays in the DOM.`
		);
	}
	for (const m of src.matchAll(/['"]transitionend['"]/g)) {
		const fallback = /setTimeout\(/.test(src.slice(m.index, m.index + 200));
		out.push(
			`Waits for a CSS \`transitionend\`${fallback ? ' (with a fallback timeout)' : ''} before finishing a change of state: the family's transition sets the pace.`
		);
	}
	return out;
};

const schema = Object.fromEntries(
	components.map((c) => [
		c.name,
		{
			prefix: c.prefix,
			axes: c.axes.value,
			flags: Object.keys(c.flags),
			parts: [...c.parts],
			hooks: hooksOf(c.src, c.prefix),
			motion: motionOf(c.src, c.prefix)
		}
	])
);
writeFileSync(
	docFile,
	`// AUTO-GENERATED by scripts/gen-components.mjs — do not edit.
//
// What each family actually ships, read back out of its compiled CSS and
// classified by the components' own AXES / FLAGS / PARTS blocks. The component
// pages render this; the prose that goes beside it is hand-written in
// src/routes/(sidebar)/components/docs/.

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

/** family → class name → what that class is. */
export const classesByFamily: Record<string, Record<string, ClassInfo>> = ${json(classesByFamily)};

/** family → component → axis → the values this family accepts. */
export const axesByFamily: Record<string, Record<string, Record<string, string[]>>> = ${json(axesByFamily)};

/** family → component → the flags this family can actually paint. */
export const flagsByFamily: Record<string, Record<string, string[]>> = ${json(flagsByFamily)};

/** What one component declares, whatever family is loaded: its AXES, FLAGS
 *  and PARTS blocks, and the custom properties it writes on its elements. */
export interface ComponentSchema {
	prefix: string;
	axes: Record<string, string[]>;
	/** Flag class suffixes (\`image-full\`); the prop is their camelCase. */
	flags: string[];
	parts: string[];
	/** Custom properties the wrapper writes inline: the inputs a family reads. */
	hooks: string[];
	/** How it moves: Svelte transitions it plays, CSS events it waits for. */
	motion: string[];
}

/** component → its declared vocabulary. Lets the app classify a stylesheet it
 *  was never built with (a family loaded from disk), the way this script does. */
export const schema: Record<string, ComponentSchema> = ${json(schema)};

/** class → the states drawn on it (\`:checked\`, \`[aria-selected=true]\`), in any
 *  family. Part of the DOM contract: see scripts/states.mjs. */
/** Class names we write but do not own (scripts/prefix.mjs): never classified. */
export const EXTERNAL: string[] = ${JSON.stringify([...EXTERNAL])};
export const EXTERNAL_PREFIXES: string[] = ${JSON.stringify(EXTERNAL_PREFIXES)};

export const statesByClass: Record<string, string[]> = ${json(
		Object.fromEntries(
			Object.entries(statesByClass)
				.sort(([a], [b]) => a.localeCompare(b))
				.map(([cls, set]) => [cls, [...set].sort()])
		)
	)};
`
);

/* The app's bundle (ADR 0001) carries the generic components, laid out as in
   src/lib/ so their `../variants.js` and `../vendor/` imports still hold; the
   family's `.css.d.ts` beside its stylesheet narrows them (ADR 0015). The zip
   is assembled in the browser, which fetches this once. The leading underscore
   keeps the name out of any family's way. */
const bundleDir = join(root, 'static/bundle');
rmSync(bundleDir, { recursive: true, force: true });
mkdirSync(bundleDir, { recursive: true });
{
	const libDir = join(root, 'src/lib');
	const files = {};
	const add = (path) => (files[relative(libDir, path).replaceAll('\\', '/')] = readFileSync(path, 'utf8'));
	for (const f of readdirSync(srcDir)) if (!f.startsWith('_')) add(join(srcDir, f));
	add(join(libDir, 'variants.ts'));
	add(join(libDir, 'family-types.ts'));
	add(join(libDir, 'sepale-types.js'));
	for (const entry of readdirSync(vendorDir, { recursive: true, withFileTypes: true })) {
		if (entry.isFile()) add(join(entry.parentPath, entry.name));
	}
	writeFileSync(join(bundleDir, '_generic.json'), JSON.stringify(files));
}

console.log(`components: ${components.length} components, ${written} families -> static/families/*.css.d.ts`);
console.log(`components: classification -> ${docFile.replace(/.*[\/]src[\/]/, 'src/')}`);
