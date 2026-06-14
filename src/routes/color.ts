/**
 * Resolve any CSS color string (oklch, hsl, named, hex…) to a `#rrggbb`
 * hex the native <input type="color"> can display. Uses the browser's own
 * color engine via a hidden probe element, so it supports every syntax the
 * browser does. Returns `#000000` when it can't resolve (e.g. SSR).
 */
let probe: HTMLSpanElement | null = null;

export function colorToHex(input: string): string {
	if (typeof document === 'undefined') return '#000000';
	if (!probe) {
		probe = document.createElement('span');
		probe.style.display = 'none';
		document.body.appendChild(probe);
	}
	// Reset then assign so an invalid value leaves the previous computed color.
	probe.style.color = '#000000';
	probe.style.color = input;
	const computed = getComputedStyle(probe).color;
	const nums = computed.match(/[\d.]+/g);
	if (!nums || nums.length < 3) return '#000000';
	const [r, g, b] = nums.slice(0, 3).map(Number);
	return (
		'#' +
		[r, g, b].map((n) => Math.round(n).toString(16).padStart(2, '0')).join('')
	);
}
