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
  const menuButtonRef = useRef(null);
  const overlayRef = useRef(null);

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

  // The takeover covers the whole viewport, so while it is open it owns the page: the
  // body stops scrolling behind it, keyboard focus starts inside it and cannot tab out,
  // and closing hands focus back to the button that opened it. Restoring in the cleanup
  // rather than in onExitComplete means focus still comes home when re-opening the menu
  // mid-exit cancels that animation and onExitComplete never fires.
  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const overlay = overlayRef.current;
    const toggleButton = menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusables = () =>
      overlay
        ? [...overlay.querySelectorAll('a[href], button:not([disabled])')].filter((el) => el.getClientRects().length > 0)
        : [];

    focusables()[0]?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !(overlay && overlay.contains(active)))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    // Opening at 400px and then rotating a tablet to 800px would otherwise leave an
    // invisible overlay locking body scroll: md:hidden hides the element without
    // unmounting it, so nothing else ever unlocks the page.
    const wide = window.matchMedia('(min-width: 768px)');
    const closeIfWide = (event) => {
      if (event.matches) setIsMenuOpen(false);
    };
    wide.addEventListener('change', closeIfWide);

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      wide.removeEventListener('change', closeIfWide);
      document.body.style.overflow = previousOverflow;
      toggleButton?.focus();
    };
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

  // The overlay gets its own variants rather than reusing the two above: the desktop nav
  // fades *down* from the header and the takeover rises from below, and changing the
  // shared pair would move both. No clip-path wipe, deliberately. MotionConfig's
  // reducedMotion="user" only suppresses transform and layout animation, so a clip reveal
  // would keep playing for visitors who asked us not to move things; y is a transform, so
  // these collapse to plain opacity fades for them.
  const sheetContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.22, ease: 'easeOut', staggerChildren: 0.06, delayChildren: 0.08 }
    },
    exit: { opacity: 0, transition: { duration: 0.16, ease: 'easeIn' } }
  };

  const sheetItem = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: 'easeOut' } },
    exit: { opacity: 0, y: 8, transition: { duration: 0.16 } }
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
    <>
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
          ref={menuButtonRef}
          type="button"
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
    </header>

      {/* Mobile Navigation: a full-bleed takeover, not a dropdown. It is a sibling of the
          header rather than a child because it covers the header band as well; nested
          inside, it would inherit that element's stacking context and sit under the very
          logo it is meant to replace. The logo is redrawn inside for that reason. */}
      <AnimatePresence
        onExitComplete={() => {
          const id = pendingMobileScrollId.current;
          if (!id) return;
          pendingMobileScrollId.current = null;
          scrollToId(id);
        }}
      >
        {isMenuOpen && (
          <motion.div
            ref={overlayRef}
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-gradient-to-b from-blue-950 via-blue-950 to-slate-950 md:hidden"
            variants={sheetContainer}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Sticky, and carrying the top inset itself rather than the scroll container,
                so the close button stays under the notch but never under the fold. */}
            <div
              className="sticky top-0 z-10 flex shrink-0 items-center justify-between bg-blue-950/85 px-6 py-4 backdrop-blur-sm"
              style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}
            >
              <span className="font-heading text-lg font-bold tracking-tight text-white">
                Amirhadi <span className="font-light logo-gradient">Borjian</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  pendingMobileScrollId.current = null;
                  setIsMenuOpen(false);
                }}
                aria-label="Close menu"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-blue-700/40 bg-blue-900/60 text-white transition-colors hover:bg-blue-800/80"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* my-auto, not justify-center: a centred flex child overflows a scroll
                container by clipping its own top, and that half is unreachable. my-auto
                distributes the same free space when there is any and collapses to zero
                when there is not, so a landscape phone scrolls to every row instead of
                hiding the first one. */}
            <nav className="my-auto flex flex-col px-6">
              {navLinks.map((link, index) => (
                <motion.div key={link.href} variants={sheetItem}>
                  <Link
                    href={link.href}
                    scroll={false}
                    aria-current={activeLink === link.href ? 'true' : undefined}
                    className={`flex items-baseline gap-4 border-t border-white/10 py-5 no-underline transition-colors ${
                      activeLink === link.href ? 'text-white' : 'text-blue-200/80 hover:text-white'
                    }`}
                    onClick={(event) => handleMobileNav(event, link.href.slice(1))}
                  >
                    <span
                      className={`font-mono text-[11px] ${
                        activeLink === link.href ? 'text-cyan-300' : 'text-cyan-300/70'
                      }`}
                    >
                      0{index + 1}
                    </span>
                    <span className="font-heading text-3xl">{link.label}</span>
                    {activeLink === link.href && (
                      <span className="ml-auto h-8 w-0.5 self-center bg-cyan-300" />
                    )}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div
              variants={sheetItem}
              className="shrink-0 border-t border-white/10 px-6 py-5"
              style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
            >
              <Link
                href="#contact"
                scroll={false}
                aria-current={activeLink === '#contact' ? 'true' : undefined}
                className="btn-primary-block w-full text-center"
                onClick={(event) => handleMobileNav(event, 'contact')}
              >
                Get In Touch
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 