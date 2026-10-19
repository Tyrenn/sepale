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
		namespaces: ["fieldset"],
		description:
			"A group of related fields with a legend. It is the frame around a form section, not a field itself.",
		classes: {
			"fieldset-legend": "The group's heading.",
			"fieldset-label": "A caption under the group, for a hint or an error."
		},
		props: {
			Fieldset: [
				{
					name: "legend",
					type: "string | Snippet",
					description: "The group's heading."
				},
				{
					name: "label",
					type: "string | Snippet",
					description: "A note under the group."
				}
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Input } from '$lib/index.js';
</script>

<Section
	title="A group of fields"
	subtitle="The legend names the group; the label under it carries a hint or an error."
	html={`<fieldset class="fieldset">
	<legend class="fieldset-legend">Shipping</legend>
	<input class="input" placeholder="Street" />
	<input class="input" placeholder="City" />
	<p class="fieldset-label">We only ship within the EU.</p>
</fieldset>`}
	svelte={`<Fieldset legend="Shipping" label="We only ship within the EU.">
	<Input placeholder="Street" />
	<Input placeholder="City" />
</Fieldset>`}
>
	<fieldset class="fieldset" style="width:20rem;">
		<legend class="fieldset-legend">Shipping</legend>
		<Input placeholder="Street" />
		<Input placeholder="City" />
		<p class="fieldset-label">We only ship within the EU.</p>
	</fieldset>
</Section>
