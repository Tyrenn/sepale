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
		namespaces: ["toggle"],
		description:
			"A switch that takes effect immediately, unlike a checkbox that waits for a submit.",
		classes: {},
		props: {
			Toggle: [
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
					name: "checked",
					type: "boolean",
					default: "$bindable(false)",
					description: "The state. Bindable."
				}
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import {
		Toggle
	} from '$lib/index.js';
</script>

	<Section
		title="Default"
		svelte={`<Toggle />
<Toggle checked />`}
		html={`<input type="checkbox" class="toggle" />
<input type="checkbox" class="toggle" checked />`}
	>
		<Toggle />
		<Toggle checked />
	</Section>

	<Section
		title="Colors"
		svelte={`<Toggle color="primary" checked />
<Toggle color="secondary" checked />
<Toggle color="accent" checked />
<Toggle color="success" checked />
<Toggle color="error" checked />`}
		html={`<input type="checkbox" class="toggle toggle-primary" checked />
<input type="checkbox" class="toggle toggle-secondary" checked />
<input type="checkbox" class="toggle toggle-accent" checked />
<input type="checkbox" class="toggle toggle-success" checked />
<input type="checkbox" class="toggle toggle-error" checked />`}
	>
		<Toggle color="primary" checked />
		<Toggle color="secondary" checked />
		<Toggle color="accent" checked />
		<Toggle color="success" checked />
		<Toggle color="error" checked />
	</Section>

	<Section
		title="Track variant"
		svelte={`<Toggle variant="track" color="primary" checked />
<Toggle variant="track" color="accent" checked />
<Toggle variant="track" color="success" checked />`}
		html={`<input type="checkbox" class="toggle toggle-track toggle-primary" checked />
<input type="checkbox" class="toggle toggle-track toggle-accent" checked />
<input type="checkbox" class="toggle toggle-track toggle-success" checked />`}
	>
		<Toggle variant="track" color="primary" checked />
		<Toggle variant="track" color="accent" checked />
		<Toggle variant="track" color="success" checked />
	</Section>
