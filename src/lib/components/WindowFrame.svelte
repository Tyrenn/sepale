<script module lang="ts">
	/** What .window-frame is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs). */
	export const PREFIX = 'window-frame';

	export const AXES = {} as const;

	export const FLAGS = {} as const;
	export const PARTS = ['bar', 'controls', 'title', 'actions', 'body'] as const;
</script>

<script lang="ts">
	/**
	 * An application window drawn around content: a title bar with three window
	 * controls, a title and actions, above a body that scrolls.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
		/** The title, as text or as markup. */
		title?: string | Snippet;
		/** Buttons on the right of the bar. */
		actions?: Snippet;
		class?: string;
		children?: Snippet;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		title,
		actions,
		class: klass = '',
		children,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
</script>

<div {...applied.rest} class={classes}>
	<div class="window-frame-bar">
		<span class="window-frame-controls" aria-hidden="true"><span></span><span></span><span></span></span>
		<span class="window-frame-title">
			{#if typeof title === 'function'}{@render title()}{:else}{title ?? ''}{/if}
		</span>
		<span class="window-frame-actions">{@render actions?.()}</span>
	</div>
	<div class="window-frame-body">{@render children?.()}</div>
</div>
