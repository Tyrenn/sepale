/**
 * Motion belongs to the family (ADR 0019). A component never decides how an
 * element moves: it marks the moment on the element, and waits exactly as
 * long as the family's CSS says, read back from the computed style.
 *
 * - `data-motion="enter"`: the element was just inserted. Set while the
 *   family's animation runs, then removed. A new element has no style to
 *   transition from, so the family animates it with `@keyframes` (or
 *   `@starting-style`).
 * - `data-motion="leave"`: the element is going. It stays in the DOM until
 *   the family's transitions and animations on it have run.
 * - `data-motion="move"`: the element just changed places in a list (a toast
 *   stack). `--motion-dx` / `--motion-dy` hold where it came from, relative
 *   to where it now stands: the family plays it back from there.
 * - `--motion-w` / `--motion-h`: the element's size as it enters or leaves,
 *   for a family that opens or collapses it (`height: auto` does not
 *   animate).
 *
 * A family that draws nothing for a phase makes it instant: nothing to wait for.
 *
 * An app may hand a component a Svelte transition or animation instead
 * (`Motion`, `Move`): that one plays, and the family's phase is not marked.
 */

import type { TransitionConfig } from 'svelte/transition';
import type { AnimationConfig } from 'svelte/animate';

/** A CSS time (`0.2s`, `150ms`) in milliseconds. */
const ms = (time: string) => {
	const n = parseFloat(time) || 0;
	return time.trim().endsWith('ms') ? n : n * 1000;
};

/** The longest of a list of durations, each with its delay (and repeat count). */
function longest(durations: string, delays: string, counts?: string) {
	const d = durations.split(',');
	const l = delays.split(',');
	const c = counts?.split(',');
	let max = 0;
	for (let i = 0; i < d.length; i++) {
		const repeat = c ? Number(c[i % c.length]) : 1;
		/* An infinite animation is decoration, not a phase to wait for. */
		if (!Number.isFinite(repeat)) continue;
		max = Math.max(max, ms(l[i % l.length] ?? '0s') + ms(d[i] ?? '0s') * repeat);
	}
	return max;
}

/** How long the family's motion on this element lasts now, in milliseconds:
 *  the longest of its CSS transitions and animations, delays included. */
export function motionTime(node: Element): number {
	const s = getComputedStyle(node);
	const transitions = longest(s.transitionDuration, s.transitionDelay);
	const animations = s.animationName === 'none' ? 0 : longest(s.animationDuration, s.animationDelay, s.animationIterationCount);
	return Math.max(transitions, animations);
}

type Phase = 'enter' | 'leave' | 'move';

/** Marks the phase on the element (restarting it if it was already marked)
 *  and returns how long the family plays it. */
function mark(node: HTMLElement, phase: Phase) {
	if (node.dataset.motion === phase) {
		delete node.dataset.motion;
		void node.offsetWidth;
	}
	node.dataset.motion = phase;
	return motionTime(node);
}

/** Clears a passing phase once its time is up, unless another took its place. */
function unmark(node: HTMLElement, phase: Phase, time: number) {
	setTimeout(() => {
		if (node.dataset.motion === phase) delete node.dataset.motion;
	}, time);
}

function size(node: HTMLElement) {
	const r = node.getBoundingClientRect();
	node.style.setProperty('--motion-w', `${r.width}px`);
	node.style.setProperty('--motion-h', `${r.height}px`);
}

/** Any Svelte transition: `fade`, `fly`, `slide`, `scale`, your own. */
export type TransitionFunction<P = any> = (
	node: HTMLElement,
	params: P,
	options: { direction: 'in' | 'out' | 'both' }
) => TransitionConfig | (() => TransitionConfig);

/** Any Svelte animation for keyed lists: `flip`, your own. */
export type AnimationFunction<P = any> = (
	node: HTMLElement,
	rects: { from: DOMRect; to: DOMRect },
	params: P
) => AnimationConfig;

