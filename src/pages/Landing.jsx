import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import Button from '../components/ui/Button';
import Footer from '../components/layout/Footer';

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { show: { transition: { staggerChildren: 0.12 } } };

function Section({ children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'} className={className}>
      {children}
    </motion.div>
  );
}

const DREAMS = [
  { title: 'Start My Own Bakery', category: 'Career', story: 'I\'ve always dreamed of sharing my grandmother\'s recipes with the world...', supports: 47 },
  { title: 'Medical Treatment Abroad', category: 'Health', story: 'My daughter needs specialized treatment only available overseas...', supports: 128 },
  { title: 'Finish My Computer Science Degree', category: 'Education', story: 'I had to drop out due to financial difficulties but dream of completing...', supports: 83 },
  { title: 'Build a Community Garden', category: 'Community', story: 'Our neighborhood lacks green spaces. I dream of creating a garden...', supports: 61 },
  { title: 'Record My First Album', category: 'Creative', story: 'Music is my soul. I\'ve written 12 songs and dream of recording them...', supports: 34 },
  { title: 'Learn Coding to Support My Family', category: 'Technology', story: 'As a single parent, I dream of a tech career to give my kids a better life...', supports: 92 },
];

const STORIES = [
  { dream: 'University Scholarship', fulfiller: 'A tech entrepreneur', quote: 'Seeing someone\'s dream of education come true was the most rewarding experience of my life.' },
  { dream: 'Small Business Launch', fulfiller: 'A business mentor', quote: 'I had the skills and resources. WishIT connected me to someone who had the dream. Perfect match.' },
  { dream: 'Medical Equipment', fulfiller: 'A medical professional', quote: 'The anonymous system made both parties feel safe. The outcome was life-changing.' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Submit Your Dream', desc: 'Share your dream story. Our moderators review every submission to ensure authenticity and safety.', icon: '✨' },
  { step: '02', title: 'Anonymous Publishing', desc: 'Approved dreams are published anonymously. Your privacy is completely protected — only the dream is shown.', icon: '🔒' },
  { step: '03', title: 'Fulfillers Discover', desc: 'People with the skills, resources, or passion to help browse dreams and request to fulfill them.', icon: '🔍' },
  { step: '04', title: 'Moderated Connection', desc: 'Our team reviews every fulfillment request. Only approved connections are made — safely and securely.', icon: '✅' },
];

const CATEGORIES = ['Education', 'Health', 'Career', 'Community', 'Creative', 'Technology', 'Family', 'Travel'];
const CATEGORY_COLORS = {
  Education: 'bg-blue-100 text-blue-700', Health: 'bg-green-100 text-green-700',
  Career: 'bg-purple-100 text-purple-700', Community: 'bg-orange-100 text-orange-700',
  Creative: 'bg-pink-100 text-pink-700', Technology: 'bg-cyan-100 text-cyan-700',
  Family: 'bg-red-100 text-red-700', Travel: 'bg-yellow-100 text-yellow-700',
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="gradient-hero min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 pt-16">
        {/* Background orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/90 text-sm font-medium">Trusted by dreamers & fulfillers worldwide</span>
          </motion.div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-4">
            Post Your Dream.
            <br />
            <span className="text-blue-200">Find Its Fulfiller.</span>
          </h1>

          <p className="text-blue-100 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Where Dreams Meet Their Fulfillers — a trusted, moderated platform that connects dreamers with people who have the power to make dreams real.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/register?mode=dreamer">
              <Button variant="white" size="xl" className="w-full sm:w-auto">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                </svg>
                Submit A Dream
              </Button>
            </Link>
            <Link to="/register?mode=fulfiller">
              <Button variant="outline" size="xl" className="w-full sm:w-auto border-white/40 text-white hover:bg-white hover:text-blue-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Become A Fulfiller
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[['2,400+', 'Dreams Submitted'], ['890+', 'Dreams Fulfilled'], ['99%', 'Trust Rate']].map(([num, label]) => (
              <div key={label} className="glass rounded-2xl p-4">
                <div className="text-2xl font-black text-white">{num}</div>
                <div className="text-blue-200 text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1.5">
            <div className="w-1 h-2 bg-white/60 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">How It Works</span>
              <h2 className="text-4xl font-black text-blue-900 mt-3 mb-4">Simple. Safe. Meaningful.</h2>
              <p className="text-gray-500 max-w-xl mx-auto">Every dream goes through a careful moderation process to ensure trust, authenticity, and privacy for everyone involved.</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {HOW_IT_WORKS.map((item) => (
                <motion.div key={item.step} variants={fadeUp}
                  className="relative p-6 rounded-2xl border border-blue-50 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300 group">
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <div className="text-xs font-bold text-blue-400 mb-2">{item.step}</div>
                  <h3 className="text-lg font-bold text-blue-900 mb-2 group-hover:text-blue-700 transition-colors">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-blue-50/50 px-4">
        <div className="max-w-7xl mx-auto">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-10">
              <h2 className="text-3xl font-black text-blue-900 mb-3">Every Dream Has a Category</h2>
              <p className="text-gray-500">Browse dreams by what matters most to you</p>
            </motion.div>
            <motion.div variants={stagger} className="flex flex-wrap justify-center gap-3">
              {CATEGORIES.map((cat) => (
                <motion.div key={cat} variants={fadeUp}>
                  <Link to={`/dreams?category=${cat}`}
                    className={`px-5 py-2.5 rounded-full font-semibold text-sm ${CATEGORY_COLORS[cat]} hover:scale-105 transition-all duration-200 cursor-pointer inline-block`}>
                    {cat}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* Featured Dreams */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <Section>
            <motion.div variants={fadeUp} className="flex items-end justify-between mb-12">
              <div>
                <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Featured Dreams</span>
                <h2 className="text-4xl font-black text-blue-900 mt-2">Dreams Waiting for You</h2>
              </div>
              <Link to="/dreams" className="text-blue-600 font-semibold text-sm hover:text-blue-800 transition-colors hidden sm:block">
                View all dreams →
              </Link>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DREAMS.map((dream, i) => (
                <motion.div key={i} variants={fadeUp}
                  className="card-hover bg-white rounded-2xl border border-blue-50 p-6 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${CATEGORY_COLORS[dream.category]}`}>{dream.category}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                      {dream.supports}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-blue-900 mb-2">{dream.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-4 line-clamp-3">{dream.story}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-blue-50 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{ width: `${Math.min(100, dream.supports)}%` }} />
                    </div>
                    <Link to="/dreams">
                      <Button size="sm" variant="secondary">Fulfill →</Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* Why WishIT */}
      <section className="py-24 bg-gradient-to-br from-blue-900 to-blue-800 px-4">
        <div className="max-w-7xl mx-auto">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="text-blue-300 font-semibold text-sm uppercase tracking-widest">Why WishIT</span>
              <h2 className="text-4xl font-black text-white mt-3 mb-4">Built on Trust, Not Transactions</h2>
              <p className="text-blue-200 max-w-xl mx-auto">We built WishIT differently. No donations, no fundraising — just genuine connections between dreamers and fulfillers, moderated with care.</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: '🛡️', title: 'Privacy First', desc: 'Dreams are published anonymously. Dreamers\' identities are never revealed to the public.' },
                { icon: '⚖️', title: 'Every Request Moderated', desc: 'No dream goes live without review. No fulfiller connects without approval. Zero exceptions.' },
                { icon: '🤝', title: 'Genuine Fulfillment', desc: 'This isn\'t crowdfunding. Fulfillers offer real skills, resources, or time — not just money.' },
                { icon: '📊', title: 'Trust Scores', desc: 'Every user builds a trust score over time. Transparency and accountability at every step.' },
                { icon: '🔍', title: 'AI-Powered Matching', desc: 'Our smart matching engine connects dreams to the most relevant and qualified fulfillers.' },
                { icon: '🌍', title: 'Global Community', desc: 'Dreams know no borders. Connect with fulfillers from anywhere in the world.' },
              ].map((item) => (
                <motion.div key={item.title} variants={fadeUp}
                  className="glass rounded-2xl p-6 text-white">
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-blue-200 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* Success Stories */}
      <section id="stories" className="py-24 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Success Stories</span>
              <h2 className="text-4xl font-black text-blue-900 mt-3 mb-4">Dreams That Came True</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STORIES.map((s, i) => (
                <motion.div key={i} variants={fadeUp}
                  className="relative p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100">
                  <div className="text-4xl text-blue-200 font-serif mb-4">"</div>
                  <p className="text-gray-600 italic text-sm leading-relaxed mb-6">"{s.quote}"</p>
                  <div className="border-t border-blue-100 pt-4">
                    <div className="font-bold text-blue-900 text-sm">{s.dream}</div>
                    <div className="text-gray-500 text-xs mt-1">Fulfilled by: {s.fulfiller}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 gradient-hero px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Section>
            <motion.h2 variants={fadeUp} className="text-4xl font-black text-white mb-4">
              Ready to Make a Dream Come True?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-blue-100 text-lg mb-10">
              Whether you have a dream or the power to fulfill one — your journey starts here.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register?mode=dreamer">
                <Button variant="white" size="xl">Post Your Dream</Button>
              </Link>
              <Link to="/register?mode=fulfiller">
                <Button variant="outline" size="xl" className="border-white/40 text-white hover:bg-white hover:text-blue-700">
                  Grant A Dream
                </Button>
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>

      <Footer />
    </div>
  );
}
