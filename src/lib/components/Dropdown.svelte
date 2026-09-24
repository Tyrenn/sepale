<script module lang="ts">
	/** What .dropdown is made of, classified. */
	export const PREFIX = 'dropdown';

	export const AXES = {
		size: ['xs', 'sm', 'md', 'lg', 'xl']
	} as const;

	export const FLAGS = [] as const;
	export const PARTS = ['panel', 'below'] as const;
</script>

<script lang="ts">
	/**
	 * A panel that hangs off something.
	 *
	 * It is a container and nothing else: it does not decide what is inside
	 * it. A menu, a list of suggestions under an input, a colour picker — all
	 * of them are this box with different contents, which is why the kit has
	 * it once rather than three times.
	 *
	 * Two placements, and the difference matters:
	 *
	 *   below   — anchored to the trigger, as wide as it. Right for a
	 *             suggestion list, which belongs to its input.
	 *   fixed   — measured from the trigger's rectangle and positioned in the
	 *             viewport. Right for anything inside a SCROLLING column: such
	 *             a column is a containing block, a panel inside one is
	 *             clipped by it, and no `z-index` gets out of that.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../internal/variants.js';

	interface Props extends AxisProps<typeof AXES>, HTMLAttributes<HTMLElement> {
		open?: boolean;
		/** `below` follows the trigger; `fixed` escapes a scrolling ancestor. */
		placement?: 'below' | 'fixed';
		/** Close when a pointer goes down outside, and on Escape. */
		onclose?: () => void;
		trigger?: Snippet;
		class?: string;
		children?: Snippet;
	}

	let {
		open = false,
		placement = 'below',
		onclose,
		trigger,
		class: klass = '',
		children,
		...axes
	}: Props = $props();

	let root: HTMLElement;
	let at = $state({ x: 0, y: 0 });

	/* Measured when it opens, not positioned by CSS: CSS cannot see out of a
	   scroller, and this panel has to. */
	$effect(() => {
		if (!open || placement !== 'fixed' || !root) return;
		const r = root.getBoundingClientRect();
		at = { x: Math.min(r.left, window.innerWidth - 340), y: r.bottom + 6 };
	});

	let applied = $derived(applyAxes(PREFIX, AXES, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
</script>

<svelte:window
	onpointerdown={(e) => {
		if (open && root && !root.contains(e.target as Node)) onclose?.();
	}}
	onkeydown={(e) => e.key === 'Escape' && open && onclose?.()}
/>

<div bind:this={root} class={classes} {...applied.rest}>
	{@render trigger?.()}
	{#if open}
		<div
			class="dropdown-panel {placement === 'below' ? 'dropdown-below' : ''}"
			style:left={placement === 'fixed' ? `${at.x}px` : null}
			style:top={placement === 'fixed' ? `${at.y}px` : null}
		>
			{@render children?.()}
		</div>
	{/if}
</div>
