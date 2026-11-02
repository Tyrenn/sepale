<script lang="ts">
	// Fixed values: the prerendered page and the hydrated one must match. Those
	// at the edges stand out, those behind the text stay faint enough to read it.
	const PETALS = [
		{ left: 3, size: 26, fall: 17, delay: 2, sway: 34, swing: 3.4, flip: 6, opacity: 0.6 },
		{ left: 14, size: 16, fall: 23, delay: 13, sway: 22, swing: 4.2, flip: 8, opacity: 0.25 },
		{ left: 27, size: 20, fall: 20, delay: 7, sway: 30, swing: 3.8, flip: 7, opacity: 0.28 },
		{ left: 39, size: 15, fall: 26, delay: 20, sway: 24, swing: 4.6, flip: 9, opacity: 0.22 },
		{ left: 49, size: 24, fall: 18, delay: 11, sway: 38, swing: 3.2, flip: 5.5, opacity: 0.5 },
		{ left: 62, size: 18, fall: 24, delay: 3, sway: 26, swing: 4, flip: 8, opacity: 0.35 },
		{ left: 74, size: 22, fall: 19, delay: 16, sway: 32, swing: 3.6, flip: 6.5, opacity: 0.45 },
		{ left: 86, size: 17, fall: 25, delay: 9, sway: 24, swing: 4.4, flip: 7.5, opacity: 0.35 },
		{ left: 96, size: 28, fall: 16, delay: 5, sway: 30, swing: 3, flip: 5, opacity: 0.6 }
	];
</script>

<!-- Decorative, hidden from assistive technologies. -->
<div class="s-sky" aria-hidden="true">
	{#each PETALS as petal (petal.left)}
		<div
			class="s-petal"
			style:left="{petal.left}%"
			style:opacity={petal.opacity}
			style:animation-delay="-{petal.delay}s"
			style:animation-duration="{petal.fall}s"
		>
			<div
				class="s-swing"
				style:--sway="{petal.sway}px"
				style:animation-delay="-{petal.delay}s"
				style:animation-duration="{petal.swing}s"
			>
				<svg
					viewBox="0 0 64 64"
					style:width="{petal.size}px"
					style:height="{petal.size}px"
					style:animation-delay="-{petal.delay}s"
					style:animation-duration="{petal.flip}s"
				>
					<path fill="#bfe6c4" d="M32 62C12 47 12 19 32 2c20 17 20 45 0 60Z" />
					<path fill="#2f7d4f" d="M32 62c20-15 20-43 0-60Z" />
				</svg>
			</div>
		</div>
	{/each}
</div>

<style>
	.s-sky {
		position: absolute;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
	}

	/* As tall as the hero, so that a translation of 100% crosses it, whatever its height. */
	.s-petal {
		position: absolute;
		top: 0;
		height: 100%;
		will-change: transform;
		animation: s-fall linear infinite;
	}

	/* A leaf falls swinging: it tilts toward the end of each sweep. */
	.s-swing {
		animation: s-swing ease-in-out infinite alternate;
	}

	svg {
		display: block;
		animation: s-flip linear infinite;
	}

	@keyframes s-fall {
		from {
			transform: translateY(-60px);
		}

		to {
			transform: translateY(calc(100% + 60px));
		}
	}

	@keyframes s-swing {
		from {
			transform: translateX(calc(-1 * var(--sway))) rotate(-32deg);
		}

		to {
			transform: translateX(var(--sway)) rotate(32deg);
		}
	}

	@keyframes s-flip {
		to {
			transform: rotate3d(1, 0.4, 0, 360deg);
		}
	}

	/* No motion, no petals: stopped in mid-air, they would mean nothing. */
	@media (prefers-reduced-motion: reduce) {
		.s-sky {
			display: none;
		}
	}
</style>
