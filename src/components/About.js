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
    <section id="about" className="section py-16 md:py-28 bg-gradient-to-b from-gray-50/80 to-gray-100/90 dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-70" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 dark:bg-blue-700/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 dark:bg-purple-700/10 rounded-full blur-3xl" />

      <div className="container relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center mb-12 md:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <div className="inline-flex items-center gap-1.5 font-mono text-xs text-cyan-600 dark:text-cyan-400 mb-3 bg-cyan-600/5 dark:bg-cyan-400/5 px-3 py-1.5 rounded-full border border-cyan-600/10 dark:border-cyan-400/10">
            <span className="opacity-50">~/</span>
            <span className="uppercase tracking-widest">Personal Journey</span>
          </div>
          <h2 className="font-subheading text-3xl sm:text-5xl md:text-6xl font-semibold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
            About Me
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
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
                  className="flip-card-face flip-card-front bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(8,112,184,0.15)] border border-gray-100/50 dark:border-gray-700/50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  onClick={() => setIsFlipped(true)}
                  aria-label="Show about information"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src="/image/borjian.png"
                      alt="Amirhadi Borjian Yazdi"
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 90vw, 512px"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                      <p className="font-heading text-white text-2xl font-bold tracking-tight">Amirhadi Borjian</p>
                    </div>
                  </div>
                </button>

                {/* Back — Info */}
                <div className="flip-card-face flip-card-back relative flex flex-col min-h-0 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(8,112,184,0.2)] border border-indigo-500/20 text-left">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 pointer-events-none" />
                  <div className="absolute -top-16 -right-16 w-40 h-40 bg-blue-500/25 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-20 -left-16 w-44 h-44 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none" />

                  <div className="relative z-10 shrink-0 flex items-center gap-2 w-full px-4 sm:px-5 py-3 border-b border-white/10 bg-black/20">
                    <div className="flex gap-1.5 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-red-400/90" />
                      <span className="w-2 h-2 rounded-full bg-amber-400/90" />
                      <span className="w-2 h-2 rounded-full bg-emerald-400/90" />
                    </div>
                    <span className="font-mono text-[11px] text-cyan-400/90 truncate min-w-0">~/about/developer.md</span>
                    <button
                      type="button"
                      className="ml-auto shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-heading font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-[0_4px_14px_rgba(59,130,246,0.4)] border border-blue-400/30 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
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
                    <div className="rounded-xl bg-white/[0.06] backdrop-blur-sm border border-white/10 p-4 shadow-inner">
                      <h3 className="font-subheading font-semibold text-2xl sm:text-3xl text-blue-300 mb-2 leading-tight">
                        Who I Am
                      </h3>
                      <p className="text-blue-100/95 text-base sm:text-lg leading-relaxed">
                        I&apos;m a software developer who loves building cool stuff and solving tricky problems with code. Whether it&apos;s web development, Android development, or debugging, I enjoy every moment of the process—from brainstorming ideas to bringing them to life.
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/[0.06] backdrop-blur-sm border border-white/10 p-4 shadow-inner">
                      <h3 className="font-subheading font-semibold text-2xl sm:text-3xl text-blue-300 mb-2 leading-tight">
                        My Approach
                      </h3>
                      <p className="text-blue-100/95 text-base sm:text-lg leading-relaxed">
                        I believe in creating clean, efficient code and making things work smoothly and flawlessly. Whether it&apos;s front-end, back-end, or Android development, I love diving into projects that challenge me and make me think outside the box.
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
                  className="w-16 h-20 sm:w-20 sm:h-24 text-blue-500 dark:text-blue-400 mb-0.5 mr-4 sm:mr-8"
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
                <span className="font-heading text-4xl sm:text-5xl font-bold text-blue-600 dark:text-blue-400 rotate-[-6deg] leading-none">
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
