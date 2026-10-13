# Custom cursor implementation — terminal caret

## Context for the implementing agent

This is a portfolio website for a fullstack developer moving toward a SOC
analyst role. The site's design direction is deliberately technical and
restrained — no gradients, no glow effects, no trendy AI-generated aesthetic.

Task: replace the native pointer with a custom "terminal caret" cursor —
a blinking block, styled like a CLI text cursor, that morphs into a wider
solid state when hovering interactive elements. It should feel functional,
not decorative.

**Before writing any code:** inspect the actual project structure (framework,
bundler, existing CSS/JS entry points, whether an accent color CSS variable
already exists) and adapt file paths, import syntax, and integration method
to match. The code below is framework-agnostic vanilla CSS/JS — wire it into
whatever build system this repo actually uses rather than assuming a plain
HTML/CSS/JS layout.

---

## Design spec

### States

| State | Shape | Width | Color | Behavior |
|---|---|---|---|---|
| Idle | thin vertical bar | 2px × 20px | neutral / secondary text color | blinks at 1s interval (CLI-style, hard on/off, not fade) |
| Hover (link, button, `[data-cursor-hover]`) | solid block | 10px × 20px | accent color | stops blinking, stays solid while hovered |
| Active (mousedown) | solid block, slightly compressed | 10px × 16px | accent color, darker/emphasized shade | brief visual "press" feedback |
| Off-window | — | — | — | opacity 0 when pointer leaves the viewport |

