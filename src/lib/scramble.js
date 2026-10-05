/**
 * The one decision inside the hero scramble: given how far through the animation we
 * are, what should be on screen?
 *
 * Extracted because the component around it is just requestAnimationFrame plumbing,
 * and the only failure that matters — the name never resolving back to real letters —
 * is invisible to a browser check that happens to run after the 900ms window has
 * closed. Here it is a pure function of progress, so it can be asserted directly.
 */

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ$#@%&*<>/\\{}[]';

/**
 * @param {string} text     the word being resolved
 * @param {number} progress 0 to 1; anything outside is clamped
 * @param {() => number} random injectable so tests can be deterministic
 * @returns {string} the frame's contents, ending on `text` exactly at progress 1
 */
export function scrambleFrame(text, progress, random = Math.random) {
  const chars = [...text];
  const clamped = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 1;
  const settled = Math.floor(clamped * chars.length);

  return chars
    .map((char, index) => {
      if (char === ' ') return ' ';
      if (index < settled) return char;
      if (clamped === 1) return char;
      const pick = random();
      const safe = Number.isFinite(pick) ? Math.min(0.999999, Math.max(0, pick)) : 0;
      return GLYPHS[Math.floor(safe * GLYPHS.length)];
    })
    .join('');
}
