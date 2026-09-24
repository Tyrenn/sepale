<script lang="ts">
	/**
	 * A run of colour controls, rendered as a palette: tiles side by side, the
	 * name small underneath, and an ink paired with the colour it is written
	 * on under a single label.
	 *
	 * The same shape everywhere. A `Fill` group around two tiles was a frame
	 * with nothing to frame, so the fills are bare controls now and this is
	 * what draws them.
	 */
	import type { ColorControl, Control, Group } from '$lib/theme/schema.js';
	import { isLiteral, readValue } from '$lib/theme/schema.js';
	import { generator, setValue } from '$lib/theme/store.svelte.js';
	import ColorBox from './ColorBox.svelte';

	let {
		controls,
		group,
		peers = []
	}: { controls: Control[]; group?: Group; peers?: Group[] } = $props();

	/** A colour and, when the next declares itself its ink, the pair of them. */
	let items = $derived.by(() => {
		const out: { box: ColorControl; ink?: ColorControl }[] = [];
		for (const c of controls) {
			if (c.type !== 'color') continue;
			const prev = out.at(-1);
			if (c.inkOf && prev && prev.box.id === c.inkOf) prev.ink = c;
			else out.push({ box: c });
		}
		return out;
	});

	/** What an ink is written on, resolved for the `A` it draws. */
	const groundOf = (c: ColorControl) => {
		const v = readValue(c, generator.vars) as { source: string };
		return isLiteral(v.source) ? v.source : `var(--${v.source})`;
	};
</script>

<div class="palette">
	{#each items as item (item.box.id)}
		<span class="pair">
			<span class="tiles">
				<ColorBox
					control={item.box}
					value={readValue(item.box, generator.vars) as never}
					onchange={(v) => setValue(item.box, v, group, peers)}
				/>
				{#if item.ink}
					<ColorBox
						control={item.ink}
						over={groundOf(item.box)}
						value={readValue(item.ink, generator.vars) as never}
						onchange={(v) => setValue(item.ink!, v, group, peers)}
					/>
				{/if}
			</span>
			<span class="pair-name">{item.box.label}</span>
		</span>
	{/each}
</div>

<style>
	.palette {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: 0.55rem 0.7rem;
		padding: 0.15rem 0;
	}
	.pair {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		gap: 0.2rem;
	}
	.tiles {
		display: inline-flex;
		gap: 0.3rem;
	}
	.pair-name {
		font-size: 0.68rem;
		opacity: 0.7;
		white-space: nowrap;
	}
</style>
