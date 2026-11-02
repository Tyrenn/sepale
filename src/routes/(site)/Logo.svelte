<script lang="ts">
	let { size = 32 }: { size?: number } = $props();

	const SEPALS = [0, 72, 144, 216, 288];
</script>

<!-- Five sepals around a point. Same drawing as static/favicon.svg. The size
     is inline: a family's stylesheet sizes every svg to 1em. -->
<svg viewBox="0 0 64 64" style:width="{size}px" style:height="{size}px" style:flex="none" aria-hidden="true">
	{#each SEPALS as angle (angle)}
		<g transform="rotate({angle} 32 32)">
			<path fill="#bfe6c4" d="M32 32C22 25 22 11 32 2c10 9 10 23 0 30Z" />
			<path fill="#2f7d4f" d="M32 32c10-7 10-21 0-30Z" />
		</g>
	{/each}
</svg>
