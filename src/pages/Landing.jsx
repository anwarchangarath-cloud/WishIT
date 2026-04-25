import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import Footer from '../components/layout/Footer';

/* ─── motion helpers ─── */
const ease = [0.22, 1, 0.36, 1];

function FadeUp({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease }}
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
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
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

/* ─── Eyebrow label ─── */
function Eyebrow({ children, light = false }) {
  const col = light ? 'text-blue-400' : 'text-blue-600';
  const bar = light ? 'bg-blue-500/30' : 'bg-blue-200';
  return (
    <div className={`flex items-center justify-center gap-3 ${col}`}>
      <span className={`h-px w-8 ${bar}`} />
      <span className="text-[11px] font-bold uppercase tracking-[0.22em]">{children}</span>
      <span className={`h-px w-8 ${bar}`} />
    </div>
  );
}

/* ─── Section header — used by every section ─── */
function SectionHeader({ eyebrow, heading, sub, light = false, className = '' }) {
  return (
    <div className={`flex flex-col items-center text-center w-full max-w-2xl mx-auto ${className}`}>
      <Eyebrow light={light}>{eyebrow}</Eyebrow>
      <h2 className={`text-4xl md:text-5xl font-black leading-[1.1] tracking-tight mt-4 ${light ? 'text-white' : 'text-slate-900'}`}>
        {heading}
      </h2>
      {sub && (
        <p className={`text-lg leading-[1.75] mt-5 ${light ? 'text-slate-400' : 'text-slate-500'}`}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─── data ─── */
const STEPS = [
  { n: '01', title: 'Submit a Dream',       desc: 'A dreamer writes their story privately. Full anonymity is guaranteed from the very first word.' },
  { n: '02', title: 'Moderation Review',    desc: 'Every submission is reviewed by a human moderator for authenticity, safety and genuine need.' },
  { n: '03', title: 'Published Anonymously',desc: 'Approved dreams go live with no name, no photo, no identity. Only the dream matters.' },
  { n: '04', title: 'Fulfiller Requests',   desc: 'Verified fulfillers browse and request to help. Their intentions are reviewed too.' },
  { n: '05', title: 'Safe Connection',      desc: 'Only after moderator approval is a connection made — verified, meaningful and secure.' },
];

const DREAMS = [
  { title: 'Start My Own Bakery',            cat: 'Career',     story: "I've always wanted to carry on my grandmother's legacy by opening a small artisan bakery that brings warmth and tradition to our community." },
  { title: 'Get Specialized Medical Care',   cat: 'Health',     story: 'My daughter needs treatment unavailable in our country. Finding someone to help navigate this would change everything for our family.' },
  { title: 'Complete My CS Degree',          cat: 'Education',  story: 'Financial hardship forced me to drop out in year two. Completing my degree would open doors I thought were permanently closed.' },
  { title: 'Build a Neighborhood Garden',    cat: 'Community',  story: 'Our community has no green space. I dream of transforming an unused lot into something alive and shared by everyone around us.' },
  { title: 'Record My Original Music',       cat: 'Creative',   story: "I've written 12 songs through the hardest years of my life. I dream of recording them so they can reach someone who truly needs them." },
  { title: 'Learn Tech to Support My Kids',  cat: 'Technology', story: 'As a single parent I dream of a career in technology — not for me, but to give my children the future they deserve.' },
];

const TRUST = [
  { title: 'Anonymous by Design',    desc: 'Dreamers are never identified. Only the dream is shared — never the person behind it.',                           icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"/></svg> },
  { title: 'Every Dream Moderated',  desc: 'No dream is published without human review. Quality and safety are non-negotiable.',                              icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg> },
  { title: 'Verified Fulfillers Only',desc: 'Every person who wants to fulfill a dream goes through a strict approval process first.',                         icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"/></svg> },
  { title: 'Full Audit Trail',        desc: 'Every approval, connection and fulfillment is logged, traceable and permanently on record.',                    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg> },
];

const STORIES = [
  { quote: "I never expected someone would actually care about my dream. WishIT made it real without ever asking who I was.",                                  outcome: 'University scholarship fulfilled', role: 'Dreamer'  },
  { quote: "The moderation gave me total confidence. I knew every dream I read was real. I found one that matched exactly what I could offer.",               outcome: 'Small business mentorship',       role: 'Fulfiller' },
  { quote: "Both of us felt completely safe throughout the whole process. The connection felt deeply human, not transactional at all.",                        outcome: 'Medical support secured',         role: 'Fulfiller' },
];

const CAT = {
  Career:     'bg-violet-50  text-violet-700  border-violet-200',
  Health:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  Education:  'bg-blue-50    text-blue-700    border-blue-200',
  Community:  'bg-orange-50  text-orange-700  border-orange-200',
  Creative:   'bg-pink-50    text-pink-700    border-pink-200',
  Technology: 'bg-cyan-50    text-cyan-700    border-cyan-200',
};

const C = 'max-w-7xl mx-auto px-6 lg:px-8';   /* single global container */

export default function Landing() {
  return (
    <div className="bg-white overflow-x-hidden">

      {/* ══════════════════════
          HERO
      ══════════════════════ */}
      <section className="relative min-h-screen gradient-navy flex flex-col items-center justify-center overflow-hidden pt-24 pb-28">

        {/* ambient blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-56 -left-56 w-[820px] h-[820px] rounded-full bg-blue-600/10 blur-[140px]" />
          <div className="absolute -bottom-56 -right-56 w-[720px] h-[720px] rounded-full bg-blue-400/8  blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[500px] rounded-full bg-white/[0.025] blur-[90px]" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '80px 80px' }} />
        </div>

        {/* hero content */}
        <div className="relative z-10 flex flex-col items-center text-center w-full max-w-4xl mx-auto px-6">

          {/* badge */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 glass-dark rounded-full px-5 py-2.5 mb-10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/65 text-sm font-medium tracking-wider">Moderated · Anonymous · Trusted</span>
          </motion.div>

          {/* headline */}
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.1, ease }}
            className="font-black text-white mb-8"
            style={{ fontSize: 'clamp(3rem, 8vw, 5.75rem)', lineHeight: 1.06, letterSpacing: '-0.03em' }}>
            Some Dreams Need<br />
            <span className="text-blue-300">The Right Person.</span>
          </motion.h1>

          {/* subheadline */}
          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            className="text-slate-300/90 text-lg md:text-xl leading-[1.8] max-w-xl mx-auto mb-12">
            WishIT connects anonymous dreamers with verified fulfillers — where every connection is carefully reviewed before it happens.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.3, ease }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14 w-full max-w-sm sm:max-w-none">

            <Link to="/register?mode=dreamer" className="w-full sm:w-auto">
              <button className="group w-full sm:w-auto h-[52px] flex items-center justify-center gap-3 bg-white text-slate-900 font-bold text-[15px] px-8 rounded-full shadow-float hover:bg-blue-50 hover:-translate-y-0.5 transition-all duration-200">
                <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-700 transition-colors">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </span>
                Post Your Dream
              </button>
            </Link>

            <Link to="/register?mode=fulfiller" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto h-[52px] flex items-center justify-center gap-3 text-white font-bold text-[15px] px-8 rounded-full border-2 border-white/40 hover:border-white/70 hover:bg-white/8 transition-all duration-200">
                <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                Become a Fulfiller
              </button>
            </Link>
          </motion.div>

          {/* stats */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.42, ease }}
            className="grid grid-cols-3 gap-4 w-full max-w-lg mx-auto">
            {[['2,400+','Dreams Posted'],['890+','Fulfilled'],['100%','Moderated']].map(([n, l]) => (
              <div key={l} className="flex flex-col items-center justify-center h-[88px] glass-dark rounded-2xl border border-white/[0.07]">
                <span className="text-[1.6rem] font-black text-white leading-none tracking-tight">{n}</span>
                <span className="text-slate-400 text-[11px] font-medium tracking-widest uppercase mt-1.5">{l}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* scroll cue */}
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
          <span className="text-white/20 text-[9px] font-semibold tracking-[0.3em] uppercase">Scroll</span>
          <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </section>

      {/* ══════════════════════
          HOW IT WORKS
      ══════════════════════ */}
      <section id="how-it-works" className="py-28 bg-white">
        <div className={C}>
          <div className="flex flex-col items-center text-center">

            {/* header */}
            <FadeUp className="w-full">
              <SectionHeader
                eyebrow="How It Works"
                heading="Five steps to a fulfilled dream"
                sub="Every dream follows a careful, human-led process — no shortcuts, no anonymous connections without approval."
              />
            </FadeUp>

            {/* timeline */}
            <div className="relative w-full mt-20">
              {/* connecting line — bisects the 56px badges */}
              <div className="hidden lg:block absolute top-7 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />

              <Cascade className="grid grid-cols-1 lg:grid-cols-5 gap-8 w-full justify-items-center">
                {STEPS.map((s) => (
                  <Item key={s.n} className="w-full flex justify-center">
                    <div className="group flex flex-col items-center text-center w-full max-w-[220px] lg:max-w-none">
                      {/* badge on the line */}
                      <div className="relative z-10 mb-8 w-14 h-14 rounded-full bg-white border-2 border-slate-200 shadow-sm flex items-center justify-center group-hover:border-blue-500 group-hover:bg-blue-600 transition-all duration-300 flex-shrink-0">
                        <span className="text-[13px] font-black text-slate-400 group-hover:text-white transition-colors duration-300 tabular-nums">{s.n}</span>
                      </div>
                      <h3 className="text-[15px] font-bold text-slate-900 mb-3 leading-snug">{s.title}</h3>
                      <p className="text-slate-500 text-sm leading-[1.75] text-center">{s.desc}</p>
                    </div>
                  </Item>
                ))}
              </Cascade>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════
          FEATURED DREAMS
      ══════════════════════ */}
      <section className="py-28 bg-slate-50">
        <div className={C}>
          <div className="flex flex-col items-center text-center">

            {/* header */}
            <FadeUp className="w-full">
              <SectionHeader
                eyebrow="Featured Dreams"
                heading="Dreams waiting for the right person"
              />
              <div className="mt-6">
                <Link to="/dreams"
                  className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm hover:text-blue-800 transition-colors group">
                  View all dreams
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </FadeUp>

            {/* cards */}
            <Cascade className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 w-full mt-14">
              {DREAMS.map((d, i) => (
                <Item key={i} className="flex">
                  <div className="group relative flex flex-col w-full bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden hover:shadow-float hover:-translate-y-1.5 transition-all duration-300">
                    {/* hover accent */}
                    <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="flex flex-col flex-1 p-8 pt-9">
                      {/* chips */}
                      <div className="flex items-center justify-between mb-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border ${CAT[d.cat] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          {d.cat}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-full text-slate-400 text-[11px] font-semibold">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Anonymous
                        </span>
                      </div>
                      {/* title */}
                      <h3 className="text-left text-[1.1rem] font-black text-slate-900 leading-snug mb-3 group-hover:text-blue-700 transition-colors duration-200">
                        {d.title}
                      </h3>
                      {/* story */}
                      <p className="text-left text-slate-500 text-sm leading-[1.8] flex-1">
                        {d.story}
                      </p>
                      {/* CTA */}
                      <div className="mt-8 pt-6 border-t border-slate-100">
                        <Link to="/register?mode=fulfiller">
                          <button className="w-full h-11 rounded-xl text-[13.5px] font-bold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-blue transition-all duration-200">
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
        </div>
      </section>

      {/* ══════════════════════
          TRUST & SAFETY
      ══════════════════════ */}
      <section className="py-28 gradient-navy relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-[560px] h-[560px] bg-blue-500/10 rounded-full blur-[130px]" />
          <div className="absolute -bottom-24 -left-24 w-[480px] h-[480px] bg-blue-700/8  rounded-full blur-[110px]" />
        </div>

        <div className={`${C} relative z-10`}>
          <div className="flex flex-col items-center text-center">

            <FadeUp className="w-full">
              <SectionHeader
                light
                eyebrow="Trust & Safety"
                heading="Built on trust, not transactions"
                sub="WishIT is not crowdfunding. No donations, no fundraising. Every connection is earned through a rigorous human-led process."
              />
            </FadeUp>

            <Cascade className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-16">
              {TRUST.map((t) => (
                <Item key={t.title}>
                  <div className="flex flex-col items-start text-left h-full glass-dark rounded-3xl p-8 border border-white/[0.07] hover:border-white/[0.13] hover:bg-white/[0.09] transition-all duration-300">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-400/20 flex items-center justify-center mb-6 text-blue-400 flex-shrink-0">
                      {t.icon}
                    </div>
                    <h3 className="text-[15px] font-bold text-white mb-3 leading-snug">{t.title}</h3>
                    <p className="text-slate-400 text-sm leading-[1.75]">{t.desc}</p>
                  </div>
                </Item>
              ))}
            </Cascade>

          </div>
        </div>
      </section>

      {/* ══════════════════════
          SUCCESS STORIES
      ══════════════════════ */}
      <section id="stories" className="py-28 bg-white">
        <div className={C}>
          <div className="flex flex-col items-center text-center">

            <FadeUp className="w-full">
              <SectionHeader
                eyebrow="Success Stories"
                heading="Real dreams, real connections"
                sub="Thousands of meaningful connections made — every one reviewed, every one real."
              />
            </FadeUp>

            <Cascade className="grid grid-cols-1 md:grid-cols-3 gap-7 w-full mt-16">
              {STORIES.map((s, i) => (
                <Item key={i} className="flex">
                  <div className="flex flex-col w-full bg-white rounded-3xl border border-slate-100 shadow-card p-9">
                    {/* stars */}
                    <div className="flex items-center gap-1 mb-7">
                      {Array.from({ length: 5 }).map((_, k) => (
                        <svg key={k} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>
                    {/* quote */}
                    <p className="text-left text-slate-700 text-[15px] leading-[1.85] flex-1 mb-8">"{s.quote}"</p>
                    {/* attribution */}
                    <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-bold text-slate-900">{s.outcome}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{s.role} on WishIT</div>
                      </div>
                    </div>
                  </div>
                </Item>
              ))}
            </Cascade>

          </div>
        </div>
      </section>

      {/* ══════════════════════
          FINAL CTA
      ══════════════════════ */}
      <section className="py-28 gradient-blue relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-white/[0.04] rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center w-full max-w-2xl mx-auto px-6">
          <FadeUp className="flex flex-col items-center text-center w-full">
            <Eyebrow light>Get Started</Eyebrow>
            <h2 className="font-black text-white leading-[1.1] tracking-tight mt-4 mb-6"
              style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)' }}>
              Ready to make a dream real?
            </h2>
            <p className="text-blue-100/80 text-lg leading-[1.8] text-center max-w-md mx-auto mb-12">
              Whether you carry a dream or have the power to fulfill one — this is where it begins.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm sm:max-w-none">
              <Link to="/register?mode=dreamer" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto h-[52px] px-9 rounded-full bg-white text-slate-900 font-bold text-[15px] shadow-float hover:bg-blue-50 hover:-translate-y-0.5 transition-all duration-200">
                  Post Your Dream
                </button>
              </Link>
              <Link to="/register?mode=fulfiller" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto h-[52px] px-9 rounded-full text-white font-bold text-[15px] border-2 border-white/40 hover:border-white/70 hover:bg-white/8 transition-all duration-200">
                  Grant a Dream
                </button>
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      <Footer />
    </div>
  );
}
