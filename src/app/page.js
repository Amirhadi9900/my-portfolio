import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import Projects from '../components/Projects';
import Skills from '../components/Skills';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import ScrollTimeline from '../components/ScrollTimeline';
import BackToTop from '../components/BackToTop';
import MotionProvider from '../components/MotionProvider';

export default function Home() {
  return (
    <main id="main">
      <MotionProvider>
        <ScrollTimeline />
        <BackToTop />
        <Header />
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Contact />
        <Footer />
      </MotionProvider>
    </main>
  );
} 