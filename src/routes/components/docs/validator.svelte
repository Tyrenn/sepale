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
		namespaces: ["validator"],
		description:
			"Marks a field as validated: the field paints itself from its own :valid / :invalid state, and the hint appears only when it is wrong. No Svelte wrapper — it is a class on the field, plus the validator and hint props the field components carry.",
		classes: {
			"validator-hint": "The message shown when the field it follows is invalid."
		},
		props: {}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import {
		Input
	} from '$lib/index.js';
</script>

	<Section
		title="Email"
		subtitle="Pair a `.validator` input with a ValidatorHint shown when invalid."
		svelte={`<fieldset class="fieldset" style="width:20rem;">
	<legend class="fieldset-legend">Email</legend>
	<Input type="email" required class="validator" placeholder="name@example.com" />
	<p class="validator-hint">Enter a valid email address</p>
</fieldset>`}
		html={`<fieldset class="fieldset" style="width:20rem;">
	<legend class="fieldset-legend">Email</legend>
	<input type="email" required class="input validator" placeholder="name@example.com" />
	<p class="validator-hint">Enter a valid email address</p>
</fieldset>`}
	>
		<fieldset class="fieldset" style="width:20rem;">
			<legend class="fieldset-legend">Email</legend>
			<Input type="email" required class="validator" placeholder="name@example.com" />
			<p class="validator-hint">Enter a valid email address</p>
		</fieldset>
	</Section>
