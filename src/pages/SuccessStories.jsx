import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const CAT_STYLE = {
  Career: 'bg-violet-50 text-violet-700',
  Health: 'bg-emerald-50 text-emerald-700',
  Education: 'bg-blue-50 text-blue-700',
  Community: 'bg-orange-50 text-orange-700',
  Creative: 'bg-pink-50 text-pink-700',
  Technology: 'bg-cyan-50 text-cyan-700',
  Family: 'bg-red-50 text-red-700',
  Travel: 'bg-amber-50 text-amber-700',
  Other: 'bg-slate-50 text-slate-600',
};

const MOCK_STORIES = [
  {
    id: '1',
    dream_title: 'Complete My CS Degree',
    outcome: 'Sarah received a full sponsorship from a tech entrepreneur who saw her dream. She graduated with honors and now works at a leading software company.',
    quote: 'I never thought anyone would see my story. WishIT connected me with exactly the right person at exactly the right moment.',
    dreamer_alias: 'A dreamer from Nigeria',
    fulfiller_alias: 'A tech entrepreneur from California',
    category: 'Education',
    fulfilled_at: '2024-08-15',
  },
  {
    id: '2',
    dream_title: 'Get My Daughter Specialized Medical Care',
    outcome: 'A retired surgeon and a medical charity connected through WishIT to fund and arrange specialist treatment for this family\'s daughter. She\'s now in remission.',
    quote: 'Words cannot describe what this community has done for our family. My daughter has her life back.',
    dreamer_alias: 'A parent from Kenya',
    fulfiller_alias: 'A retired surgeon and a charity',
    category: 'Health',
    fulfilled_at: '2024-09-03',
  },
  {
    id: '3',
    dream_title: 'Open a Free Tutoring Center',
    outcome: 'A local business owner donated space and startup funds, while three volunteer teachers joined. The center now serves over 80 children every week.',
    quote: 'I dreamed this in my living room. Now 80 kids walk through that door every week. I still can\'t believe it\'s real.',
    dreamer_alias: 'A teacher from Brazil',
    fulfiller_alias: 'A local business owner + volunteers',
    category: 'Education',
    fulfilled_at: '2024-10-21',
  },
  {
    id: '4',
    dream_title: 'Start My Own Bakery',
    outcome: 'A food business mentor and an investor connected through WishIT, providing both guidance and seed funding. The bakery opened its doors in March.',
    quote: 'My grandmother\'s recipes are now feeding hundreds of people every day. She would be so proud.',
    dreamer_alias: 'A baker from France',
    fulfiller_alias: 'A food entrepreneur + angel investor',
    category: 'Career',
    fulfilled_at: '2024-11-15',
  },
  {
    id: '5',
    dream_title: 'Build a Neighborhood Garden',
    outcome: 'A landscape architect volunteered their expertise and a local hardware store donated materials. The garden opened in time for spring planting season.',
    quote: 'Children in our neighborhood have never had green space. Now they\'re learning to grow food. This is the future we wanted to give them.',
    dreamer_alias: 'A community leader from Detroit',
    fulfiller_alias: 'A landscape architect + local business',
    category: 'Community',
    fulfilled_at: '2025-01-08',
  },
  {
    id: '6',
    dream_title: 'Record My Original Music',
    outcome: 'A music producer donated studio time and helped the dreamer release their first EP, which has been streamed over 200,000 times.',
    quote: 'These songs carried me through the darkest years. Now they\'re helping others through theirs.',
    dreamer_alias: 'A musician from India',
    fulfiller_alias: 'An independent music producer',
    category: 'Creative',
    fulfilled_at: '2025-02-14',
  },
];

function StoryCard({ story, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">

      {/* Color accent bar */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600" />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1">
            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold mb-2 ${CAT_STYLE[story.category] || 'bg-slate-50 text-slate-600'}`}>
              {story.category}
            </span>
            <h3 className="font-bold text-slate-900 text-lg leading-snug">{story.dream_title}</h3>
          </div>
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
            </svg>
          </div>
        </div>

        {/* Quote */}
        <blockquote className="relative mb-4">
          <div className="absolute -top-1 -left-1 text-5xl text-blue-100 font-serif leading-none select-none">"</div>
          <p className="text-slate-600 text-sm leading-relaxed pl-5 italic">{story.quote}</p>
        </blockquote>

        {/* Outcome (expandable) */}
        <div className={`text-slate-500 text-sm leading-relaxed overflow-hidden transition-all duration-300 ${expanded ? '' : 'line-clamp-2'}`}>
          {story.outcome}
        </div>
        {story.outcome.length > 120 && (
          <button onClick={() => setExpanded(e => !e)} className="text-blue-600 text-xs font-semibold mt-1.5 hover:text-blue-700 transition-colors">
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              {story.dreamer_alias}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            {new Date(story.fulfilled_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </div>
        </div>

        {/* Fulfiller credit */}
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-semibold">Fulfilled by</span>
          <span>{story.fulfiller_alias}</span>
        </div>
      </div>
    </motion.div>
  );
}

function StatBadge({ number, label }) {
  return (
    <div className="text-center">
      <div className="text-3xl lg:text-4xl font-black text-white mb-1">{number}</div>
      <div className="text-blue-300 text-sm font-medium">{label}</div>
    </div>
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
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <div className="gradient-navy pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 text-blue-400 text-sm font-semibold mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              Impact Stories
            </span>
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-5">Dreams Made Real</h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              These are the stories of people whose dreams came true — because someone stepped up to make it happen.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-14 max-w-2xl mx-auto">
            <StatBadge number="600+" label="Dreams Fulfilled" />
            <StatBadge number="50+" label="Countries" />
            <StatBadge number="94%" label="Satisfaction Rate" />
            <StatBadge number="12k+" label="Lives Changed" />
          </motion.div>
        </div>
      </div>

      {/* Category filter */}
      <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {cats.map(c => (
              <button key={c} onClick={() => setFilter(c)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${filter === c ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stories grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded-full w-20 mb-3" />
                <div className="h-5 bg-slate-200 rounded-full w-3/4 mb-2" />
                <div className="h-4 bg-slate-200 rounded-full w-full mb-1" />
                <div className="h-4 bg-slate-200 rounded-full w-5/6" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((story, i) => <StoryCard key={story.id} story={story} index={i} />)}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="text-slate-500">No stories in this category yet.</p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-white border-t border-slate-100 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-4">Could Your Dream Be Next?</h2>
          <p className="text-slate-500 text-lg mb-8">Join thousands of dreamers who've shared their story and found someone ready to help.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/dreams" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
              Browse Dreams
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </a>
            <a href="/submit-dream" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">
              Share Your Dream
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
