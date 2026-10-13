'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function About() {
  const [isFlipped, setIsFlipped] = useState(false);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section id="about" className="section py-16 md:py-28 bg-gradient-to-b from-gray-50/80 to-gray-100/90 relative overflow-hidden scroll-mt-28">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-70" />

      <div className="container relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center mb-12 md:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <h2 className="font-subheading text-3xl sm:text-5xl md:text-6xl font-semibold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            About Me
          </h2>
          <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed subtitle-blink">
            Click the card to discover who I am
          </p>
        </motion.div>

        <motion.div
          className="flex justify-center px-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <div className="flex flex-col items-center w-full max-w-md mx-auto">
            <div className="flip-card w-full aspect-[4/5] sm:aspect-[3/4] rounded-2xl">
              <div className={`flip-card-inner ${isFlipped ? 'is-flipped' : ''}`}>
                {/* Front — Photo */}
                <button
                  type="button"
                  className="flip-card-face flip-card-front backdrop-blur-sm rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(8,112,184,0.15)] cursor-pointer"
                  onClick={() => setIsFlipped(true)}
                  aria-label="Show about information"
                  aria-hidden={isFlipped}
                  inert={isFlipped}
                >
                  <div className="relative w-full h-full">
                    {/* No `priority`: the hero is min-h-screen, so this photo always
                        starts below the fold. Preloading it competed with the hero
                        background for first-paint bandwidth and warned in the console
                        that the preloaded candidate went unused. `sizes` mirrors the
                        real box: the card is max-w-md (448px) inside a px-4 parent. */}
                    <Image
                      src="/image/borjian-portrait.jpg"
                      alt="Amirhadi Borjian Yazdi"
                      fill
                      className="object-cover"
                      sizes="(max-width: 480px) calc(100vw - 32px), 448px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                      <p className="font-heading text-white text-2xl font-bold tracking-tight">Amirhadi Borjian</p>
                    </div>
                  </div>
                </button>

                {/* Back — Info */}
                <div className="flip-card-face flip-card-back flex flex-col min-h-0 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(8,112,184,0.2)] text-left" aria-hidden={!isFlipped} inert={!isFlipped}>
                  <div className="absolute inset-0 bg-slate-200 pointer-events-none" />
                  <div className="absolute -top-16 -right-16 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-20 -left-16 w-44 h-44 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/70 to-transparent pointer-events-none" />

                  <div className="relative z-10 shrink-0 flex items-center gap-2 w-full px-4 sm:px-5 py-3 border-b border-slate-300 bg-slate-500/10">
                    <span className="font-mono text-[11px] text-cyan-800 truncate min-w-0">~/about/developer.md</span>
                    <button
                      type="button"
                      className="btn-primary-sm ml-auto shrink-0"
                      onClick={() => setIsFlipped(false)}
                      aria-label="Show profile photo"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Photo
                    </button>
                  </div>

                  <div
                    className="flip-card-scroll relative z-10 flex-1 min-h-0 overflow-y-auto overscroll-y-contain p-5 sm:p-6 pb-8 flex flex-col gap-4"
                    role="region"
                    aria-label="About information"
                  >
                    <div className="rounded-xl bg-white border border-slate-300 p-4 shadow-sm">
                      <h3 className="font-subheading font-semibold text-2xl text-slate-900 mb-2 leading-tight">
                        Who I Am
                      </h3>
                      <p className="text-slate-700 text-base leading-relaxed">
                        I&apos;m Amirhadi Borjian, a full-stack developer at Finlern Oy. I build a TypeScript web platform with a custom AI agent, and a native Android app in Kotlin with end-to-end encrypted messaging. I came to security from the inside, by breaking my own work before anyone else could.
                      </p>
                    </div>

                    <div className="rounded-xl bg-white border border-slate-300 p-4 shadow-sm">
                      <h3 className="font-subheading font-semibold text-2xl text-slate-900 mb-2 leading-tight">
                        My Approach
                      </h3>
                      <p className="text-slate-700 text-base leading-relaxed">
                        I don&apos;t trust an assertion I haven&apos;t had to defend. Every security control on this site has a test that fails if it breaks: input validation, a CSP without unsafe-inline, rate limits, the honeypot. Nine verifiers run on every push, and a control nobody re-checks is only a rumour.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {!isFlipped && (  
              <motion.div
                className="flex flex-col items-end w-full mt-0.5 sm:mt-1 pr-1 sm:pr-3 pointer-events-none select-none"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}  
              >
                <svg
                  className="w-16 h-20 sm:w-20 sm:h-24 text-blue-500 mb-0.5 mr-4 sm:mr-8"
                  viewBox="0 0 60 72"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M30 68 C30 48, 34 32, 30 14"
                    stroke="currentColor"
                    strokeWidth="2.75"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path d="M30 14 L24 22 M30 14 L36 22" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" />
                </svg>
                <span className="font-heading text-4xl sm:text-5xl font-bold text-blue-600 rotate-[-6deg] leading-none">
                  Flip me!
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
