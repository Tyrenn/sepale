<script lang="ts">
	import type { ThemeToken } from '$lib/theme.js';
	import { colorToHex } from './color.js';

	// `token` is a reactive $state proxy; mutating token.value propagates.
	let { token }: { token: ThemeToken } = $props();

	// Hex shown in the native picker, recomputed from the (possibly oklch) value.
	let hex = $derived(colorToHex(token.value));

	function pick(e: Event) {
		token.value = (e.target as HTMLInputElement).value;
	}
</script>

<label class="cf">
	<span class="cf-label">{token.label}</span>
	<span class="cf-controls">
		<input class="cf-swatch" type="color" value={hex} oninput={pick} aria-label={token.label} />
		<input class="cf-text" type="text" bind:value={token.value} spellcheck="false" />
	</span>
	{#if token.description}<span class="cf-desc">{token.description}</span>{/if}
</label>
