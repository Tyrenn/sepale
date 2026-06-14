<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { Color, FieldSize } from '../types.js';
	import { cx, mod } from '../internal/cx.js';

	interface Props extends Omit<HTMLInputAttributes, 'size'> {
		color?: Color;
		fieldSize?: FieldSize;
		/** Style variant within the family. */
		variant?: 'ghost';
		value?: string | number;
		class?: string;
	}

	let {
		color,
		fieldSize,
		variant,
		value = $bindable(''),
		class: klass = '',
		...rest
	}: Props = $props();

	let classes = $derived(
		cx('input', mod('input', color), mod('input', fieldSize), mod('input', variant), klass)
	);
</script>

<input class={classes} bind:value {...rest} />
