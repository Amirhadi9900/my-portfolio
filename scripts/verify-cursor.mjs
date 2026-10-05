#!/usr/bin/env node
/**
 * Guards the invariants that make the custom cursor track the pointer instantly.
 *
 * Users reported a short delay in cursor movement on 2026-10-01. The cause was not
 * the JavaScript, which writes the position as a custom property per mousemove and
 * costs about 0.02ms per event. It was one CSS declaration: `.prompt-cursor` had
 * `transform` in its `transition` list, and that element's transform IS the pointer
 * position. Measured against a hidden tab, setting --cursor-x to 500px still reported
 * the previous coordinates, which only arrived ~80ms later.
 *
 * This kind of regression is invisible in a diff and unfalsifiable at runtime for
 * anyone not looking for it, so it is asserted against the stylesheet here.
 *
 * Run: node scripts/verify-cursor.mjs   (no server needed)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CSS = fs.readFileSync(path.join(REPO, 'src/styles/globals.css'), 'utf8');

const results = [];
const check = (label, pass, detail) => results.push({ label, pass, detail });

/** Return the declaration block for a top-level rule, or null. */
function ruleBody(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = CSS.match(new RegExp(`(?:^|\\n)\\s*${escaped}\\s*\\{([\\s\\S]*?)\\n\\}`));
  return match ? match[1] : null;
}

const cursor = ruleBody('.prompt-cursor');
const mark = ruleBody('.prompt-cursor-mark');
const active = ruleBody('.prompt-cursor.is-active');
const activeMark = ruleBody('.prompt-cursor.is-active .prompt-cursor-mark');

// Self-validation: a selector that stops matching would make every check below pass
// for the wrong reason.
check('the cursor rules were all located in globals.css',
  Boolean(cursor) && Boolean(mark) && Boolean(active) && Boolean(activeMark),
  `cursor:${Boolean(cursor)} mark:${Boolean(mark)} active:${Boolean(active)} activeMark:${Boolean(activeMark)}`);

const decl = (block, property) => {
  const m = block && block.match(new RegExp(`(?:^|;|\\n)\\s*${property}\\s*:\\s*([^;]+)`));
  return m ? m[1].trim() : null;
};

const cursorTransition = decl(cursor, 'transition');
check('.prompt-cursor declares a transition', Boolean(cursorTransition), cursorTransition ?? 'none found');
check('.prompt-cursor does NOT transition transform',
  Boolean(cursorTransition) && !/\btransform\b/.test(cursorTransition),
  `transition: ${cursorTransition}`);
check('.prompt-cursor still fades with an opacity transition',
  Boolean(cursorTransition) && /\bopacity\b/.test(cursorTransition),
  `transition: ${cursorTransition}`);

check('.prompt-cursor is position: fixed', decl(cursor, 'position') === 'fixed', decl(cursor, 'position') ?? 'none');
check('.prompt-cursor keeps will-change: transform',
  decl(cursor, 'will-change') === 'transform', decl(cursor, 'will-change') ?? 'none');
check('.prompt-cursor positions itself from the pointer custom properties',
  /translate3d\(\s*calc\(var\(--cursor-x\)/.test(decl(cursor, 'transform') ?? ''),
  decl(cursor, 'transform') ?? 'none');

// Press feedback must live on the child, where easing it cannot move the tip.
const activeTransform = decl(active, 'transform');
check('the pressed state does not scale the position element',
  Boolean(activeTransform) && !/scale\(/.test(activeTransform),
  `is-active transform: ${activeTransform}`);
check('the pressed state scales the mark instead',
  /scale\(/.test(decl(activeMark, 'transform') ?? ''),
  decl(activeMark, 'transform') ?? 'none');
check('the mark carries the press easing',
  /\btransform\b/.test(decl(mark, 'transition') ?? ''),
  `mark transition: ${decl(mark, 'transition') ?? 'none'}`);

// Reduced motion should still silence every cursor animation, including the new one.
const reducedBlock = CSS.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/)?.[1] ?? '';
check('reduced motion disables the mark transition too',
  reducedBlock.includes('.prompt-cursor-mark'),
  reducedBlock.trim().split('\n').slice(0, 4).join(' ').slice(0, 90) || 'no reduced-motion block');

const failures = results.filter((r) => !r.pass);
if (failures.length) {
  console.error(`Cursor-tracking checks: ${results.length - failures.length}/${results.length} passed`);
  for (const f of failures) console.error(`  FAIL ${f.label} -> ${f.detail}`);
  console.error('\nIf transform is transitioned on .prompt-cursor, the cursor trails the pointer by that duration.');
  process.exit(1);
}
console.log(`Cursor-tracking checks: all ${results.length} passed.`);
