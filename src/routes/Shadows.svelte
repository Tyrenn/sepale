<script lang="ts">
	/**
	 * A list of `box-shadow` layers.
	 *
	 * It writes ONE variable holding the whole value, layers separated by
	 * commas — which is what `chip` and `menu` already read. The four old
	 * modes (soft / hard / inset / relief) were presets over something that
	 * is naturally a list, and a look wanting two shadows could not say so.
	 *
	 * The offset is dragged on a pad rather than typed, because x and y are
	 * one gesture and two numbers only by accident.
	 */
	import { slide } from 'svelte/transition';
	import type { ColorControl, ColorValue, ShadowLayer } from '$lib/theme/schema.js';
	import { splitLength } from '$lib/theme/schema.js';
	import ColorBox from './ColorBox.svelte';

	let {
		layers,
		onchange
	}: { layers: ShadowLayer[]; onchange: (v: ShadowLayer[]) => void } = $props();

	let editing = $state(-1);

	const blank = (): ShadowLayer => ({
		x: '0px',
		y: '2px',
		blur: '6px',
		spread: '0px',
		/* A plain literal: `currentColor` in a mix resolves against whatever
		   is asking, so the tile painted the form's ink rather than the
		   shadow's. */
		color: '#0000002e',
		inset: false
	});

	function set(i: number, part: Partial<ShadowLayer>) {
		onchange(layers.map((l, n) => (n === i ? { ...l, ...part } : l)));
	}
	const add = () => {
		onchange([...layers, blank()]);
		editing = layers.length;
	};
	const remove = (i: number) => {
		onchange(layers.filter((_, n) => n !== i));
		editing = -1;
	};

	/** The pad spans ±16px, which covers every offset a component ever wants. */
	const RANGE = 16;
	const num = (v: string) => splitLength(v, 'px')[0];
	const unit = (v: string) => splitLength(v, 'px')[1];
	const UNITS = ['px', 'em', 'rem'];

	/* A layer's colour is the same box as every other colour in the form —
	   one component to get right, and it already knows how to show a value
	   that only resolves on the element. */
	const colorControl = (i: number): ColorControl => ({
		id: `shadow-layer-${i}`,
		label: 'Shadow colour',
		type: 'color',
		sources: [],
		/* A literal default, so the box offers Custom only: a shadow has no
		   element to derive from. */
		default: { source: '#00000033', shade: 0 },
		vars: ['_x', '_y']
	});
	/* A shadow colour is always a stated colour — there is no element for it
	   to derive from — so the box is always Custom and always has something
	   to paint. */
	const colorValue = (l: ShadowLayer): ColorValue => ({ source: l.color, shade: 0 });

	function drag(e: PointerEvent, i: number) {
		const pad = e.currentTarget as HTMLElement;
		pad.setPointerCapture(e.pointerId);
		const move = (ev: PointerEvent) => {
			const r = pad.getBoundingClientRect();
			const x = Math.round(((ev.clientX - r.left) / r.width - 0.5) * 2 * RANGE);
			const y = Math.round(((ev.clientY - r.top) / r.height - 0.5) * 2 * RANGE);
			set(i, { x: `${x}px`, y: `${y}px` });
		};
		move(e);
		pad.onpointermove = move;
		pad.onpointerup = () => {
			pad.onpointermove = null;
			pad.onpointerup = null;
		};
	}
</script>

