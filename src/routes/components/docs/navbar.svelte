<script module lang="ts">
	/**
	 * The hand-written half of this page: what the component is, what each
	 * of its classes does, and what its props mean. WHICH classes exist is
	 * not written here — that is read back from the compiled kit
	 * (src/lib/generated/classes.ts), so a page cannot claim a class the
	 * stylesheet does not have, and the build fails on a class no page
	 * describes.
	 *
	 * `namespaces` is the one piece of structure: it says which classes
	 * belong here. Nothing else can know that `.title` is part of `text`.
	 */
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ["navbar"],
		description:
			"A bar across the top. Placement only — what goes in it is a menu, or buttons.",
		classes: {},
		props: {
			Navbar: [
				{
					name: "sticky",
					type: "boolean",
					default: "false",
					description: "Let the bar follow the page instead of scrolling away."
				},
				{
					name: "start",
					type: "Snippet",
					description: "The three zones. start and end absorb the slack, so whatever is in center stays centred while either side grows."
				},
				{
					name: "center",
					type: "Snippet",
					description: "The middle zone."
				},
				{
					name: "end",
					type: "Snippet",
					description: "The trailing zone."
				}
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import {
		Button,
		Menu,
		Navbar
	} from '$lib/index.js';

	const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
</script>

	<Section
		title="Navbar"
		subtitle="A bar across the top. Placement only — what goes in it is a menu, or buttons."
		svelte={`<Navbar>
	{#snippet start()}<strong>u.u</strong>{/snippet}
	{#snippet center()}
		<Menu
			direction="horizontal"
			size="sm"
			items={[{ label: 'Overview', href: '#demo', active: true }, { label: 'Docs', href: '#demo' }]}
		/>
	{/snippet}
	{#snippet end()}<Button color="primary" size="sm">Sign in</Button>{/snippet}
</Navbar>`}
	>
		<Navbar>
			{#snippet start()}<strong>u.u</strong>{/snippet}
			{#snippet center()}
				<Menu
					direction="horizontal"
					size="sm"
					items={[{ label: 'Overview', href: '#demo', active: true }, { label: 'Docs', href: '#demo' }]}
				/>
			{/snippet}
			{#snippet end()}<Button color="primary" size="sm">Sign in</Button>{/snippet}
		</Navbar>
	</Section>

	<Section
		title="Zones are optional"
		subtitle="With no zone, the children simply lay out in a row."
		svelte={`<Navbar>
	<strong>u.u</strong>
	<Button variant="ghost" size="sm">Docs</Button>
</Navbar>`}
	>
		<Navbar>
			<strong>u.u</strong>
			<Button variant="ghost" size="sm">Docs</Button>
		</Navbar>
	</Section>

	<Section title="Sizes" svelte={`<Navbar size="xs">…</Navbar>
<Navbar size="lg">…</Navbar>`}>
		<div style="display:flex; flex-direction:column; gap:0.75rem; width:100%;">
			{#each SIZES as sz (sz)}
				<Navbar size={sz}>
					{#snippet start()}<strong>{sz}</strong>{/snippet}
					{#snippet end()}<Button size="sm">Action</Button>{/snippet}
				</Navbar>
			{/each}
		</div>
	</Section>
