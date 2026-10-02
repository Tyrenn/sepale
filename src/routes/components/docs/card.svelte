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
		namespaces: ['card'],
		description:
			'A box with, optionally, a figure, a title, a body and a row of actions. Every part is optional: a card with nothing but a body is a card, and that is the common case.',
		classes: {
			'card-body': 'The padded column that holds everything but the figure.',
			'card-title': 'The heading, in the family’s title ink and weight.',
			'card-actions': 'A wrapping row of buttons at the end of the body.',
			'card-border': 'Draws an edge the family does not draw by default.',
			'card-dash': 'The same edge, dashed.',
			'card-side': 'Puts the figure beside the body instead of above it.',
			'card-image-full': 'Lets the figure fill the card, with the body laid over it.'
		},
		props: {
			Card: [
				{ name: 'title', type: 'Snippet', description: 'The heading, rendered as an h2.card-title.' },
				{ name: 'figure', type: 'Snippet', description: 'An image or anything that spans the card, above the body.' },
				{ name: 'actions', type: 'Snippet', description: 'A row of buttons, at the end of the body.' },
				{ name: 'border', type: 'boolean', default: 'false', description: 'Draw an edge.' },
				{ name: 'dash', type: 'boolean', default: 'false', description: 'Draw a dashed edge.' },
				{ name: 'side', type: 'boolean', default: 'false', description: 'Figure beside the body.' },
				{ name: 'imageFull', type: 'boolean', default: 'false', description: 'Figure behind the body.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Button, Card } from '$lib/index.js';

	/* A figure needs a picture; an inline SVG keeps the page offline. */
	const img = `data:image/svg+xml,${encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="#f6c"/><stop offset="1" stop-color="#6cf"/></linearGradient></defs><rect width="400" height="200" fill="url(#g)"/></svg>'
	)}`;
</script>

<Section
	title="Plain"
	subtitle="A title, a body and actions. Each one optional."
	svelte={`<Card>
	{#snippet title()}Card title{/snippet}
	<p>A card holds one idea and the actions it offers.</p>
	{#snippet actions()}<Button color="primary">Buy now</Button>{/snippet}
</Card>`}
	html={`<div class="card">
	<div class="card-body">
		<h2 class="card-title">Card title</h2>
		<p>A card holds one idea and the actions it offers.</p>
		<div class="card-actions"><button class="btn btn-primary">Buy now</button></div>
	</div>
</div>`}
>
	<Card style="width:20rem">
		{#snippet title()}Card title{/snippet}
		<p>A card holds one idea and the actions it offers.</p>
		{#snippet actions()}<Button color="primary">Buy now</Button>{/snippet}
	</Card>
</Section>

<Section
	title="Figure"
	svelte={`<Card>
	{#snippet figure()}<img src="…" alt="" />{/snippet}
	{#snippet title()}With a figure{/snippet}
	<p>The image follows the card's corners.</p>
</Card>`}
	html={`<div class="card">
	<figure><img src="…" alt="" /></figure>
	<div class="card-body">
		<h2 class="card-title">With a figure</h2>
		<p>The image follows the card's corners.</p>
	</div>
</div>`}
>
	<Card style="width:20rem">
		{#snippet figure()}<img src={img} alt="" />{/snippet}
		{#snippet title()}With a figure{/snippet}
		<p>The image follows the card's corners.</p>
	</Card>
</Section>

<Section
	title="Flags"
	subtitle="border, dash, side and image-full."
	svelte={`<Card border>…</Card>
<Card dash>…</Card>
<Card side>…</Card>
<Card imageFull>…</Card>`}
	html={`<div class="card card-border">…</div>
<div class="card card-dash">…</div>
<div class="card card-side">…</div>
<div class="card card-image-full">…</div>`}
>
	<Card border style="width:14rem">
		{#snippet title()}Border{/snippet}
		<p>An explicit edge.</p>
	</Card>
	<Card dash style="width:14rem">
		{#snippet title()}Dash{/snippet}
		<p>A dashed edge.</p>
	</Card>
	<Card side style="width:22rem">
		{#snippet figure()}<img src={img} alt="" style="width:7rem" />{/snippet}
		{#snippet title()}Side{/snippet}
		<p>Figure beside the body.</p>
	</Card>
	<Card imageFull style="width:16rem">
		{#snippet figure()}<img src={img} alt="" />{/snippet}
		{#snippet title()}Image full{/snippet}
		<p>The body sits over the figure.</p>
	</Card>
</Section>

<Section
	title="Background"
	subtitle="A one-off fill, by value."
	svelte={`<Card background="#efb">…</Card>`}
	html={`<div class="card" style="--card-bg: #efb;">…</div>`}
>
	<Card background="#efb" style="width:14rem; color:#222">
		{#snippet title()}Background{/snippet}
		<p>Written into --card-bg.</p>
	</Card>
</Section>
