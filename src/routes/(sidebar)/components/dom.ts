/**
 * The DOM a component renders, as data.
 *
 * The component pages' examples are rendered on the server
 * (`specimens.server.ts`); this module turns that HTML into a tree a reader can
 * take in: the hydration markers and Svelte's scoping classes go, whitespace
 * collapses, an `<svg>` keeps its tag and loses its drawing, and siblings
 * shaped the same — ten rows of a table, eight buttons of one colour — fold
 * into one with a count. The DOM tab draws the tree; the family kit prints it
 * back as HTML (`toHtml`). Both read the same specimens, so the page and the
 * document an AI reads cannot disagree.
 *
 * Svelte's server output is well-formed, which is all this parser assumes.
 */

export interface DomElement {
	tag: string;
	attrs: [string, string | null][];
	children: DomNode[];
	/** Siblings folded into this one, shaped exactly like it. */
	repeat?: number;
	/** Children left out on purpose (an svg's drawing). */
	elided?: boolean;
}
export type DomNode = DomElement | { text: string };

export const isElement = (n: DomNode): n is DomElement => 'tag' in n;

const VOID = new Set([
	'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'
]);
/* Raw text: their content is not markup, and not structure either. */
const DROP = new Set(['script', 'style', 'template']);

/** Parse an HTML fragment into nodes. */
export function parseHtml(html: string): DomNode[] {
	const root: DomElement = { tag: '#root', attrs: [], children: [] };
	const stack: DomElement[] = [root];
	let i = 0;
	const top = () => stack[stack.length - 1]!;
	while (i < html.length) {
		if (html.startsWith('<!--', i)) {
			const end = html.indexOf('-->', i + 4);
			i = end < 0 ? html.length : end + 3;
			continue;
		}
		if (html[i] === '<' && html[i + 1] === '/') {
			const end = html.indexOf('>', i);
			const tag = html.slice(i + 2, end).trim().toLowerCase();
			/* Close up to the matching element; a stray end tag is ignored. */
			const at = stack.map((e) => e.tag).lastIndexOf(tag);
			if (at > 0) stack.length = at;
			i = end + 1;
			continue;
		}
		if (html[i] === '<' && /[a-zA-Z!]/.test(html[i + 1] ?? '')) {
			if (html[i + 1] === '!') {
				i = html.indexOf('>', i) + 1 || html.length;
				continue;
			}
			const { element, end, selfClosing } = readTag(html, i);
			i = end;
			if (DROP.has(element.tag)) {
				const close = html.indexOf(`</${element.tag}`, i);
				i = close < 0 ? html.length : html.indexOf('>', close) + 1;
				continue;
			}
			top().children.push(element);
			if (!selfClosing && !VOID.has(element.tag)) stack.push(element);
			continue;
		}
		const next = html.indexOf('<', i + 1);
		const text = html.slice(i, next < 0 ? html.length : next);
		top().children.push({ text });
		i = next < 0 ? html.length : next;
	}
	return root.children;
}

function readTag(html: string, from: number) {
	let i = from + 1;
	while (i < html.length && /[\w:-]/.test(html[i]!)) i++;
	const element: DomElement = { tag: html.slice(from + 1, i).toLowerCase(), attrs: [], children: [] };
	for (;;) {
		while (/\s/.test(html[i] ?? '')) i++;
		if (html[i] === '>' || i >= html.length) return { element, end: i + 1, selfClosing: false };
		if (html[i] === '/' && html[i + 1] === '>') return { element, end: i + 2, selfClosing: true };
		const start = i;
		while (i < html.length && !/[\s=>]/.test(html[i]!) && !(html[i] === '/' && html[i + 1] === '>')) i++;
		const name = html.slice(start, i);
		while (/\s/.test(html[i] ?? '')) i++;
		if (html[i] !== '=') {
			if (name) element.attrs.push([name, null]);
			continue;
		}
		i++;
		while (/\s/.test(html[i] ?? '')) i++;
		const quote = html[i];
		let value: string;
		if (quote === '"' || quote === "'") {
			const end = html.indexOf(quote, i + 1);
			value = html.slice(i + 1, end);
			i = end + 1;
		} else {
			const start2 = i;
			while (i < html.length && !/[\s>]/.test(html[i]!)) i++;
			value = html.slice(start2, i);
		}
		element.attrs.push([name, value]);
	}
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' };
export const decode = (s: string) =>
	s.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, e: string) => ENTITIES[e]!).replace(/&#(\d+);/g, (_, n: string) =>
		String.fromCharCode(Number(n))
	);

