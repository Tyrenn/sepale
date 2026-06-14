<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cx, mod } from '../internal/cx.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		/** Horizontal anchor of the floating chip. */
		align?: 'start' | 'center' | 'end';
		/** Vertical anchor of the floating chip. */
		side?: 'top' | 'middle' | 'bottom';
		class?: string;
		/** The host element the badge floats over. */
		children?: Snippet;
		/** The floating chip content (rendered as a positioned .chip). */
		badge?: Snippet;
	}

	let { align, side, class: klass = '', children, badge, ...rest }: Props = $props();

	let classes = $derived(cx('badge', mod('badge', align), mod('badge', side), klass));
</script>

<div class={classes} {...rest}>
	{@render children?.()}
	{#if badge}<span class="chip">{@render badge()}</span>{/if}
</div>
