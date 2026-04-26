import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const ease = [0.22, 1, 0.36, 1];

const CAT_CLASS = {
  Career: 'cat-career', Health: 'cat-health', Education: 'cat-education',
  Community: 'cat-community', Creative: 'cat-creative', Technology: 'cat-technology',
  Family: 'cat-family', Travel: 'cat-travel', Other: 'cat-other',
};

function TrustRing({ score }) {
  const pct = Math.min(100, score) / 100;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#2563EB' : score >= 40 ? '#F59E0B' : '#EF4444';

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="text-center">
        <span className="font-extrabold text-lg" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}

function FulfilledDreamCard({ dream }) {
  const catClass = CAT_CLASS[dream.category] || 'cat-other';
  return (
    <div className="card-white p-4 hover:shadow-float transition-shadow">
      <span className={`badge ${catClass} mb-2 inline-block`}>{dream.category}</span>
      <h4 className="font-bold text-[13.5px] leading-tight mb-1 line-clamp-2" style={{ color: 'var(--text)' }}>
        {dream.title}
      </h4>
      <p className="text-[12px]" style={{ color: 'var(--text-4)' }}>
        {new Date(dream.updated_at || dream.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
      </p>
    </div>
  );
}

export default function FulfillerProfile() {
  const { uid } = useParams();
  const { user } = useAuth();
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
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <div className="pt-32 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid var(--border)', borderTop: '2px solid var(--blue)' }} />
      </div>
    </div>
  );

  if (error || !profile) return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <div className="pt-32 text-center px-6">
        <div className="text-5xl mb-4">◉</div>
        <h2 className="font-extrabold mb-2" style={{ color: 'var(--text)', fontSize: '1.3rem', letterSpacing: '-0.025em' }}>
          Profile Not Found
        </h2>
        <p className="text-[14px] mb-6" style={{ color: 'var(--text-3)' }}>
          {error || 'This fulfiller profile does not exist or is not public.'}
        </p>
        <Link to="/dreams" className="btn-primary">Browse Dreams</Link>
      </div>
    </div>
  );

  const causes = profile.causes
    ? (typeof profile.causes === 'string' ? profile.causes.split(',').map(c => c.trim()).filter(Boolean) : profile.causes)
    : [];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      {/* Hero */}
      <div className="gradient-mesh pt-24 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 lg:px-8 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}
            className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

            {/* Avatar */}
            <div className="flex-shrink-0 w-24 h-24 rounded-[20px] flex items-center justify-center shadow-float"
              style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}>
              <span className="text-3xl font-extrabold text-white">
                {profile.display_name?.[0]?.toUpperCase() || '?'}
              </span>
            </div>

            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start mb-2">
                <h1 className="font-extrabold text-white" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', letterSpacing: '-0.03em' }}>
                  {profile.display_name || 'Anonymous Fulfiller'}
                </h1>
                {profile.verified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] font-bold"
                    style={{ background: 'rgba(37,99,235,0.25)', border: '1px solid rgba(147,197,253,0.3)', color: '#BFDBFE' }}>
                    ✓ Verified
                  </span>
                )}
                {(profile.mode === 'fulfiller' || profile.mode === 'both') && (
                  <span className="px-2.5 py-1 rounded-full text-[11.5px] font-bold"
                    style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(52,211,153,0.3)', color: '#6EE7B7' }}>
                    Fulfiller
                  </span>
                )}
              </div>
              {profile.country && (
                <p className="text-[13px] mb-2 flex items-center gap-1 justify-center sm:justify-start"
                  style={{ color: 'rgba(255,255,255,0.45)' }}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  </svg>
                  {profile.country}
                </p>
              )}
              {profile.fulfiller_bio && (
                <p className="text-[13.5px] leading-relaxed max-w-xl" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {profile.fulfiller_bio}
                </p>
              )}
            </div>

            {/* Trust score */}
            <div className="flex-shrink-0 rounded-[18px] p-4 text-center"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
              <TrustRing score={profile.trust_score || 100} />
              <p className="text-[11.5px] mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Trust Score</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8 -mt-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left sidebar */}
          <div className="space-y-4">
            {/* Impact */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ease }}
              className="card-white p-5">
              <h3 className="font-extrabold mb-4 text-[14.5px]" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>Impact</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-[12px]" style={{ background: 'var(--bg)' }}>
                  <p className="font-extrabold" style={{ fontSize: '1.75rem', color: 'var(--blue)', letterSpacing: '-0.04em' }}>
                    {profile.fulfilled_count || 0}
                  </p>
                  <p className="text-[11.5px]" style={{ color: 'var(--text-4)' }}>Fulfilled</p>
                </div>
                <div className="text-center p-3 rounded-[12px]" style={{ background: 'var(--bg)' }}>
                  <p className="font-extrabold" style={{ fontSize: '1.75rem', color: '#10B981', letterSpacing: '-0.04em' }}>
                    {profile.impact_score || 0}
                  </p>
                  <p className="text-[11.5px]" style={{ color: 'var(--text-4)' }}>Impact Score</p>
                </div>
              </div>
            </motion.div>

            {/* Causes */}
            {causes.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, ease }}
                className="card-white p-5">
                <h3 className="font-extrabold mb-3 text-[14.5px]" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
                  Causes They Support
                </h3>
                <div className="flex flex-wrap gap-2">
                  {causes.map(c => (
                    <span key={c} className={`badge ${CAT_CLASS[c] || 'cat-other'}`}>{c}</span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Website */}
            {profile.website && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ease }}
                className="card-white p-5">
                <h3 className="font-extrabold mb-3 text-[14.5px]" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>Links</h3>
                <a href={profile.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 font-bold text-[13px] transition-colors" style={{ color: 'var(--blue)' }}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                  Personal Website
                </a>
              </motion.div>
            )}

            {/* Member since */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, ease }}
              className="card-white p-5">
              <div className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--text-3)' }}>
                <span style={{ fontSize: '15px' }}>◈</span>
                Member since {new Date(profile.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </motion.div>
          </div>

          {/* Right: fulfilled dreams */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, ease }}
              className="card-white p-6">
              <h3 className="font-extrabold mb-5 text-[1.1rem]" style={{ color: 'var(--text)', letterSpacing: '-0.025em' }}>
                Dreams Fulfilled
              </h3>

              {!profile.fulfilled_dreams || profile.fulfilled_dreams.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">✦</div>
                  <p className="font-bold text-[14px] mb-1" style={{ color: 'var(--text)' }}>No fulfilled dreams yet</p>
                  <p className="text-[13px]" style={{ color: 'var(--text-4)' }}>This fulfiller hasn't completed any dreams publicly</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profile.fulfilled_dreams.map(d => <FulfilledDreamCard key={d.id} dream={d} />)}
                </div>
              )}
            </motion.div>

            {/* CTA */}
            {user && user.uid !== uid && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, ease }}
                className="mt-4 p-5 rounded-[18px] flex items-center justify-between gap-4"
                style={{ background: 'var(--blue-light)', border: '1px solid var(--blue-border)' }}>
                <div>
                  <p className="font-bold text-[14px]" style={{ color: 'var(--text)' }}>
                    Have a dream this person could fulfill?
                  </p>
                  <p className="text-[12.5px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                    Browse dreams they're interested in supporting
                  </p>
                </div>
                <Link to="/dreams" className="btn-primary flex-shrink-0">Browse Dreams</Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
