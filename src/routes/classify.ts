/**
 * Reading a family stylesheet in the browser, the way the build reads one.
 *
 * The build classifies every family it compiles (scripts/gen-components.mjs)
 * and reads its parameters and prose (scripts/gen-registry.mjs). A family
 * loaded from disk on the "Create a family" page was never built here, so the
 * app does the same reading itself, from the same inputs: the compiled CSS,
 * and the vocabulary every component declares (`schema`, generated).
 *
 * Kept in step with those scripts by hand. The rules are short — longest
 * prefix owns a class, an axis value writes `no<axis>` / `<axis><n>` / itself —
 * and the component pages use this module for the DOM tab too, so a drift
 * shows on every page at once.
 */

import {
	schema,
	EXTERNAL,
	EXTERNAL_PREFIXES,
	type ClassInfo
} from '$lib/generated/components.js';
import type { FamilyDoc, FamilyParam } from '$lib/generated/registry.js';
import { isSafeName, isSafeValue } from '$lib/theme.js';

const external = new Set(EXTERNAL);
export const isExternal = (cls: string) =>
	external.has(cls) || EXTERNAL_PREFIXES.some((p) => cls.startsWith(p));

/** The class one axis value writes, as a suffix (see src/lib/variants.ts). */
export const axisSuffix = (axis: string, value: string) =>
	value === 'none' ? `no${axis}` : /^\d+$/.test(value) ? `${axis}${value}` : value;

/** `image-full` → `imageFull`. */
export const camel = (name: string) => name.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());

/** Every class name in a stylesheet (scripts/prefix.mjs, `classesIn`). */
export function classesIn(css: string): Set<string> {
	const clean = css
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/url\([^)]*\)/g, '')
		.replace(/"[^"\n]*"|'[^'\n]*'/g, '');
	return new Set([...clean.matchAll(/\.([a-z][a-z0-9]*(?:-[a-z0-9]+)*)/g)].map((m) => m[1]!));
}

/* Longest prefix wins, so `.textarea-lg` goes to textarea and not to text. */
const owners = Object.entries(schema)
	.map(([name, s]) => ({ name, ...s }))
	.sort((a, b) => b.prefix.length - a.prefix.length);

/** The component that owns a class, by its namespace. */
export function ownerOf(cls: string) {
	return owners.find((c) => cls === c.prefix || cls.startsWith(`${c.prefix}-`));
}

/** What one class is, whatever family ships it. */
export function classify(cls: string): ClassInfo {
	const owner = ownerOf(cls);
	if (!owner) return { kind: 'unclassified' };
	if (cls === owner.prefix) return { kind: 'root', component: owner.name };
	const suffix = cls.slice(owner.prefix.length + 1);
	for (const [axis, values] of Object.entries(owner.axes)) {
		const value = values.find((v) => axisSuffix(axis, v) === suffix);
		if (value !== undefined) return { kind: 'axis', component: owner.name, axis, value };
	}
	if (owner.flags.includes(suffix)) return { kind: 'flag', component: owner.name, prop: camel(suffix) };
	if (owner.parts.includes(suffix)) return { kind: 'part', component: owner.name };
	return { kind: 'unclassified', component: owner.name };
}

/** What a stylesheet ships, in the shape of `classesByFamily` & co. */
export interface Classification {
	classes: Record<string, ClassInfo>;
	axes: Record<string, Record<string, string[]>>;
	flags: Record<string, string[]>;
}

export function classifyStylesheet(css: string): Classification {
	const shipped = classesIn(css);
	const classes: Record<string, ClassInfo> = {};
	for (const cls of [...shipped].sort()) {
		if (!isExternal(cls)) classes[cls] = classify(cls);
	}
	const axes: Classification['axes'] = {};
	const flags: Classification['flags'] = {};
	for (const { name, prefix, axes: all, flags: allFlags } of owners) {
		const values: Record<string, string[]> = {};
		for (const [axis, list] of Object.entries(all)) {
			const kept = list.filter((v) => shipped.has(`${prefix}-${axisSuffix(axis, v)}`));
			if (kept.length) values[axis] = kept;
		}
		if (Object.keys(values).length) axes[name] = values;
		const live = allFlags.filter((f) => shipped.has(`${prefix}-${f}`));
		if (live.length) flags[name] = live.map(camel);
	}
	return { classes, axes, flags };
}

const TYPES = new Set(['color', 'length', 'number', 'text', 'edge-width', 'shadows']);
const KINDS = new Set(['surface', 'accent', 'ink']);
const text = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : undefined);
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);

