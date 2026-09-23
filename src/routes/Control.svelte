<script lang="ts">
	import type { Control, Sides } from '$lib/theme/schema.js';
	import { splitLength } from '$lib/theme/schema.js';
	import { get, set, reset } from '$lib/theme/store.svelte.js';
	import { colorToHex } from './color.js';
	import { slide } from 'svelte/transition';
	/* A control renders its own children: an effect reveals the controls of
	   the mode you pick. Svelte 5 does this by importing the file itself. */
	import Self from './Control.svelte';

	/**
	 * One field of the generator.
	 *
	 * It knows about control types, never about variables: what a control
	 * writes is the schema's business, and a control that writes four of them
	 * looks exactly like one that writes none.
	 *
	 * The layout is a two-column row — name on the left, widget on the right —
	 * because the shared anatomy repeats in every section and a stack of
	 * labelled blocks turns forty answers into four screens. The help text
	 * lives in the label's tooltip for the same reason; an effect keeps its
	 * prose visible, because there the words ARE the choice.
	 */
	let { control }: { control: Control } = $props();

	let value = $derived(get(control.id, (control as { default?: unknown }).default));
	let dirty = $derived(get(control.id, undefined) !== undefined);

	/* A length is a slider when it reads as <number><unit>, and a text field
	   when it does not — `calc(2.5em * var(--scale))` is a legitimate default
	   and must survive being shown. */
	let numeric = $derived(
		control.type === 'length' && /^-?[\d.]+\s*[a-z%]*$/i.test(String(value))
	);
	let parts = $derived(
		numeric ? splitLength(String(value), (control as { units: string[] }).units[0]) : [0, '']
	);

	/* Everything but these sits on one row. These take the full width because
	   they are a grid of tiles or a row of words, not a single widget. */
	let wide = $derived(control.type === 'effect' || control.type === 'sides');

	/* Four independent toggles, one per edge. Sixteen tiles for every
	   combination was complete and was too much: you pick the edges you want
	   drawn, and no edges means no border, which is what "none" already meant
	   anyway. */
	const NAMES = ['top', 'right', 'bottom', 'left'] as const;

	const isOn = (v: unknown, side: (typeof NAMES)[number]) =>
		!!(v as Sides | undefined)?.[side];

	function toggleSide(side: (typeof NAMES)[number]) {
		const v = (value ?? {}) as Sides;
		set(control.id, { ...v, [side]: !v[side] });
	}
</script>

