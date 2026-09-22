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
		namespaces: ["label"],
		description:
			"Inline text naming a control — on its own, or inside a field as a prefix or a suffix (.input > .label). The label that floats into a field's frame is floating-label, a different component (ADR 0009).",
		classes: {},
		props: {}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Label, Checkbox } from '$lib/index.js';
</script>

<Section
	title="Naming a control"
	subtitle="On its own, next to what it names. Wrapping the control makes the label clickable."
	html={`<label class="label">
	<input type="checkbox" class="checkbox" />
	Remember me
</label>`}
	svelte={`<Label>
	<Checkbox />
	Remember me
</Label>`}
>
	<Label>
		<Checkbox />
		Remember me
	</Label>
</Section>

<Section
	title="Inside a field"
	subtitle="A label inside an .input becomes a prefix or a suffix, separated by an inline divider."
	html={`<label class="input">
	<span class="label">https://</span>
	<input placeholder="your-site.com" />
</label>

<label class="input">
	<input placeholder="Amount" />
	<span class="label">EUR</span>
</label>`}
>
	<label class="input" style="width:15rem;">
		<span class="label">https://</span>
		<input placeholder="your-site.com" />
	</label>
	<label class="input" style="width:15rem;">
		<input placeholder="Amount" />
		<span class="label">EUR</span>
	</label>
</Section>
