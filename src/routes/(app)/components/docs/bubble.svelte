<script module lang="ts">
	/**
	 * The hand-written half of this page: what the component is, what each
	 * of its classes does, and what its props mean. WHICH classes exist is
	 * read back from the active family's compiled CSS.
	 */
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['bubble'],
		description:
			'A chat message: one class on one block, which gives it a fill, an ink and a tail at the bottom of one side. The tail is drawn in CSS, and each family draws its own.',
		classes: {
			'bubble-end': 'Puts the tail on the end side, and the bubble at the end of the line.',
			'bubble-no-tail': 'Drops the tail but keeps its room, so a follow-up message stays in the column.'
		},
		props: {
			Bubble: [
				{ name: 'end', type: 'boolean', default: 'false', description: 'Tail on the end side; the bubble moves to the end of the line.' },
				{ name: 'noTail', type: 'boolean', default: 'false', description: 'No tail, same column.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Bubble } from '$lib/index.js';
</script>

<Section
	title="Conversation"
	subtitle="Start by default; end on the other side."
	svelte={`<Bubble>Did you see the new family?</Bubble>
<Bubble end color="primary">The one with the hard shadow?</Bubble>
<Bubble end noTail color="primary">It pushes into its own shadow.</Bubble>`}
	html={`<div class="bubble">Did you see the new family?</div>
<div class="bubble bubble-end bubble-primary">The one with the hard shadow?</div>
<div class="bubble bubble-end bubble-no-tail bubble-primary">It pushes into its own shadow.</div>`}
>
	<div style="display:flex; flex-direction:column; gap:.75rem; width:min(100%, 28rem)">
		<Bubble noTail>Did you see the new family?</Bubble>
		<Bubble>The yellow one.</Bubble>
		<Bubble end noTail color="primary">The one with the hard shadow?</Bubble>
		<Bubble end color="primary">It pushes into its own shadow when you press it.</Bubble>
		<Bubble>That one.</Bubble>
	</div>
</Section>

<Section
	title="Colours"
	svelte={`<Bubble color="secondary">…</Bubble>`}
	html={`<div class="bubble bubble-secondary">…</div>`}
>
	<div style="display:flex; flex-direction:column; gap:.75rem; width:min(100%, 28rem)">
		<Bubble color="neutral">Neutral</Bubble>
		<Bubble color="secondary">Secondary</Bubble>
		<Bubble color="accent">Accent</Bubble>
		<Bubble end color="info">Info</Bubble>
		<Bubble end color="success">Success</Bubble>
		<Bubble end color="warning">Warning</Bubble>
		<Bubble end color="error">Error</Bubble>
	</div>
</Section>

<Section
	title="Sizes"
	svelte={`<Bubble size="sm">…</Bubble>`}
	html={`<div class="bubble bubble-sm">…</div>`}
>
	<div style="display:flex; flex-direction:column; gap:.75rem; width:min(100%, 28rem)">
		<Bubble size="xs">Extra small</Bubble>
		<Bubble size="sm">Small</Bubble>
		<Bubble size="lg">Large</Bubble>
		<Bubble size="xl">Extra large</Bubble>
	</div>
</Section>
