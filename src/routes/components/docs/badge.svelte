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
		namespaces: ["badge"],
		description:
			"A count or a mark pinned to another element. It has no life of its own — what it marks is the thing it sits on.",
		classes: {},
		props: {
			Badge: [
				{
					name: "badge",
					type: "Snippet",
					description: "The badge itself; rendered as a .chip pinned to the chosen corner."
				}
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import {
		Button,
		Badge
	} from '$lib/index.js';
</script>

	<Section
		title="Indicator"
		subtitle="A floating chip anchored to a host element via the `badge` snippet."
		svelte={`<Badge side="top" align="end">
	{#snippet badge()}99+{/snippet}
	<Button>Notifications</Button>
</Badge>`}
		html={`<div class="badge badge-top badge-end">
	<button class="btn">Notifications</button>
	<span class="chip">99+</span>
</div>`}
	>
		<Badge side="top" align="end">
			{#snippet badge()}99+{/snippet}
			<Button>Notifications</Button>
		</Badge>
	</Section>

	<Section
		title="Positions"
		svelte={`<Badge side="top" align="start">
	{#snippet badge()}new{/snippet}
	<Button color="primary">Start</Button>
</Badge>
<Badge side="bottom" align="end">
	{#snippet badge()}✓{/snippet}
	<Button>Bottom</Button>
</Badge>`}
		html={`<div class="badge badge-top badge-start">
	<button class="btn btn-primary">Start</button>
	<span class="chip">new</span>
</div>
<div class="badge badge-bottom badge-end">
	<button class="btn">Bottom</button>
	<span class="chip">✓</span>
</div>`}
	>
		<Badge side="top" align="start">
			{#snippet badge()}new{/snippet}
			<Button color="primary">Start</Button>
		</Badge>
		<Badge side="bottom" align="end">
			{#snippet badge()}✓{/snippet}
			<Button>Bottom</Button>
		</Badge>
	</Section>
