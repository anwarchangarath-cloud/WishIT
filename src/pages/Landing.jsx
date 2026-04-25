import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import Button from '../components/ui/Button';
import Footer from '../components/layout/Footer';

/* ─── animation helpers ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerGrid({ children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── data ─── */
const STEPS = [
  { num: '01', icon: '✦', title: 'Submit Your Dream', desc: 'Share your dream story. Our moderators review every submission to ensure authenticity and safety.' },
  { num: '02', icon: '⬡', title: 'Anonymous Publishing', desc: 'Approved dreams are published with full privacy. Only the dream is shown — never your identity.' },
  { num: '03', icon: '◎', title: 'Fulfillers Discover', desc: 'People with skills, resources, or passion to help browse dreams and request to fulfill them.' },
  { num: '04', icon: '✓', title: 'Moderated Connection', desc: 'Our team reviews every fulfillment request. Only approved connections are made — safely.' },
];

const DREAMS = [
  { title: 'Start My Own Bakery', category: 'Career', story: "I've always dreamed of sharing my grandmother's recipes with the world. Her baking brought our whole community together.", supports: 47 },
  { title: 'Medical Treatment Abroad', category: 'Health', story: 'My daughter needs specialized treatment only available overseas. We have been on a waitlist for 2 years.', supports: 128 },
  { title: 'Finish My CS Degree', category: 'Education', story: 'I had to drop out due to financial difficulties but dream of completing my computer science education.', supports: 83 },
  { title: 'Build a Community Garden', category: 'Community', story: 'Our neighborhood lacks green spaces. I dream of transforming an unused lot into a thriving garden.', supports: 61 },
  { title: 'Record My First Album', category: 'Creative', story: "Music has been my outlet through the hardest times. I've written 12 original songs and dream of recording them.", supports: 34 },
  { title: 'Learn Coding for My Family', category: 'Technology', story: 'As a single parent, I dream of a tech career to provide a better future for my kids.', supports: 92 },
];

const STORIES = [
  { dream: 'University Scholarship', fulfiller: 'A tech entrepreneur', quote: "Seeing someone's dream of education come true was the most rewarding experience of my life." },
  { dream: 'Small Business Launch', fulfiller: 'A business mentor', quote: 'I had the skills and resources. WishIT connected me to someone who had the dream. Perfect match.' },
  { dream: 'Medical Equipment', fulfiller: 'A medical professional', quote: 'The anonymous system made both parties feel safe. The outcome was life-changing for that family.' },
];

const WHY = [
  { icon: '🛡️', title: 'Privacy First', desc: "Dreams are published anonymously. Dreamers' identities are never revealed to the public." },
  { icon: '⚖️', title: 'Every Request Moderated', desc: 'No dream goes live without review. No fulfiller connects without approval. Zero exceptions.' },
  { icon: '🤝', title: 'Genuine Fulfillment', desc: "This isn't crowdfunding. Fulfillers offer real skills, resources, or time — not just money." },
  { icon: '📊', title: 'Trust Scores', desc: 'Every user builds a trust score over time. Transparency and accountability at every step.' },
  { icon: '🔍', title: 'Smart Matching', desc: 'Our engine connects dreams to the most relevant and qualified fulfillers automatically.' },
  { icon: '🌍', title: 'Global Community', desc: 'Dreams know no borders. Connect with fulfillers from anywhere in the world.' },
];

const CAT_COLORS = {
  Career: 'bg-purple-50 text-purple-700 border-purple-100',
  Health: 'bg-green-50 text-green-700 border-green-100',
  Education: 'bg-blue-50 text-blue-700 border-blue-100',
  Community: 'bg-orange-50 text-orange-700 border-orange-100',
  Creative: 'bg-pink-50 text-pink-700 border-pink-100',
  Technology: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  Family: 'bg-red-50 text-red-700 border-red-100',
  Travel: 'bg-yellow-50 text-yellow-700 border-yellow-100',
};

