<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['data-control'],
		description:
			'The controls of a data handler, around the view that shows its rows: filters, sort, search, page size, pagination, and actions on the selection or on the whole resource. Every one is optional, and an action only appears when the handler can do it.',
		classes: {
			'data-control-bar': 'The row of controls above the view.',
			'data-control-bar-left': 'Its start: filters, sort, your left actions, search.',
			'data-control-bar-right': 'Its end: page size, selection count, built-in actions, your right actions.',
			'data-control-search': 'The search field.',
			'data-control-count': 'How many rows are selected.',
			'data-control-filters': 'The row of filters on the page.',
			'data-control-filter': 'One filter: a chip that opens its editor, and a button that takes it off.',
			'data-control-filter-remove': 'The button that takes a filter off.',
			'data-control-editor': 'The box a filter is edited in.',
			'data-control-pagination': 'The range and the pages, above or below the view.',
			'data-control-range': '“1–10 / 124”.',
			'data-control-body': 'The view: a table, a grid, a list.'
		},
		props: {
			DataControl: [
				{ name: 'handler', type: 'DataHandlerState', description: 'The handler whose rows and requests these controls drive.' },
				{ name: 'children', type: 'Snippet<[handler]>', description: 'The view — a Table, a Grid, a List — given the handler.' },
				{ name: 'filters', type: 'boolean', default: 'true', description: 'Offer the handler’s filters.' },
				{ name: 'sorts', type: 'boolean', default: 'true', description: 'Offer the handler’s sorts.' },
				{ name: 'search', type: 'boolean', default: 'true', description: 'Draw a search field.' },
				{ name: 'limits', type: 'number[] | false', default: '[5, 10, 25, 50, 100]', description: 'The page sizes to choose from.' },
				{ name: 'pagination', type: "'top' | 'bottom' | 'both' | 'none'", default: "'bottom'", description: 'Where the pagination goes.' },
				{ name: 'editing', type: 'boolean', default: 'true', description: 'Draw undo, redo, discard and save — when the handler can update.' },
				{ name: 'removable', type: 'boolean', default: 'true', description: 'Draw delete and the selection count — when the handler can delete.' },
				{ name: 'exportable', type: 'boolean | ExportOptions', default: 'false', description: 'Draw export, which runs handler.export() with these options.' },
				{ name: 'onadd', type: '() => void', description: 'Draw an add button calling this.' },
				{ name: 'confirm', type: 'boolean', default: 'true', description: 'Confirm deletions and dropped changes in a dialog, unless the handler has its own confirmDelete / confirmDiscard.' },
				{ name: 'leftActions', type: 'Snippet<[handler]>', description: 'Drawn at the start of the bar, after the filters and the sort.' },
				{ name: 'rightActions', type: 'Snippet<[handler]>', description: 'Drawn at the end of the bar, after the built-in actions.' },
				{ name: 'header', type: 'Snippet<[handler]>', description: 'Drawn above the view, and above a top pagination.' },
				{ name: 'footer', type: 'Snippet<[handler]>', description: 'Drawn below the view, and below a bottom pagination.' },
				{ name: 'labels', type: 'Partial<DataControlLabels>', description: 'Every text it writes, for another language.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import {
		Badge,
		Button,
		Card,
		Checkbox,
		DataControl,
		DataHandler,
		Input,
		List,
		Select,
		Table,
		Grid,
		type DataRow,
		type TableColumn
	} from '$lib/index.js';
	import { FILTERS, SORTS, deletePeople, getPeople, updatePerson, type Person } from '../people.js';

	const columns: TableColumn<DataRow<Person>>[] = [
		{ key: 'pick', label: '', width: '2.5em', sticky: true },
		{ key: 'name', label: 'Name', width: '13em', sticky: true, sortable: true },
		{ key: 'email', label: 'Email', width: '16em' },
		{ key: 'role', label: 'Role', width: '9em' },
		{ key: 'team', label: 'Team', width: '9em' },
		{ key: 'score', label: 'Score', align: 'end', sortable: true },
		{ key: 'joined', label: 'Joined', sortable: true, width: '8em' }
	];

	const ROLES = [
		{ name: 'Admin', value: 'admin' },
		{ name: 'Editor', value: 'editor' },
		{ name: 'Viewer', value: 'viewer' }
	];
</script>

<Section
	title="Around a table"
	subtitle="Filters, sort, search, page size and pagination drive the handler; the table only draws the rows. Cells edit in place — undo, redo, discard and save appear because the handler can update — and the selection can be deleted, with a confirmation."
	svelte={`<DataHandler identifier="id" get={getPeople} update={updatePerson} delete={deletePeople}
	filters={FILTERS} sorts={SORTS}>
	{#snippet children(handler)}
		<DataControl {handler} exportable onadd={() => …}>
			{#snippet children(handler)}
				<Table rows={handler.rows} key={(r) => r.id} {columns}
					selected={handler.selection} dirty={handler.changed} loading={handler.loading}
					sort={handler.sort && { key: handler.sort.id, direction: handler.sort.value }}
					onsort={(s) => handler.changeSort(s && { id: s.key, name: s.key, value: s.direction })}>
					{#snippet cell(row, column)}
						{#if column.key === 'pick'}
							<Checkbox checked={row.selected} onchange={() => row.toggle()} />
						{:else if column.key === 'role'}
							<Select options={ROLES} value={row.value.role}
								onvalue={(role) => row.update({ role })} />
						{:else}
							{row.value[column.key]}
						{/if}
					{/snippet}
				</Table>
			{/snippet}
		</DataControl>
	{/snippet}
</DataHandler>`}
>
	<div style="width:100%;">
		<DataHandler
			identifier="id"
			get={getPeople}
			update={updatePerson}
			delete={deletePeople}
			filters={FILTERS}
			sorts={SORTS}
		>
			{#snippet children(handler)}
				<DataControl {handler} exportable={{ name: 'people.csv' }} onadd={() => alert('Add a person')}>
					{#snippet children(handler)}
						<Table
							rows={handler.rows}
							key={(r) => r.id}
							{columns}
							selected={handler.selection}
							dirty={handler.changed}
							loading={handler.loading}
							sort={handler.sort && { key: handler.sort.id, direction: handler.sort.value }}
							onsort={(s) =>
								handler.changeSort(
									s && { id: s.key, name: `${s.key} ${s.direction}`, value: s.direction }
								)}
						>
							{#snippet cell(row, column)}
								{#if column.key === 'pick'}
									<Checkbox
										checked={row.selected}
										onchange={() => row.toggle()}
										aria-label="Select {row.value.name}"
									/>
								{:else if column.key === 'name'}
									<Input
										size="sm"
										value={row.value.name}
										onchange={(e) => row.update({ name: e.currentTarget.value })}
									/>
								{:else if column.key === 'role'}
									<Select
										size="sm"
										options={ROLES}
										value={row.value.role}
										onvalue={(role) => row.update({ role })}
									/>
								{:else if column.key === 'team'}
									{row.value.team.name}
								{:else}
									{row.value[column.key as keyof Person]}
								{/if}
							{/snippet}
							{#snippet empty()}Nobody matches.{/snippet}
						</Table>
					{/snippet}
				</DataControl>
			{/snippet}
		</DataHandler>
	</div>
</Section>

<Section
	title="Around a grid, boxed"
	subtitle="The same handler drives a masonry grid of cards. The boxed variant draws the control as a container, whatever view sits inside; the pagination goes above and below."
	svelte={`<DataControl {handler} variant="boxed" pagination="both" limits={[6, 12, 24]}>
	{#snippet children(handler)}
		<Grid masonry items={handler.rows} key={(r) => r.id} selected={handler.selection}>
			{#snippet item(row)}
				<Card>…</Card>
			{/snippet}
		</Grid>
	{/snippet}
</DataControl>`}
>
	<div style="width:100%;">
		<DataHandler identifier="id" get={getPeople} delete={deletePeople} filters={FILTERS} sorts={SORTS} limit={6}>
			{#snippet children(handler)}
				<DataControl {handler} variant="boxed" pagination="both" limits={[6, 12, 24]}>
					{#snippet children(handler)}
						<Grid masonry items={handler.rows} key={(r) => r.id} selected={handler.selection} loading={handler.loading}>
							{#snippet item(row)}
								<Card>
										<div style="display:flex; justify-content:space-between; gap:.5em; align-items:center;">
											<strong>{row.value.name}</strong>
											<Checkbox checked={row.selected} onchange={() => row.toggle()} aria-label="Select {row.value.name}" />
										</div>
										<p style="margin:0; opacity:.7;">{row.value.bio}</p>
										<div style="display:flex; gap:.25em; flex-wrap:wrap;">
											<Badge>{row.value.role}</Badge>
											<Badge>{row.value.team.name}</Badge>
										</div>
								</Card>
							{/snippet}
						</Grid>
					{/snippet}
				</DataControl>
			{/snippet}
		</DataHandler>
	</div>
</Section>

<Section
	title="Around a list, with only a search"
	subtitle="Every control is optional: here a search, the pages, and an action of your own in the bar."
	svelte={`<DataControl {handler} filters={false} sorts={false} limits={false}>
	{#snippet rightActions(handler)}
		<Button size="sm" onclick={() => handler.reload()}>Refresh</Button>
	{/snippet}
	{#snippet children(handler)}
		<List rows={handler.rows} key={(r) => r.id}>…</List>
	{/snippet}
</DataControl>`}
>
	<div style="width:100%; max-width:30rem;">
		<DataHandler identifier="id" get={getPeople} limit={4}>
			{#snippet children(handler)}
				<DataControl {handler} filters={false} sorts={false} limits={false}>
					{#snippet rightActions(handler)}
						<Button size="sm" onclick={() => handler.reload()}>Refresh</Button>
					{/snippet}
					{#snippet children(handler)}
						<List rows={handler.rows} key={(r) => r.id} loading={handler.loading}>
							{#snippet row(r)}
								<div>
									<p style="margin:0; font-weight:600;">{r.value.name}</p>
									<p style="margin:0; opacity:.6; font-size:.875em;">{r.value.email}</p>
								</div>
								<div class="list-col-grow" style="text-align:right; opacity:.6;">{r.value.team.name}</div>
							{/snippet}
						</List>
					{/snippet}
				</DataControl>
			{/snippet}
		</DataHandler>
	</div>
</Section>
