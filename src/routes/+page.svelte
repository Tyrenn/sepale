<script lang="ts">
	import { generator, view, css, reset, toggleSection } from '$lib/theme/store.svelte.js';
	import { isGroup, type Control as Ctl } from '$lib/theme/schema.js';
	import type { ViewEntry } from '$lib/theme/store.svelte.js';
	import { scheme } from '$lib/theme/sections/colors.js';
	import Control from './Control.svelte';
	import Group from './Group.svelte';
	import Palette from './Palette.svelte';
	import Card from '$lib/components/Card.svelte';
	import { slide } from 'svelte/transition';

	/**
	 * The theme generator.
	 *
	 * This page is the product (ADR 0010): the kit is one stylesheet, and
	 * everything that used to be a family is a set of values you reach from
	 * here.
	 *
	 * `kit.css` is loaded once, by the layout. Nothing ever swaps a stylesheet
	 * — the whole look is one block of custom properties the layout injects,
	 * which is why the preview is instant and why what you download is what
	 * you saw.
	 *
	 * The form shows two grains of the same variables (ADR 0011). Ticking
	 * Advanced changes which controls are on screen and writes nothing.
	 */

	let sections = $derived(view());

	/**
	 * Consecutive bare colour controls are one palette; everything else is
	 * itself. Grouping them here rather than in the section keeps the data a
	 * flat list — a `Fill` group around two tiles was a frame with nothing to
	 * frame.
	 */
	type Run =
		| { palette: true; controls: Ctl[]; entries: never[] }
		| { palette: false; controls: never[]; entries: ViewEntry[] };

	function runs(entries: ViewEntry[]): Run[] {
		const out: Run[] = [];
		for (const e of entries) {
			const bare = !isGroup(e.entry) && e.entry.type === 'color';
			const last = out.at(-1);
			if (bare && last?.palette) last.controls.push(e.entry as Ctl);
			else if (bare) out.push({ palette: true, controls: [e.entry as Ctl], entries: [] });
			else if (last && !last.palette) last.entries.push(e);
			else out.push({ palette: false, controls: [], entries: [e] });
		}
		return out;
	}
	let text = $derived(css());

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(text);
		copied = true;
		setTimeout(() => (copied = false), 1200);
	}

</script>

