<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cx } from '../internal/cx.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		/** Render as a line of text rather than a block. */
		text?: boolean;
		class?: string;
	}

	let { text = false, class: klass = '', ...rest }: Props = $props();

	let classes = $derived(cx('skeleton', text && 'skeleton-text', klass));
</script>

<div class={classes} {...rest}></div>
