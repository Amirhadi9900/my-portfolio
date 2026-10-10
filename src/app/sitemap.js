import { SITE_URL } from '../lib/site';

// No lastModified: this is generated per request, so a stamped date would claim the page
// changed on every fetch and teach crawlers to distrust the field.
export default function sitemap() {
  const origin = new URL(SITE_URL).origin;
  return [
    { url: `${origin}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${origin}/privacy`, changeFrequency: 'yearly', priority: 0.5 },
  ];
}
