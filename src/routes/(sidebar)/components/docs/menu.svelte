<script module lang="ts">
	/**
	 * The hand-written half of this page: what the component is, what each
	 * of its classes does, and what its props mean. WHICH classes exist is
	 * not written here — that is read back from the active family's compiled
	 * CSS (src/lib/generated/components.ts), so a page cannot claim a class
	 * the family does not ship.
	 *
	 * `namespaces` is the one piece of structure: it says which classes
	 * belong here. Nothing else can know that `.title` is part of `text`.
	 */
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ["menu"],
		description:
			"Navigation with one current item, optional section titles and optional nested groups. It owns its frame, unlike navbar and dock, which are placement only.",
		classes: {
			"menu-item": "One row. The component draws it as an <a> when the node has an href, a <button> otherwise.",
			"menu-active": "Where the visitor currently is.",
			"menu-disabled": "Unreachable, and drawn as such.",
			"menu-toggle": "A row that carries a nested group, and therefore opens it.",
			"menu-sub": "The nested group itself.",
			"menu-sub-closed": "Collapsed. The animation is in the CSS; the component only swaps the class.",
			"menu-title": "A section heading between two groups. An empty <li> is a divider."
		},
		props: {
			Menu: [
				{
					name: "items",
					type: "MenuNode[]",
					default: "[]",
					description: "The rows, nested as deep as needed. A node's `label` and `title` take a snippet as readily as a string, for the one row that differs."
				},
				{
					name: "row",
					type: "Snippet<[MenuNode]>",
					description: "How to draw the inside of every row. Written once for the whole menu; a node whose own `label` is a snippet skips it."
				},
				{
					name: "onpick",
					type: "(node: MenuNode) => void",
					description: "Called when a row without an href is chosen."
				}
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import {
		Badge,
		Menu,
		type MenuNode
	} from '$lib/index.js';

	const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

	const MENU: MenuNode[] = [
		{ title: 'Form' },
		{ label: 'Button', href: '#demo' },
		{ label: 'Input', href: '#demo', active: true },
		{ label: 'Select', href: '#demo', disabled: true },
		{ divider: true },
		{ title: 'Display' },
		{
			label: 'Feedback',
			items: [
				{ label: 'Progress', href: '#demo' },
				{ label: 'Loading', href: '#demo' }
			]
		}
	];
</script>

	<Section
		title="Menu"
		subtitle="Navigation: a section title, the current item, a divider and a nested group. The menu draws its own rows from the data."
		svelte={`<Menu items={[
	{ title: 'Form' },
	{ label: 'Button', href: '#demo' },
	{ label: 'Input', href: '#demo', active: true },
	{ label: 'Select', href: '#demo', disabled: true },
	{ divider: true },
	{ title: 'Display' },
	{ label: 'Feedback', items: [
		{ label: 'Progress', href: '#demo' },
		{ label: 'Loading', href: '#demo' }
	] }
]} />`}
		html={`<ul class="menu">
	<li class="menu-title">Form</li>
	<li><a class="menu-item" href="#demo">Button</a></li>
	<li><a class="menu-item menu-active" href="#demo">Input</a></li>
	<li><a class="menu-item menu-disabled" aria-disabled="true">Select</a></li>
	<li></li>
	<li class="menu-title">Display</li>
	<li>
		<button class="menu-item menu-toggle">Feedback</button>
		<ul class="menu-sub">
			<li><a class="menu-item" href="#demo">Progress</a></li>
			<li><a class="menu-item" href="#demo">Loading</a></li>
		</ul>
	</li>
</ul>`}
	>
		<Menu items={MENU} style="width:14rem;" />
	</Section>

	<Section
		title="A group that opens"
		subtitle="A row carrying items is its own toggle, and the height is animated in CSS. Click it."
		svelte={`<Menu items={[
	{ label: 'Navigation', open: false, items: [
		{ label: 'Breadcrumbs', href: '#demo' },
		{ label: 'Dock', href: '#demo' }
	] }
]} />`}
	>
		<Menu
			items={[
				{
					label: 'Navigation',
					open: false,
					items: [
						{ label: 'Breadcrumbs', href: '#demo' },
						{ label: 'Dock', href: '#demo' }
					]
				}
			]}
			style="width:14rem;"
		/>
	</Section>

	<Section title="Horizontal" svelte={`<Menu direction="horizontal" items={[
	{ label: 'Overview', href: '#demo', active: true },
	{ label: 'Settings', href: '#demo' }
]} />`}>
		<Menu
			direction="horizontal"
			items={[
				{ label: 'Overview', href: '#demo', active: true },
				{ label: 'Settings', href: '#demo' },
				{ label: 'Billing', href: '#demo' }
			]}
		/>
	</Section>

	<Section title="Sizes" svelte={`<Menu size="xs" items={…} />
<Menu size="lg" items={…} />`}>
		<div style="display:flex; gap:1rem; align-items:flex-start;">
			{#each SIZES as sz (sz)}
				<Menu
					size={sz}
					items={[
						{ label: sz, href: '#demo', active: true },
						{ label: 'item', href: '#demo' }
					]}
					style="width:7rem;"
				/>
			{/each}
		</div>
	</Section>

{#snippet counted(node: MenuNode)}
	<!-- Three children, not one wrapper: .menu-item is a grid whose columns
	     are max-content / auto / max-content, so an icon, a label and a
	     counter line up down the whole menu on their own. -->
	<span style="opacity:.5;">#</span>
	<span>{node.label}</span>
	<Badge>3</Badge>
{/snippet}

<Section
	title="A snippet for every row"
	subtitle="The data stays data; how a row is drawn is written once. The menu keeps the <li>, the <a> and their classes."
	svelte={`{#snippet row(node)}
	<span>#</span>
	<span>{node.label}</span>
	<Badge>3</Badge>
{/snippet}

<Menu items={channels} {row} />`}
>
	<Menu
		items={[
			{ label: 'general', href: '#demo', active: true },
			{ label: 'design', href: '#demo' },
			{ label: 'releases', href: '#demo' }
		]}
		row={counted}
		style="width:14rem;"
	/>
</Section>

<Section
	title="One row that differs"
	subtitle="A node whose label is a snippet draws itself, and skips the row snippet. Nine plain rows and one special one stay one array."
	svelte={`<Menu
	items={[
		{ label: 'Inbox', href: '#demo' },
		{ label: unread, href: '#demo' },
		{ label: 'Archive', href: '#demo' }
	]}
/>`}
>
	<Menu
		items={[
			{ label: 'Inbox', href: '#demo' },
			{ label: unreadLabel, href: '#demo' },
			{ label: 'Archive', href: '#demo' }
		]}
		style="width:14rem;"
	/>
</Section>

{#snippet unreadLabel()}
	<span>Unread</span>
	<Badge color="error" style="justify-self:end;">12</Badge>
{/snippet}
