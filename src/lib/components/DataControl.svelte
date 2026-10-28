<script module lang="ts">
	/** What .data-control is made of, classified. Each family's copy writes
	    these out as plain props (scripts/family-component.mjs).

	    The control draws its own rows: every class below the root that is
	    not an axis is a PART. The buttons, fields, chips and pagination in
	    them are the kit's own components. */
	export const PREFIX = 'data-control';

	export const AXES = {
		size: ['xs', 'sm', 'md', 'lg', 'xl'],
		/* A card around the controls and the view. */
		variant: ['boxed']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = [
		'bar',
		'bar-left',
		'bar-right',
		'search',
		'count',
		'filters',
		'filter',
		'filter-remove',
		'editor',
		'field',
		'field-label',
		'more',
		'actions-start',
		'actions-end',
		'actions',
		'page-options',
		'pagination',
		'range',
		'body'
	] as const;

	/** Every text the control writes. */
	export interface DataControlLabels {
		filters: string;
		sort: string;
		noSort: string;
		search: string;
		perPage: (n: number) => string;
		selected: (n: number) => string;
		range: (from: number, to: number, total: number) => string;
		save: string;
		undo: string;
		redo: string;
		reset: string;
		delete: string;
		add: string;
		export: string;
		removeFilter: (title: string) => string;
		yes: string;
		no: string;
		any: string;
		confirmDeleteTitle: (n: number) => string;
		confirmDeleteText: string;
		cancel: string;
		confirmDiscardTitle: (n: number) => string;
		confirmDiscardText: string;
		discard: string;
		stay: string;
	}

	export const LABELS: DataControlLabels = {
		filters: 'Filters',
		sort: 'Sort',
		noSort: 'No sort',
		search: 'Search',
		perPage: (n) => `${n} per page`,
		selected: (n) => `${n} selected`,
		range: (from, to, total) => `${from}–${to} / ${total}`,
		save: 'Save',
		undo: 'Undo',
		redo: 'Redo',
		reset: 'Discard changes',
		delete: 'Delete',
		add: 'Add',
		export: 'Export',
		removeFilter: (title) => `Remove the ${title} filter`,
		yes: 'Yes',
		no: 'No',
		any: 'any',
		confirmDeleteTitle: (n) => `Delete ${n} row${n > 1 ? 's' : ''}?`,
		confirmDeleteText: 'This cannot be undone.',
		cancel: 'Cancel',
		confirmDiscardTitle: (n) => `${n} unsaved change${n > 1 ? 's' : ''}`,
		confirmDiscardText: 'Loading other rows drops them. Save them first?',
		discard: 'Discard',
		stay: 'Stay'
	};
</script>

<script lang="ts" generics="F extends readonly Filter[], Model extends Record<string, any>, Id">
	/**
	 * The controls of a data handler, around the view that shows its rows:
	 * filters, sort, search, page size, pagination, and actions on the
	 * selection or on the whole resource. Every one of them is optional, and
	 * an action only appears when the handler can do it (`update`, `delete`).
	 *
	 * Deleting and dropping unsaved changes are confirmed in a Dialog, unless
	 * the handler was given its own `confirmDelete` / `confirmDiscard`.
	 */
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';
	import type { DataHandlerState, DiscardChoice, EntitySuggestion, EntityValue, Filter, HandledFilter, Sort } from './data-handler.svelte.js';
	import Button from './Button.svelte';
	import Chip from './Chip.svelte';
	import Dialog from './Dialog.svelte';
	import DatePicker from './DatePicker.svelte';
	import Dropdown from './Dropdown.svelte';
	import Input from './Input.svelte';
	import Combobox from './Combobox.svelte';
	import Menu from './Menu.svelte';
	import Pagination from './Pagination.svelte';
	import Select from './Select.svelte';
	import Switch from './Switch.svelte';
	import Toggle from './Toggle.svelte';

	type Handler = DataHandlerState<F, Model, Id>;
	type ExportOptions = Parameters<Handler['export']>[0];

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The handler whose rows and requests these controls drive. */
		handler: Handler;
		/** The view: a Table, a Grid, a List — given the handler. */
		children?: Snippet<[Handler]>;
		/** Offer the handler's filters. Default true. */
		filters?: boolean;
		/** Draw every filter as a field in the bar, and the page size and the sort
		    with the pagination, instead of a menu, chips and a select in the bar. */
		fields?: boolean;
		/** Offer the handler's sorts. Default true. */
		sorts?: boolean;
		/** Draw a search field. Default true. */
		search?: boolean;
		/** Milliseconds without typing before the search is fetched. Default 300. */
		searchDelay?: number;
		/** The page sizes to choose from, or `false` for none. */
		limits?: number[] | false;
		/** Where the pagination goes. Default `bottom`. */
		pagination?: 'top' | 'bottom' | 'both' | 'none';
		/** Draw save, undo, redo and discard, when the handler can update. Default true. */
		editing?: boolean;
		/** Draw delete, when the handler can delete. Default true. */
		removable?: boolean;
		/** Draw export: `true`, or the options the export runs with. */
		exportable?: boolean | ExportOptions;
		/** Draw an add button calling this. */
		onAdd?: () => void;
		/** Confirm deletions and discarded changes in a dialog. Default true. */
		confirm?: boolean;
		/** Drawn at the start of the bar, after the filters and the sort. */
		leftActions?: Snippet<[Handler]>;
		/** Drawn at the end of the bar, after the built-in actions. */
		rightActions?: Snippet<[Handler]>;
		/** Drawn above the view (and above a top pagination). */
		header?: Snippet<[Handler]>;
		/** Drawn below the view (and below a bottom pagination). */
		footer?: Snippet<[Handler]>;
		/** The texts, for another language. */
		labels?: Partial<DataControlLabels>;
		class?: string;
	}

	let {
		handler,
		children,
		filters = true,
		fields = false,
		sorts = true,
		search = true,
		searchDelay = 300,
		limits = [5, 10, 25, 50, 100],
		pagination = 'bottom',
		editing = true,
		removable = true,
		exportable = false,
		onAdd,
		confirm = true,
		leftActions,
		rightActions,
		header,
		footer,
		labels,
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));

	let t = $derived({ ...LABELS, ...labels });

	/* ── Confirmations ── lent to the handler while it has none of its own. */

	type Asking =
		| { kind: 'delete'; count: number; resolve: (ok: boolean) => void }
		| { kind: 'discard'; count: number; resolve: (choice: DiscardChoice) => void };
	let asking: Asking | undefined = $state();
	let dialogOpen = $state(false);

	$effect(() => {
		if (!confirm) return;
		const o = handler.options;
		const ownDelete = o.confirmDelete;
		const ownDiscard = o.confirmDiscard;
		o.confirmDelete ??= (ids) =>
			new Promise((resolve) => {
				asking = { kind: 'delete', count: ids.length, resolve };
				dialogOpen = true;
			});
		o.confirmDiscard ??= (count) =>
			new Promise((resolve) => {
				asking = { kind: 'discard', count, resolve };
				dialogOpen = true;
			});
		return () => {
			o.confirmDelete = ownDelete;
			o.confirmDiscard = ownDiscard;
		};
	});

	function answered(value: string) {
		const a = asking;
		asking = undefined;
		if (!a) return;
		if (a.kind === 'delete') a.resolve(value === 'delete');
		else a.resolve(value === 'save' || value === 'discard' ? value : 'stay');
	}

	/* ── Filters ── */

	/** The filter whose editor is open. */
	let openFilter: string | undefined = $state();

	const valueOf = (f: HandledFilter) => (handler.filterValues as Record<string, unknown>)[f.id];

	function summary(f: HandledFilter): string {
		const v = valueOf(f);
		if (v === undefined || v === null || v === '') return t.any;
		switch (f.type) {
			case 'date':
				return (v as Date).toLocaleDateString();
			case 'boolean':
				return v ? t.yes : t.no;
			case 'entity': {
				const e = v as EntityValue;
				return f.show ? f.show(e) : String(e.name ?? e.id);
			}
			case 'select': {
				const chosen = v as string[];
				if (!chosen.length) return t.any;
				const names = chosen.map((c) => f.options.find((o) => o.value === c)?.name ?? c);
				return names.length > 2 ? `${names.slice(0, 2).join(', ')} +${names.length - 2}` : names.join(', ');
			}
			default:
				return String(v);
		}
	}

	function add(f: HandledFilter) {
		handler.showFilter(f.id);
		openFilter = f.id;
	}

	const set = (f: HandledFilter, value: unknown, delay = 0) =>
		handler.changeFilter(f.id, value as never, delay);

	const dateValue = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : '');

	/* ── The page ── */

	let from = $derived(handler.total ? (handler.page - 1) * handler.limit + 1 : 0);
	let to = $derived(Math.min(handler.page * handler.limit, handler.total ?? 0));

	/* With `fields`: the search and this many filters show; the others open from a button. */
	const FIELDS_SHOWN = 3;
	const fieldFilters = $derived(handler.filters.filter((f) => !f.immutable));
	const moreFilters = $derived(fieldFilters.slice(FIELDS_SHOWN));
	const moreActive = $derived(moreFilters.filter((f) => valueOf(f) !== undefined && valueOf(f) !== null && valueOf(f) !== '').length);
	// svelte-ignore state_referenced_locally
	let showMore = $state(moreFilters.some((f) => valueOf(f) !== undefined));

	const hasActions = $derived(
		!!leftActions ||
		!!rightActions ||
		!!onAdd ||
		!!exportable ||
		(editing && handler.canUpdate) ||
		(removable && handler.canDelete)
	);

	const sortKey = (s: Sort) => `${s.id}-${s.value}`;
