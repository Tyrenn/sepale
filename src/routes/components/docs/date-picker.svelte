<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: [],
		description:
			"A field that opens a calendar: an Input, a Dropdown and an inline Calendar put together. It draws nothing of its own, so it wears the family's input, dropdown and calendar. Single date or range.",
		classes: {},
		props: {
			DatePicker: [
				{ name: 'value', type: 'Date | [Date, Date] | null', description: 'Bindable.' },
				{ name: 'range', type: 'boolean', default: 'false', description: 'Pick a start and an end; the box closes on the second date.' },
				{ name: 'name', type: 'string', description: 'For a form: a hidden input carries YYYY-MM-DD, or start/end.' },
				{ name: 'placeholder / disabled / size', type: '', description: "As on Input." },
				{ name: 'min / max', type: 'Date', description: 'Bounds.' },
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
