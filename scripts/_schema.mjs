/**
 * _schema.mjs — load the generator's schema into a node script.
 *
 * The schema is TypeScript importing itself with `.js` specifiers, which is
 * exactly what Node's type stripping does not rewrite. So it is compiled to a
 * temp directory first. tsc is invoked through its own JS entry point because
 * spawning `npx.cmd` is refused on Windows.
 *
 * Both `check-theme-vars.mjs` and `build-themes.mjs` go through here, so the
 * CSS a theme file holds and the CSS the download button produces come from
 * one implementation.
 */

import { execFileSync } from 'node:child_process';
import { rmSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

const ENTRIES = [
	'src/lib/theme/schema.ts',
	'src/lib/theme/presets.ts',
	'src/lib/theme/sections/colors.ts',
	'src/lib/theme/sections/actions.ts',
	'src/lib/theme/sections/actions-writers.ts',
	'src/lib/theme/sections/fields.ts',
	'src/lib/theme/sections/selectors.ts',
	'src/lib/theme/sections/containers.ts',
	'src/lib/theme/sections/rest.ts'
];

/** `{ schema, sections, presets }`, with the temp build already cleaned up. */
export async function loadSchema() {
	const out = mkdtempSync(join(tmpdir(), 'uu-schema-'));
	try {
		execFileSync(
			process.execPath,
			[
				require.resolve('typescript/bin/tsc'),
				...ENTRIES,
				'--outDir', out,
				'--rootDir', 'src/lib',
				'--module', 'esnext',
				'--target', 'es2022',
				'--moduleResolution', 'bundler',
				'--skipLibCheck',
				'--ignoreConfig'
			],
			{ cwd: root, stdio: 'inherit' }
		);
		const at = (f) => import(pathToFileURL(join(out, f)).href);
		const schema = await at('theme/schema.js');
		const { PRESETS } = await at('theme/presets.js');
		const { colors } = await at('theme/sections/colors.js');
		const { actions } = await at('theme/sections/actions.js');
		const { fields } = await at('theme/sections/fields.js');
		const { selectors } = await at('theme/sections/selectors.js');
		const { containers } = await at('theme/sections/containers.js');
		const { markers, feedback, textSection } = await at('theme/sections/rest.js');
		return {
			schema,
			sections: [colors, actions, fields, selectors, containers, markers, feedback, textSection],
			presets: PRESETS
		};
	} finally {
		rmSync(out, { recursive: true, force: true });
	}
}

export { root };
