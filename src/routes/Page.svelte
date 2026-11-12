<script lang="ts">
	// A page that scrolls as a whole and ends on the footer. The pages with the
	// sidebar scroll inside their panes, so they have none.
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';
	import { GITHUB, NPM, SPONSOR } from './links.js';

	let { children }: { children: Snippet } = $props();
</script>

<div class="s-site">
	{@render children()}

	<!-- Only on the pages with a footer: on the sidebar pages it would cover
	     the panes' own controls. -->
	<a class="s-sponsor" href={SPONSOR} aria-label="Sponsor Sépale on GitHub">
		<span class="s-sponsor-heart" aria-hidden="true">♥</span>
		<span class="s-sponsor-label">Sponsor</span>
	</a>

	<footer class="s-footer">
		<div class="s-page s-footer-row">
			<span>MIT licensed. In French, <em>sépale</em> is a sepal, the small leaf that holds a flower. The families are named after flowers.</span>
			<span class="s-footer-links">
				<a class="s-link" href={resolve('/prefix')}>Class prefix</a>
				<a class="s-link" href={resolve('/about')}>About</a>
				<a class="s-link" href={GITHUB}>GitHub</a>
				<a class="s-link" href={NPM}>npm</a>
				<a class="s-link" href="{GITHUB}/issues">Report an issue</a>
			</span>
		</div>
	</footer>
</div>

<style>
	/* Always one click away, above the content. */
	.s-sponsor {
		position: fixed;
		right: 16px;
		bottom: 16px;
		z-index: 20;
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 14px;
		border: 1px solid var(--s-ink-line);
		border-radius: 999px;
		background: var(--s-ink);
		box-shadow: 0 4px 16px rgb(15 36 24 / 0.25);
		color: var(--s-on-ink);
		font-size: 0.88rem;
		font-weight: 600;
		text-decoration: none;
		transition: transform 0.15s;
	}

	.s-sponsor:hover {
		transform: translateY(-2px);
	}

	.s-sponsor-heart {
		color: #ea4aaa;
		font-size: 1.05rem;
		line-height: 1;
	}

	/* The bottom padding keeps the footer links clear of the sponsor badge. */
	.s-footer {
		padding-block: 28px 76px;
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

	/* The heart alone, to cover as little text as possible. */
	@media (max-width: 560px) {
		.s-sponsor {
			padding: 10px;
		}

		.s-sponsor-label {
			display: none;
		}
	}
</style>
