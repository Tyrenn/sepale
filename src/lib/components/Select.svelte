<script module lang="ts">
	/** What .select is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs). */
	export const PREFIX = 'select';

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
	 * A choice among options. The options are written as children, or given as
	 * data (`options`) — objects read through `optionvalue` and `optionname`.
	 *
	 * One choice is a native `<select>`. Several (`multiple`) is a .select frame
	 * that opens a list of checkable rows, because a native multi-select is a
	 * tall box nobody knows how to use; a hidden native `<select multiple>`
	 * still carries the value into the form and its validation.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	// `size` is ours — the HTML attribute of the same name is a character count
	// our CSS overrides anyway.
	interface Props
		extends AxisProps<typeof AXES, typeof FLAGS>,
			Omit<HTMLSelectAttributes, 'size' | 'color' | 'value' | 'multiple'> {
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
		/** The options, as data. Written after any `children`. */
		options?: any[];
		/** The key of an option object holding its value. Default `value`. */
		optionvalue?: string;
		/** The key of an option object holding its text. Default `name`. */
		optionname?: string;
		/** How one option is drawn. Defaults to its `optionname` text. */
		option?: Snippet<[any]>;
		/** Shown while nothing is chosen. */
		placeholder?: string;
		/** The placeholder can be chosen back, to clear the field. */
		nullable?: boolean;
		/** Several choices: `value` is then an array. */
		multiple?: boolean;
		/** The text of a multiple field with several choices. Default `N selected`. */
		summary?: (chosen: any[]) => string;
		/** Called with the new value after every change. */
		onvalue?: (value: any) => void;
		/** The native `<select>`. Bindable. */
		element?: HTMLSelectElement;
		class?: string;
		value?: any;
		children?: Snippet;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		validator = false,
		hint,
		error = null,
		invalid = $bindable(false),
		options = [],
		optionvalue = 'value',
		optionname = 'name',
		option,
		placeholder,
		nullable = false,
		multiple = false,
		summary = (chosen: any[]) => `${chosen.length} selected`,
		onvalue,
		element = $bindable(),
		value = $bindable(),
		class: klass = '',
		disabled = false,
		children,
		onchange,
		onblur,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));

	const uid = $props.id();

	/** What is shown under the field. A disabled field shows nothing. */
	let message = $derived(disabled ? '' : error || (typeof invalid === 'string' ? invalid : ''));

	let classes = $derived(cx(PREFIX, applied.classes, (validator || !!message) && 'validator', klass));

	const keyOf = (o: any) => (o !== null && typeof o === 'object' ? o[optionvalue] : o);
	const nameOf = (o: any) => (o !== null && typeof o === 'object' ? o[optionname] : `${o}`);

	/** Check the field now and show the browser's message if it fails. */
	export function isValid(): boolean {
		if (!element || disabled) return !error;
		invalid = element.validity.valid ? false : element.validationMessage;
		return !error && !invalid;
	}

	/** Open the list of a multiple field. */
	export function show() {
		if (multiple && !disabled) open = true;
	}

	function changed() {
		if (invalid) isValid();
		onvalue?.(value);
	}

	function handleChange(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) {
		changed();
		onchange?.(e);
	}

	function handleBlur(e: FocusEvent & { currentTarget: EventTarget & HTMLSelectElement }) {
		if (validator) isValid();
		onblur?.(e);
	}

	/* ── Multiple ─────────────────────────────────────────────────────── */

	let open = $state(false);
	/** Keyboard position in the list; -1 is the frame itself. */
	let active = $state(-1);
	let frame: HTMLDivElement | undefined = $state();

	let chosen = $derived(Array.isArray(value) ? value : []);
	let chosenOptions = $derived(options.filter((o) => chosen.includes(keyOf(o))));

	let text = $derived(
		chosenOptions.length === 0
			? (placeholder ?? '')
			: chosenOptions.length === 1
				? nameOf(chosenOptions[0])
				: summary(chosenOptions)
	);

	/** Rows the keyboard walks through: the clearing row, then the options. */
	let rows = $derived(options.length + (nullable ? 1 : 0));

	function toggle(o: any) {
		const k = keyOf(o);
		value = chosen.includes(k) ? chosen.filter((v: any) => v !== k) : [...chosen, k];
		changed();
	}

	function reset() {
		value = [];
		changed();
	}

	function activate(i: number) {
		if (nullable && i === 0) reset();
		else toggle(options[i - (nullable ? 1 : 0)]);
	}

	function close() {
		open = false;
		active = -1;
	}

	function frameKeydown(e: KeyboardEvent) {
		if (disabled) return;
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (!open) open = true;
			else if (rows) active = (active + 1) % rows;
		} else if (e.key === 'ArrowUp' && open && rows) {
			e.preventDefault();
			active = active <= 0 ? rows - 1 : active - 1;
		} else if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			if (!open) open = true;
			else if (active >= 0) activate(active);
		} else if (e.key === 'Escape' && open) {
			e.preventDefault();
			close();
		}
	}

	function frameClick(e: MouseEvent) {
		// A row already acted on mousedown; its click must not close the list.
		if ((e.target as Element).closest('.list-suggestions') || disabled) return;
		if (open) close();
		else open = true;
	}

	function frameFocusout(e: FocusEvent) {
		// Focus moving inside the frame (the hidden select) is not leaving it.
		if (frame?.contains(e.relatedTarget as Node | null)) return;
		close();
		if (validator) isValid();
	}
