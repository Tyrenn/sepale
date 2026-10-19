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
	 * A number with − and + beside it.
	 *
	 * The field is a real `<input type="number">`: typing, the arrow keys,
	 * `min`, `max`, `step` and form submission behave as the browser has them.
	 * The buttons call its own `stepDown()` / `stepUp()`, so they honour the
	 * same bounds. `value` is bindable — it is the field's own value.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, Omit<HTMLInputAttributes, 'size' | 'value' | 'type'> {
		/** Colour the field by its own validity (`required`, `min`, `max`, `step`)
		    and reveal `hint` once the browser marks it invalid. */
		validator?: boolean;
		/** Shown under the field when it is invalid. */
		hint?: Snippet;
		/** Bindable. `null` when the field is empty. */
		value?: number | null;
		min?: number;
		max?: number;
		/** `any`: every value is valid, and the buttons move by 1. */
		step?: number | 'any';
		disabled?: boolean;
		/** After every change, typed or stepped. */
		onValue?: (value: number | null) => void;
		decreaseLabel?: string;
		increaseLabel?: string;
		class?: string;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		validator = false,
		hint,
		value = $bindable(null),
		min,
		max,
		step = 1,
		disabled = false,
		onValue,
		decreaseLabel = 'Decrease',
		increaseLabel = 'Increase',
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, validator && 'validator', klass));

	let field: HTMLInputElement | undefined = $state();

	function read() {
		value = field && field.value !== '' ? field.valueAsNumber : null;
		onValue?.(value);
	}

	function stepBy(up: boolean) {
		if (!field) return;
		if (field.value === '') field.value = String(min ?? 0);
		// stepUp() throws without a step: move by 1, within the bounds.
		else if (step === 'any') {
			const next = field.valueAsNumber + (up ? 1 : -1);
			field.value = String(Math.min(max ?? Infinity, Math.max(min ?? -Infinity, next)));
		} else if (up) field.stepUp();
		else field.stepDown();
		read();
		field.dispatchEvent(new Event('change', { bubbles: true }));
	}
</script>

<div class={classes}>
	<button
		type="button"
		class="number-input-dec"
		tabindex="-1"
		aria-label={decreaseLabel}
		disabled={disabled || (min !== undefined && value !== null && value <= min)}
		onclick={() => stepBy(false)}>−</button
	>
	<input
		{...applied.rest}
		bind:this={field}
		type="number"
		class="number-input-field"
		value={value ?? ''}
		{min}
		{max}
		{step}
		{disabled}
		oninput={read}
	/>
	<button
		type="button"
		class="number-input-inc"
		tabindex="-1"
		aria-label={increaseLabel}
		disabled={disabled || (max !== undefined && value !== null && value >= max)}
		onclick={() => stepBy(true)}>+</button
	>
</div>
{#if hint}<p class="validator-hint">{@render hint()}</p>{/if}
