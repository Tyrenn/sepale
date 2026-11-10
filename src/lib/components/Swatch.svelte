<script module lang="ts">
	/** What .swatch is made of, classified. The props follow the
	    families the project registers (variants.ts, ADR 0015). */
	export const PREFIX = 'swatch';

	export const AXES = {
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		size: ['xs', 'sm', 'md', 'lg', 'xl'],
		shape: ['circle']
	} as const;

	export const FLAGS = {
		active: 'Mark it as the chosen one.'
	} as const;
	export const PARTS = ['disabled'] as const;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>, Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
		/** The colour to show. It is DATA, not a theme value, so it is written
		    here at the call site and never by the family. */
		sample?: string;
		/** Grey it out. `.swatch` may be a span, which cannot carry `disabled`. */
		disabled?: boolean;
		class?: string;
		children?: Snippet;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		sample,
		disabled = false,
		class: klass = '',
		children,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(
		cx(
			PREFIX,
			applied.classes,
			disabled && `${PREFIX}-disabled`,
			klass
		)
	);
</script>

<span
	{...applied.rest}
	class={classes}
	style:--swatch-color={sample}
	aria-disabled={disabled ? 'true' : undefined}
>
	{@render children?.()}
</span>
