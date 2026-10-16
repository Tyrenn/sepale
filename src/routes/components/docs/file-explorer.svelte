<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['file-explorer'],
		description:
			'Files and folders in a hierarchy, Drive-like: the folder tree, the current folder as a list or a grid, the details of the selection, under a toolbar with the path and your actions. Folders load lazily. Drag and drop — inside, or files from the system — is reported, never performed: the app moves, then refreshes.',
		classes: {
			'file-explorer': 'The frame; its height is --file-explorer-height.',
			'file-explorer-toolbar': 'Path, actions and the view toggle.',
			'file-explorer-path': 'The path, a .breadcrumbs.',
			'file-explorer-actions': 'Your toolbar snippet.',
			'file-explorer-views': 'The list / grid toggle.',
			'file-explorer-tree': 'The folder tree.',
			'file-explorer-tree-item': 'One folder in the tree; aria-current on the shown one.',
			'file-explorer-twisty': 'The chevron that expands a branch.',
			'file-explorer-content': 'The current folder; focusable, walked with the arrows.',
			'file-explorer-table': 'The list view, sortable by name, date and size.',
			'file-explorer-grid': 'The grid view.',
			'file-explorer-item': 'One file or folder; aria-selected, data-drop while a valid drop hovers it.',
			'file-explorer-icon': 'A node icon; data-kind="folder" takes the folder colour.',
			'file-explorer-details': 'The details pane, while something is selected.',
			'file-explorer-menu': 'The context menu.'
		},
		props: {
			FileExplorer: [
				{ name: 'root', type: 'FileNode', description: 'A static tree, from its top folder: { id, name, kind, size?, modified?, children? }.' },
				{ name: 'load', type: '(folder | null) => FileNode[] | Promise', description: "A folder's content on demand; null is the top." },
				{ name: 'rootLabel', type: 'string', default: "'Files'", description: "The top's name without a root." },
				{ name: 'tree', type: 'boolean', default: 'true', description: 'Show the folder tree.' },
				{ name: 'view', type: "'list' | 'grid'", default: "'list'", description: 'The view it starts in.' },
				{ name: 'toolbar', type: 'Snippet<[{ folder, selection }]>', description: 'Your actions.' },
				{ name: 'details', type: 'Snippet<[FileNode[]]>', description: 'The details pane.' },
				{ name: 'menu', type: 'Snippet<[{ items, close }]>', description: 'The context menu (right-click).' },
				{ name: 'icon / empty', type: 'Snippet', description: 'A node icon; an empty folder.' },
				{ name: 'onOpen / onSelect / onNavigate', type: 'callbacks', description: 'A file opened; the selection changed; another folder shown.' },
				{ name: 'onDrag', type: '(items, event) => boolean | void', description: 'A drag starts; false refuses it.' },
				{ name: 'onDrop', type: '(items | File[], target, event) => void', description: 'Something dropped on a folder (null: the top).' },
				{ name: 'labels / formatSize / formatDate', type: '', description: 'The texts and formats it writes.' },
				{ name: 'refresh(folder?) / navigate(chain) / getSelection()', type: 'methods', description: 'Through bind:this.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Button, FileExplorer, Menu, type FileNode } from '$lib/index.js';

	/* A fake drive: folders hold ids, loaded with a delay as a server would. */
	const day = (n: number) => new Date(2026, 9, n);
	const nodes = new Map<string | number, FileNode>();
	const content = new Map<string | number, (string | number)[]>();
	function put(parent: string | number, node: FileNode) {
		nodes.set(node.id, node);
		content.set(parent, [...(content.get(parent) ?? []), node.id]);
	}
	put('top', { id: 'docs', name: 'Documents', kind: 'folder', modified: day(3) });
	put('top', { id: 'pics', name: 'Pictures', kind: 'folder', modified: day(9) });
	put('top', { id: 'notes', name: 'notes.md', kind: 'file', size: 2_310, modified: day(14) });
	put('docs', { id: 'invoices', name: 'Invoices', kind: 'folder', modified: day(2) });
	put('docs', { id: 'cv', name: 'resume.pdf', kind: 'file', size: 184_220, modified: day(1) });
	put('docs', { id: 'plan', name: 'plan-2027.xlsx', kind: 'file', size: 48_900, modified: day(12) });
	put('invoices', { id: 'inv1', name: 'invoice-0193.pdf', kind: 'file', size: 92_004, modified: day(5) });
	put('pics', { id: 'p1', name: 'lake.jpg', kind: 'file', size: 3_402_118, modified: day(8) });
	put('pics', { id: 'p2', name: 'mountains.jpg', kind: 'file', size: 2_874_512, modified: day(8) });

	const load = (folder: FileNode | null) =>
		new Promise<FileNode[]>((ok) => setTimeout(() => ok((content.get(folder?.id ?? 'top') ?? []).map((id) => nodes.get(id)!)), 200));

	let explorer: FileExplorer | undefined = $state();
	let log = $state('—');

	function move(items: FileNode[] | File[], target: FileNode | null) {
		const to = target?.id ?? 'top';
		for (const item of items) {
			if (item instanceof File) {
				put(to, { id: `${Date.now()}-${item.name}`, name: item.name, kind: 'file', size: item.size, modified: new Date() });
				continue;
			}
			for (const [k, ids] of content) content.set(k, ids.filter((id) => id !== item.id));
			content.set(to, [...(content.get(to) ?? []), item.id]);
		}
		log = `dropped ${items.length} on ${target?.name ?? 'Files'}`;
		explorer?.refresh(null);
		for (const id of content.keys()) if (id !== 'top') explorer?.refresh(nodes.get(id));
	}
</script>

<Section
	title="Drive"
	subtitle="Double-click a folder, drag files onto a folder (or from your desktop), right-click for the menu, select to see the details."
	svelte={`<FileExplorer bind:this={explorer} load={load}
  onOpen={(f) => …} onDrop={(items, target) => { move(items, target); explorer.refresh(); }}>
  {#snippet toolbar()}<Button size="sm">New folder</Button>{/snippet}
  {#snippet details(items)}…{/snippet}
  {#snippet menu({ items, close })}<Menu items={…} onSelect={close} />{/snippet}
</FileExplorer>`}
	html={`<div class="file-explorer">
  <div class="file-explorer-toolbar">…</div>
  <div class="file-explorer-main">
    <nav class="file-explorer-tree">…</nav>
    <div class="file-explorer-content">
      <table class="file-explorer-table">…<tr class="file-explorer-item" aria-selected="true">…</tr></table>
    </div>
    <aside class="file-explorer-details">…</aside>
  </div>
</div>`}
>
	<div style="width:100%; display:grid; gap:.5em">
		<FileExplorer
			bind:this={explorer}
			load={load}
			onOpen={(f) => (log = `open ${f.name}`)}
			onNavigate={(f) => (log = `in ${f?.name ?? 'Files'}`)}
			onDrop={(items, target) => move(items, target)}
		>
			{#snippet toolbar()}
				<Button size="sm" onclick={() => (log = 'new folder…')}>New folder</Button>
			{/snippet}
			{#snippet details(items)}
				{#if items.length === 1}
					<strong>{items[0].name}</strong>
					<p style="margin:.5em 0 0; opacity:.7">{items[0].kind === 'folder' ? 'Folder' : `${items[0].size?.toLocaleString()} bytes`}</p>
					<p style="margin:.25em 0 0; opacity:.7">Modified {items[0].modified?.toLocaleDateString()}</p>
				{:else}
					<strong>{items.length} items selected</strong>
				{/if}
			{/snippet}
			{#snippet menu({ items, close })}
				<Menu
					items={[{ label: `Open ${items.length > 1 ? `${items.length} items` : items[0].name}` }, { label: 'Rename' }, { label: 'Delete' }]}
					onSelect={(n) => {
						log = `${n.label}`;
						close();
					}}
				/>
			{/snippet}
		</FileExplorer>
		<small>{log}</small>
	</div>
</Section>

<Section
	title="Grid, static tree, no tree pane"
	svelte={`<FileExplorer root={tree} tree={false} view="grid" />`}
	html={`<div class="file-explorer">… <ul class="file-explorer-grid"><li class="file-explorer-item">…</li></ul> …</div>`}
>
	<div style="width:100%">
		<FileExplorer
			tree={false}
			view="grid"
			style="--file-explorer-height: 18em"
			root={{
				id: 'r',
				name: 'Holiday',
				kind: 'folder',
				children: [
					{ id: 'a', name: 'Day 1', kind: 'folder', children: [{ id: 'a1', name: 'beach.jpg', kind: 'file', size: 2_100_000 }] },
					{ id: 'b', name: 'sunset.jpg', kind: 'file', size: 1_800_000 },
					{ id: 'c', name: 'a-file-with-a-rather-long-name.jpg', kind: 'file', size: 900_000 },
					{ id: 'd', name: 'map.pdf', kind: 'file', size: 320_000 }
				]
			}}
		/>
	</div>
</Section>
