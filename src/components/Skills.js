'use client';

import { motion } from 'framer-motion';

export default function Skills() {
  const skillCategories = [
    {
      name: "Android Development",
      skills: [
        { name: "Kotlin", level: 80 },
        { name: "Jetpack Compose", level: 75 },
        { name: "MVVM Architecture", level: 70 },
        { name: "Hilt Dependency Injection", level: 75 },
        { name: "Android Studio", level: 85 },
      ]
    },
    {
      name: "Web Development",
      skills: [
        { name: "Next.js", level: 85 },
        { name: "TypeScript", level: 85 },
        { name: "Tailwind CSS", level: 90 },
        { name: "HTML/CSS", level: 95 },
        { name: "JavaScript", level: 85 },
      ]
    },
    {
      name: "Backend & Databases",
      skills: [
        { name: "Firebase Firestore", level: 80 },
        { name: "Firebase Authentication", level: 80 },
        { name: "Firebase Storage", level: 80 },
        { name: "Gradle", level: 85 },
        { name: "REST APIs", level: 80 },
      ]
    }
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <section id="skills" className="section py-28 bg-gradient-to-b from-gray-50/80 to-gray-100/90 dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-70"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 dark:bg-blue-700/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/10 dark:bg-purple-700/10 rounded-full blur-3xl"></div>
      
      <div className="container relative z-10">
        <motion.div 
          className="max-w-3xl mx-auto text-center mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <div className="inline-block mb-3">
            <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-semibold text-blue-600 dark:text-blue-400 mb-2">
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-blue-600/70 dark:to-blue-400/70"></span>
              <span>Technical Expertise</span>
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-blue-600/70 dark:to-blue-400/70"></span>
            </div>
          </div>
          <h2 className="heading text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 tracking-tight">My Skills</h2>
          <p className="subheading text-xl text-gray-600 dark:text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">Technologies I work with</p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {skillCategories.map((category, categoryIndex) => (
            <motion.div 
              key={categoryIndex}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(8,112,184,0.1)] dark:shadow-[0_20px_50px_rgba(8,112,184,0.07)] border border-gray-100/50 dark:border-gray-700/50 p-8 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(8,112,184,0.18)]"
              variants={fadeInUp}
            >
              <div className="relative mb-8">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-full"></div>
                <h3 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white tracking-tight">{category.name}</h3>
              </div>
              <div className="space-y-6">
                {category.skills.map((skill, skillIndex) => (
                  <div key={skillIndex} className="group">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-800 dark:text-white text-lg">{skill.name}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-700/50 px-2 py-0.5 rounded-full">{skill.level}%</span>
                    </div>
                    <div className="w-full bg-gray-200/70 dark:bg-gray-700/50 rounded-full h-2.5 p-0.5 backdrop-blur-sm">
                      <motion.div
                        className="h-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 relative group-hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        viewport={{ once: true }}
                      >
                        <span className="absolute -right-1 -top-1 w-3 h-3 rounded-full bg-white dark:bg-gray-800 border-2 border-blue-600 dark:border-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="mt-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-10 shadow-[0_20px_50px_rgba(8,112,184,0.1)] dark:shadow-[0_20px_50px_rgba(8,112,184,0.07)] border border-gray-100/50 dark:border-gray-700/50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <div className="relative mb-10">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-blue-600/70 dark:via-blue-400/70 to-transparent rounded-full"></div>
            <h3 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white tracking-tight">Additional Skills & Expertise</h3>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Debugging & Optimization",
              "Form Handling",
              "Linux Terminal",
              "Windows PowerShell",
              "Bash Scripting",
              "Component-based Design",
              "Responsive UI",
              "Cybersecurity"
            ].map((skill, index) => (
              <div 
                key={index} 
                className="flex items-center p-4 bg-gray-50/80 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700/30 hover:border-blue-100 dark:hover:border-blue-900/30 hover:shadow-md transition-all duration-300"
              >
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-3">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-800 dark:text-gray-200 font-medium">{skill}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
} 