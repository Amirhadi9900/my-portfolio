'use client';

import { motion } from 'framer-motion';
import SkillIcon, { usesLightTile } from './SkillIcon';
import FlagIcon from './FlagIcon';
import { trackPointer, releasePointer } from '../lib/magnetic-pointer';

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
      'TypeScript',
      'Tailwind CSS',
      'Node.js',
      'JavaScript',
      'HTML/CSS',
      'Python',
      'Bash Scripting',
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
      'Postman',
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
      'Cryptography',
      'Wireshark',
      'OWASP Top 10',
      'Penetration Testing',
      'Burp Suite',
      'Metasploit',
      'Hashcat',
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
  // Flags are artwork drawn for a white field, so they keep the light tile.
  const lightTile = isLanguage || usesLightTile(skill);

  return (
    <div
      className={`skill-chip group ${lightTile ? 'is-light-tile' : 'is-dark-tile'}`}
      onPointerMove={trackPointer}
      onPointerLeave={releasePointer}
    >
      <div className="skill-chip-icon magnetic-icon">
        {isLanguage ? (
          <FlagIcon code={skill.flagCode} src={skill.flagSrc} />
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
    <motion.div className="skill-category-card panel-3d" variants={variants}>
      <div className="relative mb-6">
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-cyan-500 to-teal-600 rounded-full" />
        <h3 className="font-subheading text-2xl font-semibold text-center text-emerald-200 tracking-tight pt-2">
          {category.name}
        </h3>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-3">
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
    <section id="skills" className="section py-16 md:py-28 bg-gradient-to-b from-gray-50/80 to-gray-100/90 relative overflow-hidden scroll-mt-28">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-70" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />

      <div className="container relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center mb-12 md:mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <h2 className="font-subheading text-3xl sm:text-5xl md:text-6xl font-semibold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            My Skills
          </h2>
          <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed subtitle-blink">
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
