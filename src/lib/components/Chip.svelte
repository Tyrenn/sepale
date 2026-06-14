<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Color, FieldSize } from '../types.js';
	import { cx, mod } from '../internal/cx.js';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		color?: Color;
		size?: FieldSize;
		variant?: 'outline' | 'dash' | 'soft' | 'ghost';
		class?: string;
		children?: Snippet;
	}

	let { color, size, variant, class: klass = '', children, ...rest }: Props = $props();

	let classes = $derived(
		cx('chip', mod('chip', color), mod('chip', size), mod('chip', variant), klass)
	);
</script>

<span class={classes} {...rest}>{@render children?.()}</span>
