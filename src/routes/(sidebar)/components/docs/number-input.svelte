<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['number-input'],
		description:
			'A number field, its figure aligned to the end like a number in a column. The field is a real number input, and its value is always a number. With controls, a − and a + step it within its own min, max and step.',
		classes: {
			'number-input': 'The frame, field-shaped.',
			'number-input-dec': 'The − button, drawn with controls.',
			'number-input-field': 'The input, native spinners hidden. Its figure sits at the end, or centred between the buttons.',
			'number-input-inc': 'The + button, drawn with controls.'
		},
		props: {
			NumberInput: [
				{ name: 'value', type: 'number | null', description: 'Bindable. Always a number, parsed from the field, never its text; null when it is empty or holds no finite number.' },
				{ name: 'controls', type: 'boolean', default: 'false', description: 'Draw a − and a + around the field. Off, the field stands alone.' },
				{ name: 'min / max / step', type: 'number', description: 'As on the native input; the arrow keys and the buttons honour them.' },
				{ name: 'disabled', type: 'boolean', default: 'false', description: 'No typing, no stepping.' },
				{ name: 'onValue', type: '(value: number | null) => void', description: 'After every change, typed or stepped, with the parsed number.' },
				{ name: 'validator', type: 'boolean', default: 'false', description: 'Colour the field by its own validity (required, min, max, step) and reveal hint once the browser marks it invalid.' },
				{ name: 'hint', type: 'Snippet', description: 'Shown under the field when it is invalid.' },
				{ name: 'decreaseLabel / increaseLabel', type: 'string', description: "The buttons' accessible names, with controls." }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { NumberInput } from '$lib/index.js';

	let qty = $state<number | null>(2);
	let price = $state<number | null>(12.5);
</script>

<Section
	title="Basic"
	subtitle="The field alone, its figure at the end. What it hands back is a number."
	svelte={`<NumberInput bind:value={price} step={0.01} name="price" />`}
	html={`<div class="number-input">
  <input type="number" class="number-input-field" name="price" value="12.5" step="0.01">
</div>`}
>
	<NumberInput bind:value={price} step={0.01} name="price" />
	<code>{JSON.stringify(price)} ({typeof price === 'number' ? 'number' : 'null'})</code>
</Section>

<Section
	title="With controls"
	subtitle="A − and a + around the field, stepping within min, max and step."
	svelte={`<NumberInput controls bind:value={qty} min={0} max={10} name="qty" />`}
	html={`<div class="number-input">
  <button type="button" class="number-input-dec" aria-label="Decrease">−</button>
  <input type="number" class="number-input-field" name="qty" value="2" min="0" max="10">
  <button type="button" class="number-input-inc" aria-label="Increase">+</button>
</div>`}
>
	<NumberInput controls bind:value={qty} min={0} max={10} name="qty" />
	<span>{qty}</span>
</Section>

<Section
	title="Sizes and step"
	svelte={`<NumberInput size="sm" value={1} />
<NumberInput size="lg" value={0.5} step={0.25} />
<NumberInput controls size="lg" value={0.5} step={0.25} />
<NumberInput disabled value={3} />`}
	html={`<div class="number-input number-input-sm">…</div>`}
>
	<NumberInput size="sm" value={1} />
	<NumberInput value={5} />
	<NumberInput size="lg" value={0.5} step={0.25} />
	<NumberInput controls size="lg" value={0.5} step={0.25} />
	<NumberInput disabled value={3} />
</Section>
