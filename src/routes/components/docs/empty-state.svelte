<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['empty-state'],
		description:
			'What to show when there is nothing: no results, an empty folder, a list not started yet. Made for the empty slot of Table, Grid and List.',
		classes: {
			'empty-state': 'A centred column.',
			'empty-state-icon': 'The illustration, in a disc.',
			'empty-state-title': 'What is empty.',
			'empty-state-body': 'Why, or what to do.',
			'empty-state-actions': 'The way out: buttons, links.'
		},
		props: {
			EmptyState: [
				{ name: 'title', type: 'string', description: 'What is empty.' },
				{ name: 'icon', type: 'Snippet', description: 'Replaces the empty tray.' },
				{ name: 'actions', type: 'Snippet', description: 'Buttons, links.' },
				{ name: 'children', type: 'Snippet', description: 'The explanation.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Button, EmptyState, Table } from '$lib/index.js';
</script>

<Section
	title="Basic"
	svelte={`<EmptyState title="No results">
  Nothing matches “zebra”. Try another word.
  {#snippet actions()}<Button>Clear search</Button>{/snippet}
</EmptyState>`}
	html={`<div class="empty-state">
  <div class="empty-state-icon">…</div>
  <p class="empty-state-title">No results</p>
  <p class="empty-state-body">Nothing matches “zebra”. Try another word.</p>
  <div class="empty-state-actions"><button class="btn">Clear search</button></div>
</div>`}
>
	<EmptyState title="No results">
		Nothing matches “zebra”. Try another word.
		{#snippet actions()}<Button>Clear search</Button>{/snippet}
	</EmptyState>
</Section>

<Section
	title="Dashed"
	svelte={`<EmptyState variant="dashed" title="No files yet">Drop files here to upload them.</EmptyState>`}
	html={`<div class="empty-state empty-state-dashed">…</div>`}
>
	<div style="width:100%"><EmptyState variant="dashed" title="No files yet">Drop files here to upload them.</EmptyState></div>
</Section>

<Section
	title="In a table"
	svelte={`<Table columns={…} rows={[]}>
  {#snippet empty()}<EmptyState size="sm" title="No people" />{/snippet}
</Table>`}
	html={`<td class="table-empty"><div class="empty-state empty-state-sm">…</div></td>`}
>
	<div style="width:100%">
		<Table columns={[{ key: 'name', label: 'Name' }, { key: 'role', label: 'Role' }]} rows={[]}>
			{#snippet empty()}<EmptyState size="sm" title="No people">Invite someone to get started.</EmptyState>{/snippet}
		</Table>
	</div>
</Section>
