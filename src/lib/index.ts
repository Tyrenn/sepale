// u.u — the Svelte layer.
//
// Every component emits the class names of whatever family stylesheet is
// loaded; bring `families/<name>.css` and a theme alongside. A component
// declares its own vocabulary in an AXES block, and the build writes a copy
// per family with that block filtered down to the classes the family actually
// ships — so an exported component cannot offer a variant its stylesheet has
// never heard of.
//
// `text`, `link` and `validator` have no component here on purpose: they are
// one class on one element, with no axis and no structure, and a wrapper would
// only add an import. Write `<p class="text-s2-b1">` and `<a class="link">`.
//
// A component draws its own inner parts rather than exposing them as separate
// wrappers: `Menu` renders its rows from `items`, `Tabs` its tabs from `tabs`,
// `List` its rows from `rows`. One stylesheet, one namespace, one component
// (ADR 0009).

export { default as Button } from './components/Button.svelte';

// Form
export { default as Input } from './components/Input.svelte';
export { default as Textarea } from './components/Textarea.svelte';
export { default as Select } from './components/Select.svelte';
export { default as FileInput } from './components/FileInput.svelte';
export { default as Checkbox } from './components/Checkbox.svelte';
export { default as Radio } from './components/Radio.svelte';
export { default as Toggle } from './components/Toggle.svelte';
export { default as Range } from './components/Range.svelte';
export { default as Fieldset } from './components/Fieldset.svelte';
export { default as Label } from './components/Label.svelte';
export { default as FloatingLabel } from './components/FloatingLabel.svelte';

// Display
export { default as Chip } from './components/Chip.svelte';
export { default as Badge } from './components/Badge.svelte';
export { default as Swatch } from './components/Swatch.svelte';
export { default as Loading } from './components/Loading.svelte';
export { default as Progress } from './components/Progress.svelte';
export { default as RadialProgress } from './components/RadialProgress.svelte';
export { default as Skeleton } from './components/Skeleton.svelte';
export { default as List } from './components/List.svelte';

// Navigation
export { default as Menu, type MenuNode } from './components/Menu.svelte';
export { default as Navbar } from './components/Navbar.svelte';
export { default as Breadcrumbs } from './components/Breadcrumbs.svelte';
export { default as Dock } from './components/Dock.svelte';
export { default as Tabs, type TabItem } from './components/Tabs.svelte';

// Other
export { default as Join } from './components/Join.svelte';

export { type Axis, type AxisProps, type Values } from './internal/variants.js';

// Registry of style families + their themes, auto-generated from src/scss.
export { families, themesByFamily, type ThemeData } from './generated/registry.js';
export {
	defaultTheme,
	familyCategory,
	cloneTheme,
	serializeTheme,
	tokensToInlineStyle,
	tokensForFamily,
	type ThemeToken,
	type TokenType
} from './theme.js';
