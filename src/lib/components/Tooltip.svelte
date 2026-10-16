<script module lang="ts">
	/** What .tooltip is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs). */
	export const PREFIX = 'tooltip';

	export const AXES = {
		/* The side of the trigger the bubble sits on. */
		side: ['top', 'right', 'bottom', 'left'],
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error']
	} as const;

	export const FLAGS = {
		open: 'Show the bubble all the time, not only on hover and focus.',
		float:
			'Where the browser has anchor positioning: escape clipping ancestors and flip when there is no room (no arrow then). Ignored elsewhere.'
	} as const;
	export const PARTS = ['content'] as const;
</script>

<script lang="ts">
	/**
	 * A short hint next to its trigger, on hover and on keyboard focus.
	 *
	 * Pure CSS: the bubble does not move to stay on screen. Pick the `side`
	 * that has room. The first focusable element inside gets `aria-describedby`
	 * pointing at the bubble, so a screen reader reads the hint too.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
		/** The hint, as text. */
		text?: string;
		/** The hint, as markup. Wins over `text`. */
		tip?: Snippet;
		class?: string;
		/** The trigger. */
		children?: Snippet;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		text,
		tip,
		class: klass = '',
		children,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));

	const id = `tooltip-${Math.random().toString(36).slice(2, 9)}`;

	/** Points the trigger at the bubble, for assistive technology. */
	function describe(node: HTMLElement) {
		const trigger = node.querySelector<HTMLElement>('a[href], button, input, select, textarea, [tabindex]');
		trigger?.setAttribute('aria-describedby', id);
	}
</script>

<!-- The anchor name is per instance: `float` ties this bubble to this trigger. -->
<span {...applied.rest} class={classes} style:--tooltip-anchor="--{id}" use:describe>
	{@render children?.()}
	<span class="tooltip-content" role="tooltip" {id}>
		{#if tip}{@render tip()}{:else}{text}{/if}
	</span>
</span>
