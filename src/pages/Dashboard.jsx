import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import Navbar from '../components/layout/Navbar';

const JOURNEY = [
  { key: 'pending',    label: 'Under Review',       color: 'bg-amber-500' },
  { key: 'published',  label: 'Published',          color: 'bg-blue-500' },
  { key: 'matched',    label: 'Fulfiller Matched',  color: 'bg-violet-500' },
  { key: 'in_progress',label: 'In Progress',        color: 'bg-sky-500' },
  { key: 'fulfilled',  label: 'Fulfilled',          color: 'bg-emerald-500' },
];

const STATUS_COLORS = {
  pending:     'bg-amber-50 text-amber-700 border-amber-200',
  published:   'bg-blue-50 text-blue-700 border-blue-200',
  matched:     'bg-violet-50 text-violet-700 border-violet-200',
  in_progress: 'bg-sky-50 text-sky-700 border-sky-200',
  fulfilled:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected:    'bg-red-50 text-red-600 border-red-200',
};

const BADGE_CONFIG = {
  verified:           { label: 'Verified',           color: 'bg-blue-100 text-blue-700' },
  urgent:             { label: 'Urgent',              color: 'bg-red-100 text-red-700' },
  community_supported:{ label: 'Community Supported', color: 'bg-orange-100 text-orange-700' },
  featured:           { label: 'Featured',            color: 'bg-amber-100 text-amber-700' },
  mod_recommended:    { label: 'Mod Recommended',     color: 'bg-emerald-100 text-emerald-700' },
};

function TrustScoreRing({ score = 100 }) {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  const r = 28, c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke="#e2e8f0" strokeWidth="6"/>
          <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.8s ease' }}/>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-black text-slate-900">{pct}</span>
        </div>
      </div>
      <span className="text-xs text-slate-500 mt-1 font-medium">Trust Score</span>
    </div>
  );
}

