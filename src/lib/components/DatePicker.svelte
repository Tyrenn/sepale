<script lang="ts">
	/**
	 * A field that opens a calendar: an Input, a Dropdown and an inline
	 * Calendar, put together. It draws nothing of its own — no namespace —
	 * so it looks like the family's input, dropdown and calendar.
	 *
	 * The value lives in a real `<input type="date">` (`datetime-local`,
	 * `time`), visually hidden: it carries `name`, `required`, `min` and
	 * `max`, so a form submits and validates it as the browser does, and the
	 * page says what the field holds. The visible field is read only and
	 * shows `format(value)`; the calendar only writes into the native one.
	 * When the browser finds it invalid, the visible field shows why.
	 *
	 * `value` is a Date, or `[start, end]` with `range` (then the native
	 * input is a text one holding `start/end`). A single date closes the box
	 * on its pick, a range on its second date; with a time, the box stays
	 * open while the time is set.
	 */
	import type { ComponentProps } from 'svelte';
	import Input from './Input.svelte';
	import Dropdown from './Dropdown.svelte';
	import Calendar from './Calendar.svelte';

	type Value = Date | Date[] | null;
	type Kind = 'date' | 'datetime-local' | 'time';

	interface Props {
		/** The picked date, or [start, end] with `range`. Bindable. */
		value?: Value;
		/** A day (default), a day and a time, or a time alone. */
		type?: Kind;
		/** Pick a start and an end. Days only. */
		range?: boolean;
		/** On the visible field, for a `<label for>`. */
		id?: string;
		/** For a form: the native input's name. */
		name?: string;
		/** A value is needed: the native input says so to its form. */
		required?: boolean;
		placeholder?: string;
		disabled?: boolean;
		min?: Date;
		max?: Date;
		/** How a value is written in the field. Defaults to the browser's locale for the type. */
		format?: (date: Date) => string;
		/** After every completed pick, and after a clear (`null`). */
		onvalue?: (value: Value) => void;
		/** Colour the field by its validity, as Input's `validator`. */
		validator?: boolean;
		/** An error from outside, as on Input: shown, and the field is invalid. */
		error?: string | null;
		/** Anything else the Calendar takes: locale, firstDay, view… */
		calendar?: Partial<ComponentProps<typeof Calendar>>;
		/** The field's size, as Input's. */
		size?: ComponentProps<typeof Input>['size'];
		class?: string;
	}

	let {
		value = $bindable(),
		type = 'date',
		range = false,
		id,
		name,
		required = false,
		placeholder,
		disabled = false,
		min,
		max,
		format,
		onvalue,
		validator = false,
		error = null,
		calendar = {},
		size,
		class: klass = ''
	}: Props = $props();

	let open = $state(false);
	/** The browser's message once it found the native input invalid. */
	let refused = $state<string | null>(null);

	let ranged = $derived(range && type === 'date');
	let timed = $derived(type !== 'date');

	const list = (v: Value | undefined): Date[] => (v == null ? [] : Array.isArray(v) ? v : [v]);
	const pad = (n: number) => String(n).padStart(2, '0');
	const day = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
	const clock = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

	/** A date as the native input writes it. */
	function serial(d: Date): string {
		if (type === 'time') return clock(d);
		if (type === 'datetime-local') return `${day(d)}T${clock(d)}`;
		return day(d);
	}

	function shown(d: Date): string {
		if (format) return format(d);
		if (type === 'time') return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
		if (type === 'datetime-local') return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
		return d.toLocaleDateString();
	}

	let text = $derived(list(value).map(shown).join(' – '));
	let submitted = $derived(list(value).map(serial).join('/'));

	/* The native input checks `min` and `max` itself, written as it reads them.
	   A range is a text input: only `required` is checked there. */
	let bounds = $derived({
		min: min && !ranged ? serial(min) : undefined,
		max: max && !ranged ? serial(max) : undefined
	});

	function picked(next: Value) {
		value = next;
		refused = null;
		const done = ranged ? list(next).length === 2 : next != null;
		if (done) {
			if (!timed) open = false;
			onvalue?.(next);
		}
	}

	function clear() {
		value = null;
		refused = null;
		onvalue?.(null);
	}
</script>

<span class={klass} style="position: relative; display: inline-block;">
	<Dropdown bind:open>
		{#snippet trigger({ props })}
			<Input
				{...props}
				{id}
				{size}
				{placeholder}
				{disabled}
				{validator}
				error={error || refused}
				value={text}
				readonly
				aria-haspopup="dialog"
				aria-required={required || undefined}
				onkeydown={(e: KeyboardEvent) => {
					if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
						e.preventDefault();
						props.onclick();
					} else if ((e.key === 'Backspace' || e.key === 'Delete') && value != null) {
						e.preventDefault();
						clear();
					}
				}}
			/>
		{/snippet}
		<Calendar
			{...calendar}
			range={ranged}
			timepicker={timed}
			options={type === 'time' ? { onlyTimepicker: true, ...calendar.options } : calendar.options}
			{min}
			{max}
			{value}
			onvalue={picked}
		/>
	</Dropdown>
	<!-- What the field holds, as the browser reads it: the form's value and
	     its validity. Out of sight and out of the tab order; when the browser
	     finds it invalid, the visible field shows the message. -->
	<input
		type={ranged ? 'text' : type}
		{name}
		{required}
		{disabled}
		min={bounds.min}
		max={bounds.max}
		value={submitted}
		tabindex="-1"
		aria-hidden="true"
		style="position: absolute; inset-inline-start: 0; inset-block-end: 0; width: 1px; height: 1px; opacity: 0; pointer-events: none;"
		oninvalid={(e) => (refused = e.currentTarget.validationMessage)}
	/>
</span>
