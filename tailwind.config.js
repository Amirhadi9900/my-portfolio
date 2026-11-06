/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Fira Sans', 'sans-serif'],
        heading: ['var(--font-heading)', 'IBM Plex Sans', 'sans-serif'],
        // Quoted on purpose. A CSS identifier cannot begin with a digit, so an unquoted
        // `Source Sans 3` is not a valid font-family value, and because the first entry is a
        // var() the whole declaration only fails at computed-value time - which silently
        // drops it and lets every `font-subheading` element inherit the body's Fira Sans.
        // The other three families survive unquoted only because none of them ends in a digit.
        subheading: ['var(--font-subheading)', '"Source Sans 3"', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
        display: ['var(--font-display)', 'Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
