<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	type Task = { id: string; title: string; status: string; tag?: string };

	export const DOC: ComponentDoc = {
		namespaces: ['kanban'],
		description:
			'Items in columns, one column per state they can be in. Like a table or a grid it knows nothing of where its items come from, and it moves nothing: dragging a card, or Shift + an arrow key on it, calls onMove, and the items change when you change them. Without onMove the board is read-only.',
		classes: {
			'kanban-column': 'One column.',
			'kanban-column-over': 'A column an item is being dragged over.',
			'kanban-column-head': 'A column’s heading: its title and count, or your `head` snippet.',
			'kanban-column-title': 'The title of a column.',
			'kanban-column-count': 'How many items a column holds.',
			'kanban-column-body': 'The items of a column. Takes the height left, so the whole column can be dropped on.',
			'kanban-column-foot': 'Your `foot` snippet, under the items.',
			'kanban-column-empty': 'Drawn in a column with no items.',
			'kanban-item': 'One item. The component wraps each of yours in one.',
			'kanban-item-selected': 'An item whose key is in `selected`.',
			'kanban-item-dirty': 'An item whose key is in `dirty`: changed, not saved.',
			'kanban-item-dragged': 'The item being dragged, where it came from.',
			'kanban-marker': 'Where a dragged item would land. Written by the component during a drag.'
		},
		props: {
			Kanban: [
				{ name: 'items', type: 'Item[]', default: '[]', description: 'Your data, as is. Each column keeps the order they come in.' },
				{ name: 'columns', type: '{ id, title? }[]', description: 'The columns, in order. An item naming another column is not drawn.' },
				{ name: 'columnOf', type: '(item) => string', description: 'The id of the column an item belongs to.' },
				{ name: 'item', type: 'Snippet<[item, index]>', description: 'How one item is drawn, given its place in its column.' },
				{ name: 'key', type: '(item, index) => string', default: 'the index', description: 'An item’s identity, for selected, dirty, keyed rendering and giving the focus back after a move.' },
				{ name: 'onMove', type: '({ item, from, to, index }) => void', description: 'An item was dropped somewhere new. `index` is its place in `to`, counted without the item itself. Given, it makes the items movable.' },
				{ name: 'head', type: 'Snippet<[column, items]>', description: 'Replaces a column’s title and count.' },
				{ name: 'foot', type: 'Snippet<[column]>', description: 'Drawn under a column’s items: an add button, usually.' },
				{ name: 'empty', type: 'Snippet<[column]>', description: 'Drawn in a column with no items.' },
				{ name: 'selected', type: 'Iterable<string>', description: 'Keys of the items drawn as selected.' },
				{ name: 'dirty', type: 'Iterable<string>', description: 'Keys of the items drawn as changed and not saved.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Button, Card, Chip, DataControl, DataHandler, Kanban, type DataRow, type KanbanMove } from '$lib/index.js';
	import { FILTERS, SORTS, getPeople, updatePerson, type Person } from '../people.js';

	const COLUMNS = [
		{ id: 'todo', title: 'To do' },
		{ id: 'doing', title: 'In progress' },
		{ id: 'review', title: 'In review' },
		{ id: 'done', title: 'Done' }
	];

	let tasks = $state<Task[]>([
		{ id: '1', title: 'Write the release notes', status: 'todo', tag: 'docs' },
		{ id: '2', title: 'Plant the bulbs before the frost', status: 'todo' },
		{ id: '3', title: 'A table whose sticky columns measure themselves', status: 'doing', tag: 'table' },
		{ id: '4', title: 'Fix the focus ring on dark themes', status: 'doing' },
		{ id: '5', title: 'Rename the drawer states', status: 'review', tag: 'drawer' },
		{ id: '6', title: 'Ship the carousel', status: 'done' }
	]);

	/* `index` counts without the item: take it out, then put it back before
	   whichever item now holds that place in the column. */
	function move({ item, to, index }: KanbanMove<Task>) {
		const rest = tasks.filter((t) => t.id !== item.id);
		const before = rest.filter((t) => t.status === to)[index];
		rest.splice(before ? rest.indexOf(before) : rest.length, 0, { ...item, status: to });
		tasks = rest;
	}

	const ROLES = [
		{ id: 'admin', title: 'Admins' },
		{ id: 'editor', title: 'Editors' },
		{ id: 'viewer', title: 'Viewers' }
	];
</script>

{#snippet card(task: Task)}
	<Card size="sm">
		<span>{task.title}</span>
		{#if task.tag}<div><Chip size="xs">{task.tag}</Chip></div>{/if}
	</Card>
{/snippet}

<Section
	title="Move the items"
	subtitle="Drag a card to another column or another place in its own, or focus it and press Shift + an arrow key. The component only reports the move: the caller changes its items, and may refuse by doing nothing."
	svelte={`<Kanban
	items={tasks}
	columns={[{ id: 'todo', title: 'To do' }, { id: 'doing', title: 'In progress' }, …]}
	columnOf={(t) => t.status}
	key={(t) => t.id}
	onMove={({ item, to, index }) => {
		const rest = tasks.filter((t) => t.id !== item.id);
		const before = rest.filter((t) => t.status === to)[index];
		rest.splice(before ? rest.indexOf(before) : rest.length, 0, { ...item, status: to });
		tasks = rest;
	}}
>
	{#snippet item(task)}
		<Card size="sm">{task.title}</Card>
	{/snippet}
</Kanban>`}
	html={`<div class="kanban">
	<section class="kanban-column">
		<header class="kanban-column-head">
			<span class="kanban-column-title">To do</span>
			<span class="kanban-column-count">2</span>
		</header>
		<ul class="kanban-column-body">
			<li class="kanban-item"><div class="card">…</div></li>
			<li class="kanban-item kanban-item-selected"><div class="card">…</div></li>
		</ul>
	</section>
</div>`}
>
	<div style="width:100%;">
		<Kanban items={tasks} columns={COLUMNS} columnOf={(t) => t.status} key={(t) => t.id} onMove={move} item={card}>
			{#snippet empty()}Nothing here.{/snippet}
		</Kanban>
	</div>
</Section>

<Section
	title="Read-only"
	subtitle="Without onMove nothing can be dragged or focused: the board only shows where things stand. A height on the board makes each column scroll on its own."
	svelte={`<Kanban style="max-height:16rem" {items} {columns} columnOf={(t) => t.status} key={(t) => t.id} selected={['3']} dirty={['1']}>…</Kanban>`}
>
	<div style="width:100%;">
		<Kanban
			style="max-height:16rem;"
			size="sm"
			gap="tight"
			items={tasks}
			columns={COLUMNS}
			columnOf={(t) => t.status}
			key={(t) => t.id}
			selected={['3']}
			dirty={['1']}
			item={card}
		/>
	</div>
</Section>

<Section
	title="Your own head and foot"
	subtitle="head replaces the title and the count, and is given the column’s items; foot goes under them. An empty column keeps its height, and the empty snippet stands in."
	svelte={`<Kanban {items} {columns} columnOf={(t) => t.status} key={(t) => t.id}>
	{#snippet head(column, items)}
		<strong>{column.title}</strong>
		<Chip size="xs">{items.length} / 3</Chip>
	{/snippet}
	{#snippet foot(column)}
		<Button size="sm" onclick={() => add(column.id)}>Add</Button>
	{/snippet}
	{#snippet item(task)}<Card size="sm">{task.title}</Card>{/snippet}
	{#snippet empty()}Nothing here.{/snippet}
</Kanban>`}
>
	<div style="width:100%;">
		<Kanban items={tasks.filter((t) => t.status !== 'done')} columns={COLUMNS} columnOf={(t) => t.status} key={(t) => t.id} item={card}>
			{#snippet head(column, items)}
				<strong>{column.title}</strong>
				<Chip size="xs">{items.length} / 3</Chip>
			{/snippet}
			{#snippet foot(column)}
				<Button size="sm" onclick={() => alert(`Add to ${column.title}`)}>Add</Button>
			{/snippet}
			{#snippet empty()}Nothing here.{/snippet}
		</Kanban>
	</div>
</Section>

<Section
	title="Around a data handler"
	subtitle="The rows of a handler are items like any other, and its filters and search still apply. Moving a person to another column changes their role as a pending edit: undo, redo and save appear in the bar. A move inside a column means nothing to this resource, so it is ignored."
	svelte={`<DataControl {handler}>
	{#snippet children(handler)}
		<Kanban
			items={handler.rows}
			columns={ROLES}
			columnOf={(r) => r.value.role}
			key={(r) => r.id}
			selected={handler.selection}
			dirty={handler.changed}
			loading={handler.loading}
			onMove={({ item, from, to }) => { if (from !== to) item.update({ role: to }); }}
		>
			{#snippet item(row)}<Card size="sm">{row.value.name}</Card>{/snippet}
		</Kanban>
	{/snippet}
</DataControl>`}
>
	<div style="width:100%;">
		<DataHandler identifier="id" get={getPeople} update={updatePerson} filters={FILTERS} sorts={SORTS} limit={12}>
			{#snippet children(handler)}
				<DataControl {handler} limits={[12, 24]}>
					{#snippet children(handler)}
						<Kanban
							items={handler.rows}
							columns={ROLES}
							columnOf={(r: DataRow<Person>) => r.value.role}
							key={(r) => r.id}
							selected={handler.selection}
							dirty={handler.changed}
							loading={handler.loading}
							onMove={({ item, from, to }) => {
								if (from !== to) item.update({ role: to as Person['role'] });
							}}
						>
							{#snippet item(row)}
								<Card size="sm">
									<strong>{row.value.name}</strong>
									<span style="opacity:.7;">{row.value.team.name}</span>
								</Card>
							{/snippet}
						</Kanban>
					{/snippet}
				</DataControl>
			{/snippet}
		</DataHandler>
	</div>
</Section>
