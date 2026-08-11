'use client';

import { motion } from 'framer-motion';
import SkillIcon from './SkillIcon';
import FlagIcon from './FlagIcon';

const SKILL_CATEGORIES = [
  {
    name: 'Mobile Development',
    skills: [
      'Kotlin',
      'Jetpack Compose',
      'React Native',
      'Gradle (KTS)',
      'CI/CD Pipelines',
    ],
  },
  {
    name: 'Web Development',
    skills: [
      'Next.js',
      'React Native',
      'TypeScript',
      'Tailwind CSS',
      'Node.js',
      'JavaScript',
      'HTML/CSS',
      'Python',
      'Git & GitHub',
      'VS Code',
    ],
  },
  {
    name: 'Backend',
    skills: [
      'OAuth2',
      'REST APIs',
      'SQL',
      'PostgreSQL',
      'MySQL',
      'GraphQL',
    ],
  },
  {
    name: 'Cloud Infrastructure',
    skills: [
      'Firebase',
      'Google Cloud',
      'Docker',
      'MongoDB',
      'Kubernetes',
      'AWS',
      'Vercel',
      'Cloudflare',
    ],
  },
  {
    name: 'Network Security',
    skills: [
      'Cisco Networking',
      'Wireshark',
      'Web Application Security',
      'Penetration Testing',
    ],
  },
  {
    name: 'Languages',
    skills: [
      { name: 'Persian (Native)', flagSrc: '/flags/iran-lion-sun.svg' },
      { name: 'English (Fluent)', flagCode: 'gb' },
      { name: 'Finnish (Intermediate)', flagCode: 'fi' },
    ],
  },
];

function SkillChip({ skill }) {
  const isLanguage = typeof skill === 'object';

  return (
    <div className="skill-chip group">
      <div className="skill-chip-icon skill-icon-sparkle">
        {isLanguage ? (
          <FlagIcon
            code={skill.flagCode}
            src={skill.flagSrc}
            className="w-8 h-6 relative z-[1]"
          />
        ) : (
          <span className="relative z-[1] flex items-center justify-center">
            <SkillIcon name={skill} />
          </span>
        )}
      </div>
      <span className="skill-chip-label">{isLanguage ? skill.name : skill}</span>
    </div>
  );
}

function CategoryCard({ category, variants }) {
  return (
    <motion.div className="skill-category-card" variants={variants}>
      <div className="relative mb-6">
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-full" />
        <h3 className="font-subheading text-xl sm:text-2xl font-semibold text-center text-gray-800 dark:text-white tracking-tight pt-2">
          {category.name}
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {category.skills.map((skill) => (
          <SkillChip key={typeof skill === 'object' ? skill.name : skill} skill={skill} />
        ))}
      </div>
    </motion.div>
  );
}

export default function Skills() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  return (
    <section id="skills" className="section py-16 md:py-28 bg-gradient-to-b from-gray-50/80 to-gray-100/90 dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-70" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 dark:bg-blue-700/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/10 dark:bg-purple-700/10 rounded-full blur-3xl" />

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
            <span className="uppercase tracking-widest">Technical Expertise</span>
          </div>
          <h2 className="font-subheading text-3xl sm:text-5xl md:text-6xl font-semibold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
            My Skills
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
            Technologies and tools I work with
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
        >
          {SKILL_CATEGORIES.map((category) => (
            <CategoryCard key={category.name} category={category} variants={fadeInUp} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
