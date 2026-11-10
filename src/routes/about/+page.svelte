<script lang="ts">
	import { GITHUB, SPONSOR } from '../links.js';
	import Page from '../Page.svelte';

	const REPO = GITHUB;
	const INDEX = 'https://tyrenn.github.io/';

	const ways = [
		{
			title: 'Report a bug',
			text: 'A component that renders wrong in a family, a theme that breaks a state, a prop the types reject ? An issue with the family, the theme and a screenshot is the most useful help.',
			href: `${REPO}/issues/new`,
			label: 'Open an issue'
		},
		{
			title: 'Suggest a feature',
			text: 'A missing component, a variant a family lacks, a parameter worth exposing : describe it in an issue before writing code.',
			href: `${REPO}/issues`,
			label: 'Browse issues'
		},
		{
			title: 'Improve the docs',
			text: 'Each component page of this site is written by hand, next to the decisions in docs/. A typo fix or a clearer example is a welcome pull request.',
			href: `${REPO}/tree/main/docs`,
			label: 'docs/'
		}
	];

	const layout = [
		{ path: 'src/lib/components', text: 'The Svelte components, written by hand' },
		{ path: 'src/scss/families', text: 'The families, each one directory: the whole of every component, and its themes' },
		{ path: 'packages', text: 'The two npm packages, @sepale/style and @sepale/components' },
		{ path: 'src/routes', text: 'This site, its theme generator and its component pages' },
		{ path: 'docs', text: 'How a family is written, and the decisions behind Sépale' }
	];

	const EXPLORE = `pnpm run dev                  # compile the families, run this site locally
pnpm run build:css            # compile the families and regenerate the registry
node scripts/shoot.mjs daisy  # screenshot a family's components`;

	const SETUP = `git clone https://github.com/<you>/sepale
cd sepale && pnpm install
git checkout -b my-change`;
</script>

<svelte:head>
	<title>About: Sépale</title>
	<meta
		name="description"
		content="Sépale is open source and maintained on a volunteer basis. How to sponsor it, report bugs, suggest features, improve the docs and contribute code."
	/>
</svelte:head>

