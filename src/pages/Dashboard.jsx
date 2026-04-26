import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import Navbar from '../components/layout/Navbar';

const ease = [0.22, 1, 0.36, 1];

const JOURNEY = [
  { key: 'pending',             label: 'Under Review',  color: '#F59E0B' },
  { key: 'published',           label: 'Published',     color: '#2563EB' },
  { key: 'matched',             label: 'Matched',       color: '#7C3AED' },
  { key: 'in_progress',         label: 'In Progress',   color: '#0EA5E9' },
  { key: 'pending_fulfillment', label: 'Verifying',     color: '#F97316' },
  { key: 'fulfilled',           label: 'Fulfilled',     color: '#10B981' },
];

const STATUS_STYLE = {
  pending:             'badge badge-amber',
  published:           'badge badge-blue',
  matched:             'badge badge-violet',
  in_progress:         'badge',
  pending_fulfillment: 'badge',
  fulfilled:           'badge badge-green',
  rejected:            'badge badge-red',
};

const STATUS_LABEL = {
  pending:             'Under Review',
  published:           'Published',
  matched:             'Matched',
  in_progress:         'In Progress',
  pending_fulfillment: 'Pending Verification',
  fulfilled:           'Fulfilled',
  rejected:            'Rejected',
};

const CAT_EMOJI = {
  Education: '🎓', Health: '🌿', Career: '🚀', Family: '🏠',
  Community: '🏘️', Creative: '🎨', Travel: '✈️', Technology: '💡', Other: '✦',
};

const CAT_CLASS = {
  Education: 'cat-education', Health: 'cat-health', Career: 'cat-career',
  Family: 'cat-family', Community: 'cat-community', Creative: 'cat-creative',
  Travel: 'cat-travel', Technology: 'cat-technology', Other: 'cat-other',
};

const TABS = [
  { key: 'dreams',       label: 'My Dreams',    emoji: '✦' },
  { key: 'fulfillments', label: 'Fulfillments', emoji: '♡' },
  { key: 'saved',        label: 'Saved',        emoji: '◈' },
  { key: 'profile',      label: 'Profile',      emoji: '◉' },
];

function tryJSON(val) {
  try { return JSON.parse(val || '[]'); } catch { return []; }
}

