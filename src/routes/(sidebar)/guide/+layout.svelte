<script lang="ts">
	// Every guide page: one readable column, then the way to the next page.
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import { GUIDE } from './pages.js';

	let { children }: { children: Snippet } = $props();

	let at = $derived(GUIDE.findIndex((p) => resolve(p.path) === page.url.pathname));
	let prev = $derived(at > 0 ? GUIDE[at - 1] : undefined);
	let next = $derived(at >= 0 ? GUIDE[at + 1] : undefined);
</script>

<main class="content">
	<article class="guide">
		{@render children()}

		<nav class="guide-pager" aria-label="Guide">
			{#if prev}
				<a class="guide-pager-link" href={resolve(prev.path)}>
					<small>Previous</small>{prev.title}
				</a>
			{/if}
			{#if next}
				<a class="guide-pager-link guide-pager-next" href={resolve(next.path)}>
					<small>Next</small>{next.title}
				</a>
			{/if}
		</nav>
	</article>
</main>
