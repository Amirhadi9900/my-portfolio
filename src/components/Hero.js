'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Hero() {
  const [typedText, setTypedText] = useState('');
  const roles = ['Software Developer', 'Android Developer', 'Web Developer'];
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
      const currentRole = roles[roleIndex];
      
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
        setRoleIndex((prev) => (prev + 1) % roles.length);
        setTypingSpeed(500);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, isMounted, roleIndex, roles, typingSpeed]);

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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
          <motion.h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 cursor-pointer"
            style={{
              textShadow: '0 0 15px rgba(0, 0, 0, 0.8), 2px 2px 6px rgba(0, 0, 0, 0.9)',
              WebkitTextStroke: '1px rgba(0, 0, 0, 0.6)',
              filter: 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.8))',
              transformStyle: 'preserve-3d',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            variants={fadeInUp}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateZ(30px) rotateX(-8deg) rotateY(5deg) scale(1.05)';
              e.currentTarget.style.textShadow = '0 0 20px rgba(0, 0, 0, 0.9), 4px 4px 12px rgba(0, 0, 0, 1), 0 0 15px rgba(59, 130, 246, 0.8)';
              e.currentTarget.style.filter = 'drop-shadow(0 0 20px rgba(0, 0, 0, 1)) drop-shadow(0 10px 25px rgba(59, 130, 246, 0.4))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateZ(0px) rotateX(0deg) rotateY(0deg) scale(1)';
              e.currentTarget.style.textShadow = '0 0 15px rgba(0, 0, 0, 0.8), 2px 2px 6px rgba(0, 0, 0, 0.9)';
              e.currentTarget.style.filter = 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.8))';
            }}
          >
            Hi, I'm <span 
              className="text-white cursor-pointer inline-block"
              style={{
                textShadow: '0 0 15px rgba(0, 0, 0, 0.8), 2px 2px 6px rgba(0, 0, 0, 0.9), 0 0 8px rgba(59, 130, 246, 0.6)',
                WebkitTextStroke: '1px rgba(0, 0, 0, 0.6)',
                filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.4))',
                transformStyle: 'preserve-3d',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateZ(25px) rotateX(-5deg) rotateY(3deg) scale(1.1)';
                e.currentTarget.style.textShadow = '0 0 25px rgba(0, 0, 0, 1), 3px 3px 8px rgba(0, 0, 0, 1), 0 0 15px rgba(59, 130, 246, 0.9)';
                e.currentTarget.style.filter = 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.7)) drop-shadow(0 8px 20px rgba(0, 0, 0, 0.8))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateZ(0px) rotateX(0deg) rotateY(0deg) scale(1)';
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
                transformStyle: 'preserve-3d',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateZ(25px) rotateX(-5deg) rotateY(-3deg) scale(1.1)';
                e.currentTarget.style.textShadow = '0 0 25px rgba(0, 0, 0, 1), 3px 3px 8px rgba(0, 0, 0, 1), 0 0 15px rgba(59, 130, 246, 0.9)';
                e.currentTarget.style.filter = 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.7)) drop-shadow(0 8px 20px rgba(0, 0, 0, 0.8))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateZ(0px) rotateX(0deg) rotateY(0deg) scale(1)';
                e.currentTarget.style.textShadow = '0 0 15px rgba(0, 0, 0, 0.8), 2px 2px 6px rgba(0, 0, 0, 0.9), 0 0 8px rgba(59, 130, 246, 0.6)';
                e.currentTarget.style.filter = 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.4))';
              }}
            >Borjian</span>
          </motion.h1>

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
              className="text-rose-400 font-bold cursor-pointer inline-block"
              style={{
                textShadow: '0 0 10px rgba(59, 130, 246, 0.4), 0 0 15px rgba(0, 0, 0, 0.8), 1px 1px 4px rgba(0, 0, 0, 0.9)',
                transformStyle: 'preserve-3d',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                marginRight: '0.75rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateZ(15px) rotateX(-4deg) rotateY(2deg) scale(1.15)';
                e.currentTarget.style.textShadow = '0 0 20px rgba(244, 63, 94, 0.8), 0 0 25px rgba(0, 0, 0, 1), 2px 2px 6px rgba(0, 0, 0, 1)';
                e.currentTarget.style.filter = 'drop-shadow(0 0 15px rgba(244, 63, 94, 0.6)) drop-shadow(0 6px 15px rgba(0, 0, 0, 0.7))';
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
            className="text-lg sm:text-xl text-cyan-300 max-w-2xl mx-auto mb-12 leading-relaxed cursor-pointer"
            style={{
              textShadow: '0 0 8px rgba(0, 0, 0, 0.8), 1px 1px 3px rgba(0, 0, 0, 0.9)',
              background: 'rgba(0, 0, 0, 0.8)',
              padding: '1rem 1.5rem',
              borderRadius: '0.5rem',
              backdropFilter: 'blur(5px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transformStyle: 'preserve-3d',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}

          >
            Tech enthusiast and developer specializing in Android and web projects, committed to bringing creative visions to life. I develop modern and responsive websites with clean code and user-centric designs.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={fadeInUp}
          >
            <Link 
              href="#projects"
              className="px-6 py-3 relative group overflow-hidden font-bold rounded-xl text-white transition-all duration-500 ease-out transform hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
                backgroundSize: '200% 200%',
                animation: 'gradientShift 4s ease infinite',
                textShadow: '0 0 20px rgba(0, 0, 0, 0.8), 2px 2px 8px rgba(0, 0, 0, 1)',
                boxShadow: `
                  0 0 8px rgba(102, 126, 234, 0.2),
                  0 0 15px rgba(245, 87, 108, 0.15),
                  0 15px 35px rgba(0, 0, 0, 0.4),
                  inset 0 2px 0 rgba(255, 255, 255, 0.3),
                  inset 0 -2px 0 rgba(0, 0, 0, 0.3)
                `,
                transformStyle: 'preserve-3d',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateZ(35px) rotateX(-10deg) rotateY(-5deg) scale(1.08)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #0e2954 75%, #1a1a2e 100%)';
                e.currentTarget.style.backgroundSize = '300% 300%';
                e.currentTarget.style.textShadow = '0 0 30px rgba(0, 0, 0, 1), 3px 3px 10px rgba(0, 0, 0, 1), 0 0 20px rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.boxShadow = `
                  0 0 10px rgba(245, 87, 108, 0.25),
                  0 0 10px rgba(102, 126, 234, 0.2),
                  0 15px 35px rgba(0, 0, 0, 0.6)
                `;
                e.currentTarget.style.filter = `
                  drop-shadow(0 20px 40px rgba(245, 87, 108, 0.15))
                  drop-shadow(0 0 12px rgba(102, 126, 234, 0.2))
                  brightness(1.03)
                  saturate(1.05)
                `;
                
                // Add pulsing glow effect
                const glowKeyframes = `
                  @keyframes pulseGlow {
                    0%, 100% { box-shadow: 0 0 12px rgba(245, 87, 108, 0.25), 0 0 20px rgba(102, 126, 234, 0.2), 0 25px 50px rgba(0, 0, 0, 0.6); }
                    50% { box-shadow: 0 0 18px rgba(245, 87, 108, 0.35), 0 0 30px rgba(102, 126, 234, 0.3), 0 25px 50px rgba(0, 0, 0, 0.6); }
                  }
                `;
                
                if (!document.querySelector('#pulseGlowKeyframes')) {
                  const style = document.createElement('style');
                  style.id = 'pulseGlowKeyframes';
                  style.textContent = glowKeyframes;
                  document.head.appendChild(style);
                }
                
                e.currentTarget.style.animation = 'pulseGlow 2s ease-in-out infinite';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateZ(0px) rotateX(0deg) rotateY(0deg) scale(1)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)';
                e.currentTarget.style.backgroundSize = '200% 200%';
                e.currentTarget.style.textShadow = '0 0 20px rgba(0, 0, 0, 0.8), 2px 2px 8px rgba(0, 0, 0, 1)';
                e.currentTarget.style.boxShadow = `
                  0 0 8px rgba(102, 126, 234, 0.2),
                  0 0 15px rgba(245, 87, 108, 0.15),
                  0 15px 35px rgba(0, 0, 0, 0.4),
                  inset 0 2px 0 rgba(255, 255, 255, 0.3),
                  inset 0 -2px 0 rgba(0, 0, 0, 0.3)
                `;
                e.currentTarget.style.filter = 'none';
                e.currentTarget.style.animation = 'gradientShift 4s ease infinite';
              }}
            >
              {/* Animated Background Overlay */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.05) 50%, transparent 70%)',
                  backgroundSize: '200% 200%',
                  animation: 'shimmer 3s ease-in-out infinite'
                }}
              />
              
              {/* Premium Text with Enhanced Typography */}
              <span className="relative z-10 flex items-center gap-2 font-black text-base tracking-wide">
                <span>View My Work</span>
                
                {/* Animated Arrow Icon */}
                <span 
                  className="transform transition-transform duration-300 group-hover:translate-x-2 group-hover:scale-110"
                  style={{
                    filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z"/>
                  </svg>
                </span>
              </span>
            </Link>
            <Link 
              href="#contact"
              className="px-6 py-3 relative group overflow-hidden font-bold rounded-xl text-white transition-all duration-500 ease-out transform hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
                backgroundSize: '200% 200%',
                animation: 'gradientShift 4s ease infinite',
                textShadow: '0 0 20px rgba(0, 0, 0, 0.8), 2px 2px 8px rgba(0, 0, 0, 1)',
                boxShadow: `
                  0 0 8px rgba(102, 126, 234, 0.2),
                  0 0 15px rgba(245, 87, 108, 0.15),
                  0 15px 35px rgba(0, 0, 0, 0.4),
                  inset 0 2px 0 rgba(255, 255, 255, 0.3),
                  inset 0 -2px 0 rgba(0, 0, 0, 0.3)
                `,
                transformStyle: 'preserve-3d',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateZ(35px) rotateX(-10deg) rotateY(-5deg) scale(1.08)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #0e2954 75%, #1a1a2e 100%)';
                e.currentTarget.style.backgroundSize = '300% 300%';
                e.currentTarget.style.textShadow = '0 0 30px rgba(0, 0, 0, 1), 3px 3px 10px rgba(0, 0, 0, 1), 0 0 20px rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.boxShadow = `
                  0 0 12px rgba(245, 87, 108, 0.25),
                  0 0 20px rgba(102, 126, 234, 0.2),
                  0 25px 50px rgba(0, 0, 0, 0.6)
                `;
                e.currentTarget.style.filter = `
                  drop-shadow(0 20px 40px rgba(245, 87, 108, 0.15))
                  drop-shadow(0 0 12px rgba(102, 126, 234, 0.2))
                  brightness(1.03)
                  saturate(1.05)
                `;
                
                // Add pulsing glow effect
                const glowKeyframes = `
                  @keyframes pulseGlow {
                    0%, 100% { box-shadow: 0 0 12px rgba(245, 87, 108, 0.25), 0 0 20px rgba(102, 126, 234, 0.2), 0 25px 50px rgba(0, 0, 0, 0.6); }
                    50% { box-shadow: 0 0 18px rgba(245, 87, 108, 0.35), 0 0 30px rgba(102, 126, 234, 0.3), 0 25px 50px rgba(0, 0, 0, 0.6); }
                  }
                `;
                
                if (!document.querySelector('#pulseGlowKeyframes')) {
                  const style = document.createElement('style');
                  style.id = 'pulseGlowKeyframes';
                  style.textContent = glowKeyframes;
                  document.head.appendChild(style);
                }
                
                e.currentTarget.style.animation = 'pulseGlow 2s ease-in-out infinite';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateZ(0px) rotateX(0deg) rotateY(0deg) scale(1)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)';
                e.currentTarget.style.backgroundSize = '200% 200%';
                e.currentTarget.style.textShadow = '0 0 20px rgba(0, 0, 0, 0.8), 2px 2px 8px rgba(0, 0, 0, 1)';
                e.currentTarget.style.boxShadow = `
                  0 0 8px rgba(102, 126, 234, 0.2),
                  0 0 15px rgba(245, 87, 108, 0.15),
                  0 15px 35px rgba(0, 0, 0, 0.4),
                  inset 0 2px 0 rgba(255, 255, 255, 0.3),
                  inset 0 -2px 0 rgba(0, 0, 0, 0.3)
                `;
                e.currentTarget.style.filter = 'none';
                e.currentTarget.style.animation = 'gradientShift 4s ease infinite';
              }}
            >
              {/* Animated Background Overlay */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.05) 50%, transparent 70%)',
                  backgroundSize: '200% 200%',
                  animation: 'shimmer 3s ease-in-out infinite'
                }}
              />
              
              {/* Premium Text with Enhanced Typography */}
              <span className="relative z-10 flex items-center gap-2 font-black text-base tracking-wide">
                <span>Get In Touch</span>
                
                {/* Animated Arrow Icon */}
                <span 
                  className="transform transition-transform duration-300 group-hover:translate-x-2 group-hover:scale-110"
                  style={{
                    filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z"/>
                  </svg>
                </span>
              </span>
            </Link>
          </motion.div>

          {/* Social Links */}
          <motion.div 
            className="flex justify-center space-x-8 mt-16"
            variants={fadeInUp}
            style={{
              transformStyle: 'preserve-3d'
            }}
          >
            {/* GitHub Icon */}
            <a 
              href="https://github.com/Amirhadi9900" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative w-16 h-16 flex items-center justify-center rounded-2xl transition-all duration-500 ease-out overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
                boxShadow: `
                  0 8px 32px rgba(0, 0, 0, 0.4),
                  0 2px 8px rgba(0, 0, 0, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.3)
                `,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transformStyle: 'preserve-3d',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateZ(20px) rotateX(-10deg) rotateY(8deg) scale(1.1)';
                e.currentTarget.style.background = 'linear-gradient(145deg, #24292e, #1f2328)';
                e.currentTarget.style.boxShadow = `
                  0 20px 60px rgba(0, 0, 0, 0.5),
                  0 8px 32px rgba(0, 0, 0, 0.4),
                  inset 0 2px 0 rgba(255, 255, 255, 0.15),
                  inset 0 -2px 0 rgba(0, 0, 0, 0.4)
                `;
                e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateZ(0px) rotateX(0deg) rotateY(0deg) scale(1)';
                e.currentTarget.style.background = 'linear-gradient(145deg, #1a1a1a, #2d2d2d)';
                e.currentTarget.style.boxShadow = `
                  0 8px 32px rgba(0, 0, 0, 0.4),
                  0 2px 8px rgba(0, 0, 0, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.3)
                `;
                e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
              }}
            >
              {/* GitHub Icon Background Accent */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'radial-gradient(circle at center, rgba(88, 166, 255, 0.1) 0%, transparent 70%)'
                }}
              />
              
              {/* GitHub SVG Icon */}
              <svg 
                className="w-8 h-8 text-white relative z-10 transition-all duration-300 group-hover:scale-110" 
                fill="currentColor" 
                viewBox="0 0 24 24"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
                }}
              >
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>

            {/* LinkedIn Icon */}
            <a 
              href="https://www.linkedin.com/in/amirhadi-borjian-yazdi-5108431a1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative w-16 h-16 flex items-center justify-center rounded-2xl transition-all duration-500 ease-out overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #0a66c2, #004182)',
                boxShadow: `
                  0 8px 32px rgba(10, 102, 194, 0.3),
                  0 2px 8px rgba(0, 0, 0, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.3)
                `,
                border: '1px solid rgba(255, 255, 255, 0.15)',
                transformStyle: 'preserve-3d',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateZ(20px) rotateX(-10deg) rotateY(-8deg) scale(1.1)';
                e.currentTarget.style.background = 'linear-gradient(145deg, #0e76a8, #0a66c2)';
                e.currentTarget.style.boxShadow = `
                  0 20px 60px rgba(10, 102, 194, 0.4),
                  0 8px 32px rgba(0, 0, 0, 0.4),
                  inset 0 2px 0 rgba(255, 255, 255, 0.25),
                  inset 0 -2px 0 rgba(0, 0, 0, 0.4)
                `;
                e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateZ(0px) rotateX(0deg) rotateY(0deg) scale(1)';
                e.currentTarget.style.background = 'linear-gradient(145deg, #0a66c2, #004182)';
                e.currentTarget.style.boxShadow = `
                  0 8px 32px rgba(10, 102, 194, 0.3),
                  0 2px 8px rgba(0, 0, 0, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.3)
                `;
                e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.15)';
              }}
            >
              {/* LinkedIn Icon Background Accent */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)'
                }}
              />
              
              {/* LinkedIn SVG Icon */}
              <svg 
                className="w-8 h-8 text-white relative z-10 transition-all duration-300 group-hover:scale-110" 
                fill="currentColor" 
                viewBox="0 0 24 24"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
                }}
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>

            {/* Email Icon */}
            <a 
              href="mailto:amirhadib79@gmail.com"
              className="group relative w-16 h-16 flex items-center justify-center rounded-2xl transition-all duration-500 ease-out overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #ea4335, #c23321)',
                boxShadow: `
                  0 8px 32px rgba(234, 67, 53, 0.3),
                  0 2px 8px rgba(0, 0, 0, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.3)
                `,
                border: '1px solid rgba(255, 255, 255, 0.15)',
                transformStyle: 'preserve-3d',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateZ(20px) rotateX(-10deg) rotateY(10deg) scale(1.1)';
                e.currentTarget.style.background = 'linear-gradient(145deg, #f14336, #ea4335)';
                e.currentTarget.style.boxShadow = `
                  0 20px 60px rgba(234, 67, 53, 0.4),
                  0 8px 32px rgba(0, 0, 0, 0.4),
                  inset 0 2px 0 rgba(255, 255, 255, 0.25),
                  inset 0 -2px 0 rgba(0, 0, 0, 0.4)
                `;
                e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateZ(0px) rotateX(0deg) rotateY(0deg) scale(1)';
                e.currentTarget.style.background = 'linear-gradient(145deg, #ea4335, #c23321)';
                e.currentTarget.style.boxShadow = `
                  0 8px 32px rgba(234, 67, 53, 0.3),
                  0 2px 8px rgba(0, 0, 0, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.3)
                `;
                e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.15)';
              }}
            >
              {/* Email Icon Background Accent */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)'
                }}
              />
              
              {/* Email SVG Icon */}
              <svg 
                className="w-8 h-8 text-white relative z-10 transition-all duration-300 group-hover:scale-110" 
                fill="currentColor" 
                viewBox="0 0 24 24"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
                }}
              >
                <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
              </svg>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 