</script>

{#snippet icon(path: string)}
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={path} /></svg>
{/snippet}

{#snippet pager()}
	{#if handler.total}
		<div class={`${PREFIX}-pagination`}>
			<span class={`${PREFIX}-range`}>{t.range(from, to, handler.total)}</span>
			{#if (handler.pages ?? 1) > 1}
				<Pagination count={handler.pages ?? 1} page={handler.page} onPage={(p) => handler.changePage(p)} />
			{/if}
			{#if fields}
				<div class={`${PREFIX}-page-options`}>
					{#if sorts && handler.sorts.length}
						<Select
							aria-label={t.sort}
							nullable
							placeholder={t.sort}
							options={handler.sorts.map((x) => ({ value: sortKey(x), name: x.name }))}
							value={handler.sort ? sortKey(handler.sort) : undefined}
							onValue={(v) => handler.changeSort(handler.sorts.find((x) => sortKey(x) === v))}
						/>
					{/if}
					{#if limits && limits.length}
						<Select
							aria-label={t.perPage(handler.limit)}
							options={limits.map((n) => ({ value: String(n), name: t.perPage(n) }))}
							value={String(handler.limit)}
							onValue={(v) => handler.changeLimit(Number(v))}
						/>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
{/snippet}

{#snippet editor(f: HandledFilter, inline: boolean)}
	<div class={inline ? `${PREFIX}-field` : `${PREFIX}-editor`}>
		{#if inline}<span class={`${PREFIX}-field-label`}>{f.title}</span>{/if}
		{#if f.type === 'text'}
			<Input
				placeholder={inline ? undefined : f.title}
				aria-label={f.title}
				value={(valueOf(f) as string) ?? ''}
				oninput={(e) => set(f, e.currentTarget.value || undefined, 400)}
			/>
		{:else if f.type === 'number'}
			<Input
				type="number"
				placeholder={undefined}
				aria-label={f.title}
				min={f.min}
				max={f.max}
				step={f.step}
				value={valueOf(f) ?? ''}
				oninput={(e) => {
					const n = e.currentTarget.valueAsNumber;
					set(f, Number.isNaN(n) ? undefined : n, 400);
				}}
			/>
		{:else if f.type === 'date'}
			<DatePicker
				value={(valueOf(f) as Date | undefined) ?? null}
				onChange={(d) => set(f, d instanceof Date ? d : undefined)}
			/>
		{:else if f.type === 'boolean' && inline}
			<Select
				options={[{ value: 'yes', name: t.yes }, { value: 'no', name: t.no }]}
				nullable
				placeholder={t.any}
				aria-label={f.title}
				value={valueOf(f) === undefined || valueOf(f) === null ? undefined : valueOf(f) ? 'yes' : 'no'}
				onValue={(v) => set(f, v ? v === 'yes' : undefined)}
			/>
		{:else if f.type === 'select' && inline && f.switch && !f.multiple}
			<Switch
				size="sm"
				label={f.title}
				options={[{ value: '', label: t.any }, ...f.options.map((o) => ({ value: String(o.value), label: o.name }))]}
				value={(valueOf(f) as string[] | undefined)?.[0] ?? ''}
				onChange={(v) => set(f, v ? [v] : undefined)}
			/>
		{:else if f.type === 'select'}
			<Select
				options={f.options}
				multiple={f.multiple}
				nullable={f.nullable ?? true}
				placeholder={t.any}
				aria-label={f.title}
				value={f.multiple ? ((valueOf(f) as string[]) ?? []) : ((valueOf(f) as string[] | undefined)?.[0])}
				onValue={(v) => {
					const list = Array.isArray(v) ? v : v ? [v] : [];
					set(f, list.length ? list : undefined);
				}}
			/>
		{:else if f.type === 'boolean'}
			<label style="display:flex; align-items:center; gap:.5em;">
				<Toggle checked={!!valueOf(f)} onchange={(e) => set(f, e.currentTarget.checked)} />
				{f.title}
			</label>
		{:else if f.type === 'entity'}
			<Combobox
				placeholder={inline ? t.any : f.title}
				aria-label={f.title}
				value={valueOf(f)}
				options={(q: string) => Promise.resolve(f.items(q))}
				show={(s: EntitySuggestion) => (f.show ? f.show(s) : String(s.name ?? s.id))}
				wait={f.wait}
				eager
				onSelect={(s: EntitySuggestion | undefined) => set(f, s ? ({ id: String(s.id), name: s.name } satisfies EntityValue) : undefined)}
			/>
		{/if}
	</div>
{/snippet}

{#snippet actions()}
			{#if limits && limits.length && !fields}
				<Select
					aria-label={t.perPage(handler.limit)}
					options={limits.map((n) => ({ value: String(n), name: t.perPage(n) }))}
					value={String(handler.limit)}
					onValue={(v) => handler.changeLimit(Number(v))}
				/>
			{/if}

			{#if removable && handler.canDelete && handler.selection.length}
				<span class={`${PREFIX}-count`}>{t.selected(handler.selection.length)}</span>
			{/if}

			{#if editing && handler.canUpdate}
				<Button variant="ghost" shape="square" title={t.undo} aria-label={t.undo} disabled={!handler.canUndo} onclick={() => handler.undo()}>
					{@render icon('M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3')}
				</Button>
				<Button variant="ghost" shape="square" title={t.redo} aria-label={t.redo} disabled={!handler.canRedo} onclick={() => handler.redo()}>
					{@render icon('m15 14 5-5-5-5M20 9H9a5 5 0 0 0 0 10h3')}
				</Button>
				<Button variant="ghost" shape="square" title={t.reset} aria-label={t.reset} disabled={!handler.dirty} onclick={() => handler.reset()}>
					{@render icon('M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5')}
				</Button>
				<Button color="primary" disabled={!handler.dirty} onclick={() => handler.save()}>
					{t.save}
				</Button>
			{/if}

			{#if removable && handler.canDelete}
				<Button color="error" variant="soft" shape="square" title={t.delete} aria-label={t.delete} disabled={!handler.selection.length} onclick={() => handler.delete()}>
					{@render icon('M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6')}
				</Button>
			{/if}

			{#if onAdd}
				<Button variant="soft" shape="square" title={t.add} aria-label={t.add} onclick={() => onAdd()}>
					{@render icon('M12 5v14M5 12h14')}
				</Button>
			{/if}

			{#if exportable && !fields}
				<Button
					variant="ghost"
					shape="square"
					title={t.export}
					aria-label={t.export}
					disabled={!handler.total}
					onclick={() => handler.export(typeof exportable === 'object' ? exportable : {})}
				>
					{@render icon('M12 3v12M7 10l5 5 5-5M5 21h14')}
				</Button>
			{/if}

			{@render rightActions?.(handler)}
{/snippet}

<div {...applied.rest} class={classes}>
	<div class={`${PREFIX}-bar`}>
		<div class={`${PREFIX}-bar-left`}>
			{#if filters && !fields && handler.availableFilters.length}
				<Dropdown>
					{#snippet trigger({ props })}
						<Button {...props} variant="ghost" title={t.filters}>
							{@render icon('M3 5h18M6 12h12M10 19h4')}
							{t.filters}
						</Button>
					{/snippet}
					{#snippet children({ close })}
						<Menu
							items={handler.availableFilters.map((f) => ({ label: f.title }))}
							onSelect={(node) => {
								const f = handler.availableFilters.find((x) => x.title === node.label);
								close();
								if (f) add(f);
							}}
						/>
					{/snippet}
				</Dropdown>
			{/if}

			{#if sorts && !fields && handler.sorts.length}
				<Dropdown>
					{#snippet trigger({ props })}
						<Button {...props} variant="ghost" title={t.sort}>
							{@render icon('M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4')}
							{handler.sort?.name ?? t.sort}
						</Button>
					{/snippet}
					{#snippet children({ close })}
						<Menu
							items={[
								{ label: t.noSort, active: !handler.sort },
								...handler.sorts.map((s) => ({
									label: s.name,
									active: !!handler.sort && sortKey(handler.sort) === sortKey(s)
								}))
							]}
							onSelect={(node) => {
								close();
								handler.changeSort(handler.sorts.find((s) => s.name === node.label));
							}}
						/>
					{/snippet}
				</Dropdown>
			{/if}

			{#if !fields}{@render leftActions?.(handler)}{/if}

			{#if search && fields}
				<div class={`${PREFIX}-field ${PREFIX}-field-search`}>
					<span class={`${PREFIX}-field-label`}>{t.search}</span>
					<Input
						class={`${PREFIX}-search`}
						type="search"
						aria-label={t.search}
						value={handler.search}
						oninput={(e) => handler.changeSearch(e.currentTarget.value, searchDelay)}
					>
						{#snippet start()}{@render icon('M21 21l-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z')}{/snippet}
					</Input>
				</div>
			{:else if search}
				<Input
					class={`${PREFIX}-search`}
					type="search"
					placeholder={t.search}
					aria-label={t.search}
					value={handler.search}
					oninput={(e) => handler.changeSearch(e.currentTarget.value, searchDelay)}
				>
					{#snippet start()}{@render icon('M21 21l-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z')}{/snippet}
				</Input>
			{/if}

			{#if filters && fields}
				{#each fieldFilters.slice(0, FIELDS_SHOWN) as f (f.id)}
					{@render editor(f, true)}
				{/each}
				{#if moreFilters.length}
					<Button variant={showMore ? 'soft' : 'ghost'} aria-expanded={showMore} onclick={() => (showMore = !showMore)}>
						{@render icon('M3 5h18M6 12h12M10 19h4')}
						{t.filters}{#if moreActive} ({moreActive}){/if}
					</Button>
				{/if}
				{#if showMore}
					<div class={`${PREFIX}-more`} transition:slide={{ duration: 220 }}>
						{#each moreFilters as f (f.id)}
							{@render editor(f, true)}
						{/each}
					</div>
				{/if}
			{/if}
		</div>

		{#if !fields}
			<div class={`${PREFIX}-bar-right`}>
				{@render actions()}
			</div>
		{/if}
	</div>

	{#if fields && hasActions}
		<div class={`${PREFIX}-actions`}>
			<div class={`${PREFIX}-actions-start`}>
				{#if exportable}
				<Button
							variant="ghost"
							shape="square"
							title={t.export}
							aria-label={t.export}
							disabled={!handler.total}
							onclick={() => handler.export(typeof exportable === 'object' ? exportable : {})}
						>
							{@render icon('M12 3v12M7 10l5 5 5-5M5 21h14')}
						</Button>
		
				{/if}
				{@render leftActions?.(handler)}
			</div>
			<div class={`${PREFIX}-actions-end`}>
				{@render actions()}
			</div>
		</div>
	{/if}

	{#if filters && !fields && handler.shownFilters.length}
		<div class={`${PREFIX}-filters`}>
			{#each handler.shownFilters as f (f.id)}
				<Dropdown
					open={openFilter === f.id}
					onToggle={(open) => (openFilter = open ? f.id : openFilter === f.id ? undefined : openFilter)}
				>
					{#snippet trigger({ props })}
						<Chip variant="soft" class={`${PREFIX}-filter`}>
							<button type="button" {...props}><strong>{f.title}</strong> {summary(f)}</button>
							<button
								type="button"
								class={`${PREFIX}-filter-remove`}
								aria-label={t.removeFilter(f.title)}
								onclick={() => {
									openFilter = undefined;
									handler.removeFilter(f.id);
								}}
							>{@render icon('M18 6 6 18M6 6l12 12')}</button>
						</Chip>
					{/snippet}
					{@render editor(f, false)}
				</Dropdown>
			{/each}
		</div>
	{/if}

	{@render header?.(handler)}

	{#if pagination === 'top' || pagination === 'both'}{@render pager()}{/if}

	<div class={`${PREFIX}-body`}>{@render children?.(handler)}</div>

	{#if pagination === 'bottom' || pagination === 'both'}{@render pager()}{/if}

	{@render footer?.(handler)}

	{#if confirm}
		<Dialog
			bind:open={dialogOpen}
			size="sm"
			title={asking?.kind === 'delete' ? t.confirmDeleteTitle(asking.count) : asking ? t.confirmDiscardTitle(asking.count) : ''}
			onClose={answered}
		>
			{asking?.kind === 'delete' ? t.confirmDeleteText : t.confirmDiscardText}
			{#snippet actions()}
				{#if asking?.kind === 'delete'}
					<Button value="cancel">{t.cancel}</Button>
					<Button value="delete" color="error">{t.delete}</Button>
				{:else}
					<Button value="stay" variant="ghost">{t.stay}</Button>
					<Button value="discard">{t.discard}</Button>
					<Button value="save" color="primary">{t.save}</Button>
				{/if}
			{/snippet}
		</Dialog>
	{/if}
</div>
