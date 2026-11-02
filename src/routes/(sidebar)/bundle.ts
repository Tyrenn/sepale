import { asset } from '$app/paths';
import { serializeTheme, type ThemeToken } from '$lib/theme.js';
import pkg from '../../../package.json' with { type: 'json' };

const { version } = pkg;

export type BundleOptions = {
	family: string;
	/** The theme's name, which names the zip. */
	theme: string;
	scheme: string;
	/** The parameters as they stand in the editor, edits included. */
	tokens: ThemeToken[];
	/** Add the components, written for this family alone. */
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
	return `# Sepale, ${family}

A snapshot of Sepale ${version}: these files never update, and they are yours to
change. To upgrade, download a new bundle.

## Files

${reset ? '- `reset.css`: an optional page reset. Remove it if your page has one.\n' : ''}- \`${family}.css\`: the ${family} family, every component's classes.
- \`theme.css\`: your theme, the values of the family's parameters.
${svelte ? `- \`components/\`: the Svelte components, written for ${family} alone.\n` : ''}
## Use

Load the stylesheets in this order, in your page or from your bundler:

\`\`\`html
${sheets.map((sheet) => `<link rel="stylesheet" href="${sheet}" />`).join('\n')}
\`\`\`

${
	svelte
		? `Copy \`components/\` anywhere in your project and import from it. The components
need Svelte 5 and nothing else: they only import each other, and the date
picker's library is in \`components/vendor/\`, with its licence.

\`\`\`svelte
<script>
	import Button from './components/Button.svelte';
</script>

<Button color="primary">Save</Button>
\`\`\`
`
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
		text(`/families/${family}.css`),
		reset ? text('/reset.css') : undefined,
		svelte ? text(`/bundle/${family}.json`) : undefined
	]);

	const name = `sepale-${family}-${theme.replace(/[^\w-]+/g, '-')}`;
	const zip = new JSZip();
	const root = zip.folder(name)!;
	root.file('README.md', readme(options));
	root.file(`${family}.css`, stylesheet);
	root.file('theme.css', `/* Sepale ${version}, ${family}, theme "${theme}". */\n${serializeTheme(tokens, scheme)}`);
	if (resetCss !== undefined) root.file('reset.css', resetCss);
	if (components !== undefined) {
		for (const [path, content] of Object.entries<string>(JSON.parse(components))) {
			root.file(`components/${path}`, content);
		}
	}

	return { name: `${name}.zip`, blob: await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }) };
}
