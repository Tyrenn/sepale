<script module lang="ts">
	/**
	 * The hand-written half of this page: what the component is, what each
	 * of its classes does, and what its props mean. WHICH classes exist is
	 * not written here — that is read back from the active family's compiled
	 * CSS (src/lib/generated/components.ts), so a page cannot claim a class
	 * the family does not ship.
	 */
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['calendar'],
		description:
			'A date picker, drawn by air-datepicker (vendored, MIT). `.calendar` is the one class we own: the library’s own classes (`.air-datepicker-cell`, `.-selected-`…) are styled by each family from under it. Without the Svelte component, put air-datepicker inside a `<div class="calendar">` — or, as a popup, give it that element as its `container`.',
		classes: {},
		props: {
			Calendar: [
				{ name: 'value', type: 'Date | Date[] | null', default: '$bindable(null)', description: 'The picked date — an array with `range` or `multiple`.' },
				{ name: 'range', type: 'boolean', default: 'false', description: 'Pick a start and an end.' },
				{ name: 'multiple', type: 'boolean | number', default: 'false', description: 'Pick several dates, at most N when a number.' },
				{ name: 'inline', type: 'boolean', default: 'true', description: 'In the page, or as an `.input` field that opens it underneath.' },
				{ name: 'placeholder / name / disabled', type: 'string / string / boolean', description: 'The field’s, when not inline.' },
				{ name: 'min / max', type: 'Date', description: 'Dates outside cannot be picked.' },
				{ name: 'locale', type: 'AirDatepickerLocale', default: 'English', description: 'Month and day names. 33 locales ship in `vendor/air-datepicker/locale/`.' },
				{ name: 'firstDay', type: '0 … 6', description: 'First day of the week. Defaults to the locale’s.' },
				{ name: 'view / minView', type: "'days' | 'months' | 'years'", default: "'days'", description: 'The view it opens on; the finest one a pick can be made in (`minView="months"` picks a month).' },
				{ name: 'timepicker', type: 'boolean', default: 'false', description: 'Hours and minutes too.' },
				{ name: 'buttons', type: "('today' | 'clear')[]", description: 'Buttons under the calendar.' },
				{ name: 'dateFormat', type: 'string', description: 'How the field writes a date (air-datepicker tokens).' },
				{ name: 'options', type: 'AirDatepickerOptions', description: 'Anything else air-datepicker accepts. Applied last.' },
				{ name: 'onChange', type: '(value) => void', description: 'Called after every pick.' },
				{ name: 'picker', type: 'AirDatepicker', default: '$bindable()', description: 'The instance, for what no prop covers.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Calendar } from '$lib/index.js';
	import fr from '$lib/vendor/air-datepicker/locale/fr.js';

	let day: Date | Date[] | null = $state(new Date());
	let stay: Date | Date[] | null = $state(null);
	let when: Date | Date[] | null = $state(null);

	const show = (v: Date | Date[] | null) =>
		v == null ? '—' : (Array.isArray(v) ? v : [v]).map((d) => d.toLocaleDateString()).join(' → ');
</script>

<Section
	title="Inline"
	subtitle="One date. The arrows, the title (to zoom out to months and years) and the keyboard all work."
	svelte={`<Calendar bind:value={day} />`}
	html={`<div class="calendar">
	<div class="air-datepicker -inline-">…</div>
</div>`}
>
	<div style="display:flex; flex-direction:column; gap:.5rem; align-items:center;">
		<Calendar bind:value={day} />
		<small>value: {show(day)}</small>
	</div>
</Section>

<Section
	title="Range, in French"
	subtitle="`range`, a locale, a colour, and the today / clear buttons."
	svelte={`// import fr from '…/vendor/air-datepicker/locale/fr.js';
<Calendar range locale={fr} color="secondary" buttons={['today', 'clear']} bind:value={stay} />`}
	html={`<div class="calendar calendar-secondary">…</div>`}
>
	<div style="display:flex; flex-direction:column; gap:.5rem; align-items:center;">
		<Calendar range locale={fr} color="secondary" buttons={['today', 'clear']} bind:value={stay} />
		<small>value: {show(stay)}</small>
	</div>
</Section>

<Section
	title="As a field"
	subtitle="Not inline: an `.input` that opens the calendar under it — inside the `.calendar` element, not at the end of the page."
	svelte={`<Calendar inline={false} placeholder="Pick a date" timepicker bind:value={when} />`}
	html={`<div class="calendar">
	<input class="input" readonly placeholder="Pick a date" />
	<div class="air-datepicker -active- -bottom-left-">…</div>
</div>`}
>
	<div style="display:flex; flex-direction:column; gap:.5rem; align-items:center; min-height:24rem;">
		<Calendar inline={false} placeholder="Pick a date" timepicker bind:value={when} />
		<small>value: {when ? (when as Date).toLocaleString() : '—'}</small>
	</div>
</Section>

<Section
	title="Sizes"
	svelte={`<Calendar size="sm" />
<Calendar size="lg" />`}
	html={`<div class="calendar calendar-sm">…</div>`}
>
	<Calendar size="sm" />
	<Calendar size="lg" />
</Section>
