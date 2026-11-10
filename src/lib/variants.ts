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

/* ── The family registry (ADR 0015) ────────────────────────────────────────
   A family's stylesheet carries a `<family>.css.d.ts` (written by
   family-types.ts) that adds the family to `Sepale.Families`. Importing the
   stylesheet loads it, and every component's props narrow to what the
   registered families ship. Nothing registered: the props stay generic. */
declare global {
	namespace Sepale {
		/** family → component namespace → what the family draws. Filled by the
		 *  families' `.css.d.ts`, never by hand. */
		interface Families {}
		/** `portable: true` keeps only what EVERY registered family ships (the
		 *  intersection), so switching between them never breaks a build. By
		 *  default a prop accepts what ANY of them ships (the union). */
		interface Config {}
	}
}

/** The registered families' names; `never` when none is. */
type Registered = keyof Sepale.Families;
type Portable = Sepale.Config extends { portable: true } ? true : false;

/** A namespace a family does not style: nothing drawn. (Not `never`, which
 *  would satisfy every `extends` test below.) */
type Unstyled = { axes: {}; flags: never; background: false };
/** What family `Fam` draws for namespace `P`. */
type Entry<Fam, P extends string> = Fam extends Registered
	? P extends keyof Sepale.Families[Fam]
		? Sepale.Families[Fam][P]
		: Unstyled
	: Unstyled;
/** The values of axis `K` family `Fam` ships (distributes over `Fam`). */
type FamValues<Fam, P extends string, K> = Fam extends Registered
	? Entry<Fam, P> extends { axes: infer X }
		? K extends keyof X
			? X[K]
			: never
		: never
	: never;
/** The flag suffixes family `Fam` draws (distributes over `Fam`). */
type FamFlags<Fam, P extends string> = Fam extends Registered
	? Entry<Fam, P> extends { flags: infer L }
		? L
		: never
	: never;
/** `true` for each registered family that reads the `--<P>-bg` slot. */
type FamBackground<Fam, P extends string> = Fam extends Registered
	? Entry<Fam, P> extends { background: true }
		? true
		: false
	: never;

/** Whether props narrow at all: a namespace is given and a family registered. */
type Narrows<P extends string> = [P] extends [never] ? false : [Registered] extends [never] ? false : true;

/** Of an axis's values, what the registered families accept: any of them
 *  (union), or every one of them when portable (intersection). */
type AcceptedValues<P extends string, K, Wide> =
	Narrows<P> extends false
		? Wide
		: Portable extends true
			? Exclude<Wide, { [Fam in Registered]: Exclude<Wide, FamValues<Fam, P, K>> }[Registered]>
			: Extract<FamValues<Registered, P, K>, Wide>;
/** `K` if the registered families draw flag `K`, else `never`. */
type AcceptedFlag<P extends string, K> =
	Narrows<P> extends false
		? K
		: Portable extends true
			? Exclude<K, { [Fam in Registered]: Exclude<K, FamFlags<Fam, P>> }[Registered]>
			: Extract<FamFlags<Registered, P>, K>;
/** Whether `background` is offered: some registered family reads the slot
 *  (every one, when portable). */
type HasBackground<P extends string> =
	Narrows<P> extends false
		? true
		: Portable extends true
		? false extends FamBackground<Registered, P>
			? false
			: [FamBackground<Registered, P>] extends [never]
				? false
				: true
		: true extends FamBackground<Registered, P>
			? true
			: false;

/**
 * One optional prop per axis, typed to that axis's values — and NO prop at all
 * for an axis left empty — plus one boolean per flag, and `background`.
 *
 * `P` is the component's namespace (`typeof PREFIX`). With it, the props follow
 * the registered families (see `Sepale.Families` above): an axis value, a flag
 * or `background` the families do not draw is not offered. Without a
 * registered family — or without `P` — they are the full, generic set.
 */
export type AxisProps<A extends Record<string, Axis>, F extends Flags = {}, P extends string = never> = {
	[K in keyof A as [AcceptedValues<P, K, Values<A[K]>>] extends [never] ? never : K]?: AcceptedValues<
		P,
		K,
		Values<A[K]>
	>;
} & {
	[K in keyof F & string as [AcceptedFlag<P, K>] extends [never] ? never : Camel<K>]?: boolean;
} & (HasBackground<P> extends true
		? {
				/**
				 * A one-off fill, BY VALUE — `background="#efb"`, not a token name.
				 *
				 * It writes `--<prefix>-bg` inline, the slot a component that paints a
				 * fill reads. It deliberately does NOT take a semantic: `color` is
				 * already the axis for that. Offered only when a registered family
				 * reads the slot.
				 */
				background?: string;
			}
		: {});

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
