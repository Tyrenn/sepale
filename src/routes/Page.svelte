<script lang="ts">
	// A page that scrolls as a whole and ends on the footer. The pages with the
	// sidebar scroll inside their panes, so they have none.
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';
	import { GITHUB, NPM } from './links.js';

	let { children }: { children: Snippet } = $props();
</script>

<div class="s-site">
	{@render children()}

	<footer class="s-footer">
		<div class="s-page s-footer-row">
			<span>MIT licensed. In French, <em>sépale</em> is a sepal, the small leaf that holds a flower. The families are named after flowers.</span>
			<span class="s-footer-links">
				<a class="s-link" href={resolve('/about')}>About</a>
				<a class="s-link" href={GITHUB}>GitHub</a>
				<a class="s-link" href={NPM}>npm</a>
				<a class="s-link" href="{GITHUB}/issues">Report an issue</a>
			</span>
		</div>
	</footer>
</div>

<style>
	.s-footer {
		padding-block: 28px;
		border-top: 1px solid var(--s-line);
		color: var(--s-text-muted);
		font-size: 0.875rem;
	}

	.s-footer-row {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 8px 24px;
	}

	.s-footer-links {
		display: flex;
		gap: 16px;
	}
</style>
