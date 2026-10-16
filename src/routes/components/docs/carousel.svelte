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
			'A row of items that scrolls and snaps natively, with optional arrows over it, upcoming items and a pagination under it. Items may differ in size: the carousel measures them. The Svelte component draws one item per entry of `items`; the index is never bound — `goto` / `prev` / `next` move, `onIndex` tells (ADR 0011).',
		classes: {
			'carousel-track': 'The scrolling, snapping row. Focusable, so the arrow keys move through it.',
			'carousel-item': 'One item. As wide as the track, unless `--carousel-item-width` says otherwise (`auto`: the item sizes itself).',
			'carousel-prev': 'The cell the previous arrow is drawn in, over the start of the track.',
			'carousel-next': 'The cell the next arrow is drawn in, over the end of the track.',
			'carousel-pagination': 'The cell under the track the pagination is drawn in.',
			'carousel-upcoming': 'The row of upcoming items under the track.',
			'carousel-upcoming-item': 'One upcoming item: a button drawing the item again at `--carousel-upcoming-size`.',
			'carousel-start': 'An item comes to rest at the start of the track.',
			'carousel-center': 'An item comes to rest in the middle — with several visible, the neighbours peek in.',
			'carousel-end': 'An item comes to rest at the end of the track.',
			'carousel-vertical': 'Items go up and down; the arrows sit at the top and the bottom.'
		},
		props: {
			Carousel: [
				{ name: 'items', type: 'Item[]', description: 'The items’ data. One item per entry.' },
				{ name: 'children', type: 'Snippet<[Item, number]>', description: 'One item, drawn from its entry and its index.' },
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
					description: 'Nothing when absent; the pagination in its dots variant when `true`; your snippet otherwise, given `{ count, index, goto }`.'
				},
				{
					name: 'upcoming',
					type: 'true | number | null | Snippet<[Upcoming]>',
					default: 'null',
					description:
						'The items after the current one, small, under the track: `true` for 3, a number for that many, or your snippet given `{ items: { item, index }[], goto }`. Wraps with `loop` / `infinite`.'
				},
				{ name: 'index', type: 'number', default: '0', description: 'The item to start on, from 0. Not bound: move with `goto`, listen with `onIndex`.' },
				{ name: 'onIndex', type: '(index) => void', description: 'Called whenever the current item changes.' },
				{ name: 'loop', type: 'boolean', default: 'false', description: 'At the last item, next goes back to the first (scrolling back across them), and the other way round.' },
				{ name: 'infinite', type: 'boolean', default: 'false', description: 'No end: items are duplicated on both sides so the row runs on with no jump. Wins over `loop`.' },
				{
					name: 'autoplay',
					type: 'boolean | number',
					default: 'false',
					description:
						'Move on every N milliseconds (`true`: 5000). Pauses under the pointer, with focus inside, in a hidden tab; never runs with prefers-reduced-motion.'
				},
				{ name: 'drag', type: 'boolean', default: 'true', description: 'Drag the row with the mouse.' },
				{
					name: 'scroll',
					type: 'boolean',
					default: 'true',
					description: 'Wheel, trackpad and touch. A vertical wheel moves a sideways row one item at a time, and gives the page back at the ends.'
				},
				{
					name: 'keyboard',
					type: 'boolean',
					default: 'true',
					description: 'Arrow keys, Home and End on the focused track. Off, the track leaves the tab order: give keyboard users the arrows.'
				},
				{ name: 'goto / prev / next', type: '(index) => void / () => void', description: 'Exported: reach them through `bind:this`.' },
				{ name: 'align', type: "'start' | 'center' | 'end'", description: 'Where an item comes to rest.' },
				{ name: 'vertical', type: 'boolean', default: 'false', description: 'Slide up and down. Give the root a height through `--carousel-height`.' },
				{
					name: 'previousLabel / nextLabel / itemLabel',
					type: 'string / (i, n) => string',
					description: 'Accessible names of the arrows and of each item.'
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
	const WIDTHS = ['8rem', '14rem', '6rem', '11rem'];

	let index = $state(0);
	let remote: ReturnType<typeof Carousel> | undefined = $state();
	let remoteIndex = $state(0);
</script>

{#snippet slide(s: (typeof SLIDES)[number], i: number)}
	<!-- em, not rem: an upcoming item shrinks with its font-size. -->
	<div
		style="height:8em; display:grid; place-items:center; font-size:1.5em; font-weight:700; color:#fff; text-shadow:0 1px 3px #0006; background:linear-gradient(135deg, {s.from}, {s.to});"
	>
		{i + 1}. {s.title}
	</div>
{/snippet}

<Section
	title="Arrows and dots"
	subtitle="`arrow` and `pagination` set to true: the defaults. Swipe, drag, turn the wheel, or focus the track and use the arrow keys."
	svelte={`<Carousel items={SLIDES} arrow pagination onIndex={(i) => (index = i)}>
	{#snippet children(s, i)}<div …>{i + 1}. {s.title}</div>{/snippet}
</Carousel>`}
	html={`<div class="carousel" role="region" aria-roledescription="carousel">
	<div class="carousel-track" tabindex="0">
		<div class="carousel-item" role="group" aria-roledescription="item">…</div>
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
		<Carousel items={SLIDES} arrow pagination onIndex={(i) => (index = i)}>
			{#snippet children(s, i)}{@render slide(s, i)}{/snippet}
		</Carousel>
		<small>onIndex: {index}</small>
	</div>
</Section>

<Section
	title="Infinite"
	subtitle="Items are duplicated on both sides: past the last comes the first, with no jump back. Autoplay every 2.5 s; hover to pause."
	svelte={`<Carousel items={SLIDES} arrow pagination infinite autoplay={2500}>…</Carousel>`}
>
	<div style="width:28rem;">
		<Carousel items={SLIDES} arrow pagination infinite autoplay={2500}>
			{#snippet children(s, i)}{@render slide(s, i)}{/snippet}
		</Carousel>
	</div>
</Section>

<Section
	title="Loop"
	subtitle="At the end, next scrolls back across every item to the first."
	svelte={`<Carousel items={SLIDES} arrow loop>…</Carousel>`}
>
	<div style="width:28rem;">
		<Carousel items={SLIDES} arrow loop>
			{#snippet children(s, i)}{@render slide(s, i)}{/snippet}
		</Carousel>
	</div>
</Section>

<Section
	title="Upcoming"
	subtitle="`upcoming`: the next items drawn again, small, under the track. Click one to go there."
	svelte={`<Carousel items={SLIDES} arrow upcoming infinite>…</Carousel>`}
	html={`<div class="carousel-upcoming">
	<button class="carousel-upcoming-item">…</button>
</div>`}
>
	<div style="width:28rem;">
		<Carousel items={SLIDES} arrow upcoming infinite>
			{#snippet children(s, i)}{@render slide(s, i)}{/snippet}
		</Carousel>
	</div>
</Section>

<Section
	title="Snippets of your own"
	subtitle="`arrow` is drawn on each side; `pagination` is handed the count, the index and `goto`."
	svelte={`<Carousel items={SLIDES} loop>
	{#snippet children(s, i)}…{/snippet}
	{#snippet arrow({ direction, go })}
		<button class="btn btn-sm" onclick={go}>{direction}</button>
	{/snippet}
	{#snippet pagination({ count, index, goto })}
		<Pagination {count} page={index + 1} onPage={(p) => goto(p - 1)} size="sm" />
	{/snippet}
</Carousel>`}
>
	<div style="width:28rem;">
		<Carousel items={SLIDES} loop>
			{#snippet children(s, i)}{@render slide(s, i)}{/snippet}
			{#snippet arrow({ direction, go })}
				<button type="button" class="btn btn-sm" onclick={go}>{direction}</button>
			{/snippet}
			{#snippet pagination({ count, index, goto })}
				<Pagination {count} page={index + 1} onPage={(p) => goto(p - 1)} size="sm" />
			{/snippet}
		</Carousel>
	</div>
</Section>

<Section
	title="Driven from outside"
	subtitle="No binding: a reference through `bind:this`, `goto` to move, `onIndex` to follow."
	svelte={`<Carousel bind:this={remote} items={SLIDES} onIndex={(i) => (remoteIndex = i)}>…</Carousel>
<Pagination count={SLIDES.length} page={remoteIndex + 1} onPage={(p) => remote?.goto(p - 1)} />`}
>
	<div style="width:28rem; display:flex; flex-direction:column; gap:.5rem; align-items:center;">
		<Carousel bind:this={remote} items={SLIDES} onIndex={(i) => (remoteIndex = i)} style="width:100%">
			{#snippet children(s, i)}{@render slide(s, i)}{/snippet}
		</Carousel>
		<Pagination count={SLIDES.length} page={remoteIndex + 1} onPage={(p) => remote?.goto(p - 1)} size="sm" />
	</div>
</Section>

<Section
	title="Several at once"
	subtitle="`--carousel-item-width` on the root, and `align` for where an item rests."
	svelte={`<Carousel items={SLIDES} align="center" pagination style="--carousel-item-width: 70%">…</Carousel>`}
>
	<div style="width:28rem;">
		<Carousel items={SLIDES} align="center" pagination style="--carousel-item-width: 70%; --carousel-item-gap: .5rem;">
			{#snippet children(s, i)}{@render slide(s, i)}{/snippet}
		</Carousel>
	</div>
</Section>

<Section
	title="Items of different sizes"
	subtitle="`--carousel-item-width: auto`: each item sizes itself. The carousel measures them and snaps from one to the next."
	svelte={`<Carousel items={SLIDES} arrow infinite style="--carousel-item-width: auto">…</Carousel>`}
>
	<div style="width:28rem;">
		<Carousel items={SLIDES} arrow infinite style="--carousel-item-width: auto; --carousel-item-gap: .5rem;">
			{#snippet children(s, i)}<div style="width:{WIDTHS[i]}">{@render slide(s, i)}</div>{/snippet}
		</Carousel>
	</div>
</Section>

<Section
	title="Interactions off"
	subtitle="`drag`, `scroll` and `keyboard` set to false: only the arrows move it."
	svelte={`<Carousel items={SLIDES} arrow drag={false} scroll={false} keyboard={false}>…</Carousel>`}
>
	<div style="width:28rem;">
		<Carousel items={SLIDES} arrow drag={false} scroll={false} keyboard={false}>
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
