/**
 * A CSS colour, as the six hex digits `<input type="color">` insists on.
 *
 * Two conversions, and both are needed:
 *
 * 1. The value may be a reference — `var(--color-primary)` — so it is resolved
 *    against the document first, by assigning it to a probe element and
 *    reading the computed value back.
 *
 * 2. That computed value is NOT necessarily rgb. A browser keeps
 *    `oklch(1 0 0)` as `oklch(1 0 0)`, and reading three numbers out of it
 *    gives 1, 0, 0 — which as bytes is very nearly black. That is what used to
 *    happen to every daisy theme, whose whole palette is oklch: the swatches
 *    all came out black. So the resolved colour is painted onto a 1×1 canvas
 *    and the pixel is read, which is sRGB by definition whatever the input
 *    colour space was.
 *
 * The picker is the only thing that needs this. The tile beside it is a
 * `.swatch` with the raw value in `--swatch-color`, and CSS renders oklch
 * perfectly well — so what you SEE is always right even when the conversion
 * is not.
 */

let probe: HTMLSpanElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

export function colorToHex(input: string): string {
	if (typeof document === 'undefined') return '#000000';

	if (!probe) {
		probe = document.createElement('span');
		probe.style.display = 'none';
		document.body.appendChild(probe);
	}
	/* Reset then assign, so an invalid value leaves black rather than whatever
	   the previous call left behind. */
	probe.style.color = '#000000';
	probe.style.color = input;
	const resolved = getComputedStyle(probe).color;

	if (!ctx) {
		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = 1;
		ctx = canvas.getContext('2d', { willReadFrequently: true });
	}
	if (!ctx) return '#000000';

	try {
		/* Clear first: a colour with alpha would otherwise composite over the
		   previous pixel and come back wrong. */
		ctx.clearRect(0, 0, 1, 1);
		ctx.fillStyle = '#000000';
		ctx.fillStyle = resolved;
		ctx.fillRect(0, 0, 1, 1);
		const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
		return '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('');
	} catch {
		return '#000000';
	}
}
