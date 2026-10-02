/**
 * The plumbing behind a component's AXES block.
 *
 * An AXIS is a group of mutually exclusive variants of one component, named
 * after what it impacts. It is written either as a list — the value IS the
 * class suffix — or as a map when the value we want to write and the class the
 * family ships are not the same word:
 *
 *   shape:  ['square', 'circle']            → shape="circle"  →  .btn-circle
 *   shadow: { none: 'noshadow', … }         → shadow="none"   →  .btn-noshadow
 *
 * Each family gets a copy of the component with the same block, filtered down
 * to the classes that family actually ships (scripts/gen-components.mjs). An
 * axis that ends up empty loses its prop entirely — see AxisProps.
 */

/** One axis: a list of suffixes, or a map of value → suffix. */
export type Axis = readonly string[] | Readonly<Record<string, string>>;

/** The values an axis accepts. Empty axis → `never`. */
export type Values<A> =
	A extends readonly (infer V extends string)[] ? V : Extract<keyof A, string>;

/**
 * One optional prop per axis, typed to that axis's values — and NO prop at all
 * for an axis a family left empty, which is what makes a narrowed copy narrow
 * without anyone rewriting the interface.
 */
export type AxisProps<T extends Record<string, Axis>> = {
	[K in keyof T as [Values<T[K]>] extends [never] ? never : K]?: Values<T[K]>;
} & {
	/**
	 * A one-off fill, BY VALUE — `background="#efb"`, not a token name.
	 *
	 * It writes `--<prefix>-bg` inline, the slot a component that paints a
	 * fill reads. It deliberately does NOT take a semantic: `color` is already
	 * the axis for that, and two ways to say "primary" is one too many.
	 *
	 * Only a component whose base reads `--<prefix>-bg` answers it — today
	 * `btn`, `chip`, `menu`, `navbar`, `range` (the empty track) and `card`.
	 * Anywhere else it is inert.
	 *
	 * Resolved in `applyAxes`, so no component declares this prop and not one
	 * of them had to be edited to gain it.
	 */
	background?: string;
};

/** Join truthy class fragments into a single class string. */
export function cx(...parts: Array<string | false | null | undefined>): string {
	return parts.filter(Boolean).join(' ');
}

/**
 * Resolve the chosen value of every axis into class names, and hand back
 * everything that was NOT an axis so it can be spread onto the element.
 *
 * The component never names an axis individually — it passes the whole rest
 * object through here. That is what lets a family's copy drop an axis without
 * anything outside the AXES block changing: there is no destructured variable
 * left pointing at a prop that no longer exists.
 *
 * A value the family does not ship resolves to nothing, so a narrowed copy
 * cannot emit a class its stylesheet has never heard of; and every axis name
 * is removed from the rest, so a variant never leaks out as a DOM attribute.
 */
export function applyAxes(
	prefix: string,
	axes: Record<string, Axis>,
	props: Record<string, unknown>
): { classes: string; rest: Record<string, unknown> } {
	const out: string[] = [];
	const rest: Record<string, unknown> = { ...props };

	/* `background` is not an axis — it writes a value, not a class — but it
	   belongs here because `rest` is what every component spreads onto its
	   element. Folding it into `style` gives all of them the prop with no
	   per-component change, and a caller's own `style` still wins by being
	   written last. */
	const bg = rest.background;
	delete rest.background;
	if (typeof bg === 'string' && bg) {
		const own = typeof rest.style === 'string' ? rest.style : '';
		rest.style = `--${prefix}-bg: ${bg};` + (own ? ` ${own}` : '');
	}
	for (const name of Object.keys(axes)) {
		const value = rest[name];
		delete rest[name];
		if (typeof value !== 'string' || !value) continue;
		const axis = axes[name];
		const suffix = Array.isArray(axis)
			? (axis as readonly string[]).includes(value)
				? value
				: undefined
			: (axis as Record<string, string>)[value];
		if (suffix) out.push(`${prefix}-${suffix}`);
	}
	return { classes: out.join(' '), rest };
}
