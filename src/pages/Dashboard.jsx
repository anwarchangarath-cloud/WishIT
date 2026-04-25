import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import Badge from '../components/ui/Badge';
import Navbar from '../components/layout/Navbar';

const STATUS_STEPS = ['draft', 'pending', 'approved', 'published', 'fulfilled'];

function StatusTracker({ status }) {
  const current = STATUS_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-1 mt-3">
      {STATUS_STEPS.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${i <= current ? 'bg-blue-500' : 'bg-slate-200'}`} />
          {i < STATUS_STEPS.length - 1 && (
            <div className={`flex-1 h-px transition-colors ${i < current ? 'bg-blue-500' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

const MOCK_DREAMS = [
  { id: '1', title: 'Start My Own Bakery', category: 'Career', status: 'published', support_count: 47, created_at: new Date().toISOString(), moderator_notes: null },
  { id: '2', title: 'Learn Advanced Photography', category: 'Creative', status: 'pending', support_count: 0, created_at: new Date().toISOString(), moderator_notes: null },
];

const MOCK_FULFILLMENTS = [
  { id: '1', dream_title: 'Community Garden Project', dream_category: 'Community', status: 'approved', created_at: new Date().toISOString() },
  { id: '2', dream_title: 'Music Production Dream', dream_category: 'Creative', status: 'pending', created_at: new Date().toISOString() },
];

function StatCard({ label, value, suffix = '', icon, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-card">
      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${colors[color]}`}>
        {icon}
      </div>
      <div className="text-2xl font-black text-slate-900">{value}{suffix}</div>
      <div className="text-xs text-slate-500 mt-1 font-medium">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState(profile?.mode || 'dreamer');
  const [dreams, setDreams] = useState(MOCK_DREAMS);
  const [fulfillments, setFulfillments] = useState(MOCK_FULFILLMENTS);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!profile) return;
    setMode(profile.mode);
    loadData();
  }, [profile]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dreamData, fulfillData] = await Promise.allSettled([
        api.getMyDreams(),
        api.getMyFulfillments(),
      ]);
      if (dreamData.status === 'fulfilled' && dreamData.value.dreams?.length > 0)
        setDreams(dreamData.value.dreams);
      if (fulfillData.status === 'fulfilled' && fulfillData.value.requests?.length > 0)
        setFulfillments(fulfillData.value.requests);
    } catch {}
    setLoading(false);
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  if (!profile) return null;

  const firstName = profile.name?.split(' ')[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Header */}
      <div className="gradient-navy pt-20">
        <div className="w-full max-w-6xl mx-auto px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-blue">
                  {firstName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white">Hello, {firstName}</h1>
                  <p className="text-slate-400 text-sm capitalize">{profile.role} · {profile.mode}</p>
                </div>
              </div>
            </div>

            {/* Mode toggle + action */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white/10 rounded-xl border border-white/10 p-1">
                {['dreamer', 'fulfiller'].map((m) => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                      mode === m ? 'bg-white text-slate-900 shadow' : 'text-white/70 hover:text-white'
                    }`}>
                    {m}
                  </button>
                ))}
              </div>
              {mode === 'dreamer' && (
                <Link to="/submit-dream"
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm shadow-blue">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                  </svg>
                  New Dream
                </Link>
              )}
              {mode === 'fulfiller' && (
                <Link to="/dreams"
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm shadow-blue">
                  Explore Dreams
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto px-6 lg:px-8 pb-16">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-6 mb-8">
          <StatCard label="Trust Score" value={profile.trust_score || 100} suffix="/100" color="blue"
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>}
          />
          <StatCard label="Dreams Posted" value={profile.dream_count || dreams.length} color="violet"
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>}
          />
          <StatCard label="Fulfilled" value={profile.fulfilled_count || 0} color="emerald"
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>}
          />
          <StatCard label="Verified" value={profile.verified ? 'Yes' : 'No'} color="amber"
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"/></svg>}
          />
        </div>

        <AnimatePresence mode="wait">
          {/* Dreamer Mode */}
          {mode === 'dreamer' && (
            <motion.div key="dreamer"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-slate-900">My Dreams</h2>
                    <p className="text-slate-400 text-xs mt-0.5">{dreams.length} dream{dreams.length !== 1 ? 's' : ''} submitted</p>
                  </div>
                  <Link to="/submit-dream"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                    </svg>
                    Add new
                  </Link>
                </div>

                {dreams.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
                      </svg>
                    </div>
                    <p className="text-slate-500 mb-1 font-medium">No dreams yet</p>
                    <p className="text-slate-400 text-sm mb-6">Submit your first dream and let the right person find you</p>
                    <Link to="/submit-dream"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm shadow-blue">
                      Submit Your First Dream
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {dreams.map((dream) => (
                      <div key={dream.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="font-bold text-slate-900 truncate">{dream.title}</h3>
                              <Badge label={dream.status} type={dream.status} />
                            </div>
                            <p className="text-xs text-slate-400 mb-2">
                              {dream.category} · {new Date(dream.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <StatusTracker status={dream.status} />
                            <div className="flex items-center gap-2 mt-2">
                              {STATUS_STEPS.map((s, i) => (
                                <span key={s} className={`text-xs capitalize ${STATUS_STEPS.indexOf(dream.status) === i ? 'text-blue-600 font-semibold' : 'text-slate-300'}`}>
                                  {i < STATUS_STEPS.length - 1 && i === STATUS_STEPS.indexOf(dream.status) ? s : ''}
                                </span>
                              ))}
                            </div>
                            {dream.moderator_notes && (
                              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                                <strong>Moderator note:</strong> {dream.moderator_notes}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-shrink-0">
                            <svg className="w-3.5 h-3.5 text-rose-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"/>
                            </svg>
                            {dream.support_count}
                          </div>
                        </div>

                        {dream.status === 'published' && (
                          <button
                            onClick={async () => {
                              try {
                                const data = await api.getDreamFulfillments(dream.id);
                                showToast(`${data.requests?.length || 0} fulfillment request(s) for this dream.`);
                              } catch {}
                            }}
                            className="mt-4 text-xs text-blue-600 font-semibold hover:text-blue-700 transition-colors flex items-center gap-1">
                            View Fulfillment Requests
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Fulfiller Mode */}
          {mode === 'fulfiller' && (
            <motion.div key="fulfiller"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="space-y-6">

              {/* Impact card */}
              <div className="gradient-blue rounded-2xl p-6 text-white shadow-blue">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-bold text-lg">Your Impact</h2>
                    <p className="text-blue-100 text-sm">Making dreams real, one at a time</p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
                    </svg>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ['Total Requests', fulfillments.length],
                    ['Approved', fulfillments.filter(f => f.status === 'approved').length],
                    ['Impact Score', profile.fulfilled_count || 0],
                  ].map(([label, val]) => (
                    <div key={label} className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
                      <div className="text-2xl font-black">{val}</div>
                      <div className="text-blue-200 text-xs mt-1">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fulfillment requests */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-slate-900">My Fulfillment Requests</h2>
                    <p className="text-slate-400 text-xs mt-0.5">{fulfillments.length} request{fulfillments.length !== 1 ? 's' : ''}</p>
                  </div>
                  <Link to="/dreams"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                    Discover more
                  </Link>
                </div>

                {fulfillments.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
                      </svg>
                    </div>
                    <p className="text-slate-500 mb-1 font-medium">No requests yet</p>
                    <p className="text-slate-400 text-sm mb-6">Browse dreams and find one you can help fulfill</p>
                    <Link to="/dreams"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm shadow-blue">
                      Explore Dreams
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {fulfillments.map((req) => (
                      <div key={req.id} className="p-6 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 truncate">{req.dream_title}</h3>
                          <p className="text-xs text-slate-400 mt-1">
                            {req.dream_category} · {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <Badge label={req.status} type={req.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-float text-sm font-medium z-50 whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
