import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';

const ease = [0.22, 1, 0.36, 1];

function FadeUp({ children, delay = 0, className = '', style }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-56px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease }}
      className={className}
      style={style}>
      {children}
    </motion.div>
  );
}

function Cascade({ children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-44px' });
  return (
    <motion.div ref={ref}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      initial="hidden" animate={inView ? 'show' : 'hidden'}
      className={className}>
      {children}
    </motion.div>
  );
}

const Item = ({ children, className = '' }) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } } }}
    className={className}>
    {children}
  </motion.div>
);

function Eyebrow({ children, light = false }) {
  return (
    <div className={`eyebrow ${light ? 'eyebrow-light' : 'eyebrow-blue'}`}>
      <div className={`w-5 h-px ${light ? 'bg-blue-400/60' : 'bg-blue-600/60'}`} />
      {children}
      <div className={`w-5 h-px ${light ? 'bg-blue-400/60' : 'bg-blue-600/60'}`} />
    </div>
  );
}

const C = 'max-w-7xl mx-auto px-5 lg:px-8';

/* ── Data ── */
const STEPS = [
  { n: '01', title: 'Submit a Dream',        desc: 'Share your dream privately. Full anonymity from the very first word.', color: 'bg-blue-600' },
  { n: '02', title: 'Human Review',          desc: 'Every submission is reviewed by a real moderator for authenticity and safety.', color: 'bg-indigo-600' },
  { n: '03', title: 'Published Anonymously', desc: 'Approved dreams go live with no name, no photo. Only the dream matters.', color: 'bg-violet-600' },
  { n: '04', title: 'Fulfiller Applies',     desc: 'Verified fulfillers browse and apply to help. Their intentions are reviewed too.', color: 'bg-blue-700' },
  { n: '05', title: 'Safe Connection',       desc: 'Only after moderator approval is a connection made — verified, meaningful, secure.', color: 'bg-emerald-600' },
];

const FEATURED_DREAMS = [
  { title: 'Start My Own Bakery',          cat: 'Career',     cls: 'cat-career',     story: "I've always wanted to carry on my grandmother's legacy by opening a small artisan bakery that brings warmth to our community.", supporters: 143, urgency: null },
  { title: 'Get Specialized Medical Care', cat: 'Health',     cls: 'cat-health',     story: 'My daughter needs treatment unavailable in our country. Finding someone to help navigate this would change everything for our family.', supporters: 187, urgency: 'critical' },
  { title: 'Complete My CS Degree',        cat: 'Education',  cls: 'cat-education',  story: 'Financial hardship forced me to drop out in year two. Completing my degree would open doors I thought were permanently closed.', supporters: 94, urgency: 'urgent' },
  { title: 'Build a Neighborhood Garden',  cat: 'Community',  cls: 'cat-community',  story: 'Our community has no green space. I dream of transforming an unused lot into something alive and shared by everyone.', supporters: 119, urgency: null },
  { title: 'Record My Original Music',     cat: 'Creative',   cls: 'cat-creative',   story: "I've written 12 songs through the hardest years of my life. I dream of recording them so they can reach someone who truly needs them.", supporters: 76, urgency: null },
  { title: 'Learn Tech to Support My Kids',cat: 'Technology', cls: 'cat-technology', story: 'As a single parent I dream of a career in technology — not for me, but to give my children the future they deserve.', supporters: 108, urgency: null },
];

const TRUST_PILLARS = [
  {
    title: 'Anonymous by Design',
    desc: 'Dreamers are never identified. Only the dream is shared — never the person behind it.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"/>
      </svg>
    ),
    color: 'from-blue-500 to-blue-700',
  },
  {
    title: 'Every Dream Moderated',
    desc: 'No dream is published without human review. Quality and safety are non-negotiable.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
      </svg>
    ),
    color: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Verified Fulfillers Only',
    desc: 'Every person wanting to fulfill a dream goes through a strict approval process first.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"/>
      </svg>
    ),
    color: 'from-violet-500 to-purple-700',
  },
  {
    title: 'Full Audit Trail',
    desc: 'Every approval, connection and fulfillment is logged and permanently on record.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
      </svg>
    ),
    color: 'from-amber-500 to-orange-600',
  },
];

