<script module lang="ts">
	/** What .floating-label is made of, classified. Only this block differs
	    between this file and the copy generated for each family
	    (scripts/gen-components.mjs).

	    A container that WRAPS a field, unlike `.label`, which is inline and
	    lives inside one. Two roles, two components (ADR 0009). The <span> must
	    come before the field: the CSS reads the field's placeholder state with
	    `:has()` and paints the span accordingly. */
	export const PREFIX = 'floating-label';

	export const AXES = {} as const;

	export const FLAGS = [] as const;
	export const PARTS = [] as const;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLLabelAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../internal/variants.js';

	interface Props extends AxisProps<typeof AXES>, HTMLLabelAttributes {
		/** The text that floats into the field's frame once it has content. */
		label?: string;
		class?: string;
		/** The field itself — an `<input>`, `<select>` or `<textarea>`. */
		children?: Snippet;
	}

	let { label, class: klass = '', children, ...axes }: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, axes));
</script>

<label {...applied.rest} class={cx(PREFIX, applied.classes, klass)}>
	<span>{label}</span>
	{@render children?.()}
</label>
