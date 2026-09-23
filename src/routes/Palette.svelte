<script lang="ts">
	import type { Control } from '$lib/theme/schema.js';
	import { get, set, reset } from '$lib/theme/store.svelte.js';
	import { colorToHex } from './color.js';

	/**
	 * The colours, as tiles rather than as rows.
	 *
	 * Twelve colour controls as a list of labelled rows is twelve screens of
	 * scrolling to compare two greys. As tiles they sit side by side and you
	 * read the palette as a palette — which is the only way to judge one.
	 *
	 * Each seed is followed by a tile painting an "A" in what is drawn ON it.
	 * For the semantics that tile is NOT a control: `--color-on-primary` is
	 * derived from the seed in CSS (see _derived-content.scss), so the tile is
	 * a live contrast check rather than something to set. Text and hairline
	 * are editable, because a look drawn in ink needs a solid black edge and
	 * the derivation gives it a ten-percent wash.
	 *
	 * The tiles are `.swatch` of the kit itself, so the app's colour chrome is
	 * made of the component it ships: a theme that gets the swatch wrong is
	 * visible while you are editing it.
	 */

	let { controls }: { controls: Control[] } = $props();

	const byId = $derived(new Map(controls.map((c) => [c.id, c])));

	/** Which seeds belong together, and what is drawn on them. */
	const GROUPS = [
		{
			label: 'base',
			seeds: ['color-surface-1', 'color-surface-2', 'color-surface-3', 'color-surface-4'],
			marks: ['1', '2', '3', '4'],
			/* Editable: the two the derivation cannot get right for every look. */
			ink: ['color-on-surface', 'color-border']
		},
		{ label: 'primary', seeds: ['color-primary'], derived: '--color-on-primary' },
		{ label: 'secondary', seeds: ['color-secondary'], derived: '--color-on-secondary' },
		{ label: 'accent', seeds: ['color-accent'], derived: '--color-on-accent' },
		{ label: 'neutral', seeds: ['color-neutral'], derived: '--color-on-neutral' },
		{ label: 'info', seeds: ['color-info'], derived: '--color-on-info' },
		{ label: 'success', seeds: ['color-success'], derived: '--color-on-success' },
		{ label: 'warning', seeds: ['color-warning'], derived: '--color-on-warning' },
		{ label: 'error', seeds: ['color-error'], derived: '--color-on-error' }
	];

	const value = (id: string) => String(get(id, (byId.get(id) as { default?: string })?.default ?? ''));
	const dirty = (id: string) => get(id, undefined) !== undefined;

	/** The one you last clicked: its value and its name go under the row. */
	let open = $state<string | null>(null);
	let current = $derived(open ? byId.get(open) : undefined);
</script>

<div class="palette">
	{#each GROUPS as group (group.label)}
		<div class="group">
			<div class="tiles">
				{#each group.seeds as id, i (id)}
					<label
						class="swatch tile"
						class:tile-open={open === id}
						style="--swatch-color:{value(id)};"
						title="--{id} — {value(id)}"
					>
						{group.marks?.[i] ?? ''}
						<input
							class="picker"
							type="color"
							value={colorToHex(value(id))}
							onfocus={() => (open = id)}
							oninput={(e) => {
								open = id;
								set(id, e.currentTarget.value);
							}}
							aria-label={byId.get(id)?.label ?? id}
						/>
					</label>
				{/each}

				{#each group.ink ?? [] as id (id)}
					<label
						class="swatch tile"
						class:tile-open={open === id}
						style="--swatch-color:{value(group.seeds[0])}; color:{value(id)};"
						title="--{id} — {value(id)}"
					>
						<span class="mark">A</span>
						<input
							class="picker"
							type="color"
							value={colorToHex(value(id))}
							onfocus={() => (open = id)}
							oninput={(e) => {
								open = id;
								set(id, e.currentTarget.value);
							}}
							aria-label={byId.get(id)?.label ?? id}
						/>
					</label>
				{/each}

				{#if group.derived}
					<!-- Not a control: derived in CSS from the seed beside it. It is
					     here as a contrast check you can see rather than compute. -->
					<span
						class="swatch tile tile-derived"
						style="--swatch-color:{value(group.seeds[0])}; color:var({group.derived});"
						title="{group.derived} — derived from the seed"
					>
						<span class="mark">A</span>
					</span>
				{/if}
			</div>
			<span class="label">{group.label}</span>
		</div>
	{/each}
</div>

{#if current}
	<div class="readout">
		<div class="readout-head">
			<span class="readout-name">{current.label}</span>
			<code class="readout-var">--{current.id}</code>
			{#if dirty(current.id)}
				<button class="btn btn-xs btn-ghost" onclick={() => reset(current.id)}>reset</button>
			{/if}
		</div>
		<input
			class="input input-sm readout-value"
			value={value(current.id)}
			oninput={(e) => set(current.id, e.currentTarget.value)}
		/>
		{#if current.help}<p class="readout-help">{current.help}</p>{/if}
	</div>
{/if}

<style>
	.palette {
		display: flex;
		flex-wrap: wrap;
		gap: 0.9rem 1.1rem;
		margin-top: 0.5rem;
	}
	.group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.tiles {
		display: flex;
		gap: 0.3rem;
	}
	.label {
		font-size: 0.68rem;
		opacity: 0.55;
	}

	/* The tile is the picker: the native input fills it at zero opacity, so
	   what you click is the colour itself. */
	.tile {
		--swatch-size: 2.6rem;
		position: relative;
		cursor: pointer;
		font-size: 0.72rem;
		font-weight: 600;
	}
	.tile-derived {
		cursor: default;
	}
	.tile-open {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}
	/* The letter is a drawing, not a target: without this it sits over the
	   picker and swallows the click, which is what made the two ink tiles
	   look decorative. */
	.mark {
		font-size: 1rem;
		font-weight: 700;
		pointer-events: none;
	}
	.picker {
		position: absolute;
		inset: 0;
		z-index: 1;
		width: 100%;
		height: 100%;
		opacity: 0;
		border: none;
		padding: 0;
		background: none;
		cursor: pointer;
	}

	.readout {
		margin-top: 0.9rem;
		padding-top: 0.6rem;
		border-top: 1px solid color-mix(in oklab, currentColor 12%, transparent);
	}
	.readout-head {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		margin-bottom: 0.3rem;
	}
	.readout-name {
		font-size: 0.75rem;
		font-weight: 600;
		white-space: nowrap;
	}
	.readout-value {
		width: 100%;
		font-family: ui-monospace, monospace;
		font-size: 0.7rem;
	}
	.readout-var {
		font-family: ui-monospace, monospace;
		font-size: 0.65rem;
		opacity: 0.5;
		margin-inline-start: auto;
		white-space: nowrap;
	}
	.readout-help {
		margin: 0.25rem 0 0;
		font-size: 0.7rem;
		line-height: 1.4;
		opacity: 0.6;
	}
</style>
