<script module lang="ts">
	/** What .fieldset is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs). */
	export const PREFIX = 'fieldset';

	export const AXES = {} as const;

	export const FLAGS = {} as const;
	export const PARTS = ['legend', 'label'] as const;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLFieldsetAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, HTMLFieldsetAttributes {
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

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
</script>

<fieldset {...applied.rest} class={classes}>
	{#if legend}<legend class="fieldset-legend">{@render legend()}</legend>{/if}
	{@render children?.()}
	{#if label}<p class="fieldset-label">{@render label()}</p>{/if}
</fieldset>
