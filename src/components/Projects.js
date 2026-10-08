'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { trackPointer, releasePointer } from '../lib/magnetic-pointer';

const PROJECTS = [
  {
    id: 1,
    title: 'FinLern Web App',
    description: 'Professional educational and communication website with server-side rendering and SEO optimization.',
    category: 'web',
    image: '/image/finlern.jpg',
    link: 'https://finlern.vercel.app/'
  }
];

const Kw = ({ children }) => <span className="text-purple-400">{children}</span>;
const Tp = ({ children }) => <span className="text-cyan-300">{children}</span>;
const St = ({ children }) => <span className="text-green-400">{children}</span>;
const Pr = ({ children }) => <span className="text-blue-300">{children}</span>;
const Tg = ({ children }) => <span className="text-red-400">{children}</span>;

const CODE_LINES = [
  <><Kw>import</Kw>{' { '}<Tp>Metadata</Tp>{' } '}<Kw>from</Kw> <St>&apos;next&apos;</St></>,
  <><Kw>import</Kw>{' { '}<Tp>Hero</Tp>{' } '}<Kw>from</Kw> <St>&apos;@/components/Hero&apos;</St></>,
  <><Kw>import</Kw>{' { '}<Tp>Courses</Tp>{' } '}<Kw>from</Kw> <St>&apos;@/components/Courses&apos;</St></>,
  <><Kw>import</Kw>{' { '}<Tp>getCourses</Tp>{' } '}<Kw>from</Kw> <St>&apos;@/lib/firebase&apos;</St></>,
  null,
  <><Kw>export const</Kw> <Pr>metadata</Pr>: <Tp>Metadata</Tp> = {'{'}</>,
  <>{'  '}<Pr>title</Pr>: <St>&apos;FinLern | Learn Finnish&apos;</St>,</>,
  <>{'  '}<Pr>description</Pr>: <St>&apos;Interactive Finnish learning&apos;</St>,</>,
  <>{'}'}</>,
  null,
  <><Kw>export default async function</Kw> <Tp>Page</Tp>() {'{'}</>,
  <>{'  '}<Kw>const</Kw> courses = <Kw>await</Kw> <Tp>getCourses</Tp>()</>,
  null,
  <>{'  '}<Kw>return</Kw> (</>,
  <>{'    <'}<Tg>main</Tg> <Pr>className</Pr>=<St>&quot;min-h-screen&quot;</St>{'>'}</>,
  <>{'      <'}<Tp>Hero</Tp> <Pr>title</Pr>=<St>&quot;Master Finnish&quot;</St> /{'>'}</>,
  <>{'      <'}<Tp>Courses</Tp> <Pr>items</Pr>={'{'}courses{'}'} /{'>'}</>,
  <>{'    </'}<Tg>main</Tg>{'>'}</>,
  <>{'  )'}</>,
  <>{'}'}</>,
];

function CodeWindow() {
  return (
    <div className="bg-[#0d1117] rounded-xl border border-gray-700/30 overflow-hidden h-full flex flex-col">
      <div className="flex items-center px-4 py-2.5 bg-[#161b22] border-b border-gray-700/30">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="ml-3 text-gray-500 text-xs font-mono">page</span>
      </div>
      <div className="p-4 overflow-auto flex-1">
        <div className="flex text-[13px] leading-[1.75] font-mono">
          <div className="text-gray-600 text-right pr-4 select-none flex-shrink-0 w-8">
            {CODE_LINES.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <div className="text-gray-300 overflow-x-auto flex-1">
            {CODE_LINES.map((line, i) => (
              <div key={i} className="min-h-[1.75em]">{line}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section id="projects" className="section py-16 md:py-28 bg-gradient-to-b from-gray-50/80 to-gray-100/90 relative overflow-hidden scroll-mt-28">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-70"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>

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
          <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed subtitle-blink">Check out my recent project</p>
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
              <div className="panel-3d">
                {/* Split view: Screenshot + Code */}
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Left: Screenshot */}
                  <div className="relative h-56 sm:h-72 lg:h-auto lg:min-h-[420px] overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10 opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-contain transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                      <span className="inline-block px-4 py-2 rounded-full text-xs font-medium text-cyan-300 bg-gray-900/80 backdrop-blur-md border border-cyan-500/20">
                        <span className="mr-1.5 inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                        {project.category}
                      </span>
                    </div>
                  </div>

                  {/* Right: Code window (desktop only) */}
                  <div className="hidden lg:block p-4 bg-gray-900/30">
                    <CodeWindow />
                  </div>
                </div>

                {/* Project info */}
                <div className="p-6 sm:p-8 md:p-10 relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>

                  <h3 className="font-subheading text-2xl font-semibold text-emerald-200 mb-4 tracking-tight">{project.title}</h3>
                  <p className="text-gray-300 mb-8 leading-relaxed">{project.description}</p>

                  <div className="flex justify-between items-center">
                    <a
                      href={project.link}
                      className="btn-primary min-w-[200px]"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Live
                    </a>

                    <div className="text-sm text-gray-400 flex items-center gap-1.5">
                      <span
                        className="magnetic-icon flex items-center justify-center"
                        onPointerMove={trackPointer}
                        onPointerLeave={releasePointer}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <span>2026</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