function DreamJourneyTracker({ status }) {
  const current = JOURNEY.findIndex(s => s.key === status);
  if (current === -1) return null;
  return (
    <div className="flex items-start mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
      {JOURNEY.map((s, i) => {
        const isDone   = i < current;
        const isActive = i === current;
        return (
          <div key={s.key} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className="w-3.5 h-3.5 rounded-full transition-all" style={{
                background: isDone ? s.color : isActive ? 'white' : 'var(--border)',
                border: isActive ? `2px solid ${s.color}` : isDone ? 'none' : '2px solid var(--border-dark)',
                boxShadow: isActive ? `0 0 0 3px ${s.color}22` : 'none',
              }} />
              <span className="text-[9.5px] font-bold text-center whitespace-nowrap leading-none" style={{
                color: isActive ? s.color : isDone ? 'var(--text-3)' : 'var(--text-4)',
              }}>
                {s.label}
              </span>
            </div>
            {i < JOURNEY.length - 1 && (
              <div className="flex-1 h-px mx-1.5 mb-[18px] transition-all" style={{
                background: isDone ? s.color + '66' : 'var(--border)',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FulfilledSuccessCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="mt-4 p-4 rounded-[16px] flex items-center gap-4"
      style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)', border: '1.5px solid #A7F3D0' }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', boxShadow: '0 4px 12px rgba(16,185,129,0.30)' }}>
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-[14px]" style={{ color: '#065F46', letterSpacing: '-0.02em' }}>Dream Fulfilled</p>
        <p className="text-[12px] mt-0.5" style={{ color: '#059669' }}>Fulfilled by verified connection · Moderated and confirmed</p>
      </div>
    </motion.div>
  );
}

function DreamerConfirmCard({ dream, onConfirm, onMoreSupport, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="mt-4 p-4 rounded-[16px]"
      style={{ background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', border: '1.5px solid #FDE68A' }}>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0"
          style={{ background: '#F59E0B', boxShadow: '0 4px 10px rgba(245,158,11,0.28)' }}>
          <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ width: '18px', height: '18px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-[14px]" style={{ color: '#92400E', letterSpacing: '-0.02em' }}>
            Fulfiller marked your dream as fulfilled
          </p>
          <p className="text-[12.5px] mt-1 leading-relaxed" style={{ color: '#B45309' }}>
            Please confirm or let us know if you need more support. This is moderated and safe.
          </p>
        </div>
      </div>
      <div className="flex gap-2.5">
        <button
          onClick={() => onConfirm(dream.id)}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[12px] font-bold text-[13px] text-white transition-all disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', boxShadow: '0 4px 12px rgba(16,185,129,0.30)' }}>
          {loading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          )}
          Confirm Fulfilled
        </button>
        <button
          onClick={() => onMoreSupport(dream.id)}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[12px] font-bold text-[13px] transition-all disabled:opacity-60"
          style={{ background: 'white', color: '#92400E', border: '1.5px solid #FDE68A' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"/>
          </svg>
          Needs More Support
        </button>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="card-white p-5 hover:shadow-float transition-shadow">
      <div className="text-3xl font-extrabold mb-1" style={{ color: accent, letterSpacing: '-0.04em' }}>{value}</div>
      <div className="font-bold text-[13px]" style={{ color: 'var(--text)' }}>{label}</div>
      <div className="text-[12px] mt-0.5" style={{ color: 'var(--text-4)' }}>{sub}</div>
    </div>
  );
}

function Toast({ msg }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.96 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 text-white px-6 py-3 rounded-2xl shadow-float text-[13px] font-semibold z-50 whitespace-nowrap"
      style={{ background: 'var(--navy)' }}>
      {msg}
    </motion.div>
  );
}

function EmptyState({ icon, title, sub, cta, to }) {
  return (
    <div className="card-white p-14 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <p className="font-extrabold mb-1" style={{ color: 'var(--text)', fontSize: '1rem', letterSpacing: '-0.02em' }}>{title}</p>
      <p className="text-[13.5px] mb-6" style={{ color: 'var(--text-3)' }}>{sub}</p>
      <Link to={to} className="btn-primary" style={{ display: 'inline-flex' }}>{cta}</Link>
    </div>
  );
}

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
  const [confirmingId, setConfirmingId] = useState(null);
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
    if (fulfRes.status === 'fulfilled')   setFulfillments(fulfRes.value.requests || []);
    if (savedRes.status === 'fulfilled')  setSaved(savedRes.value.saved || []);
    if (notifRes.status === 'fulfilled')  setNotifications(notifRes.value.notifications || []);
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
    setSaved(s => s.filter(d => d.dream_id !== dreamId));
  };

  const handleDreamerConfirm = async (dreamId) => {
    setConfirmingId(dreamId);
    try {
      await api.dreamerResponse(dreamId, 'confirm');
      showToast('Dream confirmed as fulfilled!');
      await loadData();
    } catch (err) { showToast(err.message || 'Failed to confirm'); }
    setConfirmingId(null);
  };

  const handleDreamerMoreSupport = async (dreamId) => {
    setConfirmingId(dreamId);
    try {
      await api.dreamerResponse(dreamId, 'more_support');
      showToast('More support requested. Fulfiller notified.');
      await loadData();
    } catch (err) { showToast(err.message || 'Failed to send response'); }
    setConfirmingId(null);
  };

  if (!profile) return null;

  const firstName      = profile.name?.split(' ')[0] || 'there';
  const fulfilledCount = dreams.filter(d => d.status === 'fulfilled').length;
  const activeCount    = dreams.filter(d => ['published', 'matched', 'in_progress', 'pending_fulfillment'].includes(d.status)).length;
  const unreadNotifs   = notifications.filter(n => !n.read);
  const pendingConfirmCount = dreams.filter(d => d.status === 'pending_fulfillment').length;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-[220px] z-20 overflow-y-auto"
        style={{ paddingTop: '64px', background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>

        <nav className="flex-1 p-3 pt-5 space-y-0.5">
          {TABS.map(t => {
            const active = tab === t.key;
            const showBadge = t.key === 'dreams' && pendingConfirmCount > 0;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-left transition-all"
                style={{
                  background: active ? 'var(--blue-light)' : 'transparent',
                  color: active ? 'var(--blue)' : 'var(--text-2)',
                  fontWeight: active ? 700 : 600,
                  fontSize: '13.5px',
                  borderLeft: active ? '2.5px solid var(--blue)' : '2.5px solid transparent',
                }}>
                <span style={{ fontSize: '15px', opacity: active ? 1 : 0.6 }}>{t.emoji}</span>
                <span className="flex-1">{t.label}</span>
                {showBadge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold"
                    style={{ background: '#FEF3C7', color: '#92400E' }}>
                    {pendingConfirmCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar CTA */}
        <div className="m-3 mb-5 p-4 rounded-[16px] text-center" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center mx-auto mb-3 text-xl"
            style={{ background: 'var(--blue-light)' }}>✦</div>
          <p className="font-bold text-[13px] mb-1" style={{ color: 'var(--text)' }}>Make more impact</p>
          <p className="text-[12px] mb-3" style={{ color: 'var(--text-4)' }}>Help someone's dream come true today.</p>
          <Link to="/dreams" className="btn-primary" style={{ display: 'block', fontSize: '12.5px', padding: '8px 12px' }}>
            Explore Dreams
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex" style={{ paddingTop: '64px' }}>
        <div className="hidden lg:block flex-shrink-0" style={{ width: '220px' }} />
        <main className="flex-1 min-w-0">
        <div className="p-5 lg:p-8 max-w-5xl">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="font-extrabold" style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.875rem)', color: 'var(--text)', letterSpacing: '-0.03em' }}>
                Welcome back, {firstName}
              </h1>
              <p className="mt-1 text-[13.5px]" style={{ color: 'var(--text-3)' }}>
                Track your dreams and see your impact.
              </p>
            </div>
            <Link to="/submit-dream" className="btn-primary flex-shrink-0" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
              New Dream
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8">
            <StatCard label="Active Dreams"   value={activeCount}          sub="Live on the platform"  accent="var(--blue)" />
            <StatCard label="Fulfilled"        value={fulfilledCount}       sub="Dreams come true"      accent="#10B981" />
            <StatCard label="Applications"     value={fulfillments.length}  sub="Dreams you applied to" accent="#7C3AED" />
            <StatCard label="Saved"            value={saved.length}         sub="Bookmarked dreams"     accent="#F59E0B" />
          </div>

          {/* Pending confirmation banner */}
          {pendingConfirmCount > 0 && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-3 p-4 rounded-[16px]"
              style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
              <div className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse" style={{ background: '#F97316' }} />
              <div className="flex-1 min-w-0">
                <span className="font-bold text-[13px]" style={{ color: '#C2410C' }}>
                  {pendingConfirmCount} dream{pendingConfirmCount > 1 ? 's' : ''} awaiting your confirmation
                </span>
                <span className="text-[12.5px] ml-2" style={{ color: '#B45309' }}>
                  A fulfiller has marked it as complete
                </span>
              </div>
              <button onClick={() => setTab('dreams')} className="text-[12.5px] font-bold flex-shrink-0 no-min-h" style={{ color: '#C2410C' }}>
                Review →
              </button>
            </motion.div>
          )}

          {/* Notification banner */}
          {unreadNotifs.length > 0 && pendingConfirmCount === 0 && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-3 p-4 rounded-[16px]"
              style={{ background: 'var(--blue-light)', border: '1px solid var(--blue-border)' }}>
              <div className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse" style={{ background: 'var(--blue)' }} />
              <div className="flex-1 min-w-0">
                <span className="font-bold text-[13px]" style={{ color: 'var(--blue)' }}>
                  {unreadNotifs.length} new update{unreadNotifs.length > 1 ? 's' : ''}
                </span>
                <span className="text-[12.5px] ml-2 truncate" style={{ color: '#3B82F6' }}>
                  {unreadNotifs[0]?.title}
                </span>
              </div>
              <Link to="/notifications" className="text-[12.5px] font-bold flex-shrink-0" style={{ color: 'var(--blue)' }}>
                View all →
              </Link>
            </motion.div>
          )}

          {/* Mobile tab bar */}
          <div className="lg:hidden flex items-center gap-1 mb-6 p-1 rounded-[14px]" style={{ background: 'var(--border)' }}>
            {TABS.map(t => {
              const active = tab === t.key;
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className="flex-1 py-2 rounded-[11px] text-[12.5px] font-bold transition-all"
                  style={{
                    background: active ? 'white' : 'transparent',
                    color: active ? 'var(--blue)' : 'var(--text-3)',
                    boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  }}>
                  {t.emoji} {t.label}
                </button>
              );
            })}
          </div>

          {/* Desktop tab underline bar */}
          <div className="hidden lg:flex items-center gap-0 mb-6 overflow-x-auto"
            style={{ borderBottom: '1px solid var(--border)' }}>
            {TABS.map(t => {
              const active = tab === t.key;
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className="relative flex items-center gap-2 px-4 py-3 text-[13.5px] font-bold whitespace-nowrap transition-colors"
                  style={{ color: active ? 'var(--blue)' : 'var(--text-3)' }}>
                  <span style={{ fontSize: '14px' }}>{t.emoji}</span>
                  {t.label}
                  {active && (
                    <span className="absolute bottom-0 inset-x-0 h-0.5 rounded-t-full" style={{ background: 'var(--blue)' }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">

            {/* MY DREAMS */}
            {tab === 'dreams' && (
              <motion.div key="dreams" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22, ease }}>
                <div className="mb-5">
                  <h2 className="font-extrabold" style={{ fontSize: '1.1rem', color: 'var(--text)', letterSpacing: '-0.025em' }}>Dream Journey</h2>
                  <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-3)' }}>Track every dream from submission to fulfillment</p>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => (
                      <div key={i} className="h-40 rounded-[18px] animate-pulse" style={{ background: 'var(--border)' }} />
                    ))}
                  </div>
                ) : dreams.length === 0 ? (
                  <EmptyState icon="✦" title="No dreams submitted yet" sub="Share your dream and start your journey toward making it real."
                    cta="Submit My Dream" to="/submit-dream" />
                ) : (
                  <div className="space-y-3">
                    {dreams.map((dream, idx) => {
                      const catClass = CAT_CLASS[dream.category] || 'cat-other';
                      const catEmoji = CAT_EMOJI[dream.category] || '✦';
                      const isPendingConfirmation = dream.status === 'pending_fulfillment';
                      const isFulfilled = dream.status === 'fulfilled';
                      const isConfirming = confirmingId === dream.id;

                      return (
                        <motion.div key={dream.id} layout
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04, ease }}
                          className="card-white p-5 hover:shadow-float transition-shadow"
                          style={isPendingConfirmation ? { border: '1.5px solid #FDE68A' } : {}}>
                          <div className="flex items-start gap-3.5">
                            {/* Category badge */}
                            <div className={`w-11 h-11 rounded-[13px] flex items-center justify-center flex-shrink-0 text-xl ${catClass}`}>
                              {catEmoji}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <h3 className="font-bold leading-tight" style={{ color: 'var(--text)', fontSize: '15px' }}>
                                  {dream.title}
                                </h3>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className={`${STATUS_STYLE[dream.status] || 'badge'}`}
                                    style={isPendingConfirmation ? { background: '#FFF7ED', color: '#C2410C', borderColor: '#FED7AA' } : {}}>
                                    {STATUS_LABEL[dream.status] || dream.status?.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                <span className={`badge ${catClass}`}>{dream.category}</span>
                                <span className="flex items-center gap-1 text-[12px]" style={{ color: 'var(--text-4)' }}>
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                  </svg>
                                  {new Date(dream.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                {dream.support_count > 0 && (
                                  <span className="flex items-center gap-1 text-[12px]" style={{ color: 'var(--text-4)' }}>
                                    ♡ {dream.support_count}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {dream.status !== 'rejected' && <DreamJourneyTracker status={dream.status} />}

                          {isFulfilled && <FulfilledSuccessCard />}

                          {isPendingConfirmation && (
                            <DreamerConfirmCard
                              dream={dream}
                              onConfirm={handleDreamerConfirm}
                              onMoreSupport={handleDreamerMoreSupport}
                              loading={isConfirming}
                            />
                          )}

                          {dream.moderator_notes && dream.status === 'rejected' && (
                            <div className="mt-4 p-3 rounded-[12px]" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                              <p className="text-[11.5px] font-bold mb-1" style={{ color: '#DC2626' }}>Moderator Note</p>
                              <p className="text-[12px] leading-relaxed" style={{ color: '#EF4444' }}>{dream.moderator_notes}</p>
                            </div>
                          )}

                          {dream.status === 'matched' && (
                            <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
                              <span className="text-[12.5px]" style={{ color: 'var(--text-3)' }}>A fulfiller has been matched to your dream</span>
                              <Link to={`/messages/${dream.id}`} className="btn-primary" style={{ fontSize: '12px', padding: '7px 14px' }}>
                                Open Chat
                              </Link>
                            </div>
                          )}

                          {dream.status === 'in_progress' && (
                            <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
                              <span className="text-[12.5px]" style={{ color: 'var(--text-3)' }}>Active fulfillment in progress</span>
                              <Link to={`/messages/${dream.id}`} className="btn-primary" style={{ fontSize: '12px', padding: '7px 14px' }}>
                                Open Chat
                              </Link>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* FULFILLMENTS */}
            {tab === 'fulfillments' && (
              <motion.div key="fulfillments" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22, ease }}>
                <div className="mb-5">
                  <h2 className="font-extrabold" style={{ fontSize: '1.1rem', color: 'var(--text)', letterSpacing: '-0.025em' }}>Fulfillment Applications</h2>
                  <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-3)' }}>Dreams you've applied to fulfill</p>
                </div>

                {fulfillments.length === 0 ? (
                  <EmptyState icon="♡" title="No applications yet" sub="Browse dreams and apply to help someone make their dream real."
                    cta="Explore Dreams" to="/dreams" />
                ) : (
                  <div className="space-y-3">
                    {fulfillments.map((req, idx) => {
                      const catClass = CAT_CLASS[req.dream_category] || 'cat-other';
                      const catEmoji = CAT_EMOJI[req.dream_category] || '✦';
                      const isPendingVerif = req.dream_status === 'pending_fulfillment';
                      const isFulfilled = req.dream_status === 'fulfilled';
                      return (
                        <motion.div key={req.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04, ease }}
                          className="card-white p-5 hover:shadow-float transition-shadow">
                          <div className="flex items-start gap-3.5">
                            <div className={`w-11 h-11 rounded-[13px] flex items-center justify-center flex-shrink-0 text-xl ${catClass}`}>
                              {catEmoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-[11.5px] mb-0.5" style={{ color: 'var(--text-4)' }}>Applying to fulfill</p>
                                  <h3 className="font-bold leading-tight" style={{ color: 'var(--text)', fontSize: '15px' }}>{req.dream_title}</h3>
                                </div>
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                  <span className={`${STATUS_STYLE[req.status] || 'badge'}`}>
                                    {req.status}
                                  </span>
                                  {isPendingVerif && (
                                    <span className="badge" style={{ background: '#FFF7ED', color: '#C2410C', borderColor: '#FED7AA', fontSize: '10px' }}>
                                      Pending Verification
                                    </span>
                                  )}
                                  {isFulfilled && (
                                    <span className="badge badge-green" style={{ fontSize: '10px' }}>
                                      ✓ Fulfilled
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className={`badge ${catClass}`}>{req.dream_category}</span>
                                <span className="text-[12px]" style={{ color: 'var(--text-4)' }}>
                                  Applied {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                              {req.moderator_notes && (
                                <div className="mt-3 p-3 rounded-[12px]" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                                  <p className="text-[12px]" style={{ color: 'var(--text-2)' }}>{req.moderator_notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          {req.status === 'approved' && !isFulfilled && (
                            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                              <Link to={`/messages/${req.dream_id}`} className="btn-primary" style={{ fontSize: '12px', padding: '7px 14px', display: 'inline-flex' }}>
                                Open Messages
                              </Link>
                            </div>
                          )}
                          {isFulfilled && (
                            <div className="mt-3 p-3 rounded-[12px] flex items-center gap-2"
                              style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                              <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#059669' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                              <p className="text-[12.5px] font-bold" style={{ color: '#065F46' }}>
                                You successfully fulfilled this dream!
                              </p>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* SAVED */}
            {tab === 'saved' && (
              <motion.div key="saved" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22, ease }}>
                <div className="mb-5">
                  <h2 className="font-extrabold" style={{ fontSize: '1.1rem', color: 'var(--text)', letterSpacing: '-0.025em' }}>Saved Dreams</h2>
                  <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-3)' }}>Dreams you've bookmarked</p>
                </div>

                {saved.length === 0 ? (
                  <EmptyState icon="◈" title="No saved dreams" sub="Save dreams you want to follow or fulfill later."
                    cta="Browse Dreams" to="/dreams" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {saved.map((item, idx) => {
                      const catClass = CAT_CLASS[item.category] || 'cat-other';
                      const catEmoji = CAT_EMOJI[item.category] || '✦';
                      return (
                        <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04, ease }}
                          className="card-white p-4 hover:shadow-float transition-shadow">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-[11px] flex items-center justify-center flex-shrink-0 text-lg ${catClass}`}>
                              {catEmoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-[14px] leading-tight" style={{ color: 'var(--text)' }}>{item.title}</h3>
                              <span className={`badge ${catClass} mt-1 inline-block`}>{item.category}</span>
                            </div>
                            <button onClick={() => handleUnsave(item.dream_id)}
                              className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0 transition-all hover:bg-red-50 no-min-h"
                              style={{ color: 'var(--text-4)' }}>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                              </svg>
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                            <span className={STATUS_STYLE[item.status] || 'badge'}>{item.status}</span>
                            <Link to={`/dreams/${item.dream_id}`} className="text-[12.5px] font-bold" style={{ color: 'var(--blue)' }}>
                              View →
                            </Link>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* PROFILE */}
            {tab === 'profile' && profileForm && (
              <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22, ease }}>
                <div className="mb-5">
                  <h2 className="font-extrabold" style={{ fontSize: '1.1rem', color: 'var(--text)', letterSpacing: '-0.025em' }}>My Profile</h2>
                  <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-3)' }}>Manage your identity and fulfiller profile</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2 space-y-4">
                    {/* Personal info */}
                    <div className="card-white p-6">
                      <h3 className="font-extrabold mb-5" style={{ color: 'var(--text)', fontSize: '15px', letterSpacing: '-0.02em' }}>Personal Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          ['Full Name',  'name',     'text', 'Your name'],
                          ['Location',   'location', 'text', 'City'],
                          ['Country',    'country',  'text', 'Country'],
                          ['Website',    'website',  'url',  'https://...'],
                        ].map(([label, key, type, placeholder]) => (
                          <div key={key}>
                            <label className="block text-[12px] font-bold mb-1.5 uppercase tracking-[0.06em]" style={{ color: 'var(--text-2)' }}>{label}</label>
                            <input type={type} value={profileForm[key] || ''} placeholder={placeholder}
                              onChange={e => setProfileForm({ ...profileForm, [key]: e.target.value })}
                              className="input" />
                          </div>
                        ))}
                      </div>
                      <div className="mt-4">
                        <label className="block text-[12px] font-bold mb-1.5 uppercase tracking-[0.06em]" style={{ color: 'var(--text-2)' }}>Bio</label>
                        <textarea value={profileForm.bio || ''} rows={3}
                          placeholder="Tell the community about yourself..."
                          onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                          className="input resize-none" />
                      </div>
                    </div>

                    {/* Fulfiller profile */}
                    <div className="card-white p-6">
                      <h3 className="font-extrabold mb-5" style={{ color: 'var(--text)', fontSize: '15px', letterSpacing: '-0.02em' }}>Fulfiller Profile</h3>
                      <div>
                        <label className="block text-[12px] font-bold mb-1.5 uppercase tracking-[0.06em]" style={{ color: 'var(--text-2)' }}>Fulfiller Bio</label>
                        <textarea value={profileForm.fulfiller_bio || ''} rows={4}
                          placeholder="Describe your skills and what kinds of dreams you'd like to fulfill..."
                          onChange={e => setProfileForm({ ...profileForm, fulfiller_bio: e.target.value })}
                          className="input resize-none" />
                      </div>
                      <div className="mt-4">
                        <label className="block text-[12px] font-bold mb-2 uppercase tracking-[0.06em]" style={{ color: 'var(--text-2)' }}>Account Mode</label>
                        <div className="flex gap-2.5">
                          {['dreamer', 'fulfiller', 'both'].map(m => (
                            <button key={m} onClick={() => setProfileForm({ ...profileForm, mode: m })}
                              className="flex-1 py-2.5 rounded-[12px] text-[13px] font-bold capitalize transition-all"
                              style={{
                                background: profileForm.mode === m ? 'var(--blue)' : 'var(--bg)',
                                color: profileForm.mode === m ? 'white' : 'var(--text-2)',
                                border: profileForm.mode === m ? '2px solid var(--blue)' : '2px solid var(--border)',
                              }}>
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button onClick={handleSaveProfile} disabled={saving} className="btn-primary disabled:opacity-60">
                        {saving ? 'Saving…' : 'Save Changes'}
                      </button>
                    </div>
                  </div>

                  {/* Right: impact + trust */}
                  <div className="space-y-4">
                    <div className="card-white p-6">
                      <h3 className="font-extrabold mb-4" style={{ color: 'var(--text)', fontSize: '15px', letterSpacing: '-0.02em' }}>Impact</h3>
                      <div className="text-center py-4 mb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                        <div className="font-extrabold mb-1" style={{ fontSize: '2.5rem', color: 'var(--blue)', letterSpacing: '-0.05em' }}>
                          {profile.impact_score || 0}
                        </div>
                        <p className="text-[12px]" style={{ color: 'var(--text-4)' }}>Impact points</p>
                      </div>
                      <div className="space-y-3">
                        {[
                          ['Dreams Submitted', dreams.length,               '#2563EB'],
                          ['Dreams Fulfilled', fulfilledCount,              '#10B981'],
                          ['Others Helped',    profile.fulfilled_count || 0, '#7C3AED'],
                        ].map(([label, val, color]) => (
                          <div key={label} className="flex items-center justify-between">
                            <span className="text-[13px]" style={{ color: 'var(--text-3)' }}>{label}</span>
                            <span className="font-extrabold text-[14px]" style={{ color }}>{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="card-white p-6">
                      <h3 className="font-extrabold mb-3" style={{ color: 'var(--text)', fontSize: '15px', letterSpacing: '-0.02em' }}>Trust Score</h3>
                      <div className="font-extrabold mb-1" style={{ fontSize: '1.875rem', color: 'var(--text)', letterSpacing: '-0.04em' }}>
                        {profile.trust_score || 100}
                      </div>
                      <div className="w-full rounded-full h-1.5 mb-2" style={{ background: 'var(--border)' }}>
                        <div className="h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min(100, ((profile.trust_score || 100) / 200) * 100)}%`, background: 'var(--blue)' }} />
                      </div>
                      <p className="text-[12px]" style={{ color: 'var(--text-4)' }}>
                        {(profile.trust_score || 100) >= 80 ? 'Excellent standing' :
                         (profile.trust_score || 100) >= 50 ? 'Good standing' : 'Needs improvement'}
                      </p>
                    </div>

                    <div className="card-white p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base">◈</span>
                        <h3 className="font-extrabold text-[14px]" style={{ color: 'var(--text)' }}>Member since</h3>
                      </div>
                      <p className="font-bold text-[13px]" style={{ color: 'var(--text-2)' }}>
                        {profile.created_at
                          ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                          : 'Recently joined'}
                      </p>
                      <p className="text-[12px] mt-1" style={{ color: 'var(--text-4)' }}>
                        {profile.mode === 'dreamer' ? 'Dreamer account' : profile.mode === 'fulfiller' ? 'Fulfiller account' : 'Dreamer + Fulfiller'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
        </main>
      </div>

      <AnimatePresence>
        {toast && <Toast msg={toast} />}
      </AnimatePresence>
    </div>
  );
}
