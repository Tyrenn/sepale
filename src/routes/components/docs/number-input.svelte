<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['number-input'],
		description:
			'A number with − and + beside it. The field is a real number input; the buttons step it within its own min, max and step.',
		classes: {
			'number-input': 'The frame, field-shaped.',
			'number-input-dec': 'The − button.',
			'number-input-field': 'The input, native spinners hidden.',
			'number-input-inc': 'The + button.'
		},
		props: {
			NumberInput: [
				{ name: 'value', type: 'number | null', description: 'Bindable; null when empty.' },
				{ name: 'min / max / step', type: 'number', description: 'As on the native input; the buttons honour them.' },
				{ name: 'disabled', type: 'boolean', default: 'false', description: 'No typing, no stepping.' },
				{ name: 'onValue', type: '(value: number | null) => void', description: 'After every change, typed or stepped.' },
				{ name: 'decreaseLabel / increaseLabel', type: 'string', description: "The buttons' accessible names." }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { NumberInput } from '$lib/index.js';

	let qty = $state<number | null>(2);
</script>

<Section
	title="Basic"
	svelte={`<NumberInput bind:value={qty} min={0} max={10} name="qty" />`}
	html={`<div class="number-input">
  <button type="button" class="number-input-dec" aria-label="Decrease">−</button>
  <input type="number" class="number-input-field" name="qty" value="2" min="0" max="10">
  <button type="button" class="number-input-inc" aria-label="Increase">+</button>
</div>`}
>
	<NumberInput bind:value={qty} min={0} max={10} name="qty" />
	<span>{qty}</span>
</Section>

<Section
	title="Sizes and step"
	svelte={`<NumberInput size="sm" value={1} />
<NumberInput size="lg" value={0.5} step={0.25} />
<NumberInput disabled value={3} />`}
	html={`<div class="number-input number-input-sm">…</div>`}
>
	<NumberInput size="sm" value={1} />
	<NumberInput value={5} />
	<NumberInput size="lg" value={0.5} step={0.25} />
	<NumberInput disabled value={3} />
</Section>
