/**
 * One definition of "which section is the reader in", shared by the header nav and
 * the side timeline.
 *
 * They used to compute it differently: the header probed `scrollY + 140` while the
 * timeline probed `innerHeight / 3`. On a 900px-tall viewport those two lines sit
 * 160px apart, so for a stretch of scroll at every section boundary the header
 * underlined one section while the timeline had already advanced its dot to the
 * next one. Two indicators, one truth.
 */

// Must stay greater than the 7rem (112px) `scroll-mt-28` that sections land at, or a
// nav click reports the section before the one it scrolled to.
const PROBE_OFFSET_PX = 140;

/**
 * Id of the last section whose top has passed the probe line, or null when the
 * reader is still above the first one. Sections are discovered from the document so
 * a new `<section id>` is picked up without editing this file.
 */
export function getActiveSectionId() {
  const probe = window.scrollY + PROBE_OFFSET_PX;
  let current = null;
  for (const section of document.querySelectorAll('section[id]')) {
    if (section.offsetTop <= probe) current = section.id;
  }
  return current;
}
