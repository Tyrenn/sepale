<script module lang="ts">
	/**
	 * The hand-written half of this page: what the component is, what each
	 * of its classes does, and what its props mean. WHICH classes exist is
	 * not written here — that is read back from the active family's compiled
	 * CSS (src/lib/generated/components.ts), so a page cannot claim a class
	 * the family does not ship.
	 */
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['editable'],
		description:
			'A value shown as it is, that turns into its editor when asked: a click, Enter or F2. Enter keeps the edit (Ctrl + Enter in a multi-line field), Escape drops it, leaving the editor keeps it. The editor is a snippet, or the one `kind` names for a plain value. The component keeps no value: `onvalue` hands the new one to its owner.',
		classes: {
			'editable-display': 'The value at rest: a button that opens the editor — or plain text when `openOn` is empty.',
			'editable-empty': 'The placeholder of an empty value.',
			'editable-form': 'The frame around the editor.',
			'editable-list': 'The row of checkboxes of a boolean list.'
		},
		props: {
			Editable: [
				{ name: 'value', type: 'V', description: 'What is shown, and what an edit starts from.' },
				{ name: 'onvalue', type: '(value) => void', description: 'After an edit that changed the value.' },
				{ name: 'kind', type: "'text' | 'number' | 'boolean' | 'text[]' | 'number[]' | 'boolean[]'", default: "'text'", description: 'The editor drawn when there is no `edit` snippet.' },
				{ name: 'display', type: 'Snippet<[value]>', description: 'How the value is drawn at rest. Default: as text, a list joined by commas.' },
				{ name: 'edit', type: 'Snippet<[EditableControl]>', description: 'The editor. Handed `{ value, set, commit, cancel }`: edit `value` through `set`; Enter, Escape and leaving are handled around it.' },
				{ name: 'placeholder', type: 'string', default: "'—'", description: 'Shown at rest when the value is empty.' },
				{ name: 'disabled', type: 'boolean', description: 'Never opens the editor.' },
				{ name: 'editing', type: 'boolean', default: '$bindable(false)', description: 'Whether the editor is open. Set it to open or close it from anywhere; closing keeps the edit.' },
				{ name: 'openOn', type: "('click' | 'enter' | 'f2')[]", default: 'all three', description: 'What opens the editor by itself. Enter covers Space. `[]`: only `editing` opens it, and the value at rest is plain text.' },
				{ name: 'commitOnBlur', type: 'boolean', default: 'true', description: 'Leaving the editor keeps the edit. Without, it stays open until closed.' },
				{ name: 'editLabel / trueLabel / falseLabel', type: 'string', description: '`Edit`, said after the value by a screen reader (the button is named “value, Edit”); the text of a boolean at rest: `Yes` / `No`.' },
				{ name: 'open() / commit() / cancel()', type: 'methods', description: 'Drive it from outside, with `bind:this`.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Badge, Button, Editable, Select, Textarea } from '$lib/index.js';

	let name = $state('Deployment');
	let notes = $state('');
	let count = $state(12);
	let active = $state(true);
	let tags = $state(['eu-west', 'canary']);
	let sizes = $state([2, 4, 8]);
	let flags = $state([true, false, true]);
	let status = $state('live');
	const STATUSES = ['live', 'paused', 'archived'];

	let city = $state('Lyon');
	let cityEditing = $state(false);
	let profile = $state({ first: 'Ada', last: 'Lovelace' });
	let formEditing = $state(false);
</script>

<Section
	title="By the shape of the value"
	subtitle="No snippet: the editor follows `kind`. Click a value, or tab to it and press Enter."
	svelte={`<Editable value={name} onvalue={(v) => (name = v)} />
<Editable value={count} kind="number" onvalue={(v) => (count = v)} />
<Editable value={active} kind="boolean" onvalue={(v) => (active = v)} />
<Editable value={tags} kind="text[]" onvalue={(v) => (tags = v)} />
<Editable value={sizes} kind="number[]" onvalue={(v) => (sizes = v)} />
<Editable value={flags} kind="boolean[]" onvalue={(v) => (flags = v)} />`}
	html={`<div class="editable">
	<button type="button" class="editable-display" aria-label="Deployment, Edit">Deployment</button>
</div>`}
>
	<dl style="display:grid; grid-template-columns:auto 1fr; width:min(100%, 26rem); gap:.75rem 1.5rem; align-items:center; margin:0;">
		<dt>text</dt><dd style="margin:0"><Editable value={name} onvalue={(v) => (name = v)} /></dd>
		<dt>number</dt><dd style="margin:0"><Editable value={count} kind="number" onvalue={(v) => (count = v)} /></dd>
		<dt>boolean</dt><dd style="margin:0"><Editable value={active} kind="boolean" onvalue={(v) => (active = v)} /></dd>
		<dt>text[]</dt><dd style="margin:0"><Editable value={tags} kind="text[]" onvalue={(v) => (tags = v)} /></dd>
		<dt>number[]</dt><dd style="margin:0"><Editable value={sizes} kind="number[]" onvalue={(v) => (sizes = v)} /></dd>
		<dt>boolean[]</dt><dd style="margin:0"><Editable value={flags} kind="boolean[]" onvalue={(v) => (flags = v)} /></dd>
		<dt>empty</dt><dd style="margin:0"><Editable value={notes} placeholder="Add a note" onvalue={(v) => (notes = v)} /></dd>
	</dl>
</Section>

<Section
	title="Your own display and editor"
	subtitle="Two snippets: the value at rest, and its editor — which edits through `set` and may close itself with `commit`."
	svelte={`<Editable value={status} onvalue={(v) => (status = v)}>
	{#snippet display(v)}<Badge color={v === 'live' ? 'success' : 'neutral'}>{v}</Badge>{/snippet}
	{#snippet edit(c)}
		<Select value={c.value} onchange={(e) => { c.set(e.currentTarget.value); c.commit(); }}>
			{#each STATUSES as s}<option>{s}</option>{/each}
		</Select>
	{/snippet}
</Editable>`}
>
	<div style="display:flex; flex-direction:column; gap:1rem; align-items:start;">
		<Editable value={status} onvalue={(v) => (status = v)}>
			{#snippet display(v)}<Badge color={v === 'live' ? 'success' : 'neutral'}>{v}</Badge>{/snippet}
			{#snippet edit(c)}
				<Select value={c.value} onchange={(e) => { c.set(e.currentTarget.value); c.commit(); }}>
					{#each STATUSES as s (s)}<option>{s}</option>{/each}
				</Select>
			{/snippet}
		</Editable>
		<Editable value={notes} placeholder="Add a note" onvalue={(v) => (notes = v)}>
			{#snippet edit(c)}
				<Textarea value={c.value} rows={3} oninput={(e) => c.set(e.currentTarget.value)} />
			{/snippet}
		</Editable>
	</div>
</Section>

<Section
	title="Opened from outside"
	subtitle="`editing` is bindable. Here only the pencil opens it (an empty `openOn`), and a whole form switches mode at once — leaving a field does not close it (`commitOnBlur` off)."
	svelte={`<Editable value={city} bind:editing openOn={[]} onvalue={(v) => (city = v)} />
<Button size="sm" onclick={() => (editing = !editing)}>{editing ? 'Done' : 'Edit'}</Button>

<!-- One switch for a whole form -->
<Editable value={first} editing={formEditing} openOn={[]} commitOnBlur={false} onvalue={…} />
<Editable value={last} editing={formEditing} openOn={[]} commitOnBlur={false} onvalue={…} />
<Button onclick={() => (formEditing = !formEditing)}>{formEditing ? 'Save' : 'Edit'}</Button>`}
>
	<div style="display:flex; flex-direction:column; gap:1.25rem; align-items:start;">
		<div style="display:flex; gap:.75rem; align-items:center;">
			<Editable value={city} bind:editing={cityEditing} openOn={[]} onvalue={(v) => (city = v)} />
			<Button size="sm" onclick={() => (cityEditing = !cityEditing)}>{cityEditing ? 'Done' : '✎ Edit'}</Button>
		</div>
		<div style="display:grid; grid-template-columns:auto 1fr; gap:.6rem 1.25rem; align-items:center;">
			<span>First name</span>
			<Editable value={profile.first} editing={formEditing} openOn={[]} commitOnBlur={false} onvalue={(v) => (profile.first = v)} />
			<span>Last name</span>
			<Editable value={profile.last} editing={formEditing} openOn={[]} commitOnBlur={false} onvalue={(v) => (profile.last = v)} />
		</div>
		<Button color="primary" onclick={() => (formEditing = !formEditing)}>{formEditing ? 'Save' : 'Edit profile'}</Button>
	</div>
</Section>
