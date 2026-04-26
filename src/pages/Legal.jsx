import { useParams, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const PAGES = {
  privacy: {
    title: 'Privacy Policy',
    badge: 'Last updated April 2025',
    sections: [
      { heading: 'What We Collect', body: 'When you create an account on WishIT, we collect your email address, display name, and chosen role (dreamer or fulfiller). Dreams are published anonymously — your personal identity is never associated with your dream publicly.' },
      { heading: 'How We Use Your Data', body: 'We use your information solely to operate the platform: facilitating dream matching, moderation review, and communication between approved connections. We do not sell your data to third parties.' },
      { heading: 'Data Storage', body: 'All data is stored in Cloudflare\'s global infrastructure. Authentication is handled by Firebase (Google). We retain account data for as long as your account is active.' },
      { heading: 'Your Rights', body: 'You may delete your account at any time from your dashboard. Upon deletion, your personal information is removed from our systems. Dream content may remain in anonymised form for platform integrity.' },
      { heading: 'Cookies', body: 'We use only essential session cookies for authentication. No tracking or advertising cookies are used.' },
      { heading: 'Contact', body: 'For privacy concerns, contact us at privacy@wishit.app.' },
    ],
  },
  terms: {
    title: 'Terms of Service',
    badge: 'Effective April 2025',
    sections: [
      { heading: 'Acceptance', body: 'By using WishIT you agree to these terms. If you do not agree, please do not use the platform.' },
      { heading: 'Platform Use', body: 'WishIT is a moderated connection platform. It is not a crowdfunding site and no financial transactions occur on the platform. All connections are facilitated by human moderators.' },
      { heading: 'Dreams & Authenticity', body: 'Dreams submitted must be genuine and personal. Spam, fraudulent, or misleading dreams will be removed and the account suspended. Do not include personal contact information in your dream story.' },
      { heading: 'Fulfillers', body: 'Fulfillers must act in good faith. Misrepresenting your capabilities, credentials, or intentions is grounds for immediate account ban.' },
      { heading: 'Content Moderation', body: 'All dreams and fulfillment requests are reviewed by our moderation team before any connection is established. We reserve the right to reject any submission at our discretion.' },
      { heading: 'Liability', body: 'WishIT is a connection platform and is not responsible for the outcomes of any dream fulfillment arrangement. Users engage voluntarily and at their own discretion.' },
      { heading: 'Changes', body: 'We may update these terms at any time. Continued use of the platform constitutes acceptance of updated terms.' },
    ],
  },
  trust: {
    title: 'Trust & Moderation Policy',
    badge: 'How we keep WishIT safe',
    sections: [
      { heading: 'Our Commitment', body: 'Every dream and every fulfillment request is reviewed by a trained human moderator before any connection is made. No automated system alone determines outcomes.' },
      { heading: 'Dream Review', body: 'Dreams are reviewed for authenticity, appropriateness, and privacy compliance. Moderators check for personal contact details, misleading content, and policy violations before approving publication.' },
      { heading: 'Fulfiller Vetting', body: 'Fulfillment applications are reviewed to assess the applicant\'s stated capability, credibility, and match quality. Moderators may request additional information before approving a connection.' },
      { heading: 'Trust Scores', body: 'All users maintain a Trust Score that reflects their platform behaviour. Scores affect visibility and access. Positive actions raise scores; violations lower them.' },
      { heading: 'Reporting', body: 'Any user can report a dream or user for policy violations. Reports are reviewed within 48 hours. Serious violations are escalated to senior moderators.' },
      { heading: 'Zero Tolerance', body: 'Harassment, fraud, impersonation, and exploitation are grounds for immediate permanent ban with no appeal.' },
    ],
  },
  about: {
    title: 'About WishIT',
    badge: 'Our story',
    sections: [
      { heading: 'What We Are', body: 'WishIT is a moderated dream fulfillment platform — a safe, anonymous space where people can share their most meaningful dreams and connect with individuals who have the skills, resources, or passion to help make them real.' },
      { heading: 'Why We Exist', body: 'Too many real dreams go unfulfilled not because the right people don\'t exist, but because they never find each other. WishIT is built to close that gap — thoughtfully, safely, and at scale.' },
      { heading: 'How It Works', body: 'Dreamers share their dreams anonymously. Fulfillers apply to help. Trained moderators review every submission before any connection is made. When a match is approved, both parties are connected through our private, moderated messaging system.' },
      { heading: 'Our Values', body: 'Privacy, authenticity, safety, and human dignity are at the core of everything we build. Every feature is designed to protect dreamers and empower fulfillers — never the other way around.' },
      { heading: 'The Team', body: 'WishIT is built by a small team of engineers, designers, and community moderators who believe in the power of human connection. We are an independent, mission-driven company.' },
    ],
  },
  contact: {
    title: 'Contact Us',
    badge: 'We\'d love to hear from you',
    sections: [
      { heading: 'General Enquiries', body: 'For general questions about the platform, email us at hello@wishit.app. We typically respond within 2 business days.' },
      { heading: 'Trust & Safety', body: 'To report a safety concern or urgent moderation issue, email trust@wishit.app. Urgent matters are reviewed within 24 hours.' },
      { heading: 'Press & Partnerships', body: 'For media enquiries or partnership proposals, contact press@wishit.app.' },
      { heading: 'Investor Relations', body: 'For investment enquiries, please reach out at investors@wishit.app.' },
    ],
  },
  careers: {
    title: 'Careers at WishIT',
    badge: 'Join the mission',
    sections: [
      { heading: 'Who We\'re Looking For', body: 'We\'re a small but fast-growing team looking for people who care deeply about human connection and building technology that matters. We value curiosity, empathy, and craft.' },
      { heading: 'Open Roles', body: 'We are currently hiring: Senior Full-Stack Engineer, Community Moderator (remote), and Head of Partnerships. More roles will be listed here as we grow.' },
      { heading: 'How to Apply', body: 'Send your CV and a brief note about why WishIT\'s mission resonates with you to careers@wishit.app.' },
    ],
  },
  report: {
    title: 'Report an Issue',
    badge: 'Help us keep WishIT safe',
    sections: [
      { heading: 'How to Report', body: 'If you\'ve encountered content that violates our policies, you can report it directly using the "Report this dream" button on any dream card, or by contacting trust@wishit.app.' },
      { heading: 'What Happens Next', body: 'All reports are reviewed by our moderation team within 48 hours. For serious violations, we respond within 24 hours. You\'ll receive a notification when your report has been reviewed.' },
      { heading: 'Anonymity', body: 'All reports are confidential. The person you report will never know who filed the report.' },
    ],
  },
};

export default function Legal() {
  const location = useLocation();
  const slug = location.pathname.replace('/', '');
  const page = PAGES[slug] || PAGES.about;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      <div className="gradient-mesh pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="eyebrow-light mb-4">{page.badge}</div>
            <h1 className="font-extrabold text-white" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', letterSpacing: '-0.035em' }}>
              {page.title}
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-12">
        <div className="card-white overflow-hidden" style={{ divideColor: 'var(--border)' }}>
          {page.sections.map((s, i) => (
            <motion.div key={s.heading} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className="p-6 lg:p-8"
              style={{ borderBottom: i < page.sections.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <h2 className="font-extrabold text-[1.05rem] mb-3" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>{s.heading}</h2>
              <p className="leading-relaxed text-[14px]" style={{ color: 'var(--text-3)' }}>{s.body}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3 items-center">
          <Link to="/" className="text-[13.5px] font-medium transition-colors" style={{ color: 'var(--text-3)' }}>← Home</Link>
          <span style={{ color: 'var(--border-dark)' }}>·</span>
          <Link to="/dreams" className="text-[13.5px] font-medium transition-colors" style={{ color: 'var(--text-3)' }}>Browse Dreams</Link>
          <span style={{ color: 'var(--border-dark)' }}>·</span>
          <Link to="/register" className="text-[13.5px] font-bold transition-colors" style={{ color: 'var(--blue)' }}>Get Started →</Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