const CATS = ['Education', 'Health', 'Career', 'Community', 'Creative', 'Technology', 'Family', 'Travel'];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="gradient-hero relative min-h-screen flex flex-col items-center justify-center pt-16 pb-20 overflow-hidden">
        {/* bg blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-300/5 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center">
          {/* badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-10"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/85 text-sm font-medium tracking-wide">Trusted by dreamers & fulfillers worldwide</span>
          </motion.div>

          {/* headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-[1.0] tracking-tight mb-6"
          >
            Post Your Dream.
            <br />
            <span className="text-blue-200">Find Its Fulfiller.</span>
          </motion.h1>

          {/* sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-blue-100/90 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-12"
          >
            A trusted, moderated platform connecting dreamers with people who have the power to make dreams real — safely and anonymously.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link to="/register?mode=dreamer">
              <button className="group flex items-center gap-3 bg-white text-blue-700 font-bold text-base px-8 py-4 rounded-2xl shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:shadow-blue-900/30 hover:-translate-y-1 transition-all duration-200">
                <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </span>
                Submit A Dream
              </button>
            </Link>
            <Link to="/register?mode=fulfiller">
              <button className="flex items-center gap-3 glass text-white font-bold text-base px-8 py-4 rounded-2xl hover:bg-white/20 hover:-translate-y-1 transition-all duration-200 border border-white/25">
                <span className="text-lg">🤝</span>
                Become A Fulfiller
              </button>
            </Link>
          </motion.div>

          {/* stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
            className="grid grid-cols-3 gap-4 max-w-md mx-auto"
          >
            {[['2,400+', 'Dreams Submitted'], ['890+', 'Dreams Fulfilled'], ['99%', 'Trust Rate']].map(([n, l]) => (
              <div key={l} className="glass rounded-2xl py-4 px-3 text-center">
                <div className="text-2xl font-black text-white">{n}</div>
                <div className="text-blue-200 text-xs mt-1 font-medium">{l}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* scroll cue */}
        <motion.div
          animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-white/40 text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-28 bg-white">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <span className="inline-block text-blue-600 font-bold text-sm uppercase tracking-[0.2em] mb-4">How It Works</span>
            <h2 className="text-4xl sm:text-5xl font-black text-blue-900 mb-5">Simple. Safe. Meaningful.</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
              Every dream goes through a careful moderation process to ensure trust, authenticity, and privacy for everyone involved.
            </p>
          </Reveal>

          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <motion.div key={s.num} variants={fadeUp}
                className="relative p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-black text-blue-100 group-hover:text-blue-200 transition-colors">{s.num}</span>
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-lg shadow-lg shadow-blue-600/30">
                    {s.icon}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-blue-900 mb-3 group-hover:text-blue-700 transition-colors">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-12 -right-3 w-6 h-px bg-blue-200 z-10" />
                )}
              </motion.div>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
          <Reveal className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-blue-900 mb-3">Every Dream Has a Category</h2>
            <p className="text-gray-500">Browse dreams by what matters most to you</p>
          </Reveal>
          <StaggerGrid className="flex flex-wrap justify-center gap-3">
            {CATS.map((cat) => (
              <motion.div key={cat} variants={fadeUp}>
                <Link to={`/dreams?category=${cat}`}
                  className={`inline-flex items-center px-5 py-2.5 rounded-full font-semibold text-sm border ${CAT_COLORS[cat] || 'bg-gray-50 text-gray-600 border-gray-100'} hover:scale-105 hover:shadow-md transition-all duration-200`}>
                  {cat}
                </Link>
              </motion.div>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ── FEATURED DREAMS ── */}
      <section className="py-28 bg-white">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
          <Reveal className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-14">
            <div>
              <span className="inline-block text-blue-600 font-bold text-sm uppercase tracking-[0.2em] mb-3">Featured Dreams</span>
              <h2 className="text-4xl sm:text-5xl font-black text-blue-900">Dreams Waiting for You</h2>
            </div>
            <Link to="/dreams" className="flex items-center gap-2 text-blue-600 font-semibold text-sm hover:text-blue-800 transition-colors group">
              View all dreams
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </Reveal>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DREAMS.map((d, i) => (
              <motion.div key={i} variants={fadeUp}
                className="group flex flex-col bg-white rounded-3xl border border-gray-100 p-7 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-50 transition-all duration-300">
                <div className="flex items-center justify-between mb-5">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${CAT_COLORS[d.category] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                    {d.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <svg className="w-4 h-4 text-rose-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-500">{d.supports}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-3 group-hover:text-blue-700 transition-colors leading-snug">{d.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-6 line-clamp-3">{d.story}</p>
                <div className="space-y-3">
                  <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                      style={{ width: `${Math.min(100, Math.round(d.supports / 1.5))}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Anonymous Dreamer</span>
                    <Link to="/register?mode=fulfiller">
                      <button className="flex items-center gap-1.5 text-blue-600 font-bold text-sm hover:text-blue-800 transition-colors">
                        Fulfill
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ── WHY WISHIT ── */}
      <section className="py-28 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-400/10 rounded-full blur-[80px]" />
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <span className="inline-block text-blue-300 font-bold text-sm uppercase tracking-[0.2em] mb-4">Why WishIT</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-5">Built on Trust, Not Transactions</h2>
            <p className="text-blue-200 text-lg max-w-xl mx-auto leading-relaxed">
              No donations, no fundraising — just genuine, moderated connections between dreamers and fulfillers.
            </p>
          </Reveal>
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY.map((w) => (
              <motion.div key={w.title} variants={fadeUp}
                className="glass rounded-3xl p-7 hover:bg-white/15 transition-all duration-300">
                <div className="text-3xl mb-5">{w.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{w.title}</h3>
                <p className="text-blue-200 text-sm leading-relaxed">{w.desc}</p>
              </motion.div>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ── SUCCESS STORIES ── */}
      <section id="stories" className="py-28 bg-white">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <span className="inline-block text-blue-600 font-bold text-sm uppercase tracking-[0.2em] mb-4">Success Stories</span>
            <h2 className="text-4xl sm:text-5xl font-black text-blue-900 mb-5">Dreams That Came True</h2>
          </Reveal>
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STORIES.map((s, i) => (
              <motion.div key={i} variants={fadeUp}
                className="relative flex flex-col p-8 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-white hover:shadow-xl hover:shadow-blue-50 transition-all duration-300">
                <div className="text-5xl text-blue-200 font-serif leading-none mb-5">"</div>
                <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-6 italic">"{s.quote}"</p>
                <div className="pt-5 border-t border-blue-100">
                  <div className="font-bold text-blue-900 text-sm">{s.dream}</div>
                  <div className="text-gray-400 text-xs mt-1">Fulfilled by: {s.fulfiller}</div>
                </div>
              </motion.div>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-28 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-white/5 rounded-full blur-[80px]" />
        </div>
        <div className="relative z-10 w-full max-w-3xl mx-auto px-6 text-center">
          <Reveal>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight">
              Ready to Make a Dream Come True?
            </h2>
            <p className="text-blue-100 text-lg mb-12 leading-relaxed">
              Whether you have a dream or the power to fulfill one — your journey starts here.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register?mode=dreamer">
                <button className="w-full sm:w-auto bg-white text-blue-700 font-bold text-base px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200">
                  Post Your Dream
                </button>
              </Link>
              <Link to="/register?mode=fulfiller">
                <button className="w-full sm:w-auto glass text-white font-bold text-base px-8 py-4 rounded-2xl border border-white/25 hover:bg-white/20 hover:-translate-y-1 transition-all duration-200">
                  Grant A Dream
                </button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
