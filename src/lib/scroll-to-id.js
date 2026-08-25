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

  element.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const nextHash = `#${id}`;
  if (window.location.hash !== nextHash) {
    window.history.pushState(null, '', nextHash);
  }
}
