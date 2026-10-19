<script lang="ts">
	/**
	 * Its content becomes a place to drop files on. It draws nothing of its
	 * own — no namespace —: what is inside is the look, `over` says when
	 * files are dragged above it, `open()` opens the file dialog.
	 *
	 * A visually hidden `<input type="file">` holds the files: it carries
	 * `name`, `accept`, `multiple` and `required`, so a form submits and
	 * validates them, and a drop fills it as a pick does. `onFiles` gets the
	 * files that match `accept` (and `maxSize`), then those that do not.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** As on a file input: `image/*`, `.pdf`, `application/json`… */
		accept?: string;
		/** Several files at once. */
		multiple?: boolean;
		/** Neither drops nor the dialog. */
		disabled?: boolean;
		/** For a form: the file input's name. */
		name?: string;
		/** A file is needed: the file input says so to its form. */
		required?: boolean;
		/** On the file input. */
		id?: string;
		/** A click on the zone opens the dialog. Off by default: the content usually holds its own button. */
		clickable?: boolean;
		/** Largest file, in bytes. */
		maxSize?: number;
		/** Files are dragged above the zone. Bindable, for a look drawn outside it. */
		over?: boolean;
		/** After a drop or a pick: the files kept, then the ones refused. */
		onFiles?: (accepted: File[], rejected: File[]) => void;
		/** The content, given whether files are dragged above it and how to open the dialog. */
		children?: Snippet<[{ over: boolean; open: () => void }]>;
		class?: string;
	}

	let {
		accept,
		multiple = false,
		disabled = false,
		name,
		required = false,
		id,
		clickable = false,
		maxSize = Infinity,
		over = $bindable(false),
		onFiles,
		children,
		class: klass = '',
		...rest
	}: Props = $props();

	let input: HTMLInputElement | undefined = $state();
	/** dragenter / dragleave fire for every child crossed: count them. */
	let depth = 0;
	function count(next: number) {
		depth = Math.max(0, next);
		over = depth > 0;
	}

	/** Open the file dialog. */
	export function open() {
		if (!disabled) input?.click();
	}

	function matches(file: File): boolean {
		if (file.size > maxSize) return false;
		if (!accept) return true;
		const type = file.type.toLowerCase();
		const fileName = file.name.toLowerCase();
		return accept.split(',').some((raw) => {
			const rule = raw.trim().toLowerCase();
			if (!rule) return false;
			if (rule.startsWith('.')) return fileName.endsWith(rule);
			if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
			return type === rule;
		});
	}

	function take(list: FileList | File[]) {
		const files = multiple ? [...list] : [...list].slice(0, 1);
		const accepted = files.filter(matches);
		const rejected = files.filter((f) => !matches(f));
		onFiles?.(accepted, rejected);
	}

	const carriesFiles = (e: DragEvent) => !!e.dataTransfer?.types.includes('Files');

	function handleDragEnter(e: DragEvent) {
		if (disabled || !carriesFiles(e)) return;
		e.preventDefault();
		count(depth + 1);
	}

	function handleDragOver(e: DragEvent) {
		if (disabled || !carriesFiles(e)) return;
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
	}

	function handleDragLeave(e: DragEvent) {
		if (disabled || !carriesFiles(e)) return;
		count(depth - 1);
	}

	function handleDrop(e: DragEvent) {
		count(0);
		if (disabled || !e.dataTransfer?.files.length) return;
		e.preventDefault();
		const dropped = e.dataTransfer.files;
		// The file input holds what was dropped, as if picked: a form sees it.
		if (input) {
			const kept = new DataTransfer();
			for (const f of multiple ? [...dropped] : [...dropped].slice(0, 1)) if (matches(f)) kept.items.add(f);
			input.files = kept.files;
		}
		take(dropped);
	}
</script>

<!-- The zone itself is not a control: the content holds the button, or
     `clickable` makes a click anywhere open the dialog. -->
<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
<div
	{...rest}
	class={klass}
	style="position: relative;"
	data-over={over || undefined}
	ondragenter={handleDragEnter}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	onclick={clickable ? (e) => { if (e.target !== input) open(); } : undefined}
>
	{@render children?.({ over, open })}
	<input
		bind:this={input}
		type="file"
		{id}
		{name}
		{accept}
		{multiple}
		{required}
		{disabled}
		tabindex="-1"
		aria-hidden="true"
		style="position: absolute; inset-inline-start: 0; inset-block-end: 0; width: 1px; height: 1px; opacity: 0; pointer-events: none;"
		onchange={(e) => e.currentTarget.files && take(e.currentTarget.files)}
	/>
</div>
