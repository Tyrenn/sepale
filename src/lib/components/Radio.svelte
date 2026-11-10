<script module lang="ts">
	/** What .radio is made of, classified. The props follow the
	    families the project registers (variants.ts, ADR 0015). */
	export const PREFIX = 'radio';

	export const AXES = {
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		size: ['xs', 'sm', 'md', 'lg', 'xl'],
		shape: ['square']
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
		/** The value this radio contributes when it is the one selected. */
		value?: string | number;
		/** Bound across the whole set: it holds the selected value. */
		group?: string | number;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		validator = false,
		hint,
		group = $bindable(),
		value,
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, validator && 'validator', klass));
</script>

<input type="radio" {...applied.rest} class={classes} bind:group {value} />
{#if hint}<p class="validator-hint">{@render hint()}</p>{/if}
