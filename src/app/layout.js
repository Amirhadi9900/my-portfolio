import '../styles/globals.css';
import { IBM_Plex_Sans, Source_Sans_3, Fira_Sans, JetBrains_Mono } from 'next/font/google';
import PromptCursor from '../components/PromptCursor';
import { Analytics } from '@vercel/analytics/next';

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
  weight: ['400', '500'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400'],
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
    <html lang="en" className={`${ibmPlexSans.variable} ${sourceSans3.variable} ${firaSans.variable} ${jetbrainsMono.variable} scroll-smooth`}>
      <body className="min-h-screen font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-white focus:text-slate-900 focus:font-medium"
        >
          Skip to content
        </a>
        <PromptCursor />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
