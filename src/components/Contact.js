'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  
  // Use useEffect to handle client-side only state
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
      
      // Success
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset status after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setErrorMessage(error.message);
      
      // Reset error status after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  if (!isMounted) {
    return (
      <section id="contact" className="section">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="heading text-gray-800 dark:text-white text-3xl md:text-4xl font-bold mb-4">Get In Touch</h2>
            <p className="subheading text-gray-700 dark:text-gray-300">Have a project in mind? Let's talk about it.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Contact Information</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Feel free to reach out if you have any questions or if you'd like to work together.
                I'm always open to new projects and opportunities.
              </p>
              
              {/* Contact details placeholder */}
              <div className="space-y-4">
                {/* Phone placeholder */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">Phone</h4>
                    <p className="text-gray-700 dark:text-gray-300">+358 44 248 2127</p>
                  </div>
                </div>
                
                {/* Email placeholder */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">Email</h4>
                    <p className="text-gray-700 dark:text-gray-300">amirhadib79@gmail.com</p>
                  </div>
                </div>
                
                {/* Location placeholder */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">Location</h4>
                    <p className="text-gray-700 dark:text-gray-300">Finland</p>
                  </div>
                </div>
              </div>
              
              {/* Social links placeholder */}
              <div className="mt-8">
                <h4 className="font-semibold mb-3 text-gray-800 dark:text-white">Follow Me</h4>
                <div className="flex space-x-4">
                  {/* Social icons placeholders */}
                  <span className="w-6 h-6 text-gray-700 dark:text-gray-300"></span>
                  <span className="w-6 h-6 text-gray-700 dark:text-gray-300"></span>
                  <span className="w-6 h-6 text-gray-700 dark:text-gray-300"></span>
                </div>
              </div>
            </div>
            
            {/* Form placeholder */}
            <div>
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6">
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-800 dark:text-white">Your Name</label>
                  <div className="w-full h-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"></div>
                </div>
                
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-800 dark:text-white">Your Email</label>
                  <div className="w-full h-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"></div>
                </div>
                
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-800 dark:text-white">Subject</label>
                  <div className="w-full h-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"></div>
                </div>
                
                <div className="mb-6">
                  <label className="block mb-2 text-sm font-medium text-gray-800 dark:text-white">Your Message</label>
                  <div className="w-full h-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"></div>
                </div>
                
                <div className="w-full py-3 px-4 text-white font-medium rounded-md bg-blue-600 dark:bg-blue-500">
                  Send Message
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="section py-28 bg-gradient-to-b from-gray-50/80 to-gray-100/90 dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
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
              <span>Connect With Me</span>
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-blue-600/70 dark:to-blue-400/70"></span>
            </div>
          </div>
          <h2 className="heading text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 tracking-tight">Get In Touch</h2>
          <p className="subheading text-xl text-gray-600 dark:text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">Have a project in mind? Let's talk about it.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <motion.div
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-10 shadow-[0_20px_50px_rgba(8,112,184,0.1)] dark:shadow-[0_20px_50px_rgba(8,112,184,0.07)] border border-gray-100/50 dark:border-gray-700/50"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
          >
            <div className="relative mb-8">
              <div className="absolute -top-2 left-0 w-12 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-full"></div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 tracking-tight">Contact Information</h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                Feel free to reach out if you have any questions or if you'd like to work together.
                I'm always open to new projects and opportunities.
              </p>
            </div>
            
            <div className="space-y-6 mb-10">
              <div className="flex items-start transform hover:translate-x-1 transition-transform duration-300">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-blue-50/80 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-4 shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white text-lg mb-1">Phone</h4>
                  <p className="text-gray-600 dark:text-gray-300">+358 44 248 2127</p>
                </div>
              </div>
              
              <div className="flex items-start transform hover:translate-x-1 transition-transform duration-300">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-blue-50/80 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-4 shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white text-lg mb-1">Email</h4>
                  <p className="text-gray-600 dark:text-gray-300">amirhadib79@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-start transform hover:translate-x-1 transition-transform duration-300">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-blue-50/80 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-4 shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white text-lg mb-1">Location</h4>
                  <p className="text-gray-600 dark:text-gray-300">Finland</p>
                </div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-gray-200/30 dark:border-gray-700/30">
              <h4 className="font-semibold text-gray-800 dark:text-white text-lg mb-4">Connect With Me</h4>
              <div className="flex space-x-4">
                <a 
                  href="https://github.com/Amirhadi9900" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100/80 dark:bg-gray-700/50 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-all duration-300 hover:shadow-md hover:scale-110"
                >
                  <span className="sr-only">GitHub</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a 
                  href="https://www.linkedin.com/in/amirhadi-borjian-yazdi-5108431a1" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100/80 dark:bg-gray-700/50 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-all duration-300 hover:shadow-md hover:scale-110"
                >
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a 
                  href="mailto:amirhadib79@gmail.com" 
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100/80 dark:bg-gray-700/50 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-all duration-300 hover:shadow-md hover:scale-110"
                >
                  <span className="sr-only">Email</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
          >
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(8,112,184,0.1)] dark:shadow-[0_20px_50px_rgba(8,112,184,0.07)] border border-gray-100/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-[0_25px_60px_rgba(8,112,184,0.18)]">
              <div className="p-8 md:p-10">
                <div className="relative mb-8">
                  <div className="absolute -top-2 left-0 w-12 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-full"></div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 tracking-tight">Send Me a Message</h3>
                  <p className="text-gray-600 dark:text-gray-300">I'll get back to you as soon as possible.</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-800 dark:text-white">Your Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-3 bg-gray-50/50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-white transition-colors duration-200"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-800 dark:text-white">Your Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-3 bg-gray-50/50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-white transition-colors duration-200"
                      placeholder="john@example.com"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="subject" className="block mb-2 text-sm font-medium text-gray-800 dark:text-white">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-3 bg-gray-50/50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-white transition-colors duration-200"
                      placeholder="Project Inquiry"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-800 dark:text-white">Your Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="5"
                      className="w-full px-5 py-3 bg-gray-50/50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-white transition-colors duration-200"
                      placeholder="Hello, I'd like to discuss a project..."
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 text-white font-medium rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-[0_7px_25px_rgba(59,130,246,0.25)] hover:shadow-[0_7px_35px_rgba(59,130,246,0.35)] dark:shadow-[0_7px_25px_rgba(59,130,246,0.15)] dark:hover:shadow-[0_7px_35px_rgba(59,130,246,0.25)] disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      isMounted ? "Sending..." : "Send Message"
                    ) : (
                      "Send Message"
                    )}
                  </button>
                  
                  {submitStatus === 'success' && (
                    <div className="mt-6 p-4 bg-green-50/80 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg border border-green-100 dark:border-green-900/50 flex items-center">
                      <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Your message has been sent. I'll get back to you soon!</span>
                    </div>
                  )}
                  
                  {submitStatus === 'error' && (
                    <div className="mt-6 p-4 bg-red-50/80 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-100 dark:border-red-900/50 flex items-center">
                      <svg className="w-5 h-5 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{errorMessage || "Failed to send message. Please try again."}</span>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 