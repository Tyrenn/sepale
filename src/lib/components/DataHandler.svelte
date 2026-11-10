<script module lang="ts">
	/* No PREFIX, no AXES: the data handler draws nothing, so it has no
	   namespace and nothing for a family to style. The class is exported for use without the
	   component: `new DataHandlerState({ … })`. */
	export {
		DataHandlerState,
		parseQuery,
		parseFilterValues,
		filterValuesToParams,
		type DataHandlerOptions,
		type DataHandlerMessages,
		type DataRow,
		type DiscardChoice,
		type EntityValue,
		type EntitySuggestion,
		type Filter,
		type FilterValues,
		type GetParams,
		type GetResult,
		type HandledFilter,
		type Identifier,
		type Navigation,
		type Sort
	} from './data-handler.svelte.js';
</script>

<script
	lang="ts"
	generics="const F extends readonly Filter[], Model extends Record<string, any>, Id = string"
>
	/**
	 * The live state of one remote resource, handed to its children. Renders
	 * nothing of its own: whatever the children draw — a DataControl, a Table,
	 * a Grid — reads and changes the resource through the handler they are
	 * given.
	 *
	 * The handler is built once, from the props as they are on mount: changing
	 * a prop afterwards does not rebuild it (that would drop the rows, the
	 * selection and the edits). Talk to the handler instead.
	 */
	import { onMount, untrack, type Snippet } from 'svelte';
	import {
		DataHandlerState,
		type DataHandlerOptions,
		type Filter
	} from './data-handler.svelte.js';

	interface Props extends DataHandlerOptions<F, Model, Id> {
		/** What to draw with the handler. */
		children?: Snippet<[DataHandlerState<F, Model, Id>]>;
		/** The handler itself, for the parent. Bindable, read only. */
		handler?: DataHandlerState<F, Model, Id>;
		/** Fetch on mount when no `init` was given. Default true. */
		autoload?: boolean;
	}

	let { children, handler = $bindable(), autoload = true, ...options }: Props = $props();

	const instance = untrack(() => new DataHandlerState<F, Model, Id>({ ...options } as DataHandlerOptions<F, Model, Id>));
	handler = instance;

	onMount(() => {
		if (autoload && !options.init) instance.load({ replace: true });
	});
</script>

{@render children?.(instance)}
