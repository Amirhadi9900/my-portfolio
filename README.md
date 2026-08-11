# Amirhadi Borjian — Portfolio

Personal portfolio website showcasing Android and web development work, skills, and contact information.

**Live site:** [my-portfolio-lime-three-67.vercel.app](https://my-portfolio-lime-three-67.vercel.app)

## Features

- Single-page layout with Hero, About, Projects, Skills, and Contact sections
- Responsive design with smooth scroll navigation and Framer Motion animations
- Custom typography stack (IBM Plex Sans, Source Sans 3, Fira Sans, JetBrains Mono)
- Interactive About card with flip animation
- Project showcase with code-preview styling
- Skills grid with brand icons (Simple Icons) and language flags
- Contact form with email delivery via Nodemailer
- Cloudflare Turnstile CAPTCHA with server-side verification
- Input sanitization, honeypot field, rate limiting, and security headers (CSP, HSTS, and more)
- Scroll progress timeline and back-to-top button

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com/) |
| Animation | [Framer Motion](https://www.framer.com/motion/) |
| Icons | [Simple Icons](https://simpleicons.org/) |
| Email | [Nodemailer](https://nodemailer.com/) |
| CAPTCHA | [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) |
| Deployment | [Vercel](https://vercel.com/) |

## Getting Started

### Prerequisites

- Node.js 18.18 or later
- npm

### Installation

```bash
git clone https://github.com/Amirhadi9900/my-portfolio.git
cd my-portfolio
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `EMAIL_USER` | Gmail address used to send contact form emails |
| `EMAIL_PASS` | Gmail [App Password](https://myaccount.google.com/apppasswords) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key (public) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key (server only) |
| `TURNSTILE_EXPECTED_HOSTNAME` | Optional production hostname lock |

For local development, Cloudflare provides [test keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/) that always pass verification.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
myportfolio/
├── public/                 # Static assets (images, icons, flags)
├── src/
│   ├── app/
│   │   ├── api/contact/    # Contact form API route
│   │   ├── layout.js       # Root layout and font loading
│   │   └── page.js         # Home page
│   ├── components/         # UI sections and widgets
│   ├── lib/
│   │   ├── contact-security.js  # Input validation and sanitization
│   │   └── turnstile.js         # Turnstile server verification
│   └── styles/
│       └── globals.css     # Global styles and Tailwind layers
├── .env.example            # Environment variable template
├── next.config.js          # Next.js config and security headers
├── tailwind.config.js
└── package.json
```

## Customization

| What to change | File |
|----------------|------|
| Name, hero text, roles | `src/components/Hero.js` |
| About content | `src/components/About.js` |
| Projects | `src/components/Projects.js` |
| Skills | `src/components/Skills.js` |
| Contact details and form | `src/components/Contact.js` |
| Footer links | `src/components/Footer.js` |
| Site metadata | `src/app/layout.js` |

## Deployment

This project is deployed on Vercel. Connect the GitHub repository and set the environment variables listed above in the Vercel project settings.

After changing `NEXT_PUBLIC_*` variables, redeploy without the build cache so the new values are baked into the client bundle.

## License

ISC