### Motion
- No easing/lag on the primary position — the caret should track the real
  pointer position 1:1 (a laggy trailing cursor undermines the "precise
  instrument" feel this is going for).
- Only the blink and the hover-morph are animated (via CSS transition on
  width/color, ~120ms ease-out).

### Color
Reference the site's existing accent CSS variable if one exists
(e.g. `--accent-color` / `--accent`) rather than hardcoding a hex value —
this cursor should automatically match whichever accent (cyan or red) the
rest of the site ends up using. If no such variable exists yet, create one
at `:root` and use it here and in the button/link hover states elsewhere,
so there's a single source of truth:

```css
:root {
  --accent-color: #22d3ee; /* placeholder — replace with the site's chosen accent */
}
```

---

## Accessibility & compatibility requirements

These are non-negotiable, not nice-to-haves:

1. **Touch/coarse pointers:** custom cursor must not activate at all on
   touch devices. Gate everything behind `matchMedia('(pointer: fine)')`.
   Do not hide the native cursor or attach mousemove listeners when this
   check fails.
2. **`prefers-reduced-motion: reduce`:** disable the blink animation. Show
   the caret as a static bar instead of removing the feature entirely.
3. **Keyboard navigation:** this is a mouse-only enhancement. Do not modify
   or interfere with `:focus` / `:focus-visible` outlines — keyboard users
   must keep their existing focus indicators untouched.
4. **Graceful degradation:** if JS fails to load for any reason, the native
   cursor must still be visible (i.e. don't set `cursor: none` from CSS
   alone — only hide it once the JS confirms it's running and the pointer
   is fine).
5. **Cross-browser:** verify in Chrome, Edge, Firefox, Brave, Zen, and
   Safari specifically — Safari in particular has historically had quirks
   with `cursor: none` and fixed-position elements during scroll.

---

## Implementation steps

1. **Locate integration points.** Find the site's main CSS entry point and
   main JS entry point (or equivalent component if this is a framework-based
   site). Note whether there's already a global accent color variable.

2. **Add the CSS.** Create (or append to an existing) stylesheet with the
   cursor's visual styles:

   ```css
   @media (pointer: fine) {
     body.custom-cursor-active {
       cursor: none;
     }
     body.custom-cursor-active a,
     body.custom-cursor-active button,
     body.custom-cursor-active [data-cursor-hover] {
       cursor: none;
     }
   }

   .terminal-caret {
     position: fixed;
     top: 0;
     left: 0;
     width: 2px;
     height: 20px;
     background: var(--text-secondary-color, #8a8f98);
     pointer-events: none;
     z-index: 9999;
     transform: translate(-1px, -2px);
     transition: width 120ms ease-out, height 120ms ease-out,
       background-color 120ms ease-out;
     will-change: transform;
   }

   .terminal-caret.is-blinking {
     animation: caret-blink 1s step-start infinite;
   }

   .terminal-caret.is-hover {
     width: 10px;
     height: 20px;
     background: var(--accent-color, #22d3ee);
     animation: none;
     opacity: 1;
   }

   .terminal-caret.is-active {
     height: 16px;
   }

   .terminal-caret.is-hidden {
     opacity: 0;
   }

   @keyframes caret-blink {
     0%, 49.99% { opacity: 1; }
     50%, 100% { opacity: 0; }
   }

   @media (prefers-reduced-motion: reduce) {
     .terminal-caret.is-blinking {
       animation: none;
       opacity: 1;
     }
   }
   ```

3. **Add the JS.** Create (or append to) the main script:

   ```js
   (function initTerminalCaret() {
     const isFinePointer = window.matchMedia('(pointer: fine)').matches;
     const prefersReducedMotion = window.matchMedia(
       '(prefers-reduced-motion: reduce)'
     ).matches;

     if (!isFinePointer) return;

     const caret = document.createElement('div');
     caret.className = 'terminal-caret';
     if (!prefersReducedMotion) caret.classList.add('is-blinking');
     document.body.appendChild(caret);
     document.body.classList.add('custom-cursor-active');

     const hoverSelector = 'a, button, [role="button"], [data-cursor-hover]';

     window.addEventListener('mousemove', (e) => {
       caret.style.transform = `translate(${e.clientX - 1}px, ${
         e.clientY - 2
       }px)`;
       caret.classList.remove('is-hidden');
     });

     document.addEventListener('mouseleave', () => {
       caret.classList.add('is-hidden');
     });

     document.addEventListener('mouseover', (e) => {
       if (e.target.closest(hoverSelector)) {
         caret.classList.add('is-hover');
         caret.classList.remove('is-blinking');
       }
     });

     document.addEventListener('mouseout', (e) => {
       if (e.target.closest(hoverSelector)) {
         caret.classList.remove('is-hover');
         if (!prefersReducedMotion) caret.classList.add('is-blinking');
       }
     });

     document.addEventListener('mousedown', () => {
       caret.classList.add('is-active');
     });

     document.addEventListener('mouseup', () => {
       caret.classList.remove('is-active');
     });
   })();
   ```

4. **Wire it in.** Link the stylesheet and script from the site's HTML
   entry point (or import them via the framework's normal mechanism).
   Ensure the script runs after `document.body` exists (defer, or place
   before `</body>`, or run inside a framework mount/lifecycle hook).

5. **Set `data-cursor-hover`** on any custom interactive elements that
   aren't native `<a>`/`<button>` tags (e.g. custom card components) so
   they trigger the hover state too.

6. **Manual QA pass** against the checklist below before considering this
   done.

---

## Testing checklist

- [ ] Caret tracks the pointer with no visible lag on a standard laptop trackpad
- [ ] Blinks at idle, holds solid on hover over links/buttons
- [ ] Native cursor is fully hidden on desktop, fully restored/untouched on
      a touch device (test with a phone or `pointer: coarse` emulation in
      devtools)
- [ ] `prefers-reduced-motion: reduce` (toggle in OS settings) stops the
      blink but keeps the caret visible
- [ ] Tab-key navigation still shows normal focus outlines, unaffected by
      the caret
- [ ] Verified in Chrome, Edge, Firefox, Brave, Zen, Safari
- [ ] No layout shift or scroll jank introduced (caret is `position: fixed`,
      should not affect document flow)
- [ ] If JS is blocked/fails, native cursor still shows (no dead `cursor: none`
      left behind by CSS alone)

## Acceptance criteria

The feature is done when the caret behaves as specified above across all
target browsers, degrades safely on touch devices and with JS disabled,
respects reduced-motion preference, and uses the site's actual accent color
variable rather than a hardcoded value.
