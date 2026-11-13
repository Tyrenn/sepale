<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['sidebar'],
		description:
			"An app's side column — a brand, a menu, an account — that folds to a rail. In the flow, unlike a Drawer: the page beside it narrows or widens, it is never covered. This app's own navigation is one.",
		classes: {
			sidebar: 'The column, at --sidebar-width.',
			'sidebar-collapsed': 'Folded to --sidebar-rail: only the head\'s toggle stays, the rest fades out.',
			'sidebar-end': 'On the end side of the page.',
			'sidebar-head': 'The top row: a brand, then the toggle.',
			'sidebar-body': 'The scrolling middle: usually a .menu.',
			'sidebar-foot': 'The bottom row.',
			'sidebar-toggle': 'The fold button.',
			'sidebar-keep': 'A head child kept on the rail (a logo).',
			'sidebar-layout': 'Optional: the full-height row of the sidebar and the page beside it.'
		},
		props: {
			Sidebar: [
				{ name: 'collapsed', type: 'boolean', default: 'false', description: 'Folded to a rail. Bindable.' },
				{ name: 'head / foot', type: 'Snippet<[{ collapsed }]>', description: 'The top and bottom rows; the toggle follows head.' },
				{ name: 'children', type: 'Snippet<[{ collapsed }]>', description: 'The body: usually a Menu.' },
				{ name: 'side', type: "'end'", description: 'On the end side.' },
				{ name: 'noToggle', type: 'boolean', default: 'false', description: 'No toggle: fold it some other way.' },
				{ name: 'toggleLabel', type: '{ open, collapsed }', description: "The toggle's accessible names." },
				{ name: 'oncollapsed', type: '(collapsed) => void', description: 'After every fold.' },
				{ name: 'toggle(value?)', type: 'method', description: 'Through bind:this.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Avatar, Menu, Sidebar } from '$lib/index.js';

	let collapsed = $state(false);
	const ITEMS = [
		{ label: 'Dashboard', active: true },
		{ label: 'Orders' },
		{ label: 'Catalogue', items: [{ label: 'Products' }, { label: 'Collections' }, { label: 'Stock' }] },
		{ divider: true },
		{ label: 'Settings' }
	];
</script>

<Section
	title="App column"
	subtitle="The toggle folds it to a rail; the page beside it takes the room."
	svelte={`<div class="sidebar-layout">
  <Sidebar bind:collapsed>
    {#snippet head()}<strong>Orbit</strong>{/snippet}
    <Menu items={ITEMS} />
    {#snippet foot()}<Avatar size="sm">AL</Avatar> Alex{/snippet}
  </Sidebar>
  <main>…</main>
</div>`}
	html={`<div class="sidebar-layout">
  <aside class="sidebar">
    <div class="sidebar-head"><strong>Orbit</strong><button class="sidebar-toggle" aria-expanded="true">…</button></div>
    <div class="sidebar-body"><ul class="menu">…</ul></div>
    <div class="sidebar-foot">…</div>
  </aside>
  <main>…</main>
</div>`}
>
	<div class="sidebar-layout" style="height:22rem; width:100%; border-radius:1rem; box-shadow:0 0 0 1px var(--pv-line)">
		<Sidebar bind:collapsed>
			{#snippet head()}<strong style="font-size:1.1em">Orbit</strong>{/snippet}
			<Menu items={ITEMS} style="width:100%" />
			{#snippet foot()}<Avatar size="sm">AL</Avatar> <span>Alex Laurent</span>{/snippet}
		</Sidebar>
		<main style="padding:1.5rem">
			<strong>The page</strong>
			<p>It narrows and widens with the sidebar: {collapsed ? 'folded' : 'open'}.</p>
		</main>
	</div>
</Section>
