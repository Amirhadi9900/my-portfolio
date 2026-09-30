import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import Projects from '../components/Projects';
import Skills from '../components/Skills';
import Services from '../components/Services';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import ScrollTimeline from '../components/ScrollTimeline';
import BackToTop from '../components/BackToTop';
import MotionProvider from '../components/MotionProvider';
import { connection } from 'next/server';

export default async function Home() {
  // Needs a live request so Next can stamp the CSP nonce from src/proxy.js onto its
  // inline scripts. A prerendered shell would ship them unnonced, and with
  // 'unsafe-inline' gone the browser would block the whole hydration payload.
  await connection();

  return (
    <MotionProvider>
      <ScrollTimeline />
      <BackToTop />
      <Header />
      {/* Header and Footer sit outside <main> on purpose: nested inside it they are
          not exposed as banner/contentinfo landmarks, and the skip link in layout.js
          targets #main, so a header inside main makes that link skip nothing. */}
      <main id="main">
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Services />
        <Contact />
      </main>
      <Footer />
    </MotionProvider>
  );
} 