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
		namespaces: ["range"],
		description:
			"A value picked along a track, where the approximate position matters more than the number.",
		classes: {},
		props: {
			Range: [
				{
					name: "validator",
					type: "boolean",
					default: "false",
					description: "Colour the control by its own validity and reveal `hint` when invalid."
				},
				{
					name: "hint",
					type: "Snippet",
					description: "Shown below once invalid. It must be the control's next sibling for the CSS to reach it, which is why it is a prop rather than your markup."
				},
				{
					name: "value",
					type: "number",
					default: "$bindable(0)",
					description: "The position on the track. Bindable."
				}
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import {
		Range
	} from '$lib/index.js';
</script>

	<Section
		title="Default"
		svelte={`<Range value={40} />`}
		html={`<input type="range" class="range" value="40" />`}
	>
		<Range value={40} />
	</Section>

	<Section
		title="Colors"
		svelte={`<Range color="primary" value={60} />
<Range color="secondary" value={60} />
<Range color="accent" value={60} />`}
		html={`<input type="range" class="range range-primary" value="60" />
<input type="range" class="range range-secondary" value="60" />
<input type="range" class="range range-accent" value="60" />`}
	>
		<Range color="primary" value={60} />
		<Range color="secondary" value={60} />
		<Range color="accent" value={60} />
	</Section>
