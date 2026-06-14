<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { FieldSize } from '../types.js';
	import { cx, mod } from '../internal/cx.js';

	interface Props extends HTMLAttributes<HTMLElement> {
		size?: FieldSize;
		class?: string;
		/** One <li> per crumb. */
		children?: Snippet;
	}

	let { size, class: klass = '', children, ...rest }: Props = $props();

	let classes = $derived(cx('breadcrumbs', mod('breadcrumbs', size), klass));
</script>

<nav class={classes} {...rest}>
	<ul>{@render children?.()}</ul>
</nav>
