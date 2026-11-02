/**
 * The data handler: the live state of one remote resource — the rows of the
 * current page, the total, the search, the sort, the filter values, the
 * selection, the pending edits and their history — and the requests that read
 * and change it.
 *
 * It draws nothing. `DataHandler.svelte` hands an instance to its children;
 * the same class can be used directly, `new DataHandlerState(…)`. Tables,
 * grids and lists know nothing of it: they are given its rows as if they
 * were static.
 *
 * Where the data comes from, in order:
 *   1. the functions passed as `get` / `update` / `delete` — plain async
 *      functions, or SvelteKit remote functions, which are callable the same
 *      way;
 *   2. otherwise `path`, a REST resource:
 *        GET    path?filters…&search=&sort=id-asc&page=&limit=  → { data, total }
 *        PATCH  path/:id      body: the changed fields
 *        DELETE path          body: [ids]
 *   3. otherwise the action is not available (`canUpdate`, `canDelete`).
 */

/* ── Filters ─────────────────────────────────────────────────────────── */

export type EntityFilter<ID extends string = string> = {
	id: ID;
	title: string;
	type: 'entity';
	/** The suggestions for what is being typed. */
	items: (query: string) => PromiseLike<EntitySuggestion[]> | EntitySuggestion[];
	/** The text of one suggestion, and of the value. Default: its `name`, else its `id`. */
	show?: (suggestion: EntitySuggestion) => string;
	/** Milliseconds without typing before `items` is asked. */
	wait?: number;
	/** What it picks, for whoever draws the entity (DataControl's `entity`). */
	kind?: string;
};

export type NumberFilter<ID extends string = string> = {
	id: ID;
	title: string;
	type: 'number';
	min?: number;
	max?: number;
	step?: number;
};

export type DateFilter<ID extends string = string> = {
	id: ID;
	title: string;
	type: 'date';
};

export type SelectFilter<ID extends string = string, V extends string = string> = {
	id: ID;
	title: string;
	type: 'select';
	options: { name: string; value: V }[];
	multiple?: boolean;
	nullable?: boolean;
	/** In a `fields` control, show a choice among few options as a switch rather than a select. */
	switch?: boolean;
};

export type BooleanFilter<ID extends string = string> = {
	id: ID;
	title: string;
	type: 'boolean';
};

export type TextFilter<ID extends string = string> = {
	id: ID;
	title: string;
	type: 'text';
};

export type Filter<ID extends string = string> = Readonly<
	| EntityFilter<ID>
	| NumberFilter<ID>
	| DateFilter<ID>
	| SelectFilter<ID, string>
	| BooleanFilter<ID>
	| TextFilter<ID>
>;

/** A picked entity: what the filter holds, and what the address bar writes. */
export type EntityValue = { id: string; name?: string };
/** A suggestion for an entity filter. A numeric id is written as text once picked. */
export type EntitySuggestion = { id: string | number; name?: string };

type FilterValueMap<V extends string = string> = {
	text: string;
	entity: EntityValue;
	number: number;
	date: Date;
	select: V[];
	boolean: boolean;
};

type ValueOf<F extends Filter> =
	F extends SelectFilter<string, infer V> ? FilterValueMap<V>[F['type']] : FilterValueMap[F['type']];

/** The value of every filter, by id. A filter without a value is absent. */
export type FilterValues<F extends readonly Filter[]> = {
	[K in F[number]['id']]?: ValueOf<Extract<F[number], { id: K }>>;
};

/** A filter as the handler holds it: shown or not, and maybe immutable. */
export type HandledFilter<F extends Filter = Filter> = F & {
	/** On the page, with or without a value. */
	shown: boolean;
	/** Set by the page and never offered to the visitor. */
	immutable: boolean;
};

/** One way to order the rows. `id` is what the server is sent. */
export type Sort = { id: string; name: string; value: 'asc' | 'desc' };

/* ── Requests ────────────────────────────────────────────────────────── */

export type GetParams<FV> = {
	filters: FV;
	search?: string;
	sort?: { id: string; value: 'asc' | 'desc' };
	/** The handler always sends it; a direct call may leave it out. */
	limit?: number;
	/** From 1. The handler always sends it; a direct call may leave it out. */
	page?: number;
};

