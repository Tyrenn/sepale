<script module lang="ts">
	/** What .chips-input is made of, classified. The props follow the
	    families the project registers (variants.ts, ADR 0015). */
	export const PREFIX = 'chips-input';

	export const AXES = {
		size: ['xs', 'sm', 'md', 'lg', 'xl'],
		/* Where the list sits next to the field. Below by default. */
		side: ['top', 'bottom', 'start', 'end']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = ['list', 'remove'] as const;

	/** What the `field` snippet receives: call `add` when the field commits a value. */
	export interface ChipsInputField {
		add: (value: string) => void;
		/** Whether a value is already in the list. */
		has: (value: string) => boolean;
		/** `required` and no value yet: the field should say so to its form. */
		missing: boolean;
	}
</script>

<script lang="ts">
	/**
	 * A field that feeds a list of chips. A utility: the field is any
	 * component — an Input, a Select, a Combobox — given `add` and calling it
	 * when it commits a value; the values pile up as chips in a list next to
	 * it (`side`), never inside it.
	 *
	 * Without `field`, a plain `.input` adds on Enter or a comma.
	 *
	 * `values` is bindable. Each one is also a hidden `name[]` input, so a
	 * form submits them.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>, Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
		/** The values. Bindable. */
		values?: string[];
		/** For a form: one hidden `name[]` input per value. */
		name?: string;
		/** Refuse a value already there. */
		unique?: boolean;
		/** The default field's placeholder. */
		placeholder?: string;
		disabled?: boolean;
		/** At least one value. The default field is then `required` while the list is empty. */
		required?: boolean;
		/** The default field's longest value. */
		maxlength?: number;
		/** Colour the default field by its validity, as Input's `validator`. */
		validator?: boolean;
		/** The field, given `add`. Defaults to a plain input (Enter or comma adds). */
		field?: Snippet<[ChipsInputField]>;
		/** How one chip reads. Defaults to the value. */
		chip?: Snippet<[string]>;
		/** After every addition or removal. */
		onChange?: (values: string[]) => void;
		/** A remove button's accessible name. */
		removeLabel?: (value: string) => string;
		/** The list's accessible name. */
		listLabel?: string;
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
		required = false,
		maxlength,
		validator = false,
		field,
		chip,
		onChange,
		removeLabel = (v: string) => `Remove ${v}`,
		listLabel,
		chipClass = '',
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));

	let draft = $state('');

	function add(value: string) {
		const v = `${value ?? ''}`.trim();
		if (!v || disabled || (unique && values.includes(v))) return;
		values = [...values, v];
		onChange?.(values);
	}
	const has = (value: string) => values.includes(`${value ?? ''}`.trim());
	let missing = $derived(required && values.length === 0);

	function remove(i: number) {
		values = values.filter((_, n) => n !== i);
		onChange?.(values);
	}

	function draftKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			add(draft);
			draft = '';
		} else if (e.key === 'Backspace' && draft === '' && values.length && !disabled) {
			/* Backspace in the empty default field: the last chip goes. */
			remove(values.length - 1);
		}
	}
</script>

<div {...applied.rest} class={classes}>
	{#if field}
		{@render field({ add, has, missing })}
	{:else}
		<input
			class={cx('input', validator && 'validator')}
			bind:value={draft}
			{placeholder}
			{disabled}
			{maxlength}
			required={missing}
			onkeydown={draftKeydown}
			onblur={() => (add(draft), (draft = ''))}
		/>
	{/if}
	<ul class="chips-input-list" aria-label={listLabel}>
		{#each values as v, i (v + i)}
			<li class={cx('chip', chipClass)}>
				{#if chip}{@render chip(v)}{:else}{v}{/if}
				<button
					type="button"
					class="chips-input-remove"
					aria-label={removeLabel(v)}
					{disabled}
					onclick={() => remove(i)}
				>
					<svg viewBox="0 0 24 24" width="0.9em" height="0.9em" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
				</button>
			</li>
		{/each}
	</ul>
	{#if name}
		{#each values as v, i (v + i)}<input type="hidden" name="{name}[]" value={v} />{/each}
	{/if}
</div>
