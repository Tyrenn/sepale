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
		namespaces: ["textarea"],
		description:
			"A multi-line field. Same frame as the input, free to grow.",
		classes: {},
		props: {
			Textarea: [
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
		Textarea
	} from '$lib/index.js';
</script>

	<Section
		title="Default"
		svelte={`<Textarea placeholder="Default textarea" />`}
		html={`<textarea class="textarea" placeholder="Default textarea"></textarea>`}
	>
		<Textarea placeholder="Default textarea" />
	</Section>

	<Section
		title="Colors"
		svelte={`<Textarea color="primary" placeholder="Primary" />
<Textarea color="success" placeholder="Success" />
<Textarea color="error" placeholder="Error" />`}
		html={`<textarea class="textarea textarea-primary" placeholder="Primary"></textarea>
<textarea class="textarea textarea-success" placeholder="Success"></textarea>
<textarea class="textarea textarea-error" placeholder="Error"></textarea>`}
	>
		<Textarea color="primary" placeholder="Primary" />
		<Textarea color="success" placeholder="Success" />
		<Textarea color="error" placeholder="Error" />
	</Section>
