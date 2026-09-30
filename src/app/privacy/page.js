import BackToTop from '../../components/BackToTop';
import MotionProvider from '../../components/MotionProvider';
import { connection } from 'next/server';

export const metadata = {
  title: 'Privacy and how I handle your message - Amirhadi Borjian Yazdi',
  description:
    'What the contact form collects, what happens to your data during a penetration test, how this site measures visits and performance, what screens traffic in front of it, where it all goes, how long it is kept, and how to ask for it to be deleted.',
};

const sections = [
  {
    heading: 'The short version',
    body: [
      'I am Amirhadi Borjian, I run this site myself, and I am the one deciding what happens to anything you send through it.',
      'The form emails me, and that is all it does. Nothing you type is stored anywhere on this site, and it is not used to profile you or make any automated decision about you. Separately, I count page visits and measure how quickly pages load: that looks at your browser, not at what you type, and it does not use cookies unless I deliberately turn that on. Three services sit behind those two things. Cloudflare serves the CAPTCHA from its own domain and may set cookies there. Vercel hosts the site, does the counting and the timing, and screens incoming traffic at its edge before any of it reaches the code described here. Google delivers the email.',
    ],
  },
  {
    heading: 'What I collect when you submit the form',
    body: [
      'The four things you type in: your name, your email address, a subject and the message itself. None of that leaves your browser until you press Send. The one exception is the CAPTCHA widget, which loads from Cloudflare while the form is on screen, so Cloudflare sees that request the way any server would.',
      'Your email address is used to reply to you, and for nothing else. Your name is used to address the reply.',
      'Giving me any of it is entirely voluntary. There is no contract and no legal rule that makes you fill in this form. You can send me a first name, a nickname, or a disposable address if you would rather not attach your real one, and the message still reaches me. The only consequence of leaving it blank is that I have no way to answer you.',
    ],
  },
  {
    heading: 'Where the message goes',
    body: [
      'Your browser posts the form to this site, the site verifies that you are not a bot, and then hands the message to Gmail, which delivers it to my personal inbox. Once it is delivered, it simply lives in that inbox as an email.',
      'Three services take part in that trip and so process some of your data: Cloudflare, which runs the CAPTCHA check; Google, which delivers and stores the email; and Vercel, which hosts this site.',
      'Vercel does two things that have to be described rather than waved through. It records each request it serves, which is their infrastructure logging rather than my processing, and its firewall inspects requests at the edge before they reach this site. Both are the reason the wording about storing nothing below says "on this site" rather than "anywhere".',
    ],
  },
  {
    heading: 'Your IP address',
    body: [
      'Your IP address is used for narrow, technical purposes: it is passed to Cloudflare as part of verifying the CAPTCHA, and it is what the limit on how many messages one address can send in a minute is counted against. That limit is enforced twice, once by this site\u2019s own code and once by Vercel\u2019s firewall before a request ever arrives here, and the two halves keep things for very different lengths of time.',
      'The limit inside this site\u2019s code is the modest one. Your IP is held in the memory of one running server instance and thrown out once the window closes and the next cleanup pass runs, which works out at a couple of minutes at the very most. It is not written to disk by this site and not attached to the email I receive.',
      'The edge limit is the wider one and needs stating plainly. Vercel\u2019s firewall counts requests against the contact endpoint by two keys that I chose: your IP address, and a JA4 digest \u2014 a hash built from how your browser opens the encrypted connection, meaning the TLS version, the cipher suites and the extensions it offers. It says nothing about who you are, but it is a stable characteristic of your software, so two people sharing one address can be told apart by it while two copies of the same browser on the same machine cannot.',
      'Both keys are recorded against a match in Vercel\u2019s firewall view, which I can read back over the last twenty-four hours, so that observation outlives the couple of minutes my own code holds anything. An earlier version of this page said your IP is "not combined with anything else about you", and that was an overstatement. The narrower, accurate claim is that the screening works from request metadata rather than from what you typed: my rule matches on the path and the HTTP method, and the view I can read groups traffic by IP address, user agent, request path, network provider, JA4 digest and country. Your name, email, subject and message are not among those fields, and no setting of mine reads the body of a request. What does sit side by side in that view for a day is an address, a fingerprint, and the ordinary metadata around them.',
      'That fingerprint is also handed to this site\u2019s code, since Vercel sends it to every deployment. Nothing here reads it. The contact endpoint looks at six request headers, each for one narrow job: the host, Origin and Referer, checked only to confirm the call came from this site rather than from someone else\u2019s page; the forwarded-for chain, to get your address for the limits above; and the content type and content length, to reject a body that is not the small JSON it expects. It does not read the JA4 digest, the user agent, or anything else about your device, and of those six the only one stored anywhere is your IP address, in the in-memory entry that expires in a couple of minutes.',
      'Beyond all of that, Vercel logs the request itself, IP included, the way almost any web server would. That is their infrastructure logging, not a database I keep.',
    ],
  },
  {
    heading: 'One field you will not see',
    body: [
      'The form carries a hidden field that a real person never fills in. If something does fill it in, I treat that submission as a bot: no email is sent to me and nothing is kept. It is there to catch automation, not to collect anything from you.',
    ],
  },
  {
    heading: 'A screen in front of the whole site',
    body: [
      'That hidden field is not the only thing standing between a bot and my inbox. Vercel runs a firewall in front of every project it hosts, including this one, and it inspects requests before they reach the code. The part I configured is the rate limit on the contact endpoint, described above. The part that comes with the platform is a screening layer that decides for itself whether a request looks like it came from a real browser.',
      'When that layer is unsure, you get a Vercel Security Checkpoint page instead of this site: a short wait while your browser runs some JavaScript to prove it is a browser. Pass it and you are not asked again for an hour, because the proof is remembered in your browser. That remembered session belongs to Vercel and to nothing in this repository, and I cannot read it, extend it or use it to recognise you.',
      'There is a cost to this worth naming rather than hiding. A browser setup that blocks scripts cannot solve a checkpoint, so someone running a strict privacy extension may find this site will not open for them at all, and no setting of mine changes that. It also means a page you asked for is judged by Vercel\u2019s software before any of mine gets involved. I keep it anyway, because the alternative is a contact form that gets flooded, which mostly hurts the people trying to reach me. If it ever happens to you, letting this one domain run scripts is what gets you through, and the form is how to tell me it was a problem \u2014 narrowing what that screen covers is a decision I can actually make.',
    ],
  },
  {
    heading: 'Measuring visits and performance',
    body: [
      'Two small measurements run on this site. One counts page visits and records which page people came from. The other reports how long pages actually take to load on real devices. Both are provided by Vercel, the hosting platform, and both exist to answer two questions: is anyone reading this, and is it slow.',
      'Neither measurement uses cookies unless I deliberately turn that on, and nothing in this site\u2019s code does. I checked the script rather than taking the vendor\u2019s word for it: it only begins to persist data when a site explicitly asks it to identify a returning user, and this site never makes that request. That is why there is no consent banner here. If I ever do turn that on, this page changes before the site does.',
      'What does leave your browser when a page loads is the address of that page, the page you arrived from, ordinary details of your browser and device, and your IP address, which reaches Vercel the same way it reaches any web server. I do not receive your IP address, and I cannot look it up in the numbers I am shown: the reports are counts and timings, not a list of people.',
      'The legal basis for this is my legitimate interest in understanding and maintaining the site, under Article 6(1)(f). Because it rests on that rather than on consent, your right to object has real weight here: ask me and I will switch the measurements off, since for this site they are a convenience to me and not a benefit to you.',
    ],
  },
  {
    id: 'cookies',
    heading: 'Cookies and similar technologies',
    body: [
      'A cookie is a small file a site asks your browser to hold on to. This site sets none of its own: there is no login, no basket and nothing that needs to recognise you between visits.',
      'The three candidates are already accounted for. The CAPTCHA runs on Cloudflare\u2019s domain, so whatever it stores belongs to that domain and not to this one. The visit and performance counts do not use cookies unless I deliberately turn that on, and they write nothing to local or session storage either \u2014 I checked that on the live site rather than reading it in a document. The Vercel checkpoint from the section above only stores anything if you were actually challenged, and what it stores belongs to them.',
      'Open your browser\u2019s cookie panel for this address after an ordinary visit and you should find nothing belonging to it. The one possible exception is an hour\u2019s worth of checkpoint, and only on a visit where the firewall asked. If that ever changes, this section is where the change gets described, and it will be described before the site does it, not after.',
    ],
  },
  {
    heading: 'Legal basis',
    body: [
      'Your message is processed on your consent, given explicitly by ticking the box above the Send button rather than inferred from you pressing it. Where your message is an enquiry about working together, Article 6(1)(b) applies as well, because replying is a step taken at your request before any contract.',
      'Two things on this site rely on legitimate interests rather than on consent. One is the visit and performance measurement described above, where the interest is in knowing whether anyone is reading this and whether it is slow. The other is the technical screening: the rate limits, the origin check and the edge firewall, where the interest is in a site that still works and a form that still reaches me. Neither is a quiet balancing test hiding behind the form, and everything to do with your message itself runs on consent or on the two grounds just mentioned.',
      'You can object to both, and they deserve different answers, so here is the honest asymmetry rather than a promise that sounds neutral. If you asked me to stop counting visits and timings, I would, because those are a convenience to me and the site loses nothing you care about. If you asked me to switch off the rate limits, I would explain and decline, because removing them leaves the endpoint open to being flooded and that harms everyone else trying to send me a message. Article 21 gives you the objection either way; it does not oblige me to pretend both requests cost the same.',
    ],
  },
  {
    heading: 'If we work together',
    body: [
      'The form is how we start talking. If you engage me for a test, a second set of information appears: you as the person instructing me, the scope documents we agree, and whatever credentials, hostnames, findings and evidence the work itself produces.',
      'I do not run a single test without written permission. Before anything is touched I need an explicit, official permission letter from the company or client who owns the target or is authorised to approve testing of it, together with an agreed Rules of Engagement document. Without that letter there is no testing, and no scanning or probing either.',
      'I work only inside the scope you asked for and agreed. If a step looks like it reaches past that boundary, I stop and come back to you for written approval instead of helping myself to the extra ground.',
      'If at any point I judge that what has been asked for would be unethical or unlawful, I stop immediately and tell you why. Being asked is not authorisation, and I will not carry that part out even if you want me to.',
      'Findings and evidence stay between us, with one exception: where the law obliges me to report something I have come across, I have to, and I will say so up front when it could apply.',
      'You can end an engagement at any moment. Everything below about your rights covers the material from an engagement as well as the form.',
    ],
  },
  {
    heading: 'How long I keep it',
    body: [
      'Only as long as it takes to reply to you and to follow up on whatever we discuss. A message that has gone nowhere gets deleted rather than filed. There is no automatic purge timer I can point you at, because the messages sit in a normal email inbox that I curate by hand, so if you would like yours gone, ask and it goes.',
      'Engagement material follows the same rule for the same reason: the report and its evidence are kept while the work and any agreed retest are live, and after that they are deleted on request.',
    ],
  },
  {
    heading: 'Sending anything sensitive',
    body: [
      'The connection between you and this site, and between this site and Gmail, is encrypted. Email itself is not end-to-end encrypted, though, so please do not send me anything you would not want sitting in an inbox: passwords, card or bank details, national ID numbers, or health information.',
    ],
  },
  {
    heading: 'Transfers outside the EU',
    body: [
      'Google, Cloudflare and Vercel may process data outside the European Union, including in the United States. Each of them relies on the EU-US Data Privacy Framework or on standard contractual clauses for those transfers.',
    ],
  },
  {
    heading: 'Your rights, and how to use them here',
    body: [
      'You can ask to access what I hold about you, to have it corrected, to have it deleted, to restrict or object to how it is processed, and to receive a copy of it. You can also withdraw your consent at any time, which does not affect anything that already happened.',
      'For your message, withdrawal and deletion look like the same thing: ask me and it goes. For the visit and performance measurement, the right that actually bites is objection rather than withdrawal, and that is described where I explain the measurements, together with the one form of screening I would not switch off and why.',
      'To do any of this, send me a message through the form on this site and say what you want. That is deliberately the only contact channel I publish: I am one person with no staff and no data protection officer, and I would rather not put a bare email address on a public page for scrapers to find. One honest caveat: because there is no database, a deletion request means I search my inbox for messages from your address and delete them, rather than clearing a row out of a table.',
      'If you are not satisfied with how I handle your data you can complain to your data protection authority. If you are in Finland, that is the Office of the Data Protection Ombudsman (tietosuojavaltuutetun toimisto).',
    ],
  },
  {
    heading: 'Local storage on your device',
    body: [
      'What this site\u2019s own code keeps on your side is one preference: whether the sound effects on the contact form are muted. It is stored in your browser\u2019s local storage, contains nothing about you, and disappears if you clear your site data.',
      'The measurements above add nothing to that list as this site is configured today, and neither does the CAPTCHA, which keeps whatever it needs on Cloudflare\u2019s own domain rather than on this one. The only other thing that could appear is an hour\u2019s worth of Vercel checkpoint, and only if their firewall asked you for it.',
    ],
  },
  {
    heading: 'Changes to this page',
    body: [
      'If anything about how this site handles data changes, this page changes with it and the date at the top moves. The notice for the form sits directly above the Send button, so you read it at the moment it matters rather than only if you go looking for it.',
    ],
  },
];

