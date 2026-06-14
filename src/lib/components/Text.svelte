<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cx } from '../internal/cx.js';

	/** Typography presets defined by text.scss. */
	type Variant =
		| 'title'
		| 'subtitle-s1'
		| 'subtitle-s2'
		| `text-s${1 | 2 | 3 | 4}-b${1 | 2 | 3}`;

	interface Props {
		/** HTML tag to render. */
		as?: string;
		variant?: Variant;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	}

	let { as = 'p', variant, class: klass = '', children, ...rest }: Props = $props();

	let classes = $derived(cx(variant, klass));
</script>

<svelte:element this={as} class={classes} {...rest}>{@render children?.()}</svelte:element>