/**
 * One `uu-params` entry, rebuilt field by field from what the file says.
 *
 * The file may come from anyone, and its values end up written as CSS text
 * into the page (see "What may be written" in $lib/theme.ts). So nothing is
 * copied wholesale: a name must be a CSS ident, a value a plain CSS value, a
 * type and a kind one of the known words, numbers finite, and the prose is
 * cut to length (it is only ever shown as text). An entry that fails is left
 * out, with the rest of the family still loaded.
 */
function readParam(raw: unknown): FamilyParam | null {
	if (!raw || typeof raw !== 'object') return null;
	const p = raw as Record<string, unknown>;
	if (!isSafeName(p.name) || !isSafeValue(p.value)) return null;
	if (typeof p.type !== 'string' || !TYPES.has(p.type)) return null;
	const out: FamilyParam = {
		name: p.name,
		label: text(p.label, 80) ?? p.name,
		group: text(p.group, 40) ?? 'Other',
		type: p.type,
		value: p.value
	};
	const description = text(p.description, 400);
	if (description) out.description = description;
	for (const key of ['min', 'max', 'step'] as const) {
		const n = num(p[key]);
		if (n !== undefined) out[key] = n;
	}
	if (typeof p.unit === 'string' && /^[a-z%]{1,6}$/.test(p.unit)) out.unit = p.unit;
	if (Array.isArray(p.units)) {
		const units = p.units.filter((u): u is string => typeof u === 'string' && /^[a-z%]{1,6}$/.test(u));
		if (units.length) out.units = units.slice(0, 10);
	}
	if (typeof p.kind === 'string' && KINDS.has(p.kind)) out.kind = p.kind;
	if (isSafeName(p.on)) out.on = p.on;
	return out;
}

/** The `uu-params` declaration a family emits (src/scss/_params.scss). */
export function paramsIn(css: string): FamilyParam[] | null {
	const at = css.indexOf('uu-params [');
	if (at < 0) return null;
	const end = css.indexOf('] */', at);
	if (end < 0) return null;
	try {
		const list: unknown = JSON.parse(css.slice(at + 'uu-params '.length, end + 1));
		if (!Array.isArray(list)) return null;
		const seen = new Set<string>();
		const params: FamilyParam[] = [];
		for (const raw of list.slice(0, 200)) {
			const p = readParam(raw);
			if (p && !seen.has(p.name)) {
				seen.add(p.name);
				params.push(p);
			}
		}
		return params;
	} catch {
		return null;
	}
}

/**
 * The family's header comment, in the same shape gen-registry reads out of an
 * `index.scss`: the `STYLE FAMILY — « name »  (after …)` line, the prose, and
 * the list under "Changes made to fit our contract". Sass keeps comments, so
 * the header survives into the compiled CSS, where this finds it.
 */
export function docIn(css: string): (FamilyDoc & { name: string }) | null {
	/* Found by position, not by one regex over the file: a lazy `[\s\S]*?`
	   between runs of `=` backtracks without end on a crafted file. */
	const blocks: string[] = [];
	for (let at = css.indexOf('STYLE FAMILY'); at >= 0 && blocks.length < 5; at = css.indexOf('STYLE FAMILY', at + 1)) {
		const open = css.lastIndexOf('/*', at);
		const close = css.indexOf('*/', at);
		if (open < 0 || close < 0 || css.lastIndexOf('*/', at) > open) continue;
		blocks.push(css.slice(open + 2, close).replace(/^!?\s*=+/, '').replace(/=+\s*$/, ''));
	}
	for (const body of blocks) {
		const lines = body.split('\n').map((l) => l.replace(/^\s*/, '').trimEnd());
		const at = lines.findIndex((l) => l.startsWith('STYLE FAMILY'));
		if (at < 0) continue;
		const head = lines[at]!;
		const name = head.match(/«\s*([^»]+?)\s*»/)?.[1] ?? '';
		const after = head.match(/\(([^)]*)\)\s*$/)?.[1]?.trim() ?? '';
		const prose: string[] = [];
		for (const line of lines.slice(at + 1)) {
			if (/^(Changes made|Build:)/.test(line)) break;
			prose.push(line);
		}
		const blurb = prose
			.join('\n')
			.split(/\n\s*\n/)
			.map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
			.filter(Boolean)
			.join('\n\n');
		const section = body.match(/Changes made[^\n]*\n([\s\S]*?)(?:\n\s*Build:|$)/);
		const changes = section
			? section[1]!
					.split(/(?:^|\n)\s*-\s+/)
					.map((item) => item.replace(/\s*\n\s*/g, ' ').trim())
					.filter(Boolean)
			: [];
		const title = name ? name.charAt(0).toUpperCase() + name.slice(1) : '';
		return { name, title, after, blurb, changes };
	}
	return null;
}
