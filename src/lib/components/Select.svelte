<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import type { Color, FieldSize } from '../types.js';
	import { cx, mod } from '../internal/cx.js';

	interface Props extends Omit<HTMLSelectAttributes, 'size'> {
		color?: Color;
		fieldSize?: FieldSize;
		variant?: 'ghost';
		value?: string | number;
		class?: string;
		children?: Snippet;
	}

	let {
		color,
		fieldSize,
		variant,
		value = $bindable(''),
		class: klass = '',
		children,
		...rest
	}: Props = $props();

	let classes = $derived(
		cx('select', mod('select', color), mod('select', fieldSize), mod('select', variant), klass)
	);
</script>

<select class={classes} bind:value {...rest}>
	{@render children?.()}
</select>
