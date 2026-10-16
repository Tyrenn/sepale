<script module lang="ts">
	/** What .input is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs). */
	export const PREFIX = 'input';

	export const AXES = {
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		size: ['xs', 'sm', 'md', 'lg', 'xl'],
		variant: ['ghost']
	} as const;

	export const FLAGS = {
		nospinner: 'Hide the step arrows of a number field.'
	} as const;
	export const PARTS = [] as const;

</script>

<script lang="ts">
	/**
	 * A text field. Plain by default — one `<input class="input">` — and a
	 * frame around the field (`<label class="input">`) as soon as it needs one:
	 * something drawn before or after the text (`start`, `end`). Suggestions
	 * are a Combobox's job.
	 *
	 * Validation stays the browser's: `required`, `pattern`, `min`… are plain
	 * attributes, and the message shown is the browser's own `validationMessage`,
	 * in the visitor's language. `error` forces one from outside.
	 */
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLInputAttributes } from 'svelte/elements';
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
		/** Drawn inside the frame, before the text: an icon, a label, a unit. */
		start?: Snippet;
		/** Drawn inside the frame, after the text. */
		end?: Snippet;
		/** The field grows with its text. A number adds that many characters of room. */
		autowidth?: boolean | number;
		/** The `<input>` itself. Bindable. */
		element?: HTMLInputElement;
		class?: string;
		value?: any;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		validator = false,
		hint,
		error = null,
		invalid = $bindable(false),
		start,
		end,
		autowidth = false,
		element = $bindable(),
		value = $bindable(''),
		class: klass = '',
		disabled = false,
		autocomplete,
		oninput,
		onfocus,
		onblur,
		onkeydown,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));

	/* ── Validity ─────────────────────────────────────────────────────── */

	/** What is shown under the field. A disabled field shows nothing. */
	let message = $derived(disabled ? '' : error || (typeof invalid === 'string' ? invalid : ''));

	let classes = $derived(
		cx(PREFIX, applied.classes, (validator || !!message) && 'validator', klass)
	);

	/** Check the field now and show the browser's message if it fails. */
	export function isValid(): boolean {
		if (!element || disabled) return !error;
		invalid = element.validity.valid ? false : element.validationMessage;
		return !error && !invalid;
	}

	export function focus() {
		element?.focus();
	}

	/** Empty the field. */
	export function clear() {
		value = '';
	}

	/* ── Width ────────────────────────────────────────────────────────── */

	let width = $derived(
		autowidth
			? `${Math.max(`${value ?? ''}`.length, 5) + (typeof autowidth === 'number' ? autowidth : 0) + 2}ch`
			: undefined
	);

	/* ── Events ───────────────────────────────────────────────────────── */

	function handleInput(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		// A field shown invalid is re-checked as it is corrected.
		if (invalid) invalid = e.currentTarget.validity.valid ? false : e.currentTarget.validationMessage;
		oninput?.(e);
	}

	function handleBlur(e: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		if (validator) isValid();
		onblur?.(e);
	}

	let framed = $derived(!!(start || end));
</script>

{#snippet field(cls: ClassValue | undefined, style: string | undefined)}
	<!-- Ours first: what the caller writes in the spread still wins. -->
	<input
		aria-invalid={message ? 'true' : undefined}
		{...applied.rest}
		bind:this={element}
		bind:value
		class={cls}
		style:width={style}
		{disabled}
		{autocomplete}
		oninput={handleInput}
		{onfocus}
		onblur={handleBlur}
		{onkeydown}
	/>
{/snippet}

{#if framed}
	<label class={classes} style:width>
		{@render start?.()}
		{@render field(undefined, undefined)}
		{@render end?.()}
	</label>
{:else}
	{@render field(classes, width)}
{/if}
<!-- An error from outside first, then the caller's hint, then the browser's
     own message. -->
{#if error && !disabled}
	<p class="validator-hint">{error}</p>
{:else if hint}
	<p class="validator-hint">{@render hint()}</p>
{:else if message}
	<p class="validator-hint">{message}</p>
{/if}
