/**
 * gen-components.mjs — narrow every Svelte component to each family.
 *
 * Source of truth, as everywhere else in this repo, is the compiled CSS. A
 * component in src/lib/components/ declares what its classes ARE — which axis
 * each one belongs to — and this script says which of them a given family
 * actually ships:
 *
 *   src/lib/components/Button.svelte   hand-written, every axis at full width
 *        ×  static/families/daisy.css  the classes daisy really has
 *        =  src/generated/components/daisy/Button.svelte
 *
 * The source is generic — AXES and FLAGS blocks, resolved at run time by
 * src/lib/variants.ts — because the app shows every family at once. The copy a
 * consumer downloads is written out as if for that family alone: its props are
 * plain unions of the values the family ships, its classes a plain array, and
 * it imports nothing local (scripts/family-component.mjs does the rewrite). An
 * axis or a flag the family does not ship is simply not there.
 *
 * The script FAILS if a family ships a class this component has not
 * classified: that class is either a variant nobody exposed or a part nobody
 * renders, and both need a human. Run after sass (see build:css).
 *
 * Output: src/generated/components/ (git-ignored, regenerated on build).
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from 'svelte/compiler';
import { familyComponent, axisSuffix, camel } from './family-component.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'src/lib/components');
const builtDir = join(root, 'static/families');
const outDir = join(root, 'src/generated/components');
const docFile = join(root, 'src/lib/generated/components.ts');
const pagesDir = join(root, 'src/routes/components/docs');

/**
 * Classes we WRITE but do not OWN. They belong to somebody else's stylesheet
 * (daisyUI's `.filter` wrapper, Tailwind Typography's `.prose`) and we only
 * ever name them to qualify our own selectors: `.prose :where(a.btn)`,
 * `:not(.filter .btn)`. Referencing a namespace is not owning it — see
 * CONTEXT.md — but a class name scraped out of compiled CSS cannot tell the
 * two apart, so the list is written down.
 */
const EXTERNAL = new Set(['prose', 'filter']);

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

/** Every class name in a stylesheet. Comments go first — a doc comment
 *  mentioning `.badge-{position}` is not a class — and so do quoted strings and
 *  url(), or the `w3.org` inside an inline SVG would read as a class `.org`. */
function classesIn(css) {
	const clean = css
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/url\([^)]*\)/g, '')
		/* Bounded to one line, always: a CSS string cannot span a newline, and an
		   unbalanced quote (there are ~490 apostrophes in a family stylesheet)
		   would otherwise swallow the rest of the file and its classes with it. */
		.replace(/"[^"\n]*"|'[^'\n]*'/g, '');
	return new Set([...clean.matchAll(/\.([a-z][a-z0-9]*(?:-[a-z0-9]+)*)/g)].map((m) => m[1]));
}

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

if (existsSync(outDir)) rmSync(outDir, { recursive: true });

const problems = [];
let written = 0;

/* What the component pages read. Same pass as the narrowing above, on purpose:
   a page cannot describe a class the generated component does not offer,
   because the two are decided here, once. */
const classesByFamily = {};
const axesByFamily = {};
const flagsByFamily = {};
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
	mkdirSync(join(outDir, family), { recursive: true });

	const famAxes = {};
	const famFlags = {};

	for (const { file, src, prefix, name, flags, axes } of components) {
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

		try {
			const out = familyComponent(
				{
					src,
					name,
					prefix,
					allAxes: axes.value,
					axes: values,
					allFlags: flags,
					flags: live,
					/* `background` writes --<prefix>-bg; it is only a prop where the
					   family's stylesheet reads that slot. */
					background: css.includes(`var(--${prefix}-bg`)
				},
				family
			);
			/* Parsed by the Svelte compiler before it is written: a rewrite that
			   breaks the syntax fails the build here, not in a consumer's app.
			   Types are checked by `npm run check` (svelte-check covers
			   src/generated/). */
			compile(out, { filename: file, generate: false });
			writeFileSync(join(outDir, family, file), out);
			written++;
		} catch (e) {
			problems.push(`${family}/${file}: ${e.message.split(NL)[0]}`);
		}
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
		if (EXTERNAL.has(cls)) continue;
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
writeFileSync(
	docFile,
	`// AUTO-GENERATED by scripts/gen-components.mjs — do not edit.
//
// What each family actually ships, read back out of its compiled CSS and
// classified by the components' own AXES / FLAGS / PARTS blocks. The component
// pages render this; the prose that goes beside it is hand-written in
// src/routes/components/docs/.

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
`
);

console.log(
	`components: ${components.length} × ${families.length} families = ${written} files -> src/generated/components/`
);
console.log(`components: classification -> ${docFile.replace(/.*[\/]src[\/]/, 'src/')}`);
