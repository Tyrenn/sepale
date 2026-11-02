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
		namespaces: ["skeleton"],
		description:
			"The shape of content that has not arrived. It borrows the size of whatever it stands in for.",
		classes: {},
		props: {
			Skeleton: [
				{
					name: "lines",
					type: "number",
					default: "1",
					description: "Repeat the placeholder this many times, stacked."
				}
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import {
		Skeleton
	} from '$lib/index.js';
</script>

	<Section
		title="Line"
		svelte={`<Skeleton style="width:12rem; height:1rem; border-radius:4px" />`}
		html={`<div class="skeleton" style="width:12rem; height:1rem; border-radius:4px"></div>`}
	>
		<Skeleton style="width:12rem; height:1rem; border-radius:4px" />
	</Section>

	<Section
		title="Card"
		svelte={`<div style="display:flex; flex-direction:column; gap:0.5rem; width:14rem;">
	<Skeleton style="width:3rem; height:3rem; border-radius:9999px" />
	<Skeleton style="height:0.75rem; border-radius:4px" />
	<Skeleton style="height:0.75rem; width:80%; border-radius:4px" />
	<Skeleton style="height:0.75rem; width:65%; border-radius:4px" />
</div>`}
		html={`<div style="display:flex; flex-direction:column; gap:0.5rem; width:14rem;">
	<div class="skeleton" style="width:3rem; height:3rem; border-radius:9999px"></div>
	<div class="skeleton" style="height:0.75rem; border-radius:4px"></div>
	<div class="skeleton" style="height:0.75rem; width:80%; border-radius:4px"></div>
	<div class="skeleton" style="height:0.75rem; width:65%; border-radius:4px"></div>
</div>`}
	>
		<div style="display:flex; flex-direction:column; gap:0.5rem; width:14rem;">
			<Skeleton style="width:3rem; height:3rem; border-radius:9999px" />
			<Skeleton style="height:0.75rem; border-radius:4px" />
			<Skeleton style="height:0.75rem; width:80%; border-radius:4px" />
			<Skeleton style="height:0.75rem; width:65%; border-radius:4px" />
		</div>
	</Section>
