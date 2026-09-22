/**
 * build-themes.mjs — write the shipped themes from their drafts.
 *
 * A theme is generator output (ADR 0010), so it is produced by the generator's
 * own code rather than typed by hand into SCSS. That is what makes the round
 * trip real: the file a preset writes here is byte for byte the file the
 * download button produces, sentinels included, and loading it back gives the
 * draft it came from.
 *
 *   src/lib/theme/presets.ts  ->  static/themes/<name>.css
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadSchema, root } from './_schema.mjs';

const { schema, sections, presets } = await loadSchema();
const neutral = schema.expand(sections, {});

const dir = join(root, 'static/themes');
mkdirSync(dir, { recursive: true });

for (const { name, label, draft } of presets) {
	const css =
		`/* ${name} — generated from src/lib/theme/presets.ts. Do not edit:\n` +
		`   edit the draft, or the theme generator, and run \`npm run build:css\`.\n` +
		`   The three sentinels are what lets the generator reopen this file. */\n` +
		schema.serialise(schema.expand(sections, draft), neutral);
	writeFileSync(join(dir, `${name}.css`), css);

	/* The round trip the sentinels exist for: reading the file back must give
	   a draft that regenerates it byte for byte. When it does not, a control
	   folds an answer into a variable it cannot recover, and the generator
	   would silently lose that answer when someone reopens the theme. */
	const reread = schema.serialise(schema.expand(sections, schema.parse(sections, css)), neutral);
	if (reread !== schema.serialise(schema.expand(sections, draft), neutral)) {
		console.error(`
theme: ${name} does not survive a round trip.`);
		console.error('Reopening it in the generator would not give back what wrote it.');
		process.exitCode = 1;
	}

	console.log(`theme: ${label} -> static/themes/${name}.css`);
}
