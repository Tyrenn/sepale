<script lang="ts">
	import ThemeEditor from './ThemeEditor.svelte';
	import Gallery from './Gallery.svelte';
	import { playground, families, resetTheme } from './playground.svelte.js';
	import { serializeTheme, tokensToInlineStyle } from '$lib/theme.js';

	let previewStyle = $derived(tokensToInlineStyle(playground.tokens));

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
		exportTitle = 'theme.css — variables CSS à déposer dans votre projet';
		exportText = serializeTheme(playground.tokens);
		dialog?.showModal();
	}

	async function exportFamily() {
		exportTitle = `${playground.family}.css — classes de la famille (drag & drop)`;
		exportText = 'Chargement…';
		dialog?.showModal();
		try {
			const res = await fetch(`/families/${playground.family}.css`);
			exportText = await res.text();
		} catch {
			exportText = '/* Lancez `npm run build:css` pour générer la famille. */';
		}
	}

	function downloadCurrent() {
		const name = exportTitle.startsWith('theme') ? 'theme.css' : `${playground.family}.css`;
		download(name, exportText);
	}
</script>

<div class="pg">
	<header class="pg-head">
		<h1>u.u — playground</h1>
		<label>
			Famille
			<select bind:value={playground.family} class="pg-btn">
				{#each families as f (f)}<option value={f}>{f}</option>{/each}
			</select>
		</label>
		<span class="spacer"></span>
		<button class="pg-btn" onclick={resetTheme}>Réinitialiser thème</button>
		<button class="pg-btn" onclick={exportFamily}>Exporter famille</button>
		<button class="pg-btn" onclick={exportTheme}>Exporter thème</button>
	</header>

	<aside class="pg-side">
		<ThemeEditor />
	</aside>

	<main class="pg-main">
		<!-- Live preview: edited theme tokens scoped to this subtree. -->
		<div style={previewStyle}>
			<Gallery />
		</div>
	</main>
</div>

<dialog class="pg-export" bind:this={dialog}>
	<div class="pg-export-inner">
		<h3 style="margin-top:0">{exportTitle}</h3>
		<textarea readonly value={exportText}></textarea>
		<div class="pg-row" style="margin-top:0.75rem">
			<button class="pg-btn" onclick={downloadCurrent}>Télécharger</button>
			<button class="pg-btn" onclick={() => navigator.clipboard.writeText(exportText)}>Copier</button>
			<button class="pg-btn" onclick={() => dialog?.close()}>Fermer</button>
		</div>
	</div>
</dialog>
