import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const CAT_STYLE = {
  Career: 'bg-violet-50 text-violet-700 border-violet-100',
  Health: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Education: 'bg-blue-50 text-blue-700 border-blue-100',
  Community: 'bg-orange-50 text-orange-700 border-orange-100',
  Creative: 'bg-pink-50 text-pink-700 border-pink-100',
  Technology: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  Family: 'bg-red-50 text-red-700 border-red-100',
  Travel: 'bg-amber-50 text-amber-700 border-amber-100',
  Other: 'bg-slate-50 text-slate-600 border-slate-100',
};

function TrustRing({ score }) {
  const pct = Math.min(100, score) / 100;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#f1f5f9" strokeWidth="5" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="text-center">
        <span className="text-lg font-black" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}

function FulfilledDreamCard({ dream }) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border mb-2 ${CAT_STYLE[dream.category] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
        {dream.category}
      </span>
      <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-2">{dream.title}</h4>
      <p className="text-slate-400 text-xs">
        {new Date(dream.updated_at || dream.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
      </p>
    </div>
  );
}

export default function FulfillerProfile() {
  const { uid } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!uid) return;
    api.getPublicProfile(uid)
      .then(data => setProfile(data.user || data))
      .catch(e => setError(e.message || 'Profile not found'))
      .finally(() => setLoading(false));
  }, [uid]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-32 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  if (error || !profile) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-32 text-center px-6">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </div>
        <h2 className="font-bold text-slate-900 text-xl mb-2">Profile Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">{error || 'This fulfiller profile does not exist or is not public.'}</p>
        <Link to="/dreams" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
          Browse Dreams
        </Link>
      </div>
    </div>
  );

  const causes = profile.causes ? profile.causes.split(',').map(c => c.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <div className="gradient-navy pt-24 pb-32">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
              <span className="text-3xl font-black text-white">
                {profile.display_name?.[0]?.toUpperCase() || '?'}
              </span>
            </div>

            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start mb-2">
                <h1 className="text-2xl lg:text-3xl font-black text-white">{profile.display_name || 'Anonymous Fulfiller'}</h1>
                {profile.verified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/30 border border-blue-400/50 rounded-full text-xs font-bold text-blue-200">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    Verified
                  </span>
                )}
                {profile.mode === 'fulfiller' || profile.mode === 'both' ? (
                  <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-bold text-emerald-300">Fulfiller</span>
                ) : null}
              </div>
              {profile.country && (
                <p className="text-slate-400 text-sm mb-2 flex items-center gap-1 justify-center sm:justify-start">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  </svg>
                  {profile.country}
                </p>
              )}
              {profile.fulfiller_bio && (
                <p className="text-slate-300 text-sm leading-relaxed max-w-xl">{profile.fulfiller_bio}</p>
              )}
            </div>

            {/* Trust Score */}
            <div className="flex-shrink-0 bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
              <TrustRing score={profile.trust_score || 100} />
              <p className="text-slate-400 text-xs mt-2">Trust Score</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8 -mt-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left sidebar */}
          <div className="space-y-4">
            {/* Stats card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-bold text-slate-900 mb-4">Impact</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <p className="text-2xl font-black text-slate-900">{profile.fulfilled_count || 0}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Dreams Fulfilled</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <p className="text-2xl font-black text-slate-900">{profile.impact_score || 0}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Impact Score</p>
                </div>
              </div>
            </motion.div>

            {/* Causes */}
            {causes.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-bold text-slate-900 mb-3">Causes They Support</h3>
                <div className="flex flex-wrap gap-2">
                  {causes.map(c => (
                    <span key={c} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${CAT_STYLE[c] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>{c}</span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Website */}
            {profile.website && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-bold text-slate-900 mb-3">Links</h3>
                <a href={profile.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                  Personal Website
                </a>
              </motion.div>
            )}

            {/* Member since */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                Member since {new Date(profile.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </motion.div>
          </div>

          {/* Right: fulfilled dreams */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 text-lg mb-5">Dreams Fulfilled</h3>

              {!profile.fulfilled_dreams || profile.fulfilled_dreams.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
                    </svg>
                  </div>
                  <p className="font-bold text-slate-900 text-sm mb-1">No fulfilled dreams yet</p>
                  <p className="text-slate-400 text-xs">This fulfiller hasn't completed any dreams publicly</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profile.fulfilled_dreams.map(d => <FulfilledDreamCard key={d.id} dream={d} />)}
                </div>
              )}
            </motion.div>

            {/* CTA for logged-in users */}
            {user && user.uid !== uid && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="mt-4 bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-slate-900 text-sm">Have a dream this person could fulfill?</p>
                  <p className="text-slate-500 text-xs mt-0.5">Browse dreams they're interested in supporting</p>
                </div>
                <Link to="/dreams" className="flex-shrink-0 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors">
                  Browse Dreams
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
