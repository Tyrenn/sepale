<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import type { Color, FieldSize } from '../types.js';
	import { cx, mod } from '../internal/cx.js';

	interface Props extends HTMLTextareaAttributes {
		color?: Color;
		fieldSize?: FieldSize;
		variant?: 'ghost';
		value?: string;
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
		cx('textarea', mod('textarea', color), mod('textarea', fieldSize), mod('textarea', variant), klass)
	);
</script>

<textarea class={classes} bind:value {...rest}></textarea>
