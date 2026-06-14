<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { Color, Size } from '../types.js';
	import { cx, mod } from '../internal/cx.js';

	interface Props extends HTMLButtonAttributes {
		color?: Color;
		size?: Size;
		/** Visual style. */
		variant?: 'outline' | 'dash' | 'soft' | 'ghost' | 'link';
		shape?: 'square' | 'circle';
		width?: 'wide' | 'block';
		active?: boolean;
		class?: string;
		children?: Snippet;
	}

	let {
		color,
		size,
		variant,
		shape,
		width,
		active = false,
		class: klass = '',
		children,
		...rest
	}: Props = $props();

	let classes = $derived(
		cx(
			'btn',
			mod('btn', color),
			mod('btn', size),
			mod('btn', variant),
			mod('btn', shape),
			mod('btn', width),
			active && 'btn-active',
			klass
		)
	);
</script>

<button class={classes} {...rest}>
	{@render children?.()}
</button>
