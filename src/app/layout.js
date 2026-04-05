import '../styles/globals.css';
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
});

export const metadata = {
  title: 'Amirhadi Borjian Yazdi - Software Developer',
  description: 'A showcase of Android and web development projects and skills by Amirhadi Borjian Yazdi',
  keywords: ['portfolio', 'developer', 'android development', 'kotlin', 'web development', 'next.js', 'firebase', 'software developer'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} scroll-smooth`} suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
} 