<script module lang="ts">
	/** What .fieldset is made of, classified. Only this block differs between this
	    file and the copy generated for each family (scripts/gen-components.mjs):
	    an axis a family leaves empty loses its prop entirely. */
	export const PREFIX = 'fieldset';

	export const AXES = {} as const;

	export const FLAGS = [] as const;
	export const PARTS = ['legend', 'label'] as const;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLFieldsetAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../internal/variants.js';

	interface Props extends AxisProps<typeof AXES>, HTMLFieldsetAttributes {
		/** The group's heading. */
		legend?: Snippet;
		/** A note under the group. */
		label?: Snippet;
		class?: string;
		children?: Snippet;
	}

	let {
		legend,
		label,
		class: klass = '',
		children,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
</script>

<fieldset {...applied.rest} class={classes}>
	{#if legend}<legend class="fieldset-legend">{@render legend()}</legend>{/if}
	{@render children?.()}
	{#if label}<p class="fieldset-label">{@render label()}</p>{/if}
</fieldset>
