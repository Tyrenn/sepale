<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Color, FieldSize } from '../types.js';
	import { cx, mod } from '../internal/cx.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		/** 0–100 progress value. */
		value?: number;
		color?: Color;
		size?: FieldSize;
		class?: string;
		children?: Snippet;
	}

	let { value = 0, color, size, class: klass = '', style = '', children, ...rest }: Props = $props();

	let classes = $derived(
		cx('radial-progress', mod('radial-progress', color), mod('radial-progress', size), klass)
	);
	let styles = $derived(`--value:${value};${style}`);
</script>

<div class={classes} style={styles} role="progressbar" aria-valuenow={value} {...rest}>
	{#if children}{@render children()}{:else}{value}%{/if}
</div>
