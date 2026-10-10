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
import { headers } from 'next/headers';
import { SITE_URL, AUTHOR, SITE_DESCRIPTION, PROFILE_URLS } from '../lib/site';

// Entity markup is what turns "Amirhadi Borjian Yazdi" from a string match into a thing
// Google can resolve: `sameAs` names the GitHub, LinkedIn and TryHackMe profiles that also
// speak for him, and those are the same three URLs the page shows as social links. There is
// deliberately no `image` property — Person.image is a documented route by which a crawler
// learns a portrait's address, and the photo stays off every index.
const PERSON_SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: AUTHOR,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      jobTitle: ['Software Developer', 'Security Enthusiast'],
      knowsAbout: [
        'Android development',
        'Kotlin',
        'Jetpack Compose',
        'Next.js',
        'TypeScript',
        'REST APIs',
        'Network security',
        'Penetration testing',
        'OWASP Top 10',
        'Wireshark',
        'Burp Suite',
        'Metasploit',
      ],
      sameAs: Object.values(PROFILE_URLS),
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: AUTHOR,
      description: SITE_DESCRIPTION,
      inLanguage: 'en',
      publisher: { '@id': `${SITE_URL}/#person` },
    },
  ],
};

export default async function Home() {
  // Needs a live request so Next can stamp the CSP nonce from src/proxy.js onto its
  // inline scripts. A prerendered shell would ship them unnonced, and with
  // 'unsafe-inline' gone the browser would block the whole hydration payload.
  await connection();
  // The same nonce has to cover this script or script-src refuses it. It is read from the
  // request rather than generated here, so there is still exactly one per response.
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <MotionProvider>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_SCHEMA) }}
      />
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