<script module lang="ts">
	/** What .kanban is made of, classified. The props follow the
	    families the project registers (variants.ts, ADR 0015). */
	export const PREFIX = 'kanban';

	export const AXES = {
		size: ['xs', 'sm', 'md', 'lg', 'xl'],
		/* Space between the columns. */
		gap: ['none', 'tight', 'loose']
	} as const;

	export const FLAGS = {
		loading: 'Fade the columns while new items are on their way.'
	} as const;
	export const PARTS = [
		'column',
		'column-over',
		'column-head',
		'column-title',
		'column-count',
		'column-body',
		'column-foot',
		'column-empty',
		'entry',
		'item',
		'item-selected',
		'item-dirty',
		'item-dragged',
		'marker'
	] as const;

	export type KanbanColumn = {
		id: string;
		/** Defaults to the id. */
		title?: string;
	};

	export type KanbanMove<Item> = {
		item: Item;
		/** The column it leaves. */
		from: string;
		/** The column it lands in: `from` when it only changed places. */
		to: string;
		/** Its place in `to`, counted without the item itself. */
		index: number;
	};
</script>

<script lang="ts" generics="Item">
	/**
	 * Items in columns, one column per state they can be in. Like a table or a
	 * grid it knows nothing of where its items come from, and it moves nothing:
	 * dragging a card, or Shift + an arrow key on it, calls `onmove`, and the
	 * items only change when the caller changes them. Without `onmove` the board
	 * is read-only.
	 *
	 * The drag is the browser's own, which brings the drag image, Escape to
	 * cancel and the scrolling at the edges. An item naming a column that is not
	 * in `columns` is not drawn.
	 */
	import { tick, untrack, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';
	import { keyer, type KeyOf } from '../keys.js';
	import { motion, moved, Reflow, type Motion, type Move } from '../motion.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>, HTMLAttributes<HTMLDivElement> {
		/** The items: your data, as is, each column keeping their order. */
		items?: Item[];
		/** The columns, in order. */
		columns: KanbanColumn[];
		/** The id of the column an item belongs to. */
		columnOf: (item: Item) => string;
		/** How one item is drawn, given its place in its column. */
		item: Snippet<[Item, number]>;
		/** An item's identity, for `selected`, `dirty`, keyed rendering and a crossfade:
		    a field's name (`"id"`) or a function. Defaults to its index. */
		key?: KeyOf<Item>;
		/** Replaces a column's title and count. */
		head?: Snippet<[KanbanColumn, Item[]]>;
		/** Drawn under a column's items: an add button, usually. */
		foot?: Snippet<[KanbanColumn]>;
		/** Drawn in a column with no items. */
		empty?: Snippet<[KanbanColumn]>;
		/** Keys of the items to draw as selected. */
		selected?: Iterable<string>;
		/** Keys of the items to draw as changed and not yet saved. */
		dirty?: Iterable<string>;
		/** An item was dropped somewhere new. Given, it makes the items movable. */
		onmove?: (move: KanbanMove<Item>) => void;
		/** Who plays a card's coming and going: the family (default, `data-motion`), `false`
		    for nobody, or a Svelte transition — `slide`, `{ fn: fly, params: { y: -4 } }`,
		    `{ in, out }`. Each card hands it its key, so `crossfade()` makes a card
		    moved to another column fly there (motion.ts). */
		transition?: Motion;
		/** Who plays a card's move. `true` (default): the family — a card that
		    stands elsewhere after a change, in its column or in another, is
		    marked `data-motion="move"` from where it stood (`--motion-dx/dy`).
		    `false`: nobody. A Svelte animation — `flip`, `{ fn: flip, params }` —
		    plays on the entries instead, as `animate:flip` would: with a
		    `crossfade()` transition, the board moves as a plain Svelte one. */
		animate?: Move;
		class?: string;
	}

	let {
		items = [],
		columns,
		columnOf,
		item,
		key: keyProp,
		head,
		foot,
		empty,
		selected,
		dirty,
		onmove,
		transition,
		animate = true,
		class: klass = '',
		...axes
	}: Props = $props();

	/* `key` as a function, whatever form it was given in. */
	let key = $derived(keyer(keyProp));

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));

	let selectedSet = $derived(new Set(selected ?? []));
	let dirtySet = $derived(new Set(dirty ?? []));

	type Entry = { item: Item; key: string };

	let lanes = $derived.by(() => {
		const byColumn = new Map<string, Entry[]>(columns.map((c) => [c.id, []]));
		items.forEach((it, i) => byColumn.get(columnOf(it))?.push({ item: it, key: key(it, i) }));
		return columns.map((column) => ({ column, entries: byColumn.get(column.id)! }));
	});

	let root: HTMLDivElement | undefined = $state();

	/* Moves, measured here (motion.ts, Reflow): Svelte's animate: reaches
	   neither a card that changes column nor one sharing its block with the
	   drop marker. Measured before every change of the lanes, marked after. */
	const reflow = new Reflow(() => root, 'kanbanKey');
	let keys = $derived(new Set(lanes.flatMap((l) => l.entries.map((e) => e.key))));
	$effect.pre(() => {
		void lanes;
		untrack(() => reflow.measure());
	});
	$effect(() => {
		void lanes;
		if (untrack(() => animate === true)) untrack(() => reflow.play(transition === undefined || transition === true));
	});

	/* What is in flight. Read by the drag handlers, so it is set at once; what
	   the page shows follows a frame later, because restyling the source during
	   `dragstart` would end up in the drag image. */
	let flight: { entry: Entry; from: string } | null = null;
	let draggedKey = $state<string | null>(null);
	let over = $state<{ column: string; index: number } | null>(null);

	/* Where the drop would land, or null when it would change nothing. */
	let marker = $derived.by(() => {
		if (!over || draggedKey === null) return null;
		const entries = lanes.find((lane) => lane.column.id === over!.column)?.entries ?? [];
		if (entries.findIndex((e) => e.key === draggedKey) === over.index) return null;
		const before = entries.filter((e) => e.key !== draggedKey)[over.index];
		return { column: over.column, before: before?.key ?? null };
	});

	function dragstart(e: DragEvent, entry: Entry, from: string) {
		flight = { entry, from };
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			/* Firefox starts no drag without data. */
			e.dataTransfer.setData('text/plain', entry.key);
		}
		requestAnimationFrame(() => {
			if (flight) draggedKey = entry.key;
		});
	}

	/* The place under the pointer, counted without the item in flight. */
	function placeAt(e: DragEvent & { currentTarget: HTMLElement }) {
		const others = [...e.currentTarget.querySelectorAll<HTMLElement>('[data-kanban-key]')].filter(
			(el) => el.dataset.kanbanKey !== flight!.entry.key
		);
		const next = others.findIndex((el) => {
			const box = el.getBoundingClientRect();
			return e.clientY < box.top + box.height / 2;
		});
		return next < 0 ? others.length : next;
	}

	function dragover(e: DragEvent & { currentTarget: HTMLElement }, column: string) {
		/* Anything else dragged over the board is not ours to accept. */
		if (!flight) return;
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
		const index = placeAt(e);
		if (over?.column !== column || over.index !== index) over = { column, index };
	}

	/* By the pointer, not `relatedTarget`, which not every browser fills in. */
	function dragleave(e: DragEvent & { currentTarget: HTMLElement }) {
		const box = e.currentTarget.getBoundingClientRect();
		const inside =
			e.clientX > box.left && e.clientX < box.right && e.clientY > box.top && e.clientY < box.bottom;
		if (!inside) over = null;
	}

	/* The place is read again rather than taken from `over`: a drop must not
	   depend on the last dragover having been drawn. */
	function drop(e: DragEvent & { currentTarget: HTMLElement }, column: string) {
		if (!flight) return;
		e.preventDefault();
		const index = placeAt(e);
		const { entry, from } = flight;
		const stays =
			from === column &&
			lanes.find((lane) => lane.column.id === column)?.entries.findIndex((other) => other.key === entry.key) === index;
		if (!stays) onmove?.({ item: entry.item, from, to: column, index });
		dragend();
	}

	function dragend() {
		flight = null;
		draggedKey = null;
		over = null;
	}

	/* Shift + an arrow: the same move as a drop, then the focus follows the
	   item, whose element the move may have replaced. */
	function keydown(
		e: KeyboardEvent & { currentTarget: HTMLElement },
		entry: Entry,
		laneIndex: number,
		index: number
	) {
		if (!onmove || !e.shiftKey || e.target !== e.currentTarget) return;
		const lane = lanes[laneIndex]!;
		const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
		let to = laneIndex;
		let place = index;
		if (e.key === 'ArrowUp') place = index - 1;
		else if (e.key === 'ArrowDown') place = index + 1;
		else if (e.key === 'ArrowLeft') to = laneIndex + (rtl ? 1 : -1);
		else if (e.key === 'ArrowRight') to = laneIndex + (rtl ? -1 : 1);
		else return;
		e.preventDefault();
		const target = lanes[to];
		if (!target || place < 0) return;
		if (to === laneIndex && place >= lane.entries.length) return;
		onmove({
			item: entry.item,
			from: lane.column.id,
			to: target.column.id,
			index: Math.min(place, target.entries.length)
		});
		tick().then(() =>
			root?.querySelector<HTMLElement>(`[data-kanban-key="${CSS.escape(entry.key)}"]`)?.focus()
		);
	}
