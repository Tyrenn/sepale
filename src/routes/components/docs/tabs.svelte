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
		namespaces: ["tabs"],
		description:
			"Switching which panel is visible. One namespace covers the strip and the tabs in it (ADR 0009): the strip is .tabs, a tab is .tabs-item.",
		classes: {
			"tabs-item": "One tab in the strip. The component draws it from the tabs data.",
			"tabs-item-active": "The selected tab. Written from the active index, alongside aria-selected.",
			"tabs-item-disabled": "Unreachable, and drawn as such.",
			"tabs-item-content": "The panel a tab reveals. It must follow its tab immediately — the CSS reaches it with +."
		},
		props: {
			Tabs: [
				{
					name: "tabs",
					type: "TabItem[]",
					default: "[]",
					description: "The tabs, in order. A tab's `label` takes a snippet as readily as a string, for the one tab that carries an icon or a count."
				},
				{
					name: "tab",
					type: "Snippet<[TabItem]>",
					description: "How to draw the inside of every tab. Written once for the whole strip; a tab whose own `label` is a snippet skips it."
				},
				{
					name: "active",
					type: "number",
					default: "$bindable(0)",
					description: "Index of the selected tab. Bindable, so a parent can drive it."
				},
				{
					name: "onselect",
					type: "(index: number) => void",
					description: "Called with the new index when a tab is chosen."
				}
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import {
		Badge,
		Tabs
	} from '$lib/index.js';

	const TABS = [{ label: 'Tab 1' }, { label: 'Tab 2' }, { label: 'Tab 3' }];
</script>

	<Section
		title="Border"
		svelte={`<Tabs variant="border" tabs={[{ label: 'Tab 1' }, { label: 'Tab 2' }, { label: 'Tab 3' }]} />`}
		html={`<div role="tablist" class="tabs tabs-border">
	<button role="tab" class="tabs-item tabs-item-active" aria-selected="true">Tab 1</button>
	<button role="tab" class="tabs-item">Tab 2</button>
	<button role="tab" class="tabs-item">Tab 3</button>
</div>`}
	>
		<Tabs variant="border" tabs={TABS} />
	</Section>

	<Section
		title="Box"
		svelte={`<Tabs variant="box" tabs={[{ label: 'Tab 1' }, { label: 'Tab 2' }, { label: 'Tab 3' }]} />`}
		html={`<div role="tablist" class="tabs tabs-box">
	<button role="tab" class="tabs-item tabs-item-active" aria-selected="true">Tab 1</button>
	<button role="tab" class="tabs-item">Tab 2</button>
	<button role="tab" class="tabs-item">Tab 3</button>
</div>`}
	>
		<Tabs variant="box" tabs={TABS} />
	</Section>

	{#snippet panelA()}<p style="padding:1rem;">The first panel.</p>{/snippet}
	{#snippet panelB()}<p style="padding:1rem;">The second panel.</p>{/snippet}
	{#snippet panelC()}<p style="padding:1rem;">The third panel.</p>{/snippet}

	<Section
		title="With panels"
		subtitle="A tab that carries content renders a .tabs-item-content right after itself — the CSS reveals the selected one."
		svelte={`<Tabs
	variant="lift"
	tabs={[
		{ label: 'Tab 1', content: panelA },
		{ label: 'Tab 2', content: panelB },
		{ label: 'Tab 3', content: panelC, disabled: true }
	]}
/>`}
	>
		<Tabs
			variant="lift"
			tabs={[
				{ label: 'Tab 1', content: panelA },
				{ label: 'Tab 2', content: panelB },
				{ label: 'Tab 3', content: panelC, disabled: true }
			]}
		/>
	</Section>

{#snippet withCount()}
	<span style="display:inline-flex; align-items:center; gap:.4em;">
		Issues
		<Badge>7</Badge>
	</span>
{/snippet}

<Section
	title="A tab that is not just text"
	subtitle="A label may be a snippet instead of a string. The strip still writes the button and its classes."
	svelte={`{#snippet withCount()}
	Issues <Badge>7</Badge>
{/snippet}

<Tabs
	variant="box"
	tabs={[{ label: 'Overview' }, { label: withCount }, { label: 'Settings' }]}
/>`}
>
	<Tabs
		variant="box"
		tabs={[{ label: 'Overview' }, { label: withCount }, { label: 'Settings' }]}
	/>
</Section>
