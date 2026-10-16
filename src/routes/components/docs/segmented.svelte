<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['segmented'],
		description:
			'One choice among a few, as a pill track. A radio group underneath: keyboard, forms and screen readers treat it as one. For many choices, use a select.',
		classes: {
			segmented: 'The track.',
			'segmented-item': 'One label; filled when its radio is checked.',
			'segmented-input': 'The radio, laid invisibly over its label.'
		},
		props: {
			Segmented: [
				{ name: 'options', type: '(string | { value, label?, disabled? })[]', description: 'The choices.' },
				{ name: 'value', type: 'string', description: "The checked option's value. Bindable." },
				{ name: 'name', type: 'string', description: "The radios' name, for a form." },
				{ name: 'label', type: 'string', description: "The group's accessible name." },
				{ name: 'onChange', type: '(value: string) => void', description: 'After the user picked another option.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Segmented } from '$lib/index.js';

	let view = $state('list');
</script>

<Section
	title="Basic"
	svelte={`<Segmented options={['list', 'grid', 'board']} bind:value={view} label="View" />`}
	html={`<div class="segmented" role="radiogroup" aria-label="View">
  <label class="segmented-item"><input type="radio" class="segmented-input" name="v" value="list" checked>list</label>
  <label class="segmented-item"><input type="radio" class="segmented-input" name="v" value="grid">grid</label>
</div>`}
>
	<Segmented options={['list', 'grid', 'board']} bind:value={view} label="View" />
	<span>{view}</span>
</Section>

<Section
	title="Sizes, colors, block"
	svelte={`<Segmented size="sm" color="primary" options={…} value="day" />
<Segmented block options={…} value="b" />`}
	html={`<div class="segmented segmented-sm segmented-primary">…</div>
<div class="segmented segmented-block">…</div>`}
>
	<div style="display:grid; gap:.75em; width:100%; justify-items:start">
		<Segmented size="sm" color="primary" options={['day', 'week', 'month']} value="day" />
		<Segmented options={[{ value: 'a', label: 'Monthly' }, { value: 'b', label: 'Yearly' }, { value: 'c', label: 'Lifetime', disabled: true }]} value="b" />
		<Segmented size="lg" options={['S', 'M', 'L', 'XL']} value="M" />
		<div style="width:100%"><Segmented block options={['Overview', 'Activity', 'Settings']} value="Activity" /></div>
	</div>
</Section>
