<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['accordion'],
		description:
			'A stack of Collapses, joined at their edges. With exclusive, opening one closes the others.',
		classes: {
			accordion: 'The stack; joins its collapses so only the outer corners are rounded.'
		},
		props: {
			Accordion: [
				{ name: 'exclusive', type: 'boolean', default: 'false', description: 'At most one collapse open at a time.' },
				{ name: 'children', type: 'Snippet', description: 'The Collapses.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Accordion, Collapse } from '$lib/index.js';
</script>

<Section
	title="Joined, exclusive"
	svelte={`<Accordion exclusive>
  <Collapse title="Shipping" arrow open>…</Collapse>
  <Collapse title="Returns" arrow>…</Collapse>
  <Collapse title="Warranty" arrow>…</Collapse>
</Accordion>`}
	html={`<div class="accordion">
  <div class="collapse collapse-arrow">…</div>
  <div class="collapse collapse-arrow">…</div>
</div>`}
>
	<div style="width:100%">
		<Accordion exclusive>
			<Collapse title="Shipping" arrow open>Three to five working days.</Collapse>
			<Collapse title="Returns" arrow>Free for thirty days.</Collapse>
			<Collapse title="Warranty" arrow>Two years, parts and labour.</Collapse>
		</Accordion>
	</div>
</Section>

<Section
	title="Separate"
	svelte={`<Accordion separate>…</Accordion>`}
	html={`<div class="accordion accordion-separate">…</div>`}
>
	<div style="width:100%">
		<Accordion separate>
			<Collapse title="One" plus>First.</Collapse>
			<Collapse title="Two" plus>Second.</Collapse>
		</Accordion>
	</div>
</Section>
