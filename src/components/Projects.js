'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const projects = [
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
  
  // Removing category filtering as it's no longer needed
  const filteredProjects = projects;
  
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
  
  if (!isMounted) {
    return (
      <section id="projects" className="section">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="heading text-blue-600 dark:text-blue-400 text-3xl md:text-4xl font-bold mb-4">My Projects</h2>
            <p className="subheadig text-blue-600 dark:text-blue-400">Check out my recent work</p>
          </div>
          
          <div className="flex justify-center">
            {projects.map((project) => (
              <div 
                key={project.id} 
                className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg"
              >
                <div className="relative h-80">
                  <Image 
                    src={project.image} 
                    alt={project.title}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{project.title}</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech, index) => (
                      <span 
                        key={index} 
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  <a 
                    href={project.link} 
                    className="inline-block text-blue-600 dark:text-blue-400 font-medium hover:underline"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    View Project →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section id="projects" className="section py-28 bg-gradient-to-b from-gray-50/80 to-gray-100/90 dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
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
              <span>Portfolio Showcase</span>
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-blue-600/70 dark:to-blue-400/70"></span>
            </div>
          </div>
          <h2 className="heading text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 tracking-tight">My Projects</h2>
          <p className="subheading text-xl text-gray-600 dark:text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">Check out my recent work</p>
        </motion.div>
        
        <motion.div 
          className="flex justify-center"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {filteredProjects.map((project) => (
            <motion.div 
              key={project.id} 
              className="max-w-3xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(8,112,184,0.1)] dark:shadow-[0_20px_50px_rgba(8,112,184,0.07)] border border-gray-100/50 dark:border-gray-700/50 hover:shadow-[0_30px_60px_rgba(8,112,184,0.18)] dark:hover:shadow-[0_30px_60px_rgba(8,112,184,0.12)] transition-all duration-500 hover:-translate-y-2"
              variants={fadeInUp}
            >
              <div className="relative h-96 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10 opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                <Image 
                  src={project.image} 
                  alt={project.title}
                  fill
                  className="object-contain transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <span className="inline-block px-4 py-2 rounded-full text-xs font-medium text-white bg-blue-600/80 backdrop-blur-md border border-blue-500/30">
                    <span className="mr-1.5 inline-block w-1.5 h-1.5 bg-blue-200 rounded-full"></span>
                    {project.category}
                  </span>
                </div>
              </div>
              
              <div className="p-10 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-px bg-gradient-to-r from-transparent via-blue-600/30 dark:via-blue-400/30 to-transparent"></div>
                
                <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 tracking-tight">{project.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg leading-relaxed">{project.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-8 ml-1">
                  {project.technologies.map((tech, index) => (
                    <span 
                      key={index} 
                      className="text-sm px-4 py-2 rounded-full bg-blue-50/70 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium border border-blue-100 dark:border-blue-800/50 shadow-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-between items-center">
                  <a 
                    href={project.link} 
                    className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white font-medium tracking-wide transition-all duration-300 shadow-[0_7px_25px_rgba(59,130,246,0.25)] hover:shadow-[0_7px_35px_rgba(59,130,246,0.35)] dark:shadow-[0_7px_25px_rgba(59,130,246,0.15)] dark:hover:shadow-[0_7px_35px_rgba(59,130,246,0.25)]"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <span>View Project</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>2025</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 