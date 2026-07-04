import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const ease = [0.22, 1, 0.36, 1];

const CAT_CLASS = {
  Career: 'cat-career', Health: 'cat-health', Education: 'cat-education',
  Community: 'cat-community', Creative: 'cat-creative', Technology: 'cat-technology',
  Family: 'cat-family', Travel: 'cat-travel', Other: 'cat-other',
};

const ACCENT_COLORS = [
  '#3D7BFF', '#2CE5A7', '#A78BFF', '#FFB648', '#EC4899', '#0EA5E9',
];

const MOCK_STORIES = [
  {
    id: '1', dream_title: 'Complete My CS Degree',
    outcome: 'Sarah received a full sponsorship from a tech entrepreneur who saw her dream. She graduated with honors and now works at a leading software company.',
    quote: 'I never thought anyone would see my story. WishIT connected me with exactly the right person at exactly the right moment.',
    dreamer_alias: 'A dreamer from Nigeria', fulfiller_alias: 'A tech entrepreneur from California',
    category: 'Education', fulfilled_at: '2024-08-15',
  },
  {
    id: '2', dream_title: 'Get My Daughter Specialized Medical Care',
    outcome: 'A retired surgeon and a medical charity connected through WishIT to fund and arrange specialist treatment. She\'s now in remission.',
    quote: 'Words cannot describe what this community has done for our family. My daughter has her life back.',
    dreamer_alias: 'A parent from Kenya', fulfiller_alias: 'A retired surgeon and a charity',
    category: 'Health', fulfilled_at: '2024-09-03',
  },
  {
    id: '3', dream_title: 'Open a Free Tutoring Center',
    outcome: 'A local business owner donated space and startup funds, while three volunteer teachers joined. The center now serves over 80 children every week.',
    quote: 'I dreamed this in my living room. Now 80 kids walk through that door every week. I still can\'t believe it\'s real.',
    dreamer_alias: 'A teacher from Brazil', fulfiller_alias: 'A local business owner + volunteers',
    category: 'Education', fulfilled_at: '2024-10-21',
  },
  {
    id: '4', dream_title: 'Start My Own Bakery',
    outcome: 'A food business mentor and an investor connected through WishIT, providing both guidance and seed funding. The bakery opened its doors in March.',
    quote: 'My grandmother\'s recipes are now feeding hundreds of people every day. She would be so proud.',
    dreamer_alias: 'A baker from France', fulfiller_alias: 'A food entrepreneur + angel investor',
    category: 'Career', fulfilled_at: '2024-11-15',
  },
  {
    id: '5', dream_title: 'Build a Neighborhood Garden',
    outcome: 'A landscape architect volunteered their expertise and a local hardware store donated materials. The garden opened in time for spring planting season.',
    quote: 'Children in our neighborhood have never had green space. Now they\'re learning to grow food. This is the future we wanted to give them.',
    dreamer_alias: 'A community leader from Detroit', fulfiller_alias: 'A landscape architect + local business',
    category: 'Community', fulfilled_at: '2025-01-08',
  },
  {
    id: '6', dream_title: 'Record My Original Music',
    outcome: 'A music producer donated studio time and helped the dreamer release their first EP, which has been streamed over 200,000 times.',
    quote: 'These songs carried me through the darkest years. Now they\'re helping others through theirs.',
    dreamer_alias: 'A musician from India', fulfiller_alias: 'An independent music producer',
    category: 'Creative', fulfilled_at: '2025-02-14',
  },
];

