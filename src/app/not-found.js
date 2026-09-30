import { connection } from 'next/server';

export const metadata = {
  title: 'Page not found - Amirhadi Borjian Yazdi',
  robots: { index: false, follow: false },
};

export default async function NotFound() {
  // Required, not cosmetic. script-src carries a per-request nonce and no
  // 'unsafe-inline', and Next can only stamp that nonce while server-rendering.
  // Without this the route stays prerendered, its inline scripts ship unnonced,
  // the browser blocks every one of them, and the page renders but never hydrates.
  await connection();

  return (
    <main id="main" className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="text-center max-w-md">
        <p className="font-mono text-sm text-cyan-400 mb-3">404</p>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
          That page isn&apos;t here
        </h1>
        <p className="text-slate-300 mb-8">
          The link may be out of date, or the path mistyped. Everything on this site
          lives on the home page or in the footer.
        </p>
        {/* Plain anchor rather than next/link: a real document load is what gets a
            fresh nonce, which is the whole point of this page being dynamic. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- deliberate full load */}
        <a href="/" className="btn-primary">Back to the site</a>
      </div>
    </main>
  );
}
