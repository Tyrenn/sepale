<script module lang="ts">
	/** What .title is made of, classified. */
	export const PREFIX = 'title';

	/* A title has ONE size — that is what makes it the title. Its colour is an
	   axis like every other component's, and the only reason text had none
	   before is that the file shipped no colour at all. */
	export const AXES = {
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error']
	} as const;

	export const FLAGS = [] as const;
	export const PARTS = [] as const;
</script>

<script lang="ts">
	/**
	 * The page's heading.
	 *
	 * `level` picks the TAG, nothing else — `<h1>` … `<h6>`, and no class
	 * changes. The semantic level and the visual size are two different
	 * questions, and welding them is exactly what a set of `<H1>` … `<H6>`
	 * components would do: an `<h3>` opening a section can legitimately be
	 * large, and a small `<h1>` is a real design. So the tag is yours and the
	 * look is the class.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../internal/variants.js';

	interface Props extends AxisProps<typeof AXES>, Omit<HTMLAttributes<HTMLHeadingElement>, 'color'> {
		/** Which heading tag to render. Purely semantic; the look never moves. */
		level?: 1 | 2 | 3 | 4 | 5 | 6;
		class?: string;
		children?: Snippet;
	}

	let { level = 1, class: klass = '', children, ...axes }: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
</script>

<svelte:element this={`h${level}`} class={classes} {...applied.rest}>
	{@render children?.()}
</svelte:element>
