<script module lang="ts">
	/** What .chip is made of, classified. The props follow the
	    families the project registers (variants.ts, ADR 0015). */
	export const PREFIX = 'chip';

	export const AXES = {
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		size: ['xs', 'sm', 'md', 'lg', 'xl'],
		/* Fill and border treatments. The family ships them as flat combinations
		   rather than orthogonal axes, so they are one axis — and `variant` is the
		   name kept for an exclusive group with no better one. */
		variant: ['outline', 'dash', 'soft', 'ghost']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = ['remove'] as const;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>, Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
		/** Draw a remove button after the content, calling this. */
		onRemove?: () => void;
		/** The remove button's accessible name. */
		removeLabel?: string;
		/** Keep the remove button out of reach (it is hidden). */
		disabled?: boolean;
		class?: string;
		children?: Snippet;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		onRemove,
		removeLabel = 'Remove',
		disabled = false,
		class: klass = '',
		children,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
</script>

<span {...applied.rest} class={classes}
	>{@render children?.()}{#if onRemove}<button
			type="button"
			class="chip-remove"
			aria-label={removeLabel}
			{disabled}
			onclick={onRemove}
		>
			<svg viewBox="0 0 24 24" width="0.9em" height="0.9em" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
		</button>{/if}</span
>
