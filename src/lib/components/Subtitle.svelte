<script module lang="ts">
	/** What .subtitle is made of, classified. */
	export const PREFIX = 'subtitle';

	/* Two sizes, and they are the class suffix under a friendlier name: the
	   map form of an axis exists for exactly this (see variants.ts). */
	export const AXES = {
		s: ['1', '2'],
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = [] as const;
</script>

<script lang="ts">
	/**
	 * A heading under the title.
	 *
	 * `s` is the look, `level` is the tag. They are independent on purpose —
	 * see Title.svelte.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>, Omit<HTMLAttributes<HTMLHeadingElement>, 'color'> {
		/** Which heading tag to render. Purely semantic; the look never moves. */
		level?: 1 | 2 | 3 | 4 | 5 | 6;
		class?: string;
		children?: Snippet;
	}

	/* `s` is defaulted here rather than left out, because `.subtitle` alone is
	   not a class — the size IS the base class. */
	let { level = 2, s = '1', class: klass = '', children, ...axes }: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, { ...axes, s }));
	let classes = $derived(cx(applied.classes, klass));
</script>

<svelte:element this={`h${level}`} class={classes} {...applied.rest}>
	{@render children?.()}
</svelte:element>
