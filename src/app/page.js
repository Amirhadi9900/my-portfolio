import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import Projects from '../components/Projects';
import Skills from '../components/Skills';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import ScrollTimeline from '../components/ScrollTimeline';
import BackToTop from '../components/BackToTop';
import { connection } from 'next/server';

export default async function Home() {
  // Nonce-based CSP needs a live request to draw the nonce from; a prerendered
  // shell would ship inline scripts carrying no nonce and the browser would block them.
  await connection();

  return (
    <main>
      <ScrollTimeline />
      <BackToTop />
      <Header />
      <Hero />
      <About />
      <Projects />
      <Skills />
      <Contact />
      <Footer />
    </main>
  );
} 