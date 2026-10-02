<script module lang="ts">
	/**
	 * The hand-written half of this page: what the component is, what each
	 * of its classes does, and what its props mean. WHICH classes exist is
	 * not written here — that is read back from the active family's compiled
	 * CSS (src/lib/generated/components.ts), so a page cannot claim a class
	 * the family does not ship.
	 *
	 * `namespaces` is the one piece of structure: it says which classes
	 * belong here. Nothing else can know that `.title` is part of `text`.
	 */
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['text', 'title', 'subtitle'],
		description:
			'The typographic scale, delivered as classes — no frame, no state. Three components in one file, `text`, `title` and `subtitle`, because separating them would buy nothing. Size and weight are two axes, and each of the three carries the eight semantic colours.',
		classes: {
			...Object.fromEntries(
				[1, 2, 3, 4].map((size) => [`text-s${size}`, `Size step ${size}, with its leading.`])
			),
			...Object.fromEntries([1, 2, 3].map((weight) => [`text-b${weight}`, `Weight ${weight}.`])),
			title: "The page's one title.",
			'subtitle-s1': 'A subtitle, first step down from the title.',
			'subtitle-s2': 'A subtitle, second step down.'
		},
		props: {
			Title: [
				{ name: 'level', type: '1 | 2 | 3 | 4 | 5 | 6', default: '1', description: 'Which heading tag to render. Purely semantic; the look never moves.' }
			],
			Subtitle: [
				{ name: 'level', type: '1 | 2 | 3 | 4 | 5 | 6', default: '2', description: 'Which heading tag to render. Purely semantic; the look never moves.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Text, Title, Subtitle } from '$lib/index.js';
</script>

<Section
	title="Headings"
	svelte={`<Title>Title</Title>
<Subtitle s="1">Subtitle s1</Subtitle>
<Subtitle s="2" level={3}>Subtitle s2</Subtitle>`}
	html={`<h1 class="title">Title</h1>
<h2 class="subtitle-s1">Subtitle s1</h2>
<h3 class="subtitle-s2">Subtitle s2</h3>`}
>
	<div style="text-align:center;">
		<Title>Title</Title>
		<Subtitle s="1">Subtitle s1</Subtitle>
		<Subtitle s="2" level={3}>Subtitle s2</Subtitle>
	</div>
</Section>

<Section
	title="Body"
	subtitle="Size (s) and weight (b) are two axes."
	svelte={`<Text b="1">Base, semibold</Text>
<Text b="2">Base, medium</Text>
<Text b="3">Base, regular</Text>
<Text s="4">Smallest step</Text>`}
	html={`<p class="text-s2 text-b1">Base, semibold</p>
<p class="text-s2 text-b2">Base, medium</p>
<p class="text-s2 text-b3">Base, regular</p>
<p class="text-s4 text-b3">Smallest step</p>`}
>
	<div style="text-align:center;">
		<Text b="1">Base, semibold</Text>
		<Text b="2">Base, medium</Text>
		<Text b="3">Base, regular</Text>
		<Text s="4">Smallest step</Text>
	</div>
</Section>

<Section
	title="Colour"
	subtitle="The raw semantic token, not a contrast-checked reading of it."
	svelte={`<Title color="primary">Primary title</Title>
<Subtitle color="secondary">Secondary subtitle</Subtitle>
<Text color="error">An error, in words.</Text>`}
	html={`<h1 class="title title-primary">Primary title</h1>
<h2 class="subtitle-s1 subtitle-secondary">Secondary subtitle</h2>
<p class="text-s2 text-b3 text-error">An error, in words.</p>`}
>
	<div style="text-align:center;">
		<Title color="primary">Primary title</Title>
		<Subtitle color="secondary">Secondary subtitle</Subtitle>
		<Text color="error">An error, in words.</Text>
	</div>
</Section>
