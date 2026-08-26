import '../styles/globals.css';
import { IBM_Plex_Sans, Source_Sans_3, Fira_Sans, JetBrains_Mono } from 'next/font/google';
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
  weight: ['400', '500'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400'],
});

export const metadata = {
  title: 'Amirhadi Borjian Yazdi - Software Developer',
  description: 'A showcase of Android and web development projects and skills by Amirhadi Borjian Yazdi',
  keywords: ['portfolio', 'developer', 'android development', 'kotlin', 'web development', 'next.js', 'firebase', 'software developer'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${ibmPlexSans.variable} ${sourceSans3.variable} ${firaSans.variable} ${jetbrainsMono.variable} scroll-smooth`} suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen font-sans antialiased">
        <PromptCursor />
        {children}
      </body>
    </html>
  );
}
