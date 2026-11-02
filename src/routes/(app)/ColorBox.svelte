<script lang="ts">
	/**
	 * One colour, edited in OKLCH.
	 *
	 * The tile is the chrome's `.ui-swatch`; clicking it opens a panel with three
	 * sliders — lightness, chroma, hue — whose tracks are drawn as the gradient
	 * they move along, plus the raw value for anything the sliders cannot say
	 * (`color-mix(…)`, a `var()`).
	 *
	 * It replaces `<input type="color">`, which only speaks sRGB hex: opening it
	 * on an oklch theme and touching nothing rewrote the value in a different
	 * colour space.
	 *
	 * `contrast` is the colour this one is judged against. For a fill that is
	 * the ink derived for it, so the grade answers "is the automatic text on
	 * this colour legible?" — the question a palette actually has.
	 */
	import { slide } from 'svelte/transition';
	import { colorToHex, contrastRatio, oklchToCss, toOklch, type Oklch } from '$lib/components/color.js';

	let {
		value,
		label,
		help = '',
		contrast = '',
		small = false,
		ink = false,
		onchange
	}: {
		value: string;
		label: string;
		help?: string;
		/** A CSS colour to grade this one against (WCAG ratio). */
		contrast?: string;
		/** Small when the tile is one control in a row rather than a palette. */
		small?: boolean;
		/** An ink: drawn as a letter in this colour on `contrast`, as text is. */
		ink?: boolean;
		onchange: (v: string) => void;
	} = $props();

	let open = $state(false);
	let box: HTMLElement;
	/* `position: fixed`, so the panel escapes the scrolling column that would
	   otherwise clip it — a stacking context no z-index gets out of. */
	let at = $state({ x: 0, y: 0 });

	/**
	 * The three numbers are STATE, not a reading of the current colour.
	 *
	 * Deriving them would put every value through the canvas on each drag, and
	 * that trip is lossy — so moving the hue nudged the lightness and the
	 * chroma. Seeded when the panel opens, and after that only written.
	 */
	let lch = $state<Oklch>({ l: 0.5, c: 0.1, h: 0 });

	function toggle() {
		if (!open) {
			const r = box.getBoundingClientRect();
			at = { x: Math.min(r.left, window.innerWidth - 340), y: r.bottom + 6 };
			lch = toOklch(value);
		}
		open = !open;
	}

	function setLch(part: Partial<Oklch>) {
		lch = { ...lch, ...part };
		onchange(oklchToCss(lch));
	}

	/* `value` is read so the grade follows every edit. */
	let ratio = $derived(contrast && value ? contrastRatio(value, contrast) : 0);
	let grade = $derived(ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA large' : 'fail');

	const ramp = (vals: number[], key: 'l' | 'c' | 'h') =>
		`linear-gradient(to right, ${vals.map((v) => oklchToCss({ ...lch, [key]: v })).join(',')})`;
	let lTrack = $derived(ramp([0, 0.25, 0.5, 0.75, 1], 'l'));
	let cTrack = $derived(ramp([0, 0.13, 0.26, 0.37], 'c'));
	let hTrack = $derived(ramp(Array.from({ length: 13 }, (_, i) => i * 30), 'h'));
</script>

<svelte:window
	onpointerdown={(e) => {
		if (open && !box.contains(e.target as Node)) open = false;
	}}
	onkeydown={(e) => e.key === 'Escape' && (open = false)}
/>

<span class="box" class:small bind:this={box}>
	<button
		class="ui-swatch"
		class:ink
		style:--ui-swatch-color={ink ? contrast || 'transparent' : value}
		style:color={ink ? value : undefined}
		onclick={toggle}
		aria-expanded={open}
		aria-label={label}
		title="{label} — {value}"
	>{#if ink}<span aria-hidden="true">Aa</span>{/if}</button>

	{#if open}
		<div class="panel" style:left="{at.x}px" style:top="{at.y}px" transition:slide={{ duration: 160 }}>
			<header>
				<span class="ui-swatch ui-swatch-lg" style:--ui-swatch-color={value}></span>
				<span class="ui-title">{label}</span>
				{#if ratio}
					<span class="grade" class:bad={ratio < 4.5} title="Contrast with its text">
						{grade}<small>{ratio}</small>
					</span>
				{/if}
			</header>

			{#if help}<p class="help">{help}</p>{/if}

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
				<input type="text" class="ui-input ui-input-xs" {value} spellcheck="false"
					onchange={(e) => {
						onchange(e.currentTarget.value);
						lch = toOklch(e.currentTarget.value);
					}} />
			</label>
		</div>
	{/if}
</span>

<style>
	/* An ink reads as text: a letter of it on the ground it is written on. */
	.ink {
		font-weight: 700;
		font-size: 1.05rem;
		letter-spacing: -0.02em;
	}
	.box {
		display: inline-flex;
		position: relative;
	}
	:global(.box .ui-swatch) {
		--ui-swatch-size: 2.5rem;
		/* A ring the swatch's own border cannot give: a white tile on a white
		   page is otherwise simply not there. */
		outline: 1px solid color-mix(in oklab, currentColor 28%, #0000);
		outline-offset: -1px;
		cursor: pointer;
		padding: 0;
	}
	:global(.box .ui-swatch-lg) {
		--ui-swatch-size: 3rem;
	}
	:global(.box.small .ui-swatch) {
		--ui-swatch-size: 1.5rem;
	}
	.panel {
		position: fixed;
		z-index: 1000;
		width: 20rem;
		padding: 0.75rem;
		border-radius: 0.6rem;
		background: var(--app-bg);
		color: var(--app-fg);
		border: 1px solid var(--app-line);
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
	.ui-title {
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
		color: var(--ui-color-error);
		opacity: 1;
	}
	.grade small {
		font-weight: 400;
		opacity: 0.7;
		margin-inline-start: 0.25rem;
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
		border: 1px solid var(--app-line);
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
		margin: 0 0 0.25rem;
		line-height: 1.4;
	}
	code {
		font-size: 0.68rem;
		opacity: 0.8;
	}
</style>
