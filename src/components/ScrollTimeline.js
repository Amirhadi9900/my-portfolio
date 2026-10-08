'use client';

import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { scrollToId } from '../lib/scroll-to-id';
import { getActiveSectionId } from '../lib/active-section';

const SECTIONS = [
  { id: 'hero', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4' },
  { id: 'about', label: 'About', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'projects', label: 'Projects', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
  { id: 'skills', label: 'Skills', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { id: 'services', label: 'Services', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A11.937 11.937 0 013 9c0 5.591 3.824 10.29 9 11.626 5.176-1.337 9-6.03 9-11.626 0-1.042-.133-2.052-.382-3.016z' },
  { id: 'contact', label: 'Contact', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
];

export default function ScrollTimeline() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0);

      // Same rule the header nav uses, so the dot and the underline always agree.
      const activeId = getActiveSectionId();
      const found = SECTIONS.findIndex((section) => section.id === activeId);
      setActiveIndex(found < 0 ? 0 : found);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className="fixed left-5 xl:left-7 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center"
      aria-label="Page sections"
    >
      <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-200/80 shadow-[0_8px_40px_rgba(0,0,0,0.12)] p-2.5">
        {/* Progress track behind buttons. The fill is nested so its percentage
            resolves against the track rather than the whole card. */}
        <div className="absolute left-1/2 -translate-x-1/2 top-5 bottom-14 w-[2px] rounded-full bg-gray-200">
          <div
            className="absolute left-0 top-0 w-full rounded-full bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ height: `${Math.round(scrollProgress * 100)}%` }}
          />
        </div>

        <div className="relative flex flex-col gap-3">
          {SECTIONS.map((section, index) => {
            const isActive = index === activeIndex;
            const isPast = index < activeIndex;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollToId(section.id)}
                aria-label={`Go to ${section.label}`}
                aria-current={isActive ? 'true' : undefined}
                className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_4px_15px_rgba(59,130,246,0.4)]'
                    : isPast
                      ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                }`}
              >
                <svg
                  className="w-[18px] h-[18px]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={isActive ? 2.2 : 1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={section.icon} />
                </svg>

                {isActive && !reduceMotion && (
                  <motion.span
                    className="absolute inset-0 rounded-xl border-2 border-blue-400/50"
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 1.25, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Scroll percentage at bottom */}
        <div className="mt-4 pt-2 border-t border-gray-200/60 text-center">
          <span className="text-[10px] font-mono font-semibold text-gray-500 tabular-nums">
            {Math.round(scrollProgress * 100)}%
          </span>
        </div>
      </div>
    </nav>
  );
}
