<script lang="ts">
	// The theme page: parameters on the left, live preview on the right.
	import ThemeEditor from '../ThemeEditor.svelte';
	import ThemePreview from '../ThemePreview.svelte';
	import {
		playground,
		resetTheme,
		importTheme,
		isLocal,
		stylesheetText
	} from '../../playground.svelte.js';
	import { serializeTheme } from '$lib/theme.js';
	import { buildBundle } from '../bundle.js';

	/* Open a theme `.css` from disk: the round trip of Export theme. */
	let fileInput = $state<HTMLInputElement | null>(null);
	async function onImport(e: Event & { currentTarget: HTMLInputElement }) {
		/* Held before the await: `currentTarget` is null once the event is over. */
		const input = e.currentTarget;
		const file = input.files?.[0];
		if (!file) return;
		importTheme(await file.text(), file.name.replace(/\.css$/, ''));
		input.value = '';
	}

	let dialog = $state<HTMLDialogElement | null>(null);
	let exportTitle = $state('');
	let exportText = $state('');

	function download(filename: string, text: string) {
		save(filename, new Blob([text], { type: 'text/css' }));
	}

	function save(filename: string, blob: Blob) {
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}

	function exportTheme() {
		exportTitle = `theme — ${playground.theme}.css (CSS variables)`;
		exportText = serializeTheme(playground.tokens, playground.scheme);
		dialog?.showModal();
	}

	let bundleDialog = $state<HTMLDialogElement | null>(null);
	let bundleSvelte = $state(true);
	let bundleReset = $state(false);
	let bundling = $state(false);
	let bundleError = $state('');

	async function downloadBundle() {
		bundling = true;
		bundleError = '';
		try {
			const { name, blob } = await buildBundle({
				family: playground.family,
				theme: playground.theme,
				scheme: playground.scheme,
				tokens: playground.tokens,
				svelte: bundleSvelte,
				reset: bundleReset
			});
			save(name, blob);
			bundleDialog?.close();
		} catch (e) {
			bundleError = e instanceof Error ? e.message : String(e);
		} finally {
			bundling = false;
		}
	}

	async function exportFamily() {
		exportTitle = `${playground.family}.css — family classes`;
		exportText = 'Loading…';
		dialog?.showModal();
		try {
			exportText = await stylesheetText(playground.family);
		} catch {
			exportText = '/* Run `pnpm run build:css` to generate the family. */';
		}
	}

	function downloadCurrent() {
		const isTheme = exportTitle.startsWith('theme');
		download(isTheme ? `${playground.theme}.css` : `${playground.family}.css`, exportText);
	}
</script>

<!-- Second column, against the sidebar: the parameters of the active theme.
     It exists on this page only — on a component page it would eat 21rem of
     preview for controls nobody is using. -->
<aside class="editor">
	<div class="editor-head">
		<strong class="editor-name">{playground.theme}</strong>
		<div class="editor-actions">
			<button class="ui-btn ui-btn-xs ui-btn-primary" onclick={() => bundleDialog?.showModal()}>Download bundle</button>
			<button class="ui-btn ui-btn-xs" onclick={exportTheme}>Export theme</button>
			<button class="ui-btn ui-btn-xs" onclick={exportFamily}>Export family</button>
			<button class="ui-btn ui-btn-xs" onclick={() => fileInput?.click()}>Import theme</button>
			<input type="file" accept=".css,text/css" hidden bind:this={fileInput} onchange={onImport} />
			<button class="ui-btn ui-btn-xs ui-btn-ghost" onclick={resetTheme}>Reset</button>
		</div>
	</div>
	<div class="editor-body">
		<ThemeEditor />
	</div>
</aside>

<main class="content content-preview uu-island" id="preview">
	<ThemePreview />
</main>

<dialog class="export" bind:this={bundleDialog}>
	<div class="export-inner">
		<h3 style="margin-top:0">Download a bundle</h3>
		<p class="bundle-note">
			A zip of {playground.family}’s stylesheet and your theme, <strong>{playground.theme}</strong>, with your edits. A snapshot:
			it never updates.
		</p>
		<label class="bundle-option">
			<input type="checkbox" bind:checked={bundleSvelte} />
			{#if isLocal(playground.family)}
				The Svelte components, generic: {playground.family} was loaded from disk, so no copy
				narrowed to it exists
			{:else}
				The Svelte components, written for {playground.family} alone
			{/if}
		</label>
		<label class="bundle-option">
			<input type="checkbox" bind:checked={bundleReset} />
			The optional page reset
		</label>
		{#if bundleError}<p class="bundle-note" role="alert">{bundleError}</p>{/if}
		<div class="export-row">
			<button class="ui-btn ui-btn-sm ui-btn-primary" disabled={bundling} onclick={downloadBundle}>
				{bundling ? 'Preparing…' : 'Download'}
			</button>
			<button class="ui-btn ui-btn-sm ui-btn-ghost" onclick={() => bundleDialog?.close()}>Close</button>
		</div>
	</div>
</dialog>

<dialog class="export" bind:this={dialog}>
	<div class="export-inner">
		<h3 style="margin-top:0">{exportTitle}</h3>
		<textarea class="export-text" readonly value={exportText}></textarea>
		<div class="export-row">
			<button class="ui-btn ui-btn-sm ui-btn-primary" onclick={downloadCurrent}>Download</button>
			<button class="ui-btn ui-btn-sm" onclick={() => navigator.clipboard.writeText(exportText)}>Copy</button>
			<button class="ui-btn ui-btn-sm ui-btn-ghost" onclick={() => dialog?.close()}>Close</button>
		</div>
	</div>
</dialog>
