<script lang="ts">
	import { resolve } from '$app/paths';
	import Logo from './Logo.svelte';
	import { GITHUB, NPM } from './links.js';
</script>

<header class="s-header">
	<nav class="s-page s-nav" aria-label="Main">
		<a class="s-brand" href={resolve('/')} aria-label="Sépale, home">
			<Logo size={30} />
			<span class="s-brand-name">Sépale</span>
		</a>
		<div class="s-links">
			<a class="s-start" href={resolve('/components')}>Components</a>
			<a href={resolve('/theme')}>Theme{' '}<span class="s-wide">generator</span></a>
			<a href={resolve('/about')}>About</a>
			<a class="s-wide" href={GITHUB}>GitHub</a>
			<a class="s-wide" href={NPM}>npm</a>
		</div>
	</nav>
</header>

<style>
	.s-header {
		position: sticky;
		top: 0;
		z-index: 10;
		height: var(--s-header-height);
		background: var(--s-ink);
		border-bottom: 1px solid var(--s-ink-line);
		font: 400 1rem/1.65 var(--s-font-body);
	}

	.s-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		height: 100%;
	}

	.s-brand {
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--s-on-ink);
		font: 500 1.5rem var(--s-font-display);
		text-decoration: none;
	}

	.s-links {
		display: flex;
		align-items: center;
		gap: clamp(14px, 3vw, 28px);
	}

	.s-links a {
		color: var(--s-on-ink-muted);
		font-size: 0.92rem;
		text-decoration: none;
		white-space: nowrap;
	}

	.s-links a:hover {
		color: var(--s-on-ink);
	}

	/* The way in: same colour as the main button of the home page. */
	.s-links .s-start {
		padding: 4px 12px;
		border-radius: 999px;
		background: var(--s-leaf-light);
		color: var(--s-ink);
		font-weight: 600;
	}

	.s-links .s-start:hover {
		background: #fff;
		color: var(--s-ink);
	}

	/* On a phone GitHub and npm stay in the footer, the logo alone leads home. */
	@media (max-width: 560px) {
		.s-brand-name,
		.s-wide {
			display: none;
		}

		.s-links {
			gap: 12px;
		}
	}
</style>
