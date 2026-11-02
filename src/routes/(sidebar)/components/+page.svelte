<script lang="ts">
	// Every component page, by group, each with the first sentence of its own
	// description: the list and the words come from the doc files.
	import { resolve } from '$app/paths';
	import { COMPONENTS } from '../../playground.svelte.js';
	import { pages } from './doc.js';

	const count = COMPONENTS.reduce((sum, group) => sum + group.items.length, 0);

	function summary(id: string) {
		return pages[id]?.doc.description.split(/(?<=\.)\s/)[0] ?? '';
	}
</script>

<svelte:head>
	<title>Components: Sépale</title>
</svelte:head>

<main class="content">
	<section class="gallery">
		<h1 class="gallery-title">Components</h1>
		<p class="toc-lede">
			{count} components. Each page has live examples, and the classes and props of the active family.
		</p>

		{#each COMPONENTS as group (group.group)}
			<div class="toc-group">
				<h2 class="toc-group-title">{group.group}</h2>
				<ul class="toc-items">
					{#each group.items as item (item.id)}
						<li>
							<a class="toc-item" href={resolve(`/components/${item.id}`)}>
								<span class="toc-item-name">{item.label}</span>
								<span class="toc-item-text">{summary(item.id)}</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</section>
</main>
