'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { scrambleFrame } from '../lib/scramble';

const DURATION_MS = 900;
const REPACKET_INTERVAL = 2; // re-randomise every other frame: reads as motion, not static

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

// A media query is an external system, so it is subscribed to rather than copied into
// state on mount — setState in an effect body would cascade a render on every load.
function subscribe(cb) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}
const getSnapshot = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
const getServerSnapshot = () => false;

function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Collapses a word into glyph noise and resolves it left to right, once, on mount.
 *
 * The real text is what the server renders, so the word is correct with JavaScript off
 * and appears exactly once in the document. A screen-reader-only duplicate was tried
 * first and is wrong: it put "AmirhadiAmirhadi" in the h1 for every crawler. The
 * residual trade-off is that assistive tech reading the heading inside the 900ms window
 * would encounter glyph noise, which is both unlikely and gone in under a second, and
 * does not happen at all under prefers-reduced-motion.
 */
export default function ScrambleWord({ text, delay = 0, className }) {
  const ref = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (reducedMotion) {
      node.textContent = text;
      return;
    }

    const chars = [...text];
    let frame = '';
    let raf = 0;
    let frameCount = 0;
    let startedAt = 0;

    const tick = (now) => {
      if (!startedAt) startedAt = now;
      const elapsed = now - startedAt - delay;

      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const progress = Math.min(1, elapsed / DURATION_MS);

      if (progress === 1 || frameCount % REPACKET_INTERVAL === 0) {
        frame = scrambleFrame(text, progress);
      }
      node.textContent = frame;
      frameCount += 1;

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        // Belt and braces: whatever the frame cadence did, the word ends correct.
        node.textContent = text;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, delay, reducedMotion]);

  return (
    <span ref={ref} className={className} data-cursor-hover>
      {text}
    </span>
  );
}
