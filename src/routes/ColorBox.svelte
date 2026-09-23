<script lang="ts">
	/**
	 * The one colour control. All ~34 colours in the form are this component.
	 *
	 * Closed it is a tile showing the colour it resolves to. Open it offers a
	 * source — a token of the theme, the element's own fill, or a colour of
	 * your own — and an intensity.
	 *
	 * The DIRECTION of the intensity is never asked: a light source darkens
	 * and a dark one lightens, so one answer serves a theme and its dark twin.
	 */
	import { slide } from 'svelte/transition';
	import type { ColorControl, ColorValue } from '$lib/theme/schema.js';
	import { isLiteral, isOwn } from '$lib/theme/schema.js';
	import { colorToHex } from './color.js';

	let {
		control,
		value,
		onchange
	}: {
		control: ColorControl;
		value: ColorValue;
		onchange: (v: ColorValue) => void;
	} = $props();

	let open = $state(false);

	/* Which tokens this box may derive from. `own` is offered only where the
	   component's CSS has a `--_` slot to fall back to. */
	const SURFACES = ['color-surface-1', 'color-surface-2', 'color-surface-3', 'color-surface-4'];
	const SEMANTICS = [
		'color-primary',
		'color-secondary',
		'color-accent',
		'color-neutral',
		'color-info',
		'color-success',
		'color-warning',
		'color-error'
	];

	let tokens = $derived([
		...(control.sources.includes('text') ? ['color-on-surface', 'color-border'] : []),
		...(control.sources.includes('surface') ? SURFACES : []),
		...(control.sources.includes('semantic') ? SEMANTICS : [])
	]);

	/* What the tile shows. `own` has nothing to resolve at root, so it shows
	   the element's own fill as a diagonal rather than lying about a colour. */
	let swatch = $derived(
		isOwn(value.source) ? '' : colorToHex(isLiteral(value.source) ? value.source : `var(--${value.source})`)
	);

	const pick = (source: string) => onchange({ ...value, source, shade: isLiteral(source) ? 0 : value.shade });
	const setShade = (shade: number) => onchange({ ...value, shade });
</script>

<div class="box">
	<button
		class="tile"
		class:tile-own={isOwn(value.source)}
		style:background={swatch}
		onclick={() => (open = !open)}
		aria-expanded={open}
		title={control.help ?? control.label}
	>
	</button>
	<span class="name">{control.label}</span>

	{#if open}
		<div class="panel" transition:slide={{ duration: 180 }}>
			{#if control.help}<p class="help">{control.help}</p>{/if}

			<div class="tabs tabs-box">
				{#if control.sources.length}
					<button
						class="tab"
						class:tab-active={!isLiteral(value.source)}
						onclick={() => pick(control.sources.includes('own') ? 'own' : tokens[0])}>Derived</button
					>
				{/if}
				<button
					class="tab"
					class:tab-active={isLiteral(value.source)}
					onclick={() => pick(swatch || '#888888')}>Custom</button
				>
			</div>

			{#if isLiteral(value.source)}
				<label class="row">
					<span>Colour</span>
					<input type="color" value={swatch} oninput={(e) => pick(e.currentTarget.value)} />
					<code>{value.source}</code>
				</label>
			{:else}
				<div class="sources">
					{#if control.sources.includes('own')}
						<button
							class="tile tile-own"
							class:on={isOwn(value.source)}
							onclick={() => pick('own')}
							title="The element's own fill"
						></button>
					{/if}
					{#each tokens as t (t)}
						<button
							class="tile"
							class:on={value.source === t}
							style:background="var(--{t})"
							onclick={() => pick(t)}
							title={t}
						></button>
					{/each}
				</div>
				<label class="row">
					<span>Intensity</span>
					<input
						type="range"
						class="range"
						min="0"
						max="0.5"
						step="0.01"
						value={value.shade}
						oninput={(e) => setShade(Number(e.currentTarget.value))}
					/>
					<code>{Math.round(value.shade * 200)}</code>
				</label>
				<p class="help">
					A light source darkens and a dark one lightens — the direction is not a setting,
					which is why one value works in a light theme and in its dark twin.
				</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	.box {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		gap: 0.15rem;
		position: relative;
	}
	.tile {
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 0.3rem;
		border: 1px solid color-mix(in oklab, currentColor 20%, #0000);
		cursor: pointer;
		padding: 0;
	}
	/* `own` resolves on the element, so there is nothing to show at root. A
	   diagonal says "whatever this element is" rather than inventing a colour. */
	.tile-own {
		background: repeating-linear-gradient(
			45deg,
			color-mix(in oklab, currentColor 12%, #0000) 0 4px,
			#0000 4px 8px
		);
	}
	.tile.on {
		outline: 2px solid currentColor;
		outline-offset: 1px;
	}
	.name {
		font-size: 0.7rem;
		opacity: 0.7;
		white-space: nowrap;
	}
	.panel {
		position: absolute;
		top: 100%;
		left: 0;
		z-index: 10;
		min-width: 15rem;
		padding: 0.6rem;
		border-radius: 0.5rem;
		background: var(--color-surface-1);
		border: 1px solid var(--color-border);
		box-shadow: 0 8px 24px -8px color-mix(in oklab, currentColor 30%, #0000);
	}
	.sources {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin: 0.5rem 0;
	}
	.row {
		display: grid;
		grid-template-columns: 4.5rem 1fr auto;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.75rem;
	}
	.help {
		font-size: 0.7rem;
		opacity: 0.65;
		margin: 0.4rem 0 0;
		line-height: 1.35;
	}
	code {
		font-size: 0.7rem;
		opacity: 0.8;
	}
</style>
