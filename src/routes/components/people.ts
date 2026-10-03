/**
 * A fake remote resource for the Data pages: a hundred-odd people held in
 * memory, behind `get` / `update` / `delete` functions that answer after a
 * short delay, the way a server would. Never part of a bundle.
 *
 * Changes persist for the session, across pages: delete someone on the
 * DataHandler page and they are gone from the DataControl page too.
 */

import type { EntityValue, Filter, GetParams, GetResult, Sort } from '$lib/index.js';

export type Person = {
	id: string;
	name: string;
	email: string;
	role: 'admin' | 'editor' | 'viewer';
	team: EntityValue;
	active: boolean;
	score: number;
	joined: string;
	bio: string;
};

const FIRST = ['Ada', 'Grace', 'Alan', 'Linus', 'Margaret', 'Dennis', 'Barbara', 'Ken', 'Radia', 'Edsger', 'Frances', 'Donald', 'Hedy', 'John', 'Katherine', 'Tim', 'Sophie', 'Guido', 'Anita', 'Bjarne'];
const LAST = ['Lovelace', 'Hopper', 'Turing', 'Torvalds', 'Hamilton', 'Ritchie', 'Liskov', 'Thompson', 'Perlman', 'Dijkstra', 'Allen', 'Knuth', 'Lamarr', 'McCarthy', 'Johnson', 'Berners-Lee', 'Wilson', 'van Rossum', 'Borg', 'Stroustrup'];
export const TEAMS: EntityValue[] = [
	{ id: 't1', name: 'Compilers' },
	{ id: 't2', name: 'Kernel' },
	{ id: 't3', name: 'Interfaces' },
	{ id: 't4', name: 'Networks' },
	{ id: 't5', name: 'Research' }
];
const ROLES = ['admin', 'editor', 'viewer'] as const;
const BIOS = [
	'Writes the parts nobody reads and everybody runs.',
	'Prefers a whiteboard to a meeting.',
	'Has opinions about tabs. Strong ones, held for years, defended at length in code review and over lunch.',
	'Ships on Fridays.',
	'Reads the spec before the docs, and the source before the spec.',
	'Keeps a notebook of every bug that took more than a day.'
];

/** Deterministic, so every reload shows the same people. */
function seeded(seed: number) {
	return () => {
		seed = (seed * 16807) % 2147483647;
		return (seed - 1) / 2147483646;
	};
}

const random = seeded(42);
const pick = <T>(list: readonly T[]) => list[Math.floor(random() * list.length)];

let people: Person[] = Array.from({ length: 124 }, (_, i) => {
	const first = FIRST[i % FIRST.length];
	const last = LAST[(i * 7) % LAST.length];
	const joined = new Date(2018, 0, 1 + Math.floor(random() * 2900));
	return {
		id: `p${String(i + 1).padStart(3, '0')}`,
		name: `${first} ${last}`,
		email: `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, '') + `${i}@example.org`,
		role: pick(ROLES),
		team: pick(TEAMS),
		active: random() > 0.25,
		score: Math.round(random() * 100),
		joined: joined.toISOString().slice(0, 10),
		bio: pick(BIOS)
	};
});

export const FILTERS = [
	{ id: 'name', type: 'text', title: 'Name' },
	{
		id: 'role',
		type: 'select',
		title: 'Role',
		multiple: true,
		options: [
			{ name: 'Admin', value: 'admin' },
			{ name: 'Editor', value: 'editor' },
			{ name: 'Viewer', value: 'viewer' }
		]
	},
	{
		id: 'team',
		type: 'entity',
		title: 'Team',
		items: (q: string) => wait(150).then(() => TEAMS.filter((t) => t.name!.toLowerCase().includes(q.toLowerCase())))
	},
	{ id: 'active', type: 'boolean', title: 'Active' },
	{ id: 'score', type: 'number', title: 'Score at least', min: 0, max: 100, step: 5 },
	{ id: 'joined', type: 'date', title: 'Joined after' }
] as const satisfies readonly Filter[];

export const SORTS: Sort[] = [
	{ id: 'name', name: 'Name, A–Z', value: 'asc' },
	{ id: 'name', name: 'Name, Z–A', value: 'desc' },
	{ id: 'joined', name: 'Newest', value: 'desc' },
	{ id: 'score', name: 'Best score', value: 'desc' }
];

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

type Values = {
	name?: string;
	role?: string[];
	team?: EntityValue;
	active?: boolean;
	score?: number;
	joined?: Date;
};

/** One page of people, filtered, searched and sorted — as a server would. */
export async function getPeople(params: GetParams<Values>): Promise<GetResult<Person>> {
	await wait(250 + Math.random() * 250);
	const f = params.filters;
	const q = params.search?.toLowerCase();
	let rows = people.filter(
		(p) =>
			(!q || p.name.toLowerCase().includes(q) || p.email.includes(q)) &&
			(!f.name || p.name.toLowerCase().includes(f.name.toLowerCase())) &&
			(!f.role?.length || f.role.includes(p.role)) &&
			(!f.team || p.team.id === f.team.id) &&
			(f.active === undefined || p.active === f.active) &&
			(f.score === undefined || p.score >= f.score) &&
			(!f.joined || p.joined >= new Date(f.joined).toISOString().slice(0, 10))
	);
	if (params.sort) {
		const { id, value } = params.sort;
		const dir = value === 'asc' ? 1 : -1;
		rows = [...rows].sort((a, b) => {
			const x = a[id as keyof Person];
			const y = b[id as keyof Person];
			return (x < y ? -1 : x > y ? 1 : 0) * dir;
		});
	}
	const start = (params.page - 1) * params.limit;
	return { data: rows.slice(start, start + params.limit).map((p) => ({ ...p })), total: rows.length };
}

export async function updatePerson({ id, data }: { id: string; data: Partial<Person> }) {
	await wait(200);
	people = people.map((p) => (p.id === id ? { ...p, ...data } : p));
}

export async function deletePeople(ids: string[]) {
	await wait(200);
	people = people.filter((p) => !ids.includes(p.id));
}
