/* The guide, in reading order: the sidebar lists it, each page links to the
   next. A page outside the guide's folder (the class prefix has a page of its
   own) is listed by its full path. */
export const GUIDE = [
	{ path: '/guide', title: 'Getting started' },
	{ path: '/guide/families', title: 'Families and themes' },
	{ path: '/guide/classes', title: 'Components and classes' },
	{ path: '/guide/svelte', title: 'Svelte components' },
	{ path: '/guide/motion', title: 'Motion' },
	{ path: '/guide/styling', title: 'Your own styles' },
	{ path: '/prefix', title: 'Class prefix' }
] as const;

export type GuidePath = (typeof GUIDE)[number]['path'];
