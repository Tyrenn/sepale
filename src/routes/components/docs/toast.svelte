<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['toast'],
		description:
			'A stack of alerts that pile up, each leaving on its own. Bind the component and call add() to push one. In the flow by default; a side or an align pins it to a corner of the viewport.',
		classes: {
			toast: 'The stack of alerts, in the flow. With a side or an align class, pinned to that corner and letting clicks through around the alerts.'
		},
		props: {
			Toast: [
				{ name: 'side', type: "'top' | 'bottom'", description: 'Pins the stack to that edge of the viewport.' },
				{ name: 'align', type: "'start' | 'center' | 'end'", description: 'Pins the stack to that end of the edge.' },
				{ name: 'max', type: 'number', default: 'Infinity', description: 'At most this many alerts; the oldest goes first.' },
				{ name: 'label', type: 'string', default: "'Notifications'", description: "The region's accessible name." },
				{ name: 'dismissLabel', type: 'string', default: "'Dismiss'", description: "Each close button's accessible name." }
			],
			'add()': [
				{ name: 'message', type: 'string', description: 'The text. `add("Saved")` is the short form.' },
				{ name: 'title', type: 'string', description: 'A bold first line.' },
				{ name: 'color', type: 'string', description: 'The alert colour.' },
				{ name: 'duration', type: 'number', default: '5000', description: 'Milliseconds on screen; 0 keeps it until dismissed. Hover or focus pauses the countdown.' },
				{ name: 'action', type: '{ label, onClick }', description: 'One button inside the toast; clicking it dismisses the toast too.' }
			],
			'dismiss()': [{ name: 'id', type: 'number', description: 'The id `add()` returned.' }],
			'clear()': [{ name: '—', type: '', description: 'Removes every alert.' }]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Button, Toast } from '$lib/index.js';

	let n = 0;
	let inline: Toast | undefined = $state();
	let pinned: Toast | undefined = $state();
</script>

<Section
	title="A stack"
	subtitle="In the flow: the alerts pile up where the Toast is placed. Hover one to hold it."
	svelte={`<Toast bind:this={toast} />

<!-- then, from the script -->
toast.add('Saved');
toast.add({ message: 'Upload failed', color: 'error', duration: 0 });
toast.add({ message: 'Row deleted', action: { label: 'Undo', onClick: undo } });`}
	html={`<section class="toast" aria-live="polite">
  <div class="alert alert-success" role="status">…</div>
  <div class="alert" role="status">…</div>
</section>`}
>
	<div style="display:grid; gap:1rem; justify-items:center; width:100%; min-height:16rem; align-content:start">
		<div style="display:flex; flex-wrap:wrap; gap:.5rem; justify-content:center">
			<Button onclick={() => inline?.add(`Saved (${++n})`)}>Plain</Button>
			<Button color="success" onclick={() => inline?.add({ message: 'Your changes are live.', title: 'Published', color: 'success' })}>Success</Button>
			<Button color="error" onclick={() => inline?.add({ message: 'Stays until dismissed.', color: 'error', duration: 0 })}>Persistent error</Button>
			<Button onclick={() => inline?.add({ message: 'Row deleted.', color: 'info', action: { label: 'Undo', onClick: () => inline?.add('Restored') } })}>With action</Button>
		</div>
		<Toast bind:this={inline} max={4} />
	</div>
</Section>

<Section
	title="Pinned to a corner"
	subtitle="side and align pin the stack to the viewport: here bottom-end."
	svelte={`<Toast bind:this={toast} side="bottom" align="end" />`}
	html={`<section class="toast toast-bottom toast-end" aria-live="polite">…</section>`}
>
	<Toast bind:this={pinned} side="bottom" align="end" />
	<Button onclick={() => pinned?.add({ message: `Notification ${++n}`, color: 'info' })}>Notify</Button>
</Section>