<Page>
	<main class="s-page s-about">
		<h1 class="s-h1 s-about-title">About</h1>
		<p class="s-about-lead">
			Sépale is an open source, MIT licensed project, maintained on a volunteer basis. Components come first, as CSS classes or Svelte
			components, and the CSS after : a family to pick, a few parameters to tune. Every bug report, idea and pull request helps it grow.
		</p>

		<h2 class="s-h2 s-about-more" id="support">Support</h2>
		<div class="s-support">
			<a class="s-card s-card-sponsor" href={SPONSOR}>
				<span class="s-card-heart" aria-hidden="true">♥</span>
				<strong class="s-card-title">Sponsor Sépale</strong>
				<span class="s-card-muted">Sponsoring on GitHub buys time to maintain Sépale, fix bugs and write new components and families.</span>
				<span class="s-card-cta">github.com/sponsors/Tyrenn <span class="s-card-arrow" aria-hidden="true">→</span></span>
			</a>
			<a class="s-card" href={INDEX}>
				<span class="s-card-heart" aria-hidden="true">✦</span>
				<strong class="s-card-title">More projects</strong>
				<span class="s-card-muted">Sépale is one of several open source tools by Tyren : a query builder, a web framework, and more.</span>
				<span class="s-card-cta">tyrenn.github.io <span class="s-card-arrow" aria-hidden="true">→</span></span>
			</a>
		</div>

		<h2 class="s-h2 s-about-more">Ways to help</h2>
		<div class="s-ways">
			{#each ways as way (way.title)}
				<section class="s-way">
					<h3 class="s-h3 s-way-title">{way.title}</h3>
					<p class="s-way-text">{way.text}</p>
					<a class="s-link" href={way.href}>{way.label}</a>
				</section>
			{/each}
		</div>

		<h2 class="s-h2 s-about-more">Find your way around</h2>
		<p class="s-about-intro">
			<a class="s-link" href={REPO}>The repository</a> is the source of the packages and of this site :
		</p>
		<dl class="s-layout">
			{#each layout as entry (entry.path)}
				<dt><a class="s-link" href="{REPO}/tree/main/{entry.path}"><code class="s-about-code">{entry.path}</code></a></dt>
				<dd>{entry.text}</dd>
			{/each}
		</dl>
		<div class="s-code"><pre>{EXPLORE}</pre></div>

		<h2 class="s-h2 s-about-more" id="contributing">Contributing code</h2>
		<ol class="s-steps">
			<li>
				<strong>Fork</strong> <a class="s-link" href={REPO}>the repository</a> and create a branch from <code class="s-about-code">main</code>.
				<div class="s-code"><pre>{SETUP}</pre></div>
			</li>
			<li>
				<strong>Make your change</strong>, then look at it : run the site and walk the component in a light and a dark theme, with hover,
				focus, disabled and checked. A look is judged by rendering. To add a family, follow
				<a class="s-link" href="{REPO}/blob/main/docs/families.md"><code class="s-about-code">docs/families.md</code></a>.
				<div class="s-code"><pre>pnpm run dev</pre></div>
			</li>
			<li>
				<strong>Check everything locally.</strong> It compiles every family and theme, then checks the types.
				<div class="s-code"><pre>pnpm run check</pre></div>
			</li>
			<li>
				<strong>Open a pull request</strong> against <code class="s-about-code">main</code>.
			</li>
		</ol>
	</main>
</Page>

<style>
	/* A single reading column, centered by .s-page. */
	.s-about {
		--s-page: 52rem;
		padding-block: clamp(32px, 5vw, 64px);
	}

	.s-about-title {
		font-size: clamp(2.2rem, 5vw, 3rem);
	}

	.s-about-lead {
		margin: 16px 0 0;
		font-size: 1.1rem;
	}

	.s-about-more {
		margin-block: 48px 16px;
		font-size: 1.75rem;
	}

	.s-about-intro {
		margin: 0 0 16px;
	}

	.s-about-code {
		font-family: var(--s-font-mono);
		font-size: 0.88em;
		font-variant-ligatures: none;
	}

	/* Support */
	.s-support {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: 16px;
	}

	.s-card {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 22px 24px;
		border: 1px solid var(--s-line);
		border-radius: 18px;
		background: var(--s-surface-raised);
		color: inherit;
		text-decoration: none;
		transition: border-color 0.15s;
	}

	.s-card:hover {
		border-color: var(--s-accent);
	}

	/* The sponsor card leads, in the colours of the header. */
	.s-card-sponsor {
		border-color: var(--s-ink-line);
		background: var(--s-ink);
		color: var(--s-on-ink);
	}

	.s-card-sponsor .s-card-muted {
		color: var(--s-on-ink-muted);
	}

	.s-card-sponsor:hover {
		border-color: #ea4aaa;
	}

	.s-card-heart {
		color: var(--s-accent);
		font-size: 1.5rem;
		line-height: 1;
	}

	.s-card-sponsor .s-card-heart {
		color: #ea4aaa;
	}

	.s-card-title {
		font: 500 1.3rem var(--s-font-display);
	}

	.s-card-muted {
		flex: 1;
		color: var(--s-text-muted);
		font-size: 0.95rem;
	}

	.s-card-cta {
		margin-top: 8px;
		font-size: 0.9rem;
		font-weight: 600;
	}

	.s-card-arrow {
		display: inline-block;
		transition: transform 0.15s;
	}

	.s-card:hover .s-card-arrow {
		transform: translateX(4px);
	}

	/* Ways to help */
	.s-ways {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: 16px;
	}

	.s-way {
		display: flex;
		flex-direction: column;
		padding: 20px;
		border: 1px solid var(--s-line);
		border-radius: 18px;
		background: var(--s-surface-raised);
	}

	.s-way-title {
		margin: 0 0 8px;
		font-size: 1.15rem;
	}

	.s-way-text {
		flex: 1;
		margin: 0 0 14px;
		color: var(--s-text-muted);
		font-size: 0.95rem;
	}

	/* Find your way around */
	.s-layout {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 10px 20px;
		margin: 0 0 20px;
	}

	.s-layout dd {
		margin: 0;
		color: var(--s-text-muted);
	}

	.s-layout code {
		white-space: nowrap;
	}

	/* Contributing code */
	.s-steps {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 20px;
		margin: 0;
		padding-left: 1.4rem;
		list-style: decimal;
	}

	.s-steps li {
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.s-steps li::marker {
		color: var(--s-text-muted);
		font-family: var(--s-font-display);
	}

	.s-steps .s-code {
		margin-top: 10px;
		overflow-wrap: normal;
	}

	/* The repository layout stacks on a phone. */
	@media (max-width: 560px) {
		.s-layout {
			grid-template-columns: 1fr;
			gap: 2px;
		}

		.s-layout dd {
			margin-bottom: 10px;
		}
	}
</style>
