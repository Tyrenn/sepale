/**
 * family-component.mjs — write one component out for one family, by hand.
 *
 * A component in src/lib/components/ is GENERIC: it declares its axes and flags
 * in blocks and resolves them at run time through src/lib/variants.ts, because
 * the app shows every family at once. The copy a consumer downloads must not
 * be: it reads as if it had been written for that family alone —
 *
 *   interface Props extends Omit<HTMLButtonAttributes, 'color'> {
 *     color?: 'primary' | 'secondary';
 *     variant?: 'outline' | 'dash';
 *     …
 *   }
 *   let { color, variant, …, ...rest }: Props = $props();
 *   let classes = $derived(['btn', color && `btn-${color}`, …, klass]);
 *
 * — with no AXES, no applyAxes, no AxisProps, no cx, and no import of anything
 * local. One file, nothing else to carry.
 *
 * It is a rewrite of the source, not a template, so a component keeps its own
 * markup and logic. The rewrite leans on the hooks every source writes the same
 * way, and THROWS when one is missing rather than emit a copy that half works:
 *
 *   import { applyAxes, cx, type AxisProps } from '../variants.js';
 *   interface Props extends AxisProps<typeof AXES, typeof FLAGS>, … {
 *   let { …, ...axes }: Props = $props();
 *   let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, …));
 *   … applied.classes … {...applied.rest} …
 */

const NL = '\n';

const VARIANTS_IMPORT = "import { applyAxes, cx, type AxisProps } from '../variants.js';";
const AXIS_PROPS = 'AxisProps<typeof AXES, typeof FLAGS>';

/** The class suffix one axis value writes — the same rules as variants.ts. */
export const axisSuffix = (axis, value) =>
	value === 'none' ? `no${axis}` : /^\d+$/.test(value) ? `${axis}${value}` : value;

/** `image-full` → `imageFull`. */
export const camel = (name) => name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

const IDENT = /^[A-Za-z_$][\w$]*$/;

/** Index just past the bracket matching the one at `open`. Strings are skipped,
 *  so a `)` inside a template literal does not close a call. */
function matchBracket(src, open) {
	const pairs = { '(': ')', '[': ']', '{': '}' };
	const stack = [pairs[src[open]]];
	for (let i = open + 1; i < src.length; i++) {
		const ch = src[i];
		if (ch === "'" || ch === '"' || ch === '`') {
			i = skipString(src, i);
			continue;
		}
		/* A comment is not code: "the family's" must not open a string. */
		if (ch === '/' && src[i + 1] === '/') {
			const nl = src.indexOf(NL, i);
			i = nl < 0 ? src.length : nl;
			continue;
		}
		if (ch === '/' && src[i + 1] === '*') {
			i = src.indexOf('*/', i + 2) + 1;
			continue;
		}
		if (pairs[ch]) stack.push(pairs[ch]);
		else if (ch === stack[stack.length - 1]) {
			stack.pop();
			if (!stack.length) return i + 1;
		}
	}
	throw new Error('unbalanced bracket');
}

/** Index of the closing quote of the string opening at `at`. */
function skipString(src, at) {
	const q = src[at];
	for (let i = at + 1; i < src.length; i++) {
		if (src[i] === '\\') i++;
		else if (q === '`' && src[i] === '$' && src[i + 1] === '{') i = matchBracket(src, i + 1) - 1;
		else if (src[i] === q) return i;
	}
	return src.length;
}

