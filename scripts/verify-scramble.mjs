#!/usr/bin/env node
/**
 * Proves the hero scramble always resolves.
 *
 * HeroName's decode is rAF plumbing around one pure decision, and the only failure that
 * would be seen by a visitor is the name stopping as gibberish. A browser check cannot
 * catch that reliably — the animation runs for 900ms and a probe that arrives after it
 * sees a correct name whether or not the logic is sound. So the frame function is
 * asserted directly, including against a hostile random source.
 *
 * Run: node scripts/verify-scramble.mjs   (no server needed)
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// src/lib is copied into a temp directory declared as ESM, so relative imports inside
// these files keep resolving as they grow.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'scramble-'));
fs.cpSync(path.join(REPO, 'src/lib'), tmp, { recursive: true });
fs.writeFileSync(path.join(tmp, 'package.json'), JSON.stringify({ type: 'module' }));
const { scrambleFrame } = await import(pathToFileURL(path.join(tmp, 'scramble.js')).href);

const results = [];
const check = (label, pass, detail) => results.push({ label, pass, detail });

const WORD = 'Amirhadi';
const FULL = 'Amirhadi Borjian';
const half = () => 0.5;

// Control: without this the "it scrambles" assertions below would pass for a function
// that simply returned the input.
const start = scrambleFrame(WORD, 0, half);
check('CONTROL: progress 0 really does scramble', start !== WORD && start.length === WORD.length, start);
check('CONTROL: progress 1 really does resolve', scrambleFrame(WORD, 1, half) === WORD,
  scrambleFrame(WORD, 1, half));

check('progress 1 on the full name is exact', scrambleFrame(FULL, 1, half) === FULL,
  scrambleFrame(FULL, 1, half));

// Walk the whole timeline the way the component does and assert the end state.
let walked = '';
for (let p = 0; p <= 1.0001; p += 0.01) walked = scrambleFrame(FULL, p, half);
check('walking the timeline ends on the real text', walked === FULL, walked);

// Left-to-right settle.
const monotonic = [0.2, 0.4, 0.6, 0.8].every((p) => {
  const settled = Math.floor(p * FULL.length);
  const frame = scrambleFrame(FULL, p, half);
  return frame.slice(0, settled) === FULL.slice(0, settled);
});
check('settled characters appear left to right, never out of order', monotonic,
  [0.2, 0.4, 0.6, 0.8].map((p) => scrambleFrame(FULL, p, half)).join(' '));

// Derived rather than hardcoded: "Amirhadi" is 8 characters, so the space sits at
// index 8, and an assertion written against the wrong index would fail for the wrong
// reason.
const spacePositions = [...FULL].map((c, i) => (c === ' ' ? i : -1)).filter((i) => i >= 0);
const spaceOk = [0, 0.25, 0.5, 0.75, 1].every((p) => {
  const frame = scrambleFrame(FULL, p, half);
  return spacePositions.every((i) => frame[i] === ' ')
    && [...FULL].every((c, i) => (c === ' ' ? true : frame[i] !== ' '));
});
check('spaces are preserved and never introduced', spaceOk, scrambleFrame(FULL, 0.5, half));

const lengths = [];
for (let p = 0; p <= 1; p += 0.05) lengths.push(scrambleFrame(FULL, p, half).length);
check('no frame ever changes the length of the name', lengths.every((n) => n === FULL.length),
  [...new Set(lengths)].join(','));

// Out-of-range and nonsense progress.
for (const [label, value, want] of [
  ['progress above 1', 1.5, FULL],
  ['negative progress', -3, scrambleFrame(FULL, 0, half)],
  ['NaN progress', Number.NaN, FULL],
  ['undefined progress', undefined, FULL],
]) {
  check(`clamped: ${label}`, scrambleFrame(FULL, value, half) === want,
    String(scrambleFrame(FULL, value, half)));
}

// A random source that misbehaves must not produce undefined, "null" or holes.
for (const [label, rng] of [
  ['NaN', () => Number.NaN],
  ['far above 1', () => 5],
  ['negative', () => -1],
  ['undefined', () => undefined],
  ['a string', () => 'nope'],
]) {
  const frame = scrambleFrame(FULL, 0.5, rng);
  const clean = frame.length === FULL.length && !/undefined|null|NaN/.test(frame)
    && [...frame].every((c) => c === ' ' || /[A-Za-z$#@%&*<>/\\{}[\]]/.test(c));
  check(`hostile random source: ${label}`, clean, frame);
}

check('an empty word stays empty', scrambleFrame('', 0.5, half) === '', JSON.stringify(scrambleFrame('', 0.5, half)));
check('a single space survives', scrambleFrame(' ', 0, half) === ' ', JSON.stringify(scrambleFrame(' ', 0, half)));

fs.rmSync(tmp, { recursive: true, force: true });
const failures = results.filter((r) => !r.pass);
if (failures.length) {
  console.error(`Scramble checks: ${results.length - failures.length}/${results.length} passed`);
  for (const f of failures) console.error(`  FAIL ${f.label} -> ${f.detail}`);
  console.error('\nIf the hero name can stop as gibberish, it is caught here.');
  process.exit(1);
}
console.log(`Scramble checks: all ${results.length} passed.`);