/** One direction's motion: see `Motion`. */
export type MotionOne = boolean | TransitionFunction | { fn: TransitionFunction; params?: any };

/**
 * Who plays an element's coming and going. Omitted or `true`: the family
 * (`data-motion`, its CSS). `false`: nobody, it is instant. A Svelte
 * transition, alone or with its params (`fly`, `{ fn: fly, params: { y: 8 } }`):
 * that one, and the family's CSS is not triggered. `{ in, out }` sets each
 * direction apart, a direction left out staying the family's. A pair
 * `[out, in]` is what Svelte's `crossfade()` returns, `[send, receive]`: it
 * can be handed over as is.
 */
export type Motion =
	| MotionOne
	| { in?: MotionOne; out?: MotionOne }
	| Pair;

type Pair = readonly [send: TransitionFunction, receive: TransitionFunction];
const isPair = (spec: Motion): spec is Pair => Array.isArray(spec);
const isSplit = (spec: Motion): spec is { in?: MotionOne; out?: MotionOne } =>
	typeof spec === 'object' && !Array.isArray(spec) && !('fn' in spec);

/** One direction of a `Motion`, as `motion` resolves it. */
function direction(spec: Motion, way: 'in' | 'out' | 'both'): MotionOne {
	if (isPair(spec)) return way === 'out' ? spec[0] : spec[1];
	if (isSplit(spec)) return (way === 'out' ? spec.out : spec.in) ?? true;
	return spec;
}

/**
 * The same `Motion`, with the element's key added to the params of any Svelte
 * transition in it — so a keyed list's items each call it with their own key,
 * which is what `crossfade` pairs a leaving element with an entering one by.
 * A key the app set in its params wins. The family's motion and `false` are
 * left as they are.
 */
export function withKey(spec: Motion | undefined, key: unknown): Motion | undefined {
	const one = (s: MotionOne | undefined): MotionOne | undefined =>
		typeof s === 'function' ? { fn: s, params: { key } } : s && typeof s === 'object' ? { fn: s.fn, params: { key, ...s.params } } : s;
	if (spec === undefined || typeof spec === 'boolean') return spec;
	if (isPair(spec) || isSplit(spec)) return { in: one(direction(spec, 'in')), out: one(direction(spec, 'out')) };
	return one(spec);
}

/** Who plays a keyed element's move: as `Motion`, with a Svelte animation (`flip`). */
export type Move = boolean | AnimationFunction | { fn: AnimationFunction; params?: any };

/**
 * A Svelte transition (`in:motion={…}`, `out:motion={…}`) that plays the
 * family's `enter` or `leave` — or, given one (`Motion`), a Svelte transition
 * instead.
 */
export function motion(node: HTMLElement, spec: Motion | undefined = true, options?: { direction?: 'in' | 'out' | 'both' }) {
	const way = options?.direction ?? 'both';
	const s = direction(spec ?? true, way);
	if (s === false) return { duration: 0 };
	if (typeof s === 'function') return s(node, {}, { direction: way });
	if (typeof s === 'object') return s.fn(node, s.params ?? {}, { direction: way });

	const phase: Phase = way === 'out' ? 'leave' : 'enter';
	size(node);
	const duration = mark(node, phase);
	if (phase === 'enter') unmark(node, phase, duration);
	return { duration };
}

/**
 * A Svelte animation (`animate:moved={…}`) for keyed lists: plays the
 * family's `move` from where the element stood — or, given one (`Move`), a
 * Svelte animation instead (`flip`).
 */
export function moved(node: HTMLElement, rects: { from: DOMRect; to: DOMRect }, spec: Move | undefined = true) {
	const s = spec ?? true;
	if (s === false) return { duration: 0 };
	if (typeof s === 'function') return s(node, rects, {});
	if (typeof s === 'object') return s.fn(node, rects, s.params ?? {});

	const { from, to } = rects;
	node.style.setProperty('--motion-dx', `${from.left - to.left}px`);
	node.style.setProperty('--motion-dy', `${from.top - to.top}px`);
	const duration = mark(node, 'move');
	unmark(node, 'move', duration);
	return { duration };
}

