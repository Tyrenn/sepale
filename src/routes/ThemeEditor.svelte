<script lang="ts">
	import { playground } from './playground.svelte.js';
	import {
		splitLength,
		edgeWidthFromCss,
		edgeWidthToCss,
		shadowsFromCss,
		shadowsToCss,
		SIDES
	} from '$lib/theme.js';
	import type { ThemeToken } from '$lib/theme.js';
	import ColorBox from './ColorBox.svelte';
	import Shadows from './Shadows.svelte';

	// Fixed group order, daisyUI-generator style: what you look at first comes
	// first. Any group a family invents that is not listed falls in at the end.
	const ORDER = ['Colors', 'Shape', 'Size', 'Effects', 'Elevation'];

	// The palette is laid out as tiles, not rows, and it is derived from
	// whatever the family declares — a family with four surfaces, or with
	// names of its own, comes through unchanged. Each tile that has a matching
	// on-colour shows a second, NON-editable tile painting an "A" in it:
	// on-colours are derived in CSS, so that tile is a live contrast check
	// rather than a control. The picker grades the same pair numerically.
	let colorTokens = $derived(playground.tokens.filter((t) => t.type === 'color'));

	/** Surfaces first, lowest to most raised — they read as one stack. */
	let surfaces = $derived(colorTokens.filter((t) => t.name.startsWith('color-surface')));

	/** Semantics: everything that is neither a surface nor plain ink. */
	let semantics = $derived(
		colorTokens.filter(
			(t) => !t.name.startsWith('color-surface') && !['color-on-surface', 'color-border'].includes(t.name)
		)
	);

	/** Ink: the text and hairline colours, when the family exposes them. */
	let ink = $derived(colorTokens.filter((t) => ['color-on-surface', 'color-border'].includes(t.name)));

	const shortName = (name: string) => name.replace(/^color-/, '');

	/** What a colour is graded against: the ink written on it, or for the
	 *  ink itself, the ground it is written on. A border has no partner. */
	const contrastOf = (name: string) =>
		name === 'color-border'
			? ''
			: name === 'color-on-surface'
				? 'var(--color-surface-1)'
				: name.startsWith('color-surface')
					? 'var(--color-on-surface)'
					: `var(--color-on-${shortName(name)})`;

	let groups = $derived.by(() => {
		const map = new Map<string, ThemeToken[]>();
		for (const t of playground.tokens) {
			if (!map.has(t.group)) map.set(t.group, []);
			map.get(t.group)!.push(t);
		}
		return [...map.entries()].sort((a, b) => {
			const ia = ORDER.indexOf(a[0]);
			const ib = ORDER.indexOf(b[0]);
			return (ia < 0 ? ORDER.length : ia) - (ib < 0 ? ORDER.length : ib);
		});
	});

	/** Write a number back, keeping the token's current unit. */
	function setNumber(token: ThemeToken, raw: string) {
		token.value = raw + (token.unit ?? '');
	}

	/** Switch unit without converting: 0.5rem → 0.5px. Cross-unit conversion
	 *  (px ↔ ch) has no stable answer, so the number is the user's to re-pick. */
	function setUnit(token: ThemeToken, unit: string) {
		const [n] = splitLength(token.value, token.unit ?? 'rem');
		token.unit = unit;
		token.value = `${n}${unit}`;
	}
</script>

