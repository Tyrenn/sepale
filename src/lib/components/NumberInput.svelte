<script module lang="ts">
	/** What .number-input is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs). */
	export const PREFIX = 'number-input';

	export const AXES = {
		size: ['xs', 'sm', 'md', 'lg', 'xl']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = ['dec', 'field', 'inc'] as const;
</script>

<script lang="ts">
	/**
	 * A number field, aligned to the end like a figure in a column.
	 *
	 * NOT an `<input type="number">`: that one follows the browser's locale, and
	 * in French Firefox refuses `.` while Chrome takes it, so the same keystroke
	 * gives a number in one and an empty, invalid field in the other. This is a
	 * text field with a numeric keyboard (`inputmode`), and it reads `.` and `,`
	 * alike as the decimal separator. What the native field did, it does:
	 *
	 *   - typing is filtered to what a number can be on its way (`-`, digits,
	 *     one separator); a paste is cleaned of its spaces first;
	 *   - ↑ / ↓ step by `step`, within `min` / `max`;
	 *   - `min`, `max` and `step` set the field's validity, so `:invalid` and
	 *     the validator behave as before; `required` is the native one;
	 *   - with a `name`, a hidden input submits the value written with a `.`,
	 *     whatever separator was typed.
	 *
	 * With `controls`, a − and a + frame it. The buttons are structure, not
	 * paint, so they are a prop and not a variant: a family draws them when
	 * they are there.
	 *
	 * `value` is bindable and always a number: what the field holds, parsed,
	 * or `null` when it is empty or holds no finite number. Never a string.
	 */
	import { untrack, type Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, Omit<HTMLInputAttributes, 'size' | 'value' | 'type'> {
		/** Colour the field by its own validity (`required`, `min`, `max`, `step`)
		    and reveal `hint` once the browser marks it invalid. */
		validator?: boolean;
		/** Shown under the field when it is invalid. */
		hint?: Snippet;
		/** Bindable. Always a number, or `null` when the field is empty. */
		value?: number | null;
		/** Draw a − and a + around the field. Off: the field alone. */
		controls?: boolean;
		min?: number;
		max?: number;
		/** `any`: every value is valid, and the buttons move by 1. */
		step?: number | 'any';
		disabled?: boolean;
		/** After every change, typed or stepped. */
		onValue?: (value: number | null) => void;
		decreaseLabel?: string;
		increaseLabel?: string;
		/** Submitted with the form, as a number written with a `.`. */
		name?: string;
		/** What the browser says when the field is invalid. */
		messages?: Partial<{ nan: string; min: string; max: string; step: string }>;
		class?: string;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		validator = false,
		hint,
		value = $bindable(null),
		controls = false,
		min,
		max,
		step = 1,
		disabled = false,
		onValue,
		decreaseLabel = 'Decrease',
		increaseLabel = 'Increase',
		name,
		messages = {},
		/* The field needs these four itself: taken out of the rest, and the
		   caller's own called after the field's (see the <input>). */
		onbeforeinput: theirBeforeInput,
		oninput: theirInput,
		onblur: theirBlur,
		onkeydown: theirKeydown,
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, validator && 'validator', klass));

	let field: HTMLInputElement | undefined = $state();

	/* What a number can be while it is being typed: `-`, `12,`, `.5`. */
	const PARTIAL = /^-?\d*(?:[.,]\d*)?$/;
	/* Spaces a paste may carry: thousands, French narrow no-break included. */
	const SPACES = /[\s  ]/g;

	/** A number from text: `.` or `,` as the separator; null when there is none. */
	function parse(text: string): number | null {
		const s = text.trim().replace(',', '.');
		if (!/\d/.test(s)) return null;
		const n = Number(s);
		return Number.isFinite(n) ? n : null;
	}

	const format = (n: number | null | undefined) => (n == null || !Number.isFinite(n) ? '' : String(n));

	/* The text in the field, kept as typed (`12,5` stays `12,5`). It follows
	   `value` only when `value` changes from outside. */
	let text = $state(untrack(() => format(value)));
	$effect(() => {
		const outside = value ?? null;
		if (untrack(() => parse(text)) !== outside) text = format(outside);
	});

	function commit(next: string) {
		text = next;
		value = parse(next);
		onValue?.(value);
	}

	/* Keep out what no number can become; clean a paste of its spaces. */
	function guard(e: InputEvent) {
		if (!field || e.data == null) return;
		const from = field.selectionStart ?? field.value.length;
		const to = field.selectionEnd ?? from;
		const data = e.data.replace(SPACES, '');
		const next = field.value.slice(0, from) + data + field.value.slice(to);
		if (!PARTIAL.test(next)) return e.preventDefault();
		if (data !== e.data) {
			e.preventDefault();
			field.setRangeText(data, from, to, 'end');
			commit(field.value);
		}
	}

	/* The last word, for input that skipped beforeinput (some mobile IMEs). */
	function sanitise() {
		if (!field) return;
		if (!PARTIAL.test(field.value)) field.value = text;
		else commit(field.value);
	}

	/* `12,` or `-` left behind: tidied once the field is left. */
	function tidy() {
		if (text === '-' || /^-?[.,]$/.test(text)) commit('');
		else if (/[.,]$/.test(text)) commit(text.slice(0, -1));
	}

	function arrows(e: KeyboardEvent) {
		if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
		e.preventDefault();
		stepBy(e.key === 'ArrowUp');
	}

	/** Digits after the point, to keep 0.1 + 0.2 from showing 0.30000000000000004. */
	const decimals = (n: number | null | undefined) =>
		n == null ? 0 : (String(n).split('.')[1]?.length ?? 0);

	function stepBy(up: boolean) {
		if (disabled) return;
		const by = step === 'any' ? 1 : step;
		const current = parse(text);
		let next = current === null ? (min ?? 0) : current + (up ? by : -by);
		/* On the grid `min + k × step`, as stepUp() / stepDown() do. */
		if (current !== null && step !== 'any') {
			const base = min ?? 0;
			next = base + Math.round((next - base) / by) * by;
		}
		next = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, next));
		next = Number(next.toFixed(Math.max(decimals(by), decimals(current), decimals(min))));
		commit(format(next));
		field?.dispatchEvent(new Event('change', { bubbles: true }));
	}

	/* The validity the native field had: min, max, step, and "not a number". */
	let problem = $derived.by(() => {
		const n = parse(text);
		if (n === null) return text.trim() && !PARTIAL.test(text.trim()) ? (messages.nan ?? 'Enter a number.') : '';
		if (min !== undefined && n < min) return messages.min ?? `Enter ${min} or more.`;
		if (max !== undefined && n > max) return messages.max ?? `Enter ${max} or less.`;
		if (step !== 'any' && step > 0) {
			const k = (n - (min ?? 0)) / step;
			if (Math.abs(k - Math.round(k)) > 1e-9) return messages.step ?? `Enter a multiple of ${step}.`;
		}
		return '';
	});
	$effect(() => field?.setCustomValidity(problem));

	/* A minus on the phone's keyboard only where a negative is allowed: iOS's
	   decimal pad has none. */
	let mode = $derived<'decimal' | 'text'>(min !== undefined && min >= 0 ? 'decimal' : 'text');
