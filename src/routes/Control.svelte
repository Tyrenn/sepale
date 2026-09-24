<script lang="ts">
	/**
	 * One field of the form.
	 *
	 * A control has no value of its own: it reads one out of the variables and
	 * writes variables when it is moved (ADR 0011). `group` and `peers` are
	 * what it was rendered inside — the group so its writer can recombine the
	 * siblings, the peers so a Basic widget mirrors into every section.
	 */
	import type {
		ColorValue,
		Control,
		EdgeWidth,
		Group,
		ShadowLayer,
		Sides
	} from '$lib/theme/schema.js';
	import { readValue, splitLength } from '$lib/theme/schema.js';
	import { generator, setValue } from '$lib/theme/store.svelte.js';
	import ColorBox from './ColorBox.svelte';
	import Shadows from './Shadows.svelte';

	let {
		control,
		group,
		peers = []
	}: { control: Control; group?: Group; peers?: Group[] } = $props();

	let value = $derived(readValue(control, generator.vars));
	/* A control can step aside while another group owns its question — the
	   radius does, once the hand-drawn look is on and builds on it. */
	let hidden = $derived.by(() => {
		if (!control.hiddenWhen) return false;
		const [g, mode] = control.hiddenWhen.split(':');
		return generator.vars[g] === mode;
	});
	const set = (v: unknown) => setValue(control, v, group, peers);

	/* A length is a number and a unit, edited apart and written together. */
	let units = $derived('units' in control ? control.units : ['rem']);
	let len = $derived(
		control.type === 'length' ? splitLength(String(value), units[0]) : ([0, 'rem'] as const)
	);

	const SIDES: (keyof Sides)[] = ['top', 'right', 'bottom', 'left'];
</script>

{#if hidden}
	<!-- another group owns this question right now -->
{:else if control.type === 'color'}
	<!-- Outside Colours a swatch is one control among sliders, so it takes the
	     same left label as the rest of the column. -->
	<div class="ctl">
		<span class="name" title={control.help ?? ''}>{control.label}</span>
		<div class="widget">
			<ColorBox {control} value={value as ColorValue} onchange={set} small />
		</div>
	</div>
{:else}
	<div class="ctl" class:wide={control.type === 'shadows' || !control.label}>
		{#if control.label}
			<span class="name" title={control.help ?? ''}>
				{control.label}{#if control.help}<span class="hint" aria-hidden="true">?</span>{/if}
			</span>
		{/if}

		<div class="widget">
			{#if control.type === 'number' || control.type === 'percent'}
				<input
					type="range"
					class="range"
					min={control.min}
					max={control.max}
					step={control.step}
					value={Number(value)}
					oninput={(e) => set(Number(e.currentTarget.value))}
				/>
				<code>{value}{control.type === 'percent' ? '%' : ''}</code>
			{:else if control.type === 'length'}
				<input
					type="range"
					class="range"
					min={control.min}
					max={control.max}
					step={control.step}
					value={len[0]}
					oninput={(e) => set(`${e.currentTarget.value}${len[1]}`)}
				/>
				<code>{len[0]}</code>
				{#if units.length > 1}
					<select
						class="select select-xs unit"
						value={len[1]}
						onchange={(e) => set(`${len[0]}${e.currentTarget.value}`)}
					>
						{#each units as u (u)}<option value={u}>{u}</option>{/each}
					</select>
				{:else}
					<code>{len[1]}</code>
				{/if}
			{:else if control.type === 'choice'}
				<!-- A tab strip, like a group's type: one exclusive row reads the
				     same way wherever it appears. No select — a dropdown hides
				     its own options, which is the wrong trade for three. -->
				<div class="tabs tabs-box tabs-xs" role="tablist">
					{#each control.options as o (o.value)}
						<input
							type="radio"
							class="tabs-item"
							name="choice-{control.id}"
							aria-label={o.label}
							checked={value === o.value}
							onchange={() => set(o.value)}
						/>
					{/each}
				</div>
			{:else if control.type === 'edge-width'}
				{@const ew = value as EdgeWidth}
				{@const n = splitLength(ew.width, units[0])}
				<input
					type="range"
					class="range"
					min={control.min}
					max={control.max}
					step={control.step}
					value={n[0]}
					oninput={(e) => set({ ...ew, width: `${e.currentTarget.value}${n[1]}` })}
				/>
				<code>{ew.width}</code>
				<!-- Four tiles, not exclusive. No edge on is no border. -->
				<div class="edges">
					{#each SIDES as s (s)}
						<button
							class="edge"
							class:edge-on={ew.sides[s]}
							onclick={() => set({ ...ew, sides: { ...ew.sides, [s]: !ew.sides[s] } })}
							title={s}
						><span class="edge-bar edge-{s}"></span></button>
					{/each}
				</div>
			{:else if control.type === 'sides'}
				{@const sv = value as Sides}
				<div class="edges">
					{#each SIDES as s (s)}
						<button
							class="edge"
							class:edge-on={sv[s]}
							onclick={() => set({ ...sv, [s]: !sv[s] })}
							title={s}
						><span class="edge-bar edge-{s}"></span></button>
					{/each}
				</div>
			{:else if control.type === 'shadows'}
				<Shadows layers={value as ShadowLayer[]} onchange={set} />
			{:else if control.type === 'toggle'}
				<input
					type="checkbox"
					class="toggle"
					checked={Boolean(value)}
					onchange={(e) => set(e.currentTarget.checked)}
				/>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* `.tabs` wraps by default, which is right on a page and wrong in a column
	   this narrow: three options became two lines that overlapped. */
	.widget :global(.tabs) {
		flex-wrap: nowrap;
		min-width: 0;
	}
	.widget :global(.tabs-item) {
		min-width: 0;
		padding-inline: 0.45rem;
		font-size: 0.7rem;
	}
	.ctl {
		display: grid;
		grid-template-columns: 6.5rem 1fr;
		align-items: center;
		gap: 0.45rem;
		padding: 0.18rem 0;
	}
	/* A shadow list is a column of its own, not a value beside a label. */
	.ctl.wide {
		grid-template-columns: 1fr;
		gap: 0.2rem;
	}
	.name {
		font-size: 0.78rem;
		opacity: 0.85;
		display: flex;
		align-items: center;
		gap: 0.2rem;
	}
	.hint {
		font-size: 0.65rem;
		opacity: 0.5;
		cursor: help;
	}
	.widget {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}
	.widget :global(.range) {
		flex: 1;
		min-width: 4rem;
	}
	code {
		font-size: 0.7rem;
		opacity: 0.75;
		min-width: 2.5rem;
	}
	.unit {
		width: 4.2rem;
		flex: none;
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
