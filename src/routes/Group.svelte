<script lang="ts">
	/**
	 * A named, enclosed set of controls — Border, Shadow, Press animation.
	 *
	 * A group may have a **type**: its own exclusive setting, rendered as tabs,
	 * which decides how many controls appear under it. A group whose type is
	 * the whole group is what used to be called an *effect*; one concept
	 * fewer, not one more (CONTEXT.md).
	 *
	 * On/off groups — Hand-drawn is the only one — are a two-mode type, and a
	 * checkbox reads better than two tabs for a yes/no.
	 */
	import { slide } from 'svelte/transition';
	import type { Group } from '$lib/theme/schema.js';
	import { readMode } from '$lib/theme/schema.js';
	import { diverges, generator, setMode } from '$lib/theme/store.svelte.js';
	import Control from './Control.svelte';
	import Palette from './Palette.svelte';

	let {
		group,
		peers = [],
		/* Colours names its tiles UNDER them, because a row of swatches reads
		   as a palette. Everywhere else a colour is one control among sliders,
		   and its name belongs on the left with all the others. */
		under = false
	}: { group: Group; peers?: Group[]; under?: boolean } = $props();

	let mode = $derived(readMode(group, generator.vars));
	let shown = $derived(group.type?.modes.find((m) => m.id === mode));
	let onOff = $derived(
		group.type?.modes.length === 2 && group.type.modes[0].id === 'off'
	);
	/* Colour boxes sit side by side so a group reads as ONE setting; sliders
	   stack. That is the whole difference the layout makes. */
	let row = $derived(
		group.layout === 'row' ||
			(group.layout === undefined &&
				group.controls.length > 0 &&
				group.controls.every((c) => c.type === 'color'))
	);
</script>

<section class="grp">
	<header>
		<h4 title={group.help ?? ''}>
			{group.label}
			{#if diverges(group, peers)}
				<span class="ne" title="Sections disagree. Touching this realigns them.">≠</span>
			{/if}
		</h4>

		{#if group.type && onOff}
			<input
				type="checkbox"
				class="toggle toggle-xs"
				checked={mode === 'on'}
				onchange={(e) => setMode(group, e.currentTarget.checked ? 'on' : 'off', peers)}
			/>
		{:else if group.type}
			<!-- The kit's tab is `.tabs-item`, and it is built for radio inputs —
			     which is what an exclusive choice already is. `.tab` never
			     existed, which is why this read as run-together text. -->
			<div class="tabs tabs-box tabs-xs" role="tablist">
				{#each group.type.modes as m (m.id)}
					<input
						type="radio"
						class="tabs-item"
						name="mode-{group.id}"
						aria-label={m.label}
						title={m.help ?? ''}
						checked={mode === m.id}
						onchange={() => setMode(group, m.id, peers)}
					/>
				{/each}
			</div>
		{/if}
	</header>

	{#if group.help && !onOff}<p class="help">{group.help}</p>{/if}

	<div class="body" class:row>
		{#if under && group.controls.some((c) => c.type === 'color')}
			<Palette controls={group.controls} {group} {peers} />
		{:else}
			{#each group.controls as c (c.id)}
				<Control control={c} {group} {peers} />
			{/each}
		{/if}

		{#if shown?.controls.length}
			<div class="revealed" class:row transition:slide={{ duration: 180 }}>
				{#if shown.help}<p class="help">{shown.help}</p>{/if}
				{#each shown.controls as c (c.id)}
					<Control control={c} {group} {peers} />
				{/each}
			</div>
		{/if}
	</div>
</section>

<style>
	/* `.tabs` wraps by default, which is right on a page and wrong in a column
	   this narrow: three options became two lines that overlapped. */
	header :global(.tabs) {
		flex-wrap: nowrap;
		min-width: 0;
	}
	header :global(.tabs-item) {
		min-width: 0;
		padding-inline: 0.45rem;
		font-size: 0.7rem;
	}
	.grp {
		border: 1px solid color-mix(in oklab, currentColor 12%, #0000);
		border-radius: 0.45rem;
		padding: 0.5rem 0.6rem 0.6rem;
		margin: 0.45rem 0;
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		min-height: 1.6rem;
	}
	h4 {
		font-size: 0.78rem;
		font-weight: 600;
		margin: 0;
		letter-spacing: 0.01em;
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}
	.ne {
		font-size: 0.85rem;
		opacity: 0.75;
		cursor: help;
	}
	.help {
		font-size: 0.7rem;
		opacity: 0.6;
		line-height: 1.35;
		margin: 0.25rem 0 0.1rem;
	}
	.body.row,
	.revealed.row {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: 0.6rem;
	}
	.revealed:not(.row) {
		margin-top: 0.2rem;
	}
</style>
