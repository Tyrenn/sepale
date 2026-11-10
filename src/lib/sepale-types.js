#!/usr/bin/env node
// @ts-nocheck — a Node command in a package whose types target the browser
// (no @types/node here); its behaviour is checked against the build instead.
/**
 * sepale-types — write the types a family stylesheet carries (ADR 0015).
 *
 *   npx sepale-types orchid.css                    → orchid.css.d.ts beside it
 *   npx sepale-types --components lib/components orchid.css
 *
 * For a stylesheet that never went through Sepale's build or app: one written
 * by hand or by an assistant, or one you changed after downloading it. It does
 * what they do — reads which axis value, flag or part each class is, from the
 * components' own AXES / FLAGS / PARTS blocks — and writes the declaration
 * with the same function (family-types). Never write that file by hand: it
 * would say what you meant the stylesheet to draw, not what it draws.
 *
 * `--components` points at the components to read: by default the ones next
 * to this script (the package's, or a bundle's `lib/components`). Point it at
 * your own copies when you changed their AXES, so a variant you added is typed.
 *
 * Plain JavaScript, no dependency: it runs from node_modules and from a
 * bundle's `lib/` alike. In a bundle, family-types is TypeScript, which Node
 * runs as it is from 22.18 / 23.6.
 */

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/* Classes Sepale writes but does not own: never classified (scripts/prefix.mjs). */
const EXTERNAL = new Set(['prose', 'filter']);
const EXTERNAL_PREFIXES = ['air-datepicker'];
const isExternal = (/** @type {string} */ cls) =>
	EXTERNAL.has(cls) || EXTERNAL_PREFIXES.some((p) => cls.startsWith(p));

/** The class suffix one axis value writes — the rules of variants.ts. */
const axisSuffix = (/** @type {string} */ axis, /** @type {string} */ value) =>
	value === 'none' ? `no${axis}` : /^\d+$/.test(value) ? `${axis}${value}` : value;

/** Every class name in a stylesheet. */
function classesIn(/** @type {string} */ css) {
	const clean = css
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/url\([^)]*\)/g, '')
		.replace(/"[^"\n]*"|'[^'\n]*'/g, '');
	return new Set([...clean.matchAll(/\.([a-z][a-z0-9]*(?:-[a-z0-9]+)*)/g)].map((m) => /** @type {string} */ (m[1])));
}

/**
 * The literal after `export const NAME =` in a component: a string, an array
 * or an object of strings. Parsed as data (quotes normalised to JSON), never
 * evaluated.
 * @param {string} src
 * @param {string} name
 * @returns {unknown}
 */
function readConst(src, name) {
	const at = src.indexOf(`export const ${name} =`);
	if (at < 0) return undefined;
	const start = src.indexOf('=', at) + 1;
	const from = start + src.slice(start).search(/[[{'"]/);
	const open = src[from];
	if (open === "'" || open === '"') return src.slice(from + 1, src.indexOf(open, from + 1));
	const close = open === '[' ? ']' : '}';
	let depth = 0;
	for (let i = from; i < src.length; i++) {
		if (src[i] === open) depth++;
		else if (src[i] === close && --depth === 0) {
			const json = src
				.slice(from, i + 1)
				.replace(/\/\*[\s\S]*?\*\//g, '')
				.replace(/\/\/[^\n]*/g, '')
				.replace(/'((?:[^'\\]|\\.)*)'/g, (_, s) => JSON.stringify(s.replace(/\\'/g, "'")))
				.replace(/([{,]\s*)([A-Za-z_$][\w$-]*)\s*:/g, '$1"$2":')
				.replace(/,(\s*[}\]])/g, '$1');
			return JSON.parse(json);
		}
	}
	return undefined;
}

/**
 * @typedef {{ name: string, prefix: string, axes: Record<string, string[]>, flags: string[], parts: string[] }} Decl
 */

