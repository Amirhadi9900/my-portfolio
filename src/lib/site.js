// One source for the identity search engines resolve against. These same profile URLs
// appear as the visible social links in Contact and Footer, and as `sameAs` in the Person
// schema — Google uses the agreement between the two to decide whether the profiles and the
// site are the same entity, so a divergence here would be a real defect, not a typo.
export const SITE_URL = 'https://my-portfolio-lime-three-67.vercel.app';
export const AUTHOR = 'Amirhadi Borjian Yazdi';
export const SITE_TITLE = 'Amirhadi Borjian Yazdi - Software Developer & Security Enthusiast';
export const SITE_DESCRIPTION =
  'Portfolio of Amirhadi Borjian Yazdi: Android apps in Kotlin, web apps in Next.js and TypeScript, and hands-on network security and penetration testing.';

export const PROFILE_URLS = {
  github: 'https://github.com/Amirhadi9900',
  // The vanity slug, not the numeric `…-5108431a1` the site used until 2026-10-10. Both
  // resolve to the same profile, but this is the URL LinkedIn itself displays as public, so
  // it is the one `sameAs` should name for entity resolution.
  linkedin: 'https://www.linkedin.com/in/amirhadi-borjian-yazdi-software-developer',
  tryhackme: 'https://tryhackme.com/p/amirhadi',
};