</script>

{#if multiple}
	<!-- The frame is the control: it takes the focus and the keys. A row
	     acts on mousedown and keeps the focus on the frame, so picking never
	     closes the list. -->
	<div
		bind:this={frame}
		class={classes}
		role="combobox"
		tabindex={disabled ? -1 : 0}
		aria-expanded={open}
		aria-haspopup="listbox"
		aria-controls="{uid}-list"
		aria-disabled={disabled || undefined}
		aria-invalid={message ? 'true' : undefined}
		aria-activedescendant={open && active >= 0 ? `${uid}-${active}` : undefined}
		onclick={frameClick}
		onkeydown={frameKeydown}
		onfocusout={frameFocusout}
	>
		<span style="overflow: hidden; text-overflow: ellipsis; flex: 1; opacity: {chosenOptions.length ? 1 : 0.6};"
			>{text}</span
		>

		<!-- Carries the value into the form, and `required` into validation. -->
		<select
			{...applied.rest}
			bind:this={element}
			bind:value
			{disabled}
			multiple
			tabindex="-1"
			aria-hidden="true"
			style="position: absolute; inset: 0; opacity: 0; pointer-events: none;"
		>
			{#each options as o (keyOf(o))}
				<option value={keyOf(o)}>{nameOf(o)}</option>
			{/each}
		</select>

		{#if open}
			<ul id="{uid}-list" class="list list-suggestions" role="listbox" aria-multiselectable="true">
				{#if nullable}
					<li
						id="{uid}-0"
						class="list-row"
						role="option"
						aria-selected={active === 0}
						onmousedown={(e) => {
							e.preventDefault();
							reset();
						}}
					>
						{placeholder ?? '—'}
					</li>
				{/if}
				{#each options as o, i (keyOf(o))}
					{@const row = i + (nullable ? 1 : 0)}
					<li
						id="{uid}-{row}"
						class="list-row"
						role="option"
						aria-selected={active === row}
						aria-checked={chosen.includes(keyOf(o))}
						onmousedown={(e) => {
							e.preventDefault();
							toggle(o);
						}}
					>
						<input
							type="checkbox"
							class="checkbox checkbox-sm"
							checked={chosen.includes(keyOf(o))}
							tabindex="-1"
							aria-hidden="true"
							style="pointer-events: none;"
						/>
						{#if option}{@render option(o)}{:else}{nameOf(o)}{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
{:else}
	<!-- Ours first: what the caller writes in the spread still wins. -->
	<select
		aria-invalid={message ? 'true' : undefined}
		{...applied.rest}
		bind:this={element}
		class={classes}
		bind:value
		{disabled}
		onchange={handleChange}
		onblur={handleBlur}
	>
		{#if placeholder !== undefined}
			<!-- Chosen while the value is empty. Only nullable lets it be chosen back. -->
			<option value={undefined} disabled={!nullable} hidden={!nullable}>{placeholder}</option>
		{/if}
		{@render children?.()}
		{#each options as o (keyOf(o))}
			<option value={keyOf(o)}>{#if option}{@render option(o)}{:else}{nameOf(o)}{/if}</option>
		{/each}
	</select>
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
