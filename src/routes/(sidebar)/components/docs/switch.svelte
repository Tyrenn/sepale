<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['switch'],
		description:
			'One choice among a few, as a pill track. A radio group underneath: keyboard, forms and screen readers treat it as one. For many choices, use a select.',
		classes: {
			switch: 'The track.',
			'switch-item': 'One label; filled when its radio is checked.',
			'switch-input': 'The radio, laid invisibly over its label.'
		},
		props: {
			Switch: [
				{ name: 'options', type: '(string | { value, label?, disabled? })[]', description: 'The choices.' },
				{ name: 'value', type: 'string', description: "The checked option's value. Bindable." },
				{ name: 'name', type: 'string', description: "The radios' name, for a form." },
				{ name: 'label', type: 'string', description: "The group's accessible name." },
				{ name: 'onvalue', type: '(value: string) => void', description: 'After the user picked another option.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Switch } from '$lib/index.js';

	let view = $state('list');
</script>

<Section
	title="Basic"
	svelte={`<Switch options={['list', 'grid', 'board']} bind:value={view} label="View" />`}
	html={`<div class="switch" role="radiogroup" aria-label="View">
  <label class="switch-item"><input type="radio" class="switch-input" name="v" value="list" checked>list</label>
  <label class="switch-item"><input type="radio" class="switch-input" name="v" value="grid">grid</label>
</div>`}
>
	<Switch options={['list', 'grid', 'board']} bind:value={view} label="View" />
	<span>{view}</span>
</Section>

<Section
	title="Sizes, colors, block"
	svelte={`<Switch size="sm" color="primary" options={…} value="day" />
<Switch block options={…} value="b" />`}
	html={`<div class="switch switch-sm switch-primary">…</div>
<div class="switch switch-block">…</div>`}
>
	<div style="display:grid; gap:.75em; width:100%; justify-items:start">
		<Switch size="sm" color="primary" options={['day', 'week', 'month']} value="day" />
		<Switch options={[{ value: 'a', label: 'Monthly' }, { value: 'b', label: 'Yearly' }, { value: 'c', label: 'Lifetime', disabled: true }]} value="b" />
		<Switch size="lg" options={['S', 'M', 'L', 'XL']} value="M" />
		<div style="width:100%"><Switch block options={['Overview', 'Activity', 'Settings']} value="Activity" /></div>
	</div>
</Section>
