<script module lang="ts">
	/** What .hero is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs). */
	export const PREFIX = 'hero';

	export const AXES = {
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		size: ['xs', 'sm', 'md', 'lg', 'xl']
	} as const;

	export const FLAGS = {
		center: 'Centre the text; best without media.',
		reverse: 'Put the media first.'
	} as const;
	export const PARTS = ['content', 'title', 'body', 'actions', 'media'] as const;
</script>

<script lang="ts">
	/**
	 * The large opening block of a page: a title, a sentence, a call to action,
	 * and optionally an image beside them — stacked when there is no room.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, Omit<HTMLAttributes<HTMLElement>, 'color' | 'title'> {
		title?: string;
		/** The heading level of the title. */
		level?: 1 | 2 | 3;
		actions?: Snippet;
		/** An image, a video, an illustration. */
		media?: Snippet;
		class?: string;
		/** The sentence under the title. */
		children?: Snippet;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		title,
		level = 1,
		actions,
		media,
		class: klass = '',
		children,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
</script>

<section {...applied.rest} class={classes}>
	<div class="hero-content">
		{#if title}<svelte:element this={`h${level}`} class="hero-title">{title}</svelte:element>{/if}
		{#if children}<p class="hero-body">{@render children()}</p>{/if}
		{#if actions}<div class="hero-actions">{@render actions()}</div>{/if}
	</div>
	{#if media}<div class="hero-media">{@render media()}</div>{/if}
</section>
