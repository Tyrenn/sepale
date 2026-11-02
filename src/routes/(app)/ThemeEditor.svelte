<script lang="ts">
	import { playground } from '../playground.svelte.js';
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
	// whatever the family declares — nothing here reads a colour's NAME. Each
	// colour says through `on` which variable holds the ink written on it:
	//   - when that ink is a parameter too (daisy's --color-primary-content),
	//     it is shown as an editable tile next to its colour;
	//   - when the family derives it (--color-on-primary), nothing is shown:
	//     the palette holds only what can be set. The picker still grades
	//     the colour against that ink.
	let colorTokens = $derived(playground.tokens.filter((t) => t.type === 'color'));

	/** Surfaces first, then the colours, then the inks that stand alone. */
	const RANK: Record<string, number> = { surface: 0, accent: 1, ink: 2 };

	type Entry = { token: ThemeToken; partner?: ThemeToken };

	let palette = $derived.by(() => {
		const byName = new Map(colorTokens.map((t) => [t.name, t]));
		/* An ink that is a parameter AND some colour's `on` is drawn beside
		   that colour, once — not on its own. */
		const owned = new Set(colorTokens.map((t) => t.on).filter((n) => n && byName.has(n)));
		const shown = new Set<string>();
		return colorTokens
			.filter((t) => !owned.has(t.name))
			.sort((a, b) => (RANK[a.kind ?? 'accent'] ?? 1) - (RANK[b.kind ?? 'accent'] ?? 1))
			.map((token): Entry => {
				const ink = token.on;
				if (!ink) return { token };
				const partner = byName.get(ink);
				if (partner && !shown.has(ink)) {
					shown.add(ink);
					return { token, partner };
				}
				return { token };
			});
	});

	const shortName = (name: string) => name.replace(/^color-/, '');

	/** What a colour is graded against: the ink written on it, or for an ink,
	 *  the first colour it is written on. A line (a border) has no partner. */
	const contrastOf = (token: ThemeToken) => {
		if (token.on) return `var(--${token.on})`;
		const ground = colorTokens.find((t) => t.on === token.name);
		return ground ? `var(--${ground.name})` : '';
	};

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
		contrast={contrastOf(token)}
		ink={colorTokens.some((t) => t.on === token.name)}
		onchange={(v) => (token.value = v)}
	/>
{/snippet}

{#each groups as [name, tokens] (name)}
	<fieldset class="ed-group" data-group={name}>
		<legend>{name}</legend>

		{#if name === 'Colors'}
			<div class="pal">
				<!-- One entry per colour, surfaces first. A colour whose ink is a
				     parameter shows it as a second editable tile; a derived ink
				     is not shown. -->
				{#each palette as { token, partner } (token.name)}
					<div class="pal-item">
						<div class="pal-tiles">
							{@render tile(token)}
							{#if partner}
								{@render tile(partner)}
							{/if}
						</div>
						<span class="pal-label">{shortName(token.name)}</span>
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
	.pal-tiles :global(.box > .ui-swatch) {
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
