<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['laptop-frame'],
		description:
			'A laptop drawn around content: a lid holding a 16:10 screen that scrolls, on a wider base. Set --laptop-frame-width.',
		classes: {
			'laptop-frame': 'The device.',
			'laptop-frame-lid': 'The lid, with its camera.',
			'laptop-frame-screen': 'The 16:10 screen; scrolls.',
			'laptop-frame-base': 'The base, with its notch.'
		},
		props: { LaptopFrame: [{ name: 'children', type: 'Snippet', description: 'What the screen shows.' }] }
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Hero, LaptopFrame } from '$lib/index.js';
</script>

<Section
	title="Laptop"
	svelte={`<LaptopFrame>…</LaptopFrame>`}
	html={`<div class="laptop-frame">
  <div class="laptop-frame-lid"><div class="laptop-frame-screen">…</div></div>
  <div class="laptop-frame-base"></div>
</div>`}
>
	<LaptopFrame>
		<Hero title="Hello" level={2} size="sm">A page inside a laptop.</Hero>
	</LaptopFrame>
</Section>
