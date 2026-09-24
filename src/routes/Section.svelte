<script lang="ts">
	// A titled showcase block, daisyUI-style: a heading (+ optional subtitle)
	// over a bordered box with tabs. The Preview tab renders live lib
	// components (passed as children); the Svelte / HTML tabs show source.
	// HTML is optional — some demos only make sense via the Svelte component.
	import type { Snippet } from 'svelte';

	let {
		title,
		subtitle,
		svelte: svelteCode,
		html: htmlCode,
		children
	}: {
		title: string;
		subtitle?: string;
		svelte?: string;
		html?: string;
		children: Snippet;
	} = $props();

	type TabId = 'preview' | 'svelte' | 'html';

	// Strip the shared leading indentation so authored source displays flush.
	function dedent(src?: string): string {
		if (!src) return '';
		const lines = src.replace(/^\n/, '').replace(/\s+$/, '').split('\n');
		const indent = Math.min(
			...lines.filter((l) => l.trim()).map((l) => l.match(/^\t*/)?.[0].length ?? 0)
		);
		return lines.map((l) => l.slice(indent)).join('\n');
	}

	let svelteSrc = $derived(dedent(svelteCode));
	let htmlSrc = $derived(dedent(htmlCode));

	let tabs = $derived(
		[
			{ id: 'preview' as const, label: 'Preview' },
			svelteSrc && { id: 'svelte' as const, label: 'Svelte' },
			htmlSrc && { id: 'html' as const, label: 'HTML' }
		].filter(Boolean) as { id: TabId; label: string }[]
	);

	let active = $state<TabId>('preview');
	let code = $derived(active === 'html' ? htmlSrc : svelteSrc);

	/* There is one stylesheet now (ADR 0010), and the build fails if it ships a
	   class no component accounts for — so every class an example writes is a
	   class the kit has. The "this family does not ship it" branch that used to
	   live here has nothing left to detect. */

	let copied = $state(false);
	async function copy() {
		if (!code) return;
		await navigator.clipboard.writeText(code);
		copied = true;
		setTimeout(() => (copied = false), 1200);
	}
</script>

<section class="section">
	<header class="section-head">
		<h2 class="section-title"><span class="section-hash">#</span>{title}</h2>
		{#if subtitle}<p class="section-subtitle">{subtitle}</p>{/if}
	</header>

	<div class="box">
		<div class="box-tabs" role="tablist">
			{#each tabs as t (t.id)}
				<button
					type="button"
					role="tab"
					class="box-tab"
					aria-selected={active === t.id}
					onclick={() => (active = t.id)}
				>{t.label}</button>
			{/each}
		</div>

		{#if active === 'preview'}
			<div class="box-body box-preview">{@render children()}</div>
		{:else}
			<div class="box-body box-code">
				<button type="button" class="box-copy" onclick={copy}>{copied ? 'Copied' : 'Copy'}</button>
				<pre><code>{code}</code></pre>
			</div>
		{/if}
	</div>
</section>

<style>
	.section {
		width: 100%;
		max-width: 56rem;
	}

	.section-head {
		margin-bottom: 0.5rem;
	}

	.section-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
		font-size: 1.4rem;
		font-weight: 800;
		letter-spacing: -0.01em;
		color: var(--color-on-background);
	}

	.section-hash {
		display: grid;
		place-items: center;
		width: 1.6rem;
		height: 1.6rem;
		border-radius: 0.4rem;
		font-size: 0.95rem;
		font-weight: 700;
		color: color-mix(in oklab, var(--color-on-background) 45%, transparent);
		background: color-mix(in oklab, var(--color-on-background) 7%, transparent);
	}

	.section-subtitle {
		margin: 0.35rem 0 0 2.1rem;
		font-size: 0.85rem;
		line-height: 1.4;
		color: color-mix(in oklab, var(--color-on-background) 60%, transparent);
	}

	/* ── Tabbed box ──────────────────────────────────────────────────────── */
	.box {
		border: 1px solid color-mix(in oklab, var(--color-on-background) 12%, transparent);
		border-radius: 0.85rem;
		background: var(--color-background);
		overflow: hidden;
	}

	.box-tabs {
		display: flex;
		gap: 0.15rem;
		padding: 0.4rem 0.5rem 0;
		border-bottom: 1px solid color-mix(in oklab, var(--color-on-background) 10%, transparent);
	}

	.box-tab {
		appearance: none;
		border: 1px solid transparent;
		border-bottom: none;
		background: none;
		font: inherit;
		font-size: 0.85rem;
		font-weight: 600;
		padding: 0.45rem 0.95rem;
		border-radius: 0.55rem 0.55rem 0 0;
		color: color-mix(in oklab, var(--color-on-background) 50%, transparent);
		cursor: pointer;
		margin-bottom: -1px;
		transition: color 0.15s, background 0.15s;
	}
	.box-tab:hover {
		color: var(--color-on-background);
	}
	.box-tab[aria-selected='true'] {
		color: var(--color-on-background);
		background: var(--color-background);
		border-color: color-mix(in oklab, var(--color-on-background) 10%, transparent);
	}

	.box-body {
		min-height: 6rem;
	}

	/* Diagonal hatch backdrop behind the live preview (see screenshot). */
	.box-preview {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 2.5rem 1.5rem;
		background-image: repeating-linear-gradient(
			-45deg,
			transparent,
			transparent 6px,
			color-mix(in oklab, var(--color-on-background) 5%, transparent) 6px,
			color-mix(in oklab, var(--color-on-background) 5%, transparent) 7px
		);
	}

	/* A section that vanished would read as a bug; one that says why is doc. */

	.box-code {
		position: relative;
		background: color-mix(in oklab, var(--color-card) 70%, var(--color-panel));
	}
	.box-code pre {
		margin: 0;
		padding: 1rem 1.1rem;
		overflow-x: auto;
		font-family: ui-monospace, SFMono-Regular, monospace;
		font-size: 0.8rem;
		line-height: 1.55;
		tab-size: 2;
		color: var(--color-on-background);
	}
	.box-copy {
		position: absolute;
		top: 0.55rem;
		right: 0.55rem;
		font: inherit;
		font-size: 0.7rem;
		padding: 0.2rem 0.55rem;
		border: 1px solid color-mix(in oklab, var(--color-on-background) 18%, transparent);
		border-radius: 0.35rem;
		background: var(--color-background);
		color: inherit;
		cursor: pointer;
		opacity: 0.75;
	}
	.box-copy:hover {
		opacity: 1;
	}
</style>
