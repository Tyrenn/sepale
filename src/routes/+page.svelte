<script lang="ts">
	import ThemeEditor from './ThemeEditor.svelte';
	import Showcase from './Showcase.svelte';
	import {
		playground,
		families,
		COMPONENTS,
		themesFor,
		categoryFor,
		selectFamily,
		selectTheme,
		resetTheme
	} from './playground.svelte.js';
	import { serializeTheme } from '$lib/theme.js';

	let themes = $derived(themesFor(playground.family));
	let editing = $state(false);

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

<div class="shell">
	<aside class="side">
		<div class="side-head">
			<label class="side-select">
				<span>Family</span>
				<select
					class="select select-sm"
					value={playground.family}
					onchange={(e) => selectFamily(e.currentTarget.value as typeof playground.family)}
				>
					{#each families as f (f)}<option value={f}>{f} ({categoryFor(f)})</option>{/each}
				</select>
			</label>
			<label class="side-select">
				<span>Theme</span>
				<select
					class="select select-sm"
					value={playground.theme}
					onchange={(e) => selectTheme(e.currentTarget.value)}
				>
					{#each themes as t (t.name)}<option value={t.name}>{t.label}</option>{/each}
				</select>
			</label>
			<button class="btn btn-sm btn-block" onclick={() => (editing = !editing)}>
				{editing ? 'Close editor' : 'Customize theme'}
			</button>

			<!-- Export actions, right under the customise button. -->
			<div class="side-export">
				<button class="btn btn-sm btn-primary" onclick={exportTheme}>Export theme</button>
				<button class="btn btn-sm" onclick={exportFamily}>Export family</button>
			</div>
		</div>

		<nav class="side-nav">
			{#each COMPONENTS as group (group.group)}
				<p class="side-group">{group.group}</p>
				<ul class="side-list">
					{#each group.items as item (item.id)}
						<li>
							<a
								href="#{item.id}"
								class="side-link"
								data-active={playground.component === item.id}
								onclick={(e) => {
									e.preventDefault();
									playground.component = item.id;
								}}
							>
								{item.label}
							</a>
						</li>
					{/each}
				</ul>
			{/each}
		</nav>
	</aside>

	<main class="content">
		<Showcase component={playground.component} />
	</main>

	{#if editing}
		<aside class="editor">
			<div class="editor-head">
				<strong>Theme — {playground.theme}</strong>
				<button class="btn btn-xs btn-ghost" onclick={resetTheme}>Reset</button>
			</div>
			<div class="editor-body">
				<ThemeEditor />
			</div>
		</aside>
	{/if}
</div>

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
