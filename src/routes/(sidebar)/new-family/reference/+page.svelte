<script lang="ts">
	// Writing a family by hand: the rules in short, a family to start from,
	// then every component — classes, states, custom properties, motion, DOM.
	// The data is the family kit's (kit.server.ts), laid out for a person; the
	// kit's Markdown says the same thing to an assistant.
	import { asset, resolve } from '$app/paths';
	import { families } from '$lib/generated/registry.js';
	import { categoryFor } from '../../../playground.svelte.js';
	import type { Reference } from '../../../family-kit/kit.server.js';

	let { data }: { data: { references: Reference[] } } = $props();

	let query = $state('');
	let shown = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return data.references;
		return data.references.filter(
			(r) =>
				r.label.toLowerCase().includes(q) ||
				r.namespaces.some((n) => n.includes(q)) ||
				r.classes.some((c) => c.cls.includes(q))
		);
	});

	/* The table of contents, in the sidebar's groups. */
	let groups = $derived.by(() => {
		const map = new Map<string, Reference[]>();
		for (const r of shown) map.set(r.group, [...(map.get(r.group) ?? []), r]);
		return [...map.entries()];
	});

	const kit = resolve('/family-kit/index.md');
</script>

<!-- The scroll container takes the whole width, so its scrollbar stays at
     the window edge; the column inside is centred, like a component page. -->
