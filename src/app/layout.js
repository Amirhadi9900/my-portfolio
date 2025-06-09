import '../styles/globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'Amirhadi Borjian Yazdi - Software Developer',
  description: 'A showcase of Android and web development projects and skills by Amirhadi Borjian Yazdi',
  keywords: ['portfolio', 'developer', 'android development', 'kotlin', 'web development', 'next.js', 'firebase', 'software developer'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
} 