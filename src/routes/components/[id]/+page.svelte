<script lang="ts">
	// One component at a time: what it is, what it is made of, and then the
	// examples. The two tables describe the ACTIVE FAMILY — switch family in
	// the sidebar and they change, because a family that does not ship a
	// variant does not offer it either.
	import { page } from '$app/state';
	import { playground, COMPONENTS } from '../../playground.svelte.js';
	import { pages, classRows, propRows, hasWrapper } from '../doc.js';

	let id = $derived(page.params.id ?? 'button');
	let entry = $derived(pages[id]);
	let label = $derived(
		COMPONENTS.flatMap((g) => g.items).find((i) => i.id === id)?.label ?? id
	);

	let rows = $derived(entry ? classRows(id, playground.family) : []);
	let props = $derived(entry ? propRows(id, playground.family) : []);
	let wrapped = $derived(hasWrapper(id, playground.family));
	let many = $derived(new Set(props.map((p) => p.component)).size > 1);

	let tab = $state<'css' | 'svelte'>('css');
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
				</div>

				{#if tab === 'css'}
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
					{:else}
						<p class="api-note api-none">
							{playground.family} ships no class in this namespace.
						</p>
					{/if}
				{:else if wrapped}
					{#if props.length}
					<table class="api-table">
						<thead>
							<tr>
								{#if many}<th>Component</th>{/if}
								<th>Prop</th><th>Type</th><th>Default</th><th>Description</th>
							</tr>
						</thead>
						<tbody>
							{#each props as p (p.component + '.' + p.name)}
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
		color: color-mix(in oklab, var(--color-on-surface) 80%, transparent);
	}

	/* Deliberately not a .section box: this is reference, not a demo. */
	.api {
		width: 100%;
		max-width: 56rem;
		margin-bottom: 2.5rem;
		border: 1px solid color-mix(in oklab, var(--color-on-surface) 12%, transparent);
		border-radius: 0.85rem;
		background: color-mix(in oklab, var(--color-surface-2) 60%, var(--color-surface-1));
		overflow: hidden;
	}

	.api-tabs {
		display: flex;
		gap: 0.15rem;
		padding: 0.4rem 0.5rem 0;
		border-bottom: 1px solid color-mix(in oklab, var(--color-on-surface) 10%, transparent);
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
		color: color-mix(in oklab, var(--color-on-surface) 50%, transparent);
		cursor: pointer;
		margin-bottom: -1px;
	}
	.api-tab:hover {
		color: var(--color-on-surface);
	}
	.api-tab[aria-selected='true'] {
		color: var(--color-on-surface);
		background: var(--color-surface-1);
		border-color: color-mix(in oklab, var(--color-on-surface) 10%, transparent);
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
		color: color-mix(in oklab, var(--color-on-surface) 55%, transparent);
		border-bottom: 1px solid color-mix(in oklab, var(--color-on-surface) 10%, transparent);
	}
	.api-table td {
		padding: 0.5rem 1rem;
		vertical-align: top;
		line-height: 1.45;
		border-bottom: 1px solid color-mix(in oklab, var(--color-on-surface) 6%, transparent);
	}
	.api-table tr:last-child td {
		border-bottom: none;
	}
	.api-table code {
		font-family: ui-monospace, SFMono-Regular, monospace;
		font-size: 0.82em;
		padding: 0.1em 0.35em;
		border-radius: 0.3rem;
		background: color-mix(in oklab, var(--color-on-surface) 8%, transparent);
	}
	.api-type {
		white-space: normal;
		word-break: break-word;
	}
	.api-kind {
		white-space: nowrap;
		color: color-mix(in oklab, var(--color-on-surface) 55%, transparent);
	}

	.api-note {
		margin: 0;
		padding: 0.75rem 1rem;
		font-size: 0.8rem;
		line-height: 1.5;
		color: color-mix(in oklab, var(--color-on-surface) 60%, transparent);
		border-top: 1px solid color-mix(in oklab, var(--color-on-surface) 8%, transparent);
	}
	.api-none {
		border-top: none;
		padding: 1.25rem 1rem;
	}
</style>
