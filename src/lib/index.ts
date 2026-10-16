// Sepale — the Svelte layer.
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
export { default as Combobox, type ComboboxSource } from './components/Combobox.svelte';
export { default as ChipsInput, type ChipsInputField } from './components/ChipsInput.svelte';
export { default as FileInput } from './components/FileInput.svelte';
export { default as Calendar } from './components/Calendar.svelte';
export { default as DatePicker } from './components/DatePicker.svelte';
export { default as Checkbox } from './components/Checkbox.svelte';
export { default as Radio } from './components/Radio.svelte';
export { default as Toggle } from './components/Toggle.svelte';
export { default as Range } from './components/Range.svelte';
export { default as Fieldset } from './components/Fieldset.svelte';
export { default as Label } from './components/Label.svelte';
export { default as FloatingLabel } from './components/FloatingLabel.svelte';
export { default as Segmented } from './components/Segmented.svelte';
export { default as NumberInput } from './components/NumberInput.svelte';

// Display
export { default as Avatar } from './components/Avatar.svelte';
export { default as Bubble } from './components/Bubble.svelte';
export { default as Chip } from './components/Chip.svelte';
export { default as Badge } from './components/Badge.svelte';
export { default as Swatch } from './components/Swatch.svelte';
export { default as Loading } from './components/Loading.svelte';
export { default as Progress } from './components/Progress.svelte';
export { default as RadialProgress } from './components/RadialProgress.svelte';
export { default as Skeleton } from './components/Skeleton.svelte';
export { default as List } from './components/List.svelte';
export { default as Card } from './components/Card.svelte';
export { default as Stat } from './components/Stat.svelte';
export { default as Stats } from './components/Stats.svelte';
export { default as Carousel } from './components/Carousel.svelte';
export { default as Text } from './components/Text.svelte';
export { default as Title } from './components/Title.svelte';
export { default as Subtitle } from './components/Subtitle.svelte';
export { default as Divider } from './components/Divider.svelte';
export { default as Alert } from './components/Alert.svelte';
export { default as Toaster } from './components/Toaster.svelte';
export { default as Tooltip } from './components/Tooltip.svelte';
export { default as Collapse } from './components/Collapse.svelte';
export { default as Accordion } from './components/Accordion.svelte';
export { default as Rating } from './components/Rating.svelte';
export { default as EmptyState } from './components/EmptyState.svelte';
export { default as Hero } from './components/Hero.svelte';
export { default as Footer, type FooterSection } from './components/Footer.svelte';
export { default as MobileFrame } from './components/MobileFrame.svelte';
export { default as WindowFrame } from './components/WindowFrame.svelte';
export { default as LaptopFrame } from './components/LaptopFrame.svelte';
export { default as Drawer, type DrawerState } from './components/Drawer.svelte';
export { toast, dismissToast, toasts, type ToastOptions } from './components/toast.svelte.js';

// Navigation
export { default as Menu, type MenuNode } from './components/Menu.svelte';
export { default as Navbar } from './components/Navbar.svelte';
export { default as Breadcrumbs } from './components/Breadcrumbs.svelte';
export { default as Pagination } from './components/Pagination.svelte';
export { default as Steps, type Step, type StepState } from './components/Steps.svelte';
export { default as Dock } from './components/Dock.svelte';
export { default as Tabs, type TabItem } from './components/Tabs.svelte';

// Data
export {
	default as DataHandler,
	DataHandlerState,
	parseQuery,
	parseFilterValues,
	filterValuesToParams,
	type DataHandlerOptions,
	type DataHandlerMessages,
	type DataRow,
	type DiscardChoice,
	type EntityValue,
	type Filter,
	type FilterValues,
	type GetParams,
	type GetResult,
	type HandledFilter,
	type Identifier,
	type Navigation,
	type Sort
} from './components/DataHandler.svelte';
export { default as DataControl, LABELS as DATA_CONTROL_LABELS, type DataControlLabels } from './components/DataControl.svelte';
export {
	default as Table,
	type TableColumn,
	type TableSort,
	type TableSortDirection
} from './components/Table.svelte';
export { default as Grid } from './components/Grid.svelte';
export { default as FileExplorer, type FileNode, type FileDrop } from './components/FileExplorer.svelte';

// Overlay
export { default as Dialog } from './components/Dialog.svelte';
export { default as Dropdown, type DropdownTrigger } from './components/Dropdown.svelte';

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