/** Remove an `export const NAME = <literal> as const;` declaration. */
function dropConst(src, name) {
	const at = src.indexOf(`export const ${name} =`);
	if (at < 0) return src;
	const open = at + src.slice(at).search(/[[{'"]/);
	const end = src[open] === "'" || src[open] === '"' ? skipString(src, open) + 1 : matchBracket(src, open);
	const semi = src.indexOf(';', end);
	return src.slice(0, at) + src.slice(semi + 1);
}

/**
 * Strip comments from a script. A JSDoc comment inside an interface body is
 * kept — it documents a prop, and it is what a consumer's editor shows — and
 * every other comment goes: it was written about the generic source, and most
 * of it would be wrong here. A comment alone on its line takes the line with it.
 */
function stripComments(src) {
	const keep = [];
	for (const m of src.matchAll(/\binterface\s+\w+[^{]*\{/g)) {
		const open = m.index + m[0].length - 1;
		keep.push([open, matchBracket(src, open)]);
	}
	const inInterface = (i) => keep.some(([a, b]) => i > a && i < b);

	let out = '';
	for (let i = 0; i < src.length; i++) {
		const ch = src[i];
		if (ch === "'" || ch === '"' || ch === '`') {
			const end = skipString(src, i);
			out += src.slice(i, end + 1);
			i = end;
			continue;
		}
		const line = ch === '/' && src[i + 1] === '/';
		const block = ch === '/' && src[i + 1] === '*';
		if (!line && !block) {
			out += ch;
			continue;
		}
		const end = line
			? (src.indexOf(NL, i) < 0 ? src.length : src.indexOf(NL, i))
			: src.indexOf('*/', i + 2) + 2;
		if (block && src[i + 2] === '*' && inInterface(i)) {
			out += src.slice(i, end);
			i = end - 1;
			continue;
		}
		/* Alone on its line(s): drop the whole line, newline included. */
		const lineStart = out.lastIndexOf(NL) + 1;
		const before = out.slice(lineStart);
		const after = src.slice(end, src.indexOf(NL, end) < 0 ? src.length : src.indexOf(NL, end));
		if (!before.trim() && !after.trim()) {
			out = out.slice(0, lineStart);
			i = end + after.length; // lands on the newline, which the loop skips
		} else {
			out = out.replace(/[ \t]+$/, '');
			i = end - 1;
		}
	}
	return out;
}

/** `cx(a, b)` → `[a, b]`, everywhere. Svelte's `class` takes an array. */
function cxToArrays(src) {
	let at;
	while ((at = src.search(/\bcx\(/)) >= 0) {
		const open = at + 2;
		const close = matchBracket(src, open);
		src = src.slice(0, at) + '[' + src.slice(open + 1, close - 1) + ']' + src.slice(close);
	}
	return src;
}

/** The expression one axis contributes to the class list, written out. */
function axisEntry(prefix, axis, values) {
	const plain = values.filter((v) => v !== 'none');
	const numeric = plain.filter((v) => /^\d+$/.test(v));
	if (numeric.length && numeric.length !== plain.length) {
		throw new Error(`axis ${axis}: mixes numbers and words, which no class rule covers`);
	}
	const tpl = numeric.length ? `\`${prefix}-${axis}\${${axis}}\`` : `\`${prefix}-\${${axis}}\``;
	const word = plain.length ? `${axis} && ${tpl}` : null;
	if (!values.includes('none')) return word;
	const none = `'${prefix}-no${axis}'`;
	return word ? `${axis} === 'none' ? ${none} : ${word}` : `${axis} === 'none' && ${none}`;
}

/** Replace `token` in `src` by `items`: one per line if the token sits on its
 *  own line in a list, comma-joined in place otherwise, removed if empty. */
function spliceList(src, token, items) {
	const own = new RegExp(`^([ \\t]*)${token.replace(/[.$]/g, '\\$&')},[ \\t]*\\n`, 'm');
	const m = src.match(own);
	if (m) return src.replace(own, items.map((it) => `${m[1]}${it},${NL}`).join(''));
	if (!items.length) {
		return src.replace(`${token}, `, '').replace(`, ${token}`, '').replace(token, '');
	}
	return src.replace(token, items.join(', '));
}

/**
 * Write `src` out for one family.
 *
 * @param {object} c
 * @param {string} c.src      the generic source
 * @param {string} c.name     the component name, for the header
 * @param {string} c.prefix
 * @param {Record<string, string[]>} c.allAxes   every axis the source declares
 * @param {Record<string, string[]>} c.axes      what the family ships, in order
 * @param {Record<string, string>} c.allFlags    every flag → its doc
 * @param {string[]} c.flags                     the flags the family ships
 * @param {boolean} c.background                 does the family read --<prefix>-bg
 * @param {string} family
 */
export function familyComponent(c, family) {
	const fail = (what) => {
		throw new Error(`${c.name}: ${what}`);
	};
	const { prefix } = c;

	const moduleRe = /<script module lang="ts">\n?([\s\S]*?)<\/script>\n*/;
	const instanceRe = /(<script lang="ts"[^>]*>)([\s\S]*?)(<\/script>)/;
	let moduleScript = c.src.match(moduleRe)?.[1] ?? '';
	const inst = c.src.match(instanceRe) ?? fail('no instance script');
	let script = inst[2];
	let markup = c.src.replace(moduleRe, '').replace(instanceRe, '\u0000');

	/* ── the module block: what classified the classes goes, the rest stays ── */
	for (const name of ['PREFIX', 'AXES', 'FLAGS', 'PARTS']) moduleScript = dropConst(moduleScript, name);
	moduleScript = stripComments(moduleScript).replace(/\n{3,}/g, NL + NL);

	/* ── the props ── */
	if (!script.includes(VARIANTS_IMPORT)) fail(`expected \`${VARIANTS_IMPORT}\``);
	script = script.replace(new RegExp(`[ \\t]*${VARIANTS_IMPORT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n`), '');

	const live = [
		...Object.keys(c.axes),
		...c.flags.map(camel),
		...(c.background ? ['background'] : [])
	];
	const generic = [...Object.keys(c.allAxes), ...Object.keys(c.allFlags).map(camel), 'background'];
	for (const name of live) if (!IDENT.test(name)) fail(`prop "${name}" is not an identifier`);

	const iface = script.search(/\binterface Props\b/);
	if (iface < 0) fail('no `interface Props`');
	const bodyOpen = script.indexOf('{', iface);
	let head = script.slice(iface, bodyOpen);
	if (!head.includes(AXIS_PROPS)) fail(`Props does not extend \`${AXIS_PROPS}\``);
	head = head.replace(new RegExp(`${AXIS_PROPS.replace(/[<>]/g, '\\$&')},\\s*`), '');
	/* An Omit only ever excluded an HTML attribute because an axis or a flag
	   took its name. Where the family has no such prop, the attribute is back. */
	head = head.replace(/Omit<([\s\S]*?),\s*((?:'[^']*'\s*\|?\s*)+)>/, (all, type, names) => {
		const kept = [...names.matchAll(/'([^']*)'/g)]
			.map((m) => m[1])
			.filter((n) => !generic.includes(n) || live.includes(n));
		return kept.length ? `Omit<${type}, ${kept.map((n) => `'${n}'`).join(' | ')}>` : type;
	});
	head = head.replace(/\s+extends\s*$/, ' ');

	const members = [
		...Object.entries(c.axes).map(([a, vs]) => `${a}?: ${vs.map((v) => `'${v}'`).join(' | ')};`),
		...c.flags.flatMap((f) => [`/** ${c.allFlags[f]} */`, `${camel(f)}?: boolean;`]),
		...(c.background
			? ['/** A one-off fill, by value: `background="#efb"`. */', 'background?: string;']
			: [])
	];
	script =
		script.slice(0, iface) +
		head +
		'{' +
		members.map((m) => `${NL}\t\t${m}`).join('') +
		script.slice(bodyOpen + 1);

	/* ── the destructuring ── */
	const restAt = script.indexOf('...axes');
	if (restAt < 0) fail('no `...axes` in the props destructuring');
	const destructured = script.slice(script.lastIndexOf('let {', restAt), restAt);
	const names = [
		...Object.keys(c.axes).filter((a) => !new RegExp(`\\b${a}\\s*[=,]`).test(destructured)),
		...c.flags.map((f) => `${camel(f)} = false`),
		...(c.background ? ['background', 'style'] : [])
	];
	/* The style props go first, the rest last — as one would write them. */
	script = script.slice(0, restAt) + '...rest' + script.slice(restAt + 7);
	const openAt = script.lastIndexOf('let {', restAt) + 'let {'.length;
	if (names.length) {
		const multiline = script[openAt] === NL;
		const indent = multiline ? script.slice(openAt + 1).match(/^[ \t]*/)[0] : '';
		script = multiline
			? script.slice(0, openAt + 1) + names.map((n) => `${indent}${n},${NL}`).join('') + script.slice(openAt + 1)
			: script.slice(0, openAt) + ' ' + names.map((n) => `${n},`).join(' ') + script.slice(openAt);
	}

	/* ── the classes and the style ── */
	const applied = /^([ \t]*)let applied = \$derived\(applyAxes\([\s\S]*?\)\);\n/m;
	const am = script.match(applied) ?? fail('no `let applied = $derived(applyAxes(…))`');
	script = script.replace(
		applied,
		c.background
			? `${am[1]}let styles = $derived(background ? \`--${prefix}-bg: \${background};\${style ? \` \${style}\` : ''}\` : style);${NL}`
			: ''
	);
	const entries = [
		...Object.entries(c.axes).map(([a, vs]) => axisEntry(prefix, a, vs)),
		...c.flags.map((f) => `${camel(f)} && '${prefix}-${f}'`)
	];

	let out = markup.replace('\u0000', `${inst[1]}${script}${inst[3]}`);
	/* In the script or straight in the markup (`class={cx(PREFIX, applied.classes, klass)}`). */
	if (!out.includes('applied.classes')) fail('no `applied.classes`');
	out = spliceList(out, 'applied.classes', entries);
	if (!out.includes('applied.rest')) fail('no `applied.rest`');
	out = c.background
		? out
				.replace(/^([ \t]*)\{\.\.\.applied\.rest\}[ \t]*\n/m, `$1{...rest}${NL}$1style={styles}${NL}`)
				.replace(/\{\.\.\.applied\.rest\}/g, '{...rest} style={styles}')
		: out.replace(/\{\.\.\.applied\.rest\}/g, '{...rest}');

	/* ── what is left of the generic source ── */
	out = cxToArrays(out)
		.replace(/`\$\{PREFIX\}(-[\w-]+)?`/g, (_, rest = '') => `'${prefix}${rest}'`)
		.replace(/\$\{PREFIX\}/g, prefix)
		.replace(/\bPREFIX\b/g, `'${prefix}'`);

	/* Comments: the script keeps the JSDoc of its props, the markup keeps only
	   its `svelte-ignore`s, which are instructions to the compiler. */
	out = out
		.replace(instanceRe, (_, open, body, close) => open + stripComments(body) + close)
		.replace(/^[ \t]*<!--(?!\s*svelte-ignore)[\s\S]*?-->[ \t]*\n/gm, '')
		.replace(/<!--(?!\s*svelte-ignore)[\s\S]*?-->/g, '');

	for (const leftover of ['AXES', 'FLAGS', 'applied', 'applyAxes', 'AxisProps', 'axes', 'cx']) {
		if (new RegExp(`(^|[^\\w.-])${leftover}\\b(?!-)`).test(out + moduleScript)) {
			fail(`\`${leftover}\` is still referenced after the rewrite`);
		}
	}

	const header = `<!-- ${c.name} — ${family}. Generated by Sepale; edit freely. -->`;
	const mod = moduleScript.trim() ? `<script module lang="ts">${NL}\t${moduleScript.trim()}${NL}</script>${NL}${NL}` : '';
	return (header + NL + mod + out.replace(/^\s+/, ''))
		/* What the rewrite leaves behind, tidied the way a person would write it:
		   a constant class is an attribute, a list opens on its call's line,
		   and no blank line closes a script. */
		.replace(/=\{'([^'{}]*)'\}/g, '="$1"')
		.replace(/interface Props\n\s+extends /, 'interface Props extends ')
		.replace(/\(\n(\t*)\[\n([\s\S]*?)\n\1\]\n\t*\)/g, (_, ind, body) =>
			`([${NL}${body.replace(/^\t/gm, '')}${NL}${ind.slice(1)}])`
		)
		.replace(/\n\n+(<\/script>)/g, `${NL}$1`)
		.replace(/[ \t]+$/gm, '')
		.replace(/\n{3,}/g, NL + NL)
		.replace(/([{([])\n\n/g, `$1${NL}`)
		.trimEnd() + NL;
}
