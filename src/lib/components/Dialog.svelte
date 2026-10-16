<script module lang="ts">
	/** What .dialog is made of, classified. Each family's copy writes these out
	    as plain props (scripts/family-component.mjs).

	    The dialog draws its own box, title, body, actions and close button:
	    they are PARTS. */
	export const PREFIX = 'dialog';

	export const AXES = {
		size: ['xs', 'sm', 'md', 'lg', 'xl'],
		/* Where the box sits: centred unless told otherwise. */
		placement: ['top', 'bottom']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = ['box', 'title', 'body', 'actions', 'close'] as const;
</script>

<script lang="ts">
	/**
	 * A box over the page, on the native <dialog>. Modal by default —
	 * `showModal()`: the page behind is inert, focus stays inside, Escape
	 * closes it — or not (`modal={false}`), and the page stays usable.
	 *
	 * The actions sit in a `<form method="dialog">`: a button closes the
	 * dialog and its `value` becomes the dialog's return value, handed to
	 * `onClose`. The opening and closing are animated here, not in the CSS.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLDialogAttributes } from 'svelte/elements';
	import { scale } from 'svelte/transition';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	// `open` and `title` are ours: the first is driven through the element's
	// methods, the second is a heading. Component events are `onXxx`; the
	// native lowercase ones still pass through.
	interface Props
		extends AxisProps<typeof AXES, typeof FLAGS>,
			Omit<HTMLDialogAttributes, 'open' | 'title'> {
		/** Whether it is shown. Bindable: closing from inside sets it back. */
		open?: boolean;
		/** Block the page behind it (`showModal`). Default true. */
		modal?: boolean;
		/** Draw a close button in the corner. Default true. */
		closable?: boolean;
		/** Close on Escape and on a click outside the box. Default true. */
		dismissible?: boolean;
		/** Animate opening and closing. Ignored when the visitor asks for reduced motion. */
		animated?: boolean;
		/** The heading, as text or as a snippet. */
		title?: string | Snippet;
		/** Buttons, inside the `<form method="dialog">`: each one closes with its `value`. */
		actions?: Snippet;
		/** After it closed, with the value of the button that closed it ('' otherwise). */
		onClose?: (value: string) => void;
		/** The accessible name of the close button. */
		closeLabel?: string;
		/** The `<dialog>` itself. Bindable. */
		element?: HTMLDialogElement;
		class?: string;
		children?: Snippet;
	}

	let {
		open = $bindable(false),
		modal = true,
		closable = true,
		dismissible = true,
		animated = true,
		title,
		actions,
		onClose,
		closeLabel = 'Close',
		element = $bindable(),
		class: klass = '',
		children,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));

	const uid = $props.id();

	/** The box is in the DOM. Lags `open` while the closing transition runs. */
	let shown = $state(false);
	/** The value the dialog will close with, once the box has gone. */
	let pending = '';

	const reduced = () =>
		typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
	let duration = $derived(animated ? 150 : 0);

	/* `open` drives the element. Opening is immediate; closing waits for the
	   box's outro (outroend → finish), unless there is nothing to wait for. */
	$effect(() => {
		if (!element) return;
		if (open && !element.open) {
			if (modal) element.showModal();
			else element.show();
			shown = true;
		} else if (!open && element.open && shown) {
			if (!animated || reduced()) finish();
			else shown = false;
		}
	});

	/** Ask to close with a value; the transition runs, then the element closes. */
	function request(value = '') {
		pending = value;
		open = false;
	}

	function finish() {
		shown = false;
		element?.close(pending);
	}

	/* The element closed — by us, or by the browser on its own. */
	function closed() {
		const value = element?.returnValue ?? pending;
		pending = '';
		shown = false;
		open = false;
		if (element) element.returnValue = '';
		onClose?.(value);
	}

	/* Escape: the browser would close at once, skipping the transition. */
	function cancel(e: Event) {
		e.preventDefault();
		if (dismissible) request();
	}

	/* A form with method="dialog" closes the element as it submits; the
	   value is taken here and the closing goes through the transition. */
	function submit(e: SubmitEvent) {
		e.preventDefault();
		const by = e.submitter as HTMLButtonElement | null;
		request(by?.value ?? '');
	}

	/* A click outside the box lands on the <dialog> itself. Only one that
	   also STARTED there counts: a text selection dragged out of the box
	   must not close it. */
	let downOnOverlay = false;
	function pointerdown(e: PointerEvent) {
		downOnOverlay = e.target === element;
	}
	function click(e: MouseEvent) {
		if (dismissible && downOnOverlay && e.target === element) request();
		downOnOverlay = false;
	}
</script>

<dialog
	{...applied.rest}
	bind:this={element}
	class={classes}
	aria-labelledby={title ? `${uid}-title` : undefined}
	oncancel={cancel}
	onclose={closed}
	onpointerdown={pointerdown}
	onclick={click}
>
	{#if shown}
		<div
			class={`${PREFIX}-box`}
			transition:scale={{ start: 0.95, duration: reduced() ? 0 : duration }}
			onoutroend={finish}
		>
			{#if closable}
				<form method="dialog" onsubmit={submit}>
					<button type="submit" class={`${PREFIX}-close`} aria-label={closeLabel} value="">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
					</button>
				</form>
			{/if}
			{#if title}
				<h2 id={`${uid}-title`} class={`${PREFIX}-title`}>
					{#if typeof title === 'function'}{@render title()}{:else}{title}{/if}
				</h2>
			{/if}
			{#if children}
				<div class={`${PREFIX}-body`}>{@render children()}</div>
			{/if}
			{#if actions}
				<form method="dialog" class={`${PREFIX}-actions`} onsubmit={submit}>
					{@render actions()}
				</form>
			{/if}
		</div>
	{/if}
</dialog>
