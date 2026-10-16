<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['table'],
		description:
			'A real <table>. Columns are described once — width, sticky, sortable, hidden — and each cell is the column’s field, or what your snippet draws. Selection, sorting and loading are drawn from plain props: where the rows come from is not the table’s business.',
		classes: {
			'table-scroll': 'The box the table scrolls in, sideways and — with a maxHeight — down.',
			'table-head': 'The header row.',
			'table-row': 'A body row.',
			'table-row-selected': 'A row whose key is in `selected`.',
			'table-row-dirty': 'A row whose key is in `dirty`: changed, not saved.',
			'table-cell': 'A header or body cell.',
			'table-sort': 'The button a sortable header holds. aria-sort on the cell draws the arrow.',
			'table-sticky': 'A cell of a sticky column, pinned to the start edge.',
			'table-sticky-last': 'A cell of the last sticky column, which draws the edge.',
			'table-empty': 'The cell drawn in place of the rows when there are none.'
		},
		props: {
			Table: [
				{ name: 'columns', type: 'TableColumn[]', description: '{ key, label, width, sticky, hidden, sortable, align, value }, in order. A width is a minimum: text wraps inside it.' },
				{ name: 'rows', type: 'Row[]', default: '[]', description: 'Your data, as is.' },
				{ name: 'key', type: '(row, index) => string', default: 'the index', description: 'A row’s identity, for selected, dirty and keyed rendering.' },
				{ name: 'cell', type: 'Snippet<[row, column, index]>', description: 'How one cell is drawn. Without it, the column’s value as text.' },
				{ name: 'row', type: 'Snippet<[row, index]>', description: 'How a whole row is drawn, <td>s included — the escape hatch. The table still writes the <tr>.' },
				{ name: 'empty', type: 'Snippet', description: 'Drawn in place of the rows when there are none.' },
				{ name: 'selected', type: 'Iterable<string>', description: 'Keys of the rows drawn as selected.' },
				{ name: 'dirty', type: 'Iterable<string>', description: 'Keys of the rows drawn as changed and not saved.' },
				{ name: 'sort', type: '{ key, direction }', description: 'The current sort, drawn on its header.' },
				{ name: 'onSort', type: '(sort | undefined) => void', description: 'A sortable header was clicked: ascending, then descending, then none.' },
				{ name: 'maxHeight', type: 'string', description: 'The scroll box’s maximum height — for a pinned head.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Checkbox, Table, type TableColumn, type TableSort } from '$lib/index.js';

	type Planet = { name: string; type: string; moons: number; radius: number; day: string; discovered: string };
	const planets: Planet[] = [
		{ name: 'Mercury', type: 'Terrestrial', moons: 0, radius: 2440, day: '58.6 d', discovered: 'Antiquity' },
		{ name: 'Venus', type: 'Terrestrial', moons: 0, radius: 6052, day: '243 d', discovered: 'Antiquity' },
		{ name: 'Earth', type: 'Terrestrial', moons: 1, radius: 6371, day: '24 h', discovered: '—' },
		{ name: 'Mars', type: 'Terrestrial', moons: 2, radius: 3390, day: '24.6 h', discovered: 'Antiquity' },
		{ name: 'Jupiter', type: 'Gas giant', moons: 95, radius: 69911, day: '9.9 h', discovered: 'Antiquity' },
		{ name: 'Saturn', type: 'Gas giant', moons: 146, radius: 58232, day: '10.7 h', discovered: 'Antiquity' },
		{ name: 'Uranus', type: 'Ice giant', moons: 28, radius: 25362, day: '17.2 h', discovered: '1781' },
		{ name: 'Neptune', type: 'Ice giant', moons: 16, radius: 24622, day: '16.1 h', discovered: '1846' }
	];

	const basic: TableColumn<Planet>[] = [
		{ key: 'name', label: 'Planet' },
		{ key: 'type', label: 'Type' },
		{ key: 'moons', label: 'Moons', align: 'end' }
	];

	let sort: TableSort | undefined = $state({ key: 'radius', direction: 'desc' });
	let picked: string[] = $state(['Earth']);
	let sorted = $derived.by(() => {
		if (!sort) return planets;
		const { key, direction } = sort;
		const d = direction === 'asc' ? 1 : -1;
		return [...planets].sort((a, b) => {
			const x = a[key as keyof Planet];
			const y = b[key as keyof Planet];
			return (x < y ? -1 : x > y ? 1 : 0) * d;
		});
	});

	const wide: TableColumn<Planet>[] = [
		{ key: 'pick', label: '', width: '2.5em', sticky: true },
		{ key: 'name', label: 'Planet', width: '8em', sticky: true, sortable: true },
		{ key: 'type', label: 'Type', width: '10em', sortable: true },
		{ key: 'moons', label: 'Moons', width: '8em', align: 'end', sortable: true },
		{ key: 'radius', label: 'Radius (km)', width: '10em', align: 'end', sortable: true },
		{ key: 'day', label: 'Day', width: '8em' },
		{ key: 'discovered', label: 'Discovered', width: '10em' }
	];

	function toggle(name: string) {
		picked = picked.includes(name) ? picked.filter((p) => p !== name) : [...picked, name];
	}
</script>

<Section
	title="Columns and rows"
	subtitle="Each cell is the column's field unless a snippet says otherwise."
	svelte={`<Table rows={planets} columns={[
	{ key: 'name', label: 'Planet' },
	{ key: 'type', label: 'Type' },
	{ key: 'moons', label: 'Moons', align: 'end' }
]} />`}
	html={`<div class="table-scroll">
	<table class="table">
		<thead><tr class="table-head"><th class="table-cell">Planet</th><th class="table-cell">Moons</th></tr></thead>
		<tbody>
			<tr class="table-row"><td class="table-cell">Mercury</td><td class="table-cell">0</td></tr>
			<tr class="table-row"><td class="table-cell">Earth</td><td class="table-cell">1</td></tr>
		</tbody>
	</table>
</div>`}
>
	<Table rows={planets.slice(0, 4)} columns={basic} style="min-width:22rem;" />
</Section>

<Section
	title="Sticky columns, sorting, selection"
	subtitle="The first two columns stay put while the rest scroll under them; their offsets are measured, so any width works. Sorting cycles ascending, descending, none — the table only draws it, you sort."
	svelte={`<Table rows={sorted} key={(p) => p.name} columns={[
		{ key: 'pick', width: '2.5em', sticky: true },
		{ key: 'name', label: 'Planet', width: '8em', sticky: true, sortable: true },
		{ key: 'radius', label: 'Radius (km)', width: '10em', align: 'end', sortable: true },
		…
	]}
	{sort} onSort={(s) => (sort = s)} selected={picked} zebra hover>
	{#snippet cell(p, column)}
		{#if column.key === 'pick'}
			<Checkbox checked={picked.includes(p.name)} onchange={() => toggle(p.name)} />
		{:else}
			{p[column.key]}
		{/if}
	{/snippet}
</Table>`}
>
	<div style="width:100%; max-width:34rem;">
		<Table
			rows={sorted}
			key={(p) => p.name}
			columns={wide}
			{sort}
			onSort={(s) => (sort = s)}
			selected={picked}
			zebra
			hover
		>
			{#snippet cell(p, column)}
				{#if column.key === 'pick'}
					<Checkbox checked={picked.includes(p.name)} onchange={() => toggle(p.name)} aria-label="Select {p.name}" />
				{:else}
					{p[column.key as keyof Planet]}
				{/if}
			{/snippet}
		</Table>
	</div>
</Section>

<Section
	title="A pinned head, loading, dirty rows"
	subtitle="maxHeight makes the table scroll down inside its box, and pinned keeps the head in view. loading fades the rows; dirty marks the ones changed and not saved."
	svelte={`<Table rows={planets} columns={basic} pinned maxHeight="12rem" dirty={['Mars']} loading />`}
>
	<Table rows={planets} columns={basic} pinned maxHeight="12rem" key={(p) => p.name} dirty={['Mars', 'Venus']} style="min-width:22rem;" />
	<Table rows={planets.slice(0, 3)} columns={basic} loading style="min-width:22rem;" />
</Section>

<Section
	title="Nothing to show"
	subtitle="The empty snippet takes the place of the rows."
	svelte={`<Table rows={[]} {columns}>
	{#snippet empty()}No planet matches.{/snippet}
</Table>`}
>
	<Table rows={[]} columns={basic} style="min-width:22rem;">
		{#snippet empty()}No planet matches.{/snippet}
	</Table>
</Section>
