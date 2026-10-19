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
		return '#' + [r, g, b].map((n = 0) => n.toString(16).padStart(2, '0')).join('');
	} catch {
		return '#000000';
	}
}

/* ------------------------------------------------------------------ *
 * OKLCH
 *
 * The picker edits lightness, chroma and hue, so it needs those three
 * numbers out of whatever the value happens to be — a token, a hex, an
 * `oklch()`. Everything goes through `colorToHex` first, which resolves
 * references and normalises the colour space, and then through the sRGB →
 * OKLab transform (Björn Ottosson's matrices).
 *
 * The round trip is lossy at the edges: a colour outside sRGB comes back
 * clamped, because a 1×1 canvas is sRGB by definition. That is the right
 * trade here — the picker's own gradients are drawn in sRGB too, so what you
 * drag is what you get.
 * ------------------------------------------------------------------ */

export interface Oklch {
	l: number;
	c: number;
	h: number;
}

const lin = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);

export function toOklch(input: string): Oklch {
	const hex = colorToHex(input);
	const [r = 0, g = 0, b = 0] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255));

	const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
	const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
	const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

	const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
	const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
	const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

	return {
		l: Math.round(L * 1000) / 1000,
		c: Math.round(Math.hypot(A, B) * 1000) / 1000,
		h: Math.round((((Math.atan2(B, A) * 180) / Math.PI + 360) % 360) * 10) / 10
	};
}

/** The three numbers back as CSS, in the notation a theme file carries. */
export const oklchToCss = ({ l, c, h }: Oklch) =>
	`oklch(${Math.round(l * 1000) / 10}% ${Math.round(c * 1000) / 1000} ${h})`;

/**
 * WCAG contrast against a surface, measured off real pixels.
 *
 * Not computed from the lightness: two colours at the same OKLCH lightness
 * can be a stop apart in relative luminance, and the badge has to say what a
 * checker would say rather than what the slider suggests.
 */
export function contrastRatio(a: string, b: string): number {
	const lum = (x: string) => {
		const hex = colorToHex(x);
		const [r = 0, g = 0, bl = 0] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255));
		return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
	};
	const [x, y] = [lum(a), lum(b)];
	return Math.round(((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)) * 10) / 10;
}
