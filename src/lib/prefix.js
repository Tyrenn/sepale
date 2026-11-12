// @ts-nocheck — a Node module that walks Svelte's syntax tree (typed `any` here);
// its behaviour is checked against the components' own build (ADR 0007, 0017).
/**
 * prefix — the class prefix of ADR 0007: a rename applied to a delivery,
 * never to the source.
 *
 * Sepale builds and documents unprefixed classes (`btn`, `btn-primary`). A
 * consumer whose own classes would meet them (`.title`, `.chip`, `.label`…)
 * takes its copy renamed — `sp-btn`, `sp-btn-primary` — by calling the two
 * functions below on what it copies: the family stylesheet, and the
 * components. The Vite plugin (`@sepale/components/vite`, ADR 0017) calls them
 * on the fly; this module is also exported as `@sepale/components/prefix` for
 * any other build tool. No prefix, nothing is called: the default delivery is
 * the unprefixed kit.
 *
 * Only class names move. Custom properties (`--btn-fg`), keyframes, element
 * selectors and attributes stay as they are: a prefix keeps the kit's classes
 * out of the consumer's way, and those were never in it.
 *
 * The stylesheet is renamed token by token. A component cannot be: the same
 * word is a class in one place and something else in the next (`role="alert"`,
 * `type="checkbox"`, `as === 'dialog'`, `view === 'list'`). So a component is
 * renamed through its syntax tree, and only where a string IS a class:
 *
 *   - the value of a `class` attribute, on an element or a component, and the
 *     name of a `class:` directive;
 *   - whatever flows into a class attribute — `class={classes}` follows
 *     `classes` back to its declaration, `class={itemClass(i)}` to what the
 *     function returns — in value position only: `open && 'dropdown-open'`
 *     renames the class, never the condition;
 *   - a class tested or toggled: `classes.includes('…')`, `el.classList.*('…')`;
 *   - a class in a DOM selector: `querySelector('.…')`, `closest('.…')`.
 *
 * A template that builds a class (`` `btn-${color}` ``) is renamed on its head:
 * `btn-` is the beginning of a class the family ships.
 */

import { parse } from 'svelte/compiler';

/**
 * Classes we WRITE but do not OWN. They belong to somebody else's stylesheet
 * (daisyUI's `.filter` wrapper, Tailwind Typography's `.prose`) and we only
 * ever name them to qualify our own selectors: `.prose :where(a.btn)`,
 * `:not(.filter .btn)`. Referencing a namespace is not owning it — see
 * CONTEXT.md — but a class name scraped out of compiled CSS cannot tell the
 * two apart, so the list is written down. Never classified, never renamed:
 * the other stylesheet keeps its names.
 */
export const EXTERNAL = new Set(['prose', 'filter']);
/* A vendored library's own classes, reached into from under a class of ours:
   `calendar.scss` styles `.calendar .air-datepicker-cell` (ADR 0009,
   integration). */
export const EXTERNAL_PREFIXES = ['air-datepicker'];
export const isExternal = (cls) => EXTERNAL.has(cls) || EXTERNAL_PREFIXES.some((p) => cls.startsWith(p));

const CLASS = /^\.([a-z][a-z0-9]*(?:-[a-z0-9]+)*)/;

/** Every class name in a stylesheet. Comments go first — a doc comment
 *  mentioning `.badge-{position}` is not a class — and so do quoted strings and
 *  url(), or the `w3.org` inside an inline SVG would read as a class `.org`.
 *  @param {string} css
 *  @returns {Set<string>} */
export function classesIn(css) {
	const clean = css
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/url\([^)]*\)/g, '')
		/* Bounded to one line, always: a CSS string cannot span a newline, and an
		   unbalanced quote (there are ~490 apostrophes in a family stylesheet)
		   would otherwise swallow the rest of the file and its classes with it. */
		.replace(/"[^"\n]*"|'[^'\n]*'/g, '');
	return new Set([...clean.matchAll(/\.([a-z][a-z0-9]*(?:-[a-z0-9]+)*)/g)].map((m) => m[1]));
}

/**
 * The stylesheet, every class of ours renamed `.x` → `.<prefix>-x`. Comments,
 * strings and url() are copied untouched — a `w3.org` inside an inline SVG is
 * not a class. A class glued to another (`.toast.toast-top`) or to an element
 * (`a.btn`) is renamed like any other: the components rename it the same way.
 * @param {string} css
 * @param {string} prefix without the dash: `sp` gives `.sp-btn`
 * @returns {string}
 */
export function prefixCss(css, prefix) {
	let out = '';
	for (let i = 0; i < css.length; ) {
		const rest = css.slice(i);
		const skip = rest.match(/^(\/\*[\s\S]*?\*\/|url\([^)]*\)|"[^"\n]*"|'[^'\n]*')/);
		if (skip) {
			out += skip[0];
			i += skip[0].length;
			continue;
		}
		const cls = rest.match(CLASS);
		if (cls && !isExternal(cls[1])) {
			out += `.${prefix}-${cls[1]}`;
			i += cls[0].length;
			continue;
		}
		out += css[i++];
	}
	return out;
}

