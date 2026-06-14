<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { Color, FieldSize } from '../types.js';
	import { cx, mod } from '../internal/cx.js';

	interface Props extends Omit<HTMLInputAttributes, 'size' | 'type'> {
		color?: Color;
		fieldSize?: FieldSize;
		variant?: 'square' | 'outline';
		checked?: boolean;
		class?: string;
	}

	let {
		color,
		fieldSize,
		variant,
		checked = $bindable(false),
		class: klass = '',
		...rest
	}: Props = $props();

	let classes = $derived(
		cx('checkbox', mod('checkbox', color), mod('checkbox', fieldSize), mod('checkbox', variant), klass)
	);
</script>

<input type="checkbox" class={classes} bind:checked {...rest} />
