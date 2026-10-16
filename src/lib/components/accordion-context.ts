/**
 * How an Accordion and its Collapses talk: a Collapse that opens tells the
 * group, and an exclusive group closes every other member.
 */
import { getContext, setContext } from 'svelte';

const KEY = Symbol('accordion');

export interface AccordionGroup {
	/** Join the group; returns the function to leave it. */
	join(close: () => void): () => void;
	/** A member opened: an exclusive group closes the others. */
	opened(close: () => void): void;
}

export function setAccordion(exclusive: () => boolean): void {
	const members = new Set<() => void>();
	setContext<AccordionGroup>(KEY, {
		join(close) {
			members.add(close);
			return () => members.delete(close);
		},
		opened(close) {
			if (!exclusive()) return;
			for (const other of members) if (other !== close) other();
		}
	});
}

export function getAccordion(): AccordionGroup | undefined {
	return getContext<AccordionGroup | undefined>(KEY);
}
