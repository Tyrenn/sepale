<script module lang="ts">
	/**
	 * The hand-written half of this page: what the component is, what each
	 * of its classes does, and what its props mean. WHICH classes exist is
	 * not written here — that is read back from the active family's compiled
	 * CSS (src/lib/generated/components.ts), so a page cannot claim a class
	 * the family does not ship.
	 */
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['carousel'],
		description:
			'A row of slides that scrolls and snaps natively — touch, trackpad and keyboard work with no script — with optional arrows over it and an optional pagination under it. The Svelte component draws one slide per entry of `items`.',
		classes: {
			'carousel-track': 'The scrolling, snapping row. Focusable, so the arrow keys move through it.',
			'carousel-item': 'One slide. As wide as the track, unless `--carousel-item-width` says otherwise.',
			'carousel-prev': 'The cell the previous arrow is drawn in, over the start of the track.',
			'carousel-next': 'The cell the next arrow is drawn in, over the end of the track.',
			'carousel-pagination': 'The cell under the track the pagination is drawn in.',
			'carousel-start': 'A slide comes to rest at the start of the track.',
			'carousel-center': 'A slide comes to rest in the middle — with several visible, the neighbours peek in.',
			'carousel-end': 'A slide comes to rest at the end of the track.',
			'carousel-vertical': 'Slides go up and down; the arrows sit at the top and the bottom.'
		},
		props: {
			Carousel: [
				{ name: 'items', type: 'Item[]', description: 'The slides’ data. One slide per entry.' },
				{
					name: 'children',
					type: 'Snippet<[Item, number]>',
					description: 'One slide, drawn from its entry and its index.'
				},
				{
					name: 'arrow',
					type: 'true | null | Snippet<[Arrow]>',
					default: 'null',
					description:
						'Nothing when absent; chevron buttons (`.btn.btn-circle`) when `true`; your snippet otherwise, drawn once on each side with `{ direction, go, disabled }`.'
				},
				{
					name: 'pagination',
					type: 'true | null | Snippet<[Pages]>',
					default: 'null',
					description:
						'Nothing when absent; the pagination in its dots variant when `true`; your snippet otherwise, given `{ count, index, go }`.'
				},
				{ name: 'index', type: 'number', default: '$bindable(0)', description: 'The current slide, from 0. Setting it moves there.' },
				{ name: 'loop', type: 'boolean', default: 'false', description: 'Past the last slide comes the first, and the other way round.' },
				{
					name: 'autoplay',
					type: 'boolean | number',
					default: 'false',
					description:
						'Move on every N milliseconds (`true`: 5000), starting over at the end. Pauses under the pointer, with focus inside, in a hidden tab; never runs with prefers-reduced-motion.'
				},
				{ name: 'onslide', type: '(index) => void', description: 'Called whenever the current slide changes.' },
				{ name: 'align', type: "'start' | 'center' | 'end'", description: 'Where a slide comes to rest.' },
				{ name: 'vertical', type: 'boolean', default: 'false', description: 'Slide up and down. Give the root a height through `--carousel-height`.' },
				{
					name: 'previousLabel / nextLabel / slideLabel',
					type: 'string / (i, n) => string',
					description: 'Accessible names of the arrows and of each slide.'
				}
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Carousel, Pagination } from '$lib/index.js';

	const SLIDES = [
		{ title: 'Dawn', from: '#f6c', to: '#fc6' },
		{ title: 'Noon', from: '#6cf', to: '#9f9' },
		{ title: 'Dusk', from: '#f96', to: '#c6f' },
		{ title: 'Night', from: '#36c', to: '#113' }
	];

	let index = $state(0);
</script>

{#snippet slide(s: (typeof SLIDES)[number], i: number)}
	<div
		style="height:12rem; display:grid; place-items:center; font-size:1.5rem; font-weight:700; color:#fff; text-shadow:0 1px 3px #0006; background:linear-gradient(135deg, {s.from}, {s.to});"
	>
		{i + 1}. {s.title}
	</div>
{/snippet}

<Section
	title="Arrows and dots"
	subtitle="`arrow` and `pagination` set to true: the defaults. Swipe, scroll, or focus the track and use the arrow keys."
	svelte={`<Carousel items={SLIDES} arrow pagination bind:index>
	{#snippet children(s, i)}<div …>{i + 1}. {s.title}</div>{/snippet}
</Carousel>`}
	html={`<div class="carousel" role="region" aria-roledescription="carousel">
	<div class="carousel-track" tabindex="0">
		<div class="carousel-item" role="group" aria-roledescription="slide">…</div>
	</div>
	<div class="carousel-prev"><button class="btn btn-circle btn-sm">…</button></div>
	<div class="carousel-next"><button class="btn btn-circle btn-sm">…</button></div>
	<div class="carousel-pagination">
		<nav class="pagination pagination-dots">
			<button class="pagination-item" aria-current="page">1</button>
		</nav>
	</div>
</div>`}
>
	<div style="width:28rem; display:flex; flex-direction:column; gap:.5rem;">
		<Carousel items={SLIDES} arrow pagination bind:index>
			{#snippet children(s, i)}{@render slide(s, i)}{/snippet}
		</Carousel>
		<small>index: {index}</small>
	</div>
</Section>

<Section
	title="Loop and autoplay"
	subtitle="Every 2.5 s, starting over at the end. Hover to pause."
	svelte={`<Carousel items={SLIDES} arrow pagination loop autoplay={2500}>…</Carousel>`}
>
	<div style="width:28rem;">
		<Carousel items={SLIDES} arrow pagination loop autoplay={2500}>
			{#snippet children(s, i)}{@render slide(s, i)}{/snippet}
		</Carousel>
	</div>
</Section>

<Section
	title="Snippets of your own"
	subtitle="`arrow` is drawn on each side; `pagination` is handed the count, the index and `go`."
	svelte={`<Carousel items={SLIDES} loop>
	{#snippet children(s, i)}…{/snippet}
	{#snippet arrow({ direction, go })}
		<button class="btn btn-sm" onclick={go}>{direction}</button>
	{/snippet}
	{#snippet pagination({ count, index, go })}
		<Pagination {count} page={index + 1} onpage={(p) => go(p - 1)} size="sm" />
	{/snippet}
</Carousel>`}
>
	<div style="width:28rem;">
		<Carousel items={SLIDES} loop>
			{#snippet children(s, i)}{@render slide(s, i)}{/snippet}
			{#snippet arrow({ direction, go })}
				<button type="button" class="btn btn-sm" onclick={go}>{direction}</button>
			{/snippet}
			{#snippet pagination({ count, index, go })}
				<Pagination {count} page={index + 1} onpage={(p) => go(p - 1)} size="sm" />
			{/snippet}
		</Carousel>
	</div>
</Section>

<Section
	title="Several at once"
	subtitle="`--carousel-item-width` on the root, and `align` for where a slide rests."
	svelte={`<Carousel items={SLIDES} align="center" pagination style="--carousel-item-width: 70%">…</Carousel>`}
>
	<div style="width:28rem;">
		<Carousel items={SLIDES} align="center" pagination style="--carousel-item-width: 70%; --carousel-item-gap: .5rem;">
			{#snippet children(s, i)}{@render slide(s, i)}{/snippet}
		</Carousel>
	</div>
</Section>

<Section
	title="Vertical"
	svelte={`<Carousel items={SLIDES} vertical arrow style="--carousel-height: 12rem">…</Carousel>`}
>
	<div style="width:20rem;">
		<Carousel items={SLIDES} vertical arrow style="--carousel-height: 12rem">
			{#snippet children(s, i)}{@render slide(s, i)}{/snippet}
		</Carousel>
	</div>
</Section>
