'use client';

import Image from 'next/image';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

export default function About() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  // Add mouse interaction for the profile picture
  const [isMounted, setIsMounted] = useState(false);
  const profileRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Transform mouse position to rotate the image slightly
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);
  const glowX = useTransform(mouseX, [-300, 300], [0, 100]);
  const glowY = useTransform(mouseY, [-300, 300], [0, 100]);

  // Handle mouse move over the profile picture
  const handleMouseMove = (e) => {
    if (!profileRef.current) return;
    
    const rect = profileRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };
  
  // Reset position when mouse leaves
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section id="about" className="section py-28 bg-gradient-to-b from-gray-50/80 to-gray-100/90 dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-70"></div>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 dark:bg-blue-700/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 dark:bg-purple-700/10 rounded-full blur-3xl"></div>
      
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
              <span>Personal Journey</span>
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-blue-600/70 dark:to-blue-400/70"></span>
            </div>
          </div>
          <h2 className="heading text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 tracking-tight">About Me</h2>
          <p className="subheading text-xl text-gray-600 dark:text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">My background, experience, and what I do</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 items-center">
          <motion.div
            className="relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
          >
            {/* Modern profile image container with effects */}
            <motion.div 
              ref={profileRef}
              className="relative mx-auto w-[300px] h-[350px] md:w-[350px] md:h-[450px] transform-gpu"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                perspective: 1000,
                transformStyle: "preserve-3d",
                rotateX,
                rotateY,
              }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Holographic border effect */}
              <motion.div 
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: `linear-gradient(45deg, 
                    rgba(0, 255, 255, 0.3), 
                    rgba(255, 0, 255, 0.3), 
                    rgba(0, 255, 255, 0.3))`,
                  backgroundSize: "200% 200%",
                  transform: "translateZ(-10px)",
                  filter: "blur(8px)",
                  opacity: 0.7,
                }}
                animate={{
                  backgroundPosition: ["0% 0%", "100% 100%"],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
              
              {/* Interactive glow effect */}
              <motion.div 
                className="absolute -inset-0.5 rounded-2xl opacity-70"
                style={{
                  background: `radial-gradient(circle at ${glowX}% ${glowY}%, 
                    rgba(56, 189, 248, 0.8), 
                    rgba(95, 75, 239, 0.6), 
                    transparent 70%)`,
                  filter: "blur(20px)",
                }}
              />
              
              {/* Main border container */}
              <motion.div 
                className="absolute inset-[3px] rounded-xl overflow-hidden border-2 border-white/20 shadow-[0_10px_30px_rgba(59,130,246,0.3)]"
                style={{ transform: "translateZ(0px)" }}
              >
                <div className="h-full w-full overflow-hidden rounded-lg shadow-inner shadow-gray-800/25">
                  {/* Image */}
                  <Image
                    src="/image/borjian.png"
                    alt="Amirhadi Borjian Yazdi"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                  
                  {/* Overlay scan line effect */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-400/10 to-transparent"
                    style={{ height: '3px' }}
                    animate={{
                      top: ["0%", "100%"],
                      opacity: [0, 0.5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  
                  {/* Holographic overlay */}
                  <motion.div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: "linear-gradient(to right, transparent, rgba(56, 189, 248, 0.3), transparent)",
                      transform: "rotate(30deg) translateX(-100%)",
                    }}
                    animate={{ translateX: ["100%", "-100%"] }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </div>
              </motion.div>
              
              {/* Corner accent */}
              <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-tr from-transparent to-blue-500 opacity-80 rounded-br-3xl blur-sm z-[-1]"></div>
              <div className="absolute -top-2 -left-2 w-20 h-20 bg-gradient-to-br from-purple-500 to-transparent opacity-80 rounded-tl-3xl blur-sm z-[-1]"></div>
            </motion.div>
            
            {/* Experience badges */}
            <motion.div 
              className="absolute -bottom-6 -left-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-[0_15px_35px_rgba(59,130,246,0.15)] dark:shadow-[0_15px_35px_rgba(59,130,246,0.1)] p-4 flex items-center border border-gray-100/50 dark:border-gray-700/50"
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 20px 35px -5px rgba(59, 130, 246, 0.25)" 
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mr-2">2+</span>
              <span className="text-gray-700 dark:text-gray-300">Years of<br />Experience</span>
            </motion.div>
            
            <motion.div 
              className="absolute -top-6 -right-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-[0_15px_35px_rgba(59,130,246,0.15)] dark:shadow-[0_15px_35px_rgba(59,130,246,0.1)] p-4 flex items-center border border-gray-100/50 dark:border-gray-700/50"
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 20px 35px -5px rgba(59, 130, 246, 0.25)" 
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mr-2">2+</span>
              <span className="text-gray-700 dark:text-gray-300">Projects<br />Completed</span>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-10 shadow-[0_20px_50px_rgba(8,112,184,0.1)] dark:shadow-[0_20px_50px_rgba(8,112,184,0.07)] border border-gray-100/50 dark:border-gray-700/50"
          >
            <div className="relative mb-8">
              <div className="absolute -top-2 left-0 w-12 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-full"></div>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 tracking-tight">Who I Am</h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                I'm a software developer who loves building cool stuff and solving tricky problems with code. Whether it's web development, Android development, or debugging, I enjoy every moment of the process—from brainstorming ideas to bringing them to life.
              </p>
            </div>
            
            <div className="relative mb-8">
              <div className="absolute -top-2 left-0 w-12 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-full"></div>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 tracking-tight">My Approach</h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                I believe in creating clean, efficient code and making things work smoothly and flawlessly. Whether it's front-end, back-end, or Android development, I love diving into projects that challenge me and make me think outside the box.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-gray-50/80 dark:bg-gray-700/50 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/30 hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900/30 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-xl text-gray-800 dark:text-white">Languages</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-300 pl-11 leading-relaxed">Persian (Native)<br />English (Fluent)<br />Finnish (Limited)</p>
              </div>
              
              <div className="bg-gray-50/80 dark:bg-gray-700/50 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/30 hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900/30 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-xl text-gray-800 dark:text-white">Location</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-300 pl-11 leading-relaxed">Finland<br />Available Remotely</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 