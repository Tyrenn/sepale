<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import type { Color } from '../types.js';
	import { cx, mod } from '../internal/cx.js';

	interface Props extends HTMLAnchorAttributes {
		color?: Color;
		/** Only underline on hover. */
		hover?: boolean;
		class?: string;
		children?: Snippet;
	}

	let { color, hover = false, class: klass = '', children, ...rest }: Props = $props();

	let classes = $derived(cx('link', mod('link', color), hover && 'link-hover', klass));
</script>

<a class={classes} {...rest}>{@render children?.()}</a>
