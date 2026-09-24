<script module lang="ts">
	/** What .navbar is made of, classified. Only this block differs between this
	    file and the copy generated for each family (scripts/gen-components.mjs):
	    an axis a family leaves empty loses its prop entirely. */
	export const PREFIX = 'navbar';

	export const AXES = {
		size: ['xs', 'sm', 'md', 'lg', 'xl']
	} as const;

	export const FLAGS = ['sticky'] as const;
	export const PARTS = ['start', 'center', 'end'] as const;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../internal/variants.js';

	interface Props extends AxisProps<typeof AXES>, HTMLAttributes<HTMLElement> {
		/** Let the bar follow the page instead of scrolling away. */
		sticky?: boolean;
		/** The three zones. start and end absorb the slack, so whatever is in
		    center stays centred while either side grows. */
		start?: Snippet;
		center?: Snippet;
		end?: Snippet;
		class?: string;
		children?: Snippet;
	}

	let {
		sticky = false,
		start,
		center,
		end,
		class: klass = '',
		children,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, axes));
	let classes = $derived(cx(PREFIX, applied.classes, sticky && `${PREFIX}-sticky`, klass));
</script>

<nav {...applied.rest} class={classes}>
	{#if start}<div class="navbar-start">{@render start()}</div>{/if}
	{#if center}<div class="navbar-center">{@render center()}</div>{/if}
	{#if end}<div class="navbar-end">{@render end()}</div>{/if}
	{@render children?.()}
</nav>