/** Every component with a namespace in `dir`, read from its module script. */
function componentsIn(/** @type {string} */ dir) {
	/** @type {Decl[]} */
	const out = [];
	for (const file of readdirSync(dir).filter((f) => f.endsWith('.svelte'))) {
		const src = readFileSync(join(dir, file), 'utf8');
		const prefix = readConst(src, 'PREFIX');
		if (typeof prefix !== 'string') continue;
		try {
			const flags = /** @type {Record<string, string>} */ (readConst(src, 'FLAGS') ?? {});
			out.push({
				name: file.replace(/\.svelte$/, ''),
				prefix,
				axes: /** @type {Record<string, string[]>} */ (readConst(src, 'AXES') ?? {}),
				flags: Object.keys(flags),
				parts: /** @type {string[]} */ (readConst(src, 'PARTS') ?? [])
			});
		} catch (e) {
			throw new Error(`${file}: its AXES / FLAGS / PARTS block is not plain data (${/** @type {Error} */ (e).message})`);
		}
	}
	return out.sort((a, b) => b.prefix.length - a.prefix.length);
}

/**
 * What each class of a stylesheet is, in the shape family-types reads.
 * @param {string} css
 * @param {Decl[]} decls longest prefix first
 */
function classify(css, decls) {
	/** @type {Record<string, { kind: string, component?: string, axis?: string, value?: string }>} */
	const classes = {};
	/** @type {string[]} */
	const unclassified = [];
	for (const cls of [...classesIn(css)].sort()) {
		if (isExternal(cls)) continue;
		const owner = decls.find((c) => cls === c.prefix || cls.startsWith(`${c.prefix}-`));
		if (!owner) continue;
		if (cls === owner.prefix) {
			classes[cls] = { kind: 'root', component: owner.name };
			continue;
		}
		const suffix = cls.slice(owner.prefix.length + 1);
		let info = null;
		for (const [axis, values] of Object.entries(owner.axes)) {
			const value = values.find((v) => axisSuffix(axis, v) === suffix);
			if (value !== undefined) info = { kind: 'axis', component: owner.name, axis, value };
		}
		if (!info && owner.flags.includes(suffix)) info = { kind: 'flag', component: owner.name };
		if (!info && owner.parts.includes(suffix)) info = { kind: 'part', component: owner.name };
		if (!info) {
			info = { kind: 'unclassified', component: owner.name };
			unclassified.push(cls);
		}
		classes[cls] = info;
	}
	return { classes, unclassified };
}

/** family-types, as JavaScript (package) or TypeScript (bundle). */
async function loadFamilyTypes() {
	for (const file of ['family-types.js', 'family-types.ts']) {
		const path = join(here, file);
		if (existsSync(path)) return import(pathToFileURL(path).href);
	}
	throw new Error(`family-types not found next to ${here}`);
}

async function main(/** @type {string[]} */ argv) {
	let componentsDir = join(here, 'components');
	let help = false;
	/** @type {string[]} */
	const files = [];
	for (let i = 0; i < argv.length; i++) {
		const arg = /** @type {string} */ (argv[i]);
		if (arg === '--components') componentsDir = resolve(/** @type {string} */ (argv[++i]));
		else if (arg === '-h' || arg === '--help') help = true;
		else files.push(arg);
	}
	if (help || !files.length) {
		console.log('usage: sepale-types [--components <dir>] <family.css>…\n\nWrites <family>.css.d.ts beside each stylesheet: what it draws, as types.');
		return help ? 0 : 1;
	}
	if (!existsSync(componentsDir)) throw new Error(`no components at ${componentsDir} (use --components <dir>)`);

	const { familyShape, familyTypes } = await loadFamilyTypes();
	const decls = componentsIn(componentsDir);
	const schema = Object.fromEntries(decls.map((d) => [d.name, { prefix: d.prefix, flags: d.flags }]));

	for (const file of files) {
		const css = readFileSync(file, 'utf8');
		const family = basename(file).replace(/\.css$/, '');
		const { classes, unclassified } = classify(css, decls);
		const out = `${file.replace(/\.css$/, '')}.css.d.ts`;
		writeFileSync(out, familyTypes(family, familyShape(classes, schema, css)));
		console.log(`sepale-types: ${family} -> ${out}`);
		if (unclassified.length) {
			console.warn(
				`  ${unclassified.length} class(es) under a component's namespace that no AXES, FLAGS or PARTS block names — untyped:\n` +
					unclassified.map((c) => `    .${c}`).join('\n')
			);
		}
	}
	return 0;
}

main(process.argv.slice(2)).then(
	(code) => process.exit(code),
	(e) => {
		console.error(`sepale-types: ${e.message}`);
		process.exit(1);
	}
);
