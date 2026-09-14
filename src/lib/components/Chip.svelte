<script module lang="ts">
	/** What .chip is made of, classified. Only this block differs between this
	    file and the copy generated for each family (scripts/gen-components.mjs):
	    an axis a family leaves empty loses its prop entirely. */
	export const PREFIX = 'chip';

	export const AXES = {
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		size: ['xs', 'sm', 'md', 'lg', 'xl'],
		/* Fill and border treatments. The family ships them as flat combinations
		   rather than orthogonal axes, so they are one axis — and `variant` is the
		   name kept for an exclusive group with no better one. */
		variant: ['outline', 'dash', 'soft', 'ghost']
	} as const;

	export const FLAGS = ['clickable'] as const;
	export const PARTS = [] as const;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../internal/variants.js';

	interface Props extends AxisProps<typeof AXES>, Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
		/** Draw it as something you can act on (gladiolus only). */
		clickable?: boolean;
		class?: string;
		children?: Snippet;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		clickable = false,
		class: klass = '',
		children,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, axes));
	let classes = $derived(cx(PREFIX, applied.classes, clickable && `${PREFIX}-clickable`, klass));
</script>

<span {...applied.rest} class={classes}>{@render children?.()}</span>
