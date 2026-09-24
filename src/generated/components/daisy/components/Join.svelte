<script module lang="ts">
	/** What .join is made of, classified. Only this block differs between this
	    file and the copy generated for each family (scripts/gen-components.mjs):
	    an axis a family leaves empty loses its prop entirely.

	    Each child must carry `join-item` for the seams to land; that class is
	    a part of this component, not a component of its own. */
	export const PREFIX = 'join';

	export const AXES = {
		/* Which way the seams run. */
		direction: ['horizontal', 'vertical']
	} as const;

	export const FLAGS = [] as const;
	export const PARTS = ['item'] as const;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../internal/variants.js';

	interface Props extends AxisProps<typeof AXES>, HTMLAttributes<HTMLDivElement> {
		class?: string;
		children?: Snippet;
	}

	let {
		class: klass = '',
		children,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
</script>

<div {...applied.rest} class={classes}>{@render children?.()}</div>
