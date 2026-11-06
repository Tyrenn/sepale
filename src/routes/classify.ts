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

/** The `uu-params` declaration a family emits (src/scss/_params.scss). */
export function paramsIn(css: string): FamilyParam[] | null {
	const m = css.match(/uu-params (\[[\s\S]*?\]) \*\//);
	if (!m) return null;
	try {
		const list = JSON.parse(m[1]!);
		return Array.isArray(list) ? list : null;
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
	for (const block of css.matchAll(/\/\*!?\s*=+([\s\S]*?)=+\s*\*\//g)) {
		const lines = block[1]!.split('\n').map((l) => l.replace(/^\s*/, '').trimEnd());
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
		const section = block[1]!.match(/Changes made[^\n]*\n([\s\S]*?)(?:\n\s*Build:|$)/);
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
