<script lang="ts">
	// The home page: what Sepale is, then the way into the two things the site is
	// for, the components and the theme generator. Everything inside a
	// `.uu-island` is the kit itself, in the family picked here; the choice
	// follows into the app.
	import { asset, resolve } from '$app/paths';
	import { Alert, Button, Card, Chip, Input, Kanban, Progress, Stat, Toggle, type KanbanMove } from '$lib/index.js';
	import { serializeTheme } from '$lib/theme.js';
	import { paramsByFamily, themesByFamily } from '$lib/generated/registry.js';
	import {
		COMPONENTS,
		categoryFor,
		families,
		playground,
		selectFamily,
		selectTheme,
		themesFor
	} from './playground.svelte.js';
	import { highlight } from './highlight.js';
	import Logo from './Logo.svelte';
	import Page from './Page.svelte';
	import Petals from './Petals.svelte';

	const componentCount = COMPONENTS.reduce((sum, group) => sum + group.items.length, 0);
	const themeCount = Object.values(themesByFamily).reduce((sum, themes) => sum + themes.length, 0);

	const INSTALL = 'npm install @sepale/components @sepale/style';

	let copied = $state(false);
	async function copyInstall() {
		await navigator.clipboard.writeText(INSTALL);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	/* ── The board ───────────────────────────────────────────────────────── */

	type Task = { id: string; title: string; status: string };

	const COLUMNS = [
		{ id: 'sown', title: 'Sown' },
		{ id: 'growing', title: 'Growing' },
		{ id: 'bloom', title: 'In bloom' }
	];

	let tasks = $state<Task[]>([
		{ id: '1', title: 'Peonies, north bed', status: 'sown' },
		{ id: '2', title: 'Cosmos along the fence', status: 'sown' },
		{ id: '3', title: 'Dahlias, south wall', status: 'growing' },
		{ id: '4', title: 'Sunflowers by the shed', status: 'bloom' },
		{ id: '5', title: 'Daisies in the lawn, on purpose', status: 'bloom' }
	]);

	function move({ item, to, index }: KanbanMove<Task>) {
		const rest = tasks.filter((t) => t.id !== item.id);
		const before = rest.filter((t) => t.status === to)[index];
		rest.splice(before ? rest.indexOf(before) : rest.length, 0, { ...item, status: to });
		tasks = rest;
	}

	/* ── The code samples ────────────────────────────────────────────────── */

	let packageCode = $derived(
		highlight(`<script>
	import { Card, Kanban } from '@sepale/components/${playground.family}';
	import '@sepale/style/${playground.family}.css';
	import '@sepale/style/${playground.family}/themes/${playground.theme}.css';
<\/script>

<Kanban {items} {columns} columnOf={(t) => t.status} key={(t) => t.id} {onMove}>
	{#snippet item(task)}
		<Card size="sm">{task.title}</Card>
	{/snippet}
</Kanban>`)
	);

	let snapshotCode = $derived(
		highlight(`<link rel="stylesheet" href="${playground.family}.css" />
<link rel="stylesheet" href="theme.css" />

<button class="btn btn-primary">Plant</button>`)
	);

	/* The real file the generator exports, for the family picked above. */
	let themeCode = $derived.by(() => {
		const lines = serializeTheme(playground.tokens).split('\n');
		const shown = lines.slice(0, 13).join('\n');
		return highlight(lines.length > 13 ? `${shown}\n\t/* … */\n}` : shown);
	});

	const FEATURES = [
		{ title: 'Sized by font-size', text: 'Components are em-based and carry no breakpoints. Change the font size and the whole component follows.' },
		{ title: 'Types that match the CSS', text: '@sepale/components/<family> narrows every prop to what that family ships, so a variant it lacks is a compile error.' },
		{ title: 'Classes before components', text: 'A component is a DOM structure and a set of classes. The Svelte wrapper is the quick way in, not the only one.' },
		{ title: 'Plain compiled CSS', text: 'No Tailwind, no @apply, no config. A family is one stylesheet, and the reset is optional and separate.' },
		{ title: 'Data views included', text: 'A data handler drives filters, sort, search, pages and pending edits. Tables, grids, lists and kanbans only draw its rows.' },
		{ title: 'Families stand alone', text: 'Each family writes the whole of every component and reads nothing from another, so one can go far without breaking its neighbours.' }
	];
</script>

<svelte:head>
	<title>Sépale: UI components in CSS or Svelte</title>
	<meta name="description" content="Sépale is a low-key component library, available in CSS or Svelte. Pick a visual style and adjust it to your colours." />
	<!-- Picking a family swaps a stylesheet: have them all ready, at low priority. -->
	{#each families as family (family)}
		<link rel="prefetch" as="style" href={asset(`/families/${family}.css`)} />
	{/each}
</svelte:head>

{#snippet picker(label: string)}
	<div class="s-picker" role="group" aria-label={label}>
		{#each families as family (family)}
			<button
				type="button"
				class="s-pick"
				aria-pressed={playground.family === family}
				onclick={() => selectFamily(family)}
			>{family}</button>
		{/each}
	</div>
{/snippet}

<Page>
	<section class="s-hero">
		<Petals />
		<div class="s-page s-hero-grid">
			<div class="s-hero-text">
				<div class="s-lockup">
					<Logo size={76} />
					<div class="s-name">
						<p class="s-wordmark">Sépale</p>
						<p class="s-motto">Do gild the lily</p>
					</div>
				</div>
				<h1 class="s-h1 s-title">What you need,<br />as you like it</h1>
				<p class="s-lead">
					Sépale is a low-key component library, available in CSS or Svelte. Pick a visual style and adjust it to your colours.
				</p>
				<div class="s-actions">
					<a class="s-button s-primary" href={resolve('/components')}>Browse the components</a>
					<a class="s-button s-secondary" href={resolve('/theme')}>Open the theme generator</a>
				</div>
				<div class="s-code s-install">
					<pre><code>{INSTALL}</code></pre>
					<button type="button" class="s-copy" onclick={copyInstall}>{copied ? 'Copied' : 'Copy'}</button>
				</div>
				<dl class="s-figures">
					<div><dt>families</dt><dd>{families.length}</dd></div>
					<div><dt>themes</dt><dd>{themeCount}</dd></div>
					<div><dt>components</dt><dd>{componentCount}</dd></div>
				</dl>
			</div>

			<div class="s-showcase">
				{@render picker('Family shown in this preview')}
				<div class="s-island uu-island">
					<Card>
						{#snippet title()}New bed{/snippet}
						<Input value="Dahlias, south wall" aria-label="Name" />
						<label class="s-row"><Toggle color="primary" checked /> Water automatically</label>
						<div class="s-row">
							<Chip size="sm" color="success">Planted</Chip>
							<Chip size="sm">Full sun</Chip>
						</div>
						<Progress color="primary" value={64} aria-label="Growth" />
						<div class="s-row s-end">
							<Button size="sm">Cancel</Button>
							<Button size="sm" color="primary">Save</Button>
						</div>
					</Card>
					<div class="s-stack">
						<Stat title="In bloom" value="1,284" desc="+12% this week" />
						<Alert color="success" title="Frost is over">The seedlings can go out.</Alert>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="s-page s-section">
		<h2 class="s-h2 s-heading">One markup, {families.length} families</h2>
		<p class="s-intro">
			Changing family is changing a stylesheet and an import, never the markup. Pick one, then drag the cards: this is the kit
			itself, not a picture of it.
		</p>
		<div class="s-families">
			{#each families as family (family)}
				<button
					type="button"
					class="s-family"
					aria-pressed={playground.family === family}
					onclick={() => selectFamily(family)}
				>
					<strong class="s-family-name">{family}</strong>
					<span>{categoryFor(family)}</span>
					<span class="s-family-count">{themesFor(family).length} themes · {paramsByFamily[family]?.length ?? 0} parameters</span>
				</button>
			{/each}
		</div>
		<label class="s-theme">
			Theme
			<select class="s-select" value={playground.theme} onchange={(e) => selectTheme(e.currentTarget.value)}>
				{#each themesFor(playground.family) as theme (theme.name)}
					<option value={theme.name}>{theme.label}</option>
				{/each}
			</select>
		</label>
		<div class="s-board uu-island">
			<Kanban size="sm" items={tasks} columns={COLUMNS} columnOf={(t) => t.status} key={(t) => t.id} onMove={move}>
				{#snippet item(task)}
					<Card size="sm">{task.title}</Card>
				{/snippet}
			</Kanban>
		</div>
		<div class="s-code">
			<pre>{@html packageCode}</pre>
		</div>
	</section>

	<section class="s-dark">
		<div class="s-page">
			<h2 class="s-h2 s-heading">{componentCount} components, each with its page</h2>
			<p class="s-intro s-intro-dark">
				Every page has live examples, the Svelte props, and the classes the active family actually ships, read from its compiled
				stylesheet so the documentation cannot drift from the CSS.
			</p>
			<div class="s-catalogue">
				{#each COMPONENTS as group (group.group)}
					<div>
						<h3 class="s-h3 s-group">{group.group}</h3>
						<ul class="s-items">
							{#each group.items as item (item.id)}
								<li><a href={resolve(`/components/${item.id}`)}>{item.label}</a></li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<section class="s-page s-section s-tune">
		<div>
			<h2 class="s-h2 s-heading">Tune it, don’t fork it</h2>
			<p class="s-intro">
				Each family declares its own parameters: colours, radii, and knobs of its own, like a shadow offset or a hand-drawn wobble.
				The theme generator edits them live on a make-believe app, then exports a <code class="s-inline">theme.css</code> to lay
				over the family’s stylesheet.
			</p>
			<a class="s-button s-accent" href={resolve('/theme')}>Open the theme generator</a>
		</div>
		<div class="s-code">
			<pre>{@html themeCode}</pre>
		</div>
	</section>

	<section class="s-page s-section s-rest">
		<h2 class="s-h2 s-heading">Two ways to get it</h2>
		<div class="s-ways">
			<div class="s-way">
				<h3 class="s-h3 s-way-title">The packages follow the kit</h3>
				<p class="s-way-text">
					<code class="s-inline">@sepale/style</code> is the stylesheets alone, with no dependency. <code class="s-inline">@sepale/components</code>
					adds the Svelte layer, one typed entry point per family: switching family is a type change, and the compiler lists what to fix.
					Parameters, classes and props follow semver.
				</p>
				<div class="s-code">
					<pre>{@html highlight(`import { Button } from '@sepale/components/${playground.family}';\nimport '@sepale/style/${playground.family}.css';`)}</pre>
				</div>
			</div>
			<div class="s-way">
				<h3 class="s-h3 s-way-title">The files are yours</h3>
				<p class="s-way-text">
					Download a zip from the theme generator: the family’s stylesheet, your theme and, if you want them, the Svelte components
					written for that family alone. A snapshot never updates, so change what you like. Without Svelte, write the classes yourself.
				</p>
				<div class="s-code">
					<pre>{@html snapshotCode}</pre>
				</div>
			</div>
		</div>
	</section>

	<section class="s-page s-section s-rest">
		<h2 class="s-h2 s-heading">And the rest</h2>
		<ul class="s-features">
			{#each FEATURES as feature (feature.title)}
				<li>
					<h3 class="s-h3 s-feature-title">{feature.title}</h3>
					<p class="s-feature-text">{feature.text}</p>
				</li>
			{/each}
		</ul>
	</section>
</Page>

<style>
	.s-hero {
		position: relative;
		padding-block: clamp(32px, 5vw, 64px);
		background: var(--s-ink);
		color: var(--s-on-ink);
		overflow: hidden;
	}

	.s-hero-grid {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
		align-items: center;
		gap: clamp(32px, 5vw, 64px);
	}

	.s-lockup {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 28px;
	}

	.s-wordmark {
		margin: 0;
		font: 500 3.4rem/1 var(--s-font-display);
	}

	.s-name {
		text-align: start;
	}

	.s-motto {
		margin: 6px 0 0;
		color: var(--s-leaf-light);
		font: 400 1.1rem/1.2 var(--s-font-display);
	}

	.s-title {
		font-size: clamp(2.3rem, 5vw, 3.6rem);
		line-height: 1.06;
	}

	.s-lead {
		max-width: 34rem;
		margin: 20px 0 28px;
		color: var(--s-on-ink-muted);
		font-size: 1.1rem;
	}

	.s-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
	}

	.s-button {
		display: inline-block;
		padding: 10px 22px;
		border-radius: 999px;
		font: 500 1.05rem var(--s-font-display);
		text-decoration: none;
	}

	.s-primary {
		background: var(--s-leaf-light);
		color: var(--s-ink);
	}

	.s-primary:hover {
		background: #fff;
	}

	.s-secondary {
		border: 1px solid var(--s-ink-line);
		color: var(--s-on-ink);
	}

	.s-secondary:hover {
		border-color: var(--s-leaf-light);
	}

	.s-accent {
		background: var(--s-accent);
		color: var(--s-on-accent);
	}

	.s-install {
		width: fit-content;
		max-width: 100%;
		margin-top: 16px;
		background: var(--s-ink-raised);
		border-radius: 999px;
	}

	.s-install pre {
		padding: 9px 76px 9px 18px;
		text-align: start;
	}

	.s-install .s-copy {
		top: 7px;
	}

	.s-figures {
		display: flex;
		flex-wrap: wrap;
		gap: 12px 28px;
		margin: 24px 0 0;
	}

	.s-figures div {
		display: flex;
		flex-direction: column-reverse;
	}

	.s-figures dd {
		margin: 0;
		font: 500 1.7rem/1.1 var(--s-font-display);
	}

	.s-figures dt {
		color: var(--s-on-ink-muted);
		font-size: 0.82rem;
	}

	.s-showcase {
		display: flex;
		flex-direction: column;
		gap: 12px;
		min-width: 0;
	}

	.s-picker {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.s-pick {
		padding: 5px 14px;
		border: 1px solid var(--s-ink-line);
		border-radius: 999px;
		background: none;
		color: var(--s-on-ink-muted);
		font: 500 0.875rem var(--s-font-body);
		cursor: pointer;
	}

	.s-pick:hover {
		color: var(--s-on-ink);
	}

	.s-pick[aria-pressed='true'] {
		border-color: var(--s-leaf-light);
		background: var(--s-leaf-light);
		color: var(--s-ink);
	}

	/* Where the family shows. The line height is taken back from the site's. */
	.s-island {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
		gap: 14px;
		align-items: start;
		padding: 18px;
		border-radius: 14px;
		line-height: 1.5;
	}

	.s-stack {
		display: flex;
		flex-direction: column;
		gap: 14px;
		min-width: 0;
	}

	.s-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
	}

	.s-end {
		justify-content: flex-end;
	}

	.s-section {
		padding-block: clamp(56px, 8vw, 88px);
	}

	/* Two plain sections in a row: one gap between them, not two. */
	.s-rest + .s-rest {
		padding-top: 0;
	}

	.s-heading {
		margin-bottom: 16px;
		font-size: clamp(1.7rem, 3.4vw, 2.5rem);
	}

	.s-intro {
		max-width: 46rem;
		margin: 0 0 28px;
		color: var(--s-text-muted);
	}

	.s-intro-dark {
		color: var(--s-on-ink-muted);
	}

	.s-inline {
		font-family: var(--s-font-mono);
		font-size: 0.875em;
		font-variant-ligatures: none;
	}

	.s-families {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
		gap: 10px;
	}

	.s-family {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 12px 14px;
		border: 1px solid var(--s-line);
		border-radius: 14px;
		background: none;
		color: var(--s-text-muted);
		font: 400 0.875rem/1.4 var(--s-font-body);
		text-align: start;
		cursor: pointer;
	}

	.s-family:hover {
		border-color: var(--s-accent);
	}

	.s-family[aria-pressed='true'] {
		border-color: var(--s-accent);
		box-shadow: inset 0 0 0 1px var(--s-accent);
		background: var(--s-surface-raised);
	}

	.s-family-name {
		color: var(--s-text);
		font: 500 1.25rem var(--s-font-display);
	}

	.s-family-count {
		font-size: 0.78rem;
	}

	.s-theme {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		margin-block: 18px 12px;
		color: var(--s-text-muted);
		font-size: 0.875rem;
	}

	.s-select {
		padding: 5px 10px;
		border: 1px solid var(--s-line);
		border-radius: 8px;
		background: var(--s-surface);
		color: var(--s-text);
		font: inherit;
	}

	.s-board {
		margin-bottom: 14px;
		padding: 18px;
		border: 1px solid var(--s-line);
		border-radius: 14px;
		line-height: 1.5;
	}

	.s-dark {
		padding-block: clamp(56px, 8vw, 88px);
		background: var(--s-ink);
		color: var(--s-on-ink);
	}

	.s-catalogue {
		columns: 15rem;
		column-gap: 32px;
	}

	.s-catalogue > div {
		break-inside: avoid;
		padding-bottom: 24px;
	}

	.s-group {
		margin-bottom: 8px;
		color: var(--s-leaf-light);
		font-size: 1.2rem;
	}

	.s-items {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.s-items a {
		display: block;
		padding: 2px 10px;
		border: 1px solid var(--s-ink-line);
		border-radius: 999px;
		color: var(--s-on-ink);
		font-size: 0.82rem;
		text-decoration: none;
	}

	.s-items a:hover {
		border-color: var(--s-leaf-light);
		background: var(--s-ink-raised);
	}

	.s-tune {
		display: grid;
		grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
		align-items: center;
		gap: clamp(32px, 5vw, 72px);
	}

	.s-ways {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
		gap: 28px 32px;
		margin-top: 20px;
	}

	.s-way {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.s-way .s-code {
		margin-top: auto;
	}

	.s-way-title,
	.s-feature-title {
		margin-bottom: 6px;
		font-size: 1.25rem;
	}

	.s-way-text {
		margin: 0 0 14px;
		color: var(--s-text-muted);
	}

	.s-features {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr));
		gap: 28px 40px;
		margin: 28px 0 0;
		padding: 0;
		list-style: none;
	}

	.s-feature-text {
		margin: 0;
		color: var(--s-text-muted);
	}

	@media (max-width: 860px) {
		.s-hero-grid,
		.s-tune {
			grid-template-columns: minmax(0, 1fr);
		}

		/* One column: the hero stands in the middle of the screen. */
		.s-hero-text {
			text-align: center;
		}

		.s-lockup,
		.s-actions,
		.s-figures,
		.s-picker {
			justify-content: center;
		}

		.s-lead,
		.s-install {
			margin-inline: auto;
		}
	}

	/* The command no longer fits on a line: it wraps, so all of it can be read. */
	@media (max-width: 560px) {
		.s-install {
			border-radius: 22px;
		}

		.s-install pre {
			font-size: 0.8rem;
			white-space: pre-wrap;
		}
	}
</style>
