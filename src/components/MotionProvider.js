'use client';

import { MotionConfig } from 'framer-motion';

// Turns off transform/layout animation site-wide for visitors whose OS asks for
// reduced motion; opacity fades still run. Without this every motion.div keeps
// sliding in regardless of the preference.
export default function MotionProvider({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
