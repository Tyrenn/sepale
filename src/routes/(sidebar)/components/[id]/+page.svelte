<script lang="ts">
	// One component at a time: what it is, what it is made of, and then the
	// examples. The two tables describe the ACTIVE FAMILY — switch family in
	// the sidebar and they change, because a family that does not ship a
	// variant does not offer it either.
	import { page } from '$app/state';
	import { playground, COMPONENTS } from '../../../playground.svelte.js';
	import { pages, classRows, propRows, hasWrapper, contractOf } from '../doc.js';
	import type { Specimen } from '../dom.js';
	import DomTree from '../DomTree.svelte';

	let { data }: { data: { specimens: Specimen[] } } = $props();

	let id = $derived(page.params.id ?? 'button');
	let entry = $derived(pages[id]);
	let label = $derived(
		COMPONENTS.flatMap((g) => g.items).find((i) => i.id === id)?.label ?? id
	);

	let rows = $derived(entry ? classRows(id, playground.family) : []);
	let apiProps = $derived(entry ? propRows(id, playground.family) : []);
	let wrapped = $derived(hasWrapper(id, playground.family));
	let many = $derived(new Set(apiProps.map((p) => p.component)).size > 1);

	let tab = $state<'css' | 'svelte' | 'dom'>('css');

	/* The DOM tab: one example at a time, the first by default. */
	let specimens = $derived(data.specimens ?? []);
	let picked = $state(0);
	$effect(() => {
		void id;
		picked = 0;
	});
	let specimen = $derived(specimens[Math.min(picked, specimens.length - 1)]);
	let contract = $derived(contractOf(id));
	let hooks = $derived(contract.hooks.filter((h) => h.hooks.length));
</script>