export default async function PrivacyPage() {
  // Needs a live request so Next can stamp the CSP nonce from src/proxy.js onto its
  // inline scripts. A prerendered shell would ship them unnonced and the browser
  // would refuse to run them.
  await connection();

  return (
    <div className="min-h-screen">
      {/* Plain anchors, not next/link: the nav here is deliberately free of client
          JS, and a real document load is what makes the #contact anchor actually
          scroll on arrival. The only client components on the page are the back-to-top
          button and the MotionProvider that makes it honour reduced motion. */}
      <header className="border-b border-white/10 bg-gradient-to-r from-blue-900/70 via-blue-800/70 to-blue-900/70 backdrop-blur-md">
        <div className="container flex justify-center py-5">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- see the plain-anchor note above */}
          <a href="/" className="font-heading text-xl font-semibold text-white no-underline">
            <span>Amirhadi</span>{' '}
            <span className="font-light logo-gradient">Borjian</span>
          </a>
        </div>
      </header>

      <main id="main" className="container max-w-3xl py-12 md:py-16">
        <h1 className="font-subheading text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
          Privacy
        </h1>
        <p className="mt-3 font-mono text-sm text-gray-400">
          How this site handles your data: the form, any engagement that follows it, and the
          measurements it runs.
        </p>
        <p className="mt-1 font-mono text-xs text-gray-400">Last updated 30 September 2026</p>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.heading} id={section.id}>
              <h2 className="font-subheading text-xl md:text-2xl font-semibold text-white">
                {section.heading}
              </h2>
              {section.body.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-3 text-gray-300 leading-relaxed font-light"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        <p className="mt-12 pt-6 border-t border-white/10 text-sm text-gray-400">
          This is a plain-language notice written to match what the code on this site actually
          does, not a generated policy. If anything here is unclear, the form is a good way to
          ask about it.
        </p>

        <div className="mt-12 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the #contact target needs a real load to scroll */}
          <a href="/#contact" className="btn-primary">
            Back to the site
          </a>
        </div>
      </main>

      <MotionProvider>
        <BackToTop />
      </MotionProvider>
    </div>
  );
}