{#snippet tile(token: ThemeToken)}
	<ColorBox
		value={token.value}
		label={token.label}
		help={token.description}
		contrast={contrastOf(token.name)}
		onchange={(v) => (token.value = v)}
	/>
{/snippet}

{#each groups as [name, tokens] (name)}
	<fieldset class="ed-group" data-group={name}>
		<legend>{name}</legend>

		{#if name === 'Colors'}
			<div class="pal">
				<!-- Surfaces, lowest to most raised, each showing the text it
				     carries. However many the family declares. -->
				{#each surfaces as token (token.name)}
					<div class="pal-item">
						<div class="pal-tiles">
							{@render tile(token)}
							<span
								class="swatch ct ct-derived"
								style="--swatch-color:var(--{token.name}); --swatch-on-color:var(--color-on-surface);"
								title="--color-on-surface — derived from the surface colour"
							>A</span>
						</div>
						<span class="pal-label">{shortName(token.name)}</span>
					</div>
				{/each}

				{#each ink as token (token.name)}
					<div class="pal-item">
						<div class="pal-tiles">
							{@render tile(token)}
						</div>
						<span class="pal-label">{shortName(token.name)}</span>
					</div>
				{/each}

				{#each semantics as token (token.name)}
					{@const key = shortName(token.name)}
					<div class="pal-item">
						<div class="pal-tiles">
							{@render tile(token)}
							<span
								class="swatch ct ct-derived"
								style="--swatch-color:var(--{token.name}); --swatch-on-color:var(--color-on-{key});"
								title="--color-on-{key} — derived from --{token.name}"
							>A</span>
						</div>
						<span class="pal-label">{key}</span>
					</div>
				{/each}
			</div>
		{:else}
			{#each tokens as token (token.name)}
				{#if token.type === 'edge-width'}
					<!-- A width and the edges it is drawn on: one shorthand, so
					     the edges that are off are simply the parts at 0. -->
					{@const ew = edgeWidthFromCss(token.value, token.unit ?? 'px')}
					{@const n = splitLength(ew.width, token.unit ?? 'px')}
					<div class="cf">
						<span class="cf-label">{token.label}</span>
						<span class="cf-controls">
							<input
								class="cf-range"
								type="range"
								min={token.min ?? 0}
								max={token.max ?? 4}
								step={token.step ?? 0.5}
								value={n[0]}
								oninput={(e) =>
									(token.value = edgeWidthToCss({ ...ew, width: `${e.currentTarget.value}${n[1]}` }))}
							/>
							<code class="cf-code">{ew.width}</code>
							<!-- Four tiles, not exclusive. No edge on is no border. -->
							<span class="edges">
								{#each SIDES as s (s)}
									<button
										type="button"
										class="edge"
										class:edge-on={ew.sides[s]}
										title={s}
										aria-label={s}
										aria-pressed={ew.sides[s]}
										onclick={() =>
											(token.value = edgeWidthToCss({ ...ew, sides: { ...ew.sides, [s]: !ew.sides[s] } }))}
										><span class="edge-bar edge-{s}"></span></button
									>
								{/each}
							</span>
						</span>
						{#if token.description}<span class="cf-desc">{token.description}</span>{/if}
					</div>
				{:else if token.type === 'shadows'}
					<div class="cf">
						<span class="cf-label">{token.label}</span>
						<Shadows
							layers={shadowsFromCss(token.value)}
							onchange={(layers) => (token.value = shadowsToCss(layers))}
						/>
						{#if token.description}<span class="cf-desc">{token.description}</span>{/if}
					</div>
				{:else if token.min !== undefined}
					<!-- Bounded numeric token: slider + number, plus a unit picker
					     when the token declares several units. -->
					<div class="cf">
						<span class="cf-label">{token.label}</span>
						<span class="cf-controls">
							<input
								class="cf-range"
								type="range"
								min={token.min}
								max={token.max ?? 1}
								step={token.step ?? 0.01}
								value={splitLength(token.value, token.unit ?? '')[0]}
								oninput={(e) => setNumber(token, e.currentTarget.value)}
							/>
							<input
								class="cf-num"
								type="number"
								min={token.min}
								max={token.max ?? 1}
								step={token.step ?? 0.01}
								value={splitLength(token.value, token.unit ?? '')[0]}
								oninput={(e) => setNumber(token, e.currentTarget.value)}
							/>
							{#if token.units}
								<select
									class="cf-unit"
									value={token.unit}
									onchange={(e) => setUnit(token, e.currentTarget.value)}
									aria-label="{token.label} unit"
								>
									{#each token.units as u (u)}<option value={u}>{u}</option>{/each}
								</select>
							{/if}
						</span>
						{#if token.description}<span class="cf-desc">{token.description}</span>{/if}
					</div>
				{:else}
					<label class="cf">
						<span class="cf-label">{token.label}</span>
						<span class="cf-controls">
							<input class="cf-text" type="text" bind:value={token.value} spellcheck="false" />
						</span>
						{#if token.description}<span class="cf-desc">{token.description}</span>{/if}
					</label>
				{/if}
			{/each}
		{/if}
	</fieldset>
{/each}

<style>
	/* The colour box takes the tile's place in the palette row. */
	.pal-tiles :global(.box) {
		flex: 1;
		min-width: 0;
	}
	.pal-tiles :global(.box > .swatch) {
		width: 100%;
		height: auto;
		aspect-ratio: 1;
	}
	.cf-code {
		font-size: 0.7rem;
		opacity: 0.75;
		min-width: 2.5rem;
	}
	.edges {
		display: flex;
		gap: 0.15rem;
	}
	.edge {
		width: 1.15rem;
		height: 1.15rem;
		padding: 0;
		border: 1px solid color-mix(in oklab, currentColor 20%, #0000);
		border-radius: 0.2rem;
		background: none;
		cursor: pointer;
		position: relative;
	}
	.edge-on {
		background: color-mix(in oklab, currentColor 8%, #0000);
	}
	/* The tile draws the edge it turns on, so the row reads as a picture of
	   the border rather than as four words. */
	.edge-bar {
		position: absolute;
		background: currentColor;
		opacity: 0.25;
	}
	.edge-on .edge-bar {
		opacity: 1;
	}
	.edge-top {
		inset: 2px 2px auto 2px;
		height: 2px;
	}
	.edge-bottom {
		inset: auto 2px 2px 2px;
		height: 2px;
	}
	.edge-left {
		inset: 2px auto 2px 2px;
		width: 2px;
	}
	.edge-right {
		inset: 2px 2px 2px auto;
		width: 2px;
	}
</style>
