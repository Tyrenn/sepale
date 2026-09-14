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
		namespaces: ["text", "title", "subtitle"],
		utility: true,
		description:
			"The typographic scale, delivered as classes. Not a component — no frame, no state, no variant, and no Svelte wrapper: write the class on your own element. It owns three namespaces for that reason (ADR 0009).",
		classes: {
			/* The scale is mechanical, so its prose is written the same way. */
			...Object.fromEntries(
				[1, 2, 3, 4].flatMap((size) =>
					[1, 2, 3].map((weight) => [
						`text-s${size}-b${weight}`,
						`Size step ${size}, weight ${weight}.`
					])
				)
			),
			title: "The page's one title.",
			"subtitle-s1": 'A subtitle, first step down from the title.',
			"subtitle-s2": 'A subtitle, second step down.'
		},
		props: {}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';

</script>

	<Section
		title="Headings"
		html={`<p class="title">Title — .title</p>
<p class="subtitle-s1">Subtitle s1</p>
<p class="subtitle-s2">Subtitle s2</p>`}
	>
		<div style="text-align:center;">
			<p class="title">Title — .title</p>
			<p class="subtitle-s1">Subtitle s1</p>
			<p class="subtitle-s2">Subtitle s2</p>
		</div>
	</Section>

	<Section
		title="Body"
		html={`<p class="text-s2-b1">Base, semibold</p>
<p class="text-s2-b2">Base, medium</p>
<p class="text-s2-b3">Base, regular</p>`}
	>
		<div style="text-align:center;">
			<p class="text-s2-b1">Base, semibold</p>
			<p class="text-s2-b2">Base, medium</p>
			<p class="text-s2-b3">Base, regular</p>
		</div>
	</Section>
