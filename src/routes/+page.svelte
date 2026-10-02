<script lang="ts">
	// The theme page: parameters on the left, live preview on the right. It is
	// the landing route — the configurator is what this app is for; the
	// component gallery is reachable from the sidebar.
	import ThemeEditor from './ThemeEditor.svelte';
	import ThemePreview from './ThemePreview.svelte';
	import { playground, resetTheme, importTheme } from './playground.svelte.js';
	import { serializeTheme } from '$lib/theme.js';

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
		const blob = new Blob([text], { type: 'text/css' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}

	function exportTheme() {
		exportTitle = `theme — ${playground.theme}.css (CSS variables)`;
		exportText = serializeTheme(playground.tokens);
		dialog?.showModal();
	}

	async function exportFamily() {
		exportTitle = `${playground.family}.css — family classes`;
		exportText = 'Loading…';
		dialog?.showModal();
		try {
			const res = await fetch(`/families/${playground.family}.css`);
			exportText = await res.text();
		} catch {
			exportText = '/* Run `npm run build:css` to generate the family. */';
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
			<button class="btn btn-xs btn-primary" onclick={exportTheme}>Export theme</button>
			<button class="btn btn-xs" onclick={exportFamily}>Export family</button>
			<button class="btn btn-xs" onclick={() => fileInput?.click()}>Import theme</button>
			<input type="file" accept=".css,text/css" hidden bind:this={fileInput} onchange={onImport} />
			<button class="btn btn-xs btn-ghost" onclick={resetTheme}>Reset</button>
		</div>
	</div>
	<div class="editor-body">
		<ThemeEditor />
	</div>
</aside>

<main class="content content-preview" id="preview">
	<ThemePreview />
</main>

<dialog class="export" bind:this={dialog}>
	<div class="export-inner">
		<h3 style="margin-top:0">{exportTitle}</h3>
		<textarea class="export-text" readonly value={exportText}></textarea>
		<div class="export-row">
			<button class="btn btn-sm btn-primary" onclick={downloadCurrent}>Download</button>
			<button class="btn btn-sm" onclick={() => navigator.clipboard.writeText(exportText)}>Copy</button>
			<button class="btn btn-sm btn-ghost" onclick={() => dialog?.close()}>Close</button>
		</div>
	</div>
</dialog>
