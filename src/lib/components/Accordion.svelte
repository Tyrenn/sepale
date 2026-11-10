<script module lang="ts">
	/** What .accordion is made of, classified. The props follow the
	    families the project registers (variants.ts, ADR 0015). */
	export const PREFIX = 'accordion';

	export const AXES = {} as const;

	export const FLAGS = {
		separate: 'Keep the collapses apart instead of joining their edges.'
	} as const;
	export const PARTS = [] as const;
</script>

<script lang="ts">
	/**
	 * A stack of Collapses. Put them in as children; with `exclusive`, opening
	 * one closes the others.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setAccordion } from './accordion-context.js';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>, HTMLAttributes<HTMLDivElement> {
		/** At most one collapse open at a time. */
		exclusive?: boolean;
		class?: string;
		children?: Snippet;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		exclusive = false,
		class: klass = '',
		children,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));

	setAccordion(() => exclusive);
</script>

<div {...applied.rest} class={classes}>
	{@render children?.()}
</div>