const TESTIMONIALS = [
  { quote: "I never expected someone would actually care about my dream. WishIT made it real without ever asking who I was.", outcome: 'University scholarship fulfilled', role: 'Dreamer', country: 'Ghana', initial: 'A', grad: 'from-blue-500 to-blue-700' },
  { quote: "The moderation gave me total confidence. I knew every dream I read was real — I found one that matched exactly what I could offer.", outcome: 'Small business mentorship', role: 'Fulfiller', country: 'United Kingdom', initial: 'M', grad: 'from-emerald-500 to-teal-600' },
  { quote: "Both of us felt completely safe throughout. The connection felt deeply human, not transactional at all.", outcome: 'Medical support secured', role: 'Fulfiller', country: 'Germany', initial: 'S', grad: 'from-violet-500 to-purple-700' },
];

const METRICS = [
  { n: '2,400+', l: 'Dreams Shared',    desc: 'From 50+ countries' },
  { n: '890+',   l: 'Dreams Fulfilled', desc: 'Real outcomes, real impact' },
  { n: '48hrs',  l: 'Avg. Review Time', desc: 'Human moderated' },
  { n: '98%',    l: 'Safety Record',    desc: 'Zero critical incidents' },
];

export default function Landing() {
  return (
    <div className="bg-white overflow-x-hidden">
      <Navbar />

      {/* ═══════════════════════════════════════
          HERO
      ═══════════════════════════════════════ */}
      <section className="relative min-h-screen gradient-mesh noise flex flex-col items-center justify-center overflow-hidden pt-24 pb-32">

        {/* Background layers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-48 -left-32 w-[600px] h-[600px] rounded-full blur-[130px] animate-blob" style={{ background: 'rgba(37,99,235,0.13)', animationDelay: '0s' }} />
          <div className="absolute -bottom-32 -right-16 w-[500px] h-[500px] rounded-full blur-[110px] animate-blob" style={{ background: 'rgba(79,70,229,0.10)', animationDelay: '3.5s' }} />
          <div className="absolute inset-0 dot-pattern opacity-50" />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 75% 55% at 50% 50%, transparent 35%, rgba(5,13,31,0.55) 100%)' }} />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center w-full max-w-4xl mx-auto px-5">

          {/* Trust pill */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="mb-8">
            <div className="trust-badge">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Anonymous · Moderated · Trusted by thousands
            </div>
          </motion.div>

          {/* Headline — Instrument Serif */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.08, ease }}
            className="font-display text-white mb-6"
            style={{ fontSize: 'clamp(2.75rem, 9vw, 6rem)', lineHeight: 1.03, letterSpacing: '-0.01em', fontStyle: 'italic' }}>
            Some Dreams Need<br />
            <span className="gradient-text-blue not-italic font-display" style={{ fontStyle: 'normal' }}>The Right Person.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.18, ease }}
            className="text-white/60 text-[1.0625rem] md:text-[1.125rem] leading-[1.9] max-w-[500px] mb-10">
            WishIT connects anonymous dreamers with verified fulfillers — where every connection is carefully reviewed by a human before it happens.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28, ease }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16 w-full max-w-xs sm:max-w-none">
            <Link to="/register?mode=dreamer" className="w-full sm:w-auto">
              <button className="group w-full sm:w-auto h-[52px] flex items-center justify-center gap-2.5 bg-white text-[#0A1628] font-bold text-[14.5px] px-8 rounded-[16px] hover:bg-blue-50 hover:-translate-y-0.5 transition-all duration-200" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)', letterSpacing: '-0.01em' }}>
                <div className="w-5 h-5 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                  </svg>
                </div>
                Post Your Dream
              </button>
            </Link>
            <Link to="/register?mode=fulfiller" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto h-[52px] flex items-center justify-center gap-2.5 font-bold text-[14.5px] px-8 rounded-[16px] btn-ghost-dark transition-all duration-200" style={{ letterSpacing: '-0.01em' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
                </svg>
                Become a Fulfiller
              </button>
            </Link>
          </motion.div>

          {/* Stat cards */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.42, ease }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-xl">
            {[
              { n: '2,400+', l: 'Dreams' },
              { n: '890+',   l: 'Fulfilled' },
              { n: '50+',    l: 'Countries' },
              { n: '100%',   l: 'Moderated' },
            ].map(({ n, l }, i) => (
              <motion.div key={l}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.48 + i * 0.07, ease }}
                className="glass-dark rounded-2xl py-3.5 px-4 text-center hover:bg-white/[0.08] transition-colors border border-white/[0.07]">
                <div className="text-[1.625rem] font-extrabold text-white leading-none tracking-tight mb-1" style={{ letterSpacing: '-0.03em' }}>{n}</div>
                <div className="text-[10.5px] font-semibold text-white/40 uppercase tracking-[0.12em]">{l}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
          <span className="text-white/20 text-[8.5px] font-bold tracking-[0.28em] uppercase">Scroll</span>
          <svg className="w-3.5 h-3.5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════
          PROOF STRIP
      ═══════════════════════════════════════ */}
      <div style={{ background: '#050D1F', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }} className="py-4 overflow-hidden">
        <div className={C}>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2.5">
            {[
              '2,400+ dreams shared',
              '890+ dreams fulfilled',
              '50+ countries',
              '100% human moderated',
              'Zero tolerance for fraud',
            ].map((label, i) => (
              <div key={label} className="flex items-center gap-2 text-[#3D4F72] text-[12.5px] font-semibold">
                <span className="text-blue-500/70 text-xs">◆</span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 lg:py-32 bg-white relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern-light opacity-50 pointer-events-none" />
        <div className={`${C} relative z-10`}>
          <FadeUp className="w-full text-center">
            <Eyebrow>How It Works</Eyebrow>
            <h2 className="headline text-[#0A1628] mt-5 mb-5">Five steps to a fulfilled dream</h2>
            <p className="text-[#6B7A99] text-[1.0rem] leading-[1.85] text-center" style={{ maxWidth: '32rem', margin: '0 auto' }}>
              Every dream follows a careful, human-led process — no shortcuts, no anonymous connections without approval.
            </p>
          </FadeUp>

          <div className="relative mt-16">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-[26px] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[#E4EAF4] to-transparent" />

            <Cascade className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
              {STEPS.map((s) => (
                <Item key={s.n} className="flex justify-center">
                  <div className="group flex flex-col items-center text-center max-w-[190px] lg:max-w-none w-full">
                    <div className="relative z-10 mb-5 flex-shrink-0">
                      <div className={`w-[52px] h-[52px] rounded-2xl ${s.color} flex items-center justify-center group-hover:-translate-y-1 transition-transform duration-300 shadow-blue-sm`}>
                        <span className="text-[12px] font-black text-white tabular-nums">{s.n}</span>
                      </div>
                    </div>
                    <h3 className="text-[14px] font-bold text-[#0A1628] mb-2 leading-snug">{s.title}</h3>
                    <p className="text-[#6B7A99] text-[12.5px] leading-[1.8]">{s.desc}</p>
                  </div>
                </Item>
              ))}
            </Cascade>
          </div>

          <FadeUp delay={0.25} className="flex justify-center mt-12">
            <Link to="/dreams"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F4F7FB] border border-[#E4EAF4] text-[#3D4F72] font-semibold text-[13.5px] hover:bg-[#EDF1F9] transition-colors group no-min-h">
              Browse Dreams
              <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURED DREAMS
      ═══════════════════════════════════════ */}
      <section className="py-24 lg:py-32 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #F4F7FB 0%, #EFF4FF 60%, #F4F7FB 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[90px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/30 rounded-full blur-[80px]" />
        </div>

        <div className={`${C} relative z-10`}>
          <FadeUp style={{ textAlign: 'center' }}>
            <Eyebrow>Featured Dreams</Eyebrow>
            <h2 className="headline text-[#0A1628] mt-5 mb-4" style={{ textAlign: 'center' }}>Dreams waiting for the right person</h2>
            <p className="text-[#6B7A99] text-[1rem] leading-[1.85] mb-2" style={{ maxWidth: '28rem', margin: '0 auto 0.5rem', textAlign: 'center' }}>
              Real stories, reviewed by our team. Each one waiting for someone with the power to help.
            </p>
            <div className="flex justify-center mt-4">
              <Link to="/dreams"
                className="inline-flex items-center gap-1.5 text-blue-600 font-semibold text-[13.5px] hover:text-blue-800 transition-colors group no-min-h">
                View all dreams
                <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </Link>
            </div>
          </FadeUp>

          <Cascade className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {FEATURED_DREAMS.map((d, i) => (
              <Item key={i} className="flex">
                <div className="group relative flex flex-col w-full bg-white rounded-[20px] border border-[#E4EAF4] hover:border-[#C8D5F0] hover:shadow-float hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden">
                  {/* Top bar accent */}
                  <div className={`absolute top-0 inset-x-0 h-[2px] ${i % 3 === 0 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : i % 3 === 1 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-violet-500 to-purple-500'}`} />

                  <div className="flex flex-col flex-1 p-6 pt-7">
                    {/* Meta */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`badge ${d.cls}`}>{d.cat}</span>
                      <div className="flex items-center gap-1.5">
                        {d.urgency === 'critical' && <span className="badge badge-red">Critical</span>}
                        {d.urgency === 'urgent'   && <span className="badge badge-amber">Urgent</span>}
                        <span className="badge badge-anon">
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                          </svg>
                          Anon
                        </span>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-[#0A1628] text-[15px] leading-snug mb-3 group-hover:text-blue-700 transition-colors" style={{ letterSpacing: '-0.02em' }}>
                      {d.title}
                    </h3>

                    <p className="text-[#6B7A99] text-[13px] leading-[1.8] flex-1 line-clamp-3 mb-4">
                      {d.story}
                    </p>

                    {/* Support bar */}
                    <div className="flex items-center gap-2 mb-5">
                      <div className="flex-1 h-[3px] bg-[#F0F4FB] rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all`}
                          style={{ width: `${Math.min(100, Math.round(d.supporters / 2))}%` }} />
                      </div>
                      <span className="text-[11px] text-[#9AAAC7] font-semibold flex-shrink-0 flex items-center gap-1">
                        <svg className="w-3 h-3 text-rose-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"/>
                        </svg>
                        {d.supporters}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-[#F0F4FB]">
                      <Link to="/register?mode=fulfiller">
                        <button className="w-full h-9 rounded-[12px] text-[12.5px] font-bold text-blue-700 bg-blue-50 border border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-blue-sm transition-all duration-200 no-min-h">
                          Make This Dream Real →
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Item>
            ))}
          </Cascade>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          METRICS
      ═══════════════════════════════════════ */}
      <FadeUp>
        <div className="py-14 bg-white border-y border-[#E4EAF4]">
          <div className={C}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-[#E4EAF4]">
              {METRICS.map(({ n, l, desc }) => (
                <div key={l} className="flex flex-col items-center text-center px-4 lg:px-8">
                  <div className="font-extrabold text-[#0A1628] mb-1" style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', letterSpacing: '-0.04em' }}>{n}</div>
                  <div className="text-[13.5px] font-bold text-[#0A1628] mb-0.5">{l}</div>
                  <div className="text-[11.5px] text-[#9AAAC7]">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeUp>

      {/* ═══════════════════════════════════════
          TRUST & SAFETY
      ═══════════════════════════════════════ */}
      <section className="py-24 lg:py-32 gradient-mesh relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 dot-pattern opacity-40" />
          <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-blue-500/6 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/7 rounded-full blur-[120px]" />
        </div>

        <div className={`${C} relative z-10`}>
          <FadeUp style={{ textAlign: 'center' }}>
            <Eyebrow light>Trust & Safety</Eyebrow>
            <h2 className="headline text-white mt-5 mb-5" style={{ textAlign: 'center' }}>Built on trust, not transactions</h2>
            <p className="text-white/50 text-[1rem] leading-[1.85]" style={{ maxWidth: '28rem', margin: '0 auto', textAlign: 'center' }}>
              WishIT is not crowdfunding. No donations, no fundraising. Every connection is earned through a rigorous human-led process.
            </p>
          </FadeUp>

          <Cascade className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-14">
            {TRUST_PILLARS.map((t) => (
              <Item key={t.title}>
                <div className="group card-dark rounded-[20px] p-6 h-full hover:border-white/[0.14] transition-all duration-300 cursor-default">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center mb-5 text-white shadow-blue-sm group-hover:-translate-y-0.5 transition-transform duration-300`}>
                    {t.icon}
                  </div>
                  <h3 className="text-[14px] font-bold text-white mb-2.5 leading-snug">{t.title}</h3>
                  <p className="text-white/40 text-[12.5px] leading-[1.8]">{t.desc}</p>
                </div>
              </Item>
            ))}
          </Cascade>

          <FadeUp delay={0.25} className="flex justify-center mt-12">
            <div className="inline-flex items-center gap-4 glass-dark rounded-2xl px-6 py-3.5 border border-white/[0.07]">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-white/55 text-[12.5px] font-medium">Platform Online · All systems operational</span>
              </div>
              <div className="h-3.5 w-px bg-white/10" />
              <Link to="/trust" className="text-blue-400 text-[12.5px] font-semibold hover:text-blue-300 transition-colors no-min-h">
                Our policy →
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════ */}
      <section id="stories" className="py-24 lg:py-32 bg-white relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-[400px] h-[400px] bg-blue-50/60 rounded-full blur-[70px] pointer-events-none" />

        <div className={`${C} relative z-10`}>
          <FadeUp style={{ textAlign: 'center' }}>
            <Eyebrow>Success Stories</Eyebrow>
            <h2 className="headline text-[#0A1628] mt-5 mb-5" style={{ textAlign: 'center' }}>Real dreams. Real connections.</h2>
            <p className="text-[#6B7A99] text-[1rem] leading-[1.85]" style={{ maxWidth: '28rem', margin: '0 auto', textAlign: 'center' }}>
              Every story here represents a human connection made carefully, safely, and meaningfully.
            </p>
          </FadeUp>

          <Cascade className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12">
            {TESTIMONIALS.map((s, i) => (
              <Item key={i} className="flex">
                <div className="group flex flex-col w-full bg-white rounded-[20px] border border-[#E4EAF4] hover:shadow-float hover:-translate-y-1.5 hover:border-[#C8D5F0] transition-all duration-300 overflow-hidden">
                  <div className={`h-[2px] bg-gradient-to-r ${i===0?'from-blue-500 to-indigo-500':i===1?'from-emerald-500 to-teal-500':'from-violet-500 to-purple-500'}`} />
                  <div className="flex flex-col flex-1 p-7">
                    {/* Stars */}
                    <div className="flex items-center gap-0.5 mb-5">
                      {Array.from({length:5}).map((_,k)=>(
                        <svg key={k} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>

                    <p className="font-display text-[#0A1628] text-[1.0rem] leading-[1.8] flex-1 mb-6 italic">
                      "{s.quote}"
                    </p>

                    <div className="flex items-center gap-3 pt-5 border-t border-[#F0F4FB]">
                      <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 font-bold text-white text-[12px] bg-gradient-to-br ${s.grad}`}>
                        {s.initial}
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-[#0A1628] leading-snug">{s.outcome}</div>
                        <div className="text-[11px] text-[#9AAAC7] mt-0.5">{s.role} · {s.country}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Item>
            ))}
          </Cascade>

          <FadeUp delay={0.25} className="flex justify-center mt-10">
            <Link to="/stories"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F4F7FB] border border-[#E4EAF4] text-[#3D4F72] font-semibold text-[13.5px] hover:bg-[#EDF1F9] transition-colors group no-min-h">
              Read all stories
              <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          WHY WISHIT
      ═══════════════════════════════════════ */}
      <section className="py-24 lg:py-32" style={{ background: 'linear-gradient(180deg, #F4F7FB 0%, #EFF4FF 100%)' }}>
        <div className={C}>
          <FadeUp style={{ maxWidth: '42rem', margin: '0 auto', textAlign: 'center' }}>
            <Eyebrow>Why WishIT</Eyebrow>
            <h2 className="headline text-[#0A1628] mt-5 mb-6" style={{ textAlign: 'center' }}>
              Different by design.<br/>
              <span className="gradient-text-dark">Safe by default.</span>
            </h2>
            <p className="text-[#6B7A99] text-[1rem] leading-[1.85] mb-10" style={{ textAlign: 'center' }}>
              We built the thing crowdfunding forgot: a platform where connections matter more than transactions, and every dream is treated with dignity.
            </p>
          </FadeUp>
          <FadeUp delay={0.1} style={{ maxWidth: '48rem', margin: '2.5rem auto 0' }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { title: 'Not crowdfunding', desc: 'No money changes hands on WishIT. We connect skills, resources, and people.' },
              { title: 'Human moderation, always', desc: 'Every dream and every fulfiller application is reviewed by a real person.' },
              { title: 'Privacy as a feature', desc: 'Dreamers are permanently anonymous until both parties consent to connect.' },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-white rounded-[18px] border border-[#E4EAF4] p-5" style={{ boxShadow: '0 2px 10px rgba(10,22,40,0.05)' }}>
                <div className="w-8 h-8 rounded-[10px] bg-blue-600 flex items-center justify-center mb-3">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <p className="font-bold text-[#0A1628] text-[13.5px] mb-1">{title}</p>
                <p className="text-[#6B7A99] text-[13px] leading-relaxed">{desc}</p>
              </div>
            ))}
          </FadeUp>
        </div>
      </section>

      <Footer />
    </div>
  );
}
