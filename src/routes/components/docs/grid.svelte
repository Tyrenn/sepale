<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['grid'],
		description:
			'Items in as many columns as fit. A column is never narrower than the family’s minimum, so the count follows the width — and the size variant — never a breakpoint. What an item looks like is yours: a card, usually.',
		classes: {
			'grid-item': 'One item. The component wraps each of yours in one.',
			'grid-item-selected': 'An item whose key is in `selected`.',
			'grid-item-dirty': 'An item whose key is in `dirty`: changed, not saved.',
			'grid-lane': 'Masonry: one column, stacking its items.',
			'grid-masonry': 'Masonry: the grid holds lanes instead of items. Written by the component, which deals the items.',
			'grid-empty': 'Drawn in place of the items when there are none.'
		},
		props: {
			Grid: [
				{ name: 'items', type: 'Item[]', default: '[]', description: 'Your data, as is.' },
				{ name: 'item', type: 'Snippet<[item, index]>', description: 'How one item is drawn.' },
				{ name: 'key', type: '(item, index) => string', default: 'the index', description: 'An item’s identity, for selected, dirty and keyed rendering.' },
				{ name: 'masonry', type: 'boolean', default: 'false', description: 'Stack each column on its own, uneven items packed tight. The items are dealt to the columns in turn, so they still read row by row. Svelte only.' },
				{ name: 'empty', type: 'Snippet', description: 'Drawn in place of the items when there are none.' },
				{ name: 'selected', type: 'Iterable<string>', description: 'Keys of the items drawn as selected.' },
				{ name: 'dirty', type: 'Iterable<string>', description: 'Keys of the items drawn as changed and not saved.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Card, Grid } from '$lib/index.js';

	const notes = [
		{ id: '1', title: 'Groceries', text: 'Bread, eggs.' },
		{ id: '2', title: 'Ideas', text: 'A grid that deals its items into lanes so the reading order survives masonry. A table whose sticky columns measure themselves. A dialog that animates without a line of CSS animation.' },
		{ id: '3', title: 'Call', text: 'The plumber, before Friday.' },
		{ id: '4', title: 'Reading', text: 'The compiled CSS, not the docs. The gap between them is where the mistakes come from.' },
		{ id: '5', title: 'Garden', text: 'Water the dahlias. Stake the sunflowers.' },
		{ id: '6', title: 'Trip', text: 'Train at 7:42, platform 3. Pack the charger, the good socks and the book left unfinished on the bedside table since spring.' },
		{ id: '7', title: 'Done', text: 'Taxes.' }
	];
</script>

{#snippet note(n: { title: string; text: string })}
	<Card>
		{#snippet title()}{n.title}{/snippet}
		<p style="margin:0;">{n.text}</p>
	</Card>
{/snippet}

<Section
	title="As many columns as fit"
	subtitle="Resize the window: the columns follow the width, never a breakpoint. Items in a row share its height."
	svelte={`<Grid items={notes} key={(n) => n.id} selected={['2']}>
	{#snippet item(n)}
		<Card>…</Card>
	{/snippet}
</Grid>`}
	html={`<div class="grid">
	<div class="grid-item"><div class="card">…</div></div>
	<div class="grid-item grid-item-selected"><div class="card">…</div></div>
</div>`}
>
	<div style="width:100%;">
		<Grid items={notes} key={(n) => n.id} selected={['2']} dirty={['5']} item={note} />
	</div>
</Section>

<Section
	title="Masonry"
	subtitle="Each column stacks on its own. The items are dealt into the columns in turn — 1, 2, 3 across the top — so the order still reads row by row."
	svelte={`<Grid masonry items={notes} key={(n) => n.id}>…</Grid>`}
>
	<div style="width:100%;">
		<Grid masonry items={notes} key={(n) => n.id} item={note} />
	</div>
</Section>

<Section
	title="Gaps and sizes"
	subtitle="size changes the minimum column width along with the text, so a smaller grid holds more columns."
	svelte={`<Grid size="sm" gap="tight" items={notes} …/>`}
>
	<div style="width:100%;">
		<Grid size="sm" gap="tight" items={notes.slice(0, 5)} key={(n) => n.id} item={note} />
	</div>
</Section>
