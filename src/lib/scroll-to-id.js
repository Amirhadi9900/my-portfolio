/**
 * Same-page section navigation that does not depend on Next.js hash routing.
 * Always scrolls, even when the URL already has that hash.
 */
export function scrollToId(id, event) {
  if (event) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (typeof event.button === 'number' && event.button !== 0) return;
    if (!event.defaultPrevented) event.preventDefault();
  }

  const element = document.getElementById(id);
  if (!element) return;

  // 'auto' defers to the CSS `scroll-behavior` on <html>, which globals.css
  // switches off under prefers-reduced-motion. Hardcoding 'smooth' here would
  // override that and keep animating for users who asked us not to.
  element.scrollIntoView({ behavior: 'auto', block: 'start' });

  const nextHash = `#${id}`;
  if (window.location.hash !== nextHash) {
    window.history.pushState(null, '', nextHash);
  }
}
