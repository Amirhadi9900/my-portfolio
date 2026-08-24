'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CONTACT_LIMITS, validateContactField } from '../lib/contact-security';
import TurnstileField from './TurnstileField';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    website: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isMounted, setIsMounted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [turnstileWidgetKey, setTurnstileWidgetKey] = useState(0);
  const [captchaError, setCaptchaError] = useState('');
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  function resetTurnstile() {
    setTurnstileToken(null);
    setTurnstileWidgetKey((key) => key + 1);
  }

  function validateName(value) {
    return validateContactField('name', value);
  }

  function validateEmail(value) {
    return validateContactField('email', value);
  }

  function validateSubject(value) {
    return validateContactField('subject', value);
  }

  function validateMessage(value) {
    return validateContactField('message', value);
  }

  const validators = { name: validateName, email: validateEmail, subject: validateSubject, message: validateMessage };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      const error = validators[name]?.(value) || '';
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!value.trim()) return;
    const error = validators[name]?.(value) || '';
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  function validateAll() {
    const errors = {};
    errors.name = validateName(formData.name);
    errors.email = validateEmail(formData.email);
    errors.subject = validateSubject(formData.subject);
    errors.message = validateMessage(formData.message);
    const filtered = Object.fromEntries(Object.entries(errors).filter(([, v]) => v));
    setFieldErrors(filtered);
    return Object.keys(filtered).length === 0;
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    if (!turnstileToken) {
      setCaptchaError('Please complete the security check before sending.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSubmitStatus(null);
    setCaptchaError('');
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, turnstileToken }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.code?.startsWith('captcha_')) {
          setCaptchaError(data.error || 'Security check failed. Please try again.');
          resetTurnstile();
          return;
        }
        if (data.field) {
          setFieldErrors(prev => ({ ...prev, [data.field]: data.error }));
          resetTurnstile();
          return;
        }
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
      
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '', website: '' });
      setFieldErrors({});
      resetTurnstile();
      setTimeout(() => setSubmitStatus(null), 6000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setErrorMessage(error.message);
      resetTurnstile();
      setTimeout(() => setSubmitStatus(null), 6000);
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
            <h2 className="font-subheading text-gray-800 dark:text-white text-3xl md:text-4xl font-semibold mb-4">Get In Touch</h2>
            <p className="text-gray-700 dark:text-gray-300">Have a project in mind? Let's talk about it.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="font-subheading text-2xl font-semibold text-gray-800 dark:text-white">Contact Information</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Feel free to reach out if you have any questions or if you'd like to work together.
                I'm always open to new projects and opportunities.
              </p>
              
              <div className="space-y-4">
                {/* Email placeholder */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">Email</h4>
                    <Link href="#contact-form" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                      Send a message
                    </Link>
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
                    <p className="text-gray-700 dark:text-gray-300">Available remotely worldwide and onsite in Finland</p>
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
            <div id="contact-form" className="scroll-mt-28">
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
                
                <div className="w-full py-3 px-4 text-white font-heading font-semibold rounded-md bg-blue-600 dark:bg-blue-500">
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
    <section id="contact" className="section py-16 md:py-28 bg-gradient-to-b from-gray-50/80 to-gray-100/90 dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-70"></div>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 dark:bg-blue-700/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 dark:bg-purple-700/10 rounded-full blur-3xl"></div>
      
      <div className="container relative z-10">
        <motion.div 
          className="max-w-3xl mx-auto text-center mb-12 md:mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <div className="inline-flex items-center gap-1.5 font-mono text-xs text-cyan-600 dark:text-cyan-400 mb-3 bg-cyan-600/5 dark:bg-cyan-400/5 px-3 py-1.5 rounded-full border border-cyan-600/10 dark:border-cyan-400/10">
            <span className="opacity-50">~/</span>
            <span className="uppercase tracking-widest">Connect With Me</span>
          </div>
          <h2 className="font-subheading text-3xl sm:text-5xl md:text-6xl font-semibold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
            Get In Touch
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">Have a project in mind? Let's talk about it.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          <motion.div
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-10 shadow-[0_20px_50px_rgba(8,112,184,0.1)] dark:shadow-[0_20px_50px_rgba(8,112,184,0.07)] border border-gray-100/50 dark:border-gray-700/50"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
          >
            <div className="relative mb-8">
              <div className="absolute -top-2 left-0 w-12 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-full"></div>
              <h3 className="font-subheading text-2xl font-semibold text-gray-800 dark:text-white mb-4 tracking-tight">Contact Information</h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                Feel free to reach out if you have any questions or if you'd like to work together.
                I'm always open to new projects and opportunities.
              </p>
            </div>
            
            <div className="space-y-6 mb-10">
              <div className="flex items-start transform hover:translate-x-1 transition-transform duration-300">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-blue-50/80 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-4 shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white text-lg mb-1">Email</h4>
                  <Link href="#contact-form" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                    Send a message
                  </Link>
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
                  <p className="text-gray-600 dark:text-gray-300">Available remotely worldwide and onsite in Finland</p>
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
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100/80 dark:bg-gray-700/50 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-all duration-300 hover:shadow-md hover:scale-110 no-underline"
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
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100/80 dark:bg-gray-700/50 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-all duration-300 hover:shadow-md hover:scale-110 no-underline"
                >
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <Link
                  href="#contact-form"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100/80 dark:bg-gray-700/50 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-all duration-300 hover:shadow-md hover:scale-110 no-underline"
                >
                  <span className="sr-only">Send a message</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                  </svg>
                </Link>
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
                  <h3 className="font-subheading text-2xl font-semibold text-gray-800 dark:text-white mb-2 tracking-tight">Send Me a Message</h3>
                  <p className="text-gray-600 dark:text-gray-300">I'll get back to you as soon as possible.</p>
                </div>
                
                <form id="contact-form" onSubmit={handleSubmit} className="scroll-mt-28">
                  <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', height: 0, overflow: 'hidden' }}>
                    <label htmlFor="website">Website</label>
                    <input
                      type="text"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>
                  <div className="mb-6">
                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-800 dark:text-white">Your Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      maxLength={CONTACT_LIMITS.name}
                      className={`w-full px-5 py-3 bg-gray-50/50 dark:bg-gray-700/30 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-white transition-colors duration-200 ${fieldErrors.name ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
                      placeholder="John Doe"
                    />
                    {fieldErrors.name && (
                      <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{fieldErrors.name}</p>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-800 dark:text-white">Your Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      maxLength={CONTACT_LIMITS.email}
                      className={`w-full px-5 py-3 bg-gray-50/50 dark:bg-gray-700/30 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-white transition-colors duration-200 ${fieldErrors.email ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
                      placeholder="john@example.com"
                    />
                    {fieldErrors.email && (
                      <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{fieldErrors.email}</p>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="subject" className="block mb-2 text-sm font-medium text-gray-800 dark:text-white">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      maxLength={CONTACT_LIMITS.subject}
                      className={`w-full px-5 py-3 bg-gray-50/50 dark:bg-gray-700/30 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-white transition-colors duration-200 ${fieldErrors.subject ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
                      placeholder="Project Inquiry"
                    />
                    {fieldErrors.subject && (
                      <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{fieldErrors.subject}</p>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-800 dark:text-white">Your Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      rows="5"
                      maxLength={CONTACT_LIMITS.message}
                      className={`w-full px-5 py-3 bg-gray-50/50 dark:bg-gray-700/30 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-white transition-colors duration-200 ${fieldErrors.message ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
                      placeholder="Hello, I'd like to discuss a project..."
                    ></textarea>
                    {fieldErrors.message && (
                      <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{fieldErrors.message}</p>
                    )}
                  </div>

                  <div className="mb-6">
                    <TurnstileField
                      widgetKey={turnstileWidgetKey}
                      onTokenChange={(token) => {
                        setTurnstileToken(token);
                        if (token) setCaptchaError('');
                      }}
                    />
                    {captchaError && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">{captchaError}</p>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || !turnstileToken}
                    className="btn-primary-block"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                  
                  {submitStatus === 'success' && (
                    <div className="mt-6 p-4 bg-[#0d1117] rounded-lg border border-green-500/20 font-mono text-sm">
                      <div className="flex items-center gap-2 text-green-400">
                        <span className="text-green-500">&#10003;</span>
                        <span className="text-gray-500">~/contact $</span>
                        <span>send --message</span>
                      </div>
                      <div className="mt-1 text-green-300/90 pl-5">
                        Message delivered to Amirhadi. He will get back to you soon.
                      </div>
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