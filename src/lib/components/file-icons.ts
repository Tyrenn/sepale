/**
 * What a file looks like in a FileExplorer, by extension.
 *
 * An icon is a glyph — SVG markup drawn in a 24×24 box, stroked in
 * `currentColor` — set inside a page outline, and the colour of the whole.
 * The table maps a lower-case extension, without its dot, to an icon; the
 * explorer merges yours over this one, so a single entry overrides a single
 * extension.
 */

export interface FileIcon {
	/** SVG markup inside the page, in a 24×24 box. Empty: the bare page. */
	glyph: string;
	/** Any CSS colour. Defaults to the explorer's muted ink. */
	color?: string;
	/** Draw the glyph alone, without the page around it. */
	bare?: boolean;
}

/** The page every file icon is drawn on. */
export const PAGE = '<path d="M6 3h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v4h4"/>';

const group = (exts: string, icon: FileIcon): Record<string, FileIcon> =>
	Object.fromEntries(exts.split(' ').map((e) => [e, icon]));

const IMAGE: FileIcon = { color: '#a855f7', glyph: '<circle cx="9.5" cy="11" r="1.3"/><path d="m7.5 18 3-3.2 2 2 1.8-1.8 2.2 3"/>' };
const VIDEO: FileIcon = { color: '#ef4444', glyph: '<path d="M10 11.5v5l4-2.5z"/>' };
const AUDIO: FileIcon = { color: '#ec4899', glyph: '<path d="M10.5 17V11l4-1v5.5"/><circle cx="9.3" cy="17" r="1.2"/><circle cx="13.3" cy="15.5" r="1.2"/>' };
const ARCHIVE: FileIcon = { color: '#d97706', glyph: '<path d="M11 4v2m0 2v2m0 2v2"/><rect x="9.8" y="14" width="2.4" height="3" rx=".6"/>' };
const PDF: FileIcon = { color: '#dc2626', glyph: '<path d="M8.5 17.5c2-1 4.5-5.5 4-7.5-.4-1.4-2-.6-1.3 1.2.8 2.2 3 4.7 4.8 4.8 1.4.1 1.2-1.4-.6-1.4-1.7 0-4.8 1-6.9 2.9"/>' };
const DOC: FileIcon = { color: '#2563eb', glyph: '<path d="M8.5 11h7M8.5 14h7M8.5 17h4.5"/>' };
const SHEET: FileIcon = { color: '#16a34a', glyph: '<path d="M8.5 11h7v6h-7zM8.5 14h7M12 11v6"/>' };
const SLIDES: FileIcon = { color: '#ea580c', glyph: '<rect x="8.5" y="11" width="7" height="5" rx=".6"/><path d="M12 16v2"/>' };
const CODE: FileIcon = { color: '#0d9488', glyph: '<path d="m10 11.5-2 2 2 2m4-4 2 2-2 2"/>' };
const DATA: FileIcon = { color: '#0891b2', glyph: '<path d="M10.5 11c-1 0-1 .8-1 1.6s-.6 1.4-1 1.4c.4 0 1 .6 1 1.4s0 1.6 1 1.6m3-6c1 0 1 .8 1 1.6s.6 1.4 1 1.4c-.4 0-1 .6-1 1.4s0 1.6-1 1.6"/>' };
const TEXT: FileIcon = { color: '#64748b', glyph: '<path d="M8.5 11h7M8.5 14h7M8.5 17h7"/>' };
const FONT: FileIcon = { color: '#7c3aed', glyph: '<path d="m9 17.5 3-7 3 7m-5-2.2h4"/>' };

/** The default table: the usual extensions, by family of file. */
export const FILE_ICONS: Record<string, FileIcon> = {
	...group('png jpg jpeg gif webp avif svg bmp ico tif tiff heic', IMAGE),
	...group('mp4 mov webm mkv avi m4v', VIDEO),
	...group('mp3 wav ogg flac m4a aac', AUDIO),
	...group('zip rar 7z tar gz tgz bz2 xz', ARCHIVE),
	...group('pdf', PDF),
	...group('doc docx odt rtf pages', DOC),
	...group('xls xlsx ods numbers', SHEET),
	...group('ppt pptx odp key', SLIDES),
	...group('js mjs cjs ts tsx jsx svelte vue html css scss py rb go rs java c cpp h php sh', CODE),
	...group('json csv tsv xml yaml yml toml sql', DATA),
	...group('txt md log ini env', TEXT),
	...group('ttf otf woff woff2', FONT)
};

/** Extensions shown as a picture when the file has a URL. */
export const IMAGE_EXTENSIONS = new Set('png jpg jpeg gif webp avif svg bmp ico'.split(' '));

/** `photo.JPG` → `jpg`; no dot → `''`. */
export function extensionOf(name: string): string {
	const dot = name.lastIndexOf('.');
	return dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
}
