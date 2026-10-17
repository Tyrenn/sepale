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
		namespaces: ['pagination'],
		description:
			'A row of pages to jump between, with previous / next. The current page is marked by `aria-current="page"`, not by a class. With `edges`, the first and last pages stay and far ones fold into a gap. Three variants draw the same pages differently: dots, bars, count.',
		classes: {
			'pagination-item': 'One page, or a previous / next control.',
			'pagination-gap': 'The “…” standing for pages that are not drawn.',
			'pagination-text': 'The “3 / 8” of the count variant.',
			'pagination-number': 'The number inside a page; a new one on every change, so a family can animate it. The row carries `data-direction="next | previous"` after a move.',
			'pagination-count': 'No page drawn: “3 / 8” between previous and next.',
			'pagination-dots': 'A dot per page instead of its number — as under a carousel.',
			'pagination-bars': 'A segment per page, stretched across the row.'
		},
		props: {
			Pagination: [
				{ name: 'count', type: 'number', description: 'How many pages there are.' },
				{ name: 'page', type: 'number', default: '$bindable(1)', description: 'The current page, from 1.' },
				{ name: 'siblings', type: 'number', default: '1', description: 'Pages kept on each side of the current one before a gap.' },
				{ name: 'edges', type: 'boolean', default: 'false', description: 'Keep the first and last pages, with a gap. Without (the default): only the window — `‹ 6 ›` with siblings 0, `‹ 5 6 7 ›` with 1.' },
				{ name: 'controls', type: 'boolean', default: 'true (false for dots, bars)', description: 'Draw previous / next.' },
				{ name: 'variant', type: "'dots' | 'bars' | 'count'", description: 'How the pages are drawn: dots, segments, or only “3 / 8” between previous and next.' },
				{ name: 'onPage', type: '(page) => void', description: 'Called with the new page after every change.' },
				{
					name: 'pageLabel / previousLabel / nextLabel',
					type: '(page) => string / string',
					description: 'Accessible names: `Page N`, `Previous page`, `Next page` by default.'
				},
				{
					name: 'countLabel',
					type: '(page, count) => string',
					description: 'The text of the count variant: `3 / 8` by default.'
				}
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Pagination } from '$lib/index.js';

	let page = $state(6);
	let windowPage = $state(6);
</script>

<Section
	title="Edges"
	subtitle="Twelve pages, with `edges`: the first and last stay, the far ones fold into gaps."
	svelte={`<Pagination count={12} bind:page edges />`}
	html={`<nav class="pagination">
	<button class="pagination-item" aria-label="Previous page">‹</button>
	<button class="pagination-item">1</button>
	<span class="pagination-gap">…</span>
	<button class="pagination-item">5</button>
	<button class="pagination-item" aria-current="page">6</button>
	<button class="pagination-item">7</button>
	<span class="pagination-gap">…</span>
	<button class="pagination-item">12</button>
	<button class="pagination-item" aria-label="Next page">›</button>
</nav>`}
>
	<div style="display:flex; flex-direction:column; gap:.5rem; align-items:center;">
		<Pagination count={12} bind:page edges />
		<small>page: {page}</small>
	</div>
</Section>

<Section
	title="Default: a window"
	subtitle="Without `edges`, the default: the current page alone, or with a neighbour on each side."
	svelte={`<Pagination count={32} bind:page siblings={0} />
<Pagination count={32} bind:page />`}
	html={`<nav class="pagination">
	<button class="pagination-item" aria-label="Previous page">‹</button>
	<button class="pagination-item" aria-current="page"><span class="pagination-number">6</span></button>
	<button class="pagination-item" aria-label="Next page">›</button>
</nav>`}
>
	<div style="display:flex; flex-direction:column; gap:.5rem; align-items:center;">
		<Pagination count={32} bind:page={windowPage} siblings={0} />
		<Pagination count={32} bind:page={windowPage} />
	</div>
</Section>

<Section
	title="Colors and sizes"
	svelte={`<Pagination count={5} page={2} color="neutral" size="sm" />
<Pagination count={5} page={3} color="success" size="lg" />`}
	html={`<nav class="pagination pagination-neutral pagination-sm">…</nav>`}
>
	<div style="display:flex; flex-direction:column; gap:.75rem; align-items:center;">
		<Pagination count={5} page={2} color="neutral" size="sm" />
		<Pagination count={5} page={3} color="success" size="lg" />
	</div>
</Section>

<Section
	title="Dots"
	subtitle="Every page, no numbers drawn (they stay in the accessible name), no previous / next."
	svelte={`<Pagination count={5} page={2} variant="dots" />`}
	html={`<nav class="pagination pagination-dots">
	<button class="pagination-item">1</button>
	<button class="pagination-item" aria-current="page">2</button>
</nav>`}
>
	<Pagination count={5} page={2} variant="dots" />
</Section>

<Section
	title="Bars"
	subtitle="A segment per page, stretched across the width it is given — as over a story."
	svelte={`<Pagination count={5} page={2} variant="bars" />`}
	html={`<nav class="pagination pagination-bars">
	<button class="pagination-item">1</button>
	<button class="pagination-item" aria-current="page">2</button>
</nav>`}
>
	<div style="width:16rem;">
		<Pagination count={5} page={2} variant="bars" />
	</div>
</Section>

<Section
	title="Count"
	subtitle="No page drawn: where you are, between previous and next."
	svelte={`<Pagination count={12} page={3} variant="count" />`}
	html={`<nav class="pagination pagination-count">
	<button class="pagination-item" aria-label="Previous page">‹</button>
	<span class="pagination-text">3 / 12</span>
	<button class="pagination-item" aria-label="Next page">›</button>
</nav>`}
>
	<Pagination count={12} page={3} variant="count" />
</Section>