<main class="content">
<div class="rf">
	<p class="rf-back"><a href={resolve('/new-family')}>← Create a family</a></p>
	<h1 class="rf-title">Writing a family by hand</h1>
	<p class="rf-lede">
		A family is one CSS file that paints components whose DOM and classes are fixed. This page is
		everything those components expose to it: for each one, its classes, the states its DOM goes
		through, the custom properties it writes, how it moves, and the markup it renders. The same
		facts, written for an assistant, are the <a href={kit}>family kit</a>.
	</p>

	<section class="rf-section">
		<h2 class="rf-h2">Start from a family</h2>
		<p class="rf-note">
			The quickest way in is to copy a built family and rewrite its values: its stylesheet is a
			complete, working answer to every rule below. The compiled CSS is what you load; the SCSS
			sources are easier to read, one file per component.
		</p>
		<div class="rf-starters">
			{#each families as f (f)}
				<div class="rf-starter">
					<strong>{f}</strong>
					<span>{categoryFor(f)}</span>
					<span class="rf-starter-links">
						<a href={asset(`/families/${f}.css`)} download="{f}.css">CSS</a>
						<a href={resolve(`/family-kit/reference/${f}/index.scss` as `/family-kit/reference/${string}`)} target="_blank" rel="noopener">SCSS index</a>
					</span>
				</div>
			{/each}
		</div>
	</section>

	<section class="rf-section">
		<h2 class="rf-h2">The rules, in short</h2>
		<ul class="rf-rules">
			<li>
				<strong>Header and parameters.</strong> A <code>STYLE FAMILY — « name »  (after …)</code>
				comment names the family. Each parameter a theme may set has its default on
				<code>:where(:root)</code> and an entry in one <code>/*! uu-params [ … ] */</code> JSON
				comment, which the theme editor reads.
			</li>
			<li>
				<strong>Intrinsic sizing.</strong> Lengths in <code>em</code>; a size variant only sets
				<code>--fontsize</code>; frames grow with <code>calc(Nem * var(--scale))</code>, text never
				does. No breakpoints.
			</li>
			<li>
				<strong>Fill slots.</strong> A component's base rule paints from its own custom properties
				(<code>background-color: var(--btn-bg)</code>); variants set them. That is how variants
				compose and how <code>join</code> rounds its children's corners.
			</li>
			<li>
				<strong>Recipes on <code>:where(*)</code>.</strong> A formula built from other custom
				properties resolves on each element, so a state can change one input and the whole recipe
				follows.
			</li>
			<li>
				<strong>Classes and states.</strong> Write the classes listed below, under their namespace,
				whole. Give every listed state a visible answer, and <code>:focus-visible</code> to
				everything focusable.
			</li>
			<li>
				<strong>Motion.</strong> What moves on a change of state is yours: CSS transitions and
				keyframes. A few components animate themselves with Svelte's transitions (draw them at rest,
				they move them), and a few wait for your CSS (an element removed on
				<code>animationend</code> needs an animation). Each component's <em>Motion</em> says which.
			</li>
		</ul>
		<p class="rf-note">
			The full contract, with the <code>uu-params</code> fields, the colour names and the type
			scale: <a href="{kit}#the-contract">the family kit</a>. Then load the file on
			<a href={resolve('/new-family')}>Create a family</a>: its report says what is missing.
		</p>
	</section>

	<section class="rf-section">
		<div class="rf-toc-head">
			<h2 class="rf-h2">Components <span class="rf-count">{shown.length}</span></h2>
			<input class="ui-input ui-input-sm rf-search" type="search" placeholder="Filter: name or class" bind:value={query} />
		</div>
		<nav class="rf-toc" aria-label="Components">
			{#each groups as [group, refs] (group)}
				<div class="rf-toc-group">
					<span class="rf-toc-title">{group}</span>
					{#each refs as r (r.id)}<a class="rf-chip" href="#{r.id}">{r.label}</a>{/each}
				</div>
			{/each}
		</nav>
	</section>

	{#each shown as r (r.id)}
		<article class="rf-comp" id={r.id}>
			<header class="rf-comp-head">
				<h2 class="rf-h2">{r.label}</h2>
				<span class="rf-group">{r.group}</span>
				<a class="rf-page" href={resolve(`/components/${r.id}`)}>Live examples →</a>
			</header>
			<p class="rf-desc">{r.description}</p>
			<dl class="rf-meta">
				<dt>Namespaces</dt>
				<dd>
					{#each r.namespaces as n (n)}<code>{n}</code>{' '}{:else}none: it draws nothing{/each}
				</dd>
				<dt>Svelte</dt>
				<dd>
					{#each r.wrappers as w (w)}<code>&lt;{w}&gt;</code>{' '}{:else}no wrapper: the classes are written by hand{/each}
				</dd>
				{#if r.sources.length}
					<dt>Sources</dt>
					<dd>
						{#each r.sources as f, i (f)}{i ? ', ' : ''}<a
								href={resolve(`/family-kit/reference/${f}/${r.id}.scss` as `/family-kit/reference/${string}`)}
								target="_blank"
								rel="noopener">{f}</a
							>{/each}
					</dd>
				{/if}
			</dl>

			{#if r.classes.length}
				<h3 class="rf-h3">Classes</h3>
				<div class="rf-table-wrap">
					<table class="rf-table">
						<thead><tr><th>Class</th><th>Kind</th><th>Shipped by</th><th>What it does</th></tr></thead>
						<tbody>
							{#each r.classes as c (c.cls)}
								<tr>
									<td><code class="rf-cls" data-kind={c.kind}>.{c.cls}</code></td>
									<td class="rf-dim">{c.label}</td>
									<td class="rf-dim">{c.shipping}</td>
									<td>{c.effect}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}

			{#if r.states.length}
				<h3 class="rf-h3">States</h3>
				<ul class="rf-list">
					{#each r.states as s (s.cls)}
						<li><code>.{s.cls}</code> {#each s.states as st (st)}<code class="rf-state">{st}</code>{/each}</li>
					{/each}
				</ul>
			{/if}

			{#if r.hooks.length}
				<h3 class="rf-h3">Custom properties it writes</h3>
				<ul class="rf-list">
					{#each r.hooks as h (h.component)}
						<li><code>&lt;{h.component}&gt;</code> {#each h.hooks as v (v)}<code class="rf-state">{v}</code>{/each}</li>
					{/each}
				</ul>
			{/if}

			{#if r.motion.length}
				<h3 class="rf-h3">Motion</h3>
				<ul class="rf-list">
					{#each r.motion as m (m.component)}
						{#each m.motion as line (line)}<li>{line.replace(/`/g, '')}</li>{/each}
					{/each}
				</ul>
			{/if}

			{#if r.dom.length}
				<h3 class="rf-h3">DOM <span class="rf-dim">— {r.dom[0]!.title}</span></h3>
				<pre class="rf-pre"><code>{r.dom[0]!.html}</code></pre>
				{#if r.dom.length > 1}
					<details class="rf-more">
						<summary>{r.dom.length - 1} more example{r.dom.length > 2 ? 's' : ''}</summary>
						{#each r.dom.slice(1) as d (d.title)}
							<p class="rf-dom-title">{d.title}</p>
							<pre class="rf-pre"><code>{d.html}</code></pre>
						{/each}
					</details>
				{/if}
			{/if}
		</article>
	{/each}
</div>
</main>

<style>
	.rf {
		width: 100%;
		max-width: 60rem;
		margin-inline: auto;
	}
	.rf-back {
		margin: 0 0 0.5rem;
		font-size: 0.85rem;
	}
	.rf a {
		color: var(--ui-color-primary);
	}
	.rf-title {
		margin: 0 0 0.75rem;
		font-size: 1.9rem;
		font-weight: 800;
		letter-spacing: -0.02em;
	}
	.rf-lede {
		margin: 0;
		font-size: 1rem;
		line-height: 1.6;
		color: color-mix(in oklab, var(--app-fg) 80%, transparent);
	}
	.rf-section {
		margin-top: 2rem;
	}
	.rf-h2 {
		margin: 0 0 0.5rem;
		font-size: 1.3rem;
		font-weight: 800;
	}
	.rf-h3 {
		margin: 1.1rem 0 0.4rem;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: color-mix(in oklab, var(--app-fg) 60%, transparent);
	}
	.rf-note,
	.rf-desc {
		margin: 0.5rem 0;
		font-size: 0.9rem;
		line-height: 1.55;
		color: color-mix(in oklab, var(--app-fg) 75%, transparent);
	}
	.rf code {
		font-family: ui-monospace, SFMono-Regular, monospace;
		font-size: 0.82em;
		padding: 0.1em 0.35em;
		border-radius: 0.3rem;
		background: color-mix(in oklab, var(--app-fg) 8%, transparent);
	}
	.rf-starters {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
		gap: 0.6rem;
		margin-top: 0.75rem;
	}
	.rf-starter {
		display: grid;
		gap: 0.15rem;
		padding: 0.75rem 0.9rem;
		border: 1px solid color-mix(in oklab, var(--app-fg) 12%, transparent);
		border-radius: 0.75rem;
		font-size: 0.8rem;
		color: color-mix(in oklab, var(--app-fg) 65%, transparent);
	}
	.rf-starter strong {
		font-size: 1rem;
		color: var(--app-fg);
	}
	.rf-starter-links {
		display: flex;
		gap: 0.75rem;
		margin-top: 0.3rem;
		font-weight: 600;
	}
	.rf-rules {
		margin: 0.5rem 0;
		padding-left: 1.2rem;
		display: grid;
		gap: 0.5rem;
		font-size: 0.9rem;
		line-height: 1.55;
	}
	.rf-toc-head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}
	.rf-count {
		font-size: 0.8rem;
		font-weight: 600;
		color: color-mix(in oklab, var(--app-fg) 50%, transparent);
	}
	.rf-search {
		width: min(100%, 16rem);
	}
	.rf-toc {
		display: grid;
		gap: 0.5rem;
		margin-top: 0.6rem;
	}
	.rf-toc-group {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.3rem;
	}
	.rf-toc-title {
		min-width: 6.5rem;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: color-mix(in oklab, var(--app-fg) 55%, transparent);
	}
	.rf .rf-chip {
		padding: 0.12rem 0.5rem;
		border-radius: 0.4rem;
		font-size: 0.8rem;
		color: inherit;
		text-decoration: none;
		background: color-mix(in oklab, var(--app-fg) 7%, transparent);
	}
	.rf .rf-chip:hover {
		background: color-mix(in oklab, var(--ui-color-primary) 14%, transparent);
	}
	.rf-comp {
		margin-top: 2.25rem;
		padding-top: 1.5rem;
		border-top: 1px solid color-mix(in oklab, var(--app-fg) 10%, transparent);
		scroll-margin-top: 1rem;
	}
	.rf-comp-head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.75rem;
	}
	.rf-comp-head .rf-h2 {
		margin: 0;
	}
	.rf-group {
		font-size: 0.8rem;
		color: color-mix(in oklab, var(--app-fg) 55%, transparent);
	}
	.rf-page {
		margin-left: auto;
		font-size: 0.8rem;
		font-weight: 600;
	}
	.rf-meta {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 0.25rem 1rem;
		margin: 0.6rem 0 0;
		font-size: 0.85rem;
	}
	.rf-meta dt {
		color: color-mix(in oklab, var(--app-fg) 55%, transparent);
	}
	.rf-meta dd {
		margin: 0;
	}
	.rf-table-wrap {
		overflow-x: auto;
	}
	.rf-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.82rem;
	}
	.rf-table th {
		text-align: left;
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		padding: 0.4rem 0.6rem;
		color: color-mix(in oklab, var(--app-fg) 55%, transparent);
		border-bottom: 1px solid color-mix(in oklab, var(--app-fg) 10%, transparent);
	}
	.rf-table td {
		padding: 0.35rem 0.6rem;
		vertical-align: top;
		line-height: 1.45;
		border-bottom: 1px solid color-mix(in oklab, var(--app-fg) 6%, transparent);
	}
	.rf-dim {
		color: color-mix(in oklab, var(--app-fg) 55%, transparent);
		white-space: nowrap;
	}
	.rf code.rf-cls {
		white-space: nowrap;
	}
	.rf code.rf-cls[data-kind='root'] {
		background: color-mix(in oklab, var(--ui-color-primary) 22%, transparent);
		font-weight: 600;
	}
	.rf code.rf-cls[data-kind='part'] {
		background: color-mix(in oklab, var(--ui-color-info) 20%, transparent);
	}
	.rf code.rf-cls[data-kind='axis'] {
		background: color-mix(in oklab, var(--ui-color-success) 20%, transparent);
	}
	.rf code.rf-cls[data-kind='flag'] {
		background: color-mix(in oklab, var(--ui-color-warning) 24%, transparent);
	}
	.rf-list {
		margin: 0;
		padding-left: 1.2rem;
		display: grid;
		gap: 0.3rem;
		font-size: 0.85rem;
		line-height: 1.6;
	}
	.rf-state {
		margin-right: 0.25rem;
	}
	.rf-pre {
		margin: 0.4rem 0;
		padding: 0.8rem 1rem;
		max-height: 24rem;
		overflow: auto;
		border-radius: 0.6rem;
		font-size: 0.78rem;
		line-height: 1.55;
		background: color-mix(in oklab, var(--app-bg-2) 70%, var(--app-bg-3));
	}
	.rf-pre code {
		padding: 0;
		background: none;
	}
	.rf-more summary {
		cursor: pointer;
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--ui-color-primary);
	}
	.rf-dom-title {
		margin: 0.8rem 0 0;
		font-size: 0.8rem;
		font-weight: 600;
	}
</style>
