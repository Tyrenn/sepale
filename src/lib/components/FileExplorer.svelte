<script module lang="ts">
	/** What .file-explorer is made of, classified. The props follow the
	    families the project registers (variants.ts, ADR 0015). */
	export const PREFIX = 'file-explorer';

	export const AXES = {
		size: ['xs', 'sm', 'md', 'lg', 'xl']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = [
		'toolbar',
		'path',
		'actions',
		'views',
		'view',
		'main',
		'tree',
		'tree-item',
		'twisty',
		'content',
		'table',
		'grid',
		'item',
		'entry',
		'icon',
		'thumb',
		'name',
		'meta',
		'empty',
		'details',
		'menu'
	] as const;

	/** A file or a folder. Anything else on it is yours: it travels to the snippets. */
	export interface FileNode {
		id: string | number;
		name: string;
		kind: 'folder' | 'file';
		/** Bytes. */
		size?: number;
		modified?: Date;
		/** A static tree: a folder's content, known up front. */
		children?: FileNode[];
		[key: string]: unknown;
	}

	/** What a drop brings: nodes dragged inside the explorer, or files from the system. */
	export type FileDrop = FileNode[] | File[];
</script>

<script lang="ts">
	/**
	 * Files and folders in a hierarchy, Drive-like: the folder tree on the
	 * left, the current folder as a list or a grid, the details of the
	 * selection on the right, under a toolbar with the path and your actions.
	 *
	 * Folders load lazily through `load(folder)` — `null` is the top — or
	 * come from a static `root`. Selection: click, Ctrl/⌘ to add, Shift for a
	 * range; the keyboard walks the content (arrows, Enter, Backspace to go
	 * up). Double-click or Enter opens a folder, or calls `onopen` on a file.
	 * Right-click shows the `menu` snippet.
	 *
	 * Drag and drop moves nothing by itself: `ondragitems` may refuse a drag,
	 * `ondropitems(items, target)` says what was dropped where — nodes from inside,
	 * or `File`s from the system — and the app does the work, then calls
	 * `refresh()`.
	 */
	import { untrack, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import Breadcrumbs from './Breadcrumbs.svelte';
	import { FILE_ICONS, IMAGE_EXTENSIONS, PAGE, extensionOf, type FileIcon } from './file-icons.js';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	type Folder = FileNode | null;
	type SortKey = 'name' | 'modified' | 'size';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>, HTMLAttributes<HTMLDivElement> {
		/** A static tree, from its top folder. */
		root?: FileNode;
		/** A folder's content, on demand. `null` is the top. Wins over `root`'s children. */
		load?: (folder: Folder) => FileNode[] | Promise<FileNode[]>;
		/** The top's name in the path and the tree, when there is no `root`. */
		rootLabel?: string;
		/** Show the folder tree. */
		tree?: boolean;
		/** The view it starts in. */
		view?: 'list' | 'grid';
		/** Your actions, in the toolbar. */
		toolbar?: Snippet<[{ folder: Folder; selection: FileNode[] }]>;
		/** The details pane, shown while something is selected. */
		details?: Snippet<[FileNode[]]>;
		/** The context menu's content. `close` closes it. */
		menu?: Snippet<[{ items: FileNode[]; close: () => void }]>;
		/** A node's icon, drawn by you. Wins over `icons` and `preview`. */
		icon?: Snippet<[FileNode]>;
		/**
		 * Icons by extension (`{ pdf: { glyph, color } }`), merged over the
		 * default table. `false` turns the table off: every file is a page.
		 */
		icons?: Record<string, FileIcon> | false;
		/**
		 * A picture for a file, or nothing. Defaults to the node's `thumbnail`,
		 * else its `url` when the extension is an image's. `false`: never.
		 */
		preview?: ((node: FileNode) => string | undefined) | false;
		/** Drawn in an empty folder. */
		empty?: Snippet<[Folder]>;
		/** A file was opened (double-click, Enter). */
		onopen?: (file: FileNode) => void;
		/** The selection changed. */
		onselection?: (items: FileNode[]) => void;
		/** Another folder is shown. */
		onnavigate?: (folder: Folder) => void;
		/** A drag starts. Return `false` to refuse it. */
		ondragitems?: (items: FileNode[], event: DragEvent) => boolean | void;
		/** Something was dropped on a folder (`null`: the top). */
		ondropitems?: (items: FileDrop, target: Folder, event: DragEvent) => void;
		/** The texts it writes. */
		labels?: Partial<typeof LABELS>;
		formatSize?: (bytes: number) => string;
		formatDate?: (date: Date) => string;
		class?: string;
	}

	const LABELS = {
		name: 'Name',
		modified: 'Modified',
		size: 'Size',
		list: 'List view',
		grid: 'Grid view',
		empty: 'This folder is empty',
		tree: 'Folders',
		path: 'Path',
		loading: 'Loading…'
	};

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		root,
		load: source,
		rootLabel = 'Files',
		tree = true,
		view: initialView = 'list',
		toolbar,
		details,
		menu,
		icon,
		icons = {},
		preview = defaultPreview,
		empty,
		onopen,
		onselection,
		onnavigate,
		ondragitems,
		ondropitems,
		labels = {},
		formatSize = defaultSize,
		formatDate = (d: Date) => d.toLocaleDateString(),
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
	let t = $derived({ ...LABELS, ...labels });

	let table = $derived(icons === false ? {} : { ...FILE_ICONS, ...icons });

	function defaultPreview(node: FileNode): string | undefined {
		if (typeof node.thumbnail === 'string') return node.thumbnail;
		if (typeof node.url === 'string' && IMAGE_EXTENSIONS.has(extensionOf(node.name))) return node.url;
		return undefined;
	}

	function defaultSize(n: number): string {
		const units = ['B', 'KB', 'MB', 'GB', 'TB'];
		let i = 0;
		while (n >= 1024 && i < units.length - 1) {
			n /= 1024;
			i++;
		}
		return `${i ? n.toFixed(n < 10 ? 1 : 0) : n} ${units[i]}`;
	}

	/* ── Loading ──────────────────────────────────────────────────────── */

	const TOP = '\u0000top';
	const keyOf = (f: Folder) => (f ? f.id : TOP);
	let top: Folder = $derived(root ?? null);

	/** Folder key → its content, once loaded. */
	const cache = new SvelteMap<string | number, FileNode[]>();
	const loading = new SvelteSet<string | number>();

	async function fetchFolder(folder: Folder, force = false) {
		const k = keyOf(folder);
		if ((cache.has(k) && !force) || loading.has(k)) return;
		if (!source && folder?.children) return void cache.set(k, folder.children);
		if (!source) return void cache.set(k, []);
		loading.add(k);
		try {
			cache.set(k, (await source(folder)) ?? []);
		} catch {
			cache.set(k, []);
		} finally {
			loading.delete(k);
		}
	}

	/** Reload a folder (the current one by default) after the app changed it. */
	export function refresh(folder?: Folder) {
		void fetchFolder(folder === undefined ? current : folder, true);
	}

	/* ── Where we are ─────────────────────────────────────────────────── */

	/** The folders from the top down to the current one (the top excluded). */
	let path: FileNode[] = $state([]);
	let current: Folder = $derived(path.length ? path[path.length - 1]! : top);

	const expanded = new SvelteSet<string | number>();

	$effect(() => {
		void fetchFolder(current);
	});

	/** Show a folder, given the folders leading to it from the top. */
	export function navigate(chain: FileNode[]) {
		path = chain.filter((f) => f !== top);
		for (const f of path) expanded.add(f.id);
		clearSelection();
		focusAt = -1;
		onnavigate?.(current);
	}

	function up() {
		if (path.length) navigate(path.slice(0, -1));
	}

	function toggleBranch(folder: FileNode) {
		if (expanded.has(folder.id)) expanded.delete(folder.id);
		else {
			expanded.add(folder.id);
			void fetchFolder(folder);
		}
	}

	/* ── The content, sorted ──────────────────────────────────────────── */

	/* Where it starts, read once: afterwards the toggle owns it. */
	let view = $state<'list' | 'grid'>(untrack(() => initialView));
	let sort = $state<{ key: SortKey; dir: 1 | -1 }>({ key: 'name', dir: 1 });

	let items = $derived.by(() => {
		const list = [...(cache.get(keyOf(current)) ?? [])];
		const { key, dir } = sort;
		const val = (n: FileNode) => (key === 'name' ? n.name.toLowerCase() : key === 'size' ? (n.size ?? -1) : (n.modified?.getTime() ?? 0));
		return list.sort((a, b) => {
			if (a.kind !== b.kind) return a.kind === 'folder' ? -1 : 1;
			const x = val(a);
			const y = val(b);
			return (x < y ? -1 : x > y ? 1 : 0) * dir;
		});
	});

	function sortBy(key: SortKey) {
		sort = sort.key === key ? { key, dir: sort.dir === 1 ? -1 : 1 } : { key, dir: 1 };
	}

	/* ── Selection ────────────────────────────────────────────────────── */

	const selected = new SvelteSet<string | number>();
	let anchor = -1;
	let focusAt = $state(-1);

	let selection = $derived(items.filter((n) => selected.has(n.id)));

	function changed() {
		onselection?.(items.filter((n) => selected.has(n.id)));
	}

	function clearSelection() {
		if (!selected.size) return;
		selected.clear();
		changed();
	}

	export function getSelection(): FileNode[] {
		return selection;
	}

	function selectAt(i: number, e: { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }) {
		const node = items[i];
		if (!node) return;
		if (e.shiftKey && anchor >= 0) {
			if (!(e.ctrlKey || e.metaKey)) selected.clear();
			const [a, b] = anchor < i ? [anchor, i] : [i, anchor];
			for (let n = a; n <= b; n++) selected.add(items[n]!.id);
		} else if (e.ctrlKey || e.metaKey) {
			if (selected.has(node.id)) selected.delete(node.id);
			else selected.add(node.id);
			anchor = i;
		} else {
			selected.clear();
			selected.add(node.id);
			anchor = i;
		}
		focusAt = i;
		changed();
	}

	function open(node: FileNode) {
		if (node.kind === 'folder') navigate([...path, node]);
		else onopen?.(node);
	}

	/* ── Keyboard ─────────────────────────────────────────────────────── */

	let content: HTMLDivElement | undefined = $state();

	function columns(): number {
		if (view !== 'grid' || !content) return 1;
		const grid = content.querySelector('.file-explorer-grid');
		return grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').length : 1;
	}

	function keydown(e: KeyboardEvent) {
		const n = items.length;
		const step = { ArrowDown: columns(), ArrowUp: -columns(), ArrowRight: view === 'grid' ? 1 : 0, ArrowLeft: view === 'grid' ? -1 : 0 }[e.key];
		if (step) {
			e.preventDefault();
			const next = Math.min(n - 1, Math.max(0, (focusAt < 0 ? -1 : focusAt) + step));
			selectAt(next, { ctrlKey: false, metaKey: false, shiftKey: e.shiftKey });
			content?.querySelector(`[data-index="${next}"]`)?.scrollIntoView({ block: 'nearest' });
		} else if (e.key === 'Enter' && focusAt >= 0) {
			e.preventDefault();
			open(items[focusAt]!);
		} else if (e.key === 'Backspace') {
			e.preventDefault();
			up();
		} else if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			for (const node of items) selected.add(node.id);
			changed();
		} else if (e.key === 'Escape') {
			clearSelection();
		}
	}

	/* ── Context menu ─────────────────────────────────────────────────── */

	let menuAt = $state<{ x: number; y: number } | null>(null);
	let menuItems: FileNode[] = $state([]);
	let menuBox: HTMLDivElement | undefined = $state();

	function contextmenu(e: MouseEvent, i: number) {
		if (!menu) return;
		e.preventDefault();
		if (!selected.has(items[i]!.id)) selectAt(i, { ctrlKey: false, metaKey: false, shiftKey: false });
		menuItems = items.filter((n) => selected.has(n.id));
		menuAt = { x: e.clientX, y: e.clientY };
	}

	const closeMenu = () => (menuAt = null);

	$effect(() => {
		if (!menuAt) return;
		const away = (e: Event) => {
			if (!menuBox?.contains(e.target as Node)) closeMenu();
		};
		const esc = (e: KeyboardEvent) => e.key === 'Escape' && closeMenu();
		window.addEventListener('pointerdown', away, true);
		window.addEventListener('keydown', esc);
		window.addEventListener('scroll', closeMenu, true);
		return () => {
			window.removeEventListener('pointerdown', away, true);
			window.removeEventListener('keydown', esc);
			window.removeEventListener('scroll', closeMenu, true);
		};
	});

	/* Kept inside the viewport once its size is known. */
	let menuStyle = $derived.by(() => {
		if (!menuAt) return '';
		const w = menuBox?.offsetWidth ?? 0;
		const h = menuBox?.offsetHeight ?? 0;
		const x = Math.min(menuAt.x, (typeof innerWidth === 'number' ? innerWidth : 1e4) - w - 4);
		const y = Math.min(menuAt.y, (typeof innerHeight === 'number' ? innerHeight : 1e4) - h - 4);
		return `left: ${Math.max(4, x)}px; top: ${Math.max(4, y)}px;`;
	});

	/* ── Drag and drop ────────────────────────────────────────────────── */

	let dragging: FileNode[] | null = null;
	let dropKey = $state<string | number | null>(null);

	function dragstart(e: DragEvent, i: number) {
		if (!selected.has(items[i]!.id)) selectAt(i, { ctrlKey: false, metaKey: false, shiftKey: false });
		const moving = items.filter((n) => selected.has(n.id));
		if (ondragitems?.(moving, e) === false) return e.preventDefault();
		dragging = moving;
		e.dataTransfer?.setData('text/plain', moving.map((n) => n.name).join('\n'));
		if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
	}

	function dragend() {
		dragging = null;
		dropKey = null;
	}

	function accepts(target: Folder, e: DragEvent): boolean {
		if (!ondropitems) return false;
		if (dragging) return !dragging.some((n) => n.id === target?.id) && !(target === current && dragging.every((n) => items.includes(n)));
		return !!e.dataTransfer?.types.includes('Files');
	}

	function dragover(e: DragEvent, target: Folder) {
		if (!accepts(target, e)) return;
		e.preventDefault();
		e.stopPropagation();
		dropKey = keyOf(target);
	}

	function dragleave(e: DragEvent, target: Folder) {
		if (dropKey === keyOf(target) && !(e.currentTarget as Element).contains(e.relatedTarget as Node)) dropKey = null;
	}

	function drop(e: DragEvent, target: Folder) {
		if (!accepts(target, e)) return;
		e.preventDefault();
		e.stopPropagation();
		const what: FileDrop = dragging ?? [...(e.dataTransfer?.files ?? [])];
		dragging = null;
		dropKey = null;
		ondropitems?.(what, target, e);
	}

	/** The handlers that make an element a drop target for `target`. */
	const target = (f: Folder) => ({
		ondragover: (e: DragEvent) => dragover(e, f),
		ondragleave: (e: DragEvent) => dragleave(e, f),
		ondrop: (e: DragEvent) => drop(e, f),
		'data-drop': dropKey !== null && dropKey === keyOf(f) ? '' : undefined
	});

	let showDetails = $derived(!!details && selection.length > 0);
</script>

{#snippet nodeIcon(node: FileNode)}
	{@const picture = !icon && node.kind === 'file' && preview ? preview(node) : undefined}
	{@const fileIcon = node.kind === 'file' ? table[extensionOf(node.name)] : undefined}
	<span
		class="file-explorer-icon"
		data-kind={node.kind}
		data-preview={picture ? '' : undefined}
		style:--file-explorer-icon-color={fileIcon?.color}
		aria-hidden="true"
	>
		{#if icon}
			{@render icon(node)}
		{:else if picture}
			<img class="file-explorer-thumb" src={picture} alt="" loading="lazy" decoding="async" />
		{:else if fileIcon}
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">{@html (fileIcon.bare ? '' : PAGE) + fileIcon.glyph}</svg>
		{:else if node.kind === 'folder'}
			<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4.38a1.5 1.5 0 0 1 1.06.44L11.5 7h8a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z" /></svg>
		{:else}
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M6 3h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v4h4" /></svg>
		{/if}
	</span>
{/snippet}

{#snippet branch(nodes: FileNode[], chain: FileNode[])}
	<ul role="group">
		{#each nodes.filter((n) => n.kind === 'folder') as folder (folder.id)}
			{@const open_ = expanded.has(folder.id)}
			{@const known = cache.get(folder.id)}
			{@const leaf = known !== undefined && !known.some((n) => n.kind === 'folder')}
			<li role="treeitem" aria-expanded={leaf ? undefined : open_} aria-selected={current === folder}>
				<button
					type="button"
					class="file-explorer-tree-item"
					aria-current={current === folder}
					onclick={(e) => {
						// The chevron expands; the rest of the row shows the folder.
						if ((e.target as Element).closest('.file-explorer-twisty')) toggleBranch(folder);
						else navigate([...chain, folder]);
					}}
					{...target(folder)}
				>
					<span class="file-explorer-twisty" data-leaf={leaf ? '' : undefined}></span>
					{@render nodeIcon(folder)}
					<span>{folder.name}</span>
				</button>
				{#if open_ && known}
					{@render branch(known, [...chain, folder])}
				{/if}
			</li>
		{/each}
	</ul>
{/snippet}

<div {...applied.rest} class={classes}>
	<div class="file-explorer-toolbar">
		<Breadcrumbs class="file-explorer-path" aria-label={t.path}>
			<li>
				<button type="button" onclick={() => navigate([])} {...target(top)}>{top?.name ?? rootLabel}</button>
			</li>
			{#each path as f, i (f.id)}
				<li><button type="button" onclick={() => navigate(path.slice(0, i + 1))} {...target(f)}>{f.name}</button></li>
			{/each}
		</Breadcrumbs>
		{#if toolbar}<div class="file-explorer-actions">{@render toolbar({ folder: current, selection })}</div>{/if}
		<div class="file-explorer-views" role="group">
			<button type="button" class="file-explorer-view" aria-pressed={view === 'list'} aria-label={t.list} title={t.list} onclick={() => (view = 'list')}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" /></svg>
			</button>
			<button type="button" class="file-explorer-view" aria-pressed={view === 'grid'} aria-label={t.grid} title={t.grid} onclick={() => (view = 'grid')}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" /></svg>
			</button>
		</div>
	</div>

	<div class="file-explorer-main">
		{#if tree}
			<nav class="file-explorer-tree" aria-label={t.tree}>
				<ul role="tree" aria-label={t.tree}>
					<li role="treeitem" aria-expanded="true" aria-selected={current === top}>
						<button type="button" class="file-explorer-tree-item" aria-current={current === top} onclick={() => navigate([])} {...target(top)}>
							<span class="file-explorer-twisty" data-leaf=""></span>
							{@render nodeIcon({ id: TOP, name: top?.name ?? rootLabel, kind: 'folder' })}
							<span>{top?.name ?? rootLabel}</span>
						</button>
						{@render branch(cache.get(keyOf(top)) ?? [], [])}
					</li>
				</ul>
			</nav>
		{/if}

		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			bind:this={content}
			class="file-explorer-content"
			role="listbox"
			aria-multiselectable="true"
			aria-label={current?.name ?? rootLabel}
			tabindex="0"
			aria-activedescendant={focusAt >= 0 ? `${PREFIX}-${String(items[focusAt]?.id)}` : undefined}
			onkeydown={keydown}
			onclick={(e) => {
				if (e.target === e.currentTarget || (e.target as Element).classList.contains('file-explorer-grid')) clearSelection();
			}}
			{...target(current)}
		>
			{#if loading.has(keyOf(current)) && !cache.has(keyOf(current))}
				<div class="file-explorer-empty">{t.loading}</div>
			{:else if !items.length}
				<div class="file-explorer-empty">
					{#if empty}{@render empty(current)}{:else}{t.empty}{/if}
				</div>
			{:else if view === 'list'}
				<table class="file-explorer-table" role="presentation">
					<thead>
						<tr>
							{#each [['name', t.name], ['modified', t.modified], ['size', t.size]] as [k, text] (k)}
								<th aria-sort={sort.key === k ? (sort.dir === 1 ? 'ascending' : 'descending') : undefined}>
									<button type="button" onclick={() => sortBy(k as SortKey)}>
										{text}{sort.key === k ? (sort.dir === 1 ? ' ↑' : ' ↓') : ''}
									</button>
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each items as node, i (node.id)}
							<tr
								id="{PREFIX}-{String(node.id)}"
								class="file-explorer-item"
								role="option"
								aria-selected={selected.has(node.id)}
								data-index={i}
								data-focus={focusAt === i ? '' : undefined}
								draggable="true"
								onclick={(e) => selectAt(i, e)}
								ondblclick={() => open(node)}
								oncontextmenu={(e) => contextmenu(e, i)}
								ondragstart={(e) => dragstart(e, i)}
								ondragend={dragend}
								{...node.kind === 'folder' ? target(node) : {}}
							>
								<td>
									<span class="file-explorer-entry">
										{@render nodeIcon(node)}
										<span class="file-explorer-name">{node.name}</span>
									</span>
								</td>
								<td class="file-explorer-meta">{node.modified ? formatDate(node.modified) : '—'}</td>
								<td class="file-explorer-meta">{node.kind === 'file' && node.size !== undefined ? formatSize(node.size) : '—'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{:else}
				<ul class="file-explorer-grid" role="presentation">
					{#each items as node, i (node.id)}
						<li
							id="{PREFIX}-{String(node.id)}"
							class="file-explorer-item"
							role="option"
							aria-selected={selected.has(node.id)}
							data-index={i}
							data-focus={focusAt === i ? '' : undefined}
							draggable="true"
							title={node.name}
							onclick={(e) => selectAt(i, e)}
							ondblclick={() => open(node)}
							oncontextmenu={(e) => contextmenu(e, i)}
							ondragstart={(e) => dragstart(e, i)}
							ondragend={dragend}
							{...node.kind === 'folder' ? target(node) : {}}
						>
							{@render nodeIcon(node)}
							<span class="file-explorer-name">{node.name}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		{#if showDetails}
			<aside class="file-explorer-details">{@render details!(selection)}</aside>
		{/if}
	</div>

	{#if menuAt && menu}
		<div bind:this={menuBox} class="file-explorer-menu" role="menu" style={menuStyle}>
			{@render menu({ items: menuItems, close: closeMenu })}
		</div>
	{/if}
</div>
