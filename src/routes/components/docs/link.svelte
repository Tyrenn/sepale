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
		namespaces: ["link"],
		description:
			"Text that goes somewhere. One class on one <a>, with no structure to wrap, which is why there is no Svelte component for it.",
		classes: {
			link: 'Text that goes somewhere.',
			'link-hover': 'Underline on hover only, rather than always.',
			...Object.fromEntries(
				['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'].map(
					(color) => [`link-${color}`, `Draw the link in the ${color} colour.`]
				)
			)
		},
		props: {}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';

</script>

	<Section
		title="Default"
		html={`<a class="link" href="#demo">Default link</a>`}
	>
		<a class="link" href="#demo">Default link</a>
	</Section>

	<Section
		title="Colors"
		html={`<a class="link link-primary" href="#demo">Primary</a>
<a class="link link-secondary" href="#demo">Secondary</a>
<a class="link link-accent" href="#demo">Accent</a>
<a class="link link-success" href="#demo">Success</a>
<a class="link link-error" href="#demo">Error</a>`}
	>
		<a class="link link-primary" href="#demo">Primary</a>
		<a class="link link-secondary" href="#demo">Secondary</a>
		<a class="link link-accent" href="#demo">Accent</a>
		<a class="link link-success" href="#demo">Success</a>
		<a class="link link-error" href="#demo">Error</a>
	</Section>
