<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cx } from '../internal/cx.js';

	interface Props extends HTMLAttributes<HTMLButtonElement> {
		active?: boolean;
		disabled?: boolean;
		class?: string;
		children?: Snippet;
	}

	let { active = false, disabled = false, class: klass = '', children, ...rest }: Props = $props();

	let classes = $derived(cx('tab', disabled && 'tab-disabled', klass));
</script>

<button role="tab" class={classes} aria-selected={active} {disabled} {...rest}>
	{@render children?.()}
</button>
