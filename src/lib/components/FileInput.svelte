<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { Color, FieldSize } from '../types.js';
	import { cx, mod } from '../internal/cx.js';

	interface Props extends Omit<HTMLInputAttributes, 'size' | 'type'> {
		color?: Color;
		fieldSize?: FieldSize;
		variant?: 'ghost';
		files?: FileList | null;
		class?: string;
	}

	let {
		color,
		fieldSize,
		variant,
		files = $bindable(null),
		class: klass = '',
		...rest
	}: Props = $props();

	let classes = $derived(
		cx('file-input', mod('file-input', color), mod('file-input', fieldSize), mod('file-input', variant), klass)
	);
</script>

<input type="file" class={classes} bind:files {...rest} />
