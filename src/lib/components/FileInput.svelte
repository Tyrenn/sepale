<script module lang="ts">
	/** What .file-input is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs). */
	export const PREFIX = 'file-input';

	export const AXES = {
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		size: ['xs', 'sm', 'md', 'lg', 'xl'],
		variant: ['ghost']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = [] as const;
</script>

<script lang="ts">
	/**
	 * A file picker. Validation stays the browser's (`required`, `accept`…);
	 * the message shown is the browser's own, in the visitor's language, and
	 * `error` forces one from outside.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	// `size` is ours — the HTML attribute of the same name is a character count
	// our CSS overrides anyway.
	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, Omit<HTMLInputAttributes, 'size' | 'color'> {
		/**
		 * Colour the field by its own validity and reveal `hint` once the
		 * browser marks it invalid. The CSS drives this off `:user-invalid`,
		 * so it only fires after the visitor has actually had a go.
		 */
		validator?: boolean;
		/**
		 * Shown under the field when it is invalid. It has to be the field's
		 * next sibling for the CSS to reach it, which is the whole reason this
		 * is a prop and not something you write yourself. Without it, the
		 * message is the browser's own.
		 */
		hint?: Snippet;
		/**
		 * An error from outside (the server said no): marks the field invalid and
		 * shows this, for as long as it is given. The parent owns it — it knows
		 * the value and is the one able to test it — so the field never clears it.
		 */
		error?: string | null;
		/** The message of the last check, `false` when the field passed. Bindable. */
		invalid?: string | false;
		/** The `<input>` itself. Bindable. */
		element?: HTMLInputElement;
		class?: string;
		files?: FileList | null;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		validator = false,
		hint,
		error = null,
		invalid = $bindable(false),
		element = $bindable(),
		files = $bindable<FileList | null>(null),
		class: klass = '',
		disabled = false,
		onchange,
		onblur,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));

	/** What is shown under the field. A disabled field shows nothing. */
	let message = $derived(disabled ? '' : error || (typeof invalid === 'string' ? invalid : ''));

	let classes = $derived(cx(PREFIX, applied.classes, (validator || !!message) && 'validator', klass));

	/** Check the field now and show the browser's message if it fails. */
	export function isValid(): boolean {
		if (!element || disabled) return !error;
		invalid = element.validity.valid ? false : element.validationMessage;
		return !error && !invalid;
	}

	/** Drop the chosen files. */
	export function clear() {
		if (element) element.value = '';
		files = null;
		if (invalid) isValid();
	}

	function handleChange(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		// A field shown invalid is re-checked once a file is picked.
		if (invalid) isValid();
		onchange?.(e);
	}

	function handleBlur(e: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		if (validator) isValid();
		onblur?.(e);
	}
</script>

<!-- Ours first: what the caller writes in the spread still wins. -->
<input
	aria-invalid={message ? 'true' : undefined}
	{...applied.rest}
	bind:this={element}
	type="file"
	class={classes}
	bind:files
	{disabled}
	onchange={handleChange}
	onblur={handleBlur}
/>
<!-- An error from outside first, then the caller's hint, then the browser's
     own message. -->
{#if error && !disabled}
	<p class="validator-hint">{error}</p>
{:else if hint}
	<p class="validator-hint">{@render hint()}</p>
{:else if message}
	<p class="validator-hint">{message}</p>
{/if}
