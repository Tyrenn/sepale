/**
 * The toasts on screen, and the two functions that change them.
 *
 * One list for the whole page: `toast()` can be called from anywhere — a
 * form action, a fetch handler — and the single `<Toaster>` placed in the
 * layout draws whatever is in it. Timers live in the Toaster, not here, so
 * hovering a toast can pause its own countdown.
 */

/** The colours an alert has an icon for, and any other the family ships. */
export type ToastColor = 'primary' | 'secondary' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'error';

export interface ToastOptions {
	message: string;
	title?: string;
	color?: ToastColor;
	/** Milliseconds on screen. `0` keeps it until dismissed. Default 5000. */
	duration?: number;
	/** One button inside the toast. Clicking it also dismisses the toast. */
	action?: { label: string; onClick: () => void };
}

export interface Toast extends ToastOptions {
	id: number;
	duration: number;
}

let next = 1;

/** Read only from outside: change it through `toast()` and `dismissToast()`. */
export const toasts: Toast[] = $state([]);

/** Show a toast. Returns its id, for `dismissToast`. */
export function toast(options: string | ToastOptions): number {
	const o = typeof options === 'string' ? { message: options } : options;
	const id = next++;
	toasts.push({ ...o, id, duration: o.duration ?? 5000 });
	return id;
}

/** Remove a toast now. Unknown ids are ignored. */
export function dismissToast(id: number): void {
	const i = toasts.findIndex((t) => t.id === id);
	if (i >= 0) toasts.splice(i, 1);
}
