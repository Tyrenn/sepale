<script lang="ts">
	import type { Control } from '$lib/theme/schema.js';
	import { get, set, reset } from '$lib/theme/store.svelte.js';
	import { colorToHex } from './color.js';
	import { splitLength } from '$lib/theme/schema.js';
	/* A control renders its own children: an effect reveals the controls of
	   the mode you pick. Svelte 5 does this by importing the file itself. */
	import Self from './Control.svelte';

	/**
	 * One field of the generator. It knows about control types, never about
	 * variables: what a control writes is the schema's business, and a control
	 * that writes four of them looks exactly like one that writes none.
	 *
	 * An effect renders its mode picker and then, inline and indented, the
	 * controls that mode reveals — which is the whole point of an effect being
	 * a control rather than a section.
	 */
	let { control }: { control: Control } = $props();

	let value = $derived(get(control.id, (control as { default?: unknown }).default));
	let dirty = $derived(get(control.id, undefined) !== undefined);

	/* A length is a slider when it reads as <number><unit>, and a text field
	   when it does not — `calc(2.5em * var(--scale))` is a legitimate default
	   and must survive being shown. */
	let numeric = $derived(
		control.type === 'length' && /^-?[\d.]+\s*[a-z%]*$/i.test(String(value))
	);
	let parts = $derived(
		numeric ? splitLength(String(value), (control as { units: string[] }).units[0]) : [0, '']
	);
</script>

<div class="ctl" class:ctl-effect={control.type === 'effect'}>
	<div class="ctl-head">
		<span class="ctl-label">{control.label}</span>
		{#if dirty}
			<button class="btn btn-xs btn-ghost" onclick={() => reset(control.id)} title="Back to neutral">
				reset
			</button>
		{/if}
	</div>

	{#if control.type === 'color'}
		<div class="ctl-row">
			<input
				type="color"
				class="ctl-color"
				value={colorToHex(String(value))}
				oninput={(e) => set(control.id, e.currentTarget.value)}
				aria-label={control.label}
			/>
			<input
				class="input input-sm ctl-text"
				value={String(value)}
				oninput={(e) => set(control.id, e.currentTarget.value)}
			/>
		</div>
	{:else if control.type === 'number' || control.type === 'percent'}
		<div class="ctl-row">
			<input
				class="range"
				type="range"
				min={control.min}
				max={control.max}
				step={control.step}
				value={parseFloat(String(value)) || 0}
				oninput={(e) =>
					set(control.id, control.type === 'percent'
						? e.currentTarget.value + '%'
						: e.currentTarget.value)}
			/>
			<output class="ctl-out">{value}</output>
		</div>
	{:else if control.type === 'length' && numeric}
		<div class="ctl-row">
			<input
				class="range"
				type="range"
				min={control.min}
				max={control.max}
				step={control.step}
				value={parts[0]}
				oninput={(e) => set(control.id, e.currentTarget.value + parts[1])}
			/>
			<select
				class="select select-xs ctl-unit"
				value={parts[1]}
				onchange={(e) => set(control.id, parts[0] + e.currentTarget.value)}
			>
				{#each control.units as u (u)}<option value={u}>{u}</option>{/each}
			</select>
		</div>
	{:else if control.type === 'length'}
		<input
			class="input input-sm"
			value={String(value)}
			oninput={(e) => set(control.id, e.currentTarget.value)}
		/>
	{:else if control.type === 'select'}
		<select
			class="select select-sm"
			value={String(value)}
			onchange={(e) => set(control.id, e.currentTarget.value)}
		>
			{#each control.options as o (o.value)}<option value={o.value}>{o.label}</option>{/each}
		</select>
	{:else if control.type === 'sides'}
		<!-- Four booleans as a compass, so "bottom and right" is one glance
		     rather than a sentence. -->
		<div class="sides">
			{#each ['top', 'right', 'bottom', 'left'] as side (side)}
				<label class="sides-{side}">
					<input
						type="checkbox"
						class="checkbox checkbox-xs"
						checked={(value as Record<string, boolean>)[side]}
						onchange={(e) =>
							set(control.id, {
								...(value as Record<string, boolean>),
								[side]: e.currentTarget.checked
							})}
					/>
					<span class="sides-name">{side}</span>
				</label>
			{/each}
		</div>
	{:else if control.type === 'effect'}
		<div class="modes">
			{#each control.modes as m (m.id)}
				<button
					class="btn btn-xs"
					class:btn-active={value === m.id}
					onclick={() => set(control.id, m.id)}
					title={m.help ?? ''}
				>
					{m.label}
				</button>
			{/each}
		</div>
		{#each control.modes.filter((m) => m.id === value) as m (m.id)}
			{#if m.help}<p class="ctl-help ctl-help-mode">{m.help}</p>{/if}
			{#if m.controls.length}
				<div class="revealed">
					{#each m.controls as c (c.id)}
						<Self control={c} />
					{/each}
				</div>
			{/if}
		{/each}
	{/if}

	{#if control.help && control.type !== 'effect'}
		<p class="ctl-help">{control.help}</p>
	{/if}
</div>

<style>
	.ctl {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		padding: 0.5rem 0;
	}
	.ctl-effect {
		border-top: 1px solid color-mix(in oklab, currentColor 12%, transparent);
		padding-top: 0.75rem;
		margin-top: 0.25rem;
	}
	.ctl-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}
	.ctl-label {
		font-size: 0.8rem;
		font-weight: 600;
	}
	.ctl-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.ctl-row :global(.range) {
		flex: 1;
		min-width: 0;
	}
	.ctl-color {
		width: 2rem;
		height: 1.6rem;
		padding: 0;
		border: 1px solid color-mix(in oklab, currentColor 25%, transparent);
		background: none;
	}
	.ctl-text {
		flex: 1;
		min-width: 0;
		font-family: ui-monospace, monospace;
		font-size: 0.7rem;
	}
	.ctl-out {
		font-family: ui-monospace, monospace;
		font-size: 0.7rem;
		min-width: 3.5rem;
		text-align: right;
		opacity: 0.7;
	}
	.ctl-unit {
		width: auto;
	}
	.ctl-help {
		margin: 0;
		font-size: 0.7rem;
		line-height: 1.4;
		opacity: 0.6;
	}
	.ctl-help-mode {
		margin-top: 0.15rem;
	}
	.modes {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}
	.revealed {
		margin-left: 0.6rem;
		padding-left: 0.6rem;
		border-left: 2px solid color-mix(in oklab, currentColor 15%, transparent);
	}
	.sides {
		display: grid;
		grid-template-areas: '. top .' 'left . right' '. bottom .';
		gap: 0.15rem 0.5rem;
		font-size: 0.7rem;
		width: max-content;
	}
	.sides-top {
		grid-area: top;
	}
	.sides-right {
		grid-area: right;
	}
	.sides-bottom {
		grid-area: bottom;
	}
	.sides-left {
		grid-area: left;
	}
	.sides label,
	.sides > :global(label) {
		display: flex;
		align-items: center;
		gap: 0.2rem;
	}
	.sides-name {
		opacity: 0.7;
	}
</style>