export type GetResult<Model> = { data?: Model[]; total?: number };

export type GetQuery<FV, Model> = (params: GetParams<FV>) => PromiseLike<GetResult<Model>>;
export type UpdateQuery<Model, Id> = (params: { id: Id; data: Partial<Model> }) => PromiseLike<unknown>;
export type DeleteQuery<Id> = (ids: Id[]) => PromiseLike<unknown>;

/** How a row is told apart: one of its keys, or a pair of functions. */
export type Identifier<Model, Id> =
	| keyof Model
	| { to: (row: Model, index: number) => string; from: (id: string) => Id };

/** How the query is written to the address bar. Default: the History API. */
export type Navigation = {
	push: (url: string, state: Record<string, unknown>) => void;
	replace: (url: string, state: Record<string, unknown>) => void;
};

/** What `confirmDiscard` may answer. */
export type DiscardChoice = 'save' | 'discard' | 'stay';

/** Every text the handler writes, for `onlog` and `onerror`. */
export type DataHandlerMessages = {
	loadFailed: string;
	saveFailed: string;
	deleteFailed: string;
	discarded: (count: number) => string;
	saved: (count: number) => string;
	deleted: (count: number) => string;
	exportEmpty: string;
};

const MESSAGES: DataHandlerMessages = {
	loadFailed: 'The data could not be loaded.',
	saveFailed: 'The changes could not be saved.',
	deleteFailed: 'The deletion failed.',
	discarded: (n) => `${n} unsaved change${n > 1 ? 's' : ''} discarded.`,
	saved: (n) => `${n} row${n > 1 ? 's' : ''} saved.`,
	deleted: (n) => `${n} row${n > 1 ? 's' : ''} deleted.`,
	exportEmpty: 'There is nothing to export.'
};

export type DataHandlerOptions<F extends readonly Filter[], Model, Id> = {
	/** How a row is told apart. A key of the model, or `{ to, from }`. */
	identifier: Identifier<Model, Id>;

	/** Fetch one page. A plain async function or a SvelteKit remote function. */
	get?: GetQuery<FilterValues<F>, Model>;
	/** Save the changed fields of one row. */
	update?: UpdateQuery<Model, Id>;
	/** Delete rows. */
	delete?: DeleteQuery<Id>;
	/** A REST resource standing in for whichever of the three is missing. */
	path?: string;
	/** The fetch `path` goes through. Default: the global one. */
	fetch?: typeof fetch;

	/** The filters the visitor may use. */
	filters?: F;
	/** The orders the visitor may pick. */
	sorts?: readonly Sort[];
	/** The starting order. Default: the first of `sorts`. */
	sort?: Sort;
	/** Filters set by the page and never shown. */
	immutableFilters?: F[number]['id'][];

	/** The starting search. */
	search?: string;
	/** The starting filter values. */
	filterValues?: FilterValues<F>;
	/** Rows already loaded (by a server load), so the first fetch is skipped. */
	init?: GetResult<Model>;
	/** Rows per page. Default 10. */
	limit?: number;
	/** The starting page, from 1. */
	page?: number;

	/** Write the query to the address bar after every fetch. Default false. */
	history?: boolean;
	/** How to write it. In SvelteKit, pass `{ push: pushState, replace: replaceState }`. */
	navigation?: Navigation;

	/** Asked before deleting. `false` cancels. Without it, the rows go at once. */
	confirmDelete?: (ids: string[]) => Promise<boolean>;
	/** Asked before a fetch would drop unsaved changes. Without it, they are dropped and logged. */
	confirmDiscard?: (count: number) => Promise<DiscardChoice>;

	/** Something happened worth telling the visitor. */
	onlog?: (message: string) => void;
	/** Something failed. Without it, the error goes to the console. */
	onerror?: (message: string, error?: unknown) => void;
	/** The texts written to `onlog` and `onerror`. */
	messages?: Partial<DataHandlerMessages>;
};

/* ── Rows ────────────────────────────────────────────────────────────── */

/**
 * One row as the handler hands it out: the data, and what can be done to it.
 * `value` is what to draw; `init` is what the server last said; `updated`
 * holds the fields that differ.
 */
