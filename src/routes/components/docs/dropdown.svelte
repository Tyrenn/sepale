<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['dropdown'],
		description:
			'A trigger and a box that floats next to it — a menu, a filter, a small form. The Svelte component places the box in fixed coordinates, so no scrolling ancestor crops it, and flips it when there is no room.',
		classes: {
			'dropdown-content': 'The floating box.',
			'dropdown-open': 'Shows the box. Written by the component; a <details open> or focus inside does the same without a script.',
			'dropdown-fixed': 'The box is placed in fixed coordinates by a script, and only shown when open.'
		},
		props: {
			Dropdown: [
				{ name: 'open', type: 'boolean', default: 'false', description: 'Whether the box is shown. Bindable.' },
				{ name: 'trigger', type: 'Snippet<[{ open, toggle, props }]>', description: 'The element that opens it. Spread `props` on your button: it carries the click and the ARIA state.' },
				{ name: 'children', type: 'Snippet<[{ close }]>', description: 'The box’s content. It closes on Escape and on a press outside — a click inside is the content’s to decide, with `close`.' },
				{ name: 'animated', type: 'boolean', default: 'true', description: 'Animate the box. The CSS never does; reduced motion is honoured.' },
				{ name: 'ontoggle', type: '(open: boolean) => void', description: 'After every change of `open`.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Button, Dropdown, Menu, Toggle } from '$lib/index.js';

	let chosen = $state('Newest');
</script>

<Section
	title="A menu"
	subtitle="The content gets close: a pick closes the box."
	svelte={`<Dropdown>
	{#snippet trigger({ props })}
		<Button {...props}>Sort: {chosen}</Button>
	{/snippet}
	{#snippet children({ close })}
		<Menu items={[{ label: 'Newest' }, { label: 'Oldest' }, { label: 'Name' }]}
			onselect={(item) => { chosen = item.label; close(); }} />
	{/snippet}
</Dropdown>`}
	html={`<details class="dropdown">
	<summary class="btn">Sort</summary>
	<div class="dropdown-content">
		<ul class="menu">
			<li><button>Newest</button></li>
			<li><button>Oldest</button></li>
		</ul>
	</div>
</details>`}
>
	<Dropdown>
		{#snippet trigger({ props })}
			<Button {...props}>Sort: {chosen}</Button>
		{/snippet}
		{#snippet children({ close })}
			<Menu
				items={[{ label: 'Newest' }, { label: 'Oldest' }, { label: 'Name' }]}
				onselect={(item) => {
					chosen = String(item.label);
					close();
				}}
			/>
		{/snippet}
	</Dropdown>
</Section>

<Section
	title="Sides and alignment"
	subtitle="side picks where the box opens, align where it lines up. With no room on that side, it flips."
	svelte={`<Dropdown side="top" align="end">…</Dropdown>
<Dropdown side="right">…</Dropdown>`}
>
	{#each [['bottom', 'end'], ['top', undefined], ['right', undefined], ['left', 'end']] as [side, align] (side)}
		<Dropdown side={side as 'top'} align={align as 'end'}>
			{#snippet trigger({ props })}
				<Button {...props} variant="outline">{side}{align ? ` · ${align}` : ''}</Button>
			{/snippet}
			{#snippet children()}
				<div style="padding:.75em; display:flex; flex-direction:column; gap:.5em;">
					<label style="display:flex; gap:.5em; align-items:center;"><Toggle checked /> Notifications</label>
					<label style="display:flex; gap:.5em; align-items:center;"><Toggle /> Weekly digest</label>
				</div>
			{/snippet}
		</Dropdown>
	{/each}
</Section>