<div class="ctl" class:ctl-wide={wide}>
	<span class="ctl-name" title={control.help ?? ''}>
		{control.label}
		{#if control.help}<span class="ctl-hint" aria-hidden="true">?</span>{/if}
		{#if dirty}
			<button class="ctl-reset" onclick={() => reset(control.id)} title="Back to neutral">
				reset
			</button>
		{/if}
	</span>

	<div class="ctl-widget">
		{#if control.type === 'color'}
			<!-- The tile is a `.swatch` of the kit itself, taking the RAW value —
			     so it is right even where the hex conversion is not, and a
			     transparent colour shows its checkerboard. -->
			<label class="swatch ctl-swatch" style="--swatch-color:{value};" title={String(value)}>
				<input
					class="ctl-picker"
					type="color"
					value={colorToHex(String(value))}
					oninput={(e) => set(control.id, e.currentTarget.value)}
					aria-label={control.label}
				/>
			</label>
			<input
				class="input input-xs ctl-text"
				value={String(value)}
				oninput={(e) => set(control.id, e.currentTarget.value)}
			/>
		{:else if control.type === 'number' || control.type === 'percent'}
			<input
				class="range range-xs"
				type="range"
				min={control.min}
				max={control.max}
				step={control.step}
				value={parseFloat(String(value)) || 0}
				oninput={(e) =>
					set(control.id, control.type === 'percent'
						? e.currentTarget.value + '%'
						: e.currentTarget.value)}
			/>
			<output class="ctl-out">{value}</output>
		{:else if control.type === 'length' && numeric}
			<input
				class="range range-xs"
				type="range"
				min={control.min}
				max={control.max}
				step={control.step}
				value={parts[0]}
				oninput={(e) => set(control.id, e.currentTarget.value + parts[1])}
			/>
			<output class="ctl-out">{parts[0]}</output>
			<!-- A bare select, not a `.select`: the kit's own is a full-width
			     field with a chevron, and one of those per row is what pushed
			     every unit onto a line of its own. -->
			<select
				class="ctl-unit"
				value={parts[1]}
				aria-label="unit"
				onchange={(e) => set(control.id, parts[0] + e.currentTarget.value)}
			>
				{#each control.units as u (u)}<option value={u}>{u}</option>{/each}
			</select>
		{:else if control.type === 'length'}
			<input
				class="input input-xs ctl-text"
				value={String(value)}
				oninput={(e) => set(control.id, e.currentTarget.value)}
			/>
		{:else if control.type === 'select'}
			<select
				class="select select-xs"
				value={String(value)}
				onchange={(e) => set(control.id, e.currentTarget.value)}
			>
				{#each control.options as o (o.value)}<option value={o.value}>{o.label}</option>{/each}
			</select>
		{:else if control.type === 'sides'}
			<!-- One toggle per edge, each DRAWING the edge it means. They do not
			     exclude each other: you turn on the edges you want, and none on
			     is no border at all. -->
			<div class="tiles">
				{#each NAMES as side (side)}
					<button
						type="button"
						class="tile"
						class:tile-on={isOn(value, side)}
						title={side}
						aria-label={side}
						aria-pressed={isOn(value, side)}
						onclick={() => toggleSide(side)}
					>
						<span class="tile-box tile-{side}"></span>
					</button>
				{/each}
			</div>
		{:else if control.type === 'effect'}
			<div class="modes">
				{#each control.modes as m (m.id)}
					<button
						class="btn btn-xs"
						class:btn-active={value === m.id}
						onclick={() => set(control.id, m.id)}
						title={m.help ?? ''}
					>
						{m.label}
					</button>
				{/each}
			</div>

			{#each control.modes.filter((m) => m.id === value) as m (m.id)}
				<div class="revealed" transition:slide={{ duration: 200 }}>
					{#if m.help}<p class="ctl-help">{m.help}</p>{/if}
					{#each m.controls as c (c.id)}
						<Self control={c} />
					{/each}
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	/* Name on the left, widget on the right. The shared anatomy repeats in
	   every section, so a stack of labelled blocks turns forty answers into
	   four screens of scrolling. */
	.ctl {
		display: grid;
		grid-template-columns: 7.5rem 1fr;
		align-items: center;
		gap: 0.45rem;
		padding: 0.22rem 0;
	}
	.ctl-wide {
		grid-template-columns: 1fr;
		gap: 0.3rem;
		padding: 0.5rem 0;
	}
	.ctl-name {
		display: flex;
		align-items: baseline;
		gap: 0.3rem;
		font-size: 0.73rem;
		line-height: 1.3;
	}
	/* The help text is a tooltip rather than a paragraph, and this says one is
	   there. An effect keeps its prose visible: there the words ARE the
	   choice. */
	.ctl-hint {
		font-size: 0.6rem;
		opacity: 0.4;
		cursor: help;
	}
	/* Only while you are on the row. A reset link beside every changed value
	   is forty links competing with forty answers. */
	.ctl-reset {
		appearance: none;
		border: none;
		background: none;
		padding: 0;
		margin-inline-start: auto;
		font: inherit;
		font-size: 0.58rem;
		opacity: 0;
		cursor: pointer;
		color: inherit;
		transition: opacity 0.12s;
	}
	.ctl:hover .ctl-reset,
	.ctl-reset:focus-visible {
		opacity: 0.55;
	}
	.ctl-reset:hover {
		opacity: 1;
	}
	.ctl-widget {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		min-width: 0;
		flex-wrap: nowrap;
	}
	.ctl-wide .ctl-widget {
		display: block;
	}
	.ctl-widget :global(.range) {
		flex: 1 1 0;
		min-width: 0;
		width: auto;
	}
	.ctl-widget :global(.select),
	.ctl-widget :global(.input) {
		min-width: 0;
	}

	/* The whole tile is the picker: the native input fills it at zero
	   opacity, so what you click is the colour itself. */
	.ctl-swatch {
		--swatch-size: 1.45rem;
		flex-shrink: 0;
		cursor: pointer;
	}
	.ctl-picker {
		width: 100%;
		height: 100%;
		opacity: 0;
		border: none;
		padding: 0;
		background: none;
		cursor: pointer;
	}
	.ctl-text {
		flex: 1;
		min-width: 0;
		font-family: ui-monospace, monospace;
		font-size: 0.65rem;
	}
	.ctl-out {
		font-family: ui-monospace, monospace;
		font-size: 0.62rem;
		min-width: 2.1rem;
		flex-shrink: 0;
		text-align: end;
		opacity: 0.65;
	}
	.ctl-unit {
		appearance: none;
		flex-shrink: 0;
		width: auto;
		border: none;
		background: none;
		padding: 0 0.1rem;
		font: inherit;
		font-family: ui-monospace, monospace;
		font-size: 0.62rem;
		opacity: 0.6;
		cursor: pointer;
		color: inherit;
	}
	.ctl-unit:hover {
		opacity: 1;
	}

	/* A revealed control sits in a narrower box, so its name column gives way
	   first — the widget is the part that cannot shrink. `:global` because the
	   row belongs to the CHILD instance of this same component, which scoped
	   styles do not reach. */
	.revealed :global(.ctl) {
		grid-template-columns: 5.5rem 1fr;
	}
	.ctl-help {
		margin: 0 0 0.35rem;
		font-size: 0.68rem;
		line-height: 1.45;
		opacity: 0.6;
	}
	.modes {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}
	.revealed {
		margin: 0.4rem 0 0.2rem 0.5rem;
		padding-inline-start: 0.6rem;
		border-inline-start: 2px solid color-mix(in oklab, currentColor 15%, transparent);
	}

	/* One tile per combination of edges, each DRAWING the edges it means. */
	.tiles {
		--tile-w: 3px;
		display: flex;
		gap: 0.25rem;
	}
	.tile {
		appearance: none;
		display: grid;
		place-items: center;
		width: 1.85rem;
		height: 1.85rem;
		padding: 0;
		border: 1px solid #0000;
		border-radius: 0.35rem;
		background: color-mix(in oklab, currentColor 6%, transparent);
		cursor: pointer;
		color: inherit;
		transition:
			background-color 0.1s,
			border-color 0.1s;
	}
	.tile:hover {
		background: color-mix(in oklab, currentColor 12%, transparent);
	}
	.tile:focus-visible {
		outline: var(--focus-width) var(--focus-style) var(--color-primary);
		outline-offset: 1px;
	}
	.tile-on {
		border-color: var(--color-primary);
		background: color-mix(in oklab, var(--color-primary) 10%, transparent);
	}

	/* The mark: a filled plate with the chosen edges drawn around it, so an
	   edge reads as an edge OF something rather than as a floating line. */
	.tile-box {
		width: 1rem;
		height: 1rem;
		box-sizing: content-box;
		border: 0 solid color-mix(in oklab, currentColor 70%, transparent);
		border-radius: 0.26rem;
		background: color-mix(in oklab, currentColor 14%, transparent);
		background-clip: padding-box;
	}
	.tile-top {
		border-top-width: var(--tile-w);
	}
	.tile-right {
		border-right-width: var(--tile-w);
	}
	.tile-bottom {
		border-bottom-width: var(--tile-w);
	}
	.tile-left {
		border-left-width: var(--tile-w);
	}
	.tile-on .tile-box {
		border-color: var(--color-primary);
		background: color-mix(in oklab, var(--color-primary) 26%, transparent);
	}
</style>
