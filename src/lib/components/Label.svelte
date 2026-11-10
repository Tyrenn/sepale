<script module lang="ts">
	/** What .label is made of, classified. The props follow the
	    families the project registers (variants.ts, ADR 0015).

	    Inline text, on its own or inside a field as a prefix/suffix
	    (`.input > .label`). The label that floats over a field is
	    FloatingLabel — a different component, not a setting of this one
	    (ADR 0009). */
	export const PREFIX = 'label';

	export const AXES = {} as const;

	export const FLAGS = {} as const;
	export const PARTS = [] as const;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLLabelAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>, HTMLLabelAttributes {
		class?: string;
		children?: Snippet;
	}

	let { class: klass = '', children, ...axes }: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
</script>

<label {...applied.rest} class={cx(PREFIX, applied.classes, klass)}>{@render children?.()}</label>
