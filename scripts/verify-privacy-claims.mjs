#!/usr/bin/env node
/**
 * Checks the privacy notice against the source it describes.
 *
 * This exists because the notice was wrong on 2026-09-30 in the way that no other
 * script here could catch: it said the contact endpoint "looks at three headers and
 * nothing else" while the code read six. Nothing executed was broken, so the build,
 * the XSS suite and the CSP checks all stayed green while a published legal statement
 * about someone's personal data was false. The failure mode is prose drifting away from
 * code, and the only guard against it is to read the code and the prose in one run.
 *
 * SCOPE, and it is deliberately narrow. It can only check claims that reduce to
 * something enumerable in the tree: which request headers the endpoint reads, which
 * client storage APIs exist, whether a persistence layer is imported anywhere, the
 * retention figure the rate-limit constants imply, and whether the consent control is
 * real on both sides. It CANNOT check a claim about a third party's internals ("Vercel
 * keeps this for 24 hours"), a claim about my own behaviour ("I delete it when you
 * ask"), or a claim about the firewall dashboard. Those stay verifiable only by hand.
 *
 * Run: node scripts/verify-privacy-claims.mjs   (no server needed)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NOTICE_PATH = 'src/app/privacy/page.js';
const ROUTE_PATH = 'src/app/api/contact/route.js';
const SECURITY_PATH = 'src/lib/contact-security.js';
const CONTACT_PATH = 'src/components/Contact.js';

const read = (rel) => fs.readFileSync(path.join(REPO, rel), 'utf8');

// The notice writes typographic characters as \u2019 escapes inside single-quoted
// strings, so the raw source is not searchable text. Decode them first or every
// phrase check would fail on an apostrophe.
const decode = (src) =>
  src.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.js$/.test(entry.name)) out.push(full);
  }
  return out;
}

const SRC_FILES = walk(path.join(REPO, 'src'));
const notice = decode(read(NOTICE_PATH));
const route = read(ROUTE_PATH);
const security = read(SECURITY_PATH);
const contact = read(CONTACT_PATH);

const results = [];
const check = (label, pass, detail) => results.push({ label, pass, detail });

const NUMBER_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };

// ---------------------------------------------------------------- own parser
// A regex that silently matches nothing makes every check below pass vacuously, so
// the parser is asserted before anything depends on it.
const headerReads = [...new Set([...route.matchAll(/request\.headers\.get\(\s*'([^']+)'/g)].map((m) => m[1].toLowerCase()))];

check('header parser found the reads the file visibly contains', headerReads.length >= 4,
  `parsed ${headerReads.length}: ${headerReads.join(', ') || 'NONE'}`);
check('notice source decoded to searchable text', notice.length > 4000 && notice.includes('Your IP address'),
  `${notice.length} chars`);

// ------------------------------------------------------- request header claims
// Each header the endpoint reads has to be named in the notice, in these words.
const HEADER_WORDS = {
  host: 'the host',
  origin: 'Origin',
  referer: 'Referer',
  'x-forwarded-for': 'forwarded-for',
  'content-type': 'content type',
  'content-length': 'content length',
};

const unnamed = headerReads.filter((h) => !HEADER_WORDS[h]);
check('every header the route reads has a word the notice can use', unnamed.length === 0,
  unnamed.length ? `no phrase defined for: ${unnamed.join(', ')}` : `${headerReads.length} headers mapped`);

// Unmapped headers are reported by the check above, not here, so this one stays about
// prose coverage rather than echoing an undefined phrase.
const missing = headerReads.filter((h) => HEADER_WORDS[h] && !notice.includes(HEADER_WORDS[h]));
check('the notice names each header the contact endpoint reads', missing.length === 0,
  missing.length ? `not mentioned in prose: ${missing.map((h) => `${h} ("${HEADER_WORDS[h]}")`).join('; ')}` : 'all named');

const countMatch = notice.match(/looks at ([a-z]+) request headers/i);
check('the notice states how many headers it is about to enumerate', Boolean(countMatch),
  countMatch ? `"looks at ${countMatch[1]} request headers"` : 'phrase not found');
if (countMatch) {
  const claimed = NUMBER_WORDS[countMatch[1].toLowerCase()];
  check('the stated header count matches the code', claimed === headerReads.length,
    `notice says ${countMatch[1]} (${claimed ?? 'unreadable'}), route reads ${headerReads.length}`);
}

// The notice claims the endpoint does NOT read the TLS fingerprint or the user agent.
const notRead = ['x-vercel-ja4-digest', 'x-vercel-ja3-digest', 'user-agent'];
const actuallyRead = notRead.filter((h) => headerReads.includes(h));
check('metadata the notice disclaims really is unread', actuallyRead.length === 0,
  actuallyRead.length ? `route reads ${actuallyRead.join(', ')}` : 'no fingerprint or user-agent read');

// --------------------------------------------------------- storage and storage
const storageApis = [
  ['localStorage', /\blocalStorage\s*[.[=]/],
  ['sessionStorage', /\bsessionStorage\s*[.[=]/],
  ['indexedDB', /\bindexedDB\b/],
];
const usedApis = storageApis.filter(([, re]) => SRC_FILES.some((f) => re.test(fs.readFileSync(f, 'utf8')))).map(([n]) => n);
check('only the storage API the notice describes is used', usedApis.length === 1 && usedApis[0] === 'localStorage',
  `found: ${usedApis.join(', ') || 'none'}`);
check('the notice says the stored preference is a sound choice', notice.includes('sound effects on the contact form are muted'),
  'phrase not found');

const keyNames = [...new Set(
  SRC_FILES.flatMap((f) => [...fs.readFileSync(f, 'utf8').matchAll(/localStorage(?:\.\w+)\(\s*([A-Za-z_$][\w$]*)/g)].map((m) => m[1])),
)];
check('all storage access goes through one key', keyNames.length === 1,
  `keys: ${keyNames.join(', ') || 'none parsed'}`);

const cookieWrites = SRC_FILES.filter((f) => /document\.cookie\s*=/.test(fs.readFileSync(f, 'utf8')));
check('the site really does set no cookie of its own', cookieWrites.length === 0,
  cookieWrites.length ? `writes document.cookie in ${cookieWrites.map((f) => path.relative(REPO, f)).join(', ')}` : 'no document.cookie assignment');

// --------------------------------------------- retention figure from constants
const windowMatch = route.match(/RATE_WINDOW_MS\s*=\s*([\d_]+)/);
const sweepMatch = route.match(/setInterval\([\s\S]*?\},\s*RATE_WINDOW_MS\s*\*\s*(\d+)\s*\)/);
check('rate-limit constants are still where the check expects them', Boolean(windowMatch && sweepMatch),
  `window=${windowMatch?.[1] ?? '?'} sweepMultiplier=${sweepMatch?.[1] ?? '?'}`);
if (windowMatch && sweepMatch) {
  const windowMs = Number(windowMatch[1].replace(/_/g, ''));
  const worstCaseMs = windowMs + windowMs * Number(sweepMatch[1]);
  const words = Object.entries(NUMBER_WORDS).find(([, n]) => n === Math.ceil(worstCaseMs / 60000))?.[0];
  const stated = [...notice.matchAll(/(\w+) minutes at the very most/g)].map((m) => m[1]);
  check('the retention bound in the notice matches the cleanup maths', Boolean(words) && stated.length === 1 && stated[0] === words,
    `code implies ${words ?? Math.ceil(worstCaseMs / 60000)} minutes (window ${windowMs / 1000}s + sweep ${windowMs * Number(sweepMatch[1]) / 1000}s), notice says [${stated.join(', ') || 'nothing'}]`);
}

// ------------------------------------------------ no persistence anywhere
const persistence = /node:fs|require\(\s*['"]fs|@upstash|@vercel\/(?:blob|kv|postgres)|prisma|mongoose|sqlite/;
const persisted = SRC_FILES.filter((f) => persistence.test(fs.readFileSync(f, 'utf8')));
check('nothing in the request path can store what you type', persisted.length === 0,
  persisted.length ? `persistence import in ${persisted.map((f) => path.relative(REPO, f)).join(', ')}` : 'no file or database layer in src/');
check('the notice claims storage-free submission in those words', notice.includes('Nothing you type is stored anywhere on this site'),
  'phrase not found');

// ------------------------------------------------------- consent is enforced
check('the form renders a real consent checkbox', /type="checkbox"/.test(contact) && /name="consent"/.test(contact),
  'checkbox with name="consent" not found in Contact.js');
check('consent is enforced server-side, not only in the browser', /consent\s*!==\s*true/.test(security),
  'no server-side consent rejection in contact-security.js');
check('the notice describes consent as a ticked box', notice.includes('ticking the box above the Send button'),
  'phrase not found');

// ------------------------------------------------------------- summary
const failures = results.filter((r) => !r.pass);
if (failures.length) {
  console.error(`Privacy-claim checks: ${results.length - failures.length}/${results.length} passed`);
  for (const f of failures) console.error(`  FAIL ${f.label} -> ${f.detail}`);
  console.error('\nA failing check here means published text about visitors\' data no longer matches the code.');
  console.error('Fix the notice (or the code), do not relax the phrase list at the top of this script.');
  process.exit(1);
}
console.log(`Privacy-claim checks: all ${results.length} passed.`);
