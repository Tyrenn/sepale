/**
 * states.mjs — which states a stylesheet draws, class by class.
 *
 * A family styles a component's classes, but also the states its DOM goes
 * through: `.tabs-item[aria-selected="true"]`, `.checkbox:checked`,
 * `.dialog[open]`. Those are part of the contract as much as the classes are,
 * and the component pages and the family kit list them. They are read here
 * from the compiled CSS, like everything else (src/routes/README.md).
 *
 * What counts as a state: an attribute selector, or a pseudo-class in STATE,
 * written directly on the class — `.btn:disabled`, or inside a `:not()`,
 * `:is()` or `:where()` on it. A `:has(…)` is about a descendant, so it is not
 * a state of this element and is skipped. Pseudo-elements are not states.
 *
 * A linear scan, on purpose: a regex nesting quantifiers over a 400 kB
 * stylesheet backtracks for minutes.
 */

/* Pseudo-classes that describe a state the element is in. Structural ones
   (`:first-child`, `:nth-of-type`) are layout, not state. */
export const STATE = new Set([
	'hover', 'focus', 'focus-visible', 'focus-within', 'active',
	'disabled', 'enabled', 'checked', 'indeterminate', 'default',
	'invalid', 'valid', 'user-invalid', 'user-valid', 'required', 'optional',
	'placeholder-shown', 'read-only', 'read-write', 'autofill',
	'in-range', 'out-of-range', 'empty', 'target',
	'popover-open', 'open', 'modal'
]);

const WORD = /[\w-]/;
const IDENT = /[a-z0-9-]/;

/** Index just past the bracket matching the one at `at` (`[` or `(`). */
function close(css, at) {
	const open = css[at];
	const shut = open === '[' ? ']' : ')';
	let depth = 0;
	for (let i = at; i < css.length; i++) {
		if (css[i] === open) depth++;
		else if (css[i] === shut && --depth === 0) return i + 1;
		else if (css[i] === '{' || css[i] === '}') return i; /* malformed: stop at the block */
	}
	return css.length;
}

/** The states written in a selector fragment (the inside of `:not()`…). */
function statesOf(fragment, into) {
	for (let i = 0; i < fragment.length; i++) {
		const ch = fragment[i];
		if (ch === '[') {
			const end = close(fragment, i);
			into.add(normalise(fragment.slice(i, end)));
			i = end - 1;
		} else if (ch === ':' && fragment[i + 1] !== ':' && fragment[i - 1] !== ':') {
			let j = i + 1;
			while (j < fragment.length && IDENT.test(fragment[j])) j++;
			const name = fragment.slice(i + 1, j);
			if (name === 'has' && fragment[j] === '(') {
				i = close(fragment, j) - 1;
				continue;
			}
			if (STATE.has(name)) into.add(`:${name}`);
			i = j - 1;
		}
	}
}

/** `[ aria-selected = 'true' ]` → `[aria-selected="true"]`. */
const normalise = (attr) => attr.replace(/\s+/g, '').replace(/'/g, '"');

/**
 * class name → the states the stylesheet draws on it.
 * @param {string} css a compiled stylesheet
 * @returns {Map<string, Set<string>>}
 */
export function statesIn(css) {
	const clean = css
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/url\([^)]*\)/g, '')
		.replace(/"[^"\n]*"|'[^'\n]*'/g, (s) => (s.length < 40 ? s : '""'));
	const out = new Map();
	for (let i = 0; i < clean.length; i++) {
		if (clean[i] !== '.' || WORD.test(clean[i - 1] ?? ' ') || !/[a-z]/.test(clean[i + 1] ?? '')) continue;
		let j = i + 1;
		while (j < clean.length && IDENT.test(clean[j])) j++;
		const cls = clean.slice(i + 1, j);
		/* The chain of qualifiers right after the class, up to a combinator. */
		const states = new Set();
		let k = j;
		for (;;) {
			const ch = clean[k];
			if (ch === '[') {
				const end = close(clean, k);
				states.add(normalise(clean.slice(k, end)));
				k = end;
			} else if (ch === ':' && clean[k + 1] === ':') {
				k += 2;
				while (k < clean.length && IDENT.test(clean[k])) k++;
				if (clean[k] === '(') k = close(clean, k);
			} else if (ch === ':') {
				let n = k + 1;
				while (n < clean.length && IDENT.test(clean[n])) n++;
				const name = clean.slice(k + 1, n);
				if (clean[n] === '(') {
					const end = close(clean, n);
					if (name === 'not' || name === 'is' || name === 'where') statesOf(clean.slice(n + 1, end - 1), states);
					k = end;
				} else {
					if (STATE.has(name)) states.add(`:${name}`);
					k = n;
				}
			} else if (ch === '.') {
				/* A compound `.a.b`: the next class is read on its own turn. */
				break;
			} else break;
		}
		if (!states.size) continue;
		const seen = out.get(cls) ?? new Set();
		for (const s of states) seen.add(s);
		out.set(cls, seen);
	}
	return out;
}
