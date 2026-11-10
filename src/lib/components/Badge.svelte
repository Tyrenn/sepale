<script module lang="ts">
	/** What .badge is made of, classified. The props follow the
	    families the project registers (variants.ts, ADR 0015). */
	export const PREFIX = 'badge';

	export const AXES = {
		/* Where the floating chip sits. Two axes, because a corner is two
		   independent choices — nothing else about a badge is styled. */
		align: ['start', 'center', 'end'],
		side: ['top', 'middle', 'bottom']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = [] as const;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>, HTMLAttributes<HTMLDivElement> {
		/** What the badge floats over. */
		children?: Snippet;
		/** The badge itself; rendered as a .chip pinned to the chosen corner. */
		badge?: Snippet;
		class?: string;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		class: klass = '',
		children,
		badge,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
</script>

<div {...applied.rest} class={classes}>
	{@render children?.()}
	{#if badge}<span class="chip">{@render badge()}</span>{/if}
</div>
