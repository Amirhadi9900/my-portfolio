'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative bg-gray-900 text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent transform-gpu"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent transform-gpu"></div>
        <div className="grid grid-cols-12 h-full w-full">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="border-r border-cyan-800/10"></div>
          ))}
        </div>
      </div>
      
      {/* Main Footer Content */}
      <div className="container max-w-6xl mx-auto py-16 relative z-10">
        {/* Footer Header */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 inline-block">
            Amirhadi Borjian
          </h2>
          <p className="text-gray-400 mt-2 max-w-xl mx-auto">
            Creating elegant, responsive websites with modern technologies.
          </p>
        </motion.div>
        
        {/* Footer Main Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-8 border-t border-gray-800"
        >
          {/* Quick Links Section */}
          <div className="transform-gpu hover:translate-z-2 transition-all duration-300">
            <h3 className="text-lg font-semibold mb-5 relative inline-block">
              <span className="relative z-10">Navigation</span>
              <span className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-cyan-500 to-purple-500"></span>
            </h3>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              <div>
                <h4 className="text-sm uppercase text-gray-500 mb-3">Quick Links</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="#about" className="text-gray-400 hover:text-white transition-colors hover:pl-2 duration-300 group flex items-center">
                      <span className="w-0 group-hover:w-2 h-px bg-cyan-400 mr-0 group-hover:mr-2 transition-all duration-300"></span>About
                    </Link>
                  </li>
                  <li>
                    <Link href="#projects" className="text-gray-400 hover:text-white transition-colors hover:pl-2 duration-300 group flex items-center">
                      <span className="w-0 group-hover:w-2 h-px bg-cyan-400 mr-0 group-hover:mr-2 transition-all duration-300"></span>Projects
                    </Link>
                  </li>
                  <li>
                    <Link href="#skills" className="text-gray-400 hover:text-white transition-colors hover:pl-2 duration-300 group flex items-center">
                      <span className="w-0 group-hover:w-2 h-px bg-cyan-400 mr-0 group-hover:mr-2 transition-all duration-300"></span>Skills
                    </Link>
                  </li>
                  <li>
                    <Link href="#contact" className="text-gray-400 hover:text-white transition-colors hover:pl-2 duration-300 group flex items-center">
                      <span className="w-0 group-hover:w-2 h-px bg-cyan-400 mr-0 group-hover:mr-2 transition-all duration-300"></span>Contact
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm uppercase text-gray-500 mb-3">Services</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors hover:pl-2 duration-300 group flex items-center">
                      <span className="w-0 group-hover:w-2 h-px bg-purple-400 mr-0 group-hover:mr-2 transition-all duration-300"></span>Android Dev
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors hover:pl-2 duration-300 group flex items-center">
                      <span className="w-0 group-hover:w-2 h-px bg-purple-400 mr-0 group-hover:mr-2 transition-all duration-300"></span>Web Dev
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors hover:pl-2 duration-300 group flex items-center">
                      <span className="w-0 group-hover:w-2 h-px bg-purple-400 mr-0 group-hover:mr-2 transition-all duration-300"></span>Firebase
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors hover:pl-2 duration-300 group flex items-center">
                      <span className="w-0 group-hover:w-2 h-px bg-purple-400 mr-0 group-hover:mr-2 transition-all duration-300"></span>Responsive
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Contact Section */}
          <div className="transform-gpu hover:translate-z-2 transition-all duration-300">
            <h3 className="text-lg font-semibold mb-5 relative inline-block">
              <span className="relative z-10">Contact</span>
              <span className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-cyan-500 to-purple-500"></span>
            </h3>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-start group">
                <div className="mr-3 p-1.5 rounded-full bg-gray-800/50 group-hover:bg-cyan-900/30 transition-colors duration-300">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="group-hover:text-white transition-colors duration-300">amirhadib79@gmail.com</span>
              </li>
              <li className="flex items-start group">
                <div className="mr-3 p-1.5 rounded-full bg-gray-800/50 group-hover:bg-purple-900/30 transition-colors duration-300">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <span className="group-hover:text-white transition-colors duration-300">+358 44 248 2127</span>
              </li>
              <li className="flex items-start group">
                <div className="mr-3 p-1.5 rounded-full bg-gray-800/50 group-hover:bg-cyan-900/30 transition-colors duration-300">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="group-hover:text-white transition-colors duration-300">Finland</span>
              </li>
            </ul>
          </div>
          
          {/* Connect Section */}
          <div className="transform-gpu hover:translate-z-2 transition-all duration-300">
            <h3 className="text-lg font-semibold mb-5 relative inline-block">
              <span className="relative z-10">Connect</span>
              <span className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-cyan-500 to-purple-500"></span>
            </h3>
            <p className="text-gray-400 mb-4">
              Follow me on social media for updates and more content.
            </p>
            <div className="flex space-x-5">
              <a href="https://github.com/Amirhadi9900" target="_blank" rel="noopener noreferrer" 
                className="group">
                <div className="p-3 rounded-lg bg-gray-800/80 group-hover:bg-gray-800 transition-all duration-300 transform-gpu group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <span className="sr-only">GitHub</span>
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-cyan-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </div>
              </a>
              <a href="https://www.linkedin.com/in/amirhadi-borjian-yazdi-5108431a1" target="_blank" rel="noopener noreferrer" 
                className="group">
                <div className="p-3 rounded-lg bg-gray-800/80 group-hover:bg-gray-800 transition-all duration-300 transform-gpu group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-purple-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </div>
              </a>
              <a href="mailto:amirhadib79@gmail.com" className="group">
                <div className="p-3 rounded-lg bg-gray-800/80 group-hover:bg-gray-800 transition-all duration-300 transform-gpu group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <span className="sr-only">Email</span>
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-cyan-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                  </svg>
                </div>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Footer Bottom */}
      <div className="relative py-6 border-t border-gray-800">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          viewport={{ once: true }}
          className="container max-w-6xl mx-auto text-center text-gray-400"
        >
          <p>© {currentYear} Amirhadi Borjian. All rights reserved.</p>
          <p className="mt-2 text-sm group relative inline-block">
            Designed and developed with 
            <span className="relative inline-block mx-2">
              <span className="absolute -inset-1 rounded-full bg-red-500/20 animate-pulse"></span>
              <span className="relative text-red-500">❤</span>
            </span> 
            using Next.js and Tailwind CSS
          </p>
        </motion.div>
      </div>
    </footer>
  );
} 