<div class="shadows">
	{#each layers as l, i (i)}
		<div class="row">
			<button class="chip-btn" onclick={() => (editing = editing === i ? -1 : i)}>
				<span class="preview" style:box-shadow="{l.inset ? 'inset ' : ''}{l.x} {l.y} {l.blur} {l.spread} {l.color}"></span>
				<code>{l.x} {l.y}</code>
				{#if l.inset}<em>inset</em>{/if}
			</button>
			<button class="x" onclick={() => remove(i)} aria-label="Remove layer">×</button>
		</div>

		{#if editing === i}
			<div class="editor" transition:slide={{ duration: 160 }}>
				<div class="grid">
					<div class="fields">
						<label><span>X</span><input class="input input-xs xy" value={l.x}
							onchange={(e) => set(i, { x: e.currentTarget.value })} /></label>
						<label><span>Y</span><input class="input input-xs xy" value={l.y}
							onchange={(e) => set(i, { y: e.currentTarget.value })} /></label>
					</div>
					<!-- Two numbers that are really one gesture. -->
					<div
						class="pad"
						role="slider"
						tabindex="0"
						aria-label="Offset"
						aria-valuenow={num(l.x)}
						onpointerdown={(e) => drag(e, i)}
					>
						<span class="dot" style:left="{50 + (num(l.x) / RANGE) * 50}%"
							style:top="{50 + (num(l.y) / RANGE) * 50}%"></span>
					</div>
				</div>

				{#each [['blur', 'Blur', 0, 40], ['spread', 'Spread', -10, 20]] as [k, name, lo, hi] (k)}
					<label class="slide"><span>{name}</span>
						<input type="range" class="range" min={lo} max={hi} step="1"
							value={num(l[k as 'blur' | 'spread'])}
							oninput={(e) => set(i, { [k]: `${e.currentTarget.value}${unit(l[k as 'blur' | 'spread'])}` })} />
						<select class="select select-xs unit"
							value={unit(l[k as 'blur' | 'spread'])}
							onchange={(e) => set(i, { [k]: `${num(l[k as 'blur' | 'spread'])}${e.currentTarget.value}` })}>
							{#each UNITS as u (u)}<option value={u}>{u}</option>{/each}
						</select></label>
				{/each}
				<label class="slide"><span>Colour</span>
					<span class="swatchcell">
						<ColorBox control={colorControl(i)} value={colorValue(l)} small 
							onchange={(v) => set(i, { color: v.source })} />
					</span></label>
				<label class="slide"><span>Inset</span>
					<input type="checkbox" class="toggle toggle-xs" checked={l.inset}
						onchange={(e) => set(i, { inset: e.currentTarget.checked })} /></label>
			</div>
		{/if}
	{/each}

	<button class="add" onclick={add} aria-label="Add a shadow layer">+</button>
</div>

<style>
	.shadows {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		width: 100%;
		min-width: 0;
	}
	.editor :global(.range) {
		min-width: 0;
	}
	.row {
		display: flex;
		gap: 0.25rem;
	}
	.chip-btn {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.25rem 0.45rem;
		border-radius: 0.35rem;
		border: 1px solid color-mix(in oklab, currentColor 18%, #0000);
		background: none;
		cursor: pointer;
		font-size: 0.72rem;
		text-align: start;
	}
	.preview {
		width: 1.1rem;
		height: 1.1rem;
		border-radius: 0.25rem;
		background: var(--color-surface-1);
		outline: 1px solid color-mix(in oklab, currentColor 20%, #0000);
		flex: none;
	}
	em {
		font-style: normal;
		opacity: 0.6;
		font-size: 0.65rem;
	}
	.x {
		width: 1.6rem;
		border-radius: 0.35rem;
		border: 1px solid color-mix(in oklab, currentColor 18%, #0000);
		background: none;
		cursor: pointer;
		line-height: 1;
	}
	/* Not a box. The controls belong to the row above them, so they are
	   indented under it rather than framed apart from it. */
	.editor {
		min-width: 0;
		padding: 0.35rem 0 0.5rem 0.55rem;
		border-inline-start: 2px solid color-mix(in oklab, currentColor 12%, #0000);
		margin-inline-start: 0.35rem;
	}
	.grid {
		display: flex;
		gap: 0.6rem;
		align-items: center;
		min-width: 0;
	}
	.fields {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		flex: 1 1 auto;
		min-width: 0;
	}
	.fields :global(.input),
	.slide :global(.input) {
		min-width: 0;
		width: 100%;
	}
	.fields label,
	.slide {
		display: grid;
		grid-template-columns: 2.6rem minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.72rem;
	}
	.fields label {
		grid-template-columns: 1.2rem 1fr;
	}
	.slide {
		margin-top: 0.3rem;
	}
	/* The pad: the origin is the centre, and the dot is where the shadow
	   falls relative to the element. */
	.pad {
		position: relative;
		width: 4rem;
		height: 4rem;
		flex: none;
		border-radius: 0.4rem;
		border: 1px solid color-mix(in oklab, currentColor 18%, #0000);
		background:
			linear-gradient(currentColor, currentColor) center / 1px 100% no-repeat,
			linear-gradient(currentColor, currentColor) center / 100% 1px no-repeat;
		cursor: crosshair;
		touch-action: none;
	}
	.dot {
		position: absolute;
		width: 0.7rem;
		height: 0.7rem;
		border-radius: 50%;
		background: var(--color-primary);
		translate: -50% -50%;
		pointer-events: none;
	}
	/* Discreet, and on the right: adding a layer is rarer than reading the
	   ones that are there. */
	.add {
		align-self: flex-end;
		border: none;
		background: none;
		opacity: 0.6;
		padding: 0 0.2rem;
	}
	.add:hover {
		opacity: 1;
	}
	.xy {
		width: 100%;
		min-width: 0;
	}
	.unit {
		width: 3.4rem;
		flex: none;
	}
	.swatchcell {
		display: flex;
	}
	code {
		font-size: 0.68rem;
		opacity: 0.8;
	}
</style>
