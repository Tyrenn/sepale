/**
 * preview-shell.js — loaded by index.html (the shell).
 *
 * Responsibilities:
 *   1. Discover available themes from the /theme/ directory.
 *      Strategy (falls through on failure):
 *        a. Fetch ../theme/ and parse directory-listing links (works with
 *           most local dev servers: VS Code Live Server, http-server, etc.)
 *        b. Fetch ../theme/themes.json (manual fallback manifest)
 *        c. Hardcoded defaults ['coffee', 'bumblebee']
 *
 *   2. Populate the theme <select> and apply the saved theme on load.
 *
 *   3. Build the component navigation from the COMPONENTS list and
 *      restore the last viewed page from localStorage.
 *
 *   4. On navigation: update the iframe src and the active nav state.
 *
 *   5. On theme change: update the shell's own data-theme link, save to
 *      localStorage, and notify the iframe via postMessage.
 */

var THEME_KEY = 'uu-theme';
var PAGE_KEY  = 'uu-page';
var DEFAULT_THEME = 'coffee';
var DEFAULT_PAGE  = 'button';

/** Grouped component list. Add new pages here when created. */
var COMPONENTS = [
	{ group: 'Form', items: [
		{ id: 'button',     label: 'Button' },
		{ id: 'input',      label: 'Input' },
		{ id: 'select',     label: 'Select' },
		{ id: 'textarea',   label: 'Textarea' },
		{ id: 'checkbox',   label: 'Checkbox' },
		{ id: 'radio',      label: 'Radio' },
		{ id: 'toggle',     label: 'Toggle' },
		{ id: 'range',      label: 'Range' },
		{ id: 'file-input', label: 'File input' },
	]},
	{ group: 'Display', items: [
		{ id: 'chip',             	label: 'Chip' },
		{ id: 'badge',            	label: 'Badge' },
		{ id: 'tab',              	label: 'Tab' },
		{ id: 'loading',          	label: 'Loading' },
		{ id: 'progress',         	label: 'Progress' },
		{ id: 'radial-progress',  	label: 'Radial progress' },
		{ id: 'skeleton',         	label: 'Skeleton' },
		{ id: 'text',					label: 'Text' },
		{ id: 'link',        		label: 'Link' },
	]},
	{ group: 'Navigation', items: [
		{ id: 'breadcrumbs', 	label: 'Breadcrumbs' },
		{ id: 'dock',        	label: 'Dock' },
	]},
	{ group: 'Other', items: [
		{ id: 'join',        label: 'Join' },
		{ id: 'validator', 	label: 'Validator' },
	]},
];

/* ── Theme discovery ──────────────────────────────────────────────────────── */

/**
 * Try to read available themes from the /theme/ directory.
 * Returns a promise that resolves to an array of theme name strings.
 */
async function discoverThemes() {
	// Strategy A: directory listing (most local dev servers enable this).
	try {
		var res = await fetch('../theme/');
		if (res.ok) {
		var html = await res.text();
		var parser = new DOMParser();
		var doc = parser.parseFromString(html, 'text/html');
		var themes = Array.from(doc.querySelectorAll('a[href]'))
			.map(function (a) { return a.getAttribute('href'); })
			.filter(function (h) {
				return h.endsWith('.css') &&
						!h.startsWith('/') &&
						!h.startsWith('http') &&
						h !== 'themes.json';
			})
			.map(function (h) { return h.replace(/^\.\//, '').replace(/\.css$/, ''); })
			.filter(Boolean);
		if (themes.length > 0) return themes;
		}
	} catch (e) { /* directory listing unavailable */ }

	// Strategy B: themes.json manifest.
	try {
		var r = await fetch('../theme/themes.json');
		if (r.ok) return await r.json();
	} catch (e) { /* manifest not found */ }

	// Strategy C: hardcoded fallback.
	return [DEFAULT_THEME, 'bumblebee'];
}

/* ── Theme application ────────────────────────────────────────────────────── */

/**
 * Apply a theme by name to the shell and the preview iframe.
 * Also persists the choice to localStorage.
 */
function applyTheme(name) {
	// Update shell theme link.
	var link = document.querySelector('link[data-theme]');
	if (link) link.href = '../theme/' + name + '.css';

	// Persist.
	localStorage.setItem(THEME_KEY, name);

	// Notify the iframe.
	var frame = document.getElementById('shell-frame');
	if (frame && frame.contentWindow) {
		frame.contentWindow.postMessage({ type: 'uu-theme', name: name }, '*');
	}

	// Sync the <select> value.
	var sel = document.getElementById('shell-theme-select');
	if (sel && sel.value !== name) sel.value = name;
}

/* ── Navigation ───────────────────────────────────────────────────────────── */

/** Navigate the iframe to a component page and update the active link. */
function navigate(id) {
  var frame = document.getElementById('shell-frame');
  if (frame) frame.src = id + '.html';

  // Update active state on all nav links.
  document.querySelectorAll('[data-nav-id]').forEach(function (el) {
    el.setAttribute('data-active', el.getAttribute('data-nav-id') === id ? 'true' : 'false');
  });

  localStorage.setItem(PAGE_KEY, id);
}

/* ── DOM construction ─────────────────────────────────────────────────────── */

/** Build the sidebar navigation from the COMPONENTS list. */
function buildNav() {
  var nav = document.getElementById('shell-nav');
  if (!nav) return;

  COMPONENTS.forEach(function (group) {
    // Group header.
    var header = document.createElement('p');
    header.className = 'shell-nav-group text-s4-b1';
    header.textContent = group.group;
    nav.appendChild(header);

    // Items list.
    var ul = document.createElement('ul');
    ul.className = 'shell-nav-list';

    group.items.forEach(function (item) {
      var li  = document.createElement('li');
      var a   = document.createElement('a');
      a.href  = '#';
      a.className = 'link link-hover shell-nav-link';
      a.textContent = item.label;
      a.setAttribute('data-nav-id', item.id);
      a.setAttribute('data-active', 'false');

      a.addEventListener('click', function (e) {
        e.preventDefault();
        navigate(item.id);
      });

      li.appendChild(a);
      ul.appendChild(li);
    });

    nav.appendChild(ul);
  });
}

/** Populate the theme <select> with discovered theme options. */
function buildThemeSelect(themes) {
	var sel = document.getElementById('shell-theme-select');
	if (!sel) return;

	var saved = localStorage.getItem(THEME_KEY) || DEFAULT_THEME;

	themes.forEach(function (name) {
		var opt = document.createElement('option');
		opt.value = name;
		opt.textContent = name;
		if (name === saved) opt.selected = true;
		sel.appendChild(opt);
	});

	sel.addEventListener('change', function () {
		applyTheme(sel.value);
	});
}

/* ── Init ─────────────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', async function () {
	// Build nav links.
	buildNav();

	// Discover themes and populate the select.
	var themes = await discoverThemes();
	buildThemeSelect(themes);

	// Restore last visited page.
	var page = localStorage.getItem(PAGE_KEY) || DEFAULT_PAGE;
	navigate(page);

	// Apply saved theme (shell link is already set by inline script;
	// this call syncs the select UI and notifies the iframe once it loads).
	var saved = localStorage.getItem(THEME_KEY) || DEFAULT_THEME;

	// Wait for iframe first load then push theme.
	var frame = document.getElementById('shell-frame');
	frame.addEventListener('load', function () {
		applyTheme(saved);
	});
});
