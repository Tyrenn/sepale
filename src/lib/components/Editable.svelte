<script module lang="ts">
	/** What .editable is made of, classified. The props follow the
	    families the project registers (variants.ts, ADR 0015).

	    The editable draws the value at rest and the frame around its editor:
	    `.editable-display`, `.editable-empty` and `.editable-form` are PARTS.
	    The editor itself is another component (Input, NumberInput…). */
	export const PREFIX = 'editable';

	export const AXES = {
		size: ['xs', 'sm', 'md', 'lg', 'xl']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = ['display', 'empty', 'form', 'list'] as const;

	/** The editors the component draws by itself, by the shape of the value. */
	/** What opens the editor at rest, by itself. Enter covers Space too. */
	export type EditableTrigger = 'click' | 'enter' | 'f2';

	export type EditableKind = 'text' | 'number' | 'boolean' | 'text[]' | 'number[]' | 'boolean[]';

	/** What the `edit` snippet is handed. */
	export interface EditableControl<V> {
		/** The value being edited — not yet the component's. */
		readonly value: V;
		/** Change the value being edited. */
		set: (value: V) => void;
		/** Keep the edit: `onvalue` is called if the value changed. */
		commit: () => void;
		/** Drop the edit. */
		cancel: () => void;
	}
</script>

<script lang="ts" generics="V">
	/**
	 * A value shown as it is, that turns into its editor when asked.
	 *
	 * At rest the value is drawn by `display` — or as text — inside a button:
	 * a click, Enter or F2 opens the editor. The editor is the `edit` snippet,
	 * handed an `EditableControl`; or, for a plain value, the one `kind` names
	 * (`text`, `number`, `boolean` and their lists). Enter keeps the edit
	 * (Ctrl + Enter in a multi-line field), Escape drops it, and leaving the
	 * editor keeps it. `onvalue` is only called when the value changed.
	 *
	 * Each of those is a default, not a rule. `editing` is bindable: read it,
	 * or set it to open and close the editor from anywhere — a pencil button,
	 * a row's "Edit", a whole form switching mode. `openOn` picks which of
	 * click, Enter and F2 still open it by themselves (none: the value at rest
	 * is plain text, not a button), and `commitOnBlur` whether leaving the
	 * editor keeps the edit. Closing — by `editing = false` or `commit()` —
	 * keeps the edit; only Escape and `cancel()` drop it.
	 *
	 * The component keeps no value of its own: `value` is what is shown, and
	 * it is the owner's to update in `onvalue` — a DataHandler row, a form.
	 */
	import { tick, untrack, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';
	import Input from './Input.svelte';
	import NumberInput from './NumberInput.svelte';
	import Toggle from './Toggle.svelte';
	import Checkbox from './Checkbox.svelte';
	import ChipsInput from './ChipsInput.svelte';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>, HTMLAttributes<HTMLDivElement> {
		/** What is shown, and what an edit starts from. */
		value: V;
		/** After an edit that changed the value. */
		onvalue?: (value: V) => void;
		/** The editor drawn when there is no `edit` snippet. Default `text`. */
		kind?: EditableKind;
		/** How the value is drawn at rest. Default: as text. */
		display?: Snippet<[V]>;
		/** The editor. Default: the one `kind` names. */
		edit?: Snippet<[EditableControl<V>]>;
		/** Shown at rest when the value is empty. */
		placeholder?: string;
		/** Never opens the editor. */
		disabled?: boolean;
		/** Whether the editor is open. Bindable: set it to open or close it from outside. */
		editing?: boolean;
		/** What opens the editor by itself. Default all three; `[]` leaves it to `editing` alone. */
		openOn?: EditableTrigger[];
		/** Leaving the editor keeps the edit. Default yes; without, the editor stays open until closed. */
		commitOnBlur?: boolean;
		/** Said after the value by a screen reader, on the button that opens the editor. Default `Edit`. */
		editLabel?: string;
		/** The text of a boolean at rest. */
		trueLabel?: string;
		falseLabel?: string;
		class?: string;
	}

	let {
		value,
		onvalue,
		kind = 'text',
		display,
		edit,
		placeholder = '—',
		disabled = false,
		editing = $bindable(),
		openOn = ['click', 'enter', 'f2'],
		commitOnBlur = true,
		editLabel = 'Edit',
		trueLabel = 'Yes',
		falseLabel = 'No',
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));

	let draft = $state<V>() as V;
	let form = $state<HTMLElement>();
	let button = $state<HTMLButtonElement>();

	const same = (a: unknown, b: unknown) => a === b || JSON.stringify(a) === JSON.stringify(b);
	const copy = (v: V): V => (Array.isArray(v) ? ([...v] as V) : v);

	/* Every way in or out — a trigger, a method, `editing` set from outside —
	   goes through `editing`; what opening and closing do is here, once.
	   Opening starts a draft from the value; closing hands the draft on if it
	   changed (cancel has put the value back in it first). The focus goes
	   back to the value only if it was lost with the editor: not when it
	   left for something else. */
	let was = false;
	$effect(() => {
		const now = !!editing;
		untrack(() => {
			if (now === was) return;
			was = now;
			if (now) {
				draft = copy(value);
				tick().then(focusEditor);
			} else {
				if (!same(draft, value)) onvalue?.(draft);
				tick().then(() => {
					if (document.activeElement === document.body) button?.focus();
				});
			}
		});
	});

	function focusEditor() {
		/* A field before anything else: a NumberInput with controls starts with a button. */
		const first =
			form?.querySelector<HTMLElement>('input:not([type=hidden], [type=checkbox], [type=radio]), textarea, select') ??
			form?.querySelector<HTMLElement>('input, button, [tabindex]');
		first?.focus();
	}

	/** Open the editor on the current value. */
	export function open() {
		if (!disabled) editing = true;
	}

	/** Keep the edit. */
	export function commit() {
		/* Already closed: the editor leaving the page fires a last focusout. */
		if (!editing) return;
		editing = false;
	}

	/** Drop the edit. */
	export function cancel() {
		if (!editing) return;
		draft = copy(value);
		editing = false;
	}

	/* At rest. Enter and Space would click a button by themselves: they are
	   taken here, so that `openOn` can tell a key from a click. */
	let opens = $derived(new Set(openOn));
	function onDisplayKey(e: KeyboardEvent) {
		const key = e.key === 'F2' ? 'f2' : e.key === 'Enter' || e.key === ' ' ? 'enter' : null;
		if (!key) return;
		e.preventDefault();
		if (opens.has(key)) open();
	}

	const control: EditableControl<V> = {
		get value() {
			return draft;
		},
		set: (v) => (draft = v),
		commit,
		cancel
	};

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			cancel();
		} else if (e.key === 'Enter') {
			const multiline = (e.target as HTMLElement).tagName === 'TEXTAREA';
			if (multiline && !(e.ctrlKey || e.metaKey)) return;
			e.preventDefault();
			commit();
		}
	}

	/* Leaving the editor keeps the edit — unless the focus only moved inside
	   it (a chip's remove button, a stepper). Escape and Enter have already
	   closed it by then. */
	function onfocusout(e: FocusEvent) {
		const to = e.relatedTarget as Node | null;
		if (!commitOnBlur || (to && form?.contains(to))) return;
		commit();
	}

	/* The keys and the focus come up from the editor inside: the group only
	   listens, it is not a control — so the listeners are attached, not
	   written as handlers on a non-interactive element. */
	function listen(node: HTMLElement) {
		node.addEventListener('keydown', onkeydown);
		node.addEventListener('focusout', onfocusout);
		return () => {
			node.removeEventListener('keydown', onkeydown);
			node.removeEventListener('focusout', onfocusout);
		};
	}

	const isEmpty = (v: unknown) => v == null || v === '' || (Array.isArray(v) && v.length === 0);
	const asText = (v: unknown): string =>
		Array.isArray(v) ? v.map(asText).join(', ') : typeof v === 'boolean' ? (v ? trueLabel : falseLabel) : String(v);

	/* The built-in editors work on the draft through these. */
	const list = () => (Array.isArray(draft) ? (draft as unknown[]) : []);
	function setAt(i: number, v: unknown) {
		const next = [...list()];
		next[i] = v;
		draft = next as V;
	}
