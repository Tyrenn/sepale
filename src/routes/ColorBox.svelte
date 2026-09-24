<script lang="ts">
	/**
	 * The one colour control. Every colour in the form is this component.
	 *
	 * Two modes, and **no source to pick**:
	 *
	 *   Derived — from the one thing it could sensibly derive from, which the
	 *             control already knows. A surface follows surface-1; a
	 *             background, a border, a shadow or an ink follows the
	 *             element's OWN fill — whatever semantic colour was put on it,
	 *             or the base surface when none was. Only the intensity is a
	 *             question.
	 *   Custom  — a colour of your own, on the three OKLCH sliders.
	 *
	 * Offering a grid of tokens to derive from was a mistake: "derived from
	 * `--color-accent` at 12%" is a second way to write a fixed colour, which
	 * Custom already does. Derivation is for following something that MOVES,
	 * and there is only ever one such thing per colour.
	 */
	import { slide } from 'svelte/transition';
	import type { ColorControl, ColorValue } from '$lib/theme/schema.js';
	import { isLiteral, isOwn } from '$lib/theme/schema.js';
	import { colorToHex, contrastRatio, oklchToCss, toOklch, type Oklch } from './color.js';

	let {
		control,
		value,
		onchange,
		/** The colour this tile is written on, when it is an ink: shows the `A`. */
		over = '',
		/** Small when the tile is one control in a form row rather than a palette. */
		small = false
	}: {
		control: ColorControl;
		value: ColorValue;
		onchange: (v: ColorValue) => void;
		over?: string;
		small?: boolean;
	} = $props();

	let open = $state(false);
	let box: HTMLElement;
	/* `position: fixed`, so the panel escapes the scrolling column that would
	   otherwise clip it — a stacking context no z-index gets out of. */
	let at = $state({ x: 0, y: 0 });

	let follows = $derived(control.default.source);
	let canDerive = $derived(!isLiteral(follows));
	let isCustom = $derived(isLiteral(value.source));

	/* An ink in Derived mode writes nothing — the stylesheet derives it — so
	   its SOURCE is an absence. What it resolves to is the variable named
	   after the control, and that is what the tile must paint: a checkerboard
	   here would say "undefined" about a colour the page is already using. */
	let resolved = $derived(control.kind === 'contrast' && over ? `var(--${control.id})` : '');
	let css = $derived(
		resolved || (isLiteral(value.source) ? value.source : `var(--${value.source})`)
	);
	let hex = $derived(isOwn(value.source) && !resolved ? '' : colorToHex(css));
	/* Only a colour that resolves nowhere gets the checkerboard. */
	let undefinedHere = $derived(isOwn(value.source) && !resolved);

	/**
	 * The three numbers are STATE, not a reading of the current colour.
	 *
	 * Deriving them would put every value through the canvas on each drag, and
	 * that trip is lossy — so moving the hue nudged the lightness and the
	 * chroma. In Custom you chose the colour; there is nothing left to
	 * recompute. Seeded when the panel opens and when Custom is entered, and
	 * after that only written.
	 */
	let lch = $state<Oklch>({ l: 0.5, c: 0.1, h: 0 });

	function toggle() {
		if (!open) {
			const r = box.getBoundingClientRect();
			at = { x: Math.min(r.left, window.innerWidth - 340), y: r.bottom + 6 };
			lch = toOklch(hex || '#888888');
		}
		open = !open;
	}

	/* An ink is judged against what it is written on, everything else against
	   the page. */
	let ratio = $derived(
		hex && control.kind === 'contrast'
			? contrastRatio(hex, colorToHex(over || 'var(--color-background)'))
			: 0
	);
	let grade = $derived(ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA large' : 'fail');

	const pick = (source: string) =>
		onchange({ ...value, source, shade: isLiteral(source) ? 0 : value.shade });

	function toCustom() {
		lch = toOklch(hex || '#888888');
		pick(oklchToCss(lch));
	}
	function setLch(part: Partial<Oklch>) {
		lch = { ...lch, ...part };
		pick(oklchToCss(lch));
	}

	const ramp = (vals: number[], key: 'l' | 'c' | 'h') =>
		`linear-gradient(to right, ${vals.map((v) => oklchToCss({ ...lch, [key]: v })).join(',')})`;
	let lTrack = $derived(ramp([0, 0.25, 0.5, 0.75, 1], 'l'));
	let cTrack = $derived(ramp([0, 0.13, 0.26, 0.37], 'c'));
	let hTrack = $derived(ramp(Array.from({ length: 13 }, (_, i) => i * 30), 'h'));

	let label = $derived(
		control.follows ??
			(isOwn(follows)
				? 'the element’s own fill'
				: follows.startsWith('color-')
					? follows.replace('color-', '')
					: follows)
	);
</script>

<svelte:window
	onpointerdown={(e) => {
		if (open && !box.contains(e.target as Node)) open = false;
	}}
	onkeydown={(e) => e.key === 'Escape' && (open = false)}
/>

<span class="box" class:small bind:this={box}>
	<!-- The kit's own swatch, short-circuited: it opens this panel instead of
	     being an input, because what it edits is a pair and not a colour.
	     An ink tile sits ON its partner and writes an `A` in itself, which is
	     the only way to judge an ink — a contrast number is not enough. -->
	<button
		class="swatch"
		class:none={undefinedHere}
		style:--swatch-color={undefinedHere ? 'transparent' : over || css}
		style:color={over ? css : null}
		onclick={toggle}
		aria-expanded={open}
		aria-label={control.label}
		title={control.help ?? control.label}>{over ? 'A' : ''}</button
	>

	{#if open}
		<div
			class="panel"
			style:left="{at.x}px"
			style:top="{at.y}px"
			transition:slide={{ duration: 160 }}
		>
			<header>
				<span
					class="swatch swatch-lg"
					class:none={undefinedHere}
					style:--swatch-color={undefinedHere ? 'transparent' : over || css}
					style:color={over ? css : null}>{over ? 'A' : ''}</span
				>
				<span class="title">{control.label}{over ? ' — text' : ''}</span>
				{#if ratio}
					<span class="grade" class:bad={ratio < 4.5}>{grade}<small>{ratio}</small></span>
				{/if}
			</header>

			{#if control.help}<p class="help">{control.help}</p>{/if}

			{#if canDerive}
				<div class="tabs tabs-box tabs-xs" role="tablist">
					<input type="radio" class="tabs-item" name="mode-{control.id}" aria-label="Derived"
						checked={!isCustom} onchange={() => pick(follows)} />
					<input type="radio" class="tabs-item" name="mode-{control.id}" aria-label="Custom"
						checked={isCustom} onchange={toCustom} />
				</div>
			{/if}

			{#if isCustom}
				<label class="slider">
					<span>Lightness</span>
					<input type="range" min="0" max="1" step="0.005" value={lch.l} style:background={lTrack}
						oninput={(e) => setLch({ l: Number(e.currentTarget.value) })} />
					<code>{lch.l}</code>
				</label>
				<label class="slider">
					<span>Chroma</span>
					<input type="range" min="0" max="0.37" step="0.005" value={lch.c} style:background={cTrack}
						oninput={(e) => setLch({ c: Number(e.currentTarget.value) })} />
					<code>{lch.c}</code>
				</label>
				<label class="slider">
					<span>Hue</span>
					<input type="range" min="0" max="360" step="1" value={lch.h} style:background={hTrack}
						oninput={(e) => setLch({ h: Number(e.currentTarget.value) })} />
					<code>{lch.h}°</code>
				</label>
				<label class="slider value">
					<span>Value</span>
					<input type="text" class="input input-xs" value={value.source}
						onchange={(e) => pick(e.currentTarget.value)} />
				</label>
			{:else}
				<p class="from">follows <strong>{label}</strong></p>
				<label class="slider">
					<span>Intensity</span>
					<input type="range" min="0" max="0.5" step="0.01" value={value.shade}
						oninput={(e) => onchange({ ...value, shade: Number(e.currentTarget.value) })} />
					<code>{Math.round(value.shade * 200)}</code>
				</label>
				<p class="help">
					A light source darkens and a dark one lightens — the direction is not a
					setting, which is why one value works in a light theme and in its dark twin.
				</p>
			{/if}
		</div>
	{/if}
</span>

<style>
	.box {
		display: inline-flex;
		position: relative;
	}
	:global(.box .swatch) {
		--swatch-size: 2.5rem;
		/* A ring the swatch's own border cannot give: `--swatch-border-color`
		   derives from the colour, so a white tile gets a white edge and a
		   transparent one gets nothing. This does not depend on the value. */
		outline: 1px solid color-mix(in oklab, currentColor 28%, #0000);
		outline-offset: -1px;
		cursor: pointer;
		padding: 0;
		font-weight: 700;
		font-size: 1.05rem;
		line-height: 1;
	}
	:global(.box .swatch-lg) {
		--swatch-size: 3rem;
	}
	:global(.box.small .swatch) {
		--swatch-size: 1.5rem;
		font-size: 0.7rem;
	}
	/* Nothing stated yet, or a colour that only resolves on the element. The
	   checkerboard is the one fill that cannot be mistaken for a colour — a
	   pale swatch on a pale page is otherwise simply not there. */
	:global(.box .swatch.none) {
		background-image:
			linear-gradient(
				45deg,
				color-mix(in oklab, currentColor 18%, #0000) 25%,
				#0000 25% 75%,
				color-mix(in oklab, currentColor 18%, #0000) 75%
			),
			linear-gradient(
				45deg,
				color-mix(in oklab, currentColor 18%, #0000) 25%,
				#0000 25% 75%,
				color-mix(in oklab, currentColor 18%, #0000) 75%
			);
		background-size: 10px 10px;
		background-position:
			0 0,
			5px 5px;
	}
	.panel {
		position: fixed;
		z-index: 1000;
		width: 20rem;
		padding: 0.75rem;
		border-radius: 0.6rem;
		background: var(--color-background);
		border: 1px solid var(--color-border);
		box-shadow:
			0 1px 2px color-mix(in oklab, currentColor 8%, #0000),
			0 8px 24px -8px color-mix(in oklab, currentColor 18%, #0000);
	}
	header {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		margin-bottom: 0.5rem;
	}
	.title {
		font-weight: 600;
		font-size: 0.85rem;
		flex: 1;
	}
	.grade {
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		padding: 0.1rem 0.4rem;
		border-radius: 0.3rem;
		border: 1px dashed currentColor;
		opacity: 0.8;
	}
	.grade.bad {
		color: var(--color-error);
		opacity: 1;
	}
	.grade small {
		font-weight: 400;
		opacity: 0.7;
		margin-inline-start: 0.25rem;
	}
	.from {
		font-size: 0.72rem;
		opacity: 0.75;
		margin: 0.6rem 0 0.1rem;
	}
	.slider {
		display: grid;
		grid-template-columns: 4.5rem 1fr 2.6rem;
		align-items: center;
		gap: 0.45rem;
		font-size: 0.72rem;
		margin-top: 0.35rem;
	}
	.slider.value {
		grid-template-columns: 4.5rem 1fr;
	}
	/* The track carries the gradient, so the slider shows what it does. */
	.slider input[type='range'] {
		appearance: none;
		height: 1.5rem;
		border-radius: 0.3rem;
		border: 1px solid var(--color-border);
	}
	.slider input[type='range']::-webkit-slider-thumb {
		appearance: none;
		width: 1rem;
		height: 1.3rem;
		border-radius: 0.25rem;
		border: 2px solid oklch(100% 0 0);
		box-shadow: 0 0 0 1px color-mix(in oklab, currentColor 40%, #0000);
		background: #0000;
		cursor: ew-resize;
	}
	.help {
		font-size: 0.68rem;
		opacity: 0.62;
		margin: 0.5rem 0 0;
		line-height: 1.4;
	}
	code {
		font-size: 0.68rem;
		opacity: 0.8;
	}
</style>