<main class="content">
	<section class="gallery">
		<h2 class="gallery-title">{label}</h2>

		{#if entry}
			<p class="doc-lede">{entry.doc.description}</p>

			<div class="api">
				<div class="api-tabs" role="tablist">
					<button
						type="button"
						role="tab"
						class="api-tab"
						aria-selected={tab === 'css'}
						onclick={() => (tab = 'css')}>CSS</button
					>
					<button
						type="button"
						role="tab"
						class="api-tab"
						aria-selected={tab === 'svelte'}
						onclick={() => (tab = 'svelte')}>Svelte</button
					>
					<button
						type="button"
						role="tab"
						class="api-tab"
						aria-selected={tab === 'dom'}
						onclick={() => (tab = 'dom')}>DOM</button
					>
				</div>

				{#if tab === 'dom'}
					{#if specimen}
						{#if specimens.length > 1}
							<div class="dom-pick">
								<label>
									<span>Example</span>
									<select class="ui-select ui-select-xs" bind:value={picked}>
										{#each specimens as s, i (i)}<option value={i}>{s.title}</option>{/each}
									</select>
								</label>
							</div>
						{/if}
						<div class="dom-tree"><DomTree nodes={specimen.nodes} /></div>
						<p class="api-note dom-legend">
							What the examples below render, before any script runs: Svelte's own
							markers removed, siblings shaped alike folded (<span class="dom-chip">×n</span>).
							The structure is the components', the same in every family. Hover a class:
							<span class="dom-key" data-kind="root">root</span>
							<span class="dom-key" data-kind="part">part</span>
							<span class="dom-key" data-kind="axis">axis</span>
							<span class="dom-key" data-kind="flag">flag</span>
							<span class="dom-key" data-kind="unclassified">not the component's</span>
						</p>
					{:else}
						<p class="api-note api-none">
							No rendered example: this page's examples draw nothing on the server.
						</p>
					{/if}
					{#if contract.states.length}
						<table class="api-table dom-states">
							<thead>
								<tr><th>Class</th><th>States the families draw on it</th></tr>
							</thead>
							<tbody>
								{#each contract.states as row (row.cls)}
									<tr>
										<td><code>.{row.cls}</code></td>
										<td>{#each row.states as s (s)}<code class="dom-state">{s}</code>{/each}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{/if}
					{#if hooks.length}
						<p class="api-note">
							Custom properties the component writes on its elements, for the family to read:
							{#each hooks as h (h.component)}
								<br /><code>&lt;{h.component}&gt;</code>
								{#each h.hooks as v (v)}{' '}<code>{v}</code>{/each}
							{/each}
						</p>
					{/if}
				{:else if tab === 'css'}
					{#if rows.length}
					<table class="api-table">
						<thead>
							<tr><th>Class</th><th>Effect</th><th>Type</th></tr>
						</thead>
						<tbody>
							{#each rows as row (row.name)}
								<tr>
									<td><code>.{row.name}</code></td>
									<td>{row.effect}</td>
									<td class="api-kind">{row.type}</td>
								</tr>
							{/each}
						</tbody>
					</table>
					{:else if !entry.doc.namespaces.length}
						<p class="api-note api-none">
							No class at all: this component draws nothing, so there is nothing for a
							family to style. It only exists in Svelte.
						</p>
					{:else}
						<p class="api-note api-none">
							{playground.family} ships no class in this namespace.
						</p>
					{/if}
				{:else if wrapped}
					{#if apiProps.length}
					<table class="api-table">
						<thead>
							<tr>
								{#if many}<th>Component</th>{/if}
								<th>Prop</th><th>Type</th><th>Default</th><th>Description</th>
							</tr>
						</thead>
						<tbody>
							{#each apiProps as p (p.component + '.' + p.name)}
								<tr>
									{#if many}<td><code>&lt;{p.component}&gt;</code></td>{/if}
									<td><code>{p.name}</code></td>
									<td><code class="api-type">{p.type}</code></td>
									<td>{#if p.default}<code>{p.default}</code>{/if}</td>
									<td>{p.description}</td>
								</tr>
							{/each}
						</tbody>
					</table>
						<p class="api-note">
							Plus <code>class</code>, <code>children</code> and the native attributes of
							the element rendered. An axis this family does not ship has no prop at all
							— the table above is the whole of it.
						</p>
					{:else}
						<p class="api-note api-none">
							No props of its own: it takes <code>class</code>, <code>children</code> and
							the native attributes of the element it renders, and nothing else.
						</p>
					{/if}
				{:else}
					<p class="api-note api-none">
						No Svelte component, on purpose: this is one class on one element, with no
						axis and no structure to wrap, so a wrapper would only add an import. Write
						the class yourself — the CSS tab lists every one of them.
					</p>
				{/if}
			</div>

			<entry.examples />
		{/if}
	</section>
</main>

<style>
	.doc-lede {
		max-width: 56rem;
		margin: 0 0 1.25rem;
		font-size: 1rem;
		line-height: 1.6;
		color: color-mix(in oklab, var(--app-fg) 80%, transparent);
	}

	/* Deliberately not a .section box: this is reference, not a demo. */
	.api {
		width: 100%;
		max-width: 56rem;
		margin-bottom: 2.5rem;
		border: 1px solid color-mix(in oklab, var(--app-fg) 12%, transparent);
		border-radius: 0.85rem;
		background: color-mix(in oklab, var(--app-bg-2) 60%, var(--app-bg));
		overflow: hidden;
	}

	.api-tabs {
		display: flex;
		gap: 0.15rem;
		padding: 0.4rem 0.5rem 0;
		border-bottom: 1px solid color-mix(in oklab, var(--app-fg) 10%, transparent);
	}

	.api-tab {
		appearance: none;
		border: 1px solid transparent;
		border-bottom: none;
		background: none;
		font: inherit;
		font-size: 0.85rem;
		font-weight: 600;
		padding: 0.45rem 0.95rem;
		border-radius: 0.55rem 0.55rem 0 0;
		color: color-mix(in oklab, var(--app-fg) 50%, transparent);
		cursor: pointer;
		margin-bottom: -1px;
	}
	.api-tab:hover {
		color: var(--app-fg);
	}
	.api-tab[aria-selected='true'] {
		color: var(--app-fg);
		background: var(--app-bg);
		border-color: color-mix(in oklab, var(--app-fg) 10%, transparent);
	}

	.api-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.85rem;
	}
	.api-table th {
		text-align: left;
		font-weight: 600;
		font-size: 0.72rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		padding: 0.6rem 1rem;
		color: color-mix(in oklab, var(--app-fg) 55%, transparent);
		border-bottom: 1px solid color-mix(in oklab, var(--app-fg) 10%, transparent);
	}
	.api-table td {
		padding: 0.5rem 1rem;
		vertical-align: top;
		line-height: 1.45;
		border-bottom: 1px solid color-mix(in oklab, var(--app-fg) 6%, transparent);
	}
	.api-table tr:last-child td {
		border-bottom: none;
	}
	.api-table code {
		font-family: ui-monospace, SFMono-Regular, monospace;
		font-size: 0.82em;
		padding: 0.1em 0.35em;
		border-radius: 0.3rem;
		background: color-mix(in oklab, var(--app-fg) 8%, transparent);
	}
	.api-type {
		white-space: normal;
		word-break: break-word;
	}
	.api-kind {
		white-space: nowrap;
		color: color-mix(in oklab, var(--app-fg) 55%, transparent);
	}

	.api-note {
		margin: 0;
		padding: 0.75rem 1rem;
		font-size: 0.8rem;
		line-height: 1.5;
		color: color-mix(in oklab, var(--app-fg) 60%, transparent);
		border-top: 1px solid color-mix(in oklab, var(--app-fg) 8%, transparent);
	}
	.api-none {
		border-top: none;
		padding: 1.25rem 1rem;
	}

	/* ── DOM tab ─────────────────────────────────────────────────────── */
	.dom-pick {
		padding: 0.6rem 1rem 0;
	}
	.dom-pick label {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: color-mix(in oklab, var(--app-fg) 55%, transparent);
	}
	.dom-tree {
		margin: 0.6rem 1rem 0.9rem;
		padding: 0.8rem 1rem;
		max-height: 32rem;
		overflow: auto;
		border-radius: 0.6rem;
		font-family: ui-monospace, SFMono-Regular, monospace;
		font-size: 0.78rem;
		background: color-mix(in oklab, var(--app-bg-2) 70%, var(--app-bg-3));
	}
	.dom-legend {
		line-height: 1.9;
	}
	.dom-chip,
	.dom-key {
		padding: 0.05em 0.4em;
		border-radius: 0.3rem;
		font-family: ui-monospace, SFMono-Regular, monospace;
		font-size: 0.9em;
		background: color-mix(in oklab, var(--app-fg) 10%, transparent);
	}
	.dom-key[data-kind='root'] {
		background: color-mix(in oklab, var(--ui-color-primary) 22%, transparent);
	}
	.dom-key[data-kind='part'] {
		background: color-mix(in oklab, var(--ui-color-info) 20%, transparent);
	}
	.dom-key[data-kind='axis'] {
		background: color-mix(in oklab, var(--ui-color-success) 20%, transparent);
	}
	.dom-key[data-kind='flag'] {
		background: color-mix(in oklab, var(--ui-color-warning) 24%, transparent);
	}
	.dom-states {
		border-top: 1px solid color-mix(in oklab, var(--app-fg) 8%, transparent);
	}
	.dom-state {
		margin-right: 0.3rem;
	}
</style>
