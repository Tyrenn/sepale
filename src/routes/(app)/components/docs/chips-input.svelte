<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['chips-input'],
		description:
			"An accumulator: several values, each a chip, collected from a field. The field is any component — a plain input by default, or an Input, a Select, a Combobox — that calls add(value). The frame is the family's .input, grown to wrap.",
		classes: {
			'chips-input': 'The grown .input frame holding the chips and the field.',
			'chips-input-remove': "A chip's remove button.",
			'chips-input-field': 'The default field: Enter or a comma adds.'
		},
		props: {
			ChipsInput: [
				{ name: 'values', type: 'string[]', description: 'Bindable.' },
				{ name: 'name', type: 'string', description: 'For a form: one hidden name[] input per value.' },
				{ name: 'unique', type: 'boolean', default: 'true', description: 'Refuse a value already there.' },
				{ name: 'side', type: "'top' | 'bottom' | 'start' | 'end'", default: "'bottom'", description: 'Where the list sits.' },
				{ name: 'field', type: 'Snippet<[{ add, has }]>', description: 'The field; it calls add(value). Defaults to a plain input.' },
				{ name: 'chip', type: 'Snippet<[string]>', description: 'How a chip reads.' },
				{ name: 'chipClass', type: 'string', description: 'Classes on each chip: chip-primary, chip-soft…' },
				{ name: 'onChange', type: '(values) => void', description: 'After every addition or removal.' },
				{ name: 'placeholder / disabled / removeLabel', type: '', description: 'As named.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { ChipsInput, Combobox, Select } from '$lib/index.js';

	let tags = $state(['svelte', 'css']);
	const CITIES = ['Lyon', 'Paris', 'Marseille', 'Lille', 'Nantes', 'Bordeaux', 'Toulouse'];
	let cities = $state<string[]>([]);
	let picker: Combobox | undefined = $state();
</script>

<Section
	title="Free values"
	subtitle="Enter or a comma adds; Backspace in the empty field removes the last."
	svelte={`<ChipsInput bind:values={tags} name="tags" placeholder="Add a tag" />`}
	html={`<div class="input chips-input">
  <span class="chip">svelte<button class="chips-input-remove" aria-label="Remove svelte">×</button></span>
  <input class="chips-input-field" placeholder="Add a tag">
  <input type="hidden" name="tags[]" value="svelte">
</div>`}
>
	<div style="display:grid; gap:.5em; width:100%; max-width:28em">
		<ChipsInput bind:values={tags} name="tags" placeholder="Add a tag" chipClass="chip-soft chip-primary" />
		<small>{JSON.stringify(tags)}</small>
	</div>
</Section>

<Section
	title="With a combobox"
	subtitle="The combobox picks one city; the chips input keeps them."
	svelte={`<ChipsInput bind:values={cities}>
  {#snippet field({ add })}
    <Combobox bind:this={picker} options={CITIES} placeholder="City"
      onSelect={(c) => { if (c) { add(c); picker.clear(); } }} />
  {/snippet}
</ChipsInput>`}
	html={`<div class="input chips-input">… <div class="combobox">…</div></div>`}
>
	<div style="width:100%; max-width:28em; min-height:14em">
		<ChipsInput bind:values={cities}>
			{#snippet field({ add })}
				<Combobox
					bind:this={picker}
					options={CITIES}
					placeholder="City"
					onSelect={(c) => {
						if (c) {
							add(c);
							picker?.clear();
						}
					}}
				/>
			{/snippet}
		</ChipsInput>
	</div>
</Section>

<Section
	title="With a select"
	subtitle="The list on the side, after the field."
	svelte={`<ChipsInput side="end">
  {#snippet field({ add })}
    <Select options={['Red', 'Green', 'Blue']} placeholder="Colour" onValue={(v) => v && add(v)} />
  {/snippet}
</ChipsInput>`}
	html={`<div class="input chips-input">… <select class="select">…</select></div>`}
>
	<div style="width:100%; max-width:28em">
		<ChipsInput side="end" values={['Red']} chipClass="chip-outline">
			{#snippet field({ add })}
				<Select options={['Red', 'Green', 'Blue']} placeholder="Colour" onValue={(v) => v && add(v)} />
			{/snippet}
		</ChipsInput>
	</div>
</Section>


<Section
	title="List above"
	svelte={`<ChipsInput side="top" values={['design', 'ui']} placeholder="Add a label" />`}
	html={`<div class="chips-input chips-input-top">…</div>`}
>
	<div style="width:100%; max-width:28em">
		<ChipsInput side="top" values={['design', 'ui']} placeholder="Add a label" chipClass="chip-primary" />
	</div>
</Section>