function DreamJourneyTracker({ status }) {
  const current = JOURNEY.findIndex((s) => s.key === status);
  if (current === -1) return null;
  return (
    <div className="flex items-center w-full mt-3">
      {JOURNEY.map((s, i) => (
        <div key={s.key} className="flex items-center flex-1">
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className={`w-3 h-3 rounded-full transition-all ${i <= current ? s.color : 'bg-slate-200'}`} />
            <span className={`text-[9px] font-medium leading-none text-center ${i <= current ? 'text-slate-700' : 'text-slate-400'}`} style={{ maxWidth: 48 }}>
              {s.label}
            </span>
          </div>
          {i < JOURNEY.length - 1 && (
            <div className={`flex-1 h-0.5 mb-4 mx-1 ${i < current ? s.color : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, icon, color = 'blue' }) {
  const colors = {
    blue:    { bg: 'bg-gradient-to-br from-blue-50 to-blue-100/60',    text: 'text-blue-600',    border: 'border-blue-100',    icon: 'bg-blue-100 text-blue-600' },
    emerald: { bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/60', text: 'text-emerald-600', border: 'border-emerald-100', icon: 'bg-emerald-100 text-emerald-600' },
    violet:  { bg: 'bg-gradient-to-br from-violet-50 to-violet-100/60',  text: 'text-violet-600',  border: 'border-violet-100',  icon: 'bg-violet-100 text-violet-600' },
    amber:   { bg: 'bg-gradient-to-br from-amber-50 to-amber-100/60',   text: 'text-amber-600',   border: 'border-amber-100',   icon: 'bg-amber-100 text-amber-600' },
  };
  const c = colors[color];
  return (
    <div className={`p-5 rounded-2xl border shadow-card ${c.bg} ${c.border}`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.icon}`}>{icon}</span>
        <span className={`text-3xl font-black ${c.text}`}>{value}</span>
      </div>
      <div className={`text-xs font-bold uppercase tracking-wide ${c.text} opacity-70`}>{label}</div>
      {sub && <div className="text-xs mt-0.5 text-slate-400">{sub}</div>}
    </div>
  );
}

function Toast({ msg }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-float text-sm font-medium z-50 whitespace-nowrap">
      {msg}
    </motion.div>
  );
}

const TABS = [
  { key: 'dreams',        label: 'My Dreams',       icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z' },
  { key: 'fulfillments',  label: 'Fulfillments',    icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z' },
  { key: 'saved',         label: 'Saved Dreams',    icon: 'M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z' },
  { key: 'profile',       label: 'My Profile',      icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
];

export default function Dashboard() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dreams');
  const [dreams, setDreams] = useState([]);
  const [fulfillments, setFulfillments] = useState([]);
  const [saved, setSaved] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [profileForm, setProfileForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    if (!profile) return;
    setProfileForm({
      name: profile.name || '',
      bio: profile.bio || '',
      fulfiller_bio: profile.fulfiller_bio || '',
      mode: profile.mode || 'dreamer',
      location: profile.location || '',
      country: profile.country || '',
      website: profile.website || '',
      skills: tryJSON(profile.skills),
      interests: tryJSON(profile.interests),
      causes: tryJSON(profile.causes),
    });
    loadData();
  }, [profile]);

  const loadData = async () => {
    setLoading(true);
    const [dreamsRes, fulfRes, savedRes, notifRes] = await Promise.allSettled([
      api.getMyDreams(), api.getMyFulfillments(), api.getSavedDreams(),
      api.getNotifications({ limit: 5 }),
    ]);
    if (dreamsRes.status === 'fulfilled') setDreams(dreamsRes.value.dreams || []);
    if (fulfRes.status === 'fulfilled') setFulfillments(fulfRes.value.requests || []);
    if (savedRes.status === 'fulfilled') setSaved(savedRes.value.saved || []);
    if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.notifications || []);
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.updateProfile(profileForm);
      await refreshProfile();
      showToast('Profile updated successfully!');
    } catch (err) { showToast(err.message || 'Failed to update profile'); }
    setSaving(false);
  };

  const handleUnsave = async (dreamId) => {
    await api.unsaveDream(dreamId);
    setSaved((s) => s.filter((d) => d.dream_id !== dreamId));
  };

  if (!profile) return null;

  const fulfilledCount = dreams.filter((d) => d.status === 'fulfilled').length;
  const activeCount = dreams.filter((d) => ['published', 'matched', 'in_progress'].includes(d.status)).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero Header */}
      <div className="gradient-mesh pt-16 relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 relative">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-blue">
                {profile.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-black text-white">{profile.name}</h1>
                  {profile.verified === 1 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-sm capitalize">{profile.mode} · {profile.location || 'Location not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <TrustScoreRing score={profile.trust_score} />
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-dark rounded-2xl px-4 py-3 text-center border border-white/[0.07]">
                  <div className="text-2xl font-black text-white">{dreams.length}</div>
                  <div className="text-slate-400 text-[11px] font-medium mt-0.5">Dreams</div>
                </div>
                <div className="glass-dark rounded-2xl px-4 py-3 text-center border border-white/[0.07]">
                  <div className="text-2xl font-black text-white">{profile.fulfilled_count || 0}</div>
                  <div className="text-slate-400 text-[11px] font-medium mt-0.5">Fulfilled</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-16">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 -mt-5 mb-8">
          <StatCard label="Active Dreams" value={activeCount} icon={
            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>
          } />
          <StatCard label="Dreams Fulfilled" value={fulfilledCount} color="emerald" icon={
            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          } />
          <StatCard label="Fulfillments" value={fulfillments.length} color="violet" icon={
            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>
          } />
          <StatCard label="Saved Dreams" value={saved.length} color="amber" icon={
            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"/></svg>
          } />
        </div>

        {/* Recent Notifications */}
        {notifications.filter((n) => !n.read).length > 0 && (
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-blue-900">Recent Updates</span>
              <Link to="/notifications" className="text-xs text-blue-600 font-semibold hover:text-blue-800">View all</Link>
            </div>
            <div className="space-y-2">
              {notifications.filter((n) => !n.read).slice(0, 3).map((n) => (
                <div key={n.id} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-blue-100">
                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{n.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-100 rounded-2xl p-1.5 mb-6 shadow-card overflow-x-auto scrollbar-hide">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-shrink-0 flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                tab === t.key
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.icon}/>
              </svg>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">

          {/* MY DREAMS */}
          {tab === 'dreams' && (
            <motion.div key="dreams" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900">Dream Journey</h2>
                <Link to="/submit-dream"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-blue">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                  </svg>
                  New Dream
                </Link>
              </div>
              {loading ? (
                <div className="grid gap-4">
                  {[1,2,3].map((i) => <div key={i} className="h-44 bg-white rounded-2xl border border-slate-100 animate-pulse"/>)}
                </div>
              ) : dreams.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-16 text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
                    </svg>
                  </div>
                  <p className="font-bold text-slate-900 mb-2">No dreams submitted yet</p>
                  <p className="text-slate-500 text-sm mb-6">Share your dream anonymously and let the right person find you.</p>
                  <Link to="/submit-dream"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition-colors shadow-blue text-sm">
                    Submit Your First Dream
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {dreams.map((dream) => (
                    <motion.div key={dream.id} layout
                      className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 hover:shadow-float transition-shadow">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <h3 className="font-bold text-slate-900 text-lg leading-tight">{dream.title}</h3>
                            {dream.badge && dream.badge !== 'none' && BADGE_CONFIG[dream.badge] && (
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${BADGE_CONFIG[dream.badge].color}`}>
                                {BADGE_CONFIG[dream.badge].label}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-semibold">{dream.category}</span>
                            <span>{new Date(dream.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>
                              {dream.support_count} supporters
                            </span>
                          </div>
                        </div>
                        <span className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border capitalize ${STATUS_COLORS[dream.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {dream.status?.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Dream Journey Tracker */}
                      {!['rejected'].includes(dream.status) && <DreamJourneyTracker status={dream.status} />}

                      {dream.moderator_notes && dream.status === 'rejected' && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                          <p className="text-xs font-semibold text-red-700 mb-1">Moderator Note:</p>
                          <p className="text-xs text-red-600 leading-relaxed">{dream.moderator_notes}</p>
                        </div>
                      )}

                      {dream.status === 'matched' && (
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-sm text-slate-600 font-medium">A fulfiller has been connected to your dream!</span>
                          <Link to={`/messages/${dream.id}`}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors">
                            Open Chat
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* FULFILLMENTS */}
          {tab === 'fulfillments' && (
            <motion.div key="fulfillments" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900">My Fulfillment Applications</h2>
                <Link to="/dreams" className="text-sm text-blue-600 font-semibold hover:text-blue-800">Browse Dreams</Link>
              </div>
              {fulfillments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-16 text-center">
                  <p className="font-bold text-slate-900 mb-2">No fulfillment applications</p>
                  <p className="text-slate-500 text-sm mb-6">Browse dreams and apply to help someone make their dream real.</p>
                  <Link to="/dreams" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition-colors shadow-blue text-sm">
                    Explore Dreams
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {fulfillments.map((req) => (
                    <div key={req.id} className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-xs text-slate-400 mb-1 font-medium">Applying to fulfill:</p>
                          <h3 className="font-bold text-slate-900 mb-2">{req.dream_title}</h3>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">{req.dream_category}</span>
                            <span className="text-xs text-slate-400 py-1">Applied {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                          {req.moderator_notes && (
                            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <p className="text-xs text-slate-600">{req.moderator_notes}</p>
                            </div>
                          )}
                        </div>
                        <span className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border capitalize ${STATUS_COLORS[req.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {req.status}
                        </span>
                      </div>
                      {req.status === 'approved' && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <Link to={`/messages/${req.dream_id}`}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors w-fit">
                            Open Messages
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* SAVED DREAMS */}
          {tab === 'saved' && (
            <motion.div key="saved" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900">Saved Dreams</h2>
              </div>
              {saved.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-16 text-center">
                  <p className="font-bold text-slate-900 mb-2">No saved dreams</p>
                  <p className="text-slate-500 text-sm mb-6">Save dreams you want to follow or fulfill later.</p>
                  <Link to="/dreams" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition-colors shadow-blue text-sm">
                    Browse Dreams
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {saved.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-semibold rounded-full">{item.category}</span>
                          <h3 className="font-bold text-slate-900 mt-2 mb-3 leading-snug">{item.title}</h3>
                        </div>
                        <button onClick={() => handleUnsave(item.dream_id)}
                          className="flex-shrink-0 w-8 h-8 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${STATUS_COLORS[item.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {item.status}
                        </span>
                        <Link to={`/dreams/${item.dream_id}`}
                          className="text-xs text-blue-600 font-semibold hover:text-blue-800">View Dream</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* PROFILE */}
          {tab === 'profile' && profileForm && (
            <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: profile form */}
                <div className="lg:col-span-2 space-y-5">
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
                    <h3 className="font-bold text-slate-900 mb-5">Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        ['Full Name', 'name', 'text', 'Your name'],
                        ['Location', 'location', 'text', 'City, Country'],
                        ['Country', 'country', 'text', 'Country'],
                        ['Website', 'website', 'url', 'https://...'],
                      ].map(([label, key, type, placeholder]) => (
                        <div key={key}>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
                          <input type={type} value={profileForm[key] || ''} placeholder={placeholder}
                            onChange={(e) => setProfileForm({ ...profileForm, [key]: e.target.value })}
                            className="input"/>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Bio</label>
                      <textarea value={profileForm.bio || ''} rows={3} placeholder="Tell the community about yourself..."
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        className="input resize-none"/>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
                    <h3 className="font-bold text-slate-900 mb-5">Fulfiller Profile</h3>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Fulfiller Bio</label>
                      <textarea value={profileForm.fulfiller_bio || ''} rows={4} placeholder="Describe your skills, experience, and what kinds of dreams you'd like to fulfill..."
                        onChange={(e) => setProfileForm({ ...profileForm, fulfiller_bio: e.target.value })}
                        className="input resize-none"/>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Account Mode</label>
                      <div className="flex gap-3">
                        {['dreamer', 'fulfiller', 'both'].map((m) => (
                          <button key={m} onClick={() => setProfileForm({ ...profileForm, mode: m })}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all capitalize ${
                              profileForm.mode === m ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}>{m}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button onClick={handleSaveProfile} disabled={saving}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-colors shadow-blue disabled:opacity-60 text-sm">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>

                {/* Right: impact */}
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
                    <h3 className="font-bold text-slate-900 mb-4">Impact Score</h3>
                    <div className="text-center py-4">
                      <div className="text-5xl font-black text-blue-600 mb-2">{profile.impact_score || 0}</div>
                      <p className="text-slate-500 text-sm">Impact points earned through your activity on the platform.</p>
                    </div>
                    <div className="space-y-3 mt-4">
                      {[
                        ['Dreams Submitted', dreams.length, 'blue'],
                        ['Dreams Fulfilled', fulfilledCount, 'emerald'],
                        ['Others Helped', profile.fulfilled_count || 0, 'violet'],
                      ].map(([label, val, col]) => (
                        <div key={label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-sm text-slate-600">{label}</span>
                          <span className={`font-bold text-${col}-600`}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
                      </svg>
                      <span className="font-bold text-sm">Trust Score</span>
                    </div>
                    <div className="text-4xl font-black mb-1">{profile.trust_score || 100}</div>
                    <p className="text-blue-200 text-sm">
                      {(profile.trust_score || 100) >= 80 ? 'Excellent trust level' :
                       (profile.trust_score || 100) >= 50 ? 'Good standing' : 'Needs improvement'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <AnimatePresence>
        {toast && <Toast msg={toast} />}
      </AnimatePresence>
    </div>
  );
}

function tryJSON(val) {
  try { return JSON.parse(val || '[]'); } catch { return []; }
}
