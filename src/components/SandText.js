'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { grainStyle, planScatter } from '../lib/sand';

// How long the sand stays scattered before it starts walking home.
const HOLD_MS = 1000;
// Past this much stillness the last known movement is stale; using it would fling the
// letters in a direction the pointer left behind a second ago.
const STALE_MS = 140;

function readVelocity(vel) {
  const age = performance.now() - vel.t;
  const decay = age > STALE_MS ? 0.15 : 1;
  const vx = vel.vx * decay;
  const vy = vel.vy * decay;
  return { vx, vy, speed: Math.hypot(vx, vy) };
}

function usePointerVelocity() {
  const vel = useRef({ vx: 0, vy: 0, t: 0 });

  useEffect(() => {
    let last = null;
    const onMove = (event) => {
      const now = performance.now();
      if (last) {
        const dt = Math.max(8, now - last.t);
        const vx = ((event.clientX - last.x) / dt) * 1000;
        const vy = ((event.clientY - last.y) / dt) * 1000;
        // Half of the previous sample, half of this one. A single coalesced pointermove can
        // report a huge jump after the browser batches events, and an unsmoothed vector
        // makes one word fly further than its neighbours for no visible reason.
        vel.current.vx = vel.current.vx * 0.5 + vx * 0.5;
        vel.current.vy = vel.current.vy * 0.5 + vy * 0.5;
      }
      last = { x: event.clientX, y: event.clientY, t: now };
      vel.current.t = now;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return vel;
}

function SandWord({ text, vel, reduced }) {
  const letters = useMemo(() => Array.from(text), [text]);
  const [plan, setPlan] = useState(null);
  const [thrown, setThrown] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  function scatter() {
    if (reduced.current) return;
    setPlan(planScatter(letters, readVelocity(vel.current)));
    setThrown(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setThrown(false), HOLD_MS);
  }

  return (
    // The word is one inline-block so its letters can never be split across two lines,
    // which is what happens the moment every character becomes its own box.
    <span className="inline-block" onPointerEnter={scatter} onPointerDown={scatter}>
      {letters.map((ch, i) => (
        <span
          key={i}
          className="inline-block"
          style={plan ? grainStyle(plan[i], thrown ? 'out' : 'back') : undefined}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

export default function SandText({ text }) {
  const vel = usePointerVelocity();
  const reduced = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduced.current = mq.matches;
    const onChange = (event) => {
      reduced.current = event.matches;
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const words = useMemo(() => text.split(' '), [text]);

  return (
    // No hidden duplicate of the sentence, and no aria-hidden on the letters. The earlier
    // version did both, which meant selecting this paragraph copied every line twice: an
    // sr-only span is clipped to 1px, not removed, so it is still selectable. The letters
    // are inline-level with no whitespace between them, so assistive tech reads them as
    // continuous text rather than spelling them out.
    <>
      {words.map((word, i) => (
        <span key={i}>
          <SandWord text={word} vel={vel} reduced={reduced} />
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </>
  );
}
