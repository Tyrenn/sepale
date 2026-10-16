<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['toaster'],
		description:
			'A message that floats in a corner, then leaves on its own. Each toast is an alert; the toaster is the stack they float in. Place one Toaster in the layout and call toast() from anywhere.',
		classes: {
			toaster: 'The fixed stack, bottom-end by default. Lets clicks through around the toasts.'
		},
		props: {
			Toaster: [
				{ name: 'label', type: 'string', default: "'Notifications'", description: "The region's accessible name." },
				{ name: 'dismissLabel', type: 'string', default: "'Dismiss'", description: "Each close button's accessible name." }
			],
			'toast()': [
				{ name: 'message', type: 'string', description: 'The text. `toast("Saved")` is the short form.' },
				{ name: 'title', type: 'string', description: 'A bold first line.' },
				{ name: 'color', type: 'string', description: 'The alert colour.' },
				{ name: 'duration', type: 'number', default: '5000', description: 'Milliseconds on screen; 0 keeps it until dismissed. Hover or focus pauses the countdown.' },
				{ name: 'action', type: '{ label, onClick }', description: 'One button inside the toast; clicking it dismisses the toast too.' }
			],
			'dismissToast()': [{ name: 'id', type: 'number', description: 'The id `toast()` returned.' }]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Button, Toaster, toast } from '$lib/index.js';

	let n = 0;
</script>

<Toaster />

<Section
	title="Toasts"
	subtitle="The Toaster on this page sits bottom-end. Hover a toast to hold it."
	svelte={`<!-- once, in the layout -->
<Toaster side="bottom" align="end" />

<!-- anywhere: import { toast } from 'sepale' -->
toast('Saved');
toast({ message: 'Upload failed', color: 'error', duration: 0 });
toast({ message: 'Row deleted', action: { label: 'Undo', onClick: undo } });`}
	html={`<section class="toaster toaster-bottom toaster-end" aria-live="polite">
  <div class="alert alert-success" role="status">…</div>
</section>`}
>
	<Button onclick={() => toast(`Saved (${++n})`)}>Plain</Button>
	<Button color="success" onclick={() => toast({ message: 'Your changes are live.', title: 'Published', color: 'success' })}>Success</Button>
	<Button color="error" onclick={() => toast({ message: 'Stays until dismissed.', color: 'error', duration: 0 })}>Persistent error</Button>
	<Button onclick={() => toast({ message: 'Row deleted.', color: 'info', action: { label: 'Undo', onClick: () => toast('Restored') } })}>With action</Button>
</Section>
