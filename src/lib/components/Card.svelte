<script module lang="ts">
	/** What .card is made of, classified. */
	export const PREFIX = 'card';

	export const AXES = {
		size: ['xs', 'sm', 'md', 'lg', 'xl']
	} as const;

	/** `border` and `dash` are exclusive in practice but not by construction:
	    a card with both simply takes the last rule, and neither is a look you
	    reach for by accident. */
	export const FLAGS = {
		border: 'Draw an edge the family does not draw by default.',
		dash: 'Draw that edge dashed.',
		side: 'Put the figure beside the body instead of above it.',
		'image-full': 'Let the figure fill the card, with the body laid over it.'
	} as const;
	export const PARTS = ['title', 'body', 'actions'] as const;
</script>

<script lang="ts">
	/**
	 * A box with, optionally, a title, a body and a row of actions.
	 *
	 * Every part is optional. A card with nothing but children is a card, and
	 * that is the common case — which is why `body` wraps the children rather
	 * than being a snippet you have to remember to pass.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	/* `title` is an HTML attribute too, and a tooltip is not a heading — so
	   the DOM one is dropped rather than shadowed silently. */
	interface Props
		extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>,
			Omit<HTMLAttributes<HTMLElement>, 'title'> {
		title?: Snippet;
		/** A row of buttons, at the end of the body. */
		actions?: Snippet;
		/** An image or anything else that spans the card, above the body. */
		figure?: Snippet;
		class?: string;
		children?: Snippet;
	}

	let {
		title,
		actions,
		figure,
		class: klass = '',
		children,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
</script>

<div class={classes} {...applied.rest}>
	{#if figure}
		<figure>{@render figure()}</figure>
	{/if}
	<div class="card-body">
		{#if title}<h2 class="card-title">{@render title()}</h2>{/if}
		{@render children?.()}
		{#if actions}<div class="card-actions">{@render actions()}</div>{/if}
	</div>
</div>
