<script module lang="ts">
	/** What .skeleton is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs). */
	export const PREFIX = 'skeleton';

	export const AXES = {
		/* A block by default; `text` makes it a line of type instead. */
		variant: ['text']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = [] as const;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, HTMLAttributes<HTMLDivElement> {
		/** Repeat the placeholder this many times, stacked. */
		lines?: number;
		class?: string;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		lines = 1,
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
</script>

{#each { length: lines } as _, i (i)}
	<div {...applied.rest} class={classes}></div>
{/each}
