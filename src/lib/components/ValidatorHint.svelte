<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cx } from '../internal/cx.js';

	interface Props extends HTMLAttributes<HTMLParagraphElement> {
		class?: string;
		children?: Snippet;
	}

	let { class: klass = '', children, ...rest }: Props = $props();
</script>

<!-- Pair with an input carrying the `.validator` class; shown when invalid. -->
<p class={cx('validator-hint', klass)} {...rest}>{@render children?.()}</p>
