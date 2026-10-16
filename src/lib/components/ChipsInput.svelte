<script module lang="ts">
	/** What .chips-input is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs). */
	export const PREFIX = 'chips-input';

	export const AXES = {
		size: ['xs', 'sm', 'md', 'lg', 'xl']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = ['remove', 'field'] as const;

	/** What the `field` snippet receives: call `add` when the field commits a value. */
	export interface ChipsInputField {
		add: (value: string) => void;
	}
</script>

<script lang="ts">
	/**
	 * An accumulator: several values, each a chip, collected from a field.
	 *
	 * The field is not this component's business. Without one, a plain input
	 * adds on Enter or a comma. With `field`, any component goes in — an Input,
	 * a Select, a Combobox — and calls `add(value)` when it commits one.
	 * Backspace in an empty field removes the last chip.
	 *
	 * `values` is bindable: the component stores them. Each one is also a
	 * hidden `name[]` input, so a form submits them.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
		/** The values. Bindable. */
		values?: string[];
		/** For a form: one hidden `name[]` input per value. */
		name?: string;
		/** Refuse a value already there. */
		unique?: boolean;
		/** The default field's placeholder. */
		placeholder?: string;
		disabled?: boolean;
		/** The field, given `add`. Defaults to a plain input (Enter or comma adds). */
		field?: Snippet<[ChipsInputField]>;
		/** How one chip reads. Defaults to the value. */
		chip?: Snippet<[string]>;
		/** After every addition or removal. */
		onChange?: (values: string[]) => void;
		/** A remove button's accessible name. */
		removeLabel?: (value: string) => string;
		/** Classes on each chip: `chip-primary`, `chip-soft`… */
		chipClass?: string;
		class?: string;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		values = $bindable([]),
		name,
		unique = true,
		placeholder,
		disabled = false,
		field,
		chip,
		onChange,
		removeLabel = (v: string) => `Remove ${v}`,
		chipClass = '',
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx('input', PREFIX, applied.classes, klass));

	let draft = $state('');
	let root: HTMLDivElement | undefined = $state();

	function add(value: string) {
		const v = `${value ?? ''}`.trim();
		if (!v || disabled || (unique && values.includes(v))) return;
		values = [...values, v];
		onChange?.(values);
	}

	function remove(i: number) {
		values = values.filter((_, n) => n !== i);
		onChange?.(values);
	}

	/* Backspace in any empty field inside: the last chip goes. */
	function keydown(e: KeyboardEvent) {
		const t = e.target as HTMLInputElement;
		if (e.key === 'Backspace' && t instanceof HTMLInputElement && t.value === '' && values.length && !disabled) {
			remove(values.length - 1);
		}
	}

	function draftKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			add(draft);
			draft = '';
		}
	}

	/* A click on the frame's empty space focuses the field. */
	function focusField(e: MouseEvent) {
		if (e.target === root) root?.querySelector<HTMLElement>('input:not([type=hidden]), select')?.focus();
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div {...applied.rest} bind:this={root} class={classes} onkeydown={keydown} onclick={focusField}>
	{#each values as v, i (v + i)}
		<span class={cx('chip', chipClass)}>
			{#if chip}{@render chip(v)}{:else}{v}{/if}
			<button type="button" class="chips-input-remove" aria-label={removeLabel(v)} {disabled} onclick={() => remove(i)}>
				<svg viewBox="0 0 24 24" width="0.9em" height="0.9em" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
			</button>
		</span>
	{/each}
	{#if field}
		{@render field({ add })}
	{:else}
		<input class="chips-input-field" bind:value={draft} {placeholder} {disabled} onkeydown={draftKeydown} onblur={() => (add(draft), (draft = ''))} />
	{/if}
	{#if name}
		{#each values as v, i (v + i)}<input type="hidden" name="{name}[]" value={v} />{/each}
	{/if}
</div>
