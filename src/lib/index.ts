// u.u — the Svelte layer.
//
// Every component emits the class names of whatever family stylesheet is
// loaded; bring `families/<name>.css` and a theme alongside. A component
// declares its own vocabulary in AXES and FLAGS blocks, and the build writes a
// copy per family as plain code — props typed to exactly the classes the family
// ships, nothing generic, nothing to import — so an exported component cannot
// offer a variant its stylesheet has never heard of.
//
// `link` and `validator` have no component here on purpose: they are one
// class on one element, with no axis and no structure, and a wrapper would only
// add an import. Write `<a class="link">`. Text does have wrappers — `Text`,
// `Title`, `Subtitle` — because it has three axes (size, weight, colour) and
// a heading has a tag to choose.
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
export { default as Card } from './components/Card.svelte';
export { default as Text } from './components/Text.svelte';
export { default as Title } from './components/Title.svelte';
export { default as Subtitle } from './components/Subtitle.svelte';

// Navigation
export { default as Menu, type MenuNode } from './components/Menu.svelte';
export { default as Navbar } from './components/Navbar.svelte';
export { default as Breadcrumbs } from './components/Breadcrumbs.svelte';
export { default as Dock } from './components/Dock.svelte';
export { default as Tabs, type TabItem } from './components/Tabs.svelte';

// Other
export { default as Join } from './components/Join.svelte';

export { type Axis, type AxisProps, type Values } from './variants.js';

// Registry of style families + their themes, auto-generated from src/scss.
export { families, themesByFamily, type ThemeData } from './generated/registry.js';
export {
	defaultTheme,
	familyCategory,
	cloneTheme,
	serializeTheme,
	tokensToInlineStyle,
	tokensForFamily,
	parseTheme,
	type ThemeToken,
	type TokenType
} from './theme.js';