/**
 * Moves measured by the component itself (FLIP: first, last, invert, play),
 * for the lists Svelte's `animate:` cannot reach: an item that changes list —
 * Svelte destroys it in one and creates it in the other — or a keyed block
 * whose item is not its only child (a drop marker beside it).
 *
 * The component measures its keyed elements before the DOM changes
 * (`measure`, in `$effect.pre`) and after (`play`, in `$effect`); an element
 * whose key stood elsewhere is marked `data-motion="move"`, `--motion-dx/dy`
 * holding where it stood, relative to where it stands now — the same phase
 * `animate:moved` marks, drawn by the same CSS. An item that changed list is
 * no coming and going: `motion(key, transition)` hands its `in:` / `out:`
 * nothing to play in the family's case, so the old element goes at once and
 * the new one arrives as a move. Given a Svelte transition (a `crossfade()`
 * pair), the app's transition plays the change of list, and only the moves
 * within a list are marked.
 *
 * Elements carry their key in a data attribute (`data-<name>`).
 */
export class Reflow {
	#before = new Map<string, { rect: DOMRect; node: Element }>();
	#root: () => Element | undefined | null;
	#attr: string;

	/** `root` holds the elements; `attr` is their key's data attribute, in camelCase (`kanbanKey`). */
	constructor(root: () => Element | undefined | null, attr: string) {
		this.#root = root;
		this.#attr = attr;
	}

	#elements() {
		const name = this.#attr.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
		return [...(this.#root()?.querySelectorAll<HTMLElement>(`[data-${name}]`) ?? [])];
	}

	/** Before the DOM changes: where every keyed element stands. */
	measure() {
		this.#before.clear();
		for (const node of this.#elements()) {
			const key = node.dataset[this.#attr];
			if (key !== undefined) this.#before.set(key, { rect: node.getBoundingClientRect(), node });
		}
	}

	/** Whether the key stood somewhere before this change: then it moves, it does not come. */
	stood(key: unknown) {
		return this.#before.has(String(key));
	}

	/**
	 * What an element's `in:motion` / `out:motion` gets: the app's transition
	 * with the element's key (`withKey`); but, the family's playing, nothing
	 * for an item that stood before and stands still — it moves.
	 */
	motion(key: unknown, spec: Motion | undefined, stays: boolean): Motion | undefined {
		if ((spec === undefined || spec === true) && stays && this.stood(key)) return false;
		return withKey(spec, key);
	}

	/**
	 * After the DOM changed: marks `move` on every element that stands
	 * somewhere else. `crossing`: also the elements created in place of one
	 * of another list (false when the app's transition plays those).
	 */
	play(crossing = true) {
		for (const node of this.#elements()) {
			const key = node.dataset[this.#attr];
			const was = key === undefined ? undefined : this.#before.get(key);
			if (!was || (!crossing && was.node !== node)) continue;
			const now = node.getBoundingClientRect();
			const dx = was.rect.left - now.left;
			const dy = was.rect.top - now.top;
			if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;
			node.style.setProperty('--motion-dx', `${dx}px`);
			node.style.setProperty('--motion-dy', `${dy}px`);
			unmark(node, 'move', mark(node, 'move'));
		}
		this.#before.clear();
	}
}

/**
 * Calls `done` once the family's current motion on the element has run (at
 * once if it has none). Call it after the change of state is in the DOM.
 * Returns a function that cancels the wait.
 */
export function settle(node: Element, done: () => void): () => void {
	const time = motionTime(node);
	if (!time) {
		done();
		return () => {};
	}
	const timer = setTimeout(done, time);
	return () => clearTimeout(timer);
}

/** `settle` as an action: `use:settled={done}` on an element that only lives
 *  for its motion (a ripple wave) — `done` removes it. */
export function settled(node: Element, done: () => void) {
	const cancel = settle(node, done);
	return { destroy: cancel };
}
