<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['rating'],
		description:
			'A whole-number score picked from a row of icons. Real radios, drawn through a CSS mask: they submit with a form and follow the arrow keys.',
		classes: {
			rating: 'The row; holds the icon as --rating-mask (a star by default).',
			'rating-item': 'One radio, drawn as the icon. Filled up to the checked one; hover previews.'
		},
		props: {
			Rating: [
				{ name: 'value', type: 'number', default: '0', description: 'The score, 0 for none. Bindable.' },
				{ name: 'max', type: 'number', default: '5', description: 'How many icons.' },
				{ name: 'name', type: 'string', description: "The radios' name, for a form." },
				{ name: 'mask', type: 'string', description: 'Another icon, as a CSS image: url(…).' },
				{ name: 'disabled', type: 'boolean', default: 'false', description: 'No picking, dimmed by the browser.' },
				{ name: 'label', type: 'string', default: "'Rating'", description: "The group's accessible name." },
				{ name: 'itemLabel', type: '(n) => string', description: "One item's accessible name." },
				{ name: 'onvalue', type: '(value: number) => void', description: 'After the user picked a score.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Rating } from '$lib/index.js';

	let score = $state(3);
	const HEART = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 21s-7.5-4.6-9.5-9.2C1 8.2 3.4 4.5 7 4.5c2.1 0 3.6 1.1 5 2.9 1.4-1.8 2.9-2.9 5-2.9 3.6 0 6 3.7 4.5 7.3C19.5 16.4 12 21 12 21z'/%3E%3C/svg%3E")`;
</script>

<Section
	title="Pick a score"
	svelte={`<Rating bind:value={score} />`}
	html={`<div class="rating" role="radiogroup" aria-label="Rating">
  <input type="radio" class="rating-item" name="r" value="1" aria-label="1 / 5">
  <input type="radio" class="rating-item" name="r" value="2" aria-label="2 / 5">
  <input type="radio" class="rating-item" name="r" value="3" aria-label="3 / 5" checked>
  <input type="radio" class="rating-item" name="r" value="4" aria-label="4 / 5">
  <input type="radio" class="rating-item" name="r" value="5" aria-label="5 / 5">
</div>`}
>
	<Rating bind:value={score} />
	<span>{score} / 5</span>
</Section>

<Section
	title="Sizes and colors"
	svelte={`<Rating value={4} size="sm" color="primary" />
<Rating value={2} size="lg" color="error" mask={HEART} max={3} />`}
	html={`<div class="rating rating-sm rating-primary">…</div>`}
>
	<div style="display:flex; flex-direction:column; gap:.75em">
		<Rating value={4} size="sm" color="primary" />
		<Rating value={4} />
		<Rating value={2} size="lg" color="error" mask={HEART} max={3} />
	</div>
</Section>

<Section
	title="Read only"
	svelte={`<Rating value={4} readonly />`}
	html={`<div class="rating rating-readonly">…</div>`}
>
	<Rating value={4} readonly />
</Section>
