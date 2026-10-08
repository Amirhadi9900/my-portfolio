'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { scrollToId } from '../lib/scroll-to-id';
import { getActiveSectionId } from '../lib/active-section';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('#');
  const pendingMobileScrollId = useRef(null);

  useEffect(() => {
    const update = () => {
      setIsScrolled(window.scrollY > 10);
      const current = getActiveSectionId();
      setActiveLink(current ? `#${current}` : '#');
    };

    window.addEventListener('scroll', update, { passive: true });
    // Both sibling scroll components run their handler once on mount; without this
    // the nav shows no active item at all until the visitor scrolls, so landing on
    // a deep link like /#services arrives unhighlighted.
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  // Contact is deliberately absent: the "Get In Touch" CTA below already points
  // there, and two nav entries landing on the same section reads as a mistake.
  // Four links plus the CTA measure ~610px against the 736px left of the logo at
  // md (768px), so the desktop links still keep the px-3 until lg.
  const navLinks = [
    { href: '#about', label: 'About' },
    { href: '#projects', label: 'Projects' },
    { href: '#skills', label: 'Skills' },
    { href: '#services', label: 'Services' },
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

  function handleMobileNav(event, id) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (typeof event.button === 'number' && event.button !== 0) return;
    event.preventDefault();
    pendingMobileScrollId.current = id;
    setActiveLink(`#${id}`);
    setIsMenuOpen(false);
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 header-blur ${
      isScrolled 
        ? 'py-2 bg-gradient-to-r from-blue-900/95 via-blue-800/95 to-blue-900/95 shadow-lg border-b border-blue-700/30' 
        : 'py-5 bg-gradient-to-r from-blue-900/70 via-blue-800/70 to-blue-900/70'
    }`}>
      <div className="container flex items-center justify-between">
        <Link 
          href="/" 
          className="relative group header-glow no-underline"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="font-heading text-2xl font-bold tracking-tight text-white transition-all duration-300 group-hover:text-blue-300">
              Amirhadi
            </span>{' '}
            <span className="font-heading text-2xl font-light logo-gradient transition-all duration-300">
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
                  scroll={false}
                  aria-current={activeLink === link.href ? 'true' : undefined}
                  className={`relative px-3 lg:px-4 py-2 text-sm rounded-md transition-all duration-300 nav-link no-underline ${
                    activeLink === link.href
                      ? 'active text-white font-medium' 
                      : 'text-blue-200 hover:text-white'
                  }`}
                  onClick={(event) => {
                    scrollToId(link.href.slice(1), event);
                    setActiveLink(link.href);
                  }}
                >
                  {link.label}
                  
                  {/* Active indicator */}
                  {activeLink === link.href && (
                    <motion.span 
                      className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400"
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
                scroll={false}
                onClick={(event) => {
                  scrollToId('contact', event);
                  setActiveLink('#contact');
                }}
                // Contact is deliberately not one of the four nav links, so the CTA is
                // the only thing that can announce it. The ring is visual only; without
                // this the reader is told nothing while the section is on screen.
                aria-current={activeLink === '#contact' ? 'true' : undefined}
                className={`ml-3 btn-primary-sm pulse-border transition-shadow ${
                  activeLink === '#contact' ? 'ring-2 ring-cyan-300/80 ring-offset-2 ring-offset-blue-900' : ''
                }`}
              >
                Get In Touch
              </Link>
            </motion.div>
          </motion.div>
        </nav>

        {/* Mobile Menu Button */}
        <motion.button
          className="p-2 rounded-full bg-blue-800/50 border border-blue-700/30 text-white md:hidden hover:bg-blue-700/70 transition-colors"
          onClick={() => {
            // Re-opening mid-exit cancels onExitComplete, so a queued link tap would
            // otherwise survive and fire on some later, unrelated close.
            pendingMobileScrollId.current = null;
            setIsMenuOpen(!isMenuOpen);
          }}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav"
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
      <AnimatePresence
        onExitComplete={() => {
          const id = pendingMobileScrollId.current;
          if (!id) return;
          pendingMobileScrollId.current = null;
          scrollToId(id);
        }}
      >
        {isMenuOpen && (
          <motion.nav 
            id="mobile-nav"
            className="container py-4 md:hidden"
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
                    scroll={false}
                    className={`block px-4 py-2 rounded-lg transition-colors nav-link no-underline ${
                      activeLink === link.href
                        ? 'active text-white font-medium bg-blue-700/40' 
                        : 'text-blue-200 hover:text-white hover:bg-blue-700/20'
                    }`}
                    onClick={(event) => handleMobileNav(event, link.href.slice(1))}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={itemVariants}>
                <Link
                  href="#contact"
                  scroll={false}
                  className="block btn-primary-sm w-full text-center"
                  onClick={(event) => handleMobileNav(event, 'contact')}
                >
                  Get In Touch
                </Link>
              </motion.div>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
} 