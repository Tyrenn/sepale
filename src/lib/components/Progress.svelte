<script module lang="ts">
	/** What .progress is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs). */
	export const PREFIX = 'progress';

	export const AXES = {
		/* No size axis: a progress bar answers to the width it is given. */
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = ['segments', 'segment'] as const;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes, HTMLProgressAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Segment {
		/** Its share of the bar, against the others'. */
		value: number;
		/** A theme colour (`primary`, `warning`…) or any CSS colour (`color-mix(…)`). */
		color?: string;
		/** Read on hover, and by a screen reader. */
		label?: string;
	}

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, Omit<HTMLAttributes<HTMLElement>, 'color'>,
			Pick<HTMLProgressAttributes, 'value' | 'max'> {
		/** Cut the bar into parts, each as wide as its `value` among the others.
		    The bar then stands for a split rather than a progress: `value` and
		    `max` are ignored. */
		segments?: Segment[];
		class?: string;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		class: klass = '',
		value,
		max = 100,
		segments,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
</script>

{#if segments}
	<div {...applied.rest} class={[classes, 'progress-segments']} role="img">
		{#each segments as s, i (i)}
			<span
				class="progress-segment"
				title={s.label}
				style:--segment={s.value}
				style:--segment-color={s.color && (/^[a-z]+$/.test(s.color) ? `var(--color-${s.color})` : s.color)}
			></span>
		{/each}
	</div>
{:else}
	<progress {...applied.rest} class={classes} {value} {max}></progress>
{/if}
