<script module lang="ts">
	/** What .bubble is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs). */
	export const PREFIX = 'bubble';

	export const AXES = {
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		size: ['xs', 'sm', 'md', 'lg', 'xl']
	} as const;

	/* `end` is a flag, not a side axis: the start side is simply the bubble
	   with no class, and `no-tail` combines with either. */
	export const FLAGS = {
		end: 'Put the tail on the end side, and the bubble at the end of the line.',
		'no-tail': 'Drop the tail but keep its room: a follow-up message.'
	} as const;
	export const PARTS = [] as const;
</script>

<script lang="ts">
	/** A chat message: a fill, an ink, and a tail on one side. */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
		class?: string;
		children?: Snippet;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		class: klass = '',
		children,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
</script>

<div {...applied.rest} class={classes}>{@render children?.()}</div>
