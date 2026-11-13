<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['color-picker'],
		description:
			'One colour, edited in OKLCH: lightness, chroma and hue, each a slider whose track is the gradient it moves along, plus the raw value for anything the sliders cannot say. A panel, not a popover: put it in a Dropdown to float it.',
		classes: {
			'color-picker': 'The panel: a box of its own, unless flat.',
			'color-picker-flat': 'No box: the host — a dropdown, a card — draws it.',
			'color-picker-head': 'The preview and the value field, on one line.',
			'color-picker-preview': 'The colour, over a checkerboard. Reads --color-picker-value.',
			'color-picker-value': 'The raw value field, an .input.',
			'color-picker-channel': 'One channel: its letter, its track, its number.',
			'color-picker-track': 'A range input painted with --color-picker-track.',
			'color-picker-presets': 'A row of .swatch, one click away.'
		},
		props: {
			ColorPicker: [
				{ name: 'value', type: 'string', default: "'oklch(62% 0.19 260)'", description: 'Any CSS colour. Bindable; written back as oklch(…).' },
				{ name: 'presets', type: 'string[]', description: 'Colours one click away.' },
				{ name: 'noInput', type: 'boolean', default: 'false', description: 'Hide the raw value field.' },
				{ name: 'flat', type: 'boolean', default: 'false', description: 'No box of its own.' },
				{ name: 'labels', type: '{ l, c, h, value }', description: 'Accessible names.' },
				{ name: 'onvalue', type: '(value) => void', description: 'After every change.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Button, ColorPicker, Dropdown, Swatch } from '$lib/index.js';

	let a = $state('oklch(62% 0.19 260)');
	let b = $state('oklch(70% 0.15 150)');
	const PRESETS = ['oklch(62% 0.19 260)', 'oklch(65% 0.2 25)', 'oklch(80% 0.16 85)', 'oklch(70% 0.15 150)', 'oklch(55% 0.2 300)', 'oklch(25% 0.02 260)'];
</script>

<Section
	title="Panel"
	svelte={`<ColorPicker bind:value presets={[…]} />`}
	html={`<div class="color-picker" style="--color-picker-value: oklch(62% 0.19 260)">
  <div class="color-picker-head">
    <span class="color-picker-preview"></span>
    <input class="input input-sm color-picker-value" value="oklch(62% 0.19 260)">
  </div>
  <label class="color-picker-channel">
    <span>L</span>
    <input type="range" class="color-picker-track" min="0" max="1" step="0.005"
      style="--color-picker-track: linear-gradient(to right, …)">
    <output>62</output>
  </label>
  …
</div>`}
>
	<div style="display:grid; gap:.75rem; justify-items:center">
		<ColorPicker bind:value={a} presets={PRESETS} />
		<code style="font-size:.8rem">{a}</code>
	</div>
</Section>

<Section
	title="In a dropdown"
	subtitle="A swatch opens it; flat leaves the box to the dropdown."
	svelte={`<Dropdown>
  {#snippet trigger({ props })}
    <Button {...props}><Swatch sample={value} size="xs" /> Colour</Button>
  {/snippet}
  <ColorPicker flat bind:value />
</Dropdown>`}
	html={`<div class="dropdown dropdown-open">
  <button class="btn">…</button>
  <div class="dropdown-content"><div class="color-picker color-picker-flat">…</div></div>
</div>`}
>
	<div style="min-height:18rem">
		<Dropdown>
			{#snippet trigger({ props })}
				<Button {...props}><Swatch sample={b} size="xs" shape="circle" /> Colour</Button>
			{/snippet}
			<ColorPicker flat bind:value={b} />
		</Dropdown>
	</div>
</Section>