const MAX_TEXT = 48;

/** An attribute worth showing, cleaned; `null` drops it. */
function keepAttr(name: string, value: string | null): [string, string | null] | null {
	if (name === 'class') {
		const kept = (value ?? '').split(/\s+/).filter((c) => c && !/^svelte-[a-z0-9]+$/.test(c));
		return kept.length ? ['class', kept.join(' ')] : null;
	}
	if (name === 'style') {
		/* Only the custom properties: the inputs a family reads. */
		const vars = (value ?? '')
			.split(';')
			.map((d) => d.trim())
			.filter((d) => d.startsWith('--'));
		return vars.length ? ['style', vars.join('; ')] : null;
	}
	/* Event handlers and Svelte's bookkeeping are not structure. */
	if (name.startsWith('on') || name.startsWith('data-svelte')) return null;
	if (name === 'src' || name === 'srcset') return [name, '…'];
	if (name === 'd' || name === 'points' || name === 'viewbox') return null;
	if (value && value.length > 60) return [name, value.slice(0, 57) + '…'];
	return [name, value];
}

/** The shape of a node, text aside: what decides whether two siblings fold. */
function shape(n: DomNode): string {
	if (!isElement(n)) return '#';
	return `${n.tag}(${n.attrs.map(([k, v]) => `${k}=${v}`).join(',')})[${n.children.map(shape).join('')}]`;
}

/** Clean a parsed tree for reading (see the module comment). */
export function simplify(nodes: DomNode[]): DomNode[] {
	const out: DomNode[] = [];
	for (const n of nodes) {
		if (!isElement(n)) {
			const text = decode(n.text).replace(/\s+/g, ' ').trim();
			if (!text) continue;
			out.push({ text: text.length > MAX_TEXT ? text.slice(0, MAX_TEXT - 1) + '…' : text });
			continue;
		}
		const attrs = n.attrs.map(([k, v]) => keepAttr(k, v)).filter((a) => a !== null);
		const svg = n.tag === 'svg';
		const el: DomElement = {
			tag: n.tag,
			attrs,
			children: svg ? [] : simplify(n.children),
			elided: svg && n.children.length > 0 ? true : undefined
		};
		const prev = out[out.length - 1];
		if (prev && isElement(prev) && shape(prev) === shape(el)) {
			prev.repeat = (prev.repeat ?? 1) + 1;
			continue;
		}
		out.push(el);
	}
	return out;
}

/** Every class written anywhere in a tree. */
export function classesOf(nodes: DomNode[], into = new Set<string>()): Set<string> {
	for (const n of nodes) {
		if (!isElement(n)) continue;
		for (const [k, v] of n.attrs) if (k === 'class' && v) v.split(/\s+/).forEach((c) => into.add(c));
		classesOf(n.children, into);
	}
	return into;
}

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/** A simplified tree, printed back as indented HTML (the family kit). */
export function toHtml(nodes: DomNode[], depth = 0): string {
	const pad = '  '.repeat(depth);
	const lines: string[] = [];
	for (const n of nodes) {
		if (!isElement(n)) {
			lines.push(pad + escape(n.text));
			continue;
		}
		const attrs = n.attrs.map(([k, v]) => (v === null ? ` ${k}` : ` ${k}="${escapeAttr(v)}"`)).join('');
		const open = `<${n.tag}${attrs}>`;
		const note = n.repeat ? `  <!-- ×${n.repeat} -->` : '';
		if (VOID.has(n.tag)) {
			lines.push(pad + open + note);
		} else if (n.elided) {
			lines.push(`${pad}${open}…</${n.tag}>${note}`);
		} else if (!n.children.length) {
			lines.push(`${pad}${open}</${n.tag}>${note}`);
		} else if (n.children.length === 1 && !isElement(n.children[0]!)) {
			lines.push(`${pad}${open}${escape((n.children[0] as { text: string }).text)}</${n.tag}>${note}`);
		} else {
			lines.push(pad + open + note, toHtml(n.children, depth + 1), `${pad}</${n.tag}>`);
		}
	}
	return lines.join('\n');
}

/** One example of a page, as the component renders it. */
export interface Specimen {
	title: string;
	nodes: DomNode[];
}

/**
 * The context key that puts `Section` in specimen mode: rendered on the server
 * for `specimens.server.ts`, a section draws its preview alone, in a marked
 * `<div>`, and none of the chrome around it — no tabs, no code, and no
 * "this family does not ship it": the DOM is the components', not a family's.
 */
export const SPECIMEN = 'sepale:specimen';