</script>

<div {...applied.rest} bind:this={root} class={classes}>
	{#each lanes as lane, laneIndex (lane.column.id)}
		{@const title = lane.column.title ?? lane.column.id}
		<section
			class={cx(`${PREFIX}-column`, over?.column === lane.column.id && `${PREFIX}-column-over`)}
			aria-label={title}
			ondragover={(e) => dragover(e, lane.column.id)}
			ondragleave={dragleave}
			ondrop={(e) => drop(e, lane.column.id)}
		>
			<header class={`${PREFIX}-column-head`}>
				{#if head}
					{@render head(lane.column, lane.entries.map((e) => e.item))}
				{:else}
					<span class={`${PREFIX}-column-title`}>{title}</span>
					<span class={`${PREFIX}-column-count`}>{lane.entries.length}</span>
				{/if}
			</header>
			<!-- Nothing but entries in the body: what begins or ends a column stands
			     outside it. -->
			{#if !lane.entries.length && empty}<div class={`${PREFIX}-column-empty`}>{@render empty(lane.column)}</div>{/if}
			<ul class={`${PREFIX}-column-body`}>
				{#each lane.entries as entry, i (entry.key)}
					{@const here = marker?.column === lane.column.id}
					<!-- The entry is what comes, goes and moves: the sole child of the
					     keyed block, so Svelte's animate: reaches it. -->
					<li
						class={`${PREFIX}-entry`}
						in:motion={reflow.motion(entry.key, transition, keys.has(entry.key))}
						out:motion={reflow.motion(entry.key, transition, keys.has(entry.key))}
						animate:moved={typeof animate === 'boolean' ? false : animate}
					>
						{#if here && marker?.before === entry.key}
							<div class={`${PREFIX}-marker`} aria-hidden="true"></div>
						{/if}
						<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions, a11y_no_static_element_interactions -->
						<div
							class={cx(
								`${PREFIX}-item`,
								selectedSet.has(entry.key) && `${PREFIX}-item-selected`,
								dirtySet.has(entry.key) && `${PREFIX}-item-dirty`,
								draggedKey === entry.key && `${PREFIX}-item-dragged`
							)}
							data-kanban-key={entry.key}
							draggable={onmove ? 'true' : undefined}
							tabindex={onmove ? 0 : undefined}
							aria-keyshortcuts={onmove ? 'Shift+ArrowUp Shift+ArrowDown Shift+ArrowLeft Shift+ArrowRight' : undefined}
							ondragstart={(e) => dragstart(e, entry, lane.column.id)}
							ondragend={dragend}
							onkeydown={(e) => keydown(e, entry, laneIndex, i)}
						>
							{@render item(entry.item, i)}
						</div>
						{#if here && marker?.before === null && i === lane.entries.length - 1}
							<div class={`${PREFIX}-marker`} aria-hidden="true"></div>
						{/if}
					</li>
				{/each}
			</ul>
			{#if foot}<footer class={`${PREFIX}-column-foot`}>{@render foot(lane.column)}</footer>{/if}
		</section>
	{/each}
</div>
