<script lang="ts">
	/**
	 * A date field: the family's Input as a real `<input type="date">`
	 * (`datetime-local`, `time`). Typed in segments, picked from the
	 * browser's own box (the system's on a phone), validated by the browser.
	 * It draws nothing of its own — no namespace — and leaves the native
	 * behaviour alone: only the value is turned into a Date.
	 *
	 * A range, several dates, or the family's calendar: Calendar.
	 */
	import type { ComponentProps } from 'svelte';
	import Input from './Input.svelte';

	type Kind = 'date' | 'datetime-local' | 'time';

	interface Props {
		/** The date the field holds, null while it holds nothing whole. Bindable. */
		value?: Date | null;
		/** A day (default), a day and a time, or a time alone. */
		type?: Kind;
		id?: string;
		/** For a form: the input's name. Submitted as YYYY-MM-DD (YYYY-MM-DDTHH:mm, HH:mm). */
		name?: string;
		required?: boolean;
		disabled?: boolean;
		min?: Date;
		max?: Date;
		/** When the field is left changed (its `change`), and when it is cleared (`null`). */
		onvalue?: (value: Date | null) => void;
		/** Colour the field by its validity, as Input's `validator`. */
		validator?: boolean;
		/** An error from outside, as on Input: shown, and the field is invalid. */
		error?: string | null;
		/** The field's size, as Input's. */
		size?: ComponentProps<typeof Input>['size'];
		class?: string;
	}

	let {
		value = $bindable(),
		type = 'date',
		id,
		name,
		required = false,
		disabled = false,
		min,
		max,
		onvalue,
		validator = false,
		error = null,
		size,
		class: klass = ''
	}: Props = $props();

	const pad = (n: number, w = 2) => String(n).padStart(w, '0');
	const day = (d: Date) => `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
	const clock = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

	/** A date as the native input writes it. */
	function serial(d: Date | null | undefined): string {
		if (!d) return '';
		if (type === 'time') return clock(d);
		if (type === 'datetime-local') return `${day(d)}T${clock(d)}`;
		return day(d);
	}

	/** What the native input holds, as a Date: null while it holds nothing
	    whole. A time alone keeps the day of the value it changes. */
	function parse(text: string): Date | null {
		const n = text.match(/\d+/g)?.map(Number) ?? [];
		if (type === 'time') {
			if (n.length < 2) return null;
			const d = value ? new Date(value) : new Date();
			d.setHours(n[0]!, n[1]!, 0, 0);
			return d;
		}
		if (n.length < 3) return null;
		/* setFullYear: a year being typed (0002) is not taken for 1902. */
		const d = new Date(0);
		d.setFullYear(n[0]!, n[1]! - 1, n[2]!);
		d.setHours(n[3] ?? 0, n[4] ?? 0, 0, 0);
		return d;
	}
</script>

<!-- The value follows every whole date typed; `onvalue` comes when the
     field is left changed, as a native `change`. -->
<Input
	{id}
	{name}
	{type}
	{size}
	{required}
	{disabled}
	{validator}
	{error}
	class={klass}
	min={min ? serial(min) : undefined}
	max={max ? serial(max) : undefined}
	value={serial(value)}
	oninput={(e: Event & { currentTarget: HTMLInputElement }) => {
		const next = parse(e.currentTarget.value);
		if (next || !e.currentTarget.value) value = next;
	}}
	onchange={(e: Event & { currentTarget: HTMLInputElement }) => {
		value = parse(e.currentTarget.value);
		onvalue?.(value);
	}}
/>
