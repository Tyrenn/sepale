<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['divider'],
		description:
			'A rule between two things, horizontal or vertical, optionally carrying a word or two. Its shapes — dashed, dotted, thick, fading — are each family\'s own.',
		classes: {
			divider: 'Two lines around the content; one line when empty (and on an <hr>).',
			'divider-content': 'The words between the lines.'
		},
		props: {
			Divider: [
				{ name: 'children', type: 'Snippet', description: 'The content. Without it, the divider is an <hr>.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Divider } from '$lib/index.js';
</script>

<Section
	title="Plain and with content"
	svelte={`<Divider />
<Divider>or</Divider>
<Divider align="start">Start</Divider>
<Divider align="end">End</Divider>`}
	html={`<hr class="divider">
<div class="divider" role="separator"><span class="divider-content">or</span></div>
<div class="divider divider-start" role="separator"><span class="divider-content">Start</span></div>
<div class="divider divider-end" role="separator"><span class="divider-content">End</span></div>`}
>
	<div style="display:flex; flex-direction:column; width:100%">
		<Divider />
		<Divider>or</Divider>
		<Divider align="start">Start</Divider>
		<Divider align="end">End</Divider>
	</div>
</Section>

<Section
	title="Colors"
	svelte={`<Divider color="primary">Primary</Divider>
<Divider color="error">Error</Divider>`}
	html={`<div class="divider divider-primary" role="separator"><span class="divider-content">Primary</span></div>
<div class="divider divider-error" role="separator"><span class="divider-content">Error</span></div>`}
>
	<div style="display:flex; flex-direction:column; width:100%">
		<Divider color="primary">Primary</Divider>
		<Divider color="error">Error</Divider>
	</div>
</Section>

<Section
	title="Dashed"
	svelte={`<Divider variant="dashed">Dashed</Divider>`}
	html={`<div class="divider divider-dashed" role="separator"><span class="divider-content">Dashed</span></div>`}
>
	<div style="display:flex; flex-direction:column; width:100%"><Divider variant="dashed">Dashed</Divider></div>
</Section>

<Section
	title="Dotted"
	svelte={`<Divider variant="dotted">Dotted</Divider>`}
	html={`<div class="divider divider-dotted" role="separator"><span class="divider-content">Dotted</span></div>`}
>
	<div style="display:flex; flex-direction:column; width:100%"><Divider variant="dotted">Dotted</Divider></div>
</Section>

<Section
	title="Thick"
	svelte={`<Divider variant="thick">Thick</Divider>`}
	html={`<div class="divider divider-thick" role="separator"><span class="divider-content">Thick</span></div>`}
>
	<div style="display:flex; flex-direction:column; width:100%"><Divider variant="thick">Thick</Divider></div>
</Section>

<Section
	title="Fade"
	svelte={`<Divider variant="fade">Fade</Divider>`}
	html={`<div class="divider divider-fade" role="separator"><span class="divider-content">Fade</span></div>`}
>
	<div style="display:flex; flex-direction:column; width:100%"><Divider variant="fade">Fade</Divider></div>
</Section>

<Section
	title="Vertical"
	svelte={`<span>Left</span>
<Divider direction="vertical" />
<span>Middle</span>
<Divider direction="vertical">or</Divider>
<span>Right</span>`}
	html={`<hr class="divider divider-vertical">
<div class="divider divider-vertical" role="separator"><span class="divider-content">or</span></div>`}
>
	<div style="display:flex; align-items:stretch; height:6em">
		<span>Left</span>
		<Divider direction="vertical" />
		<span>Middle</span>
		<Divider direction="vertical">or</Divider>
		<span>Right</span>
	</div>
</Section>
