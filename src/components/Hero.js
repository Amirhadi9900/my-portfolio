'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { scrollToId } from '../lib/scroll-to-id';

const ROLES = ['Software Developer', 'Android Developer', 'Web Developer'];

export default function Hero() {
  const [typedText, setTypedText] = useState('');
  const [roleIndex, setRoleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);
  const [isMounted, setIsMounted] = useState(false);

  // Client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Typing animation
  useEffect(() => {
    if (!isMounted) return;

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
  }, [charIndex, isDeleting, isMounted, roleIndex, typingSpeed]);

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

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pb-20 sm:pb-24 md:pb-28">
      {/* Responsive background images */}
      <div className="absolute inset-0">
        {/* Mobile and tablet background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat lg:hidden"
          style={{
            backgroundImage: 'url("/image/mobile.png")'
          }}
        />
        {/* Desktop background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden lg:block"
          style={{
            backgroundImage: 'url("/image/desktop.png")'
          }}
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
            className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6"
            style={{
              textShadow: '0 0 15px rgba(0, 0, 0, 0.8), 2px 2px 6px rgba(0, 0, 0, 0.9)',
              WebkitTextStroke: '1px rgba(0, 0, 0, 0.6)',
              filter: 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.8))',
            }}
          >
            Hi, I&apos;m <span 
              className="text-white cursor-pointer inline-block"
              style={{
                textShadow: '0 0 15px rgba(0, 0, 0, 0.8), 2px 2px 6px rgba(0, 0, 0, 0.9), 0 0 8px rgba(59, 130, 246, 0.6)',
                WebkitTextStroke: '1px rgba(0, 0, 0, 0.6)',
                filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.4))',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), text-shadow 0.3s ease, filter 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.textShadow = '0 0 25px rgba(0, 0, 0, 1), 3px 3px 8px rgba(0, 0, 0, 1), 0 0 15px rgba(59, 130, 246, 0.9)';
                e.currentTarget.style.filter = 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.7)) drop-shadow(0 8px 20px rgba(0, 0, 0, 0.8))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.textShadow = '0 0 15px rgba(0, 0, 0, 0.8), 2px 2px 6px rgba(0, 0, 0, 0.9), 0 0 8px rgba(59, 130, 246, 0.6)';
                e.currentTarget.style.filter = 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.4))';
              }}
            >Amirhadi</span>
            <br />
            <span 
              className="text-white cursor-pointer inline-block"
              style={{
                textShadow: '0 0 15px rgba(0, 0, 0, 0.8), 2px 2px 6px rgba(0, 0, 0, 0.9), 0 0 8px rgba(59, 130, 246, 0.6)',
                WebkitTextStroke: '1px rgba(0, 0, 0, 0.6)',
                filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.4))',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), text-shadow 0.3s ease, filter 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.textShadow = '0 0 25px rgba(0, 0, 0, 1), 3px 3px 8px rgba(0, 0, 0, 1), 0 0 15px rgba(59, 130, 246, 0.9)';
                e.currentTarget.style.filter = 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.7)) drop-shadow(0 8px 20px rgba(0, 0, 0, 0.8))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.textShadow = '0 0 15px rgba(0, 0, 0, 0.8), 2px 2px 6px rgba(0, 0, 0, 0.9), 0 0 8px rgba(59, 130, 246, 0.6)';
                e.currentTarget.style.filter = 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.4))';
              }}
            >Borjian</span>
          </h1>

          {/* Typing Animation */}
          <motion.div 
            className="text-xl sm:text-2xl md:text-3xl font-light text-slate-300 mb-8 cursor-pointer"
            style={{
              textShadow: '0 0 10px rgba(0, 0, 0, 0.8), 1px 1px 4px rgba(0, 0, 0, 0.9)',
              transformStyle: 'preserve-3d',
              transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            variants={fadeInUp}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateZ(20px) rotateX(-6deg) rotateY(4deg) scale(1.08)';
              e.currentTarget.style.textShadow = '0 0 20px rgba(0, 0, 0, 0.9), 2px 2px 8px rgba(0, 0, 0, 1)';
              e.currentTarget.style.filter = 'drop-shadow(0 8px 20px rgba(0, 0, 0, 0.6))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateZ(0px) rotateX(0deg) rotateY(0deg) scale(1)';
              e.currentTarget.style.textShadow = '0 0 10px rgba(0, 0, 0, 0.8), 1px 1px 4px rgba(0, 0, 0, 0.9)';
              e.currentTarget.style.filter = 'none';
            }}
          >
            <span 
              className="text-blue-400 font-bold cursor-pointer inline-block"
              style={{
                textShadow: '0 0 10px rgba(59, 130, 246, 0.4), 0 0 15px rgba(0, 0, 0, 0.8), 1px 1px 4px rgba(0, 0, 0, 0.9)',
                transformStyle: 'preserve-3d',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                marginRight: '0.75rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateZ(15px) rotateX(-4deg) rotateY(2deg) scale(1.15)';
                e.currentTarget.style.textShadow = '0 0 20px rgba(59, 130, 246, 0.8), 0 0 25px rgba(0, 0, 0, 1), 2px 2px 6px rgba(0, 0, 0, 1)';
                e.currentTarget.style.filter = 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.6)) drop-shadow(0 6px 15px rgba(0, 0, 0, 0.7))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateZ(0px) rotateX(0deg) rotateY(0deg) scale(1)';
                e.currentTarget.style.textShadow = '0 0 10px rgba(59, 130, 246, 0.4), 0 0 15px rgba(0, 0, 0, 0.8), 1px 1px 4px rgba(0, 0, 0, 0.9)';
                e.currentTarget.style.filter = 'none';
              }}
            >I'm a</span>
            <span 
              className="text-white font-medium"
              style={{
                textShadow: '0 0 10px rgba(0, 0, 0, 0.8), 1px 1px 4px rgba(0, 0, 0, 0.9)',
                WebkitTextStroke: '0.5px rgba(255, 255, 255, 0.1)'
              }}
            >
              {typedText}
              <span 
                className="animate-pulse"
                style={{
                  textShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(59, 130, 246, 0.6)'
                }}
              >|</span>
            </span>
          </motion.div>

          {/* Description */}
          <motion.p
            className="text-lg sm:text-xl text-cyan-300 max-w-2xl mx-auto mb-12 leading-relaxed"
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
            Tech enthusiast and developer specializing in Android and web projects, committed to bringing creative visions to life. I develop modern and responsive websites with clean code and user-centric designs.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={fadeInUp}
          >
            <Link href="#projects" scroll={false} onClick={(event) => scrollToId('projects', event)} className="btn-primary min-w-[200px]">
              View My Work
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