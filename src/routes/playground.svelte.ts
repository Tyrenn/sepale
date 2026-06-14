import { cloneTheme, type ThemeToken } from '$lib/theme.js';

/** Style families available in the playground. */
export const families = ['daisy', 'poppy', 'iris', 'magnolia'] as const;
export type Family = (typeof families)[number];

/** Shared, reactive playground state. */
export const playground = $state<{ family: Family; tokens: ThemeToken[] }>({
	family: 'daisy',
	tokens: cloneTheme()
});

/** Reset the theme back to the family default. */
export function resetTheme() {
	playground.tokens = cloneTheme();
}