/**
 * One generated component, its classes renamed. `classes` is the set the
 * family ships (classesIn of its stylesheet): a word is renamed only if it is
 * one of them — or, at the head of a template, the beginning of one.
 *
 * Returns the source and the list of what was renamed, for the caller to
 * report: a rename is a decision, and it should be readable.
 * @param {string} src the component's `.svelte` source
 * @param {string} prefix without the dash: `sp` gives `sp-btn`
 * @param {Set<string>} classes the classes the family ships
 * @returns {{ code: string, renamed: string[] }}
 */
export function prefixComponent(src, prefix, classes) {
	const ours = (word) => classes.has(word) && !isExternal(word);
	/* The beginning of a class: `btn-` of `btn-primary`, `subtitle-s` of `subtitle-s1`. */
	const heads = new Set();
	for (const cls of classes) {
		if (isExternal(cls)) continue;
		for (let at = 1; at < cls.length; at++) heads.add(cls.slice(0, at));
	}
	const rename = (word) => `${prefix}-${word}`;

	const edits = [];
	const renamed = [];
	const edit = (start, end, text, what) => {
		edits.push({ start, end, text });
		renamed.push(what);
	};

	/* Whitespace-separated words of a piece of class text, at their offsets.
	   `glued.before`: the text follows an expression with no space, so its first
	   word is the tail of a class (`{'sidebar'}-head`), never renamed.
	   `glued.after`: an expression follows with no space, so its last word is
	   the head of one (`tabs-{x}`), renamed if a class begins with it. */
	function renameWords(text, offset, glued = {}) {
		for (const m of text.matchAll(/\S+/g)) {
			const word = m[0];
			const first = m.index === 0;
			const last = m.index + word.length === text.length;
			if (first && glued.before) continue;
			const head = last && glued.after;
			if (head ? ours(word) || heads.has(word) : ours(word)) {
				edit(offset + m.index, offset + m.index + word.length, rename(word), word);
			}
		}
	}

	/* A class in a selector string: `.file-explorer-grid`, `.switch-item:has(…)`. */
	function renameSelector(text, offset) {
		for (const m of text.matchAll(/(?<!\d)\.([a-z][a-z0-9]*(?:-[a-z0-9]+)*)/g)) {
			if (ours(m[1])) edit(offset + m.index + 1, offset + m.index + m[0].length, rename(m[1]), m[1]);
		}
	}

	const tainted = new Set();
	const queue = [];
	const taint = (name) => {
		if (!tainted.has(name)) {
			tainted.add(name);
			queue.push(name);
		}
	};

	/** A string literal's content, renamed word by word (the quotes stay). */
	function literal(node, words = renameWords) {
		if (typeof node.value !== 'string') return;
		words(src.slice(node.start + 1, node.end - 1), node.start + 1);
	}

	function template(node, words = renameWords) {
		node.quasis.forEach((q, i) => {
			const text = src.slice(q.start, q.end);
			words(text, q.start, { before: i > 0 && !/^\s/.test(text), after: !q.tail && !/\s$/.test(text) });
		});
	}

	/** An expression whose value ends up in a class attribute. */
	function value(node) {
		if (!node) return;
		switch (node.type) {
			case 'Literal':
				return literal(node);
			case 'TemplateLiteral':
				template(node);
				return node.expressions.forEach(value);
			case 'ArrayExpression':
				return node.elements.forEach(value);
			case 'ObjectExpression':
				/* Svelte's class object: the keys are classes, the values conditions. */
				for (const p of node.properties) {
					if (p.type === 'SpreadElement') value(p.argument);
					else if (!p.computed && p.key.type === 'Literal') literal(p.key);
					else if (!p.computed && p.key.type === 'Identifier' && ours(p.key.name)) {
						edit(p.key.start, p.key.end, `'${rename(p.key.name)}'`, p.key.name);
					}
				}
				return;
			case 'ConditionalExpression':
				value(node.consequent);
				return value(node.alternate);
			case 'LogicalExpression':
				if (node.operator !== '&&') value(node.left);
				return value(node.right);
			case 'BinaryExpression':
				if (node.operator === '+') {
					value(node.left);
					value(node.right);
				}
				return;
			case 'Identifier':
				return taint(node.name);
			case 'MemberExpression':
				return value(node.object);
			case 'CallExpression': {
				const callee = node.callee;
				/* $derived(x), $derived.by(() => x): the rune's value is x. */
				if (callee.type === 'Identifier' && callee.name === '$derived') return value(node.arguments[0]);
				if (callee.type === 'MemberExpression' && callee.object.name === '$derived') return value(node.arguments[0]);
				/* cx(PREFIX, applied.classes, …): the helper every component joins its classes with — its arguments ARE classes. */
				if (callee.type === 'Identifier' && callee.name === 'cx') return node.arguments.forEach(value);
				if (callee.type === 'Identifier') return taint(callee.name);
				/* [...].filter(Boolean).join(' '), a.concat(b) */
				if (callee.type === 'MemberExpression') {
					value(callee.object);
					if (callee.property.name === 'concat') node.arguments.forEach(value);
				}
				return;
			}
			case 'ArrowFunctionExpression':
			case 'FunctionExpression':
			case 'FunctionDeclaration':
				if (node.body.type !== 'BlockStatement') return value(node.body);
				return returns(node.body);
			case 'SpreadElement':
			case 'TSAsExpression':
			case 'TSNonNullExpression':
			case 'TSSatisfiesExpression':
			case 'ParenthesizedExpression':
			case 'ChainExpression':
				return value(node.argument ?? node.expression);
		}
	}

	/** What a function body returns, its own nested functions left out. */
	function returns(node) {
		if (!node || typeof node !== 'object') return;
		if (Array.isArray(node)) return node.forEach(returns);
		if (/Function/.test(node.type ?? '')) return;
		if (node.type === 'ReturnStatement') return value(node.argument);
		for (const key in node) if (key !== 'metadata') returns(node[key]);
	}

	/** Every node of the tree, once. */
	function walk(node, visit, seen = new WeakSet()) {
		if (!node || typeof node !== 'object' || seen.has(node)) return;
		seen.add(node);
		if (Array.isArray(node)) return node.forEach((n) => walk(n, visit, seen));
		if (typeof node.type === 'string') visit(node);
		for (const key in node) if (key !== 'metadata' && key !== 'parent') walk(node[key], visit, seen);
	}

	const ast = parse(src, { modern: true });
	const scripts = [ast.instance?.content, ast.module?.content].filter(Boolean);

	/* The template: class attributes and class directives. */
	walk(ast.fragment, (node) => {
		if (node.type === 'ClassDirective' && ours(node.name)) {
			/* `class:x` alone is short for `class:x={x}`: renamed, it needs its value said. */
			const shorthand = node.expression.type === 'Identifier' && node.expression.start === node.start + 'class:'.length;
			const name = `class:${rename(node.name)}`;
			edit(node.start, node.start + `class:${node.name}`.length, shorthand ? `${name}={${node.name}}` : name, node.name);
		}
		if (node.type !== 'Attribute' || node.name !== 'class' || node.value === true) return;
		const parts = Array.isArray(node.value) ? node.value : [node.value];
		parts.forEach((part, i) => {
			if (part.type === 'Text') {
				renameWords(src.slice(part.start, part.end), part.start, {
					before: i > 0 && !/^\s/.test(part.data),
					after: i < parts.length - 1 && !/\s$/.test(part.data)
				});
			} else value(part.expression);
		});
	});

	/* Whatever the class attributes read, back to its declaration. */
	const declarations = new Map();
	/* What applyAxes(PREFIX, …) is given: the word its classes begin with (`<prefix>-<value>`). It need not be a
	   class itself — `.text` alone is not one, only `.text-s1` — so it is renamed as the head of one. */
	const axesPrefixes = [];
	const declare = (name, node) => declarations.set(name, [...(declarations.get(name) ?? []), node]);
	walk(scripts, (node) => {
		if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier' && node.init) declare(node.id.name, node.init);
		if (node.type === 'FunctionDeclaration' && node.id) declare(node.id.name, node);
		if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 'applyAxes') axesPrefixes.push(node.arguments[0]);
	});
	while (queue.length) for (const node of declarations.get(queue.shift()) ?? []) value(node);
	const headWords = (text, offset) => renameWords(text, offset, { after: true });
	for (const arg of axesPrefixes) {
		if (arg?.type === 'Literal') literal(arg, headWords);
		else if (arg?.type === 'Identifier') {
			for (const decl of declarations.get(arg.name) ?? []) if (decl.type === 'Literal') literal(decl, headWords);
		}
	}

	/* Classes tested or toggled, and classes in selectors, anywhere. */
	const TESTS = new Set(['includes', 'contains', 'add', 'remove', 'toggle', 'replace']);
	const SELECTS = new Set(['querySelector', 'querySelectorAll', 'closest', 'matches']);
	const isClassList = (n) =>
		n.type === 'MemberExpression' && !n.computed && n.property.name === 'classList';
	walk([ast.fragment, ...scripts], (node) => {
		if (node.type !== 'CallExpression' || node.callee.type !== 'MemberExpression' || node.callee.computed) return;
		const { object, property } = node.callee;
		if (TESTS.has(property.name) && ((object.type === 'Identifier' && tainted.has(object.name)) || isClassList(object))) {
			node.arguments.forEach((arg) => (arg.type === 'TemplateLiteral' ? template(arg) : literal(arg)));
		}
		if (SELECTS.has(property.name)) {
			for (const arg of node.arguments) {
				if (arg.type === 'Literal') literal(arg, renameSelector);
				if (arg.type === 'TemplateLiteral') template(arg, (text, offset) => renameSelector(text, offset));
			}
		}
	});

	/* Two passes may reach the same string (a class attribute and the variable
	   it reads): one edit per place. */
	const unique = [...new Map(edits.map((e) => [`${e.start}:${e.end}`, e])).values()].sort((a, b) => b.start - a.start);
	let out = src;
	for (const e of unique) out = out.slice(0, e.start) + e.text + out.slice(e.end);
	return { code: out, renamed: [...new Set(renamed)].sort() };
}
