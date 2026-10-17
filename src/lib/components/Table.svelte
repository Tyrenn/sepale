<script module lang="ts">
	/** What .table is made of, classified. Each family's copy writes these out
	    as plain props (scripts/family-component.mjs).

	    The table draws its own head, rows and cells: every class below the
	    root that is not a flag is a PART. */
	export const PREFIX = 'table';

	export const AXES = {
		size: ['xs', 'sm', 'md', 'lg', 'xl']
	} as const;

	export const FLAGS = {
		zebra: 'Fill every other row.',
		hover: 'Fill the row under the pointer.',
		pinned: 'Keep the head at the top while the rows scroll under it (give the table a `maxHeight`).',
		loading: 'Fade the rows while new ones are on their way.'
	} as const;
	export const PARTS = [
		'scroll',
		'head',
		'row',
		'row-selected',
		'row-dirty',
		'cell',
		'sort',
		'sticky',
		'sticky-last',
		'empty'
	] as const;

	import type { Snippet } from 'svelte';
	import type { EditableKind } from './Editable.svelte';

	/** One column of a table. */
	export interface TableColumn<Row = any> {
		/** What identifies the column — and, by default, the field of a row it shows. */
		key: string;
		/** The header, as text or as a snippet. */
		label?: string | Snippet;
		/** The column's width, any CSS length (`20ch`, `12em`). A minimum: text wraps inside it. */
		width?: string;
		/** Pin the column to the start edge while the others scroll. */
		sticky?: boolean;
		/** Leave the column out. */
		hidden?: boolean;
		/** Make the header a button that asks for a sort on this column. */
		sortable?: boolean;
		/** How the cell's text lines up. */
		align?: 'start' | 'center' | 'end';
		/** The cell's text when there is no `cell` snippet. Defaults to `row[key]`. */
		value?: (row: Row) => unknown;
		/**
		 * Make the cell editable in place with the editor for this shape of value
		 * (an `Editable`). The edit is handed to `onEdit`. Ignored when a `cell`
		 * snippet draws the cell — put an `Editable` in it yourself.
		 */
		edit?: EditableKind;
	}

	export type TableSortDirection = 'asc' | 'desc';
	export interface TableSort {
		key: string;
		direction: TableSortDirection;
	}
</script>

