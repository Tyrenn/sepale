<script lang="ts">
	import type { HTMLProgressAttributes } from 'svelte/elements';
	import type { Color } from '../types.js';
	import { cx, mod } from '../internal/cx.js';

	interface Props extends HTMLProgressAttributes {
		color?: Color;
		class?: string;
	}

	let { color, class: klass = '', value, max = 100, ...rest }: Props = $props();

	let classes = $derived(cx('progress', mod('progress', color), klass));
</script>

<progress class={classes} {value} {max} {...rest}></progress>
