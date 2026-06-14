<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { FieldSize } from '../types.js';
	import { cx, mod } from '../internal/cx.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		variant?: 'box' | 'border' | 'lift';
		placement?: 'top' | 'bottom';
		size?: FieldSize;
		class?: string;
		children?: Snippet;
	}

	let { variant, placement, size, class: klass = '', children, ...rest }: Props = $props();

	let classes = $derived(
		cx('tabs', mod('tabs', variant), mod('tabs', placement), mod('tabs', size), klass)
	);
</script>

<div role="tablist" class={classes} {...rest}>{@render children?.()}</div>
