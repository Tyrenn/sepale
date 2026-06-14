/** Semantic color tokens shared by every component (match $color-list). */
export type Color =
	| 'primary'
	| 'secondary'
	| 'accent'
	| 'neutral'
	| 'info'
	| 'success'
	| 'warning'
	| 'error';

/** Field-scale sizes (input, select, textarea, range…). */
export type FieldSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Full intrinsic size scale (button, text…). */
export type Size = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';
