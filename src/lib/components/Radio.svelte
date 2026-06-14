<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { Color, FieldSize } from '../types.js';
	import { cx, mod } from '../internal/cx.js';

	interface Props extends Omit<HTMLInputAttributes, 'size' | 'type'> {
		color?: Color;
		fieldSize?: FieldSize;
		variant?: 'square';
		group?: string | number;
		class?: string;
	}

	let {
		color,
		fieldSize,
		variant,
		group = $bindable(),
		value,
		class: klass = '',
		...rest
	}: Props = $props();

	let classes = $derived(
		cx('radio', mod('radio', color), mod('radio', fieldSize), mod('radio', variant), klass)
	);
</script>

<input type="radio" class={classes} bind:group {value} {...rest} />
