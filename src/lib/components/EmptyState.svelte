<script module lang="ts">
	/** What .empty-state is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs). */
	export const PREFIX = 'empty-state';

	export const AXES = {
		size: ['xs', 'sm', 'md', 'lg', 'xl'],
		/* A dashed frame, as around a drop zone. */
		variant: ['dashed']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = ['icon', 'title', 'body', 'actions'] as const;
</script>

<script lang="ts">
	/**
	 * What to show when there is nothing: no results, an empty folder, a list
	 * not started yet. Sits in the `empty` slot of Table, Grid and List.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
		title?: string;
		/** An illustration or an icon, in a disc. Defaults to an empty tray. */
		icon?: Snippet;
		/** What to do about it: buttons, links. */
		actions?: Snippet;
		class?: string;
		/** The explanation, under the title. */
		children?: Snippet;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		title,
		icon,
		actions,
		class: klass = '',
		children,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
</script>

<div {...applied.rest} class={classes}>
	<div class="empty-state-icon" aria-hidden="true">
		{#if icon}
			{@render icon()}
		{:else}
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
				<path d="M3 13h5l1.5 2.5h5L16 13h5" /><path d="M5.5 5h13L21 13v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5z" />
			</svg>
		{/if}
	</div>
	{#if title}<p class="empty-state-title">{title}</p>{/if}
	{#if children}<p class="empty-state-body">{@render children()}</p>{/if}
	{#if actions}<div class="empty-state-actions">{@render actions()}</div>{/if}
</div>
