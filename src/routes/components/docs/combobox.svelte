<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['combobox'],
		description:
			"A field whose value is looked up in a list while typing. Strict, the value is a picked option and a hidden select carries it; free, the value is the text and the options only complete it. Options come from a list, a function or an address answering JSON. The frame is the family's .input, the list its .list-suggestions.",
		classes: {
			combobox: 'Holds the .input frame and the hidden select.',
			'combobox-option': 'One option row (also a .list-row).',
			'combobox-multiple': 'Written when several can be picked: each option carries a box.'
		},
		props: {
			Combobox: [
				{ name: 'options', type: 'any[] | (q) => any[] | Promise | string | { uri, options? }', description: 'A list (filtered here), a function of the query, or an address answering JSON.' },
				{ name: 'then', type: '(answer) => any[]', description: 'Reshape what a function or an address answered.' },
				{ name: 'show', type: '(option) => string', description: 'The text an option stands for. Defaults to label, name, value or id.' },
				{ name: 'key', type: '(option) => string | number', description: 'What identifies an option and what the select submits. Defaults to id, value, then the label.' },
				{ name: 'strict', type: 'boolean', default: 'true', description: 'The value is a picked option; false makes it the text (autocompletion).' },
				{ name: 'multiple', type: 'boolean', default: 'false', description: 'Pick several; implies strict. The field shows a summary.' },
				{ name: 'value', type: 'any', description: 'The pick(s) it starts with — the text when not strict. Read once.' },
				{ name: 'onSelect', type: '(value) => void', description: 'A pick changed: the option, undefined when dropped, or the list.' },
				{ name: 'onInput', type: '(text) => void', description: 'The text changed (free mode).' },
				{ name: 'name', type: 'string', description: 'Strict: on the hidden select. Free: on the input.' },
				{ name: 'wait / eager / float', type: 'number / boolean / boolean', description: 'Debounce in ms (100); open on focus; draw the list at fixed coordinates over scrolling ancestors.' },
				{ name: 'add', type: '{ show?, max?, onAdd }', description: 'A last "create what is typed" row.' },
				{ name: 'summary', type: '(picks) => string', description: 'The field text for several picks. Labels joined, or "n selected".' },
				{ name: 'option', type: 'Snippet<[any]>', description: 'How one option is drawn.' },
				{ name: 'start / end', type: 'Snippet', description: 'Inside the frame, before and after the text.' },
				{ name: 'field', type: 'string', description: 'Extra classes on the .input frame: input-ghost, input-primary…' },
				{ name: 'clear() / focus()', type: 'methods', description: 'Through bind:this.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Combobox } from '$lib/index.js';

	const FRUITS = ['Apple', 'Apricot', 'Banana', 'Blueberry', 'Cherry', 'Grape', 'Lemon', 'Mango', 'Orange', 'Peach', 'Pear', 'Plum'];
	const COUNTRIES = [
		{ code: 'FR', name: 'France' },
		{ code: 'DE', name: 'Germany' },
		{ code: 'ES', name: 'Spain' },
		{ code: 'IT', name: 'Italy' },
		{ code: 'PT', name: 'Portugal' }
	];

	let country: { code: string; name: string } | undefined = $state();
	let typed = $state('');
	let created: string | undefined = $state();
	let picks: { code: string; name: string }[] = $state([]);

	/** A function source standing in for a server: answers after a delay. */
	const remote = (q: string) =>
		new Promise<typeof COUNTRIES>((ok) => setTimeout(() => ok(COUNTRIES.filter((c) => c.name.toLowerCase().startsWith(q.toLowerCase()))), 300));
</script>

<Section
	title="Strict"
	subtitle="Only a picked option is a value: type, then leave the field without picking — the last pick comes back."
	svelte={`<Combobox options={COUNTRIES} show={(c) => c.name} key={(c) => c.code}
  name="country" placeholder="Country" eager onSelect={(c) => (country = c)} />`}
	html={`<div class="combobox">
  <label class="input">
    <input role="combobox" aria-expanded="true" aria-controls="l1" aria-autocomplete="list">
    <ul id="l1" class="list list-suggestions" role="listbox">
      <li class="list-row combobox-option" role="option" aria-selected="true">France</li>
    </ul>
  </label>
  <select name="country" hidden><option value="FR" selected>France</option></select>
</div>`}
>
	<div style="display:flex; flex-direction:column; gap:.5rem; min-height:14rem;">
		<Combobox options={COUNTRIES} show={(c) => c.name} key={(c) => c.code} name="country" placeholder="Country" eager onSelect={(c) => (country = c)} />
		<small>value: {country ? JSON.stringify(country) : '—'}</small>
	</div>
</Section>

<Section
	title="Free: autocompletion"
	subtitle="The value is the text; the list only completes it. The last row creates what is typed."
	svelte={`<Combobox strict={false} options={FRUITS} name="fruit" placeholder="Fruit"
  onInput={(t) => (typed = t)} add={{ max: 3, onAdd: (v) => (created = v) }} />`}
	html={`<div class="combobox">
  <label class="input"><input role="combobox" name="fruit" …></label>
</div>`}
>
	<div style="display:flex; flex-direction:column; gap:.5rem; min-height:14rem;">
		<Combobox strict={false} options={FRUITS} name="fruit" placeholder="Fruit" onInput={(t) => (typed = t)} add={{ max: 3, onAdd: (v) => (created = v) }} />
		<small>text: {typed || '—'} · created: {created ?? '—'}</small>
	</div>
</Section>

<Section
	title="From a function"
	subtitle="A promise per query, answers out of order dropped. An address answering JSON works the same: options={'/api/countries?q=…'}."
	svelte={`<Combobox options={(q) => fetchCountries(q)} show={(c) => c.name} placeholder="Country" />
<Combobox options={{ uri: (q) => \`/api/countries?q=\${q}\` }} then={(r) => r.items} />`}
	html={`<!-- the same DOM -->`}
>
	<div style="min-height:12rem"><Combobox options={remote} show={(c) => c.name} placeholder="Country (300 ms)" /></div>
</Section>

<Section
	title="Multiple"
	subtitle="The list stays open while ticking; the field summarises the picks."
	svelte={`<Combobox multiple options={COUNTRIES} show={(c) => c.name} key={(c) => c.code}
  name="countries" placeholder="Countries" onSelect={(list) => (picks = list)} />`}
	html={`<div class="combobox combobox-multiple">
  <label class="input">…
    <ul class="list list-suggestions" role="listbox" aria-multiselectable="true">
      <li class="list-row combobox-option" role="option" aria-selected="true">France</li>
    </ul>
  </label>
  <select name="countries" multiple hidden>…</select>
</div>`}
>
	<div style="display:flex; flex-direction:column; gap:.5rem; min-height:14rem;">
		<Combobox multiple options={COUNTRIES} show={(c) => c.name} key={(c) => c.code} name="countries" placeholder="Countries" eager onSelect={(list) => (picks = list)} />
		<small>{picks.map((p) => p.code).join(', ') || '—'}</small>
	</div>
</Section>

<Section
	title="Sizes"
	svelte={`<Combobox size="sm" … />
<Combobox size="lg" … />`}
	html={`<div class="combobox combobox-sm">…</div>`}
>
	<Combobox size="sm" options={FRUITS} placeholder="Small" />
	<Combobox options={FRUITS} placeholder="Medium" />
	<Combobox size="lg" options={FRUITS} placeholder="Large" />
</Section>
