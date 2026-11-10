/**
 * family-types.ts — the `.d.ts` a family's stylesheet carries (ADR 0015).
 *
 * One function, three callers: the build (scripts/gen-components.mjs, for every
 * family in src/scss), the app (a family loaded from disk, in its bundle), and
 * anyone holding only a stylesheet. The text is DERIVED from the family's
 * classification — which axis value, flag or part each of its classes is — and
 * never written by hand: a hand-written declaration could promise a variant the
 * stylesheet does not draw.
 *
 * Plain TypeScript with no imports and no syntax beyond annotations, so Node
 * runs it as it is (type stripping) and the browser gets it through Vite.
 */

/** How a component accounts for one class (src/lib/generated/components.ts). */
export interface ClassKind {
	kind: string;
	component?: string;
	axis?: string;
	value?: string;
}

/** What one component declares: its namespace and its flag suffixes. */
export interface ComponentDecl {
	prefix: string;
	flags: string[];
}

/** What a family ships, per component namespace. */
export type FamilyShape = Record<
	string,
	{
		/** axis → the values whose class the family draws. */
		axes: Record<string, string[]>;
		/** Flag class suffixes the family draws (`image-full`). */
		flags: string[];
		/** Whether the family reads the `--<prefix>-bg` slot `background` writes. */
		background: boolean;
	}
>;

/**
 * A family's shape, from its classified classes and its stylesheet. A component
 * appears as soon as the family draws any class of it; one it does not style at
 * all is absent, and so are its props.
 */
export function familyShape(
	classes: Record<string, ClassKind>,
	schema: Record<string, ComponentDecl>,
	css: string
): FamilyShape {
	const shape: FamilyShape = {};
	for (const [cls, info] of Object.entries(classes)) {
		const decl = info.component ? schema[info.component] : undefined;
		if (!decl) continue;
		const { prefix } = decl;
		const e = (shape[prefix] ??= { axes: {}, flags: [], background: css.includes(`var(--${prefix}-bg`) });
		if (info.kind === 'axis' && info.axis && info.value !== undefined) {
			(e.axes[info.axis] ??= []).push(info.value);
		} else if (info.kind === 'flag') {
			const suffix = cls.slice(prefix.length + 1);
			if (decl.flags.includes(suffix)) e.flags.push(suffix);
		}
	}
	for (const e of Object.values(shape)) {
		for (const values of Object.values(e.axes)) values.sort();
		e.flags.sort();
	}
	return shape;
}

const q = (s: string) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const union = (values: string[]) => (values.length ? values.map(q).join(' | ') : 'never');

/**
 * The text of `<family>.css.d.ts`: the family registered in the global
 * `Sepale.Families` interface that `AxisProps` (variants.ts) reads.
 */
export function familyTypes(family: string, shape: FamilyShape): string {
	const T = '\t';
	const lines = [
		`// ${family}.css — what this family draws, for @sepale/components.`,
		`// Generated from the stylesheet (ADR 0015): do not edit, regenerate it.`,
		`//`,
		`// Importing the stylesheet registers it: \`import '<path>/${family}.css'\` in any`,
		`// file narrows every component's props to what ${family} ships. To register it`,
		`// for its types only: \`import type {} from '<path>/${family}.css'\`.`,
		``,
		`declare global {`,
		`${T}namespace Sepale {`,
		`${T}${T}interface Families {`,
		`${T}${T}${T}${q(family)}: {`
	];
	for (const [prefix, { axes, flags, background }] of Object.entries(shape).sort(([a], [b]) => a.localeCompare(b))) {
		const axisText = Object.entries(axes)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([axis, values]) => `${q(axis)}: ${union(values)}`)
			.join('; ');
		lines.push(
			`${T}${T}${T}${T}${q(prefix)}: { axes: { ${axisText}${axisText ? ' ' : ''}}; flags: ${union(flags)}; background: ${background} };`
		);
	}
	lines.push(`${T}${T}${T}};`, `${T}${T}}`, `${T}}`, `}`, ``, `export {};`, ``);
	return lines.join('\n');
}