function StoryCard({ story, index }) {
  const [expanded, setExpanded] = useState(false);
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const catClass = CAT_CLASS[story.category] || 'cat-other';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease }}
      className="card-white overflow-hidden hover:shadow-float transition-shadow">

      {/* Accent bar */}
      <div className="h-[3px]" style={{ background: accent }} />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1">
            <span className={`badge ${catClass} mb-2 inline-block`}>{story.category}</span>
            <h3 className="font-extrabold leading-snug" style={{ color: 'var(--text)', fontSize: '1.05rem', letterSpacing: '-0.025em' }}>
              {story.dream_title}
            </h3>
          </div>
          <div className="flex-shrink-0 w-10 h-10 rounded-[12px] flex items-center justify-center text-white text-[15px]"
            style={{ background: accent }}>
            ✓
          </div>
        </div>

        {/* Quote */}
        <blockquote className="relative mb-4 pl-4" style={{ borderLeft: `2px solid ${accent}` }}>
          <p className="font-display text-[13.5px] leading-relaxed italic" style={{ color: 'var(--text-2)' }}>
            "{story.quote}"
          </p>
        </blockquote>

        {/* Outcome */}
        <div className={`text-[13px] leading-relaxed overflow-hidden transition-all duration-300 ${expanded ? '' : 'line-clamp-2'}`}
          style={{ color: 'var(--text-3)' }}>
          {story.outcome}
        </div>
        {story.outcome.length > 120 && (
          <button onClick={() => setExpanded(e => !e)}
            className="text-[12.5px] font-bold mt-1.5 transition-colors"
            style={{ color: 'var(--blue)' }}>
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}

        {/* Footer */}
        <div className="mt-5 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--text-4)' }}>
            <span style={{ fontSize: '14px' }}>◉</span>
            {story.dreamer_alias}
          </div>
          <div className="text-[11.5px]" style={{ color: 'var(--text-4)' }}>
            {new Date(story.fulfilled_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-2">
          <span className="badge badge-green" style={{ fontSize: '11px' }}>Fulfilled by</span>
          <span className="text-[12px]" style={{ color: 'var(--text-3)' }}>{story.fulfiller_alias}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function SuccessStories() {
  const [stories, setStories] = useState(MOCK_STORIES);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    setLoading(true);
    api.admin?.getSuccessStories?.()
      .then(d => { if (d?.stories?.length) setStories(d.stories); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cats = ['All', ...new Set(stories.map(s => s.category).filter(Boolean))];
  const filtered = filter === 'All' ? stories : stories.filter(s => s.category === filter);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'var(--bg)' }}>
      <Navbar />

      {/* Hero */}
      <div className="gradient-mesh pt-24 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-40 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 lg:px-8 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}
            className="text-center max-w-2xl mx-auto">
            <div className="eyebrow-light mb-4">Impact Stories</div>
            <h1 className="font-extrabold text-white mb-5"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', letterSpacing: '-0.04em', lineHeight: 1.08 }}>
              Dreams <span className="font-display italic" style={{ fontWeight: 400 }}>Made Real</span>
            </h1>
            <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px', maxWidth: '480px', margin: '0 auto' }}>
              These are the stories of people whose dreams came true — because someone stepped up to make it happen.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ease }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-14 max-w-2xl mx-auto">
            {[
              { n: '600+',  l: 'Dreams Fulfilled' },
              { n: '50+',   l: 'Countries' },
              { n: '94%',   l: 'Satisfaction Rate' },
              { n: '12k+',  l: 'Lives Changed' },
            ].map(s => (
              <div key={s.l} className="text-center glass-dark rounded-[16px] p-4" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="font-extrabold text-white" style={{ fontSize: '1.75rem', letterSpacing: '-0.04em' }}>{s.n}</div>
                <div className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="sticky top-16 z-30" style={{ background: 'rgba(7,12,24,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-3">
          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {cats.map(c => {
              const active = filter === c;
              return (
                <button key={c} onClick={() => setFilter(c)}
                  className="flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-bold transition-all"
                  style={{
                    background: active ? 'var(--blue)' : 'var(--surface)',
                    color: active ? 'white' : 'var(--text-2)',
                    border: `1.5px solid ${active ? 'var(--blue)' : 'var(--border)'}`,
                    boxShadow: active ? '0 2px 8px rgba(61,123,255,0.2)' : 'none',
                  }}>
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stories grid */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-[20px] p-6 animate-pulse" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="h-1 rounded mb-5" style={{ background: 'var(--border)' }} />
                <div className="h-3.5 rounded-full w-20 mb-3" style={{ background: 'var(--border)' }} />
                <div className="h-5 rounded-full w-3/4 mb-2" style={{ background: 'var(--border)' }} />
                <div className="h-3.5 rounded-full w-full mb-1" style={{ background: 'var(--border)' }} />
                <div className="h-3.5 rounded-full w-5/6" style={{ background: 'var(--border)' }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-4xl mb-3">✦</div>
            <p className="font-bold" style={{ color: 'var(--text-3)' }}>No stories in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((story, i) => <StoryCard key={story.id} story={story} index={i} />)}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="py-20" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-extrabold mb-4" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', color: 'var(--text)', letterSpacing: '-0.035em' }}>
            Could Your Dream Be Next?
          </h2>
          <p className="text-[15px] mb-8" style={{ color: 'var(--text-3)' }}>
            Join thousands of dreamers who've shared their story and found someone ready to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/dreams" className="btn-primary-lg" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              Browse Dreams
            </Link>
            <Link to="/submit-dream" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', padding: '12px 24px' }}>
              Share Your Dream
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
