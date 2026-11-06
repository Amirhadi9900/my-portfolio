// The physics behind the sand text, kept pure and separate so it can be tested with plain
// Node. Nothing in here touches the DOM: it takes the letters of a word plus the pointer's
// velocity and returns where each grain should land. The component just applies it.

// How far a grain is thrown, in pixels, from the pointer's speed in px/s. Deliberately
// small: the first version reached 364px and the letters looked like they were flying
// rather than shifting like sand. Even a hard flick now moves a grain about two letter
// widths.
function scatterDistance(speed) {
  const clamped = Math.min(Math.max(speed, 0), 1800);
  return 8 + clamped * 0.03;
}

// A unit direction for the grains to travel in. Below a crawl there is no meaningful
// movement to follow, so the sand falls with a sideways lean instead of hanging in place.
function throwDirection(vx, vy, rand = Math.random) {
  const speed = Math.hypot(vx, vy);
  if (speed < 40) {
    const lean = (rand() - 0.5) * 1.4;
    const len = Math.hypot(lean, 1);
    return { x: lean / len, y: 1 / len, speed };
  }
  return { x: vx / speed, y: vy / speed, speed };
}

// One entry per character: where it goes, how far it turns, and when it leaves and returns.
// `letters` is the word already split into characters.
export function planScatter(letters, velocity, rand = Math.random) {
  const dir = throwDirection(velocity.vx, velocity.vy, rand);
  const base = scatterDistance(velocity.speed ?? Math.hypot(velocity.vx, velocity.vy));
  return letters.map((ch, i) => {
    // Per-grain jitter is what stops the word moving as one rigid block: real sand grains
    // part ways with each other the moment they are disturbed.
    const spread = 0.6 + rand() * 0.7;
    const angle = (rand() - 0.5) * 0.7;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dxr = dir.x * cos - dir.y * sin;
    const dyr = dir.x * sin + dir.y * cos;
    const dist = base * spread;
    return {
      ch,
      dx: dxr * dist,
      // Gravity: whatever direction the pointer threw them, sand still falls.
      dy: dyr * dist + dist * 0.5,
      rot: (rand() - 0.5) * 2 * (25 + rand() * 65),
      outDelay: i * 18 + rand() * 70,
      // Reassembly runs outside-in and unevenly, so the letters walk home rather than
      // snapping back into a word on the same frame.
      backDelay: (letters.length - i) * 34 + rand() * 110,
    };
  });
}

// The two transforms the component applies: the thrown pose and the resting pose.
export function grainStyle(grain, phase) {
  if (phase === 'out') {
    return {
      transform: `translate(${grain.dx.toFixed(1)}px, ${grain.dy.toFixed(1)}px) rotate(${grain.rot.toFixed(1)}deg)`,
      opacity: 0.9,
      transition: `transform 560ms cubic-bezier(.22,.7,.3,1) ${grain.outDelay.toFixed(0)}ms, opacity 560ms ease ${grain.outDelay.toFixed(0)}ms`,
      willChange: 'transform',
    };
  }
  return {
    transform: 'none',
    opacity: 1,
    transition: `transform 1000ms cubic-bezier(.3,0,.2,1) ${grain.backDelay.toFixed(0)}ms, opacity 1000ms ease ${grain.backDelay.toFixed(0)}ms`,
  };
}
