<script module lang="ts">
	/** What .radial-progress is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs). */
	export const PREFIX = 'radial-progress';

	export const AXES = {
		/* The ring takes its colour from the family, not from a variant. */
		size: ['xs', 'sm', 'md', 'lg', 'xl']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = [] as const;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, HTMLAttributes<HTMLDivElement> {
		/** 0–100. */
		value?: number;
		class?: string;
		children?: Snippet;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		value = 0,
		class: klass = '',
		children,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
</script>

<div
	{...applied.rest}
	class={classes}
	style:--value={value}
	role="progressbar"
	aria-valuenow={value}
>
	{#if children}{@render children()}{:else}{value}%{/if}
</div>
