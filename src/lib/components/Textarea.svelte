<script module lang="ts">
	/** What .textarea is made of, classified. The props follow the
	    families the project registers (variants.ts, ADR 0015). */
	export const PREFIX = 'textarea';

	export const AXES = {
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		size: ['xs', 'sm', 'md', 'lg', 'xl'],
		variant: ['ghost']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = [] as const;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	// `size` is ours — the HTML attribute of the same name is a character count
	// our CSS overrides anyway.
	interface Props extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>, Omit<HTMLTextareaAttributes, 'size' | 'color'> {
		/**
		 * Colour the field by its own validity and reveal `hint` once the
		 * browser marks it invalid. The CSS drives this off `:user-invalid`,
		 * so it only fires after the visitor has actually had a go.
		 */
		validator?: boolean;
		/**
		 * Shown under the field when it is invalid. It has to be the field's
		 * next sibling for the CSS to reach it, which is the whole reason this
		 * is a prop and not something you write yourself.
		 */
		hint?: Snippet;
		/**
		 * An error from outside (the server said no): marks the field invalid and
		 * shows this, for as long as it is given. The parent owns it.
		 */
		error?: string | null;
		/** The `<textarea>` itself. Bindable. */
		element?: HTMLTextAreaElement;
		class?: string;
		value?: string | number;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		validator = false,
		hint,
		error = null,
		element = $bindable(),
		disabled = false,
		value = $bindable(),
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let failed = $derived(!disabled && !!error);
	let classes = $derived(cx(PREFIX, applied.classes, (validator || failed) && 'validator', klass));

	/* An error from outside is the field's validity too: a form holding it
	   does not submit. */
	$effect(() => {
		element?.setCustomValidity(failed ? (error ?? '') : '');
	});
</script>

<textarea aria-invalid={failed ? 'true' : undefined} {...applied.rest} {disabled} bind:this={element} class={classes} bind:value></textarea>
{#if failed}
	<p class="validator-hint">{error}</p>
{:else if hint}
	<p class="validator-hint">{@render hint()}</p>
{/if}
