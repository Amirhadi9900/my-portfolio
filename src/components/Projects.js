'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { trackPointer, releasePointer } from '../lib/magnetic-pointer';

const PROJECTS = [
  {
    id: 1,
    title: 'FinLern Web App',
    description: 'Professional educational and communication website with server-side rendering and SEO optimization.',
    image: '/image/finlern.jpg',
    link: 'https://finlern.vercel.app/'
  }
];

export default function Projects() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section id="projects" className="section py-16 md:py-28 bg-gradient-to-b from-gray-50/80 to-gray-100/90 relative overflow-hidden scroll-mt-28">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-70"></div>

      <div className="container relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center mb-12 md:mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <h2 className="font-subheading text-3xl sm:text-5xl md:text-6xl font-semibold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            Projects
          </h2>
          <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed subtitle-blink">Check out my recent project</p>
        </motion.div>

        <div className="flex justify-center">
          {PROJECTS.map((project) => (
            <motion.div
              key={project.id}
              className="max-w-5xl w-full"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={fadeInUp}
            >
              <div className="panel-3d group/card">
                {/* 5:2 is wider than the 1600x694 asset, so object-cover gives up 54px of the
                    bottom and none of the width: the whole site stays in frame, nav included.
                    Below sm the box turns narrower than the asset and the sides give instead,
                    because a 2.5:1 band on a phone is too short to read as a site. */}
                <div className="relative aspect-[16/9] overflow-hidden bg-white sm:aspect-[5/2]">
                  <Image
                    src={project.image}
                    alt={`${project.title}, shown as the live site`}
                    fill
                    className="object-cover object-top transition-transform duration-700 ease-out group-hover/card:scale-[1.04]"
                    sizes="(max-width: 1056px) calc(100vw - 34px), 1022px"
                  />
                  {/* Bottom-left rather than top-left: sampled against this asset, the top-left
                      lands on the screenshot's own nav bar (58.6% of that region is its light
                      content) while the bottom-left sits on dark hero (0% collision). The chip
                      is 70% opaque so it holds contrast if the screenshot is ever replaced.
                      Gated to sm with the crop: below it the 16/9 box shows the asset's full
                      height and the chip starts overlapping the site's own centred buttons. */}
                  <div className="absolute bottom-6 left-6 hidden sm:block">
                    <span className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-slate-950/70 px-3 py-1 backdrop-blur-sm">
                      <svg
                        className="h-3.5 w-3.5 shrink-0 text-cyan-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                      {/* Derived from `link`, so the address shown cannot drift from the
                          address the button opens. */}
                      <span className="font-mono text-xs text-cyan-100">{new URL(project.link).host}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 p-6 sm:p-8 md:p-10 lg:grid-cols-[1fr_280px] lg:gap-12">
                  <div>
                    <div className="mb-4 flex items-start gap-4">
                      <span
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 shadow-lg transition-all duration-300 group-hover/card:shadow-[0_0_20px_rgba(34,211,238,0.5)] magnetic-icon"
                        onPointerMove={trackPointer}
                        onPointerLeave={releasePointer}
                      >
                        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                        </svg>
                      </span>
                      <h3 className="font-subheading text-2xl font-semibold tracking-tight text-slate-900">
                        {project.title}
                      </h3>
                    </div>

                    <p className="max-w-xl leading-relaxed text-slate-700">{project.description}</p>

                    <div className="mt-8">
                      <a
                        href={project.link}
                        className="btn-primary"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Live
                      </a>
                    </div>
                  </div>

                  {/* No Stack row: the header probe on finlern.vercel.app came back
                      X-Vercel-Mitigated, which proves nothing about the framework, and I
                      won't write a stack from memory. Add the row when the real list comes. */}
                  <dl className="space-y-5 border-t border-slate-300 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                    <div>
                      <dt className="font-mono text-xs uppercase tracking-widest text-slate-600">Year</dt>
                      <dd className="mt-1 text-base font-medium text-cyan-800">2026</dd>
                    </div>
                    <div>
                      <dt className="font-mono text-xs uppercase tracking-widest text-slate-600">Host</dt>
                      <dd className="mt-1 text-base font-medium text-cyan-800">Vercel</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
