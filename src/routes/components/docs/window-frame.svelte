<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['window-frame'],
		description:
			'An application window drawn around content: a title bar with three controls, a title and actions, above a body that scrolls.',
		classes: {
			'window-frame': 'The window.',
			'window-frame-bar': 'The title bar.',
			'window-frame-controls': 'The three window controls.',
			'window-frame-title': 'The centred title.',
			'window-frame-actions': 'Buttons on the right of the bar.',
			'window-frame-body': 'The content; scrolls.'
		},
		props: {
			WindowFrame: [
				{ name: 'title', type: 'string | Snippet', description: 'The title.' },
				{ name: 'actions', type: 'Snippet', description: 'Buttons on the right of the bar.' },
				{ name: 'children', type: 'Snippet', description: 'The content.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Button, WindowFrame } from '$lib/index.js';
</script>

<Section
	title="Window"
	svelte={`<WindowFrame title="Settings">
  {#snippet actions()}<Button size="xs">Share</Button>{/snippet}
  …
</WindowFrame>`}
	html={`<div class="window-frame">
  <div class="window-frame-bar">
    <span class="window-frame-controls"><span></span><span></span><span></span></span>
    <span class="window-frame-title">Settings</span>
    <span class="window-frame-actions">…</span>
  </div>
  <div class="window-frame-body">…</div>
</div>`}
>
	<div style="width:100%">
		<WindowFrame title="Settings">
			{#snippet actions()}<Button size="xs">Share</Button>{/snippet}
			<div style="padding:1.5em; height:8em">The window's content.</div>
		</WindowFrame>
	</div>
</Section>
