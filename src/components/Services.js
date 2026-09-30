'use client';

import { motion } from 'framer-motion';
import { scrollToId } from '../lib/scroll-to-id';

const ROE_REFERENCE_URL = 'https://redteam.guide/docs/checklists/roe-planning/';

const ICONS = {
  code: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
  shield:
    'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A11.937 11.937 0 013 9c0 5.591 3.824 10.29 9 11.626 5.176-1.337 9-6.03 9-11.626 0-1.042-.133-2.052-.382-3.016z',
};

const SERVICES = [
  {
    id: 'full-stack-development',
    icon: ICONS.code,
    title: 'Full-Stack Development',
    promise: 'Web and Android products, built to be handed over.',
    accent: {
      badge: 'from-blue-500 to-indigo-600',
      ring: 'group-hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]',
      label: 'text-blue-300',
      bullet: 'bg-blue-400',
      panel: 'border-blue-400/25 bg-blue-950/25',
    },
    deliverablesHeading: 'What you get',
    deliverables: [
      'A working product, not a mockup: built, wired to real data, and deployed',
      'Web and Android from one person, so the two ends actually agree',
      'Login, permissions and third-party integrations that hold under real use',
      'Forms and APIs validated on the server, not just in the browser',
      'Layouts checked on small phones, not only on a wide desktop',
      'A repository, environment setup and pipeline someone else can maintain',
    ],
    panel: {
      heading: 'What your build is made of',
      intro: 'Nothing chosen for its own sake, and nothing you cannot maintain afterwards:',
      mono: true,
      points: [
        'Next.js · React · TypeScript or JavaScript',
        'Kotlin · Jetpack Compose · Gradle (KTS)',
        'Node · Firebase · PostgreSQL · MySQL',
        'Tailwind CSS · Framer Motion',
        'GitHub Actions · Docker · Kubernetes',
        'REST · GraphQL · OAuth2',
      ],
      closing:
        'This site is the working example: the form is validated and verified on the server, and the only third-party code it loads is the CAPTCHA and a page-visit counter.',
    },
    commitments: [
      'You see the plan before the work starts, so what you pay for is what you asked for.',
      'Source and infrastructure are yours at handover, with no lock-in to me.',
      'If a project is not something I can do well, I say so instead of taking it on.',
    ],
    cta: 'Discuss a build',
  },
  {
    id: 'ethical-pentesting',
    icon: ICONS.shield,
    title: 'Ethical Pentesting',
    promise: 'Findings you can act on, inside boundaries we agree first.',
    accent: {
      badge: 'from-cyan-500 to-teal-600',
      ring: 'group-hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]',
      label: 'text-cyan-300',
      bullet: 'bg-cyan-400',
      panel: 'border-cyan-400/25 bg-cyan-950/25',
    },
    deliverablesHeading: 'What you get',
    deliverables: [
      'Web application testing against the OWASP Top 10',
      'Network, service and traffic assessment',
      'Authentication, session and access-control review',
      'Credential strength and cryptography checks',
      'A written report: severity, evidence, real impact and how to fix it',
      'A clear statement of what was tested, and what was not',
    ],
    panel: {
      heading: 'Rules of Engagement',
      intro:
        'Nothing is touched without written permission and an agreed Rules of Engagement, which fixes in advance:',
      points: [
        'The exact targets: IP ranges, domains, accounts and applications in scope',
        'A blacklist of systems, data and people that are off-limits',
        'Which actions are authorised, and which are forbidden outright',
        'Objectives, maintenance windows, named contacts, and how either side halts the test',
      ],
      closing:
        'If scope shifts, the ROE is revised and re-approved. A deviation needs your written approval beforehand, not a verbal nod mid-test.',
      reference: { label: 'the ROE planning checklist', href: ROE_REFERENCE_URL },
    },
    commitments: [
      'Scope is a boundary, not a suggestion: I test only what the ROE authorises.',
      'Stop means stop. The engagement halts the moment you ask.',
      'If a step looks unethical or unlawful I stop, tell you, and will not carry it out even if asked.',
      'Findings are reported to you in writing, and nothing is published without your consent.',
    ],
    cta: 'Scope a test',
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

function ServiceCard({ service }) {
  return (
    <article
      id={service.id}
      className="service-card group relative flex h-full flex-col rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-left shadow-[0_20px_50px_rgba(8,112,184,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/30"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
      <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-blue-500/15 blur-3xl" />

      <div className="relative z-10 flex items-start gap-4 p-6 sm:p-8">
        <span
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${service.accent.badge} shadow-lg transition-all duration-300 ${service.accent.ring}`}
        >
          <svg
            className="h-7 w-7 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d={service.icon} />
          </svg>
        </span>
        <div className="min-w-0">
          <h3 className="font-subheading text-2xl font-semibold tracking-tight text-white">
            {service.title}
          </h3>
          <p className={`mt-1 text-sm font-medium ${service.accent.label}`}>{service.promise}</p>
        </div>
      </div>

      <div className="relative z-10 px-6 pb-6 sm:px-8">
        <h4 className="font-mono text-xs uppercase tracking-widest text-gray-400">
          {service.deliverablesHeading}
        </h4>
        <ul className="mt-3 space-y-2.5">
          {service.deliverables.map((item) => (
            <li key={item} className="flex items-start gap-3 text-[15px] leading-relaxed text-gray-200">
              <span
                className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${service.accent.bullet}`}
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {service.panel && (
        <div className={`relative z-10 mx-6 mb-6 rounded-xl border p-5 sm:mx-8 ${service.accent.panel}`}>
          <h4 className={`font-subheading text-base font-semibold ${service.accent.label}`}>
            {service.panel.heading}
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-gray-300">{service.panel.intro}</p>
          <ul className="mt-3 space-y-2">
            {service.panel.points.map((point) => (
              <li
                key={point}
                className={`flex items-start gap-2.5 leading-relaxed text-gray-200 ${
                  service.panel.mono ? 'font-mono text-[13px]' : 'text-sm'
                }`}
              >
                <span
                  className={`mt-2 h-1 w-1 shrink-0 rounded-full ${service.accent.bullet}`}
                  aria-hidden="true"
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-gray-300">{service.panel.closing}</p>
          {service.panel.reference && (
            <p className="mt-4 font-mono text-xs text-gray-400">
              Worked from{' '}
              <a
                href={service.panel.reference.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-300 underline decoration-cyan-400/40 underline-offset-2 transition-colors hover:text-cyan-200"
              >
                {service.panel.reference.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              .
            </p>
          )}
        </div>
      )}

      <div className="relative z-10 mt-auto border-t border-white/10 px-6 py-6 sm:px-8">
        <h4 className="font-mono text-xs uppercase tracking-widest text-gray-400">
          What you can hold me to
        </h4>
        <ul className="mt-3 space-y-2.5">
          {service.commitments.map((commitment) => (
            <li key={commitment} className="flex items-start gap-3 text-sm leading-relaxed text-gray-300">
              <svg
                className={`mt-1 h-3.5 w-3.5 shrink-0 ${service.accent.label}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
              <span>{commitment}</span>
            </li>
          ))}
        </ul>

        <p className="mt-5 font-mono text-xs text-gray-400">
          No rate card. Price follows scope, agreed over email.
        </p>

        <button
          type="button"
          onClick={() => scrollToId('contact')}
          className="btn-primary-block mt-5"
        >
          {service.cta}
        </button>
      </div>
    </article>
  );
}

export default function Services() {
  return (
    <section
      id="services"
      className="section relative scroll-mt-28 overflow-hidden bg-gradient-to-b from-gray-100/90 to-gray-50/80 py-16 md:py-28"
    >
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-70" />
      <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
      <div className="absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-cyan-600/10 blur-3xl" />

      <div className="container relative z-10">
        <motion.div
          className="mx-auto mb-12 max-w-3xl text-center md:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <h2 className="font-subheading text-3xl font-semibold tracking-tight sm:text-5xl md:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            Services
          </h2>
          <p className="subtitle-blink mx-auto max-w-2xl text-xl font-light leading-relaxed text-gray-600">
            Two things I do, and how each one is agreed before it starts
          </p>
        </motion.div>

        <motion.div
          className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 md:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
        >
          {SERVICES.map((service) => (
            <motion.div key={service.id} variants={fadeInUp}>
              <ServiceCard service={service} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
