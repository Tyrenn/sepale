<script module lang="ts">
	/** What .navbar is made of, classified. The props follow the
	    families the project registers (variants.ts, ADR 0015). */
	export const PREFIX = 'navbar';

	export const AXES = {
		size: ['xs', 'sm', 'md', 'lg', 'xl']
	} as const;

	export const FLAGS = {
		sticky: 'Let the bar follow the page instead of scrolling away.'
	} as const;
	export const PARTS = ['start', 'center', 'end'] as const;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>, HTMLAttributes<HTMLElement> {
		/** The three zones. start and end absorb the slack, so whatever is in
		    center stays centred while either side grows. */
		start?: Snippet;
		center?: Snippet;
		end?: Snippet;
		class?: string;
		children?: Snippet;
	}

	let {
		start,
		center,
		end,
		class: klass = '',
		children,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
</script>

<nav {...applied.rest} class={classes}>
	{#if start}<div class="navbar-start">{@render start()}</div>{/if}
	{#if center}<div class="navbar-center">{@render center()}</div>{/if}
	{#if end}<div class="navbar-end">{@render end()}</div>{/if}
	{@render children?.()}
</nav>
