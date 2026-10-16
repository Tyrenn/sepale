<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['hero'],
		description:
			'The large opening block of a page: a title, a sentence, a call to action, and optionally media beside them. Stacks by itself when there is no room — no breakpoint.',
		classes: {
			hero: 'A wrapping row: content and media.',
			'hero-content': 'Title, body and actions.',
			'hero-title': 'The heading.',
			'hero-body': 'The sentence.',
			'hero-actions': 'The calls to action.',
			'hero-media': 'An image, a video, an illustration.'
		},
		props: {
			Hero: [
				{ name: 'title', type: 'string', description: 'The heading.' },
				{ name: 'level', type: '1 | 2 | 3', default: '1', description: 'The heading level.' },
				{ name: 'actions', type: 'Snippet', description: 'The calls to action.' },
				{ name: 'media', type: 'Snippet', description: 'An image or anything beside the text.' },
				{ name: 'children', type: 'Snippet', description: 'The sentence.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Button, Hero } from '$lib/index.js';
</script>

<Section
	title="With media"
	svelte={`<Hero title="Ship interfaces, not stylesheets" level={2}>
  Components first; a family gives them a look.
  {#snippet actions()}<Button color="primary">Get started</Button><Button>Docs</Button>{/snippet}
  {#snippet media()}<img src="…" alt="" />{/snippet}
</Hero>`}
	html={`<section class="hero">
  <div class="hero-content">
    <h2 class="hero-title">Ship interfaces, not stylesheets</h2>
    <p class="hero-body">Components first; a family gives them a look.</p>
    <div class="hero-actions">…</div>
  </div>
  <div class="hero-media"><img src="…" alt=""></div>
</section>`}
>
	<div style="width:100%">
		<Hero title="Ship interfaces, not stylesheets" level={2}>
			Components first; a family gives them a look.
			{#snippet actions()}<Button color="primary">Get started</Button><Button>Docs</Button>{/snippet}
			{#snippet media()}
				<svg viewBox="0 0 320 200" role="img" aria-label="Illustration"
					><rect width="320" height="200" rx="12" fill="currentColor" opacity=".08" /><rect x="24" y="24" width="120" height="16" rx="8" fill="currentColor" opacity=".25" /><rect x="24" y="52" width="272" height="10" rx="5" fill="currentColor" opacity=".15" /><rect x="24" y="72" width="220" height="10" rx="5" fill="currentColor" opacity=".15" /><rect x="24" y="120" width="88" height="32" rx="8" fill="currentColor" opacity=".3" /></svg
				>
			{/snippet}
		</Hero>
	</div>
</Section>

<Section
	title="Centered, colored"
	svelte={`<Hero title="Spring sale" center color="primary">Everything at half price until Sunday.</Hero>`}
	html={`<section class="hero hero-center hero-primary">…</section>`}
>
	<div style="width:100%">
		<Hero title="Spring sale" level={2} center color="primary">
			Everything at half price until Sunday.
			{#snippet actions()}<Button>Shop now</Button>{/snippet}
		</Hero>
	</div>
</Section>
