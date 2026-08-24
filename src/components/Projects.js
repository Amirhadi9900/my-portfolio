'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const PROJECTS = [
  {
    id: 1,
    title: 'Finlern Web App',
    description: 'Professional educational and communication website built with Next.js, TypeScript, and Tailwind CSS with server-side rendering and SEO optimization.',
    category: 'web',
    image: '/image/finlern.png',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Firestore'],
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
        <span className="ml-3 text-gray-500 text-xs font-mono">page.tsx</span>
        <span className="ml-auto text-gray-600 text-[10px] font-mono">TypeScript · React Native</span>
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  if (!isMounted) {
    return (
      <section id="projects" className="section py-16 md:py-28">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-subheading text-gray-800 dark:text-white text-3xl md:text-4xl font-semibold mb-4">My Projects</h2>
            <p className="text-gray-600 dark:text-gray-400">Check out my recent work</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="section py-16 md:py-28 bg-gradient-to-b from-gray-50/80 to-gray-100/90 dark:from-gray-900 dark:to-gray-950 relative overflow-hidden scroll-mt-28">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-70"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 dark:bg-blue-700/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/10 dark:bg-purple-700/10 rounded-full blur-3xl"></div>

      <div className="container relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center mb-12 md:mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <div className="inline-flex items-center gap-1.5 font-mono text-xs text-cyan-600 dark:text-cyan-400 mb-3 bg-cyan-600/5 dark:bg-cyan-400/5 px-3 py-1.5 rounded-full border border-cyan-600/10 dark:border-cyan-400/10">
            <span className="opacity-50">~/</span>
            <span className="uppercase tracking-widest">Portfolio Showcase</span>
          </div>
          <h2 className="font-subheading text-3xl sm:text-5xl md:text-6xl font-semibold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
            My Projects
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">Check out my recent work</p>
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
              <motion.div
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(8,112,184,0.1)] dark:shadow-[0_20px_50px_rgba(8,112,184,0.07)] border border-gray-100/50 dark:border-gray-700/50 transition-all duration-500"
                whileHover={{
                  y: -4,
                  boxShadow: '0 30px 60px rgba(8,112,184,0.18)',
                }}
              >
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
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <span className="inline-block px-4 py-2 rounded-full text-xs font-mono font-medium text-cyan-300 bg-gray-900/80 backdrop-blur-md border border-cyan-500/20">
                        <span className="mr-1.5 inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                        {project.category}
                      </span>
                    </div>
                  </div>

                  {/* Right: Code window (desktop only) */}
                  <div className="hidden lg:block p-4 bg-gray-50/50 dark:bg-gray-900/30">
                    <CodeWindow />
                  </div>
                </div>

                {/* Project info */}
                <div className="p-6 sm:p-8 md:p-10 relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>

                  <h3 className="font-heading text-3xl font-bold text-gray-800 dark:text-white mb-4 tracking-tight">{project.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg leading-relaxed">{project.description}</p>

                  {/* Tech tags with interactive glow */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {project.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="text-sm px-4 py-2 rounded-full bg-cyan-50/70 dark:bg-cyan-900/10 text-cyan-700 dark:text-cyan-300 font-mono font-medium border border-cyan-200/50 dark:border-cyan-800/30 hover:border-cyan-400/60 dark:hover:border-cyan-500/40 hover:shadow-[0_0_12px_rgba(34,211,238,0.15)] transition-all duration-300 cursor-default"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <a
                      href={project.link}
                      className="btn-primary min-w-[200px]"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Live
                    </a>

                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-mono">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>2026</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
