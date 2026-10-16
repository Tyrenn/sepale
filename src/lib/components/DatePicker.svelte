<script lang="ts">
	/**
	 * A field that opens a calendar: an Input, a Dropdown and an inline
	 * Calendar, put together. It draws nothing of its own — no namespace —
	 * so it looks like the family's input, dropdown and calendar.
	 *
	 * `value` is a Date, or `[start, end]` with `range`. The field is read
	 * only and shows `format(value)`; a hidden input carries the ISO date
	 * (`YYYY-MM-DD`, or `start/end`) under `name` for a form. A single pick
	 * closes the box; a range closes on its second date.
	 *
	 * Calendar's own `inline={false}` mode does the same with air-datepicker's
	 * popup; this one keeps the family's Dropdown and Input.
	 */
	import type { ComponentProps } from 'svelte';
	import Input from './Input.svelte';
	import Dropdown from './Dropdown.svelte';
	import Calendar from './Calendar.svelte';

	type Value = Date | Date[] | null;

	interface Props {
		/** The picked date, or [start, end] with `range`. Bindable. */
		value?: Value;
		/** Pick a start and an end. */
		range?: boolean;
		/** For a form: the ISO date(s), in a hidden input. */
		name?: string;
		placeholder?: string;
		disabled?: boolean;
		min?: Date;
		max?: Date;
		/** How a date is written in the field. Defaults to the browser's locale. */
		format?: (date: Date) => string;
		/** After every completed pick. */
		onChange?: (value: Value) => void;
		/** Anything else the Calendar takes: locale, firstDay, view… */
		calendar?: Partial<ComponentProps<typeof Calendar>>;
		/** The field's size, as Input's. */
		size?: ComponentProps<typeof Input>['size'];
		class?: string;
	}

	let {
		value = $bindable(null),
		range = false,
		name,
		placeholder,
		disabled = false,
		min,
		max,
		format = (d: Date) => d.toLocaleDateString(),
		onChange,
		calendar = {},
		size,
		class: klass = ''
	}: Props = $props();

	let open = $state(false);

	const list = (v: Value): Date[] => (v == null ? [] : Array.isArray(v) ? v : [v]);
	const iso = (d: Date) =>
		`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

	let text = $derived(list(value).map(format).join(' – '));
	let submitted = $derived(list(value).map(iso).join('/'));

	function picked(next: Value) {
		value = next;
		const done = range ? list(next).length === 2 : next != null;
		if (done) {
			open = false;
			onChange?.(next);
		}
	}
</script>

<Dropdown bind:open class={klass}>
	{#snippet trigger({ props })}
		<Input
			{...props}
			{size}
			{placeholder}
			{disabled}
			value={text}
			readonly
			aria-haspopup="dialog"
			onkeydown={(e: KeyboardEvent) => {
				if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
					e.preventDefault();
					props.onclick();
				}
			}}
		/>
	{/snippet}
	<Calendar {...calendar} {range} {min} {max} {value} onChange={picked} />
</Dropdown>
{#if name}<input type="hidden" {name} value={submitted} />{/if}
