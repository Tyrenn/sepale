<script lang="ts">
	import { SECTIONS, generator, themeCss } from '$lib/theme/store.svelte.js';
	import Control from './Control.svelte';

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
	 */

	let css = $derived(themeCss());

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(css);
		copied = true;
		setTimeout(() => (copied = false), 1200);
	}
</script>

<main class="content gen">
	<section class="form">
		<header class="form-head">
			<h1>Theme</h1>
			<p class="note">
				Pick a theme in the sidebar to start from one, or work up from neutral. The switch beside it
				stops the draft painting this form — a look is judged on a real page, but a draft can push
				the contrast far enough that you cannot find the slider that did it.
			</p>
			<div class="presets">
				<button class="btn btn-xs btn-ghost" onclick={() => (generator.draft = {})}>
					back to neutral
				</button>
			</div>
		</header>

		{#each SECTIONS as section (section.id)}
			<details class="section" open={section.id === 'actions'}>
				<summary>
					<span class="section-name">{section.label}</span>
					<span class="section-count">{section.controls.length}</span>
				</summary>
				{#if section.help}<p class="note">{section.help}</p>{/if}
				{#each section.controls as control (control.id)}
					<Control {control} />
				{/each}
			</details>
		{/each}
	</section>

	<section class="preview">
		<h2>Buttons</h2>
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

		<h2>Fields</h2>
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

		<h2>Selectors</h2>
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

		<h2>Labels, files and validation</h2>
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

		<h2>Containers</h2>
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

		<h2>Markers, feedback and text</h2>
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

		<h2>
			The file
			<button class="btn btn-xs" onclick={copy}>{copied ? 'copied' : 'copy'}</button>
		</h2>
		<p class="note">
			Only what differs from neutral. The three <code>--action-corner</code> /
			<code>-shadow</code> / <code>-press</code> lines are sentinels: no stylesheet reads them, they
			are how a preset above comes back as a draft rather than as numbers.
		</p>
		<pre class="file">{css}</pre>
	</section>
</main>

<style>
	.gen {
		display: grid;
		grid-template-columns: minmax(18rem, 24rem) 1fr;
		gap: 2rem;
		align-items: start;
	}
	@media (max-width: 60rem) {
		.gen {
			grid-template-columns: 1fr;
		}
	}
	.form-head h1 {
		margin: 0 0 0.5rem;
		font-size: 1.1rem;
	}
	.presets {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin-top: 0.6rem;
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
		padding-top: 0.5rem;
	}
	summary {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		cursor: pointer;
		list-style: none;
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
	.preview h2 {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		opacity: 0.55;
		margin: 1.75rem 0 0.6rem;
		display: flex;
		align-items: center;
		gap: 0.6rem;
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
