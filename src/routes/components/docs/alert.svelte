<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['alert'],
		description:
			'An inline message — information, success, warning, error — where it concerns the user. A toast is the same message, floating and temporary.',
		classes: {
			alert: 'A soft tint of its colour, an icon, a body, optional actions.',
			'alert-icon': 'The leading icon; takes the colour.',
			'alert-body': 'The text, growing to fill the row.',
			'alert-title': 'A bold first line.',
			'alert-actions': 'Buttons on the trailing side.',
			'alert-close': 'The close button of a dismissible alert.'
		},
		props: {
			Alert: [
				{ name: 'title', type: 'string', description: 'A bold first line.' },
				{ name: 'icon', type: 'Snippet', description: "Replaces the colour's own icon (info, success, warning and error have one)." },
				{ name: 'actions', type: 'Snippet', description: 'Buttons on the trailing side.' },
				{ name: 'dismissible', type: 'boolean', default: 'false', description: 'Draw a close button that hides the alert.' },
				{ name: 'onDismiss', type: '() => void', description: 'After the alert hid itself.' },
				{ name: 'dismissLabel', type: 'string', default: "'Dismiss'", description: "The close button's accessible name." }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Alert, Button } from '$lib/index.js';

	let dismissed = $state(0);
</script>

<Section
	title="Colors"
	svelte={`<Alert>A neutral note.</Alert>
<Alert color="info" title="Heads up">A new version is available.</Alert>
<Alert color="success">Your changes are saved.</Alert>
<Alert color="warning">Your trial ends in 3 days.</Alert>
<Alert color="error" title="Payment failed">Check your card details.</Alert>`}
	html={`<div class="alert alert-info" role="status">
  <span class="alert-icon">…</span>
  <div class="alert-body"><p class="alert-title">Heads up</p>A new version is available.</div>
</div>
<div class="alert alert-success" role="status">…</div>
<div class="alert alert-error" role="alert">…</div>`}
>
	<div style="display:grid; gap:.75em; width:100%">
		<Alert>A neutral note.</Alert>
		<Alert color="info" title="Heads up">A new version is available.</Alert>
		<Alert color="success">Your changes are saved.</Alert>
		<Alert color="warning">Your trial ends in 3 days.</Alert>
		<Alert color="error" title="Payment failed">Check your card details.</Alert>
	</div>
</Section>

<Section
	title="Outline"
	svelte={`<Alert variant="outline" color="success">Saved.</Alert>`}
	html={`<div class="alert alert-outline alert-success" role="status">…</div>`}
>
	<div style="display:grid; gap:.75em; width:100%">
		<Alert variant="outline" color="success">Saved.</Alert>
		<Alert variant="outline" color="error">Something went wrong.</Alert>
	</div>
</Section>

<Section
	title="Solid"
	svelte={`<Alert variant="solid" color="success">Saved.</Alert>`}
	html={`<div class="alert alert-solid alert-success" role="status">…</div>`}
>
	<div style="display:grid; gap:.75em; width:100%">
		<Alert variant="solid" color="success">Saved.</Alert>
		<Alert variant="solid" color="error">Something went wrong.</Alert>
	</div>
</Section>

<Section
	title="Actions and dismiss"
	subtitle="A dismissible alert hides itself, then calls onDismiss. This one comes back after a second."
	svelte={`<Alert color="info" dismissible onDismiss={() => …}>
  Cookies keep the session alive.
  {#snippet actions()}<Button size="sm">Settings</Button>{/snippet}
</Alert>`}
	html={`<div class="alert alert-info" role="status">
  <span class="alert-icon">…</span>
  <div class="alert-body">Cookies keep the session alive.</div>
  <div class="alert-actions"><button class="btn btn-sm">Settings</button></div>
  <button class="alert-close" aria-label="Dismiss">…</button>
</div>`}
>
	<div style="display:grid; gap:.75em; width:100%">
		{#key dismissed}
			<Alert color="info" dismissible onDismiss={() => setTimeout(() => dismissed++, 1000)}>
				Cookies keep the session alive.
				{#snippet actions()}<Button size="sm">Settings</Button>{/snippet}
			</Alert>
		{/key}
	</div>
</Section>
