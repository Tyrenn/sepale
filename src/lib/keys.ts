/**
 * What identifies an item of a list: the name of one of its fields (`"id"`),
 * or a function of the item and its index. The identity keys the rendering
 * (an item that moves keeps its element), and what `selected`, `dirty` or a
 * crossfade refer to.
 */
export type KeyOf<T> = (keyof T & string) | ((item: T, index: number) => string | number);

/** A `KeyOf` as a function. Without one, the index: positions, not identities. */
export function keyer<T>(key: KeyOf<T> | undefined): (item: T, index: number) => string {
	if (typeof key === 'function') return (item, i) => String(key(item, i));
	if (key) return (item) => String((item as Record<string, unknown>)?.[key]);
	return (_item, i) => String(i);
}
