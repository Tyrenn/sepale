<script lang="ts">
	import { playground } from './playground.svelte.js';

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
	<fieldset class="pg-group">
		<legend>{name}</legend>
		{#each tokens as token (token.name)}
			<label class="pg-field" title={`--${token.name}`}>
				<span>{token.label}</span>
				<span style="display:flex;align-items:center;gap:0.4rem">
					{#if token.type === 'color'}
						<span class="pg-swatch" style={`background:${token.value}`}></span>
					{/if}
					<input type="text" bind:value={token.value} />
				</span>
			</label>
		{/each}
	</fieldset>
{/each}
