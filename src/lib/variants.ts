/**
 * The plumbing behind a component's AXES and FLAGS blocks — in THIS source
 * only. The copy of a component generated for a family has none of it: the
 * build writes its props and classes out by hand (scripts/gen-components.mjs).
 *
 * An AXIS is a group of mutually exclusive variants of one component, named
 * after what it impacts, written as the list of values its prop accepts. The
 * class a value writes follows two rules, and nothing else:
 *
 *   variant: ['outline', 'dash']   variant="dash"  →  .btn-dash
 *   shadow:  ['none', 'reverse']   shadow="none"   →  .btn-noshadow
 *   s:       ['1', '2', '3']       s="1"           →  .text-s1
 *
 * `none` writes `no<axis>`; a number writes `<axis><number>`; any other value
 * writes itself. No prop at all writes nothing: the component's default look.
 *
 * A FLAG is a class that excludes nothing, written by a boolean prop. FLAGS
 * maps each class suffix to the doc of its prop; the prop is the suffix in
 * camelCase (`image-full` → `imageFull`).
 */

/** One axis: the values its prop accepts. */
export type Axis = readonly string[];

/** One component's flags: class suffix → what the prop does. */
export type Flags = Readonly<Record<string, string>>;

/** The values an axis accepts. Empty axis → `never`. */
export type Values<A> = A extends readonly (infer V extends string)[] ? V : never;

/** `image-full` → `imageFull`. */
export type Camel<S extends string> = S extends `${infer H}-${infer T}`
	? `${H}${Capitalize<Camel<T>>}`
	: S;

/**
 * One optional prop per axis, typed to that axis's values — and NO prop at all
 * for an axis left empty — plus one boolean per flag.
 */
export type AxisProps<A extends Record<string, Axis>, F extends Flags = {}> = {
	[K in keyof A as [Values<A[K]>] extends [never] ? never : K]?: Values<A[K]>;
} & {
	[K in keyof F & string as Camel<K>]?: boolean;
} & {
	/**
	 * A one-off fill, BY VALUE — `background="#efb"`, not a token name.
	 *
	 * It writes `--<prefix>-bg` inline, the slot a component that paints a
	 * fill reads. It deliberately does NOT take a semantic: `color` is already
	 * the axis for that. A family's copy only has it when its stylesheet reads
	 * the slot.
	 */
	background?: string;
};

/** The class one axis value writes. See the rules above. */
export function axisClass(prefix: string, axis: string, value: string): string {
	if (value === 'none') return `${prefix}-no${axis}`;
	if (/^\d+$/.test(value)) return `${prefix}-${axis}${value}`;
	return `${prefix}-${value}`;
}

/** `image-full` → `imageFull`. */
export function camel(name: string): string {
	return name.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

/** Join truthy class fragments into a single class string. */
export function cx(...parts: Array<string | false | null | undefined>): string {
	return parts.filter(Boolean).join(' ');
}

/**
 * Resolve every axis and flag into class names, and hand back everything that
 * was NOT one so it can be spread onto the element.
 *
 * The component never names an axis individually — it passes the whole rest
 * object through here. A value outside its axis resolves to nothing, and every
 * axis and flag is removed from the rest, so none leaks out as a DOM attribute.
 */
export function applyAxes(
	prefix: string,
	axes: Record<string, Axis>,
	flags: Flags,
	props: Record<string, unknown>
): { classes: string; rest: Record<string, unknown> } {
	const out: string[] = [];
	const rest: Record<string, unknown> = { ...props };

	/* `background` is not an axis — it writes a value, not a class — but it
	   belongs here because `rest` is what every component spreads onto its
	   element. A caller's own `style` still wins by being written last. */
	const bg = rest.background;
	delete rest.background;
	if (typeof bg === 'string' && bg) {
		const own = typeof rest.style === 'string' ? rest.style : '';
		rest.style = `--${prefix}-bg: ${bg};` + (own ? ` ${own}` : '');
	}
	for (const [name, values] of Object.entries(axes)) {
		const value = rest[name];
		delete rest[name];
		if (typeof value === 'string' && values.includes(value)) out.push(axisClass(prefix, name, value));
	}
	for (const name of Object.keys(flags)) {
		const prop = camel(name);
		if (rest[prop]) out.push(`${prefix}-${name}`);
		delete rest[prop];
	}
	return { classes: out.join(' '), rest };
}
