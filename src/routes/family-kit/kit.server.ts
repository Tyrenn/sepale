/**
 * The family kit: a document an AI reads to write a family (see guide.md).
 *
 * The guide is hand-written. Everything about the components is generated,
 * from the sources the app already reads — the doc pages' prose, the
 * components' vocabulary (`schema`), the classes and states the built families
 * ship, and the DOM the examples render (specimens.server.ts) — so the kit
 * follows the kit: a component added is a page added here.
 *
 * Served as Markdown by the routes beside this file and prerendered, so the
 * deployed site holds them as static files an assistant can fetch:
 *
 *   /family-kit/index.md          the guide and the component index
 *   /family-kit/<id>.md           one component page
 *   /family-kit/full.md           the guide and every component, in one file
 *   /family-kit/reference/…       the built families' SCSS, for reading
 */

import guide from './guide.md?raw';
import { pages } from '../(sidebar)/components/doc.js';
import { COMPONENTS } from '../playground.svelte.js';
import { specimensOf } from '../(sidebar)/components/specimens.server.js';
import { toHtml } from '../(sidebar)/components/dom.js';
import { classify } from '../classify.js';
import { contractOf } from '../(sidebar)/components/doc.js';
import { classesByFamily, schema } from '$lib/generated/components.js';
import { families } from '$lib/generated/registry.js';

const md = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');

/** Pages in the app's order, groups and labels included. */
export const kitPages = COMPONENTS.flatMap((g) =>
	g.items.filter((i) => pages[i.id]).map((i) => ({ ...i, group: g.group }))
);

const owns = (namespaces: string[], cls: string) =>
	namespaces.some((ns) => cls === ns || cls.startsWith(ns + '-'));

/** The wrappers whose namespace a page documents. */
const wrappersOf = (namespaces: string[]) =>
	Object.entries(schema)
		.filter(([, s]) => namespaces.includes(s.prefix))
		.map(([name]) => name);

function index(): string {
	const lines: string[] = [];
	let group = '';
	for (const p of kitPages) {
		if (p.group !== group) {
			group = p.group;
			lines.push('', `### ${group}`, '', '| Page | Namespaces | Svelte | What it is |', '| --- | --- | --- | --- |');
		}
		const doc = pages[p.id]!.doc;
		const ns = doc.namespaces.map((n) => `\`${n}\``).join(' ') || 'none';
		const wrappers = wrappersOf(doc.namespaces).map((w) => `\`<${w}>\``).join(' ') || '—';
		const first = doc.description.split(/(?<=\.)\s/)[0] ?? '';
		lines.push(`| [${p.label}](${p.id}.md) | ${ns} | ${wrappers} | ${md(first)} |`);
	}
	return lines.join('\n').trim();
}

/** The guide, its placeholders filled. */
export function guidePage(): string {
	return guide
		.replace('`{{APP}}new-family`', '[Create a family](../new-family), in the app')
		.replace('{{COMPONENTS}}', index());
}

/** Every class of a page: declared by its component, or shipped by a family. */
function classesOf(namespaces: string[]): string[] {
	const all = new Set<string>();
	for (const map of Object.values(classesByFamily)) {
		for (const cls of Object.keys(map)) if (owns(namespaces, cls)) all.add(cls);
	}
	for (const s of Object.values(schema)) {
		if (!namespaces.includes(s.prefix)) continue;
		all.add(s.prefix);
		for (const part of s.parts) all.add(`${s.prefix}-${part}`);
		for (const flag of s.flags) all.add(`${s.prefix}-${flag}`);
		for (const [axis, values] of Object.entries(s.axes)) {
			for (const v of values) {
				all.add(`${s.prefix}-${v === 'none' ? `no${axis}` : /^\d+$/.test(v) ? `${axis}${v}` : v}`);
			}
		}
	}
	const rank = { root: 0, part: 1, axis: 2, flag: 3, unclassified: 4 } as const;
	return [...all].sort(
		(a, b) => rank[classify(a).kind] - rank[classify(b).kind] || a.localeCompare(b)
	);
}

/** One class of a page, as both the kit and the reference page show it. */
export interface ClassEntry {
	cls: string;
	kind: 'root' | 'part' | 'axis' | 'flag' | 'unclassified';
	/** `axis size`, `flag (active)`, `part`… */
	label: string;
	/** The built families shipping it: `all`, a list, or `none yet`. */
	shipping: string;
	effect: string;
}

/** Everything known about one component page, family-blind. */
export interface Reference {
	id: string;
	label: string;
	group: string;
	description: string;
	namespaces: string[];
	wrappers: string[];
	/** The built families with a SCSS file for it. */
	sources: string[];
	classes: ClassEntry[];
	states: { cls: string; states: string[] }[];
	hooks: { component: string; hooks: string[] }[];
	motion: { component: string; motion: string[] }[];
	/** Each example's DOM, printed as HTML. */
	dom: { title: string; html: string }[];
}

