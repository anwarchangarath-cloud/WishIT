import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Navbar from '../components/layout/Navbar';

const STATUS_STEPS = ['draft', 'pending', 'approved', 'published', 'fulfilled'];

function StatusTracker({ status }) {
  const current = STATUS_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-1 mt-3">
      {STATUS_STEPS.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${i <= current ? 'bg-blue-600' : 'bg-gray-200'}`} />
          {i < STATUS_STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < current ? 'bg-blue-600' : 'bg-gray-200'}`} />}
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

export default function Dashboard() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState(profile?.mode || 'dreamer');
  const [dreams, setDreams] = useState(MOCK_DREAMS);
  const [fulfillments, setFulfillments] = useState(MOCK_FULFILLMENTS);
  const [loading, setLoading] = useState(false);

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

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="w-full max-w-6xl mx-auto px-6 lg:px-8">

          {/* Welcome header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pt-6">
            <div>
              <h1 className="text-3xl font-black text-blue-900">Hello, {profile.name?.split(' ')[0]} 👋</h1>
              <p className="text-gray-500 mt-1">Manage your dreams and fulfillments</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Mode toggle */}
              <div className="flex items-center bg-white rounded-xl border border-blue-100 p-1">
                {['dreamer', 'fulfiller'].map((m) => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize ${
                      mode === m ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-blue-700'
                    }`}>
                    {m === 'dreamer' ? '✨' : '🤝'} {m}
                  </button>
                ))}
              </div>
              {mode === 'dreamer' && (
                <Link to="/submit-dream">
                  <Button size="sm">+ New Dream</Button>
                </Link>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Trust Score', value: profile.trust_score || 100, icon: '⭐', suffix: '/100' },
              { label: 'Dreams Posted', value: profile.dream_count || 0, icon: '✨' },
              { label: 'Dreams Fulfilled', value: profile.fulfilled_count || 0, icon: '🤝' },
              { label: 'Verified', value: profile.verified ? 'Yes' : 'No', icon: '🔒' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border border-blue-50 p-5">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-black text-blue-900">{stat.value}{stat.suffix || ''}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Dreamer Mode */}
          {mode === 'dreamer' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-white rounded-2xl border border-blue-50 overflow-hidden">
                <div className="px-6 py-4 border-b border-blue-50 flex items-center justify-between">
                  <h2 className="font-bold text-blue-900">My Dreams</h2>
                  <span className="text-xs text-gray-400">{dreams.length} total</span>
                </div>
                {dreams.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="text-4xl mb-3">✨</div>
                    <p className="text-gray-500 mb-4">You haven't submitted any dreams yet</p>
                    <Link to="/submit-dream"><Button size="sm">Submit Your First Dream</Button></Link>
                  </div>
                ) : (
                  <div className="divide-y divide-blue-50">
                    {dreams.map((dream) => (
                      <div key={dream.id} className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-blue-900">{dream.title}</h3>
                              <Badge label={dream.status} type={dream.status} />
                            </div>
                            <p className="text-xs text-gray-400">{dream.category} · {new Date(dream.created_at).toLocaleDateString()}</p>
                            <StatusTracker status={dream.status} />
                            {dream.moderator_notes && (
                              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-700">
                                <strong>Moderator note:</strong> {dream.moderator_notes}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {dream.support_count}
                          </div>
                        </div>

                        {dream.status === 'published' && (
                          <div className="mt-4">
                            <button
                              onClick={async () => {
                                try {
                                  const data = await api.getDreamFulfillments(dream.id);
                                  alert(`${data.requests?.length || 0} fulfillment request(s) pending review.`);
                                } catch {}
                              }}
                              className="text-xs text-blue-600 font-semibold hover:text-blue-800"
                            >
                              View Fulfillment Requests →
                            </button>
                          </div>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Impact profile */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                <h2 className="font-bold text-lg mb-1">Your Impact Profile</h2>
                <p className="text-blue-100 text-sm mb-4">Skills and interests help us match you with the right dreams</p>
                <div className="grid grid-cols-3 gap-4">
                  {[['Dreams Requested', fulfillments.length], ['Approved', fulfillments.filter(f => f.status === 'approved').length], ['Impact Score', profile.fulfilled_count || 0]].map(([label, val]) => (
                    <div key={label} className="glass rounded-xl p-3 text-center">
                      <div className="text-2xl font-black">{val}</div>
                      <div className="text-blue-200 text-xs mt-1">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* My fulfillment requests */}
              <div className="bg-white rounded-2xl border border-blue-50 overflow-hidden">
                <div className="px-6 py-4 border-b border-blue-50 flex items-center justify-between">
                  <h2 className="font-bold text-blue-900">My Fulfillment Requests</h2>
                  <Link to="/dreams"><Button size="sm" variant="secondary">Discover Dreams</Button></Link>
                </div>
                {fulfillments.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="text-4xl mb-3">🤝</div>
                    <p className="text-gray-500 mb-4">You haven't requested to fulfill any dreams yet</p>
                    <Link to="/dreams"><Button size="sm">Explore Dreams</Button></Link>
                  </div>
                ) : (
                  <div className="divide-y divide-blue-50">
                    {fulfillments.map((req) => (
                      <div key={req.id} className="p-6 flex items-center justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-blue-900">{req.dream_title}</h3>
                          <p className="text-xs text-gray-400 mt-1">{req.dream_category} · {new Date(req.created_at).toLocaleDateString()}</p>
                        </div>
                        <Badge label={req.status} type={req.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
