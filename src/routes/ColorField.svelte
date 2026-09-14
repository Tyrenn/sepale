<script lang="ts">
	import type { ThemeToken } from '$lib/theme.js';
	import { colorToHex } from './color.js';

	// One clickable colour tile: the whole square is the picker. `token` is a
	// reactive $state proxy, so mutating token.value propagates. The tile is a
	// .swatch of the active family — the app's colour chrome is made of the
	// same components it ships. Its identity is the label under the group, and
	// the exact variable name is in the tooltip.
	let { token }: { token: ThemeToken } = $props();

	let hex = $derived(colorToHex(token.value));
</script>

<label
	class="swatch ct"
	style="--swatch-color:{token.value};"
	title="--{token.name} — {token.value}"
>
	<input
		class="ct-input"
		type="color"
		value={hex}
		oninput={(e) => (token.value = e.currentTarget.value)}
		aria-label={token.label}
	/>
</label>
