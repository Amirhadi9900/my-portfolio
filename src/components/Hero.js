'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { scrollToId } from '../lib/scroll-to-id';
import ScrambleWord from './ScrambleWord';

const ROLES = ['Pentester', 'Android Developer', 'Web Developer'];

export default function Hero() {
  const [typedText, setTypedText] = useState('');
  const [roleIndex, setRoleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);
  const [isMounted, setIsMounted] = useState(false);
  const [typingPaused, setTypingPaused] = useState(false);

  // Client-side mounting
  useEffect(() => {
    // Gates animations that must not run during prerender; there is nothing to
    // derive it from at render time because the server has no equivalent state.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount gate
    setIsMounted(true);
  }, []);

  // Typing animation
  useEffect(() => {
    if (!isMounted || typingPaused) return;

    const handleTyping = () => {
      const currentRole = ROLES[roleIndex];
      
      if (isDeleting) {
        setTypedText(currentRole.substring(0, charIndex - 1));
        setCharIndex(prev => prev - 1);
        setTypingSpeed(80);
      } else {
        setTypedText(currentRole.substring(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
        setTypingSpeed(150);
      }

      if (!isDeleting && charIndex === currentRole.length) {
        setIsDeleting(true);
        setTypingSpeed(2000);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % ROLES.length);
        setTypingSpeed(500);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, isMounted, roleIndex, typingPaused, typingSpeed]);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  // roleIndex only advances once the previous word is fully deleted, so it always
  // names the word on screen. The article has to follow it: the prefix used to be a
  // hardcoded "a", which read as "I'm a Android Developer" for a third of the loop.
  const article = /^[aeiou]/i.test(ROLES[roleIndex]) ? 'an' : 'a';

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pb-20 sm:pb-24 md:pb-28">
      {/* Responsive background images */}
      <div className="absolute inset-0">
        {/* Mobile and tablet background */}
        <div
          className="hero-bg-mobile absolute inset-0 bg-cover bg-center bg-no-repeat lg:hidden"
        />
        {/* Desktop background */}
        <div
          className="hero-bg-desktop absolute inset-0 bg-cover bg-center bg-no-repeat hidden lg:block"
        />
        {/* Optional overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center pt-20 sm:pt-24">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={staggerChildren}
          style={{
            perspective: '1000px',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Main Heading */}
          <h1
            className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6"
            style={{
              textShadow: '0 0 15px rgba(0, 0, 0, 0.8), 2px 2px 6px rgba(0, 0, 0, 0.9)',
              filter: 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.8))',
            }}
          >
            Hi, I&apos;m <ScrambleWord text="Amirhadi" className="text-white" />
            <br />
            <ScrambleWord text="Borjian" delay={180} className="text-white" />
          </h1>

          {/* Typing Animation — click to pause and resume */}
          <div
            data-cursor-hover
            role="button"
            tabIndex={0}
            aria-pressed={typingPaused}
            aria-label={typingPaused ? 'Resume the rotating role text' : 'Pause the rotating role text'}
            title={typingPaused ? 'Click to resume' : 'Click to pause'}
            onClick={() => setTypingPaused(prev => !prev)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setTypingPaused(prev => !prev);
              }
            }}
            className="text-xl sm:text-2xl md:text-3xl font-light text-slate-300 mb-8 cursor-pointer select-none"
            style={{
              textShadow: '0 0 10px rgba(0, 0, 0, 0.8), 1px 1px 4px rgba(0, 0, 0, 0.9)'
            }}
          >
            <span 
              data-cursor-hover
              className="text-blue-400 font-bold cursor-pointer inline-block"
              style={{
                textShadow: '0 0 10px rgba(59, 130, 246, 0.4), 0 0 15px rgba(0, 0, 0, 0.8), 1px 1px 4px rgba(0, 0, 0, 0.9)',
                marginRight: '0.75rem'
              }}
            >I&apos;m {article}</span>
            <span 
              className="text-white font-medium"
              style={{
                textShadow: '0 0 10px rgba(0, 0, 0, 0.8), 1px 1px 4px rgba(0, 0, 0, 0.9)',
                WebkitTextStroke: '0.5px rgba(255, 255, 255, 0.1)'
              }}
            >
              {typedText}
              <span 
                style={{
                  textShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(59, 130, 246, 0.6)'
                }}
              >|</span>
            </span>
          </div>

          {/* Description */}
          <motion.p
            className="text-lg sm:text-xl text-cyan-300 mx-auto mb-12 leading-relaxed max-w-xl sm:max-w-2xl lg:max-w-5xl"
            style={{
              textShadow: '0 0 8px rgba(0, 0, 0, 0.8), 1px 1px 3px rgba(0, 0, 0, 0.9)',
              background: 'rgba(0, 0, 0, 0.8)',
              padding: '1rem 1.5rem',
              borderRadius: '0.5rem',
              backdropFilter: 'blur(5px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            variants={fadeInUp}
          >
            <span className="block">
              Tech enthusiast and developer specializing in Android and web projects
              <span className="cursor-blink" aria-hidden="true">_</span>
            </span>
            <span className="block mt-[1.625em]">
              I develop modern, secure, and responsive web apps with clean code and user-centric designs
              <span className="cursor-blink" aria-hidden="true">_</span>
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={fadeInUp}
          >
            <Link href="#services" scroll={false} onClick={(event) => scrollToId('services', event)} className="btn-primary min-w-[200px]">
              View My Services
            </Link>
            <Link href="#contact" scroll={false} onClick={(event) => scrollToId('contact', event)} className="btn-primary min-w-[200px]">
              Get In Touch
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 