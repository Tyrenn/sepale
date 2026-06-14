<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { FieldSize } from '../types.js';
	import { cx, mod } from '../internal/cx.js';

	type Kind = 'spinner' | 'dots' | 'ring' | 'ball' | 'bars' | 'infinity';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		kind?: Kind;
		size?: FieldSize;
		class?: string;
	}

	let { kind = 'spinner', size, class: klass = '', ...rest }: Props = $props();

	let classes = $derived(cx('loading', mod('loading', kind), mod('loading', size), klass));
</script>

<span class={classes} {...rest}></span>
