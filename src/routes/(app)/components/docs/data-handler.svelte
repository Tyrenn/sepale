<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: [],
		description:
			'The live state of one remote resource — the current page of rows, the total, the search, the sort, the filters, the selection, the unsaved edits and their history — and the requests that read and change it. It draws nothing: it hands itself to its children, and a Table, a Grid or a List draws its rows as if they were static.',
		classes: {},
		props: {
			DataHandler: [
				{
					name: 'identifier',
					type: 'keyof Model | { to(row, index): string; from(id): Id }',
					description: 'How a row is told apart. A key of the model, or a pair of functions when the id is not a single field (or not a string on the server).'
				},
				{
					name: 'get',
					type: '(params: GetParams) => PromiseLike<{ data?, total? }>',
					description: 'Fetch one page. `params` holds `filters`, `search`, `sort`, `page` (from 1) and `limit`. A plain async function, or a SvelteKit remote function — they are called the same way.'
				},
				{
					name: 'update',
					type: '({ id, data }) => PromiseLike<unknown>',
					description: 'Save one row: `data` holds only the fields that changed. Without it (and without `path`) the rows cannot be saved.'
				},
				{
					name: 'delete',
					type: '(ids: Id[]) => PromiseLike<unknown>',
					description: 'Delete rows. Without it (and without `path`) nothing can be deleted.'
				},
				{
					name: 'path',
					type: 'string',
					description: 'A REST resource standing in for whichever of the three functions is missing: GET path?…&search=&sort=id-asc&page=&limit= → { data, total }; PATCH path/:id with the changed fields; DELETE path with the ids.'
				},
				{ name: 'fetch', type: 'typeof fetch', default: 'fetch', description: 'The fetch `path` goes through — SvelteKit’s, in a load.' },
				{ name: 'filters', type: 'Filter[]', description: 'The filters the visitor may use: text, number, date, select, boolean, or entity (picked from suggestions).' },
				{ name: 'sorts', type: 'Sort[]', description: 'The orders the visitor may pick, `{ id, name, value }`. The first is the starting one.' },
				{ name: 'immutableFilters', type: 'string[]', description: 'Filters the page sets and the visitor never sees — a user’s own orders, say.' },
				{ name: 'search', type: 'string', description: 'The starting search.' },
				{ name: 'filterValues', type: 'FilterValues', description: 'The starting filter values. A filter with a value starts shown.' },
				{ name: 'init', type: '{ data?, total? }', description: 'Rows already loaded, by a server load: the first fetch is skipped.' },
				{ name: 'limit', type: 'number', default: '10', description: 'Rows per page.' },
				{ name: 'page', type: 'number', default: '1', description: 'The starting page, from 1.' },
				{ name: 'history', type: 'boolean', default: 'false', description: 'Write the query to the address bar after every fetch, so back and reload land on the same rows. `parseQuery` reads it back.' },
				{
					name: 'navigation',
					type: '{ push(url, state); replace(url, state) }',
					default: 'the History API',
					description: 'How the address bar is written. In SvelteKit, pass `{ push: pushState, replace: replaceState }` from `$app/navigation`: Kit warns when the History API is used behind its back.'
				},
				{ name: 'confirmDelete', type: '(ids) => Promise<boolean>', description: 'Asked before deleting; `false` cancels. A DataControl lends its own dialog when this is not given.' },
				{
					name: 'confirmDiscard',
					type: "(count) => Promise<'save' | 'discard' | 'stay'>",
					description: 'Asked before a fetch would drop unsaved changes. "stay" cancels the fetch and puts the query back. Without it, the changes are dropped and `onlog` says so.'
				},
				{ name: 'onlog', type: '(message: string) => void', description: 'Something happened worth telling the visitor: rows saved, deleted, changes dropped.' },
				{ name: 'onerror', type: '(message: string, error?) => void', description: 'Something failed. Without it, the error goes to the console.' },
				{ name: 'messages', type: 'Partial<DataHandlerMessages>', description: 'The texts handed to `onlog` and `onerror`, for another language.' },
				{ name: 'autoload', type: 'boolean', default: 'true', description: 'Fetch on mount when no `init` was given.' },
				{ name: 'children', type: 'Snippet<[DataHandlerState]>', description: 'What to draw, given the handler.' },
				{ name: 'handler', type: 'DataHandlerState', description: 'Bindable, read only: the handler, for the parent.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Button, Checkbox, DataHandler, DataHandlerState, Input, Table, type DataRow, type TableColumn } from '$lib/index.js';
	import { FILTERS, SORTS, deletePeople, getPeople, updatePerson, type Person } from '../people.js';

	const columns: TableColumn<DataRow<Person>>[] = [
		{ key: 'name', label: 'Name', width: '12em' },
		{ key: 'email', label: 'Email' },
		{ key: 'role', label: 'Role' },
		{ key: 'score', label: 'Score', align: 'end' }
	];

	/* The class, without the component: same object, built by hand. */
	const people = new DataHandlerState({
		identifier: 'id',
		get: getPeople,
		update: updatePerson,
		limit: 5
	});
	$effect(() => {
		people.load({ replace: true });
	});

	let log: string[] = $state([]);

	type Member = { name: string; what: string };
	const members: Member[] = [
		{ name: 'rows', what: 'The rows of the current page. Each is { id, value, init, updated, selected, dirty } plus its own actions: select(), unselect(), toggle(), update(patch), undo(), reset(), save(), delete().' },
		{ name: 'total · pages', what: 'How many rows match over every page, and how many pages that makes. undefined until known.' },
		{ name: 'loading', what: 'A fetch is running.' },
		{ name: 'page · limit · search · sort · filterValues', what: 'The query. Read them; change them through the methods below, which fetch.' },
		{ name: 'changePage(n) · changeLimit(n) · changeSort(sort) · changeSearch(text, delay?) · changeFilter(id, value, delay?)', what: 'Change the query and fetch. A search waits 300 ms for the typing to pause. A new page size keeps the first row on screen.' },
		{ name: 'filters · shownFilters · availableFilters', what: 'Every filter; the ones on the page; the ones that could be added. showFilter(id) and removeFilter(id) move a filter between the two.' },
		{ name: 'load({ delay?, replace? }) · reload()', what: 'Fetch the current query. Answers arriving out of order are ignored: only the latest request writes.' },
		{ name: 'selection · allSelected · select(id?) · unselect(id?)', what: 'The selected keys. Without an id, the whole page.' },
		{ name: 'update(id, patch) · changed · dirty', what: 'Change fields of a row — an object, or a function of the current value. A field set back to its saved value is no longer a change.' },
		{ name: 'undo(id?) · redo() · canUndo · canRedo', what: 'The edit history. undo() takes back the last change of the page; undo(id), the last change of one row, wherever it sits. A new change clears what could be redone.' },
		{ name: 'reset(id?)', what: 'Drop every unsaved change, of a row or of the page — as one step that undo() brings back.' },
		{ name: 'save(id?) · delete(id?)', what: 'Send the changes of a row or of every changed row; delete a row or the selection. A saved or deleted row leaves the history.' },
		{ name: 'canUpdate · canDelete', what: 'Whether update / delete exist (as functions or through path).' },
		{ name: 'export({ name, max, batch, columns, format, separator, decimal, download })', what: 'Every row matching the query, fetched by batches, as a CSV file for a spreadsheet: UTF-8 BOM, CRLF, numbers with a comma under a ; separator, text starting with = + - @ prefixed with \' so it never runs as a formula. Returns the CSV.' },
		{ name: 'toSearchParams()', what: 'The query, as the address bar writes it.' }
	];
</script>

<Section
	title="A handler and a table"
	subtitle="The handler fetches; the table draws what it is given. The search field, the checkboxes and the pager are written by hand here, to show what the handler offers — a DataControl draws all of that for you."
	svelte={`<DataHandler identifier="id" get={getPeople} update={updatePerson} delete={deletePeople}
	filters={FILTERS} sorts={SORTS} limit={5}>
	{#snippet children(handler)}
		<Input type="search" placeholder="Search" value={handler.search}
			oninput={(e) => handler.changeSearch(e.currentTarget.value)} />

		<Table rows={handler.rows} key={(r) => r.id} selected={handler.selection}
			loading={handler.loading} {columns}>
			{#snippet cell(row, column)}
				{#if column.key === 'pick'}
					<Checkbox checked={row.selected} onchange={() => row.toggle()} />
				{:else}
					{row.value[column.key]}
				{/if}
			{/snippet}
		</Table>

		<Button disabled={handler.page <= 1} onclick={() => handler.changePage(handler.page - 1)}>Previous</Button>
		<Button disabled={handler.page >= (handler.pages ?? 1)} onclick={() => handler.changePage(handler.page + 1)}>Next</Button>
		<Button color="error" disabled={!handler.selection.length} onclick={() => handler.delete()}>Delete</Button>
	{/snippet}
</DataHandler>`}
>
	<DataHandler
		identifier="id"
		get={getPeople}
		update={updatePerson}
		delete={deletePeople}
		filters={FILTERS}
		sorts={SORTS}
		limit={5}
		onlog={(m) => (log = [m, ...log].slice(0, 3))}
	>
		{#snippet children(handler)}
			<div style="display:flex; flex-direction:column; gap:.75rem; width:100%;">
				<div style="display:flex; gap:.5rem; align-items:center; flex-wrap:wrap;">
					<Input
						type="search"
						placeholder="Search"
						value={handler.search}
						oninput={(e) => handler.changeSearch(e.currentTarget.value)}
					/>
					<Button
						disabled={handler.page <= 1}
						onclick={() => handler.changePage(handler.page - 1)}>Previous</Button
					>
					<span style="opacity:.6; font-size:.875em;">page {handler.page} / {handler.pages ?? '…'}</span>
					<Button
						disabled={handler.page >= (handler.pages ?? 1)}
						onclick={() => handler.changePage(handler.page + 1)}>Next</Button
					>
					<Button color="error" disabled={!handler.selection.length} onclick={() => handler.delete()}>
						Delete {handler.selection.length || ''}
					</Button>
				</div>
				<Table
					rows={handler.rows}
					key={(r) => r.id}
					selected={handler.selection}
					loading={handler.loading}
					columns={[{ key: 'pick', label: '', width: '2.5em' }, ...columns]}
				>
					{#snippet cell(row, column)}
						{#if column.key === 'pick'}
							<Checkbox checked={row.selected} onchange={() => row.toggle()} aria-label="Select {row.value.name}" />
						{:else}
							{row.value[column.key as keyof Person]}
						{/if}
					{/snippet}
				</Table>
				{#each log as line, i (i)}<p style="margin:0; opacity:.6; font-size:.8em;">{line}</p>{/each}
			</div>
		{/snippet}
	</DataHandler>
</Section>

<Section
	title="Editing, undo and redo"
	subtitle="Cells call row.update(); the handler keeps what changed and the history of it. Undo takes back the last change of the page, a row's own undo its last change wherever it sits, and a reset of everything is one step undo brings back. Save sends only the changed fields."
	svelte={`<${'script'}>
	// The class, without the component.
	const people = new DataHandlerState({ identifier: 'id', get: getPeople, update: updatePerson, limit: 5 });
	$effect(() => { people.load(); });
</${'script'}>

<Table rows={people.rows} key={(r) => r.id} dirty={people.changed} {columns}>
	{#snippet cell(row, column)}
		<Input value={row.value[column.key]}
			onchange={(e) => row.update({ [column.key]: e.currentTarget.value })} />
	{/snippet}
</Table>

<Button disabled={!people.canUndo} onclick={() => people.undo()}>Undo</Button>
<Button disabled={!people.canRedo} onclick={() => people.redo()}>Redo</Button>
<Button disabled={!people.dirty} onclick={() => people.reset()}>Reset</Button>
<Button color="primary" disabled={!people.dirty} onclick={() => people.save()}>Save</Button>`}
>
	<div style="display:flex; flex-direction:column; gap:.75rem; width:100%;">
		<Table
			rows={people.rows}
			key={(r) => r.id}
			dirty={people.changed}
			loading={people.loading}
			columns={[
				{ key: 'name', label: 'Name', width: '12em' },
				{ key: 'email', label: 'Email' },
				{ key: 'undo', label: '', width: '5em' }
			]}
		>
			{#snippet cell(row, column)}
				{#if column.key === 'undo'}
					<Button size="xs" variant="ghost" disabled={!row.dirty} onclick={() => row.undo()}>undo</Button>
				{:else}
					<Input
						size="sm"
						value={row.value[column.key as keyof Person] as string}
						onchange={(e) => row.update({ [column.key]: e.currentTarget.value })}
					/>
				{/if}
			{/snippet}
		</Table>
		<div style="display:flex; gap:.5rem; flex-wrap:wrap;">
			<Button disabled={!people.canUndo} onclick={() => people.undo()}>Undo</Button>
			<Button disabled={!people.canRedo} onclick={() => people.redo()}>Redo</Button>
			<Button disabled={!people.dirty} onclick={() => people.reset()}>Reset</Button>
			<Button color="primary" disabled={!people.dirty} onclick={() => people.save()}>
				Save {people.changed.length || ''}
			</Button>
		</div>
	</div>
</Section>

<Section
	title="The handler, member by member"
	subtitle="What the instance handed to the children — or built with new DataHandlerState(options) — offers."
>
	<Table
		rows={members}
		key={(m) => m.name}
		columns={[
			{ key: 'name', label: 'Member', width: '16em' },
			{ key: 'what', label: 'What it does' }
		]}
		style="width:100%;"
	>
		{#snippet cell(m, column)}
			{#if column.key === 'name'}<code style="font-size:.85em;">{m.name}</code>{:else}{m.what}{/if}
		{/snippet}
	</Table>
</Section>

<Section
	title="Where the data comes from"
	subtitle="Functions first — plain async ones or SvelteKit remote functions, which are called the same way. Without them, a REST path. The address bar is written only with history, through the History API unless SvelteKit's own functions are passed."
	svelte={`<!-- SvelteKit: remote functions, and Kit's own navigation -->
<${'script'}>
	import { pushState, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { getPeople, patchPerson, deletePeople } from './people.remote';

	// Start where the address bar left off.
	const start = parseQuery(page.url.searchParams, FILTERS, SORTS);
</${'script'}>

<DataHandler identifier="id" get={getPeople} update={patchPerson} delete={deletePeople}
	filters={FILTERS} sorts={SORTS} {...start}
	history navigation={{ push: pushState, replace: replaceState }}>
	…
</DataHandler>

<!-- Anywhere else: a REST resource -->
<DataHandler identifier="id" path="/api/people" history>
	…
</DataHandler>`}
>
	<p style="margin:0; max-width:40rem; line-height:1.6; font-size:.9em;">
		<code>GET /api/people?role=admin,editor&amp;search=ada&amp;sort=name-asc&amp;page=2&amp;limit=10</code>
		answers <code>{'{ data, total }'}</code>.<br />
		<code>PATCH /api/people/p042</code> receives the changed fields.<br />
		<code>DELETE /api/people</code> receives the ids, as a JSON array.
	</p>
</Section>
