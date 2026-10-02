<script module lang="ts">
	/** What .breadcrumbs is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs). */
	export const PREFIX = 'breadcrumbs';

	export const AXES = {
		size: ['xs', 'sm', 'md', 'lg', 'xl']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = [] as const;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, HTMLAttributes<HTMLElement> {
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

<nav {...applied.rest} class={classes}>
	<ul>{@render children?.()}</ul>
</nav>
