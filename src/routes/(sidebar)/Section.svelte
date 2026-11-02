<script lang="ts">
	// A titled showcase block, daisyUI-style: a heading (+ optional subtitle)
	// over a bordered box with tabs. The Preview tab renders live lib
	// components (passed as children); the Svelte / HTML tabs show source.
	// HTML is optional — some demos only make sense via the Svelte component.
	import type { Snippet } from 'svelte';
	import { classesByFamily, knownClasses } from './components/doc.js';
	import { playground } from '../playground.svelte.js';

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

	/* The chrome's own sliding indicator (the kit's Tabs, renamed ui-):
	   measured under the selected tab after every change. */
	let strip: HTMLDivElement | undefined = $state();
	let mark = $state({ x: 0, y: 0, w: 0, h: 0 });
	$effect(() => {
		void active;
		void tabs.length;
		if (!strip) return;
		const measure = () => {
			const tab = strip?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
			if (tab) mark = { x: tab.offsetLeft, y: tab.offsetTop, w: tab.offsetWidth, h: tab.offsetHeight };
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(strip);
		return () => observer.disconnect();
	});
	let code = $derived(active === 'html' ? htmlSrc : svelteSrc);

	/**
	 * An example demonstrates classes; a family that does not ship them would
	 * render it as a lie — an unstyled button labelled "soft". So the section
	 * says so instead of showing it.
	 *
	 * The list is read from the example's own HTML sample: nothing to declare,
	 * and it cannot drift from what the example actually writes. A class the
	 * kit has never heard of is the app's own markup and is ignored.
	 */
	let missing = $derived.by(() => {
		if (!htmlSrc) return [];
		const shipped = classesByFamily[playground.family] ?? {};
		const used = new Set<string>();
		for (const m of htmlSrc.matchAll(/class="([^"]+)"/g)) {
			for (const cls of m[1]!.split(/\s+/)) {
				if (knownClasses.has(cls) && !(cls in shipped)) used.add(cls);
			}
		}
		return [...used].sort();
	});

	/* Naming who does have it turns a hidden example into a comparison: the
	   reader learns the variant exists and where to find it. */
	let elsewhere = $derived(
		missing.length
			? Object.keys(classesByFamily)
					.filter((f) => f !== playground.family && missing.every((c) => c in classesByFamily[f]!))
					.sort()
			: []
	);

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
		<div
			class="ui-tabs ui-tabs-box ui-tabs-sm box-tabs"
			role="tablist"
			bind:this={strip}
			style:--ui-tabs-x="{mark.x}px"
			style:--ui-tabs-y="{mark.y}px"
			style:--ui-tabs-w="{mark.w}px"
			style:--ui-tabs-h="{mark.h}px"
		>
			<span class="ui-tabs-item ui-tabs-item-active ui-tabs-indicator" aria-hidden="true"></span>
			{#each tabs as t (t.id)}
				<button
					type="button"
					role="tab"
					class="ui-tabs-item box-tab"
					class:ui-tabs-item-active={active === t.id}
					aria-selected={active === t.id}
					onclick={() => (active = t.id)}
				>{t.label}</button>
			{/each}
		</div>

		{#if missing.length}
			<p class="box-body box-absent">
				{playground.family} does not ship
				{#each missing as cls, i (cls)}<code>.{cls}</code>{i < missing.length - 1
						? ', '
						: ''}{/each}, so this example has nothing to show.{#if elsewhere.length}{' '}It belongs to {elsewhere.join(', ')}.{/if}
			</p>
		{:else}
			<!-- Every pane is rendered, stacked in one grid cell; only the
			     active one shows. The box is as tall as the tallest, so
			     switching tabs never moves the page. -->
			<div class="box-stack">
				<div class="box-body box-preview uu-island" hidden={active !== 'preview'}>
					{@render children()}
				</div>
				{#each [['svelte', svelteSrc], ['html', htmlSrc]] as [id, src] (id)}
					{#if src}
						<div class="box-body box-code" hidden={active !== id}>
							<button type="button" class="box-copy" onclick={copy}>{copied ? 'Copied' : 'Copy'}</button>
							<pre><code>{src}</code></pre>
						</div>
					{/if}
				{/each}
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
		color: var(--app-fg);
	}

	.section-hash {
		display: grid;
		place-items: center;
		width: 1.6rem;
		height: 1.6rem;
		border-radius: 0.4rem;
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--ui-color-primary);
		background: color-mix(in oklab, var(--ui-color-primary) 12%, transparent);
	}

	.section-subtitle {
		margin: 0.35rem 0 0 2.1rem;
		font-size: 0.85rem;
		line-height: 1.4;
		color: color-mix(in oklab, var(--app-fg) 60%, transparent);
	}

	/* ── Tabbed box ──────────────────────────────────────────────────────── */
	.box {
		border-radius: 1rem;
		background: var(--app-bg);
		overflow: hidden;
		box-shadow:
			0 1px 2px color-mix(in oklab, var(--app-fg) 6%, transparent),
			0 0.75rem 2rem -1rem color-mix(in oklab, var(--ui-color-primary) 35%, transparent);
	}
	.box-tabs + * {
		margin-top: 0.5rem;
	}

	.box-tabs {
		margin: 0.5rem 0.5rem 0;
		width: fit-content;
	}

	.box-body {
		min-height: 6rem;
	}

	.box-stack {
		display: grid;
	}
	/* `hidden` keeps its box in the grid cell but paints nothing. */
	.box-stack > .box-body {
		grid-area: 1 / 1;
	}
	.box-stack > [hidden] {
		visibility: hidden;
	}
	.box-stack > .box-preview[hidden] {
		display: flex;
	}
	.box-stack > .box-code[hidden] {
		display: block;
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
			color-mix(in oklab, var(--pv-fg) 5%, transparent) 6px,
			color-mix(in oklab, var(--pv-fg) 5%, transparent) 7px
		);
	}

	/* A section that vanished would read as a bug; one that says why is doc. */
	.box-absent {
		margin: 0;
		padding: 1.5rem;
		font-size: 0.85rem;
		line-height: 1.5;
		color: color-mix(in oklab, var(--app-fg) 60%, transparent);
	}
	.box-absent code {
		font-family: ui-monospace, SFMono-Regular, monospace;
		font-size: 0.85em;
		padding: 0.1em 0.3em;
		border-radius: 0.3rem;
		background: color-mix(in oklab, var(--app-fg) 8%, transparent);
	}

	.box-code {
		position: relative;
		background: color-mix(in oklab, var(--app-bg-2) 70%, var(--app-bg-3));
	}
	.box-code pre {
		margin: 0;
		padding: 1rem 1.1rem;
		overflow-x: auto;
		font-family: ui-monospace, SFMono-Regular, monospace;
		font-size: 0.8rem;
		line-height: 1.55;
		tab-size: 2;
		color: var(--app-fg);
	}
	.box-copy {
		position: absolute;
		top: 0.55rem;
		right: 0.55rem;
		font: inherit;
		font-size: 0.7rem;
		padding: 0.2rem 0.55rem;
		border: 1px solid color-mix(in oklab, var(--app-fg) 18%, transparent);
		border-radius: 0.35rem;
		background: var(--app-bg);
		color: inherit;
		cursor: pointer;
		opacity: 0.75;
	}
	.box-copy:hover {
		opacity: 1;
	}
</style>