<main class="content gen">
	<section class="form">
		<header class="form-head">
			<h1>Theme</h1>

			<!-- The first thing you answer, and the one that is not a section. -->
			<div class="top">
				<Control control={scheme} />
				<label class="adv">
					<input type="checkbox" class="toggle toggle-xs" bind:checked={generator.advanced} />
					Advanced
				</label>
				<button class="btn btn-xs btn-ghost" onclick={copy}>{copied ? 'copied' : 'copy CSS'}</button>
			</div>
			<p class="note">
				Advanced splits the settings every section shares — border, corners, focus, disabled, the
				hand-drawn look — back into the sections they belong to. It changes what is on screen and
				nothing else: nothing is written until you move something.
			</p>

		</header>

		{#each sections as section (section.id)}
			{@const open = generator.open.includes(section.id)}
			<section class="section" class:section-open={open}>
				<button
					type="button"
					class="section-head"
					aria-expanded={open}
					onclick={() => toggleSection(section.id)}
				>
					<span class="section-chevron" aria-hidden="true"></span>
					<span class="section-name">{section.label}</span>
					<span class="section-count">{section.entries.length}</span>
				</button>
				<!-- Under the title and outside the fold: what a section is for is
				     most useful when it is shut and you are looking for one. -->
				{#if section.help}<p class="section-help">{section.help}</p>{/if}

				<!-- The controls of a folded section do not exist. `slide` then
				     animates their arrival and their leaving for free, and there is
				     no height for anyone to measure. -->
				{#if open}
					<div class="section-body" transition:slide={{ duration: 220 }}>
						{#each runs(section.entries) as run, i (i)}
							{#if run.palette}
								<!-- A run of bare colour controls is a palette wherever it
								     is: tiles side by side, the name underneath. -->
								<Palette controls={run.controls} />
							{:else}
								{#each run.entries as entry (entry.entry.id)}
									{#if isGroup(entry.entry)}
										<Group group={entry.entry} peers={entry.peers} under={section.id === 'colors'} />
									{:else if entry.entry.id !== 'color-scheme'}
										<Control control={entry.entry} />
									{/if}
								{/each}
							{/if}
						{/each}
					</div>
				{/if}
			</section>
		{/each}
	</section>

		<section class="preview">
		<Card border class="pv-card">
			{#snippet title()}Buttons{/snippet}
			<div class="row">
				<button class="btn btn-xs">Xsmall</button>
				<button class="btn btn-sm">Small</button>
				<button class="btn">Medium</button>
				<button class="btn btn-lg">Large</button>
				<button class="btn btn-xl">Xlarge</button>
			</div>
			<div class="row">
				<button class="btn">Default</button>
				<button class="btn btn-primary">Primary</button>
				<button class="btn btn-secondary">Secondary</button>
				<button class="btn btn-accent">Accent</button>
				<button class="btn btn-info">Info</button>
				<button class="btn btn-success">Success</button>
				<button class="btn btn-warning">Warning</button>
				<button class="btn btn-error">Error</button>
			</div>
			<div class="row">
				<button class="btn btn-outline">Outline</button>
				<button class="btn btn-dash">Dash</button>
				<button class="btn btn-soft">Soft</button>
				<button class="btn btn-ghost">Ghost</button>
				<button class="btn btn-link">Link</button>
				<button class="btn btn-surface">Surface</button>
				<button class="btn btn-classic">Classic</button>
			</div>
			<div class="row">
				<button class="btn btn-active">Active</button>
				<button class="btn" disabled>Disabled</button>
				<button class="btn btn-square">S</button>
				<button class="btn btn-circle">C</button>
				<button class="btn btn-reverse">Reverse</button>
				<button class="btn btn-noshadow">No shadow</button>
			</div>

		</Card>
		<Card border class="pv-card">
			{#snippet title()}Fields{/snippet}
			<div class="row">
				<input class="input" placeholder="Placeholder" />
				<input class="input input-primary" placeholder="Primary" />
				<input class="input input-error" placeholder="Error" />
				<input class="input" placeholder="Disabled" disabled />
				<input class="input input-ghost" placeholder="Ghost" />
			</div>
			<div class="row">
				<select class="select"><option>Choose one</option><option>Two</option></select>
				<select class="select select-primary"><option>Primary</option></select>
				<select class="select" disabled><option>Disabled</option></select>
				<input class="input input-sm" placeholder="Small" />
				<input class="input input-lg" placeholder="Large" />
			</div>
			<div class="row">
				<textarea class="textarea" placeholder="A text area is a box, and takes a hand-drawn corner differently from a control."
				></textarea>
				<textarea class="textarea" placeholder="Disabled" disabled></textarea>
			</div>

		</Card>
		<Card border class="pv-card">
			{#snippet title()}Selectors{/snippet}
			<div class="row">
				<input type="checkbox" class="checkbox" />
				<input type="checkbox" class="checkbox" checked />
				<input type="checkbox" class="checkbox checkbox-primary" checked />
				<input type="checkbox" class="checkbox checkbox-error" checked />
				<input type="checkbox" class="checkbox" disabled />
				<input type="radio" name="p" class="radio" />
				<input type="radio" name="p" class="radio" checked />
				<input type="radio" name="q" class="radio radio-primary" checked />
				<input type="checkbox" class="toggle" />
				<input type="checkbox" class="toggle" checked />
				<input type="checkbox" class="toggle toggle-primary" checked />
				<input type="checkbox" class="toggle" disabled />
			</div>

			<div class="row">
				<input type="range" class="range" value="40" style="width:12rem" />
				<input type="range" class="range range-primary" value="70" style="width:12rem" />
				<span class="swatch" style="--swatch-color:#1677ff">A</span>
				<span class="swatch swatch-active" style="--swatch-color:#e5484d">B</span>
				<span class="swatch swatch-circle" style="--swatch-color:#30a46c">C</span>
				<span class="swatch" style="--swatch-color:#0000">T</span>
			</div>
			<div class="row">
				<div class="tabs tabs-box">
					<button class="tabs-item">One</button>
					<button class="tabs-item tabs-item-active">Two</button>
					<button class="tabs-item">Three</button>
				</div>
				<div class="tabs tabs-border">
					<button class="tabs-item">One</button>
					<button class="tabs-item tabs-item-active">Two</button>
					<button class="tabs-item">Three</button>
				</div>
			</div>

		</Card>
		<Card border class="pv-card">
			{#snippet title()}Labels, files and validation{/snippet}
			<div class="row">
				<label class="input"><span class="label">https://</span><input placeholder="site" /></label>
				<label class="input"><input placeholder="amount" /><span class="label">EUR</span></label>
				<label class="floating-label">
					<span>Filled</span>
					<input class="input" value="Ada Lovelace" placeholder="Filled" />
				</label>
			</div>
			<div class="row">
				<input type="file" class="file-input" />
				<input type="file" class="file-input" disabled />
				<div class="col">
					<input class="input validator" type="email" value="not-an-email" required />
					<p class="validator-hint">Enter a valid email address</p>
				</div>
			</div>

		</Card>
		<Card border class="pv-card">
			{#snippet title()}Containers{/snippet}
			<nav class="navbar">
				<div class="navbar-start"><strong>Brand</strong></div>
				<div class="navbar-end"><button class="btn btn-sm">Sign in</button></div>
			</nav>
			<div class="row">
				<ul class="menu" style="width:13rem">
					<li class="menu-title">Group</li>
					<li><a href="#preview">Dashboard</a></li>
					<li><a class="menu-active" href="#preview">Projects</a></li>
					<li class="menu-divider"></li>
					<li><a class="menu-disabled" href="#preview">Archived</a></li>
				</ul>
				<ul class="list" style="width:14rem">
					<li class="list-row"><span>Ada Lovelace</span></li>
					<li class="list-row"><span>Alan Turing</span></li>
				</ul>
				<div class="join">
					<input class="input join-item" placeholder="Search" />
					<button class="btn join-item btn-primary">Go</button>
				</div>
			</div>

		</Card>
		<Card border class="pv-card">
			{#snippet title()}Markers, feedback and text{/snippet}
			<div class="row">
				<span class="chip">Default</span>
				<span class="chip chip-primary">Primary</span>
				<span class="chip chip-soft chip-error">Soft error</span>
				<span class="badge"
					><button class="btn btn-sm">Inbox</button><span class="chip chip-error">9</span></span
				>
				<nav class="breadcrumbs">
					<ul>
						<li><a href="#preview">Home</a></li>
						<li>Current</li>
					</ul>
				</nav>
			</div>
			<div class="row">
				<progress class="progress" value="40" max="100" style="width:10rem"></progress>
				<progress class="progress progress-primary" value="70" max="100" style="width:10rem"></progress>
				<div class="radial-progress" style="--value:65">65%</div>
				<span class="loading"></span>
				<span class="loading loading-dots"></span>
				<div class="skeleton" style="width:8rem;height:2rem"></div>
			</div>
			<p class="text">
				Body text with <a class="link" href="#preview">a link</a> and
				<a class="link link-primary" href="#preview">a primary one</a>.
			</p>

		</Card>
		<Card border class="pv-card">
			{#snippet title()}The file{/snippet}
			<p class="note">
				Only what differs from neutral. The three <code>--action-corner</code> /
				<code>-shadow</code> / <code>-press</code> lines are sentinels: no stylesheet reads them, they
				are how a theme comes back as a draft rather than as numbers.
			</p>
			<pre class="file">{css}</pre>
		</Card>
	</section>
</main>

<style>
	/* The preview reads as a set of cards, one per section — which is also the
	   first real use of the card, and the reason it was worth having. */
	:global(.preview .pv-card) {
		margin-bottom: 1.1rem;
	}

	/* Small, and tight under the title: it is a caption, not a paragraph. */
	.section-help {
		font-size: 0.72rem;
		opacity: 0.6;
		line-height: 1.4;
		margin: -0.1rem 0 0.35rem 1.1rem;
	}

	/* Two columns that scroll on their own.
	   `.content` is the app's scroller, and letting it scroll both together
	   means losing the form the moment you look at the preview — which is the
	   one thing you are doing while you edit. So this page takes the height
	   and hands each column its own overflow. `min-height: 0` is what lets a
	   grid child shrink below its content and actually scroll. */
	.gen {
		display: grid;
		grid-template-columns: minmax(18rem, 24rem) 1fr;
		gap: 2rem;
		align-items: stretch;
		height: 100%;
		min-height: 0;
		padding: 0;
		overflow: hidden;
	}
	.gen > :global(section) {
		min-height: 0;
		overflow-y: auto;
		padding: 2rem 1rem 3rem 2rem;
	}
	@media (max-width: 60rem) {
		.gen {
			grid-template-columns: 1fr;
			height: auto;
			overflow: visible;
		}
		.gen > :global(section) {
			overflow: visible;
		}
	}
	.form-head h1 {
		margin: 0 0 0.5rem;
		font-size: 1.1rem;
	}
	.note {
		margin: 0.3rem 0 0;
		font-size: 0.7rem;
		line-height: 1.45;
		opacity: 0.6;
	}
	.section {
		border-top: 1px solid color-mix(in oklab, currentColor 15%, transparent);
		margin-top: 1rem;
	}
	.section-head {
		appearance: none;
		display: flex;
		align-items: center;
		gap: 0.45rem;
		width: 100%;
		padding: 0.65rem 0;
		border: none;
		background: none;
		color: inherit;
		cursor: pointer;
		text-align: start;
	}
	.section-chevron {
		width: 0.42rem;
		height: 0.42rem;
		border-right: 1.5px solid currentColor;
		border-bottom: 1.5px solid currentColor;
		rotate: -45deg;
		opacity: 0.55;
		transition: rotate 0.22s ease;
	}
	.section-open .section-chevron {
		rotate: 45deg;
	}
	.section-count {
		margin-inline-start: auto;
	}

	.section-body {
		padding-bottom: 0.6rem;
	}
	@media (prefers-reduced-motion: reduce) {
		.section-chevron {
			transition: none;
		}
	}
	.section-name {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
	.section-count {
		font-size: 0.7rem;
		opacity: 0.45;
	}
	.col {
		display: flex;
		flex-direction: column;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
		padding: 0.6rem 0;
	}
	.file {
		margin: 0.5rem 0 0;
		padding: 0.75rem;
		border: 1px solid color-mix(in oklab, currentColor 15%, transparent);
		font-family: ui-monospace, monospace;
		font-size: 0.7rem;
		line-height: 1.5;
		overflow-x: auto;
		max-height: 24rem;
	}
</style>
