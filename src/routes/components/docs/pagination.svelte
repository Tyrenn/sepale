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
			'A row of pages to jump between, with previous / next. The current page is marked by `aria-current="page"`, not by a class. Far pages fold into a gap.',
		classes: {
			'pagination-item': 'One page, or a previous / next control.',
			'pagination-gap': 'The “…” standing for pages that are not drawn.',
			'pagination-dots': 'A dot per page instead of its number — as under a carousel.'
		},
		props: {
			Pagination: [
				{ name: 'count', type: 'number', description: 'How many pages there are.' },
				{ name: 'page', type: 'number', default: '$bindable(1)', description: 'The current page, from 1.' },
				{ name: 'siblings', type: 'number', default: '1', description: 'Pages kept on each side of the current one before a gap.' },
				{ name: 'controls', type: 'boolean', default: 'true (false for dots)', description: 'Draw previous / next.' },
				{ name: 'onpage', type: '(page) => void', description: 'Called with the new page after every change.' },
				{
					name: 'pageLabel / previousLabel / nextLabel',
					type: '(page) => string / string',
					description: 'Accessible names: `Page N`, `Previous page`, `Next page` by default.'
				}
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Pagination } from '$lib/index.js';

	let page = $state(6);
</script>

<Section
	title="Default"
	subtitle="Twelve pages: the far ones fold into gaps."
	svelte={`<Pagination count={12} bind:page />`}
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
		<Pagination count={12} bind:page />
		<small>page: {page}</small>
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
