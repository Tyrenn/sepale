/**
 * private.mjs — families kept out of everything public (ADR 0015).
 *
 * A family directory holding a `.private` file is built for the local app (it
 * sits in the picker like any other) but never leaves the machine:
 *
 *   build-css --public   skips it, and clears what an earlier local build wrote
 *   gen-registry         lists it only when its CSS was built
 *   package.mjs          refuses to run while its CSS is in static/
 *
 * `build` (the site) and `package` (npm) go through `build:css:public`. The
 * family lives in its own repository, cloned into src/scss/families/<name>
 * and excluded from this one (.git/info/exclude).
 */

import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const MARKER = '.private';

/** Whether the family directory `name` under `familiesDir` is private. */
export function isPrivate(familiesDir, name) {
	return existsSync(join(familiesDir, name, MARKER));
}

/** The private families under `familiesDir`. */
export function privateFamilies(familiesDir) {
	if (!existsSync(familiesDir)) return [];
	return readdirSync(familiesDir).filter((name) => isPrivate(familiesDir, name));
}
