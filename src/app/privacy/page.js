import BackToTop from '../../components/BackToTop';
import MotionProvider from '../../components/MotionProvider';

export const metadata = {
  title: 'Privacy and how I handle your message - Amirhadi Borjian Yazdi',
  description:
    'What the contact form collects, what happens to your data during a penetration test, where it all goes, how long it is kept, and how to ask for it to be deleted.',
};

const sections = [
  {
    heading: 'The short version',
    body: [
      'I am Amirhadi Borjian, I run this site myself, and I am the one deciding what happens to anything you send through it.',
      'The form emails me. That is all it does. This site has no database, no analytics and no advertising, and it sets no cookies of its own, so your message is not stored anywhere on the site and is not used to profile you or make any automated decision about you. The one thing on the page that is not mine is the CAPTCHA, which Cloudflare serves from its own domain and may set its own cookies there.',
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
      'Three services take part in that trip and so process some of your data: Cloudflare, which runs the CAPTCHA check; Google, which delivers and stores the email; and Vercel, which hosts this site. Vercel records each request it serves, which is their infrastructure logging rather than my processing, and it is the reason the wording about storing nothing below says "on this site" rather than "anywhere".',
    ],
  },
  {
    heading: 'Your IP address',
    body: [
      'Your IP address is used for two narrow, technical purposes: it is passed to Cloudflare as part of verifying the CAPTCHA, and it is used to rate-limit how many messages one address can send in a minute.',
      'For rate limiting it is held only in the memory of one running server instance, and is thrown out once the window closes and the next cleanup pass runs, which works out at a couple of minutes at the very most. It is not written to disk by this site, not attached to the email I receive, and not combined with anything else about you.',
      'The one place your IP can outlive that is Vercel, the hosting platform, which records it against the request like almost any web server would. That is their infrastructure logging, not a database I keep, and it is the honest reason the sentence above says "by this site".',
    ],
  },
  {
    heading: 'One field you will not see',
    body: [
      'The form carries a hidden field that a real person never fills in. If something does fill it in, I treat that submission as a bot: no email is sent to me and nothing is kept. It is there to catch automation, not to collect anything from you.',
    ],
  },
  {
    heading: 'Legal basis',
    body: [
      'Under the GDPR I rely on your consent, because you choose to send the message. Where your message is an enquiry about working together, I also rely on taking steps at your request before entering into a contract.',
      'I do not rely on legitimate interests for anything here, so there is no balancing test of my rights against yours to read through.',
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
      'You can ask to access what I hold about you, to have it corrected, to have it deleted, to restrict or object to how it is processed, and to receive a copy of it. You can withdraw your consent at any time; because the only processing here is your message sitting in an inbox, asking me to delete it is what withdrawal looks like in practice. Withdrawing does not affect anything that already happened.',
      'To do any of this, send me a message through the form on this site and say what you want. That is deliberately the only contact channel I publish: I am one person with no staff and no data protection officer, and I would rather not put a bare email address on a public page for scrapers to find. One honest caveat: because there is no database, a deletion request means I search my inbox for messages from your address and delete them, rather than clearing a row out of a table.',
      'If you are not satisfied with how I handle your data you can complain to your data protection authority. If you are in Finland, that is the Office of the Data Protection Ombudsman (tietosuojavaltuutetun toimisto).',
    ],
  },
  {
    heading: 'Local storage on your device',
    body: [
      'The only thing kept on your side is one preference: whether the sound effects on the contact form are muted. It is stored in your browser\u2019s local storage, contains nothing about you, and disappears if you clear your site data.',
    ],
  },
  {
    heading: 'Changes to this page',
    body: [
      'If what I do with submissions changes, this page changes with it and the date at the top moves. The notice also sits directly above the Send button, so you read it at the moment it matters rather than only if you go looking for it.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      {/* Plain anchors, not next/link: the nav here is deliberately free of client
          JS, and a real document load is what makes the #contact anchor actually
          scroll on arrival. The only client components on the page are the back-to-top
          button and the MotionProvider that makes it honour reduced motion. */}
      <header className="border-b border-white/10 bg-gradient-to-r from-blue-900/70 via-blue-800/70 to-blue-900/70 backdrop-blur-md">
        <div className="container flex justify-center py-5">
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
          How the contact form, and any engagement that follows it, handles your data.
        </p>
        <p className="mt-1 font-mono text-xs text-gray-400">Last updated 28 September 2026</p>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.heading}>
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