export type DataRow<Model> = {
	id: string;
	init: Model;
	value: Model;
	updated: Partial<Model>;
	selected: boolean;
	/** Changed and not yet saved. */
	readonly dirty: boolean;
	select: () => void;
	unselect: () => void;
	toggle: () => void;
	/** Change fields: an object of new values, or a function of the current value. */
	update: (patch: Partial<Model> | ((value: Model) => Partial<Model>)) => void;
	/** Take back this row's last change. */
	undo: () => void;
	/** Drop every change to this row. Undoable. */
	reset: () => void;
	save: () => Promise<void>;
	delete: () => Promise<void>;
};

/** One step of the edit history: the state of each row it touched, before and after. */
type Step<Model> = { id: string; before: Partial<Model>; after: Partial<Model> }[];

/** The fields of `value` that differ from `init`, compared one by one. */
function diff<Model>(value: Model, init: Model): Partial<Model> {
	const out: Partial<Model> = {};
	for (const k of Object.keys(value as object) as (keyof Model)[]) {
		if (!Object.is(value[k], init[k])) out[k] = value[k];
	}
	return out;
}

/* ── The address bar ─────────────────────────────────────────────────── */

/** Filter values out of a query string — to start a handler where the URL left it. */
export function parseFilterValues<const F extends readonly Filter[]>(
	params: URLSearchParams,
	filters: F
): FilterValues<F> {
	const out: Record<string, unknown> = {};
	for (const f of filters) {
		const raw = params.get(f.id);
		if (!raw) continue;
		switch (f.type) {
			case 'entity': {
				const [id, ...name] = raw.split(',');
				out[f.id] = { id, name: name.join(',') || undefined };
				break;
			}
			case 'number':
				if (!Number.isNaN(Number(raw))) out[f.id] = Number(raw);
				break;
			case 'boolean':
				out[f.id] = raw === 'true';
				break;
			case 'date':
				if (!Number.isNaN(Date.parse(raw))) out[f.id] = new Date(raw);
				break;
			case 'select':
				out[f.id] = raw.split(',');
				break;
			case 'text':
				out[f.id] = raw;
				break;
		}
	}
	return out as FilterValues<F>;
}

/** Filter values into a query string. */
export function filterValuesToParams<const F extends readonly Filter[]>(
	values: FilterValues<F>,
	filters: F
): URLSearchParams {
	const params = new URLSearchParams();
	for (const f of filters) {
		const v = (values as Record<string, unknown>)[f.id];
		if (v === undefined || v === null || v === '') continue;
		switch (f.type) {
			case 'entity': {
				const e = v as EntityValue;
				params.set(f.id, [e.id, e.name].filter(Boolean).join(','));
				break;
			}
			case 'date':
				params.set(f.id, (v as Date).toISOString());
				break;
			case 'select':
				if ((v as string[]).length) params.set(f.id, (v as string[]).join(','));
				break;
			default:
				params.set(f.id, String(v));
		}
	}
	return params;
}

/** Everything a handler can start from that a URL can carry. */
export function parseQuery<const F extends readonly Filter[]>(
	params: URLSearchParams,
	filters: F,
	sorts: readonly Sort[] = []
): { filterValues: FilterValues<F>; search?: string; sort?: Sort; page?: number; limit?: number } {
	const sort = params.get('sort');
	const page = Number(params.get('page'));
	const limit = Number(params.get('limit'));
	return {
		filterValues: parseFilterValues(params, filters),
		search: params.get('search') ?? undefined,
		sort: sort ? sorts.find((s) => `${s.id}-${s.value}` === sort) : undefined,
		page: Number.isInteger(page) && page > 0 ? page : undefined,
		limit: Number.isInteger(limit) && limit > 0 ? limit : undefined
	};
}

/** A pause longer than this in a field being typed in starts a new entry of the browser history. */
const TYPING_PAUSE = 2000;

const historyNavigation: Navigation = {
	push: (url, state) => history.pushState(state, '', url),
	replace: (url, state) => history.replaceState(state, '', url)
};

/* ── The handler ─────────────────────────────────────────────────────── */

export class DataHandlerState<const F extends readonly Filter[] = Filter[], Model extends Record<string, any> = Record<string, any>, Id = string> {
	/** A fetch is running. */
	loading = $state(false);

