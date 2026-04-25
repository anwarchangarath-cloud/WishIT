import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';

const ease = [0.22, 1, 0.36, 1];

function FadeUp({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease }}
      className={className}>
      {children}
    </motion.div>
  );
}

function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.8, delay, ease }}
      className={className}>
      {children}
    </motion.div>
  );
}

function Cascade({ children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-48px' });
  return (
    <motion.div ref={ref}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
      initial="hidden" animate={inView ? 'show' : 'hidden'}
      className={className}>
      {children}
    </motion.div>
  );
}

const Item = ({ children, className = '' }) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}
    className={className}>
    {children}
  </motion.div>
);

function Eyebrow({ children, light = false, center = true }) {
  return (
    <div className={`flex items-center gap-3 ${center ? 'justify-center' : ''} ${light ? 'text-blue-400' : 'text-blue-600'}`}>
      <div className="section-divider !m-0 !w-6" />
      <span className="text-[10.5px] font-bold uppercase tracking-[0.22em]">{children}</span>
      <div className="section-divider !m-0 !w-6" />
    </div>
  );
}

function SectionHeader({ eyebrow, heading, sub, light = false, className = '' }) {
  return (
    <div className={`flex flex-col items-center text-center w-full max-w-2xl mx-auto ${className}`}>
      <Eyebrow light={light}>{eyebrow}</Eyebrow>
      <h2 className={`text-4xl md:text-5xl font-black leading-[1.08] tracking-tight mt-5 ${light ? 'text-white' : 'text-slate-900'}`}>
        {heading}
      </h2>
      {sub && (
        <p className={`text-[1.05rem] leading-[1.8] mt-5 max-w-xl ${light ? 'text-slate-300/80' : 'text-slate-500'}`}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─── Data ─── */
const STEPS = [
  { n: '01', title: 'Submit a Dream',        desc: 'A dreamer writes their story privately. Full anonymity is guaranteed from the very first word.', color: 'from-blue-500 to-blue-600' },
  { n: '02', title: 'Moderation Review',     desc: 'Every submission is reviewed by a human moderator for authenticity, safety and genuine need.', color: 'from-indigo-500 to-indigo-600' },
  { n: '03', title: 'Published Anonymously', desc: 'Approved dreams go live with no name, no photo, no identity. Only the dream matters.', color: 'from-violet-500 to-violet-600' },
  { n: '04', title: 'Fulfiller Requests',    desc: 'Verified fulfillers browse and apply to help. Their intentions are reviewed too.', color: 'from-blue-600 to-indigo-600' },
  { n: '05', title: 'Safe Connection',       desc: 'Only after moderator approval is a connection made — verified, meaningful and secure.', color: 'from-emerald-500 to-teal-600' },
];

const DREAMS = [
  { title: 'Start My Own Bakery',           cat: 'Career',     story: "I've always wanted to carry on my grandmother's legacy by opening a small artisan bakery that brings warmth and tradition to our community.", supporters: 143, urgency: null },
  { title: 'Get Specialized Medical Care',  cat: 'Health',     story: 'My daughter needs treatment unavailable in our country. Finding someone to help navigate this would change everything for our family.', supporters: 187, urgency: 'critical' },
  { title: 'Complete My CS Degree',         cat: 'Education',  story: 'Financial hardship forced me to drop out in year two. Completing my degree would open doors I thought were permanently closed.', supporters: 94, urgency: 'urgent' },
  { title: 'Build a Neighborhood Garden',   cat: 'Community',  story: 'Our community has no green space. I dream of transforming an unused lot into something alive and shared by everyone around us.', supporters: 119, urgency: null },
  { title: 'Record My Original Music',      cat: 'Creative',   story: "I've written 12 songs through the hardest years of my life. I dream of recording them so they can reach someone who truly needs them.", supporters: 76, urgency: null },
  { title: 'Learn Tech to Support My Kids', cat: 'Technology', story: 'As a single parent I dream of a career in technology — not for me, but to give my children the future they deserve.', supporters: 108, urgency: null },
];

const TRUST = [
  { title: 'Anonymous by Design',     desc: 'Dreamers are never identified. Only the dream is shared — never the person behind it.', icon: 'M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z', gradient: 'from-blue-500 to-blue-600' },
  { title: 'Every Dream Moderated',   desc: 'No dream is published without human review. Quality and safety are non-negotiable.', icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z', gradient: 'from-emerald-500 to-teal-600' },
  { title: 'Verified Fulfillers Only', desc: 'Every person who wants to fulfill a dream goes through a strict approval process first.', icon: 'M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z', gradient: 'from-violet-500 to-purple-600' },
  { title: 'Full Audit Trail',         desc: 'Every approval, connection and fulfillment is logged, traceable and permanently on record.', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z', gradient: 'from-amber-500 to-orange-500' },
];

const TESTIMONIALS = [
  { quote: "I never expected someone would actually care about my dream. WishIT made it real without ever asking who I was.", outcome: 'University scholarship fulfilled', role: 'Dreamer', country: 'Ghana', initial: 'A' },
  { quote: "The moderation gave me total confidence. I knew every dream I read was real. I found one that matched exactly what I could offer.", outcome: 'Small business mentorship', role: 'Fulfiller', country: 'United Kingdom', initial: 'M' },
  { quote: "Both of us felt completely safe throughout. The connection felt deeply human, not transactional at all.", outcome: 'Medical support secured', role: 'Fulfiller', country: 'Germany', initial: 'S' },
];

const CAT = {
  Career:     { pill: 'bg-violet-50 text-violet-700 border-violet-200',  dot: 'bg-violet-400' },
  Health:     { pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
  Education:  { pill: 'bg-blue-50 text-blue-700 border-blue-200',       dot: 'bg-blue-400' },
  Community:  { pill: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-400' },
  Creative:   { pill: 'bg-pink-50 text-pink-700 border-pink-200',       dot: 'bg-pink-400' },
  Technology: { pill: 'bg-cyan-50 text-cyan-700 border-cyan-200',       dot: 'bg-cyan-400' },
};

const C = 'max-w-7xl mx-auto px-6 lg:px-8';

const METRICS = [
  { n: '2,400+', l: 'Dreams Posted',    icon: '✦' },
  { n: '890+',   l: 'Fulfilled',        icon: '✓' },
  { n: '50+',    l: 'Countries',        icon: '◉' },
  { n: '100%',   l: 'Human-Moderated', icon: '⬡' },
];

export default function Landing() {
  return (
    <div className="bg-white overflow-x-hidden">
      <Navbar />

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative min-h-screen gradient-mesh flex flex-col items-center justify-center overflow-hidden pt-24 pb-32">

        {/* Background layers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Animated orbs */}
          <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-blue-600/12 blur-[120px] animate-blob" style={{ animationDelay: '0s' }} />
          <div className="absolute -bottom-40 -right-20 w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[110px] animate-blob" style={{ animationDelay: '3s' }} />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-400/8 blur-[90px] animate-blob" style={{ animationDelay: '6s' }} />
          {/* Grid overlay */}
          <div className="absolute inset-0 grid-pattern opacity-60" />
          {/* Radial vignette */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, rgba(6,15,30,0.5) 100%)' }} />
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center text-center w-full max-w-5xl mx-auto px-6">

          {/* Trust badge */}
          <motion.div initial={{ opacity: 0, y: -16, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease }} className="mb-8">
            <div className="inline-flex items-center gap-2.5 glass-dark rounded-full px-5 py-2.5 border border-white/[0.12]">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" style={{ animationDelay: '0.6s' }} />
              </div>
              <span className="text-white/60 text-[12.5px] font-medium tracking-wide">Anonymous · Moderated · Trusted</span>
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease }}
            className="font-black text-white mb-6"
            style={{ fontSize: 'clamp(2.8rem, 8vw, 6rem)', lineHeight: 1.03, letterSpacing: '-0.035em' }}>
            Some Dreams Need<br />
            <span style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #A5B4FC 50%, #C4B5FD 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              The Right Person.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            className="text-slate-300/85 text-lg md:text-xl leading-[1.85] max-w-[520px] mx-auto mb-10">
            WishIT connects anonymous dreamers with verified fulfillers — where every connection is carefully reviewed by a human before it happens.
          </motion.p>

          {/* CTA buttons */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.3, ease }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16 w-full max-w-xs sm:max-w-none">
            <Link to="/register?mode=dreamer" className="w-full sm:w-auto">
              <button className="group w-full sm:w-auto h-[54px] flex items-center justify-center gap-3 bg-white text-slate-900 font-bold text-[15px] px-9 rounded-2xl shadow-float hover:bg-blue-50 hover:-translate-y-1 transition-all duration-250">
                <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-700 transition-colors">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
                  </svg>
                </div>
                Post Your Dream
              </button>
            </Link>
            <Link to="/register?mode=fulfiller" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto h-[54px] flex items-center justify-center gap-3 text-white font-bold text-[15px] px-9 rounded-2xl glass-white hover:bg-white/20 transition-all duration-250">
                <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
                </svg>
                Become a Fulfiller
              </button>
            </Link>
          </motion.div>

          {/* Floating stat cards */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.45, ease }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl mx-auto">
            {METRICS.map(({ n, l, icon }, i) => (
              <motion.div key={l}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.08, ease }}
                className="glass-dark rounded-2xl p-4 text-center border border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.09] transition-all duration-300">
                <div className="text-blue-400/60 text-xs mb-1.5">{icon}</div>
                <div className="text-[1.5rem] font-black text-white leading-none tracking-tight mb-1">{n}</div>
                <div className="text-slate-400 text-[10.5px] font-medium tracking-wider uppercase">{l}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-white/20 text-[9px] font-bold tracking-[0.3em] uppercase">Scroll</span>
          <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7"/>
          </svg>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          SOCIAL PROOF STRIP
      ══════════════════════════════════════════ */}
      <FadeIn>
        <div className="bg-slate-950 border-y border-white/[0.05] py-5 overflow-hidden">
          <div className={C}>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-center">
              {[
                { label: '2,400+ dreams shared', icon: '◆' },
                { label: '890+ dreams fulfilled', icon: '✓' },
                { label: '50+ countries', icon: '◉' },
                { label: '100% human moderated', icon: '⬡' },
                { label: 'Zero tolerance for fraud', icon: '⊗' },
              ].map(({ label, icon }) => (
                <div key={label} className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                  <span className="text-blue-500 text-xs">{icon}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section id="how-it-works" className="py-28 lg:py-36 bg-white relative overflow-hidden">
        {/* Subtle background dot pattern */}
        <div className="absolute inset-0 dot-pattern-dark opacity-40 pointer-events-none" />

        <div className={`${C} relative z-10`}>
          <FadeUp className="w-full">
            <SectionHeader
              eyebrow="How It Works"
              heading="Five steps to a fulfilled dream"
              sub="Every dream follows a careful, human-led process — no shortcuts, no anonymous connections without approval."
            />
          </FadeUp>

          <div className="relative mt-20">
            {/* Connecting line desktop */}
            <div className="hidden lg:block absolute top-[27px] left-[10%] right-[10%] h-px">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
            </div>

            <Cascade className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
              {STEPS.map((s, idx) => (
                <Item key={s.n} className="flex justify-center">
                  <div className="group flex flex-col items-center text-center w-full max-w-[200px] lg:max-w-none">
                    {/* Step badge */}
                    <div className="relative z-10 mb-6 flex-shrink-0">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} shadow-blue-sm flex items-center justify-center group-hover:-translate-y-1 transition-transform duration-300`}>
                        <span className="text-[13px] font-black text-white tabular-nums">{s.n}</span>
                      </div>
                      {/* Glow */}
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-300`} />
                    </div>
                    <h3 className="text-[14.5px] font-bold text-slate-900 mb-2.5 leading-snug">{s.title}</h3>
                    <p className="text-slate-500 text-[13px] leading-[1.8]">{s.desc}</p>
                  </div>
                </Item>
              ))}
            </Cascade>
          </div>

          {/* CTA below steps */}
          <FadeUp delay={0.3} className="flex justify-center mt-16">
            <Link to="/dreams"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 font-semibold text-sm hover:bg-blue-100 transition-colors group">
              Browse Dreams
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURED DREAMS
      ══════════════════════════════════════════ */}
      <section className="py-28 lg:py-36 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 50%, #F8FAFC 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-[90px]" />
        </div>

        <div className={`${C} relative z-10`}>
          <FadeUp className="w-full">
            <SectionHeader
              eyebrow="Featured Dreams"
              heading="Dreams waiting for the right person"
              sub="These are real dreams, real stories. Each one reviewed by our team before it reaches you."
            />
            <div className="flex justify-center mt-6">
              <Link to="/dreams"
                className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm hover:text-blue-800 transition-colors group">
                View all dreams
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </Link>
            </div>
          </FadeUp>

          <Cascade className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
            {DREAMS.map((d, i) => (
              <Item key={i} className="flex">
                <div className="group relative flex flex-col w-full bg-white rounded-3xl border border-slate-100/80 shadow-card overflow-hidden hover:shadow-float hover:-translate-y-2 transition-all duration-400 cursor-pointer">
                  {/* Top accent bar */}
                  <div className={`absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r ${i % 3 === 0 ? 'from-blue-500 to-indigo-500' : i % 3 === 1 ? 'from-emerald-500 to-teal-500' : 'from-violet-500 to-purple-500'}`} />

                  <div className="flex flex-col flex-1 p-7 pt-8">
                    {/* Meta row */}
                    <div className="flex items-center justify-between mb-5">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold border ${CAT[d.cat]?.pill || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${CAT[d.cat]?.dot || 'bg-slate-400'}`} />
                        {d.cat}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {d.urgency === 'critical' && (
                          <span className="px-2 py-0.5 bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold rounded-full">Critical</span>
                        )}
                        {d.urgency === 'urgent' && (
                          <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-600 text-[10px] font-bold rounded-full">Urgent</span>
                        )}
                        <span className="flex items-center gap-1 text-slate-400 text-[11px] font-medium">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                          </svg>
                          Anon
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-[1.05rem] font-black text-slate-900 leading-snug mb-3 group-hover:text-blue-700 transition-colors duration-200">
                      {d.title}
                    </h3>

                    {/* Story */}
                    <p className="text-slate-500 text-[13.5px] leading-[1.82] flex-1 line-clamp-3">
                      {d.story}
                    </p>

                    {/* Supporters */}
                    <div className="flex items-center gap-2 mt-5">
                      <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.round(d.supporters / 2))}%` }} />
                      </div>
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1 flex-shrink-0">
                        <svg className="w-3 h-3 text-rose-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"/>
                        </svg>
                        {d.supporters}
                      </span>
                    </div>

                    {/* CTA */}
                    <div className="mt-5 pt-5 border-t border-slate-100">
                      <Link to="/register?mode=fulfiller">
                        <button className="w-full h-10 rounded-xl text-[13px] font-bold text-blue-700 bg-blue-50 border border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-blue-sm transition-all duration-200">
                          Make This Dream Real
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

      {/* ══════════════════════════════════════════
          PLATFORM METRICS
      ══════════════════════════════════════════ */}
      <FadeUp>
        <div className="py-16 bg-white border-y border-slate-100">
          <div className={C}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-slate-100">
              {[
                { n: '2,400+',  l: 'Dreams Shared',    desc: 'From 50+ countries' },
                { n: '890+',    l: 'Dreams Fulfilled',  desc: 'Real outcomes, real impact' },
                { n: '48hrs',   l: 'Review Turnaround', desc: 'Average moderation time' },
                { n: '98%',     l: 'Safety Record',     desc: 'Zero critical incidents' },
              ].map(({ n, l, desc }) => (
                <div key={l} className="flex flex-col items-center text-center px-4 lg:px-8">
                  <div className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-1">{n}</div>
                  <div className="text-sm font-bold text-slate-700 mb-1">{l}</div>
                  <div className="text-xs text-slate-400">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeUp>

      {/* ══════════════════════════════════════════
          TRUST & SAFETY
      ══════════════════════════════════════════ */}
      <section className="py-28 lg:py-36 gradient-mesh relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 grid-pattern opacity-40" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/8 rounded-full blur-[160px]" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-[130px]" />
        </div>

        <div className={`${C} relative z-10`}>
          <FadeUp className="w-full">
            <SectionHeader
              light
              eyebrow="Trust & Safety"
              heading="Built on trust, not transactions"
              sub="WishIT is not crowdfunding. No donations, no fundraising. Every connection is earned through a rigorous human-led process."
            />
          </FadeUp>

          <Cascade className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-16">
            {TRUST.map((t) => (
              <Item key={t.title}>
                <div className="group flex flex-col h-full glass-dark rounded-3xl p-7 border border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.08] transition-all duration-350 cursor-default">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.gradient} flex items-center justify-center mb-6 flex-shrink-0 shadow-blue-sm group-hover:-translate-y-0.5 transition-transform duration-300`}>
                    <svg className="w-5.5 h-5.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={t.icon}/>
                    </svg>
                  </div>
                  <h3 className="text-[15px] font-bold text-white mb-2.5 leading-snug">{t.title}</h3>
                  <p className="text-slate-400/90 text-[13.5px] leading-[1.78]">{t.desc}</p>
                </div>
              </Item>
            ))}
          </Cascade>

          {/* Bottom trust bar */}
          <FadeUp delay={0.3} className="flex justify-center mt-14">
            <div className="inline-flex items-center gap-4 glass-dark rounded-2xl px-7 py-4 border border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-slate-300 text-sm font-medium">Platform Online · All systems operational</span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <Link to="/trust" className="text-blue-400 text-sm font-semibold hover:text-blue-300 transition-colors">
                View our policy →
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SUCCESS STORIES / TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section id="stories" className="py-28 lg:py-36 bg-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[80px]" />
        </div>

        <div className={`${C} relative z-10`}>
          <FadeUp className="w-full">
            <SectionHeader
              eyebrow="Success Stories"
              heading="Real dreams. Real connections."
              sub="Every story here represents a human connection made carefully, safely, and meaningfully."
            />
          </FadeUp>

          <Cascade className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {TESTIMONIALS.map((s, i) => (
              <Item key={i} className="flex">
                <div className="group relative flex flex-col w-full bg-white rounded-3xl border border-slate-100 shadow-card hover:shadow-float hover:-translate-y-1.5 transition-all duration-300 overflow-hidden">
                  {/* Top gradient band */}
                  <div className={`h-1 ${i === 0 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : i === 1 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-violet-500 to-purple-500'}`} />

                  <div className="flex flex-col flex-1 p-8">
                    {/* Stars */}
                    <div className="flex items-center gap-0.5 mb-6">
                      {Array.from({ length: 5 }).map((_, k) => (
                        <svg key={k} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>

                    {/* Quote mark */}
                    <div className="text-6xl text-blue-100 font-serif leading-none -mt-2 mb-2 select-none">"</div>

                    {/* Quote */}
                    <p className="text-slate-700 text-[15px] leading-[1.85] flex-1 -mt-4 mb-7">
                      {s.quote}
                    </p>

                    {/* Attribution */}
                    <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white text-sm ${i === 0 ? 'bg-gradient-to-br from-blue-500 to-blue-700' : i === 1 ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-violet-500 to-purple-600'}`}>
                        {s.initial}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 leading-snug">{s.outcome}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{s.role} · {s.country}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Item>
            ))}
          </Cascade>

          <FadeUp delay={0.3} className="flex justify-center mt-12">
            <Link to="/stories"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors group">
              Read all success stories
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          WHY WISHIT (differentiators)
      ══════════════════════════════════════════ */}
      <section className="py-24 lg:py-32" style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%)' }}>
        <div className={C}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <FadeUp>
              <Eyebrow center={false}>Why WishIT</Eyebrow>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 leading-[1.08] tracking-tight mt-5 mb-6">
                Different by design.<br/>
                <span className="text-blue-600">Safe by default.</span>
              </h2>
              <p className="text-slate-500 text-[1.05rem] leading-[1.85] mb-8 max-w-md">
                We built the thing crowdfunding forgot: a platform where connections matter more than transactions, and every dream is treated with dignity.
              </p>
              <div className="space-y-4">
                {[
                  { title: 'Not crowdfunding', desc: 'No money changes hands on WishIT. We connect skills, resources, and people.' },
                  { title: 'Human moderation, always', desc: 'Every dream and every fulfiller application is reviewed by a real person.' },
                  { title: 'Privacy as a feature', desc: 'Dreamers are permanently anonymous. Identity is only revealed when both parties consent.' },
                ].map(({ title, desc }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{title}</p>
                      <p className="text-slate-500 text-sm leading-relaxed mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>

            {/* Right — visual block */}
            <FadeUp delay={0.15}>
              <div className="relative">
                {/* Main card */}
                <div className="relative bg-white rounded-3xl border border-slate-100 shadow-float p-8 z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Dream Approved</p>
                      <p className="text-slate-400 text-xs">Reviewed by Jamie Chen · Just now</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      <span className="text-emerald-700 text-xs font-semibold">Live</span>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">Education</span>
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full border border-amber-200">Urgent</span>
                    </div>
                    <p className="font-bold text-slate-900 text-sm">Complete My CS Degree</p>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed line-clamp-2">Financial hardship forced me to drop out in year two...</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full w-4/5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
                    </div>
                    <span className="text-xs text-slate-400 font-medium">94 supporters</span>
                  </div>
                </div>

                {/* Floating mini cards */}
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  className="absolute -top-6 -right-6 bg-white rounded-2xl border border-slate-100 shadow-card p-4 z-20 w-40">
                  <div className="text-xs text-slate-400 mb-1">New connection</div>
                  <div className="text-sm font-bold text-slate-900">Marcus W. wants to help</div>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span className="text-xs text-emerald-600 font-semibold">Under review</span>
                  </div>
                </motion.div>

                <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-4 -left-6 bg-white rounded-2xl border border-slate-100 shadow-card p-4 z-20 w-36">
                  <div className="text-2xl font-black text-slate-900">890+</div>
                  <div className="text-xs text-slate-400 mt-0.5">Dreams fulfilled</div>
                  <div className="h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div className="h-full w-[88%] bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                  </div>
                </motion.div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="py-28 lg:py-36 relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #0A1628 0%, #0F2352 40%, #1348A0 80%, #1D4ED8 100%)' }}>
        {/* Background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] rounded-full bg-blue-400/8 blur-[120px]" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center w-full max-w-3xl mx-auto px-6">
          <FadeUp className="flex flex-col items-center text-center w-full">
            <Eyebrow light>Get Started Today</Eyebrow>
            <h2 className="font-black text-white leading-[1.05] tracking-tight mt-5 mb-6"
              style={{ fontSize: 'clamp(2.25rem, 5vw, 4.25rem)' }}>
              Ready to make<br />
              <span style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #C4B5FD 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                a dream real?
              </span>
            </h2>
            <p className="text-blue-100/75 text-lg leading-[1.8] text-center max-w-md mx-auto mb-12">
              Whether you carry a dream or have the power to fulfill one — this is where it begins.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xs sm:max-w-none mb-12">
              <Link to="/register?mode=dreamer" className="w-full sm:w-auto">
                <button className="group w-full sm:w-auto h-[54px] flex items-center justify-center gap-3 bg-white text-slate-900 font-bold text-[15px] px-10 rounded-2xl shadow-float hover:bg-blue-50 hover:-translate-y-1 transition-all duration-250">
                  Post Your Dream
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </Link>
              <Link to="/register?mode=fulfiller" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto h-[54px] flex items-center justify-center gap-3 text-white font-bold text-[15px] px-10 rounded-2xl glass-white hover:bg-white/20 transition-all duration-250">
                  Grant a Dream
                </button>
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {['Free to use', 'No account needed to browse', 'Full anonymity guaranteed', '100% moderated'].map(t => (
                <div key={t} className="flex items-center gap-1.5 text-slate-400/80 text-xs font-medium">
                  <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                  </svg>
                  {t}
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      <Footer />
    </div>
  );
}
