/**
 * Families loaded from disk, on the "Create a family" page.
 *
 * A family is one compiled stylesheet, and that stylesheet carries everything
 * the app needs to know about it (src/routes/README.md): its parameters in the
 * `uu-params` comment, its prose in its `STYLE FAMILY` header, its classes in
 * its selectors. So loading one is reading one file — `classify.ts` does what
 * the build scripts do for the families compiled here — and the app treats it
 * like the others: the sidebar lists it, the theme editor edits it, the
 * component pages document it.
 *
 * It stays in this browser (IndexedDB) and nowhere else: nothing is sent, and
 * another visitor never sees it. Loading a file under a name already loaded
 * replaces that family, which is how an author iterates.
 */

import { browser } from '$app/environment';
import { families as built, type FamilyDoc, type FamilyParam } from '$lib/generated/registry.js';
import { classifyStylesheet, docIn, paramsIn, type Classification } from './classify.js';

export interface LocalFamily {
	name: string;
	css: string;
	/** Empty when the stylesheet declares none: the editor then has nothing. */
	params: FamilyParam[];
	/** False when the `uu-params` comment is missing or unreadable. */
	hasParams: boolean;
	doc: FamilyDoc;
	/** False when no `STYLE FAMILY` header was found. */
	hasDoc: boolean;
	classification: Classification;
	/** A blob: URL of the stylesheet, for the page's <link>. */
	url: string;
	/** When it was loaded, for the page's list. */
	loadedAt: number;
}

export const local = $state<{ list: LocalFamily[] }>({ list: [] });

/** A family name: lowercase words joined by hyphens. */
const slug = (s: string) =>
	s
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^\w\s-]/g, '')
		.trim()
		.replace(/[\s_]+/g, '-')
		.replace(/-+/g, '-');

/**
 * Read a stylesheet into a family. The name is the header's `« name »`, else
 * the file's; a name a built family already has is suffixed, since a built
 * family is not ours to replace.
 */
export function readFamily(css: string, fileName = 'family'): LocalFamily {
	const doc = docIn(css);
	const params = paramsIn(css);
	let name = slug(doc?.name || fileName.replace(/\.css$/i, '')) || 'family';
	if (built.includes(name)) name = `${name}-local`;
	const title = name.charAt(0).toUpperCase() + name.slice(1);
	return {
		name,
		css,
		params: params ?? [],
		hasParams: params !== null,
		doc: doc ? { title, after: doc.after, blurb: doc.blurb, changes: doc.changes } : { title, after: '', blurb: '', changes: [] },
		hasDoc: doc !== null,
		classification: classifyStylesheet(css),
		url: browser ? URL.createObjectURL(new Blob([css], { type: 'text/css' })) : '',
		loadedAt: Date.now()
	};
}

/** Add a family, or replace the one loaded under the same name. */
export async function addFamily(css: string, fileName?: string): Promise<LocalFamily> {
	const family = readFamily(css, fileName);
	const at = local.list.findIndex((f) => f.name === family.name);
	if (at >= 0) {
		URL.revokeObjectURL(local.list[at]!.url);
		local.list[at] = family;
	} else {
		local.list.push(family);
	}
	await store('put', { name: family.name, css, fileName, loadedAt: family.loadedAt });
	return family;
}

export async function removeFamily(name: string) {
	const at = local.list.findIndex((f) => f.name === name);
	if (at < 0) return;
	URL.revokeObjectURL(local.list[at]!.url);
	local.list.splice(at, 1);
	await store('delete', name);
}

let restored: Promise<void> | null = null;

/** Bring back the families loaded on an earlier visit. Once per page load. */
export function restoreFamilies(): Promise<void> {
	restored ??= (async () => {
		const rows = (await store('getAll')) as { css: string; fileName?: string; loadedAt?: number }[] | undefined;
		for (const row of rows ?? []) {
			const family = readFamily(row.css, row.fileName);
			family.loadedAt = row.loadedAt ?? family.loadedAt;
			if (!local.list.some((f) => f.name === family.name)) local.list.push(family);
		}
	})();
	return restored;
}

/* ── IndexedDB, the smallest wrapper that does the job ─────────────────
   A stylesheet is ~400 kB: too much for localStorage to hold several. Any
   failure (private window, blocked storage) leaves the family loaded for
   this visit only, which is the most a blocked store can give. */

const DB = 'sepale';
const STORE = 'families';

function open(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB, 1);
		req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'name' });
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

async function store(op: 'put' | 'delete' | 'getAll', arg?: unknown): Promise<unknown> {
	if (!browser) return undefined;
	try {
		const db = await open();
		return await new Promise((resolve, reject) => {
			const tx = db.transaction(STORE, op === 'getAll' ? 'readonly' : 'readwrite');
			const os = tx.objectStore(STORE);
			const req = op === 'put' ? os.put(arg) : op === 'delete' ? os.delete(arg as string) : os.getAll();
			req.onsuccess = () => resolve(req.result);
			req.onerror = () => reject(req.error);
		});
	} catch {
		return undefined;
	}
}
