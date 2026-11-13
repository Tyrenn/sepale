<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['dialog'],
		description:
			'A box laid over the page, built on the native <dialog>. Modal, the page behind is shaded by the browser’s own ::backdrop and cannot be reached; not modal, it stays usable.',
		classes: {
			'dialog-box': 'The box itself. Everything around it is the overlay: a click there lands on the <dialog>.',
			'dialog-title': 'The heading.',
			'dialog-body': 'What the dialog says or asks.',
			'dialog-actions': 'The buttons, at the end of the box. A <form method="dialog">: a button closes the dialog with its value.',
			'dialog-close': 'The close button in the corner.'
		},
		props: {
			Dialog: [
				{ name: 'open', type: 'boolean', default: 'false', description: 'Whether it is shown. Bindable: closing from inside sets it back.' },
				{ name: 'modal', type: 'boolean', default: 'true', description: 'Block the page behind it (showModal). Escape closes it.' },
				{ name: 'closable', type: 'boolean', default: 'true', description: 'Draw a close button in the corner.' },
				{ name: 'dismissible', type: 'boolean', default: 'true', description: 'Close on Escape and on a click outside the box.' },
				{ name: 'animated', type: 'boolean', default: 'true', description: 'Animate opening and closing. The CSS never does; reduced motion is honoured.' },
				{ name: 'title', type: 'string | Snippet', description: 'The heading, which also names the dialog for assistive tech.' },
				{ name: 'actions', type: 'Snippet', description: 'Buttons, inside the <form method="dialog">: each one closes with its value.' },
				{ name: 'onvalue', type: '(value: string) => void', description: 'After it closed, with the value of the button that closed it — empty otherwise.' },
				{ name: 'closeLabel', type: 'string', default: "'Close'", description: 'The accessible name of the close button.' },
				{ name: 'element', type: 'HTMLDialogElement', description: 'The <dialog> itself. Bindable.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Button, Dialog, Input } from '$lib/index.js';

	let confirmOpen = $state(false);
	let answer = $state('');
	let formOpen = $state(false);
	let topOpen = $state(false);
	let sideOpen = $state(false);
</script>

<Section
	title="A confirmation"
	subtitle="The actions sit in a form with method=dialog: the button that closes the dialog hands its value to onvalue. Escape and a click on the shade close it with an empty value."
	svelte={`<Button onclick={() => (open = true)}>Delete…</Button>

<Dialog bind:open title="Delete 3 rows?" onvalue={(value) => (answer = value)}>
	This cannot be undone.
	{#snippet actions()}
		<Button value="cancel">Cancel</Button>
		<Button value="delete" color="error">Delete</Button>
	{/snippet}
</Dialog>`}
	html={`<dialog class="dialog">
	<div class="dialog-box">
		<form method="dialog"><button class="dialog-close" aria-label="Close">✕</button></form>
		<h2 class="dialog-title">Delete 3 rows?</h2>
		<div class="dialog-body">This cannot be undone.</div>
		<form method="dialog" class="dialog-actions">
			<button class="btn" value="cancel">Cancel</button>
			<button class="btn btn-error" value="delete">Delete</button>
		</form>
	</div>
</dialog>
<!-- open it with dialog.showModal() -->`}
>
	<Button onclick={() => (confirmOpen = true)}>Delete…</Button>
	{#if answer !== ''}<span style="opacity:.6;">closed with “{answer}”</span>{/if}
	<Dialog bind:open={confirmOpen} title="Delete 3 rows?" onvalue={(v) => (answer = v || '(nothing)')}>
		This cannot be undone.
		{#snippet actions()}
			<Button value="cancel">Cancel</Button>
			<Button value="delete" color="error">Delete</Button>
		{/snippet}
	</Dialog>
</Section>

<Section
	title="A form, no way out but its buttons"
	subtitle="dismissible={false} ignores Escape and the shade; closable={false} drops the corner button."
	svelte={`<Dialog bind:open title="Rename" dismissible={false} closable={false}>
	<Input value="Quarterly report" />
	{#snippet actions()}
		<Button value="cancel" variant="ghost">Cancel</Button>
		<Button value="save" color="primary">Save</Button>
	{/snippet}
</Dialog>`}
>
	<Button onclick={() => (formOpen = true)}>Rename…</Button>
	<Dialog bind:open={formOpen} title="Rename" dismissible={false} closable={false} size="sm">
		<Input value="Quarterly report" style="width:100%;" />
		{#snippet actions()}
			<Button value="cancel" variant="ghost">Cancel</Button>
			<Button value="save" color="primary">Save</Button>
		{/snippet}
	</Dialog>
</Section>

<Section
	title="Placement, and not modal"
	subtitle="placement moves the box to the top or the bottom. modal={false} opens it with show(): no shade, and the page behind stays usable."
	svelte={`<Dialog bind:open placement="top" title="Saved">Your changes are saved.</Dialog>
<Dialog bind:open modal={false} placement="bottom" title="Cookies">…</Dialog>`}
>
	<Button onclick={() => (topOpen = true)}>At the top</Button>
	<Button onclick={() => (sideOpen = true)}>Not modal, at the bottom</Button>
	<Dialog bind:open={topOpen} placement="top" title="Saved">Your changes are saved.</Dialog>
	<Dialog bind:open={sideOpen} modal={false} placement="bottom" title="Not modal">
		The page behind still scrolls and still takes clicks.
	</Dialog>
</Section>
