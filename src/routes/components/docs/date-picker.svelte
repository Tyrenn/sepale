<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: [],
		description:
			"A field that opens a calendar: an Input, a Dropdown and an inline Calendar put together. It draws nothing of its own, so it wears the family's input, dropdown and calendar. A day, a day and a time, a time alone, or a range. The value lives in a real, visually hidden <input type=\"date\"> (datetime-local, time): a form submits and validates it as the browser does.",
		classes: {},
		props: {
			DatePicker: [
				{ name: 'value', type: 'Date | [Date, Date] | null', description: 'Bindable.' },
				{ name: 'type', type: "'date' | 'datetime-local' | 'time'", default: "'date'", description: 'A day, a day and a time, or a time alone. With a time, the box stays open while it is set.' },
				{ name: 'range', type: 'boolean', default: 'false', description: 'Days only. Pick a start and an end; the box closes on the second date.' },
				{ name: 'name / required', type: '', description: 'On the native input: YYYY-MM-DD (YYYY-MM-DDTHH:mm, HH:mm), or start/end for a range.' },
				{ name: 'id', type: 'string', description: 'On the visible field, for a <label for>.' },
				{ name: 'validator / error', type: '', description: "As on Input. When the browser finds the native input invalid, the visible field shows its message." },
				{ name: 'placeholder / disabled / size', type: '', description: "As on Input." },
				{ name: 'min / max', type: 'Date', description: 'Bounds, for the calendar and the native input.' },
				{ name: 'format', type: '(date) => string', description: "How a date is written in the field. The browser's locale by default." },
				{ name: 'onChange', type: '(value) => void', description: 'After every completed pick.' },
				{ name: 'calendar', type: 'Calendar props', description: 'Anything else for the calendar: locale, firstDay, view…' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { DatePicker } from '$lib/index.js';

	let day = $state<Date | Date[] | null>(null);
	let stay = $state<Date | Date[] | null>(null);
	let meeting = $state<Date | Date[] | null>(null);
</script>

<Section
	title="One date"
	svelte={`<DatePicker bind:value={day} placeholder="Pick a day" name="day" />`}
	html={`<!-- an .input in a .dropdown, holding a .calendar -->`}
>
	<DatePicker bind:value={day} placeholder="Pick a day" name="day" />
	<span>{day instanceof Date ? day.toDateString() : '—'}</span>
</Section>

<Section
	title="A range"
	svelte={`<DatePicker range bind:value={stay} placeholder="Arrival – departure" min={new Date()} />`}
	html={`<!-- an .input in a .dropdown, holding a .calendar -->`}
>
	<DatePicker range bind:value={stay} placeholder="Arrival – departure" min={new Date()} />
</Section>

<Section
	title="A day and a time, required"
	svelte={`<DatePicker type="datetime-local" required validator bind:value={meeting} name="meeting" />`}
	html={`<!-- an .input in a .dropdown, holding a .calendar, and a hidden <input type="datetime-local" required> -->`}
>
	<DatePicker type="datetime-local" required validator bind:value={meeting} name="meeting" placeholder="Meeting" />
</Section>
