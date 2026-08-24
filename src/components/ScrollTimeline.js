'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { scrollToId } from '../lib/scroll-to-id';

const SECTIONS = [
  { id: 'hero', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4' },
  { id: 'about', label: 'About', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'projects', label: 'Work', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
  { id: 'skills', label: 'Skills', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { id: 'contact', label: 'Contact', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
];

export default function ScrollTimeline() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0);

      let current = 0;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight / 3) {
          current = i;
          break;
        }
      }
      setActiveIndex(current);
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
      <div className="relative bg-white/70 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-[0_8px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] p-2.5">
        {/* Progress track behind buttons */}
        <div className="absolute left-1/2 -translate-x-1/2 top-5 bottom-14 w-[2px] rounded-full bg-gray-200 dark:bg-gray-700/50" />
        <div
          className="absolute left-1/2 -translate-x-1/2 top-5 w-[2px] rounded-full bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500 ease-out"
          style={{ height: `calc(${scrollProgress * 100}% - 56px)`, maxHeight: 'calc(100% - 56px)' }}
        />

        <div className="relative flex flex-col gap-3">
          {SECTIONS.map((section, index) => {
            const isActive = index === activeIndex;
            const isPast = index < activeIndex;
            return (
              <div key={section.id} className="relative">
                <button
                  onClick={() => scrollToId(section.id)}
                  aria-label={`Go to ${section.label}`}
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_4px_15px_rgba(59,130,246,0.4)]'
                      : isPast
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                        : 'bg-gray-100 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/60 hover:text-gray-700 dark:hover:text-gray-300'
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

                  {isActive && (
                    <motion.span
                      className="absolute inset-0 rounded-xl border-2 border-blue-400/50"
                      initial={{ scale: 1, opacity: 0.6 }}
                      animate={{ scale: 1.25, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </button>

              </div>
            );
          })}
        </div>

        {/* Scroll percentage at bottom */}
        <div className="mt-4 pt-2 border-t border-gray-200/60 dark:border-gray-700/40 text-center">
          <span className="text-[10px] font-mono font-semibold text-gray-500 dark:text-gray-400 tabular-nums">
            {Math.round(scrollProgress * 100)}%
          </span>
        </div>
      </div>
    </nav>
  );
}
