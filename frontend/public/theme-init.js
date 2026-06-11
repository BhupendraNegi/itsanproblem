// Resolve the theme before React mounts to avoid a light-mode flash.
// Kept as a static file so index.html carries no inline script.
try {
  var themePref = localStorage.getItem('themePref');
  var dark = themePref === 'dark' ||
    (themePref !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
} catch (e) { /* default to light */ }
