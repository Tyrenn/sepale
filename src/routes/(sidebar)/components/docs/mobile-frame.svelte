<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['mobile-frame'],
		description:
			'A phone drawn around content, for showcases and screenshots — not an emulator. Set --mobile-frame-width; the height follows.',
		classes: {
			'mobile-frame': 'The body, with its island and side button.',
			'mobile-frame-screen': 'The screen; scrolls its content.'
		},
		props: { MobileFrame: [{ name: 'children', type: 'Snippet', description: 'What the screen shows.' }] }
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Alert, MobileFrame } from '$lib/index.js';
</script>

<Section
	title="Phone"
	svelte={`<MobileFrame>…</MobileFrame>
<MobileFrame style="--mobile-frame-width: 12em">…</MobileFrame>`}
	html={`<div class="mobile-frame">
  <div class="mobile-frame-screen">…</div>
</div>`}
>
	<MobileFrame>
		<div style="padding:3em 1em 1em; display:grid; gap:.75em">
			<strong>Inbox</strong>
			<Alert color="info">Three new messages.</Alert>
			<Alert color="success">Backup complete.</Alert>
		</div>
	</MobileFrame>
	<MobileFrame style="--mobile-frame-width: 12em">
		<div style="padding:3em 1em 1em">Smaller.</div>
	</MobileFrame>
</Section>
