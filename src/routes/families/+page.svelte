<script lang="ts">
	// What a family is, in its own words: the prose from its SCSS header, the
	// departures it had to make from its source, its themes, and the full list
	// of variables it exposes. All of it read from the family file at build
	// time — this page cannot drift from the CSS.
	import { playground, families, selectFamily, categoryFor } from '../playground.svelte.js';
	import { familyDocs, paramsByFamily, themesByFamily } from '$lib/generated/registry.js';

	let doc = $derived(familyDocs[playground.family]);
	let params = $derived(paramsByFamily[playground.family] ?? []);
	let themes = $derived(themesByFamily[playground.family] ?? []);

	// Grouped in the order the configurator shows them.
	const ORDER = ['Colors', 'Typography', 'Shape', 'Size', 'Effects', 'Elevation'];
	let groups = $derived.by(() => {
		const map = new Map<string, typeof params>();
		for (const p of params) {
			if (!map.has(p.group)) map.set(p.group, []);
			map.get(p.group)!.push(p);
		}
		return [...map.entries()].sort((a, b) => {
			const ia = ORDER.indexOf(a[0]);
			const ib = ORDER.indexOf(b[0]);
			return (ia < 0 ? ORDER.length : ia) - (ib < 0 ? ORDER.length : ib);
		});
	});

	function range(p: (typeof params)[number]): string {
		if (p.min === undefined) return '';
		return `${p.min} – ${p.max}${p.unit ? ' ' + p.unit : ''}`;
	}
</script>

<main class="content fam">
	<nav class="fam-picker">
		{#each families as f (f)}
			<button
				class="fam-chip"
				data-active={playground.family === f}
				onclick={() => selectFamily(f)}
			>
				{f}
			</button>
		{/each}
	</nav>

	<header class="fam-head">
		<h1 class="fam-title">{doc.title}</h1>
		{#if doc.after}<p class="fam-after">{doc.after}</p>{/if}
	</header>

	{#each doc.blurb.split('\n\n') as para (para)}
		<p class="fam-blurb">{para}</p>
	{/each}

	{#if doc.changes.length}
		<section class="fam-section">
			<h2 class="fam-h2">What had to change</h2>
			<p class="fam-note">
				A family keeps our intrinsic, font-size-driven sizing. Everything else is
				its own — including the variables it exposes. These are the places where
				the source design had to be read rather than copied.
			</p>
			<ul class="fam-changes">
				{#each doc.changes as change (change)}
					<li>{change}</li>
				{/each}
			</ul>
		</section>
	{/if}

	<section class="fam-section">
		<h2 class="fam-h2">Themes <span class="fam-count">{themes.length}</span></h2>
		<div class="fam-themes">
			{#each themes as t (t.name)}
				<span class="fam-theme" data-scheme={t.scheme}>{t.label}</span>
			{/each}
		</div>
	</section>

	<section class="fam-section">
		<h2 class="fam-h2">Variables <span class="fam-count">{params.length}</span></h2>
		<p class="fam-note">
			These are this family's, and only this family's. Another family may expose
			more of them, fewer, or different ones entirely — sharing a name is a
			convenience for whoever writes the themes, never a rule.
		</p>

		{#each groups as [group, items] (group)}
			<h3 class="fam-h3">{group}</h3>
			<div class="fam-table-wrap">
				<table class="fam-table">
					<thead>
						<tr>
							<th>Variable</th>
							<th>Name</th>
							<th>Default</th>
							<th>Range</th>
							<th>What it does</th>
						</tr>
					</thead>
					<tbody>
						{#each items as p (p.name)}
							<tr>
								<td class="fam-var">--{p.name}</td>
								<td>{p.label}</td>
								<td class="fam-val">
									{#if p.type === 'color'}
										<span class="fam-swatch" style="background:var(--{p.name})"></span>
									{/if}
									<code>{p.value}</code>
								</td>
								<td class="fam-range">{range(p)}</td>
								<td class="fam-desc">{p.description ?? ''}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/each}
	</section>

	<section class="fam-section">
		<h2 class="fam-h2">All families</h2>
		<div class="fam-table-wrap">
			<table class="fam-table">
				<thead>
					<tr>
						<th>Family</th>
						<th>After</th>
						<th>Themes</th>
						<th>Variables</th>
					</tr>
				</thead>
				<tbody>
					{#each families as f (f)}
						<tr data-active={playground.family === f}>
							<td class="fam-var">{f}</td>
							<td>{categoryFor(f)}</td>
							<td>{(themesByFamily[f] ?? []).length}</td>
							<td>{(paramsByFamily[f] ?? []).length}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
</main>
