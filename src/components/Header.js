'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('#');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      
      // Set active link based on scroll position
      const sections = document.querySelectorAll('section[id]');
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        const sectionId = '#' + section.getAttribute('id');
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
          setActiveLink(sectionId);
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#about', label: 'About' },
    { href: '#projects', label: 'Projects' },
    { href: '#skills', label: 'Skills' },
    { href: '#contact', label: 'Contact' },
  ];

  // Adding a slight delay to each menu item for a staggered effect
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 header-blur ${
      isScrolled 
        ? 'py-2 bg-gradient-to-r from-blue-900/95 via-blue-800/95 to-blue-900/95 shadow-lg border-b border-blue-700/30' 
        : 'py-5 bg-gradient-to-r from-blue-900/70 via-blue-800/70 to-blue-900/70'
    }`}>
      <div className="container flex items-center justify-between">
        <Link 
          href="/" 
          className="relative group header-glow"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="text-2xl font-bold tracking-tight text-white mr-2 transition-all duration-300 group-hover:text-blue-300">
              Amirhadi
            </span>
            <span className="text-2xl font-light logo-gradient transition-all duration-300">
              Borjian
            </span>
          </motion.div>
          
          {/* Animated underline for logo */}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-300 group-hover:w-full"></span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:space-x-1">
          <motion.div 
            className="flex space-x-1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {navLinks.map((link) => (
              <motion.div key={link.href} variants={itemVariants}>
                <Link
                  href={link.href}
                  className={`relative px-4 py-2 text-sm rounded-md transition-all duration-300 nav-link ${
                    activeLink === link.href
                      ? 'active text-white font-medium' 
                      : 'text-blue-200 hover:text-white'
                  }`}
                  onClick={() => setActiveLink(link.href)}
                >
                  {link.label}
                  
                  {/* Active indicator */}
                  {activeLink === link.href && (
                    <motion.span 
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400"
                      layoutId="activeIndicator"
                      transition={{ type: 'spring', duration: 0.5 }}
                    ></motion.span>
                  )}
                </Link>
              </motion.div>
            ))}

            <motion.div variants={itemVariants}>
              <Link
                href="#contact"
                className="ml-3 px-6 py-2 text-sm font-medium text-white gradient-btn rounded-full shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-0.5 pulse-border"
              >
                Get in Touch
              </Link>
            </motion.div>
          </motion.div>
        </nav>

        {/* Mobile Menu Button */}
        <motion.button
          className="p-2 rounded-full bg-blue-800/50 border border-blue-700/30 text-white md:hidden hover:bg-blue-700/70 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </motion.button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav 
            className="container py-4 md:hidden nav-slide-down"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <motion.div 
              className="flex flex-col space-y-4 px-2 py-3 bg-blue-800/40 backdrop-blur-md rounded-xl border border-blue-700/30"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {navLinks.map((link) => (
                <motion.div key={link.href} variants={itemVariants}>
                  <Link
                    href={link.href}
                    className={`block px-4 py-2 rounded-lg transition-colors nav-link ${
                      activeLink === link.href
                        ? 'active text-white font-medium bg-blue-700/40' 
                        : 'text-blue-200 hover:text-white hover:bg-blue-700/20'
                    }`}
                    onClick={() => {
                      setActiveLink(link.href);
                      setIsMenuOpen(false);
                    }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={itemVariants}>
                <Link
                  href="#contact"
                  className="block px-5 py-3 text-center text-white font-medium gradient-btn rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get in Touch
                </Link>
              </motion.div>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
} 