export function referenceOf(id: string): Reference | null {
	const entry = pages[id];
	const meta = kitPages.find((p) => p.id === id);
	if (!entry || !meta) return null;
	const { doc } = entry;
	const classes: ClassEntry[] = doc.namespaces.length
		? classesOf(doc.namespaces).map((cls) => {
				const info = classify(cls);
				const label =
					info.kind === 'axis'
						? `axis ${info.axis}`
						: info.kind === 'flag'
							? `flag (${info.prop})`
							: info.kind === 'unclassified'
								? 'plain class'
								: info.kind;
				const shipping = families.filter((f) => cls in (classesByFamily[f] ?? {}));
				const effect =
					doc.classes?.[cls] ??
					(info.kind === 'root'
						? 'The component itself.'
						: info.kind === 'axis'
							? `Sets ${info.axis} to “${info.value}”.`
							: info.kind === 'flag'
								? `Written by the ${info.prop} prop.`
								: info.kind === 'part'
									? 'A piece the component draws; never opted into.'
									: '');
				return {
					cls,
					kind: info.kind,
					label,
					shipping: shipping.length === families.length ? 'all' : shipping.join(', ') || 'none yet',
					effect
				};
			})
		: [];
	const contract = contractOf(id);
	const wrappers = wrappersOf(doc.namespaces);
	return {
		id,
		label: meta.label,
		group: meta.group,
		description: doc.description,
		namespaces: doc.namespaces,
		wrappers,
		sources: families.filter((f) => `${f}/${id}.scss` in referenceFiles),
		classes,
		states: contract.states,
		hooks: contract.hooks.filter((h) => h.hooks.length),
		motion: wrappers
			.map((component) => ({ component, motion: schema[component]?.motion ?? [] }))
			.filter((m) => m.motion.length),
		dom: specimensOf(id).map((s) => ({ title: s.title, html: toHtml(s.nodes) }))
	};
}

export function componentPage(id: string): string | null {
	const r = referenceOf(id);
	if (!r) return null;
	const code = (s: string) => `\`${s}\``;
	const out: string[] = [`# ${r.label}`, '', r.description, ''];
	out.push(
		`- Group: ${r.group}`,
		`- Namespaces: ${r.namespaces.map(code).join(', ') || 'none: it draws nothing, so a family has nothing to style'}`,
		`- Svelte: ${r.wrappers.map((w) => code(`<${w}>`)).join(', ') || 'no wrapper; the classes are written by hand'}`,
		`- Reference SCSS: ${r.sources.map((f) => `[${f}](reference/${f}/${r.id}.scss)`).join(', ') || 'none: no family styles it'}`,
		''
	);

	if (r.classes.length) {
		out.push('## Classes', '', '| Class | Kind | Built families shipping it | What it does |', '| --- | --- | --- | --- |');
		for (const c of r.classes) out.push(`| \`.${c.cls}\` | ${c.label} | ${c.shipping} | ${md(c.effect)} |`);
		out.push('');
	}
	if (r.states.length) {
		out.push('## States', '', 'What the DOM says about itself, as the built families draw it. Give each a visible answer.', '');
		for (const { cls, states } of r.states) out.push(`- \`.${cls}\`: ${states.map(code).join(' ')}`);
		out.push('');
	}
	if (r.hooks.length) {
		out.push('## Custom properties the component writes', '', 'Inputs for the family to read; the component sets them inline.', '');
		for (const { component, hooks } of r.hooks) out.push(`- \`<${component}>\`: ${hooks.map(code).join(' ')}`);
		out.push('');
	}
	if (r.motion.length) {
		out.push('## Motion', '', 'What the component animates itself, and what it waits for from the family.', '');
		for (const { component, motion } of r.motion) for (const line of motion) out.push(`- \`<${component}>\`: ${line}`);
		out.push('');
	}
	if (r.dom.length) {
		out.push(
			'## DOM',
			'',
			"What each example renders on the server, before any script runs. Svelte markers removed; siblings shaped alike folded into one marked `×n`; only custom properties kept from `style`. Classes not in this page's namespaces belong to the demo or to another component.",
			''
		);
		for (const s of r.dom) out.push(`### ${s.title}`, '', '```html', s.html, '```', '');
	}
	return out.join('\n');
}

export function fullKit(): string {
	return [guidePage(), ...kitPages.map((p) => componentPage(p.id)).filter(Boolean)].join('\n\n---\n\n');
}

/* ── Reference: the built families' SCSS, as text ─────────────────────── */

const scss = import.meta.glob('/src/scss/**/*.scss', { query: '?raw', import: 'default', eager: true }) as Record<
	string,
	string
>;

/** `daisy/button.scss` or `_mixins.scss` → its source. Themes are left out. */
export const referenceFiles: Record<string, string> = Object.fromEntries(
	Object.entries(scss)
		.map(([path, src]) => [path.replace(/^\/src\/scss\//, ''), src] as const)
		.filter(([path]) => /^families\/[^/]+\/[^/]+\.scss$/.test(path) || /^_[\w-]+\.scss$/.test(path))
		.map(([path, src]) => [path.replace(/^families\//, ''), src])
);
