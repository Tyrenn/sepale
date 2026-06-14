<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { FieldSize } from '../types.js';
	import { cx, mod } from '../internal/cx.js';

	interface Props extends HTMLAttributes<HTMLUListElement> {
		size?: FieldSize;
		class?: string;
		/** One element per row; add `.list-row` for rich rows. */
		children?: Snippet;
	}

	let { size, class: klass = '', children, ...rest }: Props = $props();

	let classes = $derived(cx('list', mod('list', size), klass));
</script>

<ul class={classes} {...rest}>{@render children?.()}</ul>