</script>

<div {...applied.rest} class={classes}>
	{#if editing}
		<div class={`${PREFIX}-form`} bind:this={form} role="group" {@attach listen}>
			{#if edit}
				{@render edit(control)}
			{:else if kind === 'number'}
				<NumberInput value={draft as number | null} onvalue={(v) => (draft = v as V)} />
			{:else if kind === 'boolean'}
				<Toggle checked={!!draft} onchange={(e) => (draft = e.currentTarget.checked as V)} />
			{:else if kind === 'text[]' || kind === 'number[]'}
				<ChipsInput
					values={list().map(String)}
					unique={false}
					onvalue={(vs) => (draft = (kind === 'number[]' ? vs.map(Number).filter((n) => !Number.isNaN(n)) : vs) as V)}
				/>
			{:else if kind === 'boolean[]'}
				<span class={`${PREFIX}-list`}>
					{#each list() as b, i (i)}
						<Checkbox checked={!!b} onchange={(e) => setAt(i, e.currentTarget.checked)} />
					{/each}
				</span>
			{:else}
				<Input value={draft == null ? '' : String(draft)} oninput={(e) => (draft = e.currentTarget.value as V)} />
			{/if}
		</div>
	{:else}
		{#snippet shown()}
			{#if isEmpty(value)}
				<span class={`${PREFIX}-empty`}>{placeholder}</span>
			{:else if display}
				{@render display(value)}
			{:else}
				{asText(value)}
			{/if}
		{/snippet}
		{#if opens.size}
			<button
				type="button"
				class={`${PREFIX}-display`}
				bind:this={button}
				{disabled}
				aria-label={`${isEmpty(value) ? placeholder : asText(value)}, ${editLabel}`}
				onclick={() => opens.has('click') && open()}
				onkeydown={onDisplayKey}
			>
				{@render shown()}
			</button>
		{:else}
			<!-- Nothing here opens it: the value is text, not a control. -->
			<span class={`${PREFIX}-display`}>{@render shown()}</span>
		{/if}
	{/if}
</div>
