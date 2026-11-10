<script module lang="ts">
	/** What .fieldset is made of, classified. The props follow the
	    families the project registers (variants.ts, ADR 0015). */
	export const PREFIX = 'fieldset';

	export const AXES = {} as const;

	export const FLAGS = {} as const;
	export const PARTS = ['legend', 'label'] as const;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLFieldsetAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>, HTMLFieldsetAttributes {
		/** The group's heading. */
		legend?: string | Snippet;
		/** A note under the group. */
		label?: string | Snippet;
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
	{#if legend}<legend class="fieldset-legend">{#if typeof legend === 'function'}{@render legend()}{:else}{legend}{/if}</legend>{/if}
	{@render children?.()}
	{#if label}<p class="fieldset-label">{#if typeof label === 'function'}{@render label()}{:else}{label}{/if}</p>{/if}
</fieldset>