	/** The rows of the current page. */
	rows: DataRow<Model>[] = $state([]);
	/** How many rows match, over every page. `undefined` until known. */
	total: number | undefined = $state();

	/** Every filter the handler knows, shown or not. */
	filters: HandledFilter<F[number]>[] = $state([]);
	/** The value of each filter. */
	filterValues: FilterValues<F> = $state({} as FilterValues<F>);
	search = $state('');
	sort: Sort | undefined = $state();
	/** From 1. */
	page = $state(1);
	limit = $state(10);

	readonly sorts: readonly Sort[];

	/** The keys of the selected rows. */
	selection = $derived(this.rows.filter((r) => r.selected).map((r) => r.id));
	/** The rows changed and not yet saved. */
	changed = $derived(this.rows.filter((r) => r.dirty).map((r) => r.id));
	/** Something is changed and not yet saved. */
	dirty = $derived(this.changed.length > 0);

	/** The filters on the page. */
	shownFilters = $derived(this.filters.filter((f) => f.shown && !f.immutable));
	/** The filters that could be added to the page. */
	availableFilters = $derived(this.filters.filter((f) => !f.shown && !f.immutable));

	/** How many pages there are, once the total is known. */
	pages = $derived(this.total === undefined ? undefined : Math.max(1, Math.ceil(this.total / this.limit)));

