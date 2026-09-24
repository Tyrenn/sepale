<script module lang="ts">
	/** What .swatch is made of, classified. Only this block differs between this
	    file and the copy generated for each family (scripts/gen-components.mjs):
	    an axis a family leaves empty loses its prop entirely. */
	export const PREFIX = 'swatch';

	export const AXES = {
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		size: ['xs', 'sm', 'md', 'lg', 'xl'],
		shape: ['circle']
	} as const;

	export const FLAGS = ['active'] as const;
	export const PARTS = ['disabled'] as const;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../internal/variants.js';

	interface Props extends AxisProps<typeof AXES>, Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
		/** The colour to show. It is DATA, not a theme value, so it is written
		    here at the call site and never by the family. */
		sample?: string;
		/** Mark it as the chosen one. */
		active?: boolean;
		/** Grey it out. `.swatch` may be a span, which cannot carry `disabled`. */
		disabled?: boolean;
		class?: string;
		children?: Snippet;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		sample,
		active = false,
		disabled = false,
		class: klass = '',
		children,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, axes));
	let classes = $derived(
		cx(
			PREFIX,
			applied.classes,
			active && `${PREFIX}-active`,
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
