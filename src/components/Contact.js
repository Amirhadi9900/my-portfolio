'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CONTACT_LIMITS, validateContactField } from '../lib/contact-security';
import { interpretContactResponse } from '../lib/contact-response';
import { isContactSfxMuted, playContactSfx, setContactSfxMuted, unlockContactSfx } from '../lib/sfx';
import { scrollToId } from '../lib/scroll-to-id';
import { trackPointer, releasePointer } from '../lib/magnetic-pointer';
import TurnstileField from './TurnstileField';

const CONTACT_SECTION_CLASS =
  'section py-16 md:py-28 bg-gradient-to-b from-gray-50/80 to-gray-100/90 relative overflow-hidden scroll-mt-28';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    website: '',
    consent: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [turnstileWidgetKey, setTurnstileWidgetKey] = useState(0);
  const [captchaError, setCaptchaError] = useState('');
  const [sfxMuted, setSfxMuted] = useState(false);

  useEffect(() => {
    // localStorage does not exist while prerendering, so the stored preference can
    // only be adopted once on the client; reading it during render would hydrate
    // differently on server and browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only storage
    setSfxMuted(isContactSfxMuted());
    // Landed on from an in-page anchor: the element exists now, so re-center it
    // once the sections below have had a chance to hydrate.
    const hash = window.location.hash;
    if (hash === '#contact' || hash === '#contact-form') {
      requestAnimationFrame(() => scrollToId('contact'));
    }
  }, []);

  function toggleSfx() {
    const next = !sfxMuted;
    setSfxMuted(next);
    setContactSfxMuted(next);
  }

  const statusTimer = useRef(null);

  function scheduleStatusClear() {
    if (statusTimer.current) clearTimeout(statusTimer.current);
    statusTimer.current = setTimeout(() => setSubmitStatus(null), 6000);
  }

  useEffect(() => () => {
    if (statusTimer.current) clearTimeout(statusTimer.current);
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

  function validateConsent(value) {
    return value ? '' : 'Please confirm I may store your message so I can reply to you.';
  }

  const validators = { name: validateName, email: validateEmail, subject: validateSubject, message: validateMessage, consent: validateConsent };

  const handleChange = (e) => {
    const { name, type } = e.target;
    // A checkbox reports its `value` attribute, not whether it is ticked, so
    // reading `.value` here would store "on" and the consent would never flip.
    const value = type === 'checkbox' ? e.target.checked : e.target.value;
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
    errors.consent = validateConsent(formData.consent);
    const filtered = Object.fromEntries(Object.entries(errors).filter(([, v]) => v));
    setFieldErrors(filtered);
    return filtered;
  }

  // Field errors appear next to inputs the user can't see from the Send button,
  // and nothing else announces them, so move focus to the first offender.
  function focusField(form, name) {
    // `name` can come back on the response as data.field, and it is interpolated
    // into a selector below. The validators double as the field allowlist, so an
    // unexpected key stops here rather than reaching querySelector as syntax.
    if (!Object.hasOwn(validators, name)) return;
    form.querySelector(`[name="${name}"]`)?.focus();
  }

  const handleSubmit = async (e) => {
    const form = e.currentTarget;
    e.preventDefault();
    // Opened here, inside the click, so the cue scheduled after the await still plays.
    if (!sfxMuted) unlockContactSfx();

    const errors = validateAll();
    if (Object.keys(errors).length) {
      focusField(form, Object.keys(errors)[0]);
      playContactSfx('error');
      return;
    }

    if (!turnstileToken) {
      setCaptchaError('Please complete the security check before sending.');
      playContactSfx('error');
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

      // Every decision about the reply lives in interpretContactResponse so it can be
      // tested from Node; this block only renders what it says. See that file for why
      // the body is not assumed to be JSON.
      const verdict = interpretContactResponse({
        status: response.status,
        ok: response.ok,
        body: await response.text(),
      });

      if (verdict.outcome === 'captcha') {
        setCaptchaError(verdict.message);
        resetTurnstile();
        playContactSfx('error');
        return;
      }
      if (verdict.outcome === 'field') {
        setFieldErrors(prev => ({ ...prev, [verdict.field]: verdict.message }));
        focusField(form, verdict.field);
        resetTurnstile();
        playContactSfx('error');
        return;
      }
      if (verdict.outcome !== 'success') {
        throw new Error(verdict.message);
      }

      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '', website: '', consent: false });
      setFieldErrors({});
      resetTurnstile();
      playContactSfx('success');
      scheduleStatusClear();
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      // fetch() rejects with TypeError when the request never completed at all —
      // offline, DNS, aborted. Its message is "Failed to fetch", which is a log line,
      // not something to show a visitor who just typed a message to me.
      setErrorMessage(error instanceof TypeError
        ? 'Could not reach the server. Check your connection and try again.'
        : error.message);
      resetTurnstile();
      playContactSfx('error');
      scheduleStatusClear();
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section id="contact" className={CONTACT_SECTION_CLASS}>
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-70"></div>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      
      <div className="container relative z-10">
        <motion.div 
          className="max-w-3xl mx-auto text-center mb-12 md:mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <h2 className="font-subheading text-3xl sm:text-5xl md:text-6xl font-semibold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            Get In Touch
          </h2>
          <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed subtitle-blink">Have a project in mind? Let&apos;s talk about it :)</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          <motion.div
            className="panel-3d p-6 sm:p-8 md:p-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
          >
            <div className="relative mb-8">
              <div className="absolute -top-2 left-0 w-12 h-1 bg-gradient-to-r from-cyan-500 to-teal-600 rounded-full"></div>
              <h3 className="font-subheading text-2xl font-semibold text-emerald-200 mb-4 tracking-tight">Contact Information</h3>
              <p className="text-gray-300 leading-relaxed">
                Feel free to reach out if you have any questions or if you&apos;d like to work together.
                I&apos;m always open to new projects and opportunities.
              </p>
            </div>
            
            <div className="space-y-6 mb-10">
              <div className="flex items-start transform hover:translate-x-1 transition-transform duration-300">
                <div
                  className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-cyan-950/40 text-cyan-400 mr-4 shadow-sm magnetic-icon"
                  onPointerMove={trackPointer}
                  onPointerLeave={releasePointer}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-subheading text-base font-semibold text-cyan-300 mb-1">Email</h4>
                  <Link href="#contact" scroll={false} onClick={(event) => scrollToId('contact', event)} className="text-gray-300 hover:text-cyan-400 transition-colors duration-200">
                    Send a message
                  </Link>
                </div>
              </div>
              
              <div className="flex items-start transform hover:translate-x-1 transition-transform duration-300">
                <div
                  className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-cyan-950/40 text-cyan-400 mr-4 shadow-sm magnetic-icon"
                  onPointerMove={trackPointer}
                  onPointerLeave={releasePointer}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-subheading text-base font-semibold text-cyan-300 mb-1">Location</h4>
                  <p className="text-gray-300">Available remotely worldwide and onsite in Finland</p>
                </div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-gray-700/30">
              <h4 className="font-subheading text-base font-semibold text-cyan-300 mb-4">Connect With Me</h4>
              <div className="flex space-x-4">
                <a 
                  href="https://github.com/Amirhadi9900" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-button w-10 h-10"
                >
                  <span className="sr-only">GitHub</span>
                  <span className="magnetic-icon flex items-center justify-center" onPointerMove={trackPointer} onPointerLeave={releasePointer}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </span>
                </a>
                <a 
                  href="https://www.linkedin.com/in/amirhadi-borjian-yazdi-5108431a1" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-button w-10 h-10"
                >
                  <span className="sr-only">LinkedIn</span>
                  <span className="magnetic-icon flex items-center justify-center" onPointerMove={trackPointer} onPointerLeave={releasePointer}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </span>
                </a>
                <Link
                  href="#contact"
                  scroll={false}
                  onClick={(event) => scrollToId('contact', event)}
                  className="social-button w-10 h-10"
                >
                  <span className="sr-only">Send a message</span>
                  <span className="magnetic-icon flex items-center justify-center" onPointerMove={trackPointer} onPointerLeave={releasePointer}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                      <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                    </svg>
                  </span>
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
            <div className="panel-3d">
              <div className="p-8 md:p-10">
                <div className="relative mb-8">
                  <div className="absolute -top-2 left-0 w-12 h-1 bg-gradient-to-r from-cyan-500 to-teal-600 rounded-full"></div>
                  <button
                    type="button"
                    onClick={toggleSfx}
                    aria-pressed={sfxMuted}
                    aria-label={sfxMuted ? 'Turn submission sounds on' : 'Turn submission sounds off'}
                    title={sfxMuted ? 'Turn submission sounds on' : 'Turn submission sounds off'}
                    className="absolute -top-1 right-0 p-2 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-gray-700/50 transition-colors duration-200 magnetic-icon"
                    onPointerMove={trackPointer}
                    onPointerLeave={releasePointer}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-2.94.87L4.5 17.5H2.5A1.5 1.5 0 011 16V8a1.5 1.5 0 011.5-1.5h2l3.56-3.487A1.76 1.76 0 0111 5.882z" />
                      {sfxMuted
                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9l6 6M23 9l-6 6" />
                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.5 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" />}
                    </svg>
                  </button>
                  <h3 className="font-subheading text-2xl font-semibold text-emerald-200 mb-2 tracking-tight">Send Me a Message</h3>
                  <p className="text-gray-300">I&apos;ll get back to you as soon as possible.</p>
                </div>
                
                <form id="contact-form" noValidate onSubmit={handleSubmit}>
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
                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-white">Your Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      maxLength={CONTACT_LIMITS.name}
                      className={`w-full px-5 py-3 bg-gray-700/30 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white transition-colors duration-200 ${fieldErrors.name ? 'border-red-500' : 'border-gray-700'}`}
                      placeholder="John Doe"
                      aria-invalid={!!fieldErrors.name}
                      aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                    />
                    {fieldErrors.name && (
                      <p id="name-error" className="mt-1.5 text-sm text-red-400">{fieldErrors.name}</p>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-white">Your Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      maxLength={CONTACT_LIMITS.email}
                      className={`w-full px-5 py-3 bg-gray-700/30 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white transition-colors duration-200 ${fieldErrors.email ? 'border-red-500' : 'border-gray-700'}`}
                      placeholder="john@example.com"
                      aria-invalid={!!fieldErrors.email}
                      aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                    />
                    {fieldErrors.email && (
                      <p id="email-error" className="mt-1.5 text-sm text-red-400">{fieldErrors.email}</p>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="subject" className="block mb-2 text-sm font-medium text-white">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      maxLength={CONTACT_LIMITS.subject}
                      className={`w-full px-5 py-3 bg-gray-700/30 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white transition-colors duration-200 ${fieldErrors.subject ? 'border-red-500' : 'border-gray-700'}`}
                      placeholder="Project Inquiry"
                      aria-invalid={!!fieldErrors.subject}
                      aria-describedby={fieldErrors.subject ? 'subject-error' : undefined}
                    />
                    {fieldErrors.subject && (
                      <p id="subject-error" className="mt-1.5 text-sm text-red-400">{fieldErrors.subject}</p>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="block mb-2 text-sm font-medium text-white">Your Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      rows="5"
                      maxLength={CONTACT_LIMITS.message}
                      className={`w-full px-5 py-3 bg-gray-700/30 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white transition-colors duration-200 ${fieldErrors.message ? 'border-red-500' : 'border-gray-700'}`}
                      placeholder="Hello, I'd like to discuss a project..."
                      aria-invalid={!!fieldErrors.message}
                      aria-describedby={fieldErrors.message ? 'message-error' : undefined}
                    ></textarea>
                    {fieldErrors.message && (
                      <p id="message-error" className="mt-1.5 text-sm text-red-400">{fieldErrors.message}</p>
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
                      <p role="alert" className="mt-2 text-sm text-red-400">{captchaError}</p>
                    )}
                  </div>
                  
                  <div className="mb-5">
                    <label htmlFor="consent" className="flex cursor-pointer items-start gap-3">
                      <input
                        id="consent"
                        name="consent"
                        type="checkbox"
                        checked={formData.consent}
                        onChange={handleChange}
                        // aria-required rather than required: native validation would
                        // block submit before our own check runs, so the field error and
                        // the failure cue would never fire.
                        aria-required="true"
                        aria-invalid={!!fieldErrors.consent}
                        aria-describedby={fieldErrors.consent ? 'consent-error' : undefined}
                        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm leading-relaxed text-gray-300">
                        I agree that Amirhadi may store this message and my contact details in order
                        to reply. Nothing is kept on the site itself &mdash; it arrives as an email.{' '}
                        <Link
                          href="/privacy"
                          className="underline decoration-gray-400/50 underline-offset-2 hover:text-cyan-400 transition-colors"
                        >
                          Privacy notice
                        </Link>
                        .
                      </span>
                    </label>
                    {fieldErrors.consent && (
                      <p id="consent-error" className="mt-1.5 text-sm text-red-400">{fieldErrors.consent}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary-block"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                  
                  {submitStatus === 'success' && (
                    <div role="status" className="mt-6 p-4 bg-[#0d1117] rounded-lg border border-green-500/20 font-mono text-sm">
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
                    <div role="alert" className="mt-6 p-4 bg-red-900/30 text-red-300 rounded-lg border border-red-900/50 flex items-center">
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