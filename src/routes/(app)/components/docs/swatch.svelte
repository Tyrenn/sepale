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
		namespaces: ["swatch"],
		description:
			"A sample of one colour, passed in as --swatch-color. The colour is data written at the call site, never a theme value.",
		classes: {},
		props: {
			Swatch: [
				{
					name: "sample",
					type: "string",
					description: "The colour to show. It is DATA, not a theme value, so it is written here at the call site and never by the family."
				},
				{
					name: "active",
					type: "boolean",
					default: "false",
					description: "Mark it as the chosen one."
				},
				{
					name: "disabled",
					type: "boolean",
					default: "false",
					description: "Grey it out. `.swatch` may be a span, which cannot carry `disabled`."
				}
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import {
		Swatch
	} from '$lib/index.js';

	const COLORS = [
		'primary',
		'secondary',
		'accent',
		'neutral',
		'info',
		'success',
		'warning',
		'error'
	] as const;

	const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
</script>

	<Section
		title="Swatch"
		subtitle="A sample of one colour. The colour is data, so it is written at the call site."
		svelte={`<Swatch sample="#1677ff" />
<Swatch sample="#ffdc58">A</Swatch>
<Swatch sample="#171717" shape="circle">B</Swatch>`}
	>
		<Swatch sample="#1677ff" />
		<Swatch sample="#ffdc58">A</Swatch>
		<Swatch sample="#171717" shape="circle">B</Swatch>
	</Section>

	<Section
		title="On-colour"
		subtitle="What is written on the sample is derived from it, so a letter stays legible on a colour nobody knew at authoring time."
		svelte={`<Swatch sample="#fafafa">A</Swatch>
<Swatch sample="#7c3aed">A</Swatch>`}
	>
		<Swatch sample="#fafafa">A</Swatch>
		<Swatch sample="#4ade80">A</Swatch>
		<Swatch sample="#7dd3fc">A</Swatch>
		<Swatch sample="#7c3aed">A</Swatch>
		<Swatch sample="#171717">A</Swatch>
	</Section>

	<Section
		title="Transparency and selection"
		subtitle="A transparent sample shows the checkerboard; `active` marks the chosen one."
		svelte={`<Swatch sample="#0000" />
<Swatch sample="#1677ff80" />
<Swatch sample="#4ade80" active />`}
	>
		<Swatch sample="#0000" />
		<Swatch sample="#1677ff80" />
		<Swatch sample="#4ade80" active />
		<Swatch sample="#4ade80" disabled />
	</Section>

	<Section
		title="Semantic colours"
		subtitle="The family declares one class per colour it names, so a swatch can point at the theme instead of a literal."
		svelte={`<Swatch color="primary" />
<Swatch color="success" />
<Swatch color="error" />`}
	>
		{#each COLORS as c (c)}<Swatch color={c} />{/each}
	</Section>

	<Section title="Sizes" svelte={`<Swatch size="xs" />
<Swatch size="xl" />`}>
		{#each SIZES as sz (sz)}<Swatch size={sz} sample="#f87171" />{/each}
	</Section>
