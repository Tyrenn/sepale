<script module lang="ts">
	/** What .progress is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs). */
	export const PREFIX = 'progress';

	export const AXES = {
		/* No size axis: a progress bar answers to the width it is given. */
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = [] as const;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLProgressAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, Omit<HTMLProgressAttributes, 'color'> {
		class?: string;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		class: klass = '',
		value,
		max = 100,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
</script>

<progress {...applied.rest} class={classes} {value} {max}></progress>
