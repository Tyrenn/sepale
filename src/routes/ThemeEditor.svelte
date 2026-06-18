<script lang="ts">
	import { playground } from './playground.svelte.js';
	import ColorField from './ColorField.svelte';

	// Group tokens by their `group` field, preserving order. The set of groups
	// changes with the family (e.g. magnolia adds "Relief"), so the form below
	// is family-specific.
	let groups = $derived.by(() => {
		const map = new Map<string, typeof playground.tokens>();
		for (const t of playground.tokens) {
			if (!map.has(t.group)) map.set(t.group, []);
			map.get(t.group)!.push(t);
		}
		return [...map.entries()];
	});
</script>

<p class="ed-intro">
	Colors and radii apply to every family. The last group changes with the
	family — it tunes the look unique to its design language.
</p>

{#each groups as [name, tokens] (name)}
	<fieldset class="ed-group">
		<legend>{name}</legend>
		{#each tokens as token (token.name)}
			{#if token.type === 'color'}
				<ColorField {token} />
			{:else if token.type === 'number'}
				<div class="cf">
					<span class="cf-label">{token.label}</span>
					<span class="cf-controls">
						<input
							class="cf-range"
							type="range"
							min={token.min ?? 0}
							max={token.max ?? 1}
							step={token.step ?? 0.01}
							bind:value={token.value}
						/>
						<input
							class="cf-num"
							type="number"
							min={token.min ?? 0}
							max={token.max ?? 1}
							step={token.step ?? 0.01}
							bind:value={token.value}
						/>
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
	</fieldset>
{/each}
