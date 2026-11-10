<script module lang="ts">
	/** What .join is made of, classified. The props follow the
	    families the project registers (variants.ts, ADR 0015).

	    Each child must carry `join-item` for the seams to land; that class is
	    a part of this component, not a component of its own. */
	export const PREFIX = 'join';

	export const AXES = {
		/* Which way the seams run. */
		direction: ['horizontal', 'vertical']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = ['item'] as const;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>, HTMLAttributes<HTMLDivElement> {
		class?: string;
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

<div {...applied.rest} class={classes}>{@render children?.()}</div>
