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

/** Links to the built families' SCSS for a page, where they have one. */
const references = (id: string) =>
	families
		.filter((f) => `${f}/${id}.scss` in referenceFiles)
		.map((f) => `[${f}](reference/${f}/${id}.scss)`)
		.join(', ') || 'none: no family styles it';

export function componentPage(id: string): string | null {
	const entry = pages[id];
	const meta = kitPages.find((p) => p.id === id);
	if (!entry || !meta) return null;
	const { doc } = entry;
	const out: string[] = [`# ${meta.label}`, '', doc.description, ''];
	const wrappers = wrappersOf(doc.namespaces);
	out.push(
		`- Group: ${meta.group}`,
		`- Namespaces: ${doc.namespaces.map((n) => `\`${n}\``).join(', ') || 'none: it draws nothing, so a family has nothing to style'}`,
		`- Svelte: ${wrappers.map((w) => `\`<${w}>\``).join(', ') || 'no wrapper; the classes are written by hand'}`,
		`- Reference SCSS: ${references(id)}`,
		''
	);

	if (doc.namespaces.length) {
		out.push('## Classes', '', '| Class | Kind | Built families shipping it | What it does |', '| --- | --- | --- | --- |');
		for (const cls of classesOf(doc.namespaces)) {
			const info = classify(cls);
			const kind =
				info.kind === 'axis'
					? `axis \`${info.axis}\``
					: info.kind === 'flag'
						? `flag (\`${info.prop}\`)`
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
							? `Written by the \`${info.prop}\` prop.`
							: info.kind === 'part'
								? 'A piece the component draws; never opted into.'
								: '');
			const who = shipping.length === families.length ? 'all' : shipping.join(', ') || 'none yet';
			out.push(`| \`.${cls}\` | ${kind} | ${who} | ${md(effect)} |`);
		}
		out.push('');
	}

	const contract = contractOf(id);
	if (contract.states.length) {
		out.push(
			'## States',
			'',
			'What the DOM says about itself, as the built families draw it. Give each a visible answer.',
			''
		);
		for (const { cls, states } of contract.states) {
			out.push(`- \`.${cls}\`: ${states.map((s) => `\`${s}\``).join(' ')}`);
		}
		out.push('');
	}
	const hooks = contract.hooks.filter((h) => h.hooks.length);
	if (hooks.length) {
		out.push('## Custom properties the component writes', '', 'Inputs for the family to read; the component sets them inline.', '');
		for (const { component, hooks: list } of hooks) {
			out.push(`- \`<${component}>\`: ${list.map((h) => `\`${h}\``).join(' ')}`);
		}
		out.push('');
	}

	const specimens = specimensOf(id);
	if (specimens.length) {
		out.push(
			'## DOM',
			'',
			'What each example renders on the server, before any script runs. Svelte markers removed; siblings shaped alike folded into one marked `×n`; only custom properties kept from `style`. Classes not in this page\'s namespaces belong to the demo or to another component.',
			''
		);
		for (const s of specimens) {
			out.push(`### ${s.title}`, '', '```html', toHtml(s.nodes), '```', '');
		}
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
