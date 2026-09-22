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
		namespaces: ["radio"],
		description:
			"One choice out of several. Exclusivity is the point; if two can be on, it is a checkbox.",
		classes: {},
		props: {
			Radio: [
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
					type: "string | number",
					description: "The value this radio contributes when it is the one selected."
				},
				{
					name: "group",
					type: "string | number",
					default: "$bindable()",
					description: "Bound across the whole set: it holds the selected value."
				}
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import {
		Radio
	} from '$lib/index.js';
</script>

	<Section
		title="Colors"
		svelte={`<Radio name="rc" color="primary" checked />
<Radio name="rc" color="secondary" checked />
<Radio name="rc" color="accent" checked />
<Radio name="rc" color="success" checked />
<Radio name="rc" color="error" checked />`}
		html={`<input type="radio" name="rc" class="radio radio-primary" checked />
<input type="radio" name="rc" class="radio radio-secondary" checked />
<input type="radio" name="rc" class="radio radio-accent" checked />
<input type="radio" name="rc" class="radio radio-success" checked />
<input type="radio" name="rc" class="radio radio-error" checked />`}
	>
		<Radio name="rc" color="primary" checked />
		<Radio name="rc" color="secondary" checked />
		<Radio name="rc" color="accent" checked />
		<Radio name="rc" color="success" checked />
		<Radio name="rc" color="error" checked />
	</Section>

	<Section
		title="Sizes"
		svelte={`<Radio name="rs" size="xs" checked />
<Radio name="rs" size="sm" checked />
<Radio name="rs" checked />
<Radio name="rs" size="lg" checked />`}
		html={`<input type="radio" name="rs" class="radio radio-xs" checked />
<input type="radio" name="rs" class="radio radio-sm" checked />
<input type="radio" name="rs" class="radio" checked />
<input type="radio" name="rs" class="radio radio-lg" checked />`}
	>
		<Radio name="rs" size="xs" checked />
		<Radio name="rs" size="sm" checked />
		<Radio name="rs" checked />
		<Radio name="rs" size="lg" checked />
	</Section>