	/** The edit history. */
	#undo: Step<Model>[] = $state([]);
	#redo: Step<Model>[] = $state([]);
	canUndo = $derived(this.#undo.length > 0);
	canRedo = $derived(this.#redo.length > 0);

	readonly identifier: { to: (row: Model, index: number) => string; from: (id: string) => Id };
	readonly options: DataHandlerOptions<F, Model, Id>;
	readonly messages: DataHandlerMessages;

	#ticket = 0;
	#timer: ReturnType<typeof setTimeout> | undefined;
	/** The query of the last fetch that went through, to go back to on "stay". */
	#committed: { filterValues: FilterValues<F>; search: string; sort?: Sort; page: number; limit: number };
	/** The rows per page the handler started with: what an address without a limit means. */
	#startLimit: number;
	/** The field whose typing wrote the address bar last, and when. */
	#typed: { field: string; at: number } | undefined;

	constructor(options: DataHandlerOptions<F, Model, Id>) {
		this.options = options;
		this.messages = { ...MESSAGES, ...options.messages };

		const id = options.identifier;
		this.identifier =
			typeof id === 'object'
				? id
				: { to: (row) => String(row[id]), from: (s) => s as unknown as Id };

		this.sorts = options.sorts ?? [];
		this.filters = (options.filters ?? []).map((f) => ({
			...f,
			immutable: !!options.immutableFilters?.includes(f.id),
			shown: (options.filterValues as Record<string, unknown> | undefined)?.[f.id] !== undefined
		})) as HandledFilter<F[number]>[];
		this.filterValues = { ...(options.filterValues ?? {}) } as FilterValues<F>;
		this.search = options.search ?? '';
		this.sort = options.sort ?? this.sorts[0];

		const limit = options.limit ?? options.init?.data?.length;
		this.limit = Number.isInteger(limit) && (limit as number) > 0 ? (limit as number) : 10;
		this.#startLimit = this.limit;
		this.page = Math.max(1, options.page ?? 1);

		if (options.init) {
			this.rows = (options.init.data ?? []).map((d, i) => this.#row(d, i));
			this.total = options.init.total;
		}
		this.#committed = this.#query();
	}

	/* ── Capabilities ── */

	get canUpdate() {
		return !!this.options.update || !!this.options.path;
	}
	get canDelete() {
		return !!this.options.delete || !!this.options.path;
	}

	/* ── Fetching ── */

	/**
	 * Fetch the current page. Unsaved changes are put to `confirmDiscard`
	 * first; "stay" puts the query back where the last fetch left it.
	 * `delay` debounces (a search being typed); `replace` rewrites the
	 * address bar entry instead of adding one; `typing` names the field being
	 * typed in, whose changes in a row make a single entry.
	 */
	load(options: { delay?: number; replace?: boolean; typing?: string } = {}): Promise<void> {
		clearTimeout(this.#timer);
		if (options.delay)
			return new Promise((resolve) => {
				this.#timer = setTimeout(() => resolve(this.#load(options.replace, options.typing)), options.delay);
			});
		return this.#load(options.replace, options.typing);
	}

	/** Fetch again, as is: after a change made elsewhere. */
	reload() {
		return this.load({ replace: true });
	}

	/**
	 * Go back to a query the address bar holds, when the visitor walks the
	 * browser history: fetches it without adding an entry. Filters holding a
	 * value are shown, the others are not; immutable ones keep their value. On
	 * "stay", the address is written back to the rows still on screen.
	 */
	async restore(params: URLSearchParams) {
		clearTimeout(this.#timer);
		if (!(await this.#guard())) {
			this.#write(false);
			return;
		}
		const query = parseQuery(params, this.filters as unknown as F, this.sorts);
		const values = query.filterValues as Record<string, unknown>;
		for (const f of this.filters) {
			if (f.immutable) values[f.id] = (this.filterValues as Record<string, unknown>)[f.id];
			else f.shown = values[f.id] !== undefined;
		}
		this.filterValues = query.filterValues;
		this.search = query.search ?? '';
		this.sort = query.sort ?? this.sorts[0];
		this.page = query.page ?? 1;
		this.limit = query.limit ?? this.#startLimit;
		this.#typed = undefined;
		await this.#fetchPage();
	}

	async #load(replace = false, typing?: string) {
		if (!(await this.#guard())) {
			Object.assign(this, { ...this.#committed, filterValues: { ...this.#committed.filterValues } });
			return;
		}
		await this.#fetchPage(() => {
			const now = Date.now();
			const sameTyping = !!typing && this.#typed?.field === typing && now - this.#typed.at < TYPING_PAUSE;
			this.#typed = typing ? { field: typing, at: now } : undefined;
			if (this.options.history) this.#write(replace || sameTyping);
		});
	}

	/** Fetch the query as it stands; `fetched` runs once its rows are in. */
	async #fetchPage(fetched?: () => void) {
		const ticket = ++this.#ticket;
		this.loading = true;
		try {
			const result = await this.#get(this.#params());
			if (ticket !== this.#ticket) return;

			/* Past the last page (rows deleted elsewhere, a narrower filter):
			   go to the last one that exists, once. */
			const total = result.total ?? 0;
			const last = Math.max(1, Math.ceil(total / this.limit));
			if (!result.data?.length && total > 0 && this.page > last) {
				this.page = last;
				const again = await this.#get(this.#params());
				if (ticket !== this.#ticket) return;
				Object.assign(result, again);
			}

			this.rows = (result.data ?? []).map((d, i) => this.#row(d, i));
			this.total = result.total ?? this.rows.length;
			this.#undo = [];
			this.#redo = [];
			this.#committed = this.#query();
			fetched?.();
		} catch (error) {
			if (ticket === this.#ticket) this.#error(this.messages.loadFailed, error);
		} finally {
			if (ticket === this.#ticket) this.loading = false;
		}
	}

	/** May the rows be replaced? Asks when there are unsaved changes. */
	async #guard(): Promise<boolean> {
		const count = this.changed.length;
		if (!count) return true;
		if (!this.options.confirmDiscard) {
			this.options.onlog?.(this.messages.discarded(count));
			return true;
		}
		const choice = await this.options.confirmDiscard(count);
		if (choice === 'stay') return false;
		if (choice === 'save') await this.save();
		return true;
	}

	#query() {
		return {
			filterValues: { ...this.filterValues },
			search: this.search,
			sort: this.sort,
			page: this.page,
			limit: this.limit
		};
	}

	#params(page = this.page, limit = this.limit): GetParams<FilterValues<F>> {
		return {
			filters: $state.snapshot(this.filterValues) as FilterValues<F>,
			search: this.search.trim() || undefined,
			sort: this.sort ? { id: this.sort.id, value: this.sort.value } : undefined,
			limit,
			page
		};
	}

	/** The query, as the address bar and the REST path write it. */
	toSearchParams(): URLSearchParams {
		const params = filterValuesToParams(this.filterValues, this.filters as unknown as F);
		if (this.search) params.set('search', this.search);
		if (this.sort) params.set('sort', `${this.sort.id}-${this.sort.value}`);
		params.set('page', String(this.page));
		params.set('limit', String(this.limit));
		return params;
	}

	#write(replace: boolean) {
		const ours = this.toSearchParams();
		/* Keep whatever else the address says: it is not ours. */
		const keys = new Set([...this.filters.map((f) => f.id), 'search', 'sort', 'page', 'limit']);
		for (const [k, v] of new URLSearchParams(location.search)) if (!keys.has(k)) ours.set(k, v);
		const url = `${location.pathname}?${ours}${location.hash}`;
		const nav = this.options.navigation ?? historyNavigation;
		const state = { datahandler: ours.toString() };
		/* The same query again is not a step back to walk through. */
		if (replace || url === `${location.pathname}${location.search}${location.hash}`) nav.replace(url, state);
		else nav.push(url, state);
	}

	async #get(params: GetParams<FilterValues<F>>): Promise<GetResult<Model>> {
		if (this.options.get) return await this.options.get(params);
		if (!this.options.path) return { data: [], total: 0 };

		const query = filterValuesToParams(params.filters, this.filters as unknown as F);
		if (params.search) query.set('search', params.search);
		if (params.sort) query.set('sort', `${params.sort.id}-${params.sort.value}`);
		query.set('page', String(params.page));
		query.set('limit', String(params.limit));
		const res = await this.#fetch(`${this.options.path}?${query}`);
		return (await res.json()) as GetResult<Model>;
	}

	async #fetch(url: string, init?: RequestInit) {
		const res = await (this.options.fetch ?? fetch)(url, init);
		if (!res.ok) throw new Error(`${init?.method ?? 'GET'} ${url}: ${res.status}`);
		return res;
	}

	/* ── Changing the query ── each one fetches. */

	changePage(page: number) {
		this.page = Math.max(1, page);
		return this.load();
	}

	changeLimit(limit: number) {
		this.limit = limit > 0 ? limit : 10;
		/* The first row on screen stays on screen. */
		this.page = Math.max(1, Math.floor(((this.#committed.page - 1) * this.#committed.limit) / this.limit) + 1);
		return this.load({ replace: true });
	}

	changeSort(sort: Sort | undefined) {
		this.sort = sort;
		this.page = 1;
		return this.load();
	}

	/** A new search, fetched once the typing pauses (`delay`, default 300 ms). */
	changeSearch(search: string, delay = 300) {
		this.search = search;
		this.page = 1;
		return this.load({ delay, typing: 'search' });
	}

	changeFilter<K extends F[number]['id']>(id: K, value: FilterValues<F>[K] | undefined, delay = 0) {
		(this.filterValues as Record<string, unknown>)[id] = value;
		this.total = undefined;
		this.page = 1;
		return this.load({ delay, typing: delay ? id : undefined });
	}

	/** Put a filter on the page, without a value yet. */
	showFilter(id: F[number]['id']) {
		const f = this.filters.find((f) => f.id === id);
		if (f) f.shown = true;
	}

	/** Take a filter off the page, and its value with it. */
	removeFilter(id: F[number]['id']) {
		const f = this.filters.find((f) => f.id === id);
		if (!f) return;
		f.shown = false;
		if ((this.filterValues as Record<string, unknown>)[id] === undefined) return;
		return this.changeFilter(id, undefined);
	}

	/* ── Selection ── */

	/** Select one row, or every row of the page. */
	select(id?: string) {
		for (const r of this.rows) if (id === undefined || r.id === id) r.selected = true;
	}

	/** Unselect one row, or every row. */
	unselect(id?: string) {
		for (const r of this.rows) if (id === undefined || r.id === id) r.selected = false;
	}

	/** Every row of the page is selected. */
	get allSelected() {
		return this.rows.length > 0 && this.selection.length === this.rows.length;
	}

	/* ── Editing ── */

	#find(id: string) {
		return this.rows.find((r) => r.id === id);
	}

	/** The part of a row the history records: what it shows and what differs. */
	#state(r: DataRow<Model>): Partial<Model> {
		return $state.snapshot(r.value) as Partial<Model>;
	}

	#apply(id: string, value: Partial<Model>) {
		const r = this.#find(id);
		if (!r) return;
		r.value = { ...r.value, ...value } as Model;
		r.updated = diff(r.value, r.init);
	}

	/** Record a step and clear what could be redone: a new change forks the history. */
	#record(step: Step<Model>) {
		if (!step.length) return;
		this.#undo.push(step);
		this.#redo = [];
	}

	/** Change fields of one row. */
	update(id: string, patch: Partial<Model> | ((value: Model) => Partial<Model>)) {
		const r = this.#find(id);
		if (!r) return;
		const before = this.#state(r);
		const fields = typeof patch === 'function' ? patch(r.value) : patch;
		this.#apply(id, fields);
		this.#record([{ id, before, after: this.#state(r) }]);
	}

	/** Take back the last change, of the whole page or of one row. */
	undo(id?: string) {
		if (id === undefined) {
			const step = this.#undo.pop();
			if (!step) return;
			for (const s of step) this.#apply(s.id, s.before);
			this.#redo.push(step);
			return;
		}
		/* One row: its last change, wherever it sits in the history. A step
		   that touched other rows too (a reset of everything) loses only this
		   row. Done out of order, it cannot be redone. */
		for (let i = this.#undo.length - 1; i >= 0; i--) {
			const at = this.#undo[i]!.findIndex((s) => s.id === id);
			if (at < 0) continue;
			const s = this.#undo[i]!.splice(at, 1)[0]!;
			if (!this.#undo[i]!.length) this.#undo.splice(i, 1);
			this.#apply(id, s.before);
			this.#redo = [];
			return;
		}
	}

	/** Put back the last change undone. */
	redo() {
		const step = this.#redo.pop();
		if (!step) return;
		for (const s of step) this.#apply(s.id, s.after);
		this.#undo.push(step);
	}

	/** Drop every unsaved change — of one row, or of the page. One undoable step. */
	reset(id?: string) {
		const rows = this.rows.filter((r) => r.dirty && (id === undefined || r.id === id));
		const step: Step<Model> = rows.map((r) => {
			const before = this.#state(r);
			r.value = r.init;
			r.updated = {};
			return { id: r.id, before, after: this.#state(r) };
		});
		this.#record(step);
	}

	/** Forget a row's history: it was saved, or deleted. */
	#forget(ids: string[]) {
		const out = (steps: Step<Model>[]) =>
			steps.map((st) => st.filter((s) => !ids.includes(s.id))).filter((st) => st.length);
		this.#undo = out(this.#undo);
		this.#redo = out(this.#redo);
	}

	/** Send the changes — of one row, or of every changed row. */
	async save(id?: string) {
		if (!this.canUpdate) return;
		const rows = this.rows.filter((r) => r.dirty && (id === undefined || r.id === id));
		const done: string[] = [];
		for (const r of rows) {
			try {
				const data = $state.snapshot(r.updated) as Partial<Model>;
				const key = this.identifier.from(r.id);
				if (this.options.update) await this.options.update({ id: key, data });
				else
					await this.#fetch(`${this.options.path}/${encodeURIComponent(r.id)}`, {
						method: 'PATCH',
						headers: { 'content-type': 'application/json' },
						body: JSON.stringify(data)
					});
				r.init = r.value;
				r.updated = {};
				done.push(r.id);
			} catch (error) {
				this.#error(this.messages.saveFailed, error);
			}
		}
		this.#forget(done);
		if (done.length) this.options.onlog?.(this.messages.saved(done.length));
	}

	/** Delete one row, or the selection. Asks `confirmDelete` first. */
	async delete(id?: string) {
		if (!this.canDelete) return;
		const ids = id !== undefined ? [id] : [...this.selection];
		if (!ids.length) return;
		if (this.options.confirmDelete && !(await this.options.confirmDelete(ids))) return;
		try {
			const keys = ids.map((i) => this.identifier.from(i));
			if (this.options.delete) await this.options.delete(keys);
			else
				await this.#fetch(this.options.path!, {
					method: 'DELETE',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify(keys)
				});
		} catch (error) {
			this.#error(this.messages.deleteFailed, error);
			return;
		}
		this.rows = this.rows.filter((r) => !ids.includes(r.id));
		if (this.total !== undefined) this.total = Math.max(0, this.total - ids.length);
		this.#forget(ids);
		this.options.onlog?.(this.messages.deleted(ids.length));
	}

	/* ── Export ── */

	/**
	 * Every row matching the current query, fetched by batches, as a CSV file
	 * the browser downloads. Returns the file's content, or `undefined` when
	 * there was nothing to export.
	 *
	 * The file is written for a spreadsheet: a UTF-8 BOM (without it Excel
	 * reads ANSI and mangles accents), CRLF line ends (RFC 4180), and text
	 * starting with `= + - @` prefixed with `'`, so that a cell coming from a
	 * user is never run as a formula.
	 */
	async export(
		options: {
			/** The file name. Default `export.csv`. */
			name?: string;
			/** At most this many rows. */
			max?: number;
			/** Rows per request. Default 100. */
			batch?: number;
			/** The columns, in order. Default: every key of the widest row. */
			columns?: { key: string; label?: string }[];
			/** A row as the CSV writes it. Default: the row itself. */
			format?: (row: Model) => Record<string, unknown>;
			/** The cell separator. Default `;`. */
			separator?: string;
			/** The decimal mark of numbers. Default `,` with a `;` separator (how
			 *  a spreadsheet in a comma-decimal locale reads it), `.` otherwise. */
			decimal?: string;
			/** Build the CSV without downloading it. */
			download?: boolean;
		} = {}
	): Promise<string | undefined> {
		const { name = 'export.csv', max, batch = 100, format, separator = ';', download = true } = options;
		const decimal = options.decimal ?? (separator === ';' ? ',' : '.');
		const rows: Model[] = [];
		try {
			for (let page = 1; ; page++) {
				const want = max === undefined ? batch : Math.min(batch, max - rows.length);
				if (want <= 0) break;
				const res = await this.#get(this.#params(page, batch));
				const data = res.data ?? [];
				rows.push(...data.slice(0, want));
				/* Done when a page comes back short, or when the total is reached:
				   no batch is ever skipped, the last one included. */
				if (data.length < batch) break;
				if (res.total !== undefined && rows.length >= res.total) break;
			}
		} catch (error) {
			this.#error(this.messages.loadFailed, error);
			return;
		}
		if (!rows.length) {
			this.options.onlog?.(this.messages.exportEmpty);
			return;
		}

		const records = rows.map((r) => (format ? format(r) : (r as Record<string, unknown>)));
		const columns =
			options.columns ??
			Object.keys(records.reduce((a, b) => (Object.keys(b).length > Object.keys(a).length ? b : a))).map(
				(key) => ({ key, label: key })
			);
		const cell = (v: unknown) => {
			if (v === undefined || v === null) return '';
			let s =
				v instanceof Date ? v.toISOString()
				: typeof v === 'number' ? String(v).replace('.', decimal)
				: typeof v === 'object' ? JSON.stringify(v)
				: String(v);
			// A number is never a formula, a negative one included
			if (typeof v !== 'number' && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
			return /["\n\r]/.test(s) || s.includes(separator) ? `"${s.replace(/"/g, '""')}"` : s;
		};
		const csv =
			'﻿' +
			[
				columns.map((c) => cell(c.label ?? c.key)).join(separator),
				...records.map((r) => columns.map((c) => cell(r[c.key])).join(separator))
			].join('\r\n');

		if (download && typeof document !== 'undefined') {
			const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
			const a = document.createElement('a');
			a.href = url;
			a.download = name;
			a.style.display = 'none';
			document.body.append(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		}
		return csv;
	}

	/* ── Internals ── */

	#error(message: string, error?: unknown) {
		if (this.options.onerror) this.options.onerror(message, error);
		else console.error(message, error);
	}

	/** A row of data, with its own actions. */
	#row(data: Model, index: number): DataRow<Model> {
		const id = this.identifier.to(data, index);
		const handler = this;
		return {
			id,
			init: data,
			value: data,
			updated: {},
			selected: false,
			get dirty() {
				return Object.keys(this.updated).length > 0;
			},
			select: () => this.select(id),
			unselect: () => this.unselect(id),
			toggle() {
				if (this.selected) handler.unselect(id);
				else handler.select(id);
			},
			update: (patch) => this.update(id, patch),
			undo: () => this.undo(id),
			reset: () => this.reset(id),
			save: () => this.save(id),
			delete: () => this.delete(id)
		};
	}
}
