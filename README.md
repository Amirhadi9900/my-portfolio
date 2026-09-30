# Amirhadi Borjian — Portfolio

Personal portfolio showcasing Android and web development work and an ethical pentesting service.

**Live site:** [my-portfolio-lime-three-67.vercel.app](https://my-portfolio-lime-three-67.vercel.app)

## Features

- Single-page layout with Hero, About, Projects, Skills, Services, and Contact sections
- Responsive design with smooth scroll navigation and Framer Motion animations
- Custom typography stack (IBM Plex Sans, Source Sans 3, Fira Sans, JetBrains Mono)
- Interactive About card with flip animation
- Project showcase with code-preview styling
- Skills grid with brand icons (Simple Icons) and language flags
- Services section: full-stack development and ethical pentesting under an agreed Rules of Engagement
- Contact form with email delivery via Nodemailer
- Cloudflare Turnstile CAPTCHA with server-side verification
- Input sanitization, honeypot field, rate limiting, and security headers (CSP, HSTS, and more)
- `/privacy` notice describing how form and engagement data are handled, written against what the code actually does
- Cookieless visit and page-speed measurement via Vercel, disclosed on `/privacy`
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
| Observability | [Vercel Web Analytics](https://vercel.com/docs/analytics) and [Speed Insights](https://vercel.com/docs/speed-insights), both cookieless |
| Deployment | [Vercel](https://vercel.com/) |

## Getting Started

### Prerequisites

- Node.js 24 — `package.json` pins `engines` to `24.x`, which is what CI tests and what Vercel builds with. Next.js itself only requires 20.9 or later, so other versions generally work, but 24 is the supported one.
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
| `EMAIL_TO` | Inbox that receives submissions (server only). Optional; defaults to `EMAIL_USER` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key (public) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key (server only) |
| `TURNSTILE_EXPECTED_HOSTNAME` | Optional production hostname lock |
| `CONTACT_ALLOWED_ORIGINS` | Optional extra origins allowed to POST the contact API |

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
├── public/                     # Static assets (images, flags)
├── scripts/
│   └── verify-rate-limit.mjs   # Live regression test for the contact API guards
├── src/
│   ├── app/
│   │   ├── api/contact/        # Contact form API route
│   │   ├── icon.svg            # Favicon
│   │   ├── layout.js           # Root layout, fonts and site metadata
│   │   ├── page.js             # Home page
│   │   └── privacy/            # Privacy notice (/privacy)
│   ├── components/             # UI sections and widgets
│   ├── lib/
│   │   ├── contact-security.js # Input validation and sanitization
│   │   ├── scroll-to-id.js     # Hash-free smooth scrolling shared by nav widgets
│   │   ├── sfx.js              # Web Audio contact-form cues
│   │   └── turnstile.js        # Turnstile server verification
│   ├── styles/
│   │   └── globals.css         # Global styles and Tailwind layers
│   └── instrumentation.js      # Startup env checks
├── .env.example                # Environment variable template
├── .github/workflows/ci.yml    # Build, audit and security regression job
├── next.config.js              # Next.js config and security headers
├── tailwind.config.js
└── package.json
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server on port 3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run audit` | `npm audit` for production dependencies only |
| `npm run test:security` | Hit a **running** server and assert the rate limit cannot be bypassed by rotating `X-Forwarded-For`, and that a request with no `Origin` is refused. Requires `npm start` (or `npm run dev`) first |

## Customization

| What to change | File |
|----------------|------|
| Name, hero text, roles | `src/components/Hero.js` |
| About content | `src/components/About.js` |
| Projects | `src/components/Projects.js` |
| Skills | `src/components/Skills.js` |
| Services offered | `src/components/Services.js` |
| Contact details and form | `src/components/Contact.js` |
| Footer links | `src/components/Footer.js` |
| Site metadata | `src/app/layout.js` |

## Deployment

This project is deployed on Vercel. Connect the GitHub repository and set the environment variables listed above in the Vercel project settings.

After changing `NEXT_PUBLIC_*` variables, redeploy without the build cache so the new values are baked into the client bundle.

## License

ISC
