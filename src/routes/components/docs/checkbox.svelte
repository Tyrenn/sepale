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
		namespaces: ["checkbox"],
		description:
			"An independent yes/no. Several checked at once is a legal state — that is what separates it from the radio.",
		classes: {},
		props: {
			Checkbox: [
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
		Checkbox
	} from '$lib/index.js';
</script>

	<Section
		title="Sizes"
		svelte={`<Checkbox size="xs" checked />
<Checkbox size="sm" checked />
<Checkbox checked />
<Checkbox size="lg" checked />`}
		html={`<input type="checkbox" checked class="checkbox checkbox-xs" />
<input type="checkbox" checked class="checkbox checkbox-sm" />
<input type="checkbox" checked class="checkbox" />
<input type="checkbox" checked class="checkbox checkbox-lg" />`}
	>
		<Checkbox size="xs" checked />
		<Checkbox size="sm" checked />
		<Checkbox checked />
		<Checkbox size="lg" checked />
	</Section>

	<Section
		title="Colors"
		svelte={`<Checkbox color="primary" checked />
<Checkbox color="secondary" checked />
<Checkbox color="accent" checked />
<Checkbox color="success" checked />
<Checkbox color="warning" checked />
<Checkbox color="error" checked />`}
		html={`<input type="checkbox" checked class="checkbox checkbox-primary" />
<input type="checkbox" checked class="checkbox checkbox-secondary" />
<input type="checkbox" checked class="checkbox checkbox-accent" />
<input type="checkbox" checked class="checkbox checkbox-success" />
<input type="checkbox" checked class="checkbox checkbox-warning" />
<input type="checkbox" checked class="checkbox checkbox-error" />`}
	>
		<Checkbox color="primary" checked />
		<Checkbox color="secondary" checked />
		<Checkbox color="accent" checked />
		<Checkbox color="success" checked />
		<Checkbox color="warning" checked />
		<Checkbox color="error" checked />
	</Section>

	<Section
		title="Variants"
		svelte={`<Checkbox variant="outline" color="primary" checked />
<Checkbox shape="square" color="accent" checked />
<Checkbox disabled checked />`}
		html={`<input type="checkbox" checked class="checkbox checkbox-outline checkbox-primary" />
<input type="checkbox" checked class="checkbox checkbox-square checkbox-accent" />
<input type="checkbox" disabled checked class="checkbox" />`}
	>
		<Checkbox variant="outline" color="primary" checked />
		<Checkbox shape="square" color="accent" checked />
		<Checkbox disabled checked />
	</Section>
