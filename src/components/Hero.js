'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useTransform, useAnimation, AnimatePresence } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { Button } from './ui/button';
import useTheme from '../hooks/useTheme';
import { useInView } from 'react-intersection-observer';

export default function Hero() {
  const { isDarkMode } = useTheme();
  const [typedText, setTypedText] = useState('');
  const roles = ['Software Developer', 'Android Developer', 'Web Developer'];
  const [roleIndex, setRoleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);
  const [isMounted, setIsMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [previousMousePosition, setPreviousMousePosition] = useState({ x: 0, y: 0 });
  
  const heroRef = useRef(null);
  const backgroundRef = useRef(null);
  const contentRef = useRef(null);
  const controls = useAnimation();

  // Particles for the background effect
  const [particles, setParticles] = useState([]);
  const [cubes, setCubes] = useState([]);
  const [hexagons, setHexagons] = useState([]);
  
  // Organized tech stack categories
  const techStack = [
    // Frontend
    { name: 'React', icon: '/icons/react.svg', category: 'frontend' },
    { name: 'Next.js', icon: '/icons/nextjs.svg', category: 'frontend' },
    { name: 'TypeScript', icon: '/icons/typescript.svg', category: 'frontend' },
    { name: 'JavaScript', icon: '/icons/javascript.svg', category: 'frontend' },
    // Backend & Tools
    { name: 'Firebase', icon: '/icons/firebase.svg', category: 'backend' },
    { name: 'Kotlin', icon: '/icons/kotlin.svg', category: 'backend' },
    // Styling
    { name: 'Tailwind CSS', icon: '/icons/tailwind.svg', category: 'styling' },
    { name: 'CSS3', icon: '/icons/css.svg', category: 'styling' }
  ];

  // Update perspective value for more dramatic 3D effect
  const [perspective, setPerspective] = useState(1500);
  
  // Enhanced 3D background elements
  const [floatingElements, setFloatingElements] = useState([]);
  
  // First useEffect for client-side mounting
  useEffect(() => {
    setIsMounted(true);
    
    // Start animations on mount
    if (controls) {
      controls.start("visible");
    }
  }, [controls]);

  // Enhanced text animations with letter-by-letter reveal
  const firstName = "Hi, I'm Amirhadi".split('');
  const lastName = "Borjian".split('');     
  const descriptionWords = "I'm a software developer who loves building cool stuff and solving tricky problems with code.".split(' ');
  
  // Add reference for gradient text animations
  const roleTextRef = useRef(null);
  
  // Add letter spacing animation
  const letterSpacing = useMotionValue(0);
  const opacity = useTransform(letterSpacing, [0, 1], [0.7, 1]);
  
  // Improved typing animation with dynamic pauses
  useEffect(() => {
    if (!isMounted) return;

    const handleTyping = () => {
      const currentRole = roles[roleIndex];
      
      if (isDeleting) {
        setTypedText(currentRole.substring(0, charIndex - 1));
        setCharIndex(prev => prev - 1);
        
        // Variable speed based on character position for more natural typing
        const variableSpeed = Math.max(70, Math.min(100, 80 + Math.random() * 30));
        setTypingSpeed(variableSpeed);
      } else {
        setTypedText(currentRole.substring(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
        
        // Add slight random variations in typing speed
        const variableSpeed = Math.max(120, Math.min(180, 150 + (Math.random() - 0.5) * 60));
        setTypingSpeed(variableSpeed);
        
        // Occasional pause at punctuation or space
        const char = currentRole[charIndex];
        if (char === ',' || char === '.' || char === ' ') {
          setTypingSpeed(prev => prev + Math.random() * 100);
        }
      }

      // Add more natural pauses at the end of words
      if (!isDeleting && charIndex === currentRole.length) {
        setIsDeleting(true);
        setTypingSpeed(1800 + Math.random() * 500); // Longer variable pause at the end
      } 
      // Natural transition between words
      else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % roles.length);
        setTypingSpeed(700 + Math.random() * 300);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, isMounted, roleIndex, roles, typingSpeed]);

  // Add gradient animation for role text
  useEffect(() => {
    if (!isMounted || !roleTextRef.current) return;
    
    const element = roleTextRef.current;
    let startPos = 0;
    
    const animateGradient = () => {
      startPos = (startPos + 1) % 360;
      element.style.backgroundImage = `linear-gradient(${startPos}deg, #60a5fa, #38bdf8, #0ea5e9, #7dd3fc)`;
      requestAnimationFrame(animateGradient);
    };
    
    const animation = requestAnimationFrame(animateGradient);
    return () => cancelAnimationFrame(animation);
  }, [isMounted]);
  
  // Improved mouse movement with smoother interpolation
  const throttleTimeout = useRef(null);
  const throttleDelay = 16; // ~60fps

  const handleMouseMove = useCallback((e) => {
    if (!isMounted || throttleTimeout.current) return;

    throttleTimeout.current = setTimeout(() => {
      throttleTimeout.current = null;

      // Calculate mouse position relative to center
      const { innerWidth, innerHeight } = window;
      const rawX = (e.clientX - innerWidth / 2) / innerWidth;
      const rawY = (e.clientY - innerHeight / 2) / innerHeight;
      
      // Smooth mouse movement with interpolation
      const smoothX = previousMousePosition.x * 0.8 + rawX * 0.2;
      const smoothY = previousMousePosition.y * 0.8 + rawY * 0.2;
      
      setPreviousMousePosition({ x: smoothX, y: smoothY });
      setMousePosition({ x: smoothX, y: smoothY });
      
      // Apply smoother 3D rotation with easing
      const scene = document.querySelector('.scene-container');
      if (scene) {
        // Use transform with transition property for smooth movement
        scene.style.transform = `rotateX(${smoothY * -8}deg) rotateY(${smoothX * 8}deg)`;
        scene.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';
      }
      
      // Smoother perspective adjustment
      setPerspective(1500 + Math.abs(smoothX * smoothY) * 500);

    }, throttleDelay);
    
  }, [isMounted, previousMousePosition, throttleDelay]);
  
  // Add mouse move event listener
  useEffect(() => {
    if (!isMounted) return;
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove, isMounted]);
  
  // Generate particles, cubes and hexagons for the 3D background
  useEffect(() => {
    // Generate fewer particles with increased depth variation
    const newParticles = Array.from({ length: 20 }, () => ({
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1, // Smaller size for less visual distraction
      depth: Math.random() * 400 - 200, // Less extreme depth variation
      opacity: Math.random() * 0.5 + 0.2, // Softer opacity
      speed: Math.random() * 1.5 + 0.5, // More consistent speed
    }));
    
    // Generate fewer 3D cubes with more consistent spacing
    const newCubes = Array.from({ length: 3 }, (_, i) => ({
      id: `cube-${i}`,
      x: 25 + i * 25, // Evenly spaced
      y: 30 + (i % 2) * 30, // Alternating heights
      z: -300 - i * 50, // Consistent depth spacing
      size: 40 + i * 10, // Graduated sizes
      rotation: i * 30, // Even rotation distribution
      speed: 0.15 + i * 0.05, // Consistent speed gradient
      color: `rgba(${Math.floor(100 + i * 20)}, ${Math.floor(
        120 + i * 15
      )}, ${Math.floor(180 + i * 10)}, ${0.07 + i * 0.02})`, // Consistent color gradient
    }));
    
    // Generate fewer hexagons with consistent placement
    const newHexagons = Array.from({ length: 4 }, (_, i) => ({
      id: `hex-${i}`,
      x: 20 + i * 20,
      y: 25 + (i % 3) * 25,
      size: 40 + i * 5,
      depth: -200 - i * 40,
      rotation: i * 45,
      speed: 0.3 + i * 0.1,
    }));
    
    // Create fewer floating elements with more consistent placement
    const newElements = Array.from({ length: 5 }, (_, i) => ({
      id: `element-${i}`,
      x: 20 + i * 15,
      y: 25 + (i % 3) * 20,
      z: -250 - i * 50,
      type: ['sphere', 'gradient-circle', 'circuit-node', 'gradient-circle', 'sphere'][i],
      size: 40 + i * 8,
      opacity: 0.2 + i * 0.05,
      speed: 0.2 + i * 0.04,
    }));
    
    setParticles(newParticles);
    setCubes(newCubes);
    setHexagons(newHexagons);
    setFloatingElements(newElements);
  }, [isMounted]);

  // Animation variants with improved easing
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8,
        ease: [0.1, 0.4, 0.2, 1] // Custom cubic-bezier for smoother motion
      }
    }
  };
  
  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.6,
        staggerChildren: 0.15 // Slightly slower staggering for smoother sequence
      }
    }
  };
  
  // Improved animations for tech badges with smoother transitions
  const floatingBadge = {
    initial: (i) => ({
      y: 0,
      opacity: 0,
      scale: 0.95
    }),
    animate: (i) => ({
      y: [0, -4, 0], // Reduced movement range
      opacity: 1,
      scale: 1,
      transition: {
        y: {
          duration: 5, // Longer duration
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut", // Smooth easing
          delay: i * 0.3
        },
        opacity: {
          duration: 1.2, // Slower fade in
          ease: "easeOut"
        },
        scale: {
          duration: 1.2, // Slower scale
          ease: "easeOut"
        }
      }
    })
  };
  
  // New subtle background noise animation with gentler transitions
  const noiseAnimation = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 0.02, // Reduced opacity
      transition: { 
        duration: 2.5, // Longer fade in
        ease: [0.1, 0.4, 0.3, 1] // Custom easing
      }
    }
  };
  
  // Container animation variant with smoother transitions
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1.2, // Longer overall transition
        staggerChildren: 0.12, // Slightly slower staggering
        delayChildren: 0.3, // Slight delay before starting
        ease: "easeOut" // Smooth easing
      }
    }
  };
  
  // Add this CSS class to utilize hardware acceleration for containers
  useEffect(() => {
    if (isMounted) {
      // Staggered activation of elements for smoother overall load
      const timer = setTimeout(() => {
        const animationElements = document.querySelectorAll('.gpu-accelerated');
        animationElements.forEach((el, index) => {
          if (el) {
            // Add staggered delay for smoother appearance
            setTimeout(() => {
              el.classList.add('animation-active');
            }, index * 50); // 50ms stagger between elements
          }
        });
      }, 200); // Longer delay before starting
      
      return () => clearTimeout(timer);
    }
  }, [isMounted]);

  return (
    <motion.div
      className="hero-container relative w-full overflow-hidden flex flex-col"
      style={{ minHeight: "100vh", maxHeight: "100vh" }}
      initial="hidden"
      animate={controls}
      variants={containerVariants}
    >
      {/* Advanced 3D scene with enhanced depth perception */}
      <div
        className="scene-container absolute inset-0 transform-style-3d"
        style={{
          perspective: `${perspective}px`,
          perspectiveOrigin: "center",
          transformStyle: "preserve-3d",
          transition: "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), perspective 0.8s ease-out",
        }}
      >
        {/* Layer 1: Deep Background (Furthest) */}
        <div
          className="ambient-light absolute inset-0 opacity-60 gpu-accelerated"
          style={{
            background: `radial-gradient(circle at ${50 + mousePosition.x * 15}% ${ 
              50 + mousePosition.y * 15
            }%, rgba(50, 100, 240, 0.12), rgba(10, 20, 30, 0.04))`,
            filter: "blur(120px)",
            transform: "translateZ(-500px)",
            willChange: "transform, opacity",
            transition: "background 0.8s ease-out",
          }}
        />
        <div
          className="holographic-grid absolute inset-0 opacity-80 gpu-accelerated"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(40, 80, 150, 0.06) 1px, transparent 1px), 
                              linear-gradient(to bottom, rgba(40, 80, 150, 0.06) 1px, transparent 1px)`,
            backgroundSize: "100px 100px",
            transform: `translateZ(-450px) translateX(${mousePosition.x * -8}px) translateY(${
              mousePosition.y * -8
            }px)`,
            willChange: "transform",
            transition: "transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        />
        
        {/* Layer 2: Mid-Ground Elements - reduce for better performance */}
        <div className="tech-lines absolute inset-0">
          {isMounted && Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`line-${i}`}
              className="tech-line absolute bg-blue-400/10 gpu-accelerated"
              style={{
                height: `${0.5 + (i * 0.1)}px`,
                width: `${10 + (i * 5)}%`,
                left: `${i < 3 ? i * 15 : 100 - (i * 15)}%`,
                top: `${20 + i * 15}%`,
                opacity: 0.13,
                transform: `translateZ(${-300 - (i * 20)}px)`,
                animation: "staticFloat 25s infinite cubic-bezier(0.45, 0.05, 0.55, 0.95)", // Improved easing
                animationDelay: `${i * 2.5}s`, // More staggered delays
                willChange: "transform",
              }}
            />
          ))}
        </div>
        
        {/* Particles - significantly reduced and simplified */}
        <div className="particles absolute inset-0">
          {isMounted && particles.slice(0, 12).map((particle, index) => (
            <div
              key={particle.id}
              className="particle absolute rounded-full bg-blue-300/60 gpu-accelerated"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                opacity: particle.opacity * 0.5,
                transform: `translateZ(${particle.depth - 150}px)`,
                animation: `smoothParticleFloat ${18 + index % 7}s infinite cubic-bezier(0.45, 0.05, 0.55, 0.95)`,
                animationDelay: `${index * 0.9}s`,
                willChange: "transform, opacity",
              }}
            />
          ))}
        </div>
        
        {/* Cubes - greatly reduced and simplified */}
        <div className="cubes absolute inset-0">
          {isMounted && cubes.slice(0, 2).map((cube, index) => (
            <div
              key={cube.id}
              className="cube absolute transform-style-3d gpu-accelerated"
              style={{
                width: `${cube.size}px`,
                height: `${cube.size}px`,
                left: `${index === 0 ? 20 : 80}%`,
                top: `${index === 0 ? 25 : 70}%`,
                transform: `translateZ(${cube.z}px)`,
                transformStyle: "preserve-3d",
                animation: `smoothCubeRotate ${35 + index * 15}s infinite cubic-bezier(0.4, 0.0, 0.6, 1.0)`,
                willChange: "transform",
              }}
            >
              {[...Array(6)].map((_, faceIndex) => (
                <div
                  key={faceIndex}
                  className="absolute w-full h-full border border-blue-300/8"
                  style={{
                    background: `rgba(56, 189, 248, 0.02)`,
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden",
                    transform: [
                      "rotateY(0deg) translateZ(calc(var(--size) / 2))",
                      "rotateY(180deg) translateZ(calc(var(--size) / 2))",
                      "rotateY(90deg) translateZ(calc(var(--size) / 2))",
                      "rotateY(-90deg) translateZ(calc(var(--size) / 2))",
                      "rotateX(90deg) translateZ(calc(var(--size) / 2))",
                      "rotateX(-90deg) translateZ(calc(var(--size) / 2))",
                    ][faceIndex],
                    opacity: 0.6,
                    "--size": `${cube.size}px`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        
        {/* Floating elements - significantly simplified */}
        <div className="floating-elements absolute inset-0">
          {isMounted && floatingElements.slice(0, 5).map((element, index) => (
            <div
              key={element.id}
              className={`absolute pointer-events-none gpu-accelerated ${
                element.type === 'circuit-node' ? 'circuit-node' : ''
              }`}
              style={{
                width: `${element.size * 0.7}px`,
                height: `${element.size * 0.7}px`,
                left: `${element.x}%`,
                top: `${element.y}%`,
                transform: `translateZ(${element.z}px)`,
                opacity: element.opacity * 0.6,
                background: element.type === 'gradient-circle' 
                  ? `radial-gradient(circle, rgba(56, 189, 248, ${element.opacity * 0.8}), transparent 75%)`
                  : element.type === 'sphere'
                  ? `rgba(56, 189, 248, ${element.opacity * 0.5})`
                  : element.type === 'circuit-node'
                  ? `rgba(56, 189, 248, ${element.opacity * 0.5})`
                  : 'transparent',
                borderRadius: element.type === 'gradient-circle' || element.type === 'sphere' || element.type === 'circuit-node' ? '50%' : '0',
                animation: `smoothFloat ${25 + index * 7}s infinite cubic-bezier(0.45, 0.05, 0.55, 0.95)`,
                animationDelay: `${index * 2.2}s`,
                willChange: "transform",
              }}
            >
              {element.type === 'triangle' && (
                <div 
                  style={{
                    width: '100%',
                    height: '100%',
                    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                    background: `linear-gradient(to bottom, rgba(56, 189, 248, ${element.opacity * 0.8}), rgba(30, 60, 120, ${element.opacity * 0.4}))`,
                  }}
                />
              )}
              {element.type === 'circuit-node' && (
                <>
                  <div className="circuit-line absolute h-[1px] w-[60px] bg-blue-300/8" 
                    style={{ 
                      left: '50%', 
                      top: '50%',
                      transform: 'translate(-50%, -50%) rotate(45deg)',
                    }} 
                  />
                  <div className="circuit-line absolute h-[1px] w-[60px] bg-blue-300/8" 
                    style={{ 
                      left: '50%', 
                      top: '50%',
                      transform: 'translate(-50%, -50%) rotate(-30deg)',
                    }} 
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Layer 3: Foreground Content */} 
      <div className="relative z-20 container mx-auto px-4 sm:px-6 flex flex-col items-center justify-center" style={{ height: "100vh" }}>
        <motion.div 
          className="content-container relative transform-style-3d text-center max-w-4xl mt-[-40px] sm:mt-0"
          style={{ 
            transform: `translateZ(50px) rotateX(${mousePosition.y * 1.5}deg) rotateY(${mousePosition.x * -1.5}deg)`,
            transition: "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
            willChange: "transform",
          }}
        >
          <motion.div className="flex flex-col items-center justify-center space-y-2 sm:space-y-4 w-full">
            {/* Enhanced heading - digital materialization with simplified approach */}
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-2"
              style={{ 
                textShadow: '0 0 8px rgba(100,200,255,0.1)',
                transform: 'translateZ(10px)',
                willChange: "transform, opacity",
              }}
            >
              <div className="flex flex-wrap justify-center">
                {firstName.map((letter, index) => (
                  <motion.span
                    key={`letter-first-${index}`}
                    className="inline-block relative overflow-hidden"
                    style={{ 
                      display: letter === ' ' ? 'inline-block' : 'inline-block',
                      marginBottom: '4px', // Add bottom margin to each letter
                    }}
                    initial={{ 
                      color: 'transparent',
                      textShadow: '0 0 8px rgba(56, 189, 248, 0.8)',
                    }}
                    animate={{
                      color: 'white',
                      textShadow: '0 0 8px rgba(100,200,255,0.1)',
                      transition: {
                        duration: 0.5,
                        delay: 0.05 * index,
                        ease: [0.2, 0.8, 0.2, 1]
                      }
                    }}
                  >
                    {letter === ' ' ? '\u00A0' : letter}
                    
                    {/* Digital scan line */}
                    <motion.div
                      className="absolute left-0 right-0 h-0.5 bg-blue-400"
                      style={{
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{
                        scaleX: [0, 1, 1, 0],
                        opacity: [0, 0.8, 0.8, 0],
                        transition: {
                          times: [0, 0.3, 0.7, 1],
                          duration: 0.7,
                          delay: 0.05 * index,
                          ease: "easeInOut"
                        }
                      }}
                    />
                    
                    {/* Simple flash overlay */}
                    <motion.div
                      className="absolute inset-0 bg-blue-400"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: [0, 0.2, 0],
                        transition: {
                          duration: 0.4,
                          delay: 0.05 * index + 0.3,
                          ease: "easeOut"
                        }
                      }}
                    />
                  </motion.span>
                ))}
              </div>
              
              <div className="flex flex-wrap justify-center mt-1 sm:mt-2">
                {lastName.map((letter, index) => (
                  <motion.span
                    key={`letter-last-${index}`}
                    className="inline-block relative overflow-hidden"
                    style={{ 
                      display: letter === ' ' ? 'inline-block' : 'inline-block',
                      marginBottom: '4px', // Add bottom margin to each letter
                    }}
                    initial={{ 
                      color: 'transparent',
                      textShadow: '0 0 8px rgba(56, 189, 248, 0.8)',
                    }}
                    animate={{
                      color: 'white',
                      textShadow: '0 0 8px rgba(100,200,255,0.1)',
                      transition: {
                        duration: 0.5,
                        delay: 0.05 * (index + firstName.length),
                        ease: [0.2, 0.8, 0.2, 1]
                      }
                    }}
                  >
                    {letter === ' ' ? '\u00A0' : letter}
                    
                    {/* Digital scan line */}
                    <motion.div
                      className="absolute left-0 right-0 h-0.5 bg-blue-400"
                      style={{
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{
                        scaleX: [0, 1, 1, 0],
                        opacity: [0, 0.8, 0.8, 0],
                        transition: {
                          times: [0, 0.3, 0.7, 1],
                          duration: 0.7,
                          delay: 0.05 * (index + firstName.length),
                          ease: "easeInOut"
                        }
                      }}
                    />
                    
                    {/* Simple flash overlay */}
                    <motion.div
                      className="absolute inset-0 bg-blue-400"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: [0, 0.2, 0],
                        transition: {
                          duration: 0.4,
                          delay: 0.05 * (index + firstName.length) + 0.3,
                          ease: "easeOut"
                        }
                      }}
                    />
                  </motion.span>
                ))}
              </div>
            </motion.h1>
            
            {/* Role text with digital terminal effect */}
            <motion.div 
              variants={{
                hidden: { opacity: 0 },
                visible: { 
                  opacity: 1, 
                  transition: { 
                    duration: 0.8, 
                    delay: 0.15, 
                    ease: "easeOut" 
                  }
                }
              }}
              className="h-10 sm:h-12 md:h-14 flex items-center justify-center w-full mt-1 sm:mt-2 mb-1 sm:mb-2 role-text"
              style={{ transform: 'translateZ(10px)' }}
            >
              <motion.div 
                className="relative text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold overflow-hidden"
                style={{
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  backgroundImage: "linear-gradient(90deg, #60a5fa, #38bdf8, #0ea5e9, #7dd3fc)",
                  backgroundSize: "200% auto",
                  filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.25))',
                }}
                animate={{
                  backgroundPosition: ["0% center", "200% center"],
                  transition: {
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear"
                  }
                }}
              >
                {/* Terminal-style typed text */}
                <span className="inline-block">{typedText}</span>
                
                {/* Cursor */}
                <motion.span
                  className="inline-block w-[2px] ml-1 bg-blue-400"
                  style={{ height: "1em", verticalAlign: "middle" }}
                  animate={{ 
                    opacity: [1, 0, 1],
                    transition: { 
                      duration: 1, 
                      repeat: Infinity, 
                      ease: "steps(1)" 
                    }
                  }}
                />
                
                {/* Digital noise line */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                  animate={{
                    scaleX: [0, 1],
                    opacity: [0, 0.7, 0],
                    transition: {
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "easeInOut",
                      times: [0, 0.5, 1]
                    }
                  }}
                />
              </motion.div>
            </motion.div>

            {/* Description with digital reveal effect */}
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { 
                    duration: 0.5, 
                    delay: 0.2,
                    ease: "easeOut"
                  } 
                }
              }}
              className="text-sm sm:text-base md:text-lg text-gray-300 mt-1 sm:mt-2 mb-2 sm:mb-3 max-w-3xl mx-auto relative px-4 sm:px-0"
              style={{ transform: 'translateZ(5px)' }}
            >
              {/* Digital reveal effect container */}
              <span className="relative inline-block w-full">
                {/* Actual description text */}
                <span className="relative z-10">
                  Tech enthusiast and developer specializing in Android and web projects, committed to bringing creative visions to life.
                  I develop modern and responsive websites with clean code and user-centric designs. 
                </span>
                
                {/* Scan line animation */}
                <motion.span 
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/30 to-transparent"
                  style={{ height: '3px' }}
                  initial={{ top: 0, opacity: 0 }}
                  animate={{
                    top: ['0%', '100%'],
                    opacity: [0, 1, 0],
                    transition: {
                      duration: 1.5,
                      ease: "easeInOut",
                      delay: 0.3
                    }
                  }}
                />
                
                {/* Text reveal mask */}
                <motion.span 
                  className="absolute inset-0 bg-gray-900"
                  initial={{ top: 0 }}
                  animate={{
                    top: ['0%', '100%'],
                    transition: {
                      duration: 1.2,
                      ease: "easeInOut",
                      delay: 0.3
                    }
                  }}
                />
              </span>
            </motion.p>

            {/* Enhanced buttons with micro-interactions */}
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: { 
                  opacity: 1, 
                  transition: { 
                    duration: 0.8, 
                    delay: 0.4, 
                    ease: "easeOut" 
                  }
                }
              }}
              className="flex flex-wrap justify-center gap-2 sm:gap-3 relative mt-1 sm:mt-2 mb-2 sm:mb-3 button-container"
              style={{ transform: 'translateZ(20px)' }}
            >
              <motion.a
                href="#projects"
                className="relative depth-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-2 sm:py-2.5 px-6 sm:px-7 rounded-lg overflow-hidden group text-sm sm:text-base"
                initial={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                whileHover={{ 
                  scale: 1.03, 
                  y: -2,
                  boxShadow: '0 10px 25px -5px rgba(14, 165, 233, 0.4), 0 8px 10px -6px rgba(14, 165, 233, 0.2)',
                  transition: { 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 15 
                  }
                }}
                whileTap={{ 
                  scale: 0.97,
                  boxShadow: '0 5px 15px -3px rgba(14, 165, 233, 0.3), 0 4px 6px -4px rgba(14, 165, 233, 0.2)',
                  transition: { 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 15 
                  }
                }}
              >
                {/* Background gradient shift animation */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600"
                  initial={{ opacity: 0 }}
                  whileHover={{ 
                    opacity: 1,
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    transition: { 
                      backgroundPosition: {
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                      },
                      opacity: { duration: 0.3 }
                    }
                  }}
                  style={{ 
                    backgroundSize: '200% 200%',
                  }}
                />
                
                {/* Button glow effect */}
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-60"
                  initial={{ opacity: 0 }}
                  whileHover={{ 
                    opacity: [0, 0.2, 0.1],
                    transition: { 
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: 'reverse'
                    }
                  }}
                  style={{
                    background: 'radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.4), transparent 70%)',
                    filter: 'blur(8px)'
                  }}
                />
                
                {/* Button highlights */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>
                  <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-white/80 via-white/40 to-transparent"></div>
                </div>
                
                {/* Button text with subtle movement */}
                <motion.span 
                  className="relative z-10 inline-flex items-center"
                  whileHover={{
                    textShadow: '0 0 8px rgba(255, 255, 255, 0.5)'
                  }}
                >
                  <span>View My Work</span>
                  <motion.svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1.5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    initial={{ x: 0, opacity: 0.5 }}
                    whileHover={{ 
                      x: 3, 
                      opacity: 1,
                      transition: { 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 10 
                      }
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </motion.svg>
                </motion.span>
              </motion.a>
              
              <motion.a
                href="#contact"
                className="relative depth-4 bg-transparent text-blue-400 font-semibold py-2 sm:py-2.5 px-6 sm:px-7 border border-blue-500 rounded-lg overflow-hidden group text-sm sm:text-base"
                initial={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}
                whileHover={{ 
                  scale: 1.03, 
                  y: -2,
                  boxShadow: '0 10px 25px -5px rgba(14, 165, 233, 0.15), 0 8px 10px -6px rgba(14, 165, 233, 0.1)',
                  borderColor: 'rgba(56, 189, 248, 0.8)',
                  transition: { 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 15,
                    borderColor: { duration: 0.2 }
                  }
                }}
                whileTap={{ 
                  scale: 0.97,
                  boxShadow: '0 5px 15px -3px rgba(14, 165, 233, 0.1), 0 4px 6px -4px rgba(14, 165, 233, 0.05)',
                  transition: { 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 15 
                  }
                }}
              >
                {/* Button background glow */}
                <motion.div 
                  className="absolute inset-0 opacity-0"
                  initial={{ opacity: 0 }}
                  whileHover={{ 
                    opacity: 0.1,
                    transition: { duration: 0.3 }
                  }}
                  style={{
                    background: 'radial-gradient(circle at center, rgba(56, 189, 248, 0.3), transparent 70%)'
                  }}
                />
                
                {/* Animated border effect */}
                <motion.div 
                  className="absolute inset-[1px] rounded-md overflow-hidden pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileHover={{ 
                    opacity: 1,
                    transition: { duration: 0.3 }
                  }}
                >
                  <div className="absolute inset-0 bg-blue-500/10"></div>
                  <div className="hologram-scanline absolute inset-0 w-full h-full overflow-hidden">
                    <motion.div 
                      className="scanline absolute h-[1px] w-full bg-blue-400/50"
                      initial={{ top: "-100%" }}
                      whileHover={{
                        top: ["0%", "100%"],
                        transition: {
                          top: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }
                        }
                      }}
                    />
                  </div>
                </motion.div>
                
                {/* Button text with subtle blue glow */}
                <motion.span 
                  className="relative z-10 inline-flex items-center"
                  initial={{ textShadow: '0 0 0px rgba(56, 189, 248, 0)' }}
                  whileHover={{
                    color: 'rgba(56, 189, 248, 1)',
                    textShadow: '0 0 8px rgba(56, 189, 248, 0.4)',
                    transition: { duration: 0.3 }
                  }}
                >
                  <span>Contact Me</span>
                  <motion.svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1.5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    initial={{ opacity: 0.7, scale: 1 }}
                    whileHover={{ 
                      opacity: 1, 
                      scale: 1.1,
                      transition: { 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 10,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </motion.svg>
                </motion.span>
              </motion.a>
            </motion.div>
            
            {/* Social links with holographic effects */}
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: { 
                  opacity: 1, 
                  transition: { 
                    duration: 0.8, 
                    delay: 0.6, 
                    ease: "easeOut" 
                  }
                }
              }}
              className="flex justify-center gap-3 mt-2 sm:mt-4"
              style={{ transform: 'translateZ(15px)' }}
            >
              {[
                { name: 'GitHub', url: 'https://github.com/Amirhadi9900', icon: 'G' },
                { name: 'LinkedIn', url: 'https://www.linkedin.com/in/amirhadi-borjian-yazdi-5108431a1', icon: 'L' },
                { name: 'Email', url: 'mailto:amirhadib79@gmail.com', icon: 'E' }
              ].map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 transform-style-3d tech-badge"
                  style={{ 
                    boxShadow: 'inset 0 0 20px rgba(56, 189, 248, 0)',
                    transition: 'box-shadow 0.5s ease, color 0.5s ease, transform 0.5s ease',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { 
                      duration: 0.5,
                      delay: 0.7 + (index * 0.1)
                    }
                  }}
                  whileHover={{ 
                    scale: 1.15, 
                    color: 'rgb(56, 189, 248)',
                    boxShadow: '0 0 20px rgba(56, 189, 248, 0.4), inset 0 0 20px rgba(56, 189, 248, 0.4)',
                    transition: { 
                      type: "spring", 
                      stiffness: 300, 
                      damping: 15,
                    }
                  }}
                  whileTap={{ 
                    scale: 0.95,
                    transition: { duration: 0.1 }
                  }}
                >
                  <span className="sr-only">{social.name}</span>
                  
                  {/* Inner circular glow */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    initial={{ opacity: 0, scale: 0.6 }}
                    whileHover={{ 
                      opacity: 0.15, 
                      scale: 1,
                      background: 'radial-gradient(circle at center, rgba(56, 189, 248, 0.8), transparent 70%)',
                      boxShadow: 'inset 0 0 10px rgba(56, 189, 248, 0.5)',
                      transition: { duration: 0.3 }
                    }}
                  />
                  
                  {/* Ring animation */}
                  <motion.div
                    className="absolute inset-0 rounded-full border border-blue-400/0"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ 
                      opacity: 1, 
                      scale: [0.8, 1.1, 0.8],
                      borderColor: ['rgba(56, 189, 248, 0)', 'rgba(56, 189, 248, 0.3)', 'rgba(56, 189, 248, 0)'],
                      transition: { 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                    }}
                  />
                  
                  <span className="text-xl relative z-10">{social.icon}</span>
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator with holographic effect */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { 
            opacity: [0, 1, 0.8], 
            y: 0,
            transition: { 
              opacity: {
                duration: 2,
                times: [0, 0.2, 1],
                repeat: Infinity,
                repeatType: "reverse"
              },
              y: {
                duration: 0.5,
                delay: 0.8
              }
            } 
          }
        }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer hidden sm:block"
        onClick={() => {
          window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
          });
        }}
        style={{ transform: 'translateZ(25px)' }}
      >
        <motion.div
          className="hologram-scanline absolute inset-0 w-full h-full overflow-hidden"
        >
          <motion.div 
            className="scanline absolute h-[1px] w-full bg-blue-400/50"
            initial={{ top: "-100%" }}
            whileHover={{
              top: ["0%", "100%"],
              transition: {
                top: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}