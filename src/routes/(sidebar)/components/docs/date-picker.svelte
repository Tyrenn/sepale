<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: [],
		description:
			"A date field: the family's Input as a real <input type=\"date\"> (datetime-local, time). Typed in, picked from the browser's own box (the system's on a phone), validated by the browser; the native behaviour is left alone, only the value is turned into a Date. As wide as the date and its picker button. A range, several dates or the family's calendar: Calendar.",
		classes: {},
		props: {
			DatePicker: [
				{ name: 'value', type: 'Date | null', description: 'Bindable. Null while the field holds nothing whole.' },
				{ name: 'type', type: "'date' | 'datetime-local' | 'time'", default: "'date'", description: 'A day, a day and a time, or a time alone.' },
				{ name: 'name / required', type: '', description: 'On the input: submitted as YYYY-MM-DD (YYYY-MM-DDTHH:mm, HH:mm).' },
				{ name: 'id / disabled / size', type: '', description: 'As on Input.' },
				{ name: 'validator / error', type: '', description: 'As on Input.' },
				{ name: 'min / max', type: 'Date', description: 'Bounds, checked by the browser.' },
				{ name: 'onvalue', type: '(value) => void', description: 'When the field is left changed (its change event), null when cleared.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { DatePicker } from '$lib/index.js';

	let day = $state<Date | null>(null);
	let meeting = $state<Date | null>(null);
</script>

<Section
	title="One date"
	svelte={`<DatePicker bind:value={day} name="day" />`}
	html={`<input class="input" type="date" name="day">`}
>
	<DatePicker bind:value={day} name="day" />
	<span>{day ? day.toDateString() : '—'}</span>
</Section>

<Section
	title="A day and a time, required"
	svelte={`<DatePicker type="datetime-local" required validator bind:value={meeting} name="meeting" />`}
	html={`<input class="input validator" type="datetime-local" name="meeting" required>`}
>
	<DatePicker type="datetime-local" required validator bind:value={meeting} name="meeting" />
</Section>
