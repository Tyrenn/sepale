/**
 * preview.js — loaded inside each component page (possibly in an iframe).
 *
 * Responsibilities:
 *   1. Listen for postMessage theme changes sent by the shell (preview-shell.js).
 *   2. Apply the new theme to the page's data-theme link element.
 *
 * Theme initialisation on load is handled by a synchronous inline script
 * in each page's <head> to prevent FOUC — this file only handles live updates.
 */
(function () {
  var THEME_KEY = 'uu-theme';

  /** Update the page's theme link href. */
  function applyTheme(name) {
    var link = document.querySelector('link[data-theme]');
    if (link) link.href = '../theme/' + name + '.css';
  }

  // Listen for theme change messages from the parent shell.
  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'uu-theme') {
      applyTheme(e.data.name);
      // Keep localStorage in sync so a hard reload shows the right theme.
      localStorage.setItem(THEME_KEY, e.data.name);
    }
  });
})();
