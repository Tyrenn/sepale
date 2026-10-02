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
		namespaces: ["input"],
		description:
			"A single-line field. The frame is a hole cut in the page: it sits on surface-1, not above it.",
		classes: {},
		props: {
			Input: [
				{
					name: "validator",
					type: "boolean",
					default: "false",
					description: "Colour the field by its own validity and reveal `hint` once the browser marks it invalid. The CSS drives this off `:user-invalid`, so it only fires after the visitor has actually had a go."
				},
				{
					name: "hint",
					type: "Snippet",
					description: "Shown under the field when it is invalid. It has to be the field's next sibling for the CSS to reach it, which is the whole reason this is a prop and not something you write yourself."
				},
				{
					name: "value",
					type: "string | number",
					default: "$bindable('')",
					description: "The field's text. Bindable."
				}
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import {
		Input
	} from '$lib/index.js';
</script>

	<Section
		title="Default"
		svelte={`<Input placeholder="Default input" />`}
		html={`<input type="text" class="input" placeholder="Default input" />`}
	>
		<Input placeholder="Default input" />
	</Section>

	<Section
		title="Sizes"
		svelte={`<Input size="xs" placeholder="xs" />
<Input size="sm" placeholder="sm" />
<Input placeholder="base" />
<Input size="lg" placeholder="lg" />`}
		html={`<input type="text" class="input input-xs" placeholder="xs" />
<input type="text" class="input input-sm" placeholder="sm" />
<input type="text" class="input" placeholder="base" />
<input type="text" class="input input-lg" placeholder="lg" />`}
	>
		<Input size="xs" placeholder="xs" />
		<Input size="sm" placeholder="sm" />
		<Input placeholder="base" />
		<Input size="lg" placeholder="lg" />
	</Section>

	<Section
		title="Colors"
		svelte={`<Input color="primary" placeholder="Primary" />
<Input color="success" placeholder="Success" />
<Input color="error" placeholder="Error" />`}
		html={`<input type="text" class="input input-primary" placeholder="Primary" />
<input type="text" class="input input-success" placeholder="Success" />
<input type="text" class="input input-error" placeholder="Error" />`}
	>
		<Input color="primary" placeholder="Primary" />
		<Input color="success" placeholder="Success" />
		<Input color="error" placeholder="Error" />
	</Section>

	<Section
		title="With inline label"
		subtitle="A composite that needs wrapper markup, so there's no single-component Svelte form."
		html={`<label class="input">
	<span class="label">https://</span>
	<input type="text" placeholder="example.com" />
</label>`}
	>
		<label class="input">
			<span class="label">https://</span>
			<input type="text" placeholder="example.com" />
		</label>
	</Section>