</script>

<div class={classes}>
	{#if controls}
	<button
		type="button"
		class="number-input-dec"
		tabindex="-1"
		aria-label={decreaseLabel}
		disabled={disabled || (min !== undefined && value !== null && value <= min)}
		onclick={() => stepBy(false)}>−</button
	>
	{/if}
	<input
		{...applied.rest}
		bind:this={field}
		type="text"
		inputmode={mode}
		autocomplete="off"
		role="spinbutton"
		aria-valuenow={value ?? undefined}
		aria-valuemin={min}
		aria-valuemax={max}
		class="number-input-field"
		value={text}
		{disabled}
		onbeforeinput={(e) => {
			guard(e);
			theirBeforeInput?.(e);
		}}
		oninput={(e) => {
			sanitise();
			theirInput?.(e);
		}}
		onblur={(e) => {
			tidy();
			theirBlur?.(e);
		}}
		onkeydown={(e) => {
			arrows(e);
			theirKeydown?.(e);
		}}
	/>
	{#if name}<input type="hidden" {name} value={format(value)} {disabled} />{/if}
	{#if controls}
	<button
		type="button"
		class="number-input-inc"
		tabindex="-1"
		aria-label={increaseLabel}
		disabled={disabled || (max !== undefined && value !== null && value >= max)}
		onclick={() => stepBy(true)}>+</button
	>
	{/if}
</div>
{#if hint}<p class="validator-hint">{@render hint()}</p>{/if}
