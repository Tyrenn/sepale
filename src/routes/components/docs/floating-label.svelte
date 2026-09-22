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
		namespaces: ["floating-label"],
		description:
			"A container that wraps a field: its <span> sits over the frame and rises out of the way once the field has content. Unlike label, which sits inside a field, this one goes around it.",
		classes: {},
		props: {
			FloatingLabel: [
				{
					name: "label",
					type: "string",
					description: "The text that floats into the field's frame once it has content."
				}
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { FloatingLabel, Input, Textarea } from '$lib/index.js';
</script>

<Section
	title="A label that floats"
	subtitle="The text sits in the field while it is empty and rises into the frame once it has content. Type in it."
	html={`<label class="floating-label">
	<span>Email</span>
	<input class="input" placeholder="Email" />
</label>`}
	svelte={`<FloatingLabel label="Email">
	<Input placeholder="Email" />
</FloatingLabel>`}
>
	<FloatingLabel label="Email" style="width:15rem;">
		<Input type="email" placeholder="Email" />
	</FloatingLabel>
	<FloatingLabel label="Message" style="width:15rem;">
		<Textarea placeholder="Message" />
	</FloatingLabel>
</Section>

<Section
	title="It follows the field's size"
	subtitle="The floated text is sized from the field it wraps, not from the page."
	svelte={`<FloatingLabel label="Small">
	<Input size="sm" placeholder="Small" />
</FloatingLabel>`}
>
	<FloatingLabel label="Small" style="width:11rem;">
		<Input size="sm" placeholder="Small" />
	</FloatingLabel>
	<FloatingLabel label="Large" style="width:13rem;">
		<Input size="lg" placeholder="Large" />
	</FloatingLabel>
</Section>
