<script lang="ts">
	import { playground } from './playground.svelte.js';
	import { splitLength } from '$lib/theme.js';
	import type { ThemeToken } from '$lib/theme.js';
	import ColorField from './ColorField.svelte';

	// Fixed group order, daisyUI-generator style: what you look at first comes
	// first. Any group a family invents that is not listed falls in at the end.
	const ORDER = ['Colors', 'Shape', 'Size', 'Effects', 'Elevation'];

	// The palette is laid out as tiles, not rows, and it is derived from
	// whatever the family declares — a family with four surfaces, or with
	// names of its own, comes through unchanged. Each tile that has a matching
	// on-colour shows a second, NON-editable tile painting an "A" in it:
	// on-colours are derived in CSS, so that tile is a live contrast check
	// rather than a control. Hovering any tile shows its variable name.
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
				<!-- Surfaces, lowest to most raised, each showing the text it
				     carries. However many the family declares. -->
				{#each surfaces as token (token.name)}
					<div class="pal-item">
						<div class="pal-tiles">
							<ColorField {token} />
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
							<ColorField {token} />
						</div>
						<span class="pal-label">{shortName(token.name)}</span>
					</div>
				{/each}

				{#each semantics as token (token.name)}
					{@const key = shortName(token.name)}
					<div class="pal-item">
						<div class="pal-tiles">
							<ColorField {token} />
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
