<script module lang="ts">
	/** What .stats is made of, classified. */
	export const PREFIX = 'stats';

	export const AXES = {
		direction: ['horizontal', 'vertical']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = [] as const;
</script>

<script lang="ts">
	/**
	 * Several stats in one frame, a divider between each. The stats inside put
	 * their own frame down; a row by default.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>, HTMLAttributes<HTMLDivElement> {
		class?: string;
		/** The `Stat`s. */
		children?: Snippet;
	}

	let {
		class: klass = '',
		children,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
</script>

<div class={classes} {...applied.rest}>{@render children?.()}</div>
