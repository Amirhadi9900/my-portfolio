import '../styles/globals.css';
import { IBM_Plex_Sans, Source_Sans_3, Fira_Sans, JetBrains_Mono, Outfit } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import PromptCursor from '../components/PromptCursor';
import MotionProvider from '../components/MotionProvider';
import { SITE_URL, AUTHOR, SITE_TITLE, SITE_DESCRIPTION } from '../lib/site';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '600', '700'],
});

const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-subheading',
  weight: ['400', '600'],
});

const firaSans = Fira_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  // 300 is not optional: five call sites ask for `font-light` - the three logo wordmarks
  // (Header desktop, Header mobile takeover, privacy page), the privacy lede, and the hero's
  // role line. With only 400/500 loaded the browser resolved 300 to the 400 face - measured
  // identical rendered width - so the weight was silently doing nothing.
  // 700 is the same trap from the other side. --font-sans is the body font, so the
  // hero description asks for a bold that did not exist here, and Chrome answered by
  // synthesizing one: it slants and thickens the 500 face instead of using real
  // letterforms, which looks smeared at the sizes this paragraph runs at.
  weight: ['300', '400', '500', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  // ScrollTimeline's counter asks for `font-semibold`; on a 400-only face that
  // resolved back to 400, so the emphasis never appeared.
  weight: ['400', '600'],
});

// A display token rather than replacing --font-heading, which thirteen call sites use
// (nine in markup, four through `@apply font-heading` on the h1 rule and the three button
// classes). The hero gets its own voice without restyling the UI.
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s - ${AUTHOR}` },
  description: SITE_DESCRIPTION,
  applicationName: AUTHOR,
  authors: [{ name: AUTHOR, url: SITE_URL }],
  creator: AUTHOR,
  publisher: AUTHOR,
  keywords: ['portfolio', 'developer', 'android development', 'kotlin', 'web development', 'next.js', 'firebase', 'penetration testing', 'network security'],
  // noimageindex stops Google using any page of this site as the source for an image
  // result, which is the documented way to keep the portrait out of Image Search. The photo
  // also carries X-Robots-Tag: noindex at its own URL (next.config.js), and it is kept out
  // of og:image, twitter:image and the Person schema (src/app/page.js) — those are the
  // places a crawler learns a photo's direct address in the first place.
  robots: { index: true, follow: true, noimageindex: true },
  alternates: { canonical: '/' },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: AUTHOR,
    locale: 'en_US',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Amirhadi Borjian Yazdi, software developer and security enthusiast' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${ibmPlexSans.variable} ${sourceSans3.variable} ${firaSans.variable} ${jetbrainsMono.variable} ${outfit.variable} scroll-smooth`}>
      <body className="min-h-screen font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-white focus:text-slate-900 focus:font-medium"
        >
          Skip to content
        </a>
        <PromptCursor />
        <MotionProvider>{children}</MotionProvider>
        {/* Neither SDK sets a cookie or writes to storage unless `enableCookie` or
            `identify()` is called, and this site calls neither. Disclosed on
            /privacy. Their scripts are allowed by the CSP in src/proxy.js. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
