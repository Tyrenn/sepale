<script lang="ts">
	import { playground } from './playground.svelte.js';
	import { splitLength } from '$lib/theme.js';
	import type { ThemeToken } from '$lib/theme.js';
	import ColorField from './ColorField.svelte';

	// Fixed group order, daisyUI-generator style: what you look at first comes
	// first. Any group a family invents that is not listed falls in at the end.
	const ORDER = ['Colors', 'Shape', 'Size', 'Effects', 'Elevation'];

	// The palette is laid out as tiles, not rows: the three surface levels plus
	// a contrast sample, then the eight semantics two per line. Every group
	// shows a second, NON-editable tile painting an "A" in its on-colour —
	// on-colours are derived in CSS, so that tile is a live contrast check
	// rather than a control. Hovering any tile shows its variable name.
	// Surfaces, lowest first. Each shows its own tile plus the text drawn on it.
	const SURFACES: [string, string][] = [
		['color-surface', 'surface'],
		['color-surface-high', 'surface-high'],
		['color-surface-peak', 'surface-peak']
	];

	const PAIRS = [
		['primary', 'secondary'],
		['accent', 'neutral'],
		['info', 'success'],
		['warning', 'error']
	];

	let byName = $derived(new Map(playground.tokens.map((t) => [t.name, t])));

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

{#each groups as [name, tokens] (name)}
	<fieldset class="ed-group" data-group={name}>
		<legend>{name}</legend>

		{#if name === 'Colors'}
			<div class="pal">
				<!-- The three surface levels, lowest to most raised, then the
				     text they all carry. -->
				{#each SURFACES as [key, label] (key)}
					{@const token = byName.get(key)}
					{#if token}
						<div class="pal-item">
							<div class="pal-tiles">
								<ColorField {token} />
								<span
									class="ct ct-derived"
									style="background:var(--{key}); color:var(--color-on-surface);"
									title="--color-on-surface — derived from the surface colour"
								>
									<span class="ct-glyph">A</span>
								</span>
							</div>
							<span class="pal-label">{label}</span>
						</div>
					{/if}
				{/each}

				{#each PAIRS as pair (pair[0])}
					{#each pair as key (key)}
						{@const token = byName.get(`color-${key}`)}
						{#if token}
							<div class="pal-item">
								<div class="pal-tiles">
									<ColorField {token} />
									<span
										class="ct ct-derived"
										style="background:var(--color-{key}); color:var(--color-on-{key});"
										title="--color-on-{key} — derived from --color-{key}"
									>
										<span class="ct-glyph">A</span>
									</span>
								</div>
								<span class="pal-label">{key}</span>
							</div>
						{/if}
					{/each}
				{/each}
			</div>
		{:else}
			{#each tokens as token (token.name)}
				{#if token.min !== undefined}
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