<script lang="ts" generics="Row">
	/**
	 * A real `<table>`. Columns are described once — width, sticky, sortable,
	 * hidden — and each cell is the column's field, or whatever the `cell`
	 * snippet draws. The rows are plain data: where they come from is not the
	 * table's business.
	 *
	 * Selection, sorting and loading are states every table has, so they are
	 * here as plain props — `selected`, `sort` / `onSort`, `loading` — and the
	 * table only draws them.
	 */
	import type { HTMLTableAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';
	import Editable from './Editable.svelte';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, HTMLTableAttributes {
		/** The columns, in order. */
		columns: TableColumn<Row>[];
		/** The rows: your data, as is. */
		rows?: Row[];
		/** A row's identity, for `selected`, `dirty` and keyed rendering. Defaults to its index. */
		key?: (row: Row, index: number) => string;
		/** How one cell is drawn. Without it, the cell is the column's value as text. */
		cell?: Snippet<[Row, TableColumn<Row>, number]>;
		/**
		 * How a whole row is drawn, `<td>`s included — the escape hatch for a
		 * row `cell` cannot express. The table still writes the `<tr>`.
		 */
		row?: Snippet<[Row, number]>;
		/** Drawn in place of the rows when there are none. */
		empty?: Snippet;
		/** Keys of the rows to draw as selected. */
		selected?: Iterable<string>;
		/** Keys of the rows to draw as changed and not yet saved. */
		dirty?: Iterable<string>;
		/** The current sort, drawn on its header. */
		sort?: TableSort;
		/** A sortable header was clicked: ascending, then descending, then none. */
		onSort?: (sort: TableSort | undefined) => void;
		/** An editable cell (a column with `edit`) was changed: the row, the column's key, the new value. */
		onEdit?: (row: Row, key: string, value: unknown) => void;
		/** The scroll box's maximum height, for a long table with a pinned head. */
		maxHeight?: string;
		class?: string;
	}

	let {
		columns,
		rows = [],
		key = (_row: Row, i: number) => String(i),
		cell,
		row,
		empty,
		selected,
		dirty,
		sort,
		onSort,
		onEdit,
		maxHeight,
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));

	let visible = $derived(columns.filter((c) => !c.hidden));
	let selectedSet = $derived(new Set(selected ?? []));
	let dirtySet = $derived(new Set(dirty ?? []));

	/* Sticky columns are offset by the width of the sticky columns before
	   them, measured on their header cells. */
	let widths: number[] = $state([]);
	let offsets = $derived.by(() => {
		const out: (number | undefined)[] = [];
		let sum = 0;
		visible.forEach((c, i) => {
			if (!c.sticky) return;
			out[i] = sum;
			sum += widths[i] ?? 0;
		});
		return out;
	});
	let lastSticky = $derived(visible.findLastIndex((c) => c.sticky));

	function cellClass(c: TableColumn<Row>, i: number) {
		return cx(
			`${PREFIX}-cell`,
			c.sticky && `${PREFIX}-sticky`,
			i === lastSticky && `${PREFIX}-sticky-last`
		);
	}
	function cellStyle(c: TableColumn<Row>, i: number, head: boolean) {
		const parts: string[] = [];
		if (c.sticky) parts.push(`inset-inline-start:${offsets[i] ?? 0}px`);
		if (c.align) parts.push(`text-align:${c.align}`);
		if (head && c.width) parts.push(`width:${c.width}`, `min-width:${c.width}`);
		return parts.join(';') || undefined;
	}

	const ariaSort = (c: TableColumn<Row>) =>
		sort?.key === c.key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined;

	function next(c: TableColumn<Row>) {
		if (sort?.key !== c.key) return onSort?.({ key: c.key, direction: 'asc' });
		if (sort.direction === 'asc') return onSort?.({ key: c.key, direction: 'desc' });
		onSort?.(undefined);
	}

	const raw = (r: Row, c: TableColumn<Row>) =>
		c.value ? c.value(r) : (r as Record<string, unknown>)?.[c.key];
	const text = (r: Row, c: TableColumn<Row>) => {
		const v = raw(r, c);
		return v == null ? '' : String(v);
	};
</script>

<div class={`${PREFIX}-scroll`} style={maxHeight ? `max-height:${maxHeight}` : undefined}>
	<table {...applied.rest} class={classes}>
		<thead>
			<tr class={`${PREFIX}-head`}>
				{#each visible as c, i (c.key)}
					<th
						class={cellClass(c, i)}
						style={cellStyle(c, i, true)}
						scope="col"
						aria-sort={c.sortable ? (ariaSort(c) ?? 'none') : undefined}
						bind:offsetWidth={widths[i]}
					>
						{#if c.sortable}
							<button type="button" class={`${PREFIX}-sort`} onclick={() => next(c)}>
								{#if typeof c.label === 'function'}{@render c.label()}{:else}{c.label ?? c.key}{/if}
							</button>
						{:else if typeof c.label === 'function'}
							{@render c.label()}
						{:else}
							{c.label ?? c.key}
						{/if}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each rows as r, ri (key(r, ri))}
				{@const k = key(r, ri)}
				<tr
					class={cx(
						`${PREFIX}-row`,
						selectedSet.has(k) && `${PREFIX}-row-selected`,
						dirtySet.has(k) && `${PREFIX}-row-dirty`
					)}
				>
					{#if row}
						{@render row(r, ri)}
					{:else}
						{#each visible as c, i (c.key)}
							<td class={cellClass(c, i)} style={cellStyle(c, i, false)}>
								{#if cell}{@render cell(r, c, ri)}{:else if c.edit}<Editable
										value={raw(r, c)}
										kind={c.edit}
										onChange={(v) => onEdit?.(r, c.key, v)}
									/>{:else}{text(r, c)}{/if}
							</td>
						{/each}
					{/if}
				</tr>
			{:else}
				{#if empty}
					<tr>
						<td class={`${PREFIX}-empty`} colspan={visible.length}>{@render empty()}</td>
					</tr>
				{/if}
			{/each}
		</tbody>
	</table>
</div>
