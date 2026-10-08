// Written straight to the element rather than into state: a pointermove that
// re-rendered the grid would be the one thing this effect could not afford.
export function trackPointer(event) {
  const el = event.currentTarget;
  const box = el.getBoundingClientRect();
  el.style.setProperty('--px', (((event.clientX - box.left) / box.width - 0.5) * 2).toFixed(3));
  el.style.setProperty('--py', (((event.clientY - box.top) / box.height - 0.5) * 2).toFixed(3));
}

export function releasePointer(event) {
  event.currentTarget.style.setProperty('--px', '0');
  event.currentTarget.style.setProperty('--py', '0');
}
