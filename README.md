# Professional Portfolio Website

A modern, professional, and visually appealing portfolio website built with Next.js and Tailwind CSS.

## Features

- 🎨 Modern and clean design
- 📱 Fully responsive for all devices
- 🌙 Dark mode support
- ⚡ Fast and optimized performance
- 🔄 Smooth animations with Framer Motion
- 📝 Interactive contact form
- 🖼️ Project showcase with filtering
- 📊 Skills visualization

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework for production
- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library for React

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/portfolio.git
cd portfolio
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

```
├── public/            # Static files
├── src/               # Source files
│   ├── app/           # Next.js App Router
│   ├── components/    # React components
│   └── styles/        # Global styles
├── tailwind.config.js # Tailwind CSS configuration
└── postcss.config.js  # PostCSS configuration
```

## Customization

- Update `src/components/Hero.js` with your name and title
- Add your projects in `src/components/Projects.js`
- Update your skills in `src/components/Skills.js`
- Change contact information in `src/components/Contact.js` and `src/components/Footer.js`

## Deployment

This portfolio website can be easily deployed on platforms like Vercel, Netlify, or GitHub Pages.

For Vercel deployment (recommended for Next.js):

```bash
npm install -g vercel
vercel
```

## License

This project is open source and available under the MIT License. 