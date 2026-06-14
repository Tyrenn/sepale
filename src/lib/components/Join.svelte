<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cx } from '../internal/cx.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		vertical?: boolean;
		class?: string;
		/** Children should carry `.join-item`. */
		children?: Snippet;
	}

	let { vertical = false, class: klass = '', children, ...rest }: Props = $props();

	let classes = $derived(
		cx('join', vertical ? 'join-vertical' : 'join-horizontal', klass)
	);
</script>

<div class={classes} {...rest}>{@render children?.()}</div>
