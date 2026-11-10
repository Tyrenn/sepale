import { asset } from '$app/paths';
import { serializeTheme, type ThemeToken } from '$lib/theme.js';
import { classesFor, stylesheetText } from '../playground.svelte.js';
import { familyShape, familyTypes } from '$lib/family-types.js';
import { schema } from '$lib/generated/components.js';
import pkg from '../../../package.json' with { type: 'json' };

const { version } = pkg;

export type BundleOptions = {
	family: string;
	/** The theme's name, which names the zip. */
	theme: string;
	scheme: string;
	/** The parameters as they stand in the editor, edits included. */
	tokens: ThemeToken[];
	/** Add the components, and the family's types that narrow them. */
	svelte: boolean;
	/** Add the optional reset. */
	reset: boolean;
};

async function text(path: string) {
	const res = await fetch(asset(path));
	if (!res.ok) throw new Error(`${path}: ${res.status}`);
	return res.text();
}

function readme({ family, svelte, reset }: BundleOptions) {
	const sheets = [reset && 'reset.css', `${family}.css`, 'theme.css'].filter(Boolean);
	const components = `- \`lib/\`: the Svelte components. Their props follow the families your project
  registers, and \`${family}.css.d.ts\` registers ${family}: see below.
- \`${family}.css.d.ts\`: what ${family} draws, as types.\n`;
	const use = `Copy \`lib/\` anywhere in your project and import from \`lib/components/\`. The
components need Svelte 5 and a bundler that resolves TypeScript (\`variants.ts\`
is imported as \`variants.js\`, as Vite and SvelteKit do). The date picker's
library is in \`lib/vendor/\`, with its licence.

\`\`\`svelte
<script>
	import Button from './lib/components/Button.svelte';
</script>

<Button color="primary">Save</Button>
\`\`\`

### Types that follow the family

Keep \`${family}.css.d.ts\` beside \`${family}.css\`, and import the stylesheet from
any file of your project, a layout typically:

\`\`\`ts
import './${family}.css';
\`\`\`

TypeScript reads the declaration next to it, and every component's props narrow
to what ${family} draws: a variant it lacks is a compile error. Switching family
is changing that line. If the stylesheet is loaded otherwise (a \`<link>\`), register
it for its types only: \`import type {} from './${family}.css'\`, or
\`/// <reference path="./${family}.css.d.ts" />\` in a \`.d.ts\` of yours.

Under \`"moduleResolution": "nodenext"\`, TypeScript does not look for that file
beside a stylesheet: register it with the \`/// <reference path>\` line above.

To keep code that compiles under several families, register them all and add:

\`\`\`ts
declare global {
	namespace Sepale {
		interface Config { portable: true }
	}
}
\`\`\`

Props then accept only what every registered family draws.
`;
	return `# Sepale, ${family}

A snapshot of Sepale ${version}: these files never update, and they are yours to
change. To upgrade, download a new bundle.

## Files

${reset ? '- `reset.css`: an optional page reset. Remove it if your page has one.\n' : ''}- \`${family}.css\`: the ${family} family, every component's classes.
- \`theme.css\`: your theme, the values of the family's parameters.
${svelte ? components : ''}
## Use

Load the stylesheets in this order, in your page or from your bundler:

\`\`\`html
${sheets.map((sheet) => `<link rel="stylesheet" href="${sheet}" />`).join('\n')}
\`\`\`

${
	svelte
		? use
		: `Then write the classes:

\`\`\`html
<button class="btn btn-primary">Save</button>
\`\`\`
`
}`;
}

/**
 * The bundle (CONTEXT.md): assembled here in the browser, from files the build
 * has already compiled, so the site needs no server. JSZip loads on first use.
 */
export async function buildBundle(options: BundleOptions): Promise<{ name: string; blob: Blob }> {
	const { family, theme, scheme, tokens, svelte, reset } = options;
	const [{ default: JSZip }, stylesheet, resetCss, components] = await Promise.all([
		import('jszip'),
		stylesheetText(family),
		reset ? text('/reset.css') : undefined,
		/* The generic sources, laid out as in src/lib/ (gen-components.mjs). */
		svelte ? text('/bundle/_generic.json') : undefined
	]);

	const name = `sepale-${family}-${theme.replace(/[^\w-]+/g, '-')}`;
	const zip = new JSZip();
	const root = zip.folder(name)!;
	root.file('README.md', readme(options));
	root.file(`${family}.css`, stylesheet);
	root.file('theme.css', `/* Sepale ${version}, ${family}, theme "${theme}". */\n${serializeTheme(tokens, scheme)}`);
	if (resetCss !== undefined) root.file('reset.css', resetCss);
	if (components !== undefined) {
		for (const [path, content] of Object.entries<string>(JSON.parse(components))) root.file(`lib/${path}`, content);
		/* The family's types (ADR 0015), derived here by the function the build
		   uses — the same text for a family built with Sepale and for one
		   loaded from disk, which no build ever saw. */
		root.file(`${family}.css.d.ts`, familyTypes(family, familyShape(classesFor(family), schema, stylesheet)));
	}

	return { name: `${name}.zip`, blob: await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }) };
}
