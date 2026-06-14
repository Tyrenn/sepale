<script lang="ts">
	import { playground } from './playground.svelte.js';
	import ColorField from './ColorField.svelte';

	// Group tokens by their `group` field, preserving order.
	let groups = $derived.by(() => {
		const map = new Map<string, typeof playground.tokens>();
		for (const t of playground.tokens) {
			if (!map.has(t.group)) map.set(t.group, []);
			map.get(t.group)!.push(t);
		}
		return [...map.entries()];
	});
</script>

{#each groups as [name, tokens] (name)}
	<fieldset class="ed-group">
		<legend>{name}</legend>
		{#each tokens as token (token.name)}
			{#if token.type === 'color'}
				<ColorField {token} />
			{:else}
				<label class="cf">
					<span class="cf-label">{token.label}</span>
					<span class="cf-controls">
						<input class="cf-text" type="text" bind:value={token.value} spellcheck="false" />
					</span>
				</label>
			{/if}
		{/each}
	</fieldset>
{/each}
