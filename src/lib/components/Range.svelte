<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { Color, FieldSize } from '../types.js';
	import { cx, mod } from '../internal/cx.js';

	interface Props extends Omit<HTMLInputAttributes, 'size' | 'type'> {
		color?: Color;
		fieldSize?: FieldSize;
		value?: number;
		class?: string;
	}

	let {
		color,
		fieldSize,
		value = $bindable(0),
		class: klass = '',
		...rest
	}: Props = $props();

	let classes = $derived(cx('range', mod('range', color), mod('range', fieldSize), klass));
</script>

<input type="range" class={classes} bind:value {...rest} />
