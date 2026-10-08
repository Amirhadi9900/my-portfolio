import '../styles/globals.css';
import { IBM_Plex_Sans, Source_Sans_3, Fira_Sans, JetBrains_Mono, Outfit } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import PromptCursor from '../components/PromptCursor';

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
  // 300 is not optional: nine call sites ask for `font-light` (every section
  // subtitle, the hero paragraph, both logo wordmarks, the privacy lede). With
  // only 400/500 loaded the browser resolved 300 to the 400 face — measured
  // identical rendered width — so the weight was silently doing nothing.
  weight: ['300', '400', '500'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  // ScrollTimeline's counter asks for `font-semibold`; on a 400-only face that
  // resolved back to 400, so the emphasis never appeared.
  weight: ['400', '600'],
});

// A display token rather than replacing --font-heading, which eleven call sites use
// including every button. The hero gets its own voice without restyling the UI.
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
});

const SITE_URL = 'https://my-portfolio-lime-three-67.vercel.app';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Amirhadi Borjian Yazdi - Software Developer & Security Enthusiast',
  description: 'Android, web and security work by Amirhadi Borjian Yazdi — modern, responsive applications built with clean code.',
  keywords: ['portfolio', 'developer', 'android development', 'kotlin', 'web development', 'next.js', 'firebase', 'penetration testing', 'network security'],
  openGraph: {
    title: 'Amirhadi Borjian Yazdi - Software Developer & Security Enthusiast',
    description: 'Android, web and security work by Amirhadi Borjian Yazdi.',
    url: SITE_URL,
    siteName: 'Amirhadi Borjian Yazdi',
    images: [{ url: '/image/borjian.jpg', width: 1200, height: 1200, alt: 'Amirhadi Borjian Yazdi' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amirhadi Borjian Yazdi - Software Developer & Security Enthusiast',
    description: 'Android, web and security work by Amirhadi Borjian Yazdi.',
    images: ['/image/borjian.jpg'],
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
        {children}
        {/* Neither SDK sets a cookie or writes to storage unless `enableCookie` or
            `identify()` is called, and this site calls neither. Disclosed on
            /privacy. Their scripts are allowed by the CSP in src/proxy.js. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
