/**
 * preview.js — u.u component explorer sidebar
 *
 * Include in every component example page:
 *   <script src="./preview.js" defer></script>
 *
 * On DOMContentLoaded this script:
 *   1. Injects the CSS needed for the sidebar UI (select, link, text, layout).
 *   2. Wraps all existing body children in a scrollable #uu-content div.
 *   3. Prepends a sticky #uu-sidebar with:
 *        - a theme <select> populated from discovered theme files
 *        - grouped component navigation links
 *   4. Highlights the currently active page in the nav.
 *   5. Applies / persists the saved theme via link[data-theme].
 *
 * Theme discovery order (falls through on failure):
 *   A. Fetch ../theme/ directory listing  (works with most local dev servers)
 *   B. Fetch ../theme/themes.json manifest
 *   C. Hardcoded defaults
 *
 * Navigation: plain anchor hrefs — no iframe, no SPA routing.
 */

(function () {
  'use strict';

  /* ── Constants ────────────────────────────────────────────────────────── */

  var THEME_KEY     = 'uu-theme';
  var DEFAULT_THEME = 'coffee';

  /**
   * Component navigation definition.
   * Add a new entry here whenever a new example page is created.
   */
  var COMPONENTS = [
    { group: 'Form', items: [
      { id: 'button',     label: 'Button'     },
      { id: 'input',      label: 'Input'      },
      { id: 'select',     label: 'Select'     },
      { id: 'textarea',   label: 'Textarea'   },
      { id: 'checkbox',   label: 'Checkbox'   },
      { id: 'radio',      label: 'Radio'      },
      { id: 'toggle',     label: 'Toggle'     },
      { id: 'range',      label: 'Range'      },
      { id: 'file-input', label: 'File input' },
    ]},
    { group: 'Display', items: [
      { id: 'chip',            label: 'Chip'            },
      { id: 'badge',           label: 'Badge'           },
      { id: 'tab',             label: 'Tab'             },
      { id: 'loading',         label: 'Loading'         },
      { id: 'progress',        label: 'Progress'        },
      { id: 'radial-progress', label: 'Radial progress' },
      { id: 'skeleton',        label: 'Skeleton'        },
      { id: 'list',            label: 'List'            },
      { id: 'text',            label: 'Text'            },
      { id: 'link',            label: 'Link'            },
    ]},
    { group: 'Navigation', items: [
      { id: 'breadcrumbs', label: 'Breadcrumbs' },
      { id: 'dock',        label: 'Dock'        },
    ]},
    { group: 'Other', items: [
      { id: 'join',      label: 'Join'      },
      { id: 'validator', label: 'Validator' },
    ]},
  ];

  /* ── CSS injection ────────────────────────────────────────────────────── */

  /**
   * Append a <link> to <head> if that exact href isn't already present.
   * Used to inject sidebar CSS without duplicating imports.
   */
  function injectCSS(href) {
    if (document.querySelector('link[href="' + href + '"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  /** Inject all CSS dependencies required by the sidebar. */
  function injectSidebarCSS() {
    injectCSS('../css/components/select.css');
    injectCSS('../css/components/link.css');
    injectCSS('../css/components/text.css');
    injectCSS('./preview-layout.css');
  }

  /* ── Theme ────────────────────────────────────────────────────────────── */

  /**
   * Update the page's theme by changing the href of link[data-theme].
   * The link element is created by the synchronous inline head script
   * to prevent FOUC; this function only changes its href at runtime.
   */
  function applyTheme(name) {
    var link = document.querySelector('link[data-theme]');
    if (link) link.href = '../theme/' + name + '.css';
    localStorage.setItem(THEME_KEY, name);
  }

  /**
   * Discover available themes from the theme directory.
   * Returns a Promise<string[]> of theme names (without .css extension).
   */
  async function discoverThemes() {
    // A: parse directory listing returned by most local dev servers.
    try {
      var res = await fetch('../theme/');
      if (res.ok) {
        var html  = await res.text();
        var doc   = new DOMParser().parseFromString(html, 'text/html');
        var names = Array.from(doc.querySelectorAll('a[href]'))
          .map(function (a) { return a.getAttribute('href'); })
          .filter(function (h) {
            return h.endsWith('.css')
              && !h.startsWith('/')
              && !h.startsWith('http');
          })
          .map(function (h) { return h.replace(/^\.\//, '').replace(/\.css$/, ''); })
          .filter(Boolean);
        if (names.length) return names;
      }
    } catch (_) {}

    // B: explicit themes.json manifest (update alongside new theme files).
    try {
      var r = await fetch('../theme/themes.json');
      if (r.ok) return r.json();
    } catch (_) {}

    // C: hardcoded last resort.
    return [DEFAULT_THEME, 'bumblebee'];
  }

  /* ── Sidebar ──────────────────────────────────────────────────────────── */

  /** Return the id of the current page, e.g. "button" from "button.html". */
  function currentPageId() {
    return window.location.pathname.split('/').pop().replace('.html', '');
  }

  /** Build the <nav> element with all component groups and links. */
  function buildNav(activeId) {
    var nav = document.createElement('nav');
    nav.id = 'uu-nav';

    COMPONENTS.forEach(function (group) {
      // Group label.
      var header = document.createElement('p');
      header.className = 'uu-nav-group text-s4-b1';
      header.textContent = group.group;
      nav.appendChild(header);

      var ul = document.createElement('ul');
      ul.className = 'uu-nav-list';

      group.items.forEach(function (item) {
        var li = document.createElement('li');
        var a  = document.createElement('a');
        a.href      = './' + item.id + '.html';
        a.className = 'uu-nav-link';
        a.textContent = item.label;

        // Mark the page currently being viewed.
        if (item.id === activeId) {
          a.setAttribute('data-active', 'true');
        }

        // Save the current theme to localStorage before navigating so the
        // next page's inline head script picks it up immediately (no FOUC).
        a.addEventListener('click', function () {
          var sel = document.getElementById('uu-theme-select');
          var theme = (sel && sel.value) || localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
          localStorage.setItem(THEME_KEY, theme);
        });

        li.appendChild(a);
        ul.appendChild(li);
      });

      nav.appendChild(ul);
    });

    return nav;
  }

  /**
   * Wrap existing body content, prepend the sidebar.
   * Called once on DOMContentLoaded.
   */
  function injectSidebar() {
    var activeId = currentPageId();

    // Move all current body children into a scrollable content wrapper.
    var content = document.createElement('div');
    content.id  = 'uu-content';
    while (document.body.firstChild) {
      content.appendChild(document.body.firstChild);
    }

    // Build sidebar.
    var sidebar = document.createElement('aside');
    sidebar.id  = 'uu-sidebar';

    // Theme selector section.
    var themeSection = document.createElement('div');
    themeSection.id  = 'uu-theme-section';

    var themeLabel  = document.createElement('label');
    themeLabel.setAttribute('for', 'uu-theme-select');
    themeLabel.className   = 'text-s4-b2';
    themeLabel.textContent = 'Theme';

    var themeSelect = document.createElement('select');
    themeSelect.id        = 'uu-theme-select';
    themeSelect.className = 'select';

    themeSection.appendChild(themeLabel);
    themeSection.appendChild(themeSelect);
    sidebar.appendChild(themeSection);

    // Nav.
    sidebar.appendChild(buildNav(activeId));

    // Mount: sidebar first, then content.
    document.body.appendChild(sidebar);
    document.body.appendChild(content);

    // Populate theme select asynchronously.
    var savedTheme = localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
    discoverThemes().then(function (themes) {
      themes.forEach(function (name) {
        var opt    = document.createElement('option');
        opt.value  = name;
        opt.textContent = name;
        if (name === savedTheme) opt.selected = true;
        themeSelect.appendChild(opt);
      });

      themeSelect.addEventListener('change', function () {
        applyTheme(themeSelect.value);
      });
    });
  }

  /* ── Init ─────────────────────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', function () {
    injectSidebarCSS();
    injectSidebar();
    // Re-apply in case localStorage changed since the inline head script ran.
    applyTheme(localStorage.getItem(THEME_KEY) || DEFAULT_THEME);
  });

})();
