/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Fira Sans', 'sans-serif'],
        heading: ['var(--font-heading)', 'IBM Plex Sans', 'sans-serif'],
        subheading: ['var(--font-subheading)', 'Source Sans 3', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
        display: ['var(--font-display)', 'Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
