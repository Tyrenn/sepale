<script module lang="ts">
	/** What .loading is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs). */
	export const PREFIX = 'loading';

	export const AXES = {
		size: ['xs', 'sm', 'md', 'lg', 'xl'],
		/* Which indicator is drawn. They share nothing but the name, so this is
		   one exclusive axis with no better word than `variant`. */
		variant: ['spinner', 'dots', 'ring', 'ball', 'bars', 'infinity']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = [] as const;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, HTMLAttributes<HTMLSpanElement> {
		class?: string;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
</script>

<span {...applied.rest} class={classes}></span>
