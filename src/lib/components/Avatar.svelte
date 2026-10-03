<script module lang="ts">
	/** What .avatar is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs). */
	export const PREFIX = 'avatar';

	export const AXES = {
		/* The contour: a ring in that colour. No colour, no ring. */
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		size: ['xs', 'sm', 'md', 'lg', 'xl'],
		/* Round by default everywhere; which other shapes exist is the
		   family's call — daisy has daisyUI's masks, the others a box. */
		shape: ['square', 'squircle', 'hexagon']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = [] as const;
</script>

<script lang="ts">
	/**
	 * A picture, or a few letters, standing for someone.
	 *
	 * `src` draws a picture; without it the children are the initials. A
	 * `badge` wraps the avatar in a `.badge` and pins a `.chip` to its edge —
	 * the badge component's own markup, written here so the copy a family
	 * ships imports nothing.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
		/** The picture. Without it, the children are drawn instead. */
		src?: string;
		/** The picture's alternative text. */
		alt?: string;
		/** A count or a status, pinned to the avatar's edge as a .chip. */
		badge?: Snippet;
		/** Which edge the badge sits on, at the end side. */
		badgeSide?: 'top' | 'bottom';
		class?: string;
		/** The initials, when there is no picture. */
		children?: Snippet;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		src,
		alt = '',
		badge,
		badgeSide = 'top',
		class: klass = '',
		children,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
</script>

{#snippet frame()}
	<div {...applied.rest} class={classes}>
		{#if src}<img {src} {alt} />{:else}<span>{@render children?.()}</span>{/if}
	</div>
{/snippet}

{#if badge}
	<div class={['badge', badgeSide === 'bottom' ? 'badge-bottom' : 'badge-top', 'badge-end']}>
		{@render frame()}
		<span class="chip">{@render badge()}</span>
	</div>
{:else}
	{@render frame()}
{/if}
