'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { scrambleFrame } from '../lib/scramble';

const DECODE_MS = 900;
const WORD_STAGGER_MS = 180;
const REPACKET_INTERVAL = 2;
const DEFAULT_LINES = ['Amirhadi', 'Borjian'];

const COLOUR_RADIUS_PER_EM = 1.8;
const ACCENT = '#7dd3fc';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

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
 * The hero name: it decodes on load and lights the letters nearest the pointer while
 * the cursor is inside it.
 *
 * Both behaviours need one element per character, which is why they live together
 * rather than in two components competing for the same DOM. The decode is driven by
 * scrambleFrame(), the same tested pure function as before, and its output is spread
 * across the letter nodes so the guarantee that it always resolves still holds.
 *
 * The colour loop runs on a single rAF that starts on pointerenter and is cancelled on
 * pointerleave, so an idle page does no work. Letters are adjacent inline-blocks with
 * no whitespace between them, and the real characters are server-rendered, so the h1
 * still contains the name exactly once.
 */
export default function HeroName({ lines = DEFAULT_LINES }) {
  const rootRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  // A primitive, not the array: the parent re-renders on its own timer, and an inline
  // array prop would be a new identity every time, restarting the decode forever.
  const lineKey = lines.join('|');

  // ---- decode on mount -------------------------------------------------------
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) return;

    const words = lineKey.split('|').map((word, lineIndex) => ({
      word,
      letters: [...root.querySelectorAll(`[data-name-line="${lineIndex}"] > span`)],
    }));

    let raf = 0;
    let startedAt = 0;
    let frameCount = 0;

    const paint = (progressFor) => {
      words.forEach(({ word, letters }, lineIndex) => {
        const frame = scrambleFrame(word, progressFor(lineIndex));
        [...frame].forEach((char, i) => {
          if (letters[i]) letters[i].textContent = char;
        });
      });
    };

    const tick = (now) => {
      if (!startedAt) startedAt = now;
      const elapsed = now - startedAt;
      const done = words.every(({ word }, lineIndex) =>
        elapsed - lineIndex * WORD_STAGGER_MS >= (word.length ? DECODE_MS : 0));

      if (done) {
        words.forEach(({ word, letters }, lineIndex) => {
          [...word].forEach((char, i) => {
            if (letters[i]) letters[i].textContent = char;
          });
        });
        raf = 0;
        return;
      }

      if (frameCount % REPACKET_INTERVAL === 0) {
        paint((lineIndex) => Math.max(0, Math.min(1,
          (elapsed - lineIndex * WORD_STAGGER_MS) / DECODE_MS)));
      }
      frameCount += 1;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [lineKey, reducedMotion]);

  // ---- colour field under the pointer ---------------------------------------
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) return;

    const letters = [...root.querySelectorAll('[data-name-line] > span')];
    let pointer = null;
    let raf = 0;

    const clear = () => {
      for (const el of letters) {
        if (el.style.color) { el.style.color = ''; el.style.textShadow = ''; }
      }
    };

    const loop = () => {
      raf = 0;
      if (!pointer) return;

      // Read every letter box first, then write. Interleaving the two would force the
      // browser to relayout between each letter — sixteen reflows a frame for an effect
      // that only changes colour. Rects are re-read each frame rather than cached
      // because the decode changes glyph widths, so the letters really do move.
      const radius = parseFloat(getComputedStyle(root).fontSize) * COLOUR_RADIUS_PER_EM || COLOUR_RADIUS_PER_EM * 16;
      const measured = letters.map((el) => {
        const r = el.getBoundingClientRect();
        return { el, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
      });

      for (const { el, cx, cy } of measured) {
        const distance = Math.hypot(pointer.x - cx, pointer.y - cy);
        const strength = Math.max(0, 1 - distance / radius);
        if (strength > 0.05) {
          el.style.color = ACCENT;
          el.style.textShadow = `0 0 ${(18 * strength).toFixed(1)}px rgba(125, 211, 252, ${strength.toFixed(2)})`;
        } else if (el.style.color) {
          el.style.color = '';
          el.style.textShadow = '';
        }
      }
    };

    const queue = () => { if (!raf) raf = requestAnimationFrame(loop); };

    const onMove = (event) => {
      pointer = { x: event.clientX, y: event.clientY };
      queue();
    };
    const onEnter = (event) => {
      pointer = { x: event.clientX, y: event.clientY };
      queue();
    };
    const onLeave = () => {
      pointer = null;
      cancelAnimationFrame(raf);
      raf = 0;
      clear();
    };

    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    return () => {
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return (
    <span ref={rootRef} data-cursor-hover className="inline-block">
      {lines.map((word, lineIndex) => (
        <span key={word}>
          {lineIndex > 0 && <br />}
          <span data-name-line={lineIndex} className="text-white">
            {[...word].map((char, i) => (
              <span key={i} className="inline-block">{char}</span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}
