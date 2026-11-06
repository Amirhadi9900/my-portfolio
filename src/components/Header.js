'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { scrollToId } from '../lib/scroll-to-id';
import { getActiveSectionId } from '../lib/active-section';

// The active-section marker. A hexagon because the hero IS a hex lattice and the finding
// cells already speak that dialect, so "you are here" now points at the same geometry the
// rest of the page is built from. 11x12 viewBox units, drawn once here and reused by the
// nav links and the contact CTA.
function HexMarker() {
  return (
    <svg width="11" height="12" viewBox="0 0 11 12" aria-hidden="true" focusable="false">
      <polygon
        points="5.5,0.6 10.2,3.3 10.2,8.7 5.5,11.4 0.8,8.7 0.8,3.3"
        fill="rgba(34,211,238,0.22)"
        stroke="rgba(103,232,249,0.9)"
        strokeWidth="0.9"
      />
    </svg>
  );
}

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
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 md:px-6">
      {/* The island. Inset from the edges deliberately: the material is glass, and glass needs
          something busy behind it to refract. A full-bleed band touching both edges has nothing
          to blur at the place a viewer would look for it, which is why the old bar's
          backdrop-blur was invisible. Height stays inside the 7rem `scroll-mt-28` the sections
          already reserve, so no scroll offset had to change. */}
      <div className={`nav-island container mx-auto flex items-center justify-between gap-3 py-2.5 pl-5 pr-2.5 md:pl-6 ${
        isScrolled ? 'is-scrolled' : ''
      }`}>
        <Link 
          href="/" 
          className="relative group header-glow no-underline"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="font-heading text-2xl font-bold tracking-tight text-white transition-all duration-300 group-hover:text-cyan-300">
              Amirhadi
            </span>{' '}
            <span className="font-heading text-2xl font-light logo-gradient transition-all duration-300">
              Borjian
            </span>
          </motion.div>
          
          {/* Animated underline for logo. One cyan hairline rather than a blue-400 → cyan-400
              gradient: the hero's edges are single-colour lines, and this was the third
              gradient bar on the page. */}
          <span className="absolute -bottom-1 left-0 w-0 h-px bg-cyan-300/80 transition-all duration-300 group-hover:w-full"></span>
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
                  className={`nav-link inline-flex items-center gap-[7px] px-3 lg:px-4 py-2 text-sm no-underline transition-all duration-300 ${
                    activeLink === link.href
                      ? 'active'
                      : 'text-slate-200/70 hover:text-white'
                  }`}
                  onClick={(event) => {
                    scrollToId(link.href.slice(1), event);
                    setActiveLink(link.href);
                  }}
                >
                  {/* Active marker: a cyan hexagon, not a bar. It sits before the label and the
                      link is inline-flex, so the word never shifts when the marker appears, and
                      "you are here" is no longer carried by colour alone. Same layoutId as
                      before, so it still glides from one item to the next. */}
                  {activeLink === link.href && (
                    <motion.span
                      className="inline-flex shrink-0"
                      layoutId="activeIndicator"
                      transition={{ type: 'spring', duration: 0.5 }}
                    >
                      <HexMarker />
                    </motion.span>
                  )}
                  {link.label}
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
                // Contact is deliberately not one of the four nav links, so the CTA is the only
                // thing that can announce it. It now does that with the same hexagon the links
                // use, placed absolutely inside the button's own 24px left padding so the label
                // cannot shift when the section changes.
                // `pulse-border` and the `ring-2` are gone. Both sat on the same edge that
                // already carries the glass rim: a slab with a physical side should not blink
                // like a warning light, and a Tailwind ring on top of a rim is two outlines
                // doing one job.
                aria-current={activeLink === '#contact' ? 'true' : undefined}
                className="ml-3 btn-primary-sm"
              >
                <span
                  aria-hidden="true"
                  className={`absolute left-2 top-0 bottom-0 flex items-center transition-opacity duration-300 ${
                    activeLink === '#contact' ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <HexMarker />
                </span>
                Get In Touch
              </Link>
            </motion.div>
          </motion.div>
        </nav>

        {/* Mobile Menu Button */}
        <motion.button
          ref={menuButtonRef}
          type="button"
          className="nav-disc md:hidden"
          onClick={() => {
            // Re-opening mid-exit cancels onExitComplete, so a queued link tap would
            // otherwise survive and fire on some later, unrelated close.
            pendingMobileScrollId.current = null;
            setIsMenuOpen(!isMenuOpen);
          }}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          // Only while the dialog exists. The takeover is mounted inside
          // `{isMenuOpen && ...}`, so an unconditional aria-controls points assistive
          // tech at an id that is not in the document for the whole closed state.
          aria-controls={isMenuOpen ? 'mobile-nav' : undefined}
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
            className="nav-sheet fixed inset-0 z-[60] flex flex-col overflow-y-auto md:hidden"
            variants={sheetContainer}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* The island again, literally the same class, inset by the same 16px and 12px.
                Opening the menu used to swap the top band for a different object: an opaque
                blue-950 strip with its own blur, its own padding and a 44px close button
                facing a 40px hamburger. Now the one thing the user was already looking at
                simply stays where it was. Sticky, and carrying the top inset itself rather
                than the scroll container, so the close control stays under the notch but
                never under the fold. */}
            <div
              className="sticky top-0 z-10 shrink-0 px-4 py-3"
              style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}
            >
              <div className="nav-island container mx-auto flex items-center justify-between gap-3 py-2.5 pl-5 pr-2.5">
                <span className="font-heading text-2xl font-bold tracking-tight text-white">
                  Amirhadi <span className="font-light logo-gradient">Borjian</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    pendingMobileScrollId.current = null;
                    setIsMenuOpen(false);
                  }}
                  aria-label="Close menu"
                  className="nav-disc"
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
            </div>

            {/* my-auto, not justify-center: a centred flex child overflows a scroll
                container by clipping its own top, and that half is unreachable. my-auto
                distributes the same free space when there is any and collapses to zero
                when there is not, so a landscape phone scrolls to every row instead of
                hiding the first one. */}
            {/* px-9, not px-6: the island's inset is 16px plus its own 20px padding, so 36px is
                the vertical the wordmark sits on, and the row's index number starts there too.
                The label itself lands at 65px because the `01` gutter sits in front of it, which
                is this panel's own editorial column, not a misalignment. */}
            <nav className="my-auto flex flex-col px-9">
              {navLinks.map((link, index) => (
                <motion.div key={link.href} variants={sheetItem}>
                  <Link
                    href={link.href}
                    scroll={false}
                    aria-current={activeLink === link.href ? 'true' : undefined}
                    className={`nav-link flex items-baseline gap-4 border-t border-white/10 py-5 no-underline ${
                      activeLink === link.href ? 'active' : 'text-slate-200/70 hover:text-white'
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
                    {/* The same hexagon the desktop links use, at the same 11x12, rather than
                        the 8px cyan bar this had before. Deliberately not scaled up to match
                        the 30px label: one marker, one size, everywhere it appears. */}
                    {activeLink === link.href && (
                      <span className="ml-auto self-center">
                        <HexMarker />
                      </span>
                    )}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div
              variants={sheetItem}
              className="shrink-0 border-t border-white/10 px-9 py-5"
              style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
            >
              <Link
                href="#contact"
                scroll={false}
                aria-current={activeLink === '#contact' ? 'true' : undefined}
                className="btn-primary-block w-full text-center"
                onClick={(event) => handleMobileNav(event, 'contact')}
              >
                {/* Same treatment as the desktop CTA: the marker lives in the button's own
                    32px left padding, absolutely placed, so it can never move the label. */}
                <span
                  aria-hidden="true"
                  className={`absolute left-2 top-0 bottom-0 flex items-center transition-opacity duration-300 ${
                    activeLink === '#contact' ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <HexMarker />
                </span>
                Get In Touch
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 