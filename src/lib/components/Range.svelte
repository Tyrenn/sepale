<script module lang="ts">
	/** What .range is made of, classified. The props follow the
	    families the project registers (variants.ts, ADR 0015). */
	export const PREFIX = 'range';

	export const AXES = {
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		size: ['xs', 'sm', 'md', 'lg', 'xl']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = [] as const;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>, Omit<HTMLInputAttributes, 'size' | 'color' | 'type'> {
		/** Colour the control by its own validity and reveal `hint` when invalid. */
		validator?: boolean;
		/** Shown below once invalid. It must be the control's next sibling for the
		    CSS to reach it, which is why it is a prop rather than your markup. */
		hint?: Snippet;
		class?: string;
		value?: number;
		min?: number;
		max?: number;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		validator = false,
		hint,
		value = $bindable(0),
		min = 0,
		max = 100,
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, validator && 'validator', klass));

	/* How far the value is along the track, for a family that paints the
	   filled part itself (`data-fill`) rather than with the thumb's shadow. */
	let pct = $derived(max > min ? Math.min(100, Math.max(0, ((Number(value) - min) / (max - min)) * 100)) : 0);
</script>

<input type="range" {...applied.rest} {min} {max} class={classes} data-fill style:--range-pct="{pct}%" bind:value />
{#if hint}<p class="validator-hint">{@render hint()}</p>{/if}
