<script module lang="ts">
	/** What .checkbox is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs). */
	export const PREFIX = 'checkbox';

	export const AXES = {
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		size: ['xs', 'sm', 'md', 'lg', 'xl'],
		/* A square checkbox where the family rounds them, and the other way round. */
		shape: ['square'],
		variant: ['outline']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = [] as const;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, Omit<HTMLInputAttributes, 'size' | 'color' | 'type'> {
		/** Colour the control by its own validity and reveal `hint` when invalid. */
		validator?: boolean;
		/** Shown below once invalid. It must be the control's next sibling for the
		    CSS to reach it, which is why it is a prop rather than your markup. */
		hint?: Snippet;
		class?: string;
		checked?: boolean;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		validator = false,
		hint,
		checked = $bindable(false),
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, validator && 'validator', klass));
</script>

<input type="checkbox" {...applied.rest} class={classes} bind:checked />
{#if hint}<p class="validator-hint">{@render hint()}</p>{/if}
