'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { scrollToId } from '../lib/scroll-to-id';
import HeroName from './HeroName';
import SandText from './SandText';

const ROLES = ['Pentester', 'Android Developer', 'Web Developer'];

// The hero background's hex lattice. Computed once at module scope because it depends on
// no state: 187 polygons rebuilt every render would be pure waste, and this component
// re-renders on every typed character.
//
// The grid is generated to overfill the viewBox by a whole cell on the right and bottom,
// not to fit inside it. With preserveAspectRatio="slice" the browser crops the viewBox to
// cover the element, so any dead margin inside the viewBox becomes a visible band of bare
// background at wide aspect ratios. Cover the viewBox and the crop can only ever hide
// cells, never reveal a gap.
const HEX_S = 34;
const HEX_VIEW_W = 816;
const HEX_VIEW_H = 550;
const HEX_X_STEP = HEX_S * 1.5;
const HEX_Y_STEP = HEX_S * Math.sqrt(3);
const HEX_COLS = Math.ceil(HEX_VIEW_W / HEX_X_STEP) + 1;
const HEX_ROWS = Math.ceil(HEX_VIEW_H / HEX_Y_STEP) + 1;
const HEX_CELLS = Array.from({ length: HEX_ROWS * HEX_COLS }, (_, i) => {
  const c = i % HEX_COLS;
  const r = Math.floor(i / HEX_COLS);
  const x = c * HEX_X_STEP;
  const y = r * HEX_Y_STEP + (c % 2 ? HEX_Y_STEP / 2 : 0);
  const points = Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 3) * k;
    return `${(x + HEX_S * 0.92 * Math.cos(a)).toFixed(1)},${(y + HEX_S * 0.92 * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  return {
    points,
    delay: (c * 0.13 + r * 0.07) % 2.4,
    cx: x,
    cy: y,
  };
});

// Stable identity so the prerender and the first client render produce the same DOM.
const EMPTY_HOT = new Set();

// The glass shatter. Timings live together because the phase machine walks through them in
// order and every transition has to finish before the next phase asks it to change.
const SHATTER_RADIUS = 250; // viewBox units, about 30% of the lattice width
const SHATTER_MOVE_MS = 950;
const SHATTER_STAGGER_MS = 420; // the widest shockwave delay any cell gets
// Each phase must outlast its own movement plus the stagger, or clearing the state early
// drops the transition and the last pieces teleport instead of travelling.
const SHATTER_BREAK_MS = SHATTER_MOVE_MS + SHATTER_STAGGER_MS + 10;
const SHATTER_FREEZE_MS = 900; // frost creeps over the fallen pieces
const SHATTER_HEAL_MS = SHATTER_MOVE_MS + SHATTER_STAGGER_MS + 10; // pieces carry the frost home
const SHATTER_THAW_MS = 900; // frost sublimates once everything is aligned again

// The ice is generated as tiles, not per shard. ICE_TILE is the tile edge in viewBox units and
// is deliberately a little wider than a hex (34 × 2 = 68), so one tile spans a whole piece.
// Four seeds means four looks to draw from; a shard picks one when it breaks.
const ICE_TILE = 68;
const ICE_SEEDS = [17, 23, 31, 41];

export default function Hero() {
  const [typedText, setTypedText] = useState('');
  const [roleIndex, setRoleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);
  const [isMounted, setIsMounted] = useState(false);
  const [typingPaused, setTypingPaused] = useState(false);
  const [hotCells, setHotCells] = useState(EMPTY_HOT);

  // Client-side mounting
  useEffect(() => {
    // Gates animations that must not run during prerender; there is nothing to
    // derive it from at render time because the server has no equivalent state.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount gate
    setIsMounted(true);

    // Which cells read as open findings is drawn here, not in render, for two separate
    // reasons: Math.random() in render is impure (react-hooks/purity rejects it, and React
    // may re-run render at will), and a value that differs between the server pass and the
    // first client pass would be a hydration mismatch that discards the whole hero.
    const count = 4 + Math.floor(Math.random() * 4);
    const picks = new Set();
    while (picks.size < count) picks.add(Math.floor(Math.random() * HEX_CELLS.length));
    setHotCells(picks);
  }, []);

  const svgRef = useRef(null);
  const shatterTimers = useRef([]);
  const [shatter, setShatter] = useState(null);

  // A phase machine built from timeouts must not outlive the component, or the last one
  // fires a setState on a tree that is already gone.
  useEffect(() => () => shatterTimers.current.forEach(clearTimeout), []);

  function breakGlass(event) {
    const svg = svgRef.current;
    if (!svg || shatter) return;
    // The click is decoration, not information, so visitors who asked for reduced motion
    // get nothing at all rather than a 1ms version of a shatter.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const rect = svg.getBoundingClientRect();
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    // Screen pixels to viewBox units, through the exact matrix the browser used to place
    // the lattice. Hardcoding a scale would put the burst in the wrong place the moment the
    // slice-crop changes, which is most viewports.
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const origin = point.matrixTransform(ctm.inverse());

    const shards = new Map();
    HEX_CELLS.forEach((cell, i) => {
      const dx = cell.cx - origin.x;
      const dy = cell.cy - origin.y;
      const dist = Math.hypot(dx, dy);
      if (dist > SHATTER_RADIUS) return;
      // 1 at the strike, 0 at the outer edge of the shockwave. Real glass is powdered near
      // the blow and only cracked further out, so the frost coat uses this to lie thickest
      // where the impact was and thin where the cracks merely reached.
      const near = 1 - dist / SHATTER_RADIUS;
      shards.set(i, {
        near,
        dx: dx * 0.5,
        dy: 130 + near * 300 + Math.random() * 90,
        rot: (dx / SHATTER_RADIUS) * 46 + (Math.random() - 0.5) * 24,
        delay: (dist / SHATTER_RADIUS) * SHATTER_STAGGER_MS,
        pick: Math.floor(Math.random() * ICE_SEEDS.length),
      });
    });
    if (shards.size === 0) return;

    // No timer can still be in flight here, because the guard at the top rejects a second
    // click until the sequence has ended. Resetting anyway keeps the array from growing by
    // four entries on every click for the life of the page.
    shatterTimers.current = [];

    setShatter({
      shards,
      phase: 'breaking',
      impact: { x: event.clientX - rect.left, y: event.clientY - rect.top },
    });

    const at = (ms, phase) =>
      shatterTimers.current.push(
        setTimeout(() => setShatter((s) => (s ? { ...s, phase } : s)), ms)
      );
    // Order matters: the frost goes on while the pieces lie where they fell, the pieces
    // then travel home still wearing it, and only once they are aligned does it sublimate.
    at(SHATTER_BREAK_MS, 'freezing');
    at(SHATTER_BREAK_MS + SHATTER_FREEZE_MS, 'healing');
    at(SHATTER_BREAK_MS + SHATTER_FREEZE_MS + SHATTER_HEAL_MS, 'thawing');
    shatterTimers.current.push(
      setTimeout(
        () => setShatter(null),
        SHATTER_BREAK_MS + SHATTER_FREEZE_MS + SHATTER_HEAL_MS + SHATTER_THAW_MS
      )
    );
  }

  // Typing animation
  useEffect(() => {
    if (!isMounted || typingPaused) return;

    const handleTyping = () => {
      const currentRole = ROLES[roleIndex];
      
      if (isDeleting) {
        setTypedText(currentRole.substring(0, charIndex - 1));
        setCharIndex(prev => prev - 1);
        setTypingSpeed(80);
      } else {
        setTypedText(currentRole.substring(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
        setTypingSpeed(150);
      }

      if (!isDeleting && charIndex === currentRole.length) {
        setIsDeleting(true);
        setTypingSpeed(2000);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % ROLES.length);
        setTypingSpeed(500);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, isMounted, roleIndex, typingPaused, typingSpeed]);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  // roleIndex only advances once the previous word is fully deleted, so it always
  // names the word on screen. The article has to follow it: the prefix used to be a
  // hardcoded "a", which read as "I'm a Android Developer" for a third of the loop.
  const article = /^[aeiou]/i.test(ROLES[roleIndex]) ? 'an' : 'a';

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pb-20 sm:pb-24 md:pb-28"
    >
      {/* Background: the attack-surface hex field. It replaces the two hero photographs and
          the 20% black wash that went with them — the washes inside this layer are what hold
          the headline at contrast now. One layer covers every breakpoint, which is why the
          lg:hidden / hidden lg:block pair is gone, and it is inline SVG rather than a
          data-URI so the content policy's img-src needs no change. */}
      {/* The shatter lives on this layer and nowhere else, because this layer IS the glass.
          A press that lands on the headline, a button or the description belongs to the content
          column above, so it never reaches here and the pane stays whole. That is the whole
          rule, which is why there is no list of elements to exclude: the old handler sat on the
          <section> and tried to subtract the controls, and on a phone the description text
          slipped through the subtraction, so tapping a word scattered the sand and broke the
          glass at the same time. Click, not pointerdown: most phone scrolls begin with a touch
          inside this full-height area, and firing on touch-start would shatter the glass on the
          way down to the About card. */}
      <div
        className="absolute inset-0 overflow-hidden bg-[#070d1c]"
        aria-hidden="true"
        onClick={(event) => breakGlass(event)}
      >
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,rgba(34,211,238,0.22),transparent_60%)]" />
        <svg
          ref={svgRef}
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 ${HEX_VIEW_W} ${HEX_VIEW_H}`}
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* The ice. Four tiles of crystalline noise, each generated once by its own filter
                and then cached as a paint server; every shard is painted with one of them.
                Doing it this way rather than putting a live filter on each polygon is both
                cheaper and better looking: the browser rasterizes four 68-unit tiles instead of
                re-running turbulence on 64 pieces for every frame the shards move, and a
                pattern is painted in the element's own coordinate space, so the ice is baked
                into the piece and travels home with it. A filter on the group instead anchors
                the crystals to the pane, and then the frost slides through the glass as the
                pieces move, which is the tell that made the old coat look painted on.
                stitchTiles is what makes a 68-unit tile safe to repeat: without it the noise
                does not meet itself at the tile edge and every piece grows a visible seam. */}
            {ICE_SEEDS.map((seed, n) => (
              <filter
                key={`ice-${n}`}
                id={`hexIce${n}`}
                filterUnits="userSpaceOnUse"
                x="0"
                y="0"
                width={ICE_TILE}
                height={ICE_TILE}
              >
                <feTurbulence type="turbulence" baseFrequency="0.14" numOctaves="5" seed={seed} stitchTiles="stitch" result="ridge" />
                <feTurbulence type="turbulence" baseFrequency="0.42" numOctaves="2" seed={seed + 100} stitchTiles="stitch" result="sparkle" />
                <feBlend in="ridge" in2="sparkle" mode="screen" result="mixed" />
                {/* Thresholded hard rather than softened: the peaks of a ridged turbulence field
                    are where the crystals are, and everything else should stay clear glass. */}
                <feColorMatrix
                  in="mixed"
                  type="matrix"
                  values="0 0 0 0 0.92
                          0 0 0 0 0.96
                          0 0 0 0 1
                          3.0 1.2 0 0 -1.3"
                />
              </filter>
            ))}
            {ICE_SEEDS.map((_, n) => (
              <pattern key={`tile-${n}`} id={`hexIceTile${n}`} patternUnits="userSpaceOnUse" width={ICE_TILE} height={ICE_TILE}>
                <rect x="0" y="0" width={ICE_TILE} height={ICE_TILE} fill="#fff" filter={`url(#hexIce${n})`} />
              </pattern>
            ))}
          </defs>
          {HEX_CELLS.map((cell, i) => {
            const hot = hotCells.has(i);
            const shard = shatter ? shatter.shards.get(i) : null;
            const phase = shatter ? shatter.phase : null;
            // 'healing' is the only phase that puts the piece back, so the target of the
            // transform is the broken pose for every other one and CSS does the moving.
            const apart = Boolean(shard) && (phase === 'breaking' || phase === 'freezing');
            // Frost is on for two phases now, not one: it forms while the pieces lie where
            // they fell, stays on while they travel home, and only sublimates after they are
            // aligned. Ice that vanishes before the glass moves is the tell that gives it away.
            const frosted = Boolean(shard) && (phase === 'freezing' || phase === 'healing');
            return (
              <polygon
                key={i}
                points={cell.points}
                fill={hot ? 'rgba(244,63,94,0.20)' : 'rgba(34,211,238,0.05)'}
                stroke={hot ? 'rgba(251,113,133,0.85)' : 'rgba(103,232,249,0.38)'}
                strokeWidth={hot ? '1.8' : '1.2'}
                style={{
                  // 0.5 is the resting state, not decoration. A CSS animation owns the
                  // property while it runs but reverts to this when it ends, and the global
                  // reduced-motion reset collapses the wave to a single instant: without a
                  // base value every cell would park at full brightness instead of dimming
                  // to the level the wave starts and ends from.
                  opacity: apart ? 0.65 : 0.5,
                  // A shattered cell stops riding the wave: the animation owns opacity, so
                  // leaving it running would override the fade the fall needs.
                  animation: shard ? 'none' : `heroHexWave 4.2s ease-in-out ${cell.delay}s infinite`,
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  transform: apart
                    ? `translate(${shard.dx.toFixed(1)}px, ${shard.dy.toFixed(1)}px) rotate(${shard.rot.toFixed(1)}deg)`
                    : 'none',
                  transition: shard
                    ? `transform ${SHATTER_MOVE_MS}ms cubic-bezier(.18,.72,.28,1) ${shard.delay.toFixed(0)}ms, opacity ${SHATTER_MOVE_MS}ms ease ${shard.delay.toFixed(0)}ms, fill 700ms ease ${(shard.delay * 0.4).toFixed(0)}ms, stroke 700ms ease ${(shard.delay * 0.4).toFixed(0)}ms`
                    : 'fill 700ms ease, stroke 700ms ease',
                  ...(frosted
                    ? { fill: 'rgba(219,239,255,0.28)', stroke: 'rgba(238,248,255,0.50)' }
                    : {}),
                }}
              />
            );
          })}
          {/* The frost coat, drawn over the shards so it reads as ice on the glass rather than
              a colour swap. Each piece is painted with one of the four cached ice tiles and rides
              its shard's transform exactly, so the crystals travel home with the glass.
              The coat has no stroke of its own: the piece underneath already draws its edge, and
              an extra band on top outlined every shard like a cookie cutter. */}
          {shatter && (
            <g pointerEvents="none">
              {Array.from(shatter.shards.entries()).map(([i, shard]) => {
                const apart = shatter.phase === 'breaking' || shatter.phase === 'freezing';
                const icy = shatter.phase === 'freezing' || shatter.phase === 'healing';
                return (
                  <polygon
                    key={`frost-${i}`}
                    points={HEX_CELLS[i].points}
                    fill={`url(#hexIceTile${shard.pick})`}
                    style={{
                      opacity: icy ? 1 : 0,
                      transformBox: 'fill-box',
                      transformOrigin: 'center',
                      transform: apart
                        ? `translate(${shard.dx.toFixed(1)}px, ${shard.dy.toFixed(1)}px) rotate(${shard.rot.toFixed(1)}deg)`
                        : 'none',
                      // The coat arrives as a wave that starts at the strike and runs outward,
                      // and leaves on the same clock. Delay is proportional to distance, so the
                      // frost creeps across the burst instead of the whole patch appearing at once.
                      transition: `opacity ${icy ? 560 : 620}ms ease-out ${(shard.delay * (icy ? 0.75 : 0.3)).toFixed(0)}ms, transform ${SHATTER_MOVE_MS}ms cubic-bezier(.18,.72,.28,1) ${shard.delay.toFixed(0)}ms`,
                    }}
                  />
                );
              })}
            </g>
          )}
        </svg>
        {shatter?.impact && (
          <span
            aria-hidden="true"
            className="hero-impact"
            style={{ left: `${shatter.impact.x}px`, top: `${shatter.impact.y}px` }}
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(7,13,28,0.28),rgba(7,13,28,0.12)_40%,rgba(7,13,28,0.62))]" />
      </div>
      
      {/* Content. This column is a full-width block from the top of the hero to the bottom of
          the buttons, so on its own it would sit over the glass like a sheet of paper and leave
          nothing to click. pointer-events-none lets the empty space, the margins and the padding
          fall through to the pane, and each block below takes its own area back. The rule that
          results is the one being asked for: press a word and the sand scatters, press anywhere
          else and the glass breaks. */}
      <div className="pointer-events-none relative z-10 container mx-auto px-4 sm:px-6 text-center pt-20 sm:pt-24">
        {/* No perspective/preserve-3d here any more. The pair is a leftover from the old 3D card
            era and nothing in this column ever rotated, but a 3D rendering context changes what
            a descendant's backdrop-filter is allowed to sample, which is exactly what the CTA
            glass needs to frost. */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={staggerChildren}
        >
          {/* Main Heading */}
          <h1
            className="pointer-events-auto font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6"
            style={{
              textShadow: '0 0 15px rgba(0, 0, 0, 0.8), 2px 2px 6px rgba(0, 0, 0, 0.9)',
              filter: 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.8))',
            }}
          >
            Hi, I&apos;m <HeroName />
          </h1>

          {/* Typing Animation — click to pause and resume */}
          <div
            data-cursor-hover
            role="button"
            tabIndex={0}
            aria-pressed={typingPaused}
            aria-label={typingPaused ? 'Resume the rotating role text' : 'Pause the rotating role text'}
            title={typingPaused ? 'Click to resume' : 'Click to pause'}
            onClick={() => setTypingPaused(prev => !prev)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setTypingPaused(prev => !prev);
              }
            }}
            className="pointer-events-auto text-xl sm:text-2xl md:text-3xl font-light text-slate-300 mb-8 cursor-pointer select-none"
            style={{
              textShadow: '0 0 10px rgba(0, 0, 0, 0.8), 1px 1px 4px rgba(0, 0, 0, 0.9)'
            }}
          >
            <span 
              data-cursor-hover
              className="text-blue-400 font-bold cursor-pointer inline-block"
              style={{
                textShadow: '0 0 10px rgba(59, 130, 246, 0.4), 0 0 15px rgba(0, 0, 0, 0.8), 1px 1px 4px rgba(0, 0, 0, 0.9)',
                marginRight: '0.75rem'
              }}
            >I&apos;m {article}</span>
            <span 
              className="text-white font-medium"
              style={{
                textShadow: '0 0 10px rgba(0, 0, 0, 0.8), 1px 1px 4px rgba(0, 0, 0, 0.9)',
                WebkitTextStroke: '0.5px rgba(255, 255, 255, 0.1)'
              }}
            >
              {typedText}
              <span 
                style={{
                  textShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(59, 130, 246, 0.6)'
                }}
              >|</span>
            </span>
          </div>

          {/* Description */}
          <motion.p
            className="pointer-events-auto text-lg sm:text-xl font-bold text-white mx-auto mb-12 leading-relaxed max-w-xl sm:max-w-2xl lg:max-w-5xl"
            style={{
              // The slab is gone: no fill, no border, no frosted blur. Padding stays, so
              // removing the panel does not re-wrap the two lines.
              //
              // Three shadow layers: a 2px near-opaque halo that resolves the glyph edge
              // against a lit hex cell sitting directly behind it, a wider soft body, and a
              // 1px directional edge. Tinted with the hero's own navy rather than pure black,
              // so the halo reads as depth instead of grey smudge.
              //
              // Worth being precise about what a shadow does and does not buy: it cannot
              // change the measured contrast ratio, which is computed against the background.
              // The label is white now, which lifts that ratio from 5.33:1 (the blue it
              // replaced, against the same backdrop) to about 9.6:1. What the halo still fixes
              // is the thing the ratio cannot see: a bright cell pulsing under a letterform.
              textShadow: '0 0 2px rgba(7, 13, 28, 0.95), 0 0 7px rgba(7, 13, 28, 0.9), 0 1px 2px rgba(7, 13, 28, 0.95)',
              padding: '1rem 1.5rem',
            }}
            variants={fadeInUp}
          >
            <span className="block">
              <SandText text="Tech enthusiast and developer specialising in Android and web projects" />
            </span>
            <span className="block mt-[1.625em]">
              <SandText text="I develop modern, secure, and responsive web apps with clean code and user-centric designs" />
            </span>
          </motion.p>

          {/* CTA Buttons. Sized here rather than in .btn-primary because this is the one place
              the buttons are the point of the screen, and the other seven CTAs are inside cards
              where the current scale is right. The utilities win on purpose: Tailwind's utilities
              layer outranks the components layer, so px-10 py-4 text-lg overrides the px-8 py-3.5
              16px that .btn-primary applies, and no call site anywhere else has to know. */}
          <motion.div 
            className="pointer-events-auto flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={fadeInUp}
          >
            <Link href="#services" scroll={false} onClick={(event) => scrollToId('services', event)} className="btn-primary px-10 py-4 text-lg min-w-[240px]">
              View My Services
            </Link>
            <Link href="#contact" scroll={false} onClick={(event) => scrollToId('contact', event)} className="btn-primary px-10 py-4 text-lg min-w-[240px]">
              Get In Touch
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 