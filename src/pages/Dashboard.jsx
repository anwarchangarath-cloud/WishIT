import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import Navbar from '../components/layout/Navbar';

/* ─── Data / Config ─────────────────────────────────────────────────── */

const JOURNEY = [
  { key: 'pending',     label: 'Under Review',      active: 'border-amber-500 text-amber-500',  done: 'bg-amber-500',    line: 'bg-amber-300' },
  { key: 'published',   label: 'Published',         active: 'border-blue-500 text-blue-500',    done: 'bg-blue-500',     line: 'bg-blue-300' },
  { key: 'matched',     label: 'Fulfiller Matched', active: 'border-violet-500 text-violet-500', done: 'bg-violet-500',  line: 'bg-violet-300' },
  { key: 'in_progress', label: 'In Progress',       active: 'border-sky-500 text-sky-500',      done: 'bg-sky-500',      line: 'bg-sky-300' },
  { key: 'fulfilled',   label: 'Fulfilled',         active: 'border-emerald-500 text-emerald-500', done: 'bg-emerald-500', line: 'bg-emerald-300' },
];

const STATUS_BADGE = {
  pending:     'bg-amber-50 text-amber-600 border-amber-200',
  published:   'bg-blue-50 text-blue-700 border-blue-200',
  matched:     'bg-violet-50 text-violet-700 border-violet-200',
  in_progress: 'bg-sky-50 text-sky-700 border-sky-200',
  fulfilled:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected:    'bg-red-50 text-red-600 border-red-200',
};

const BADGE_CONFIG = {
  verified:            { label: 'Verified',           color: 'bg-blue-100 text-blue-700' },
  urgent:              { label: 'Urgent',              color: 'bg-red-100 text-red-700' },
  community_supported: { label: 'Community',           color: 'bg-orange-100 text-orange-700' },
  featured:            { label: 'Featured',            color: 'bg-amber-100 text-amber-700' },
  mod_recommended:     { label: 'Recommended',         color: 'bg-emerald-100 text-emerald-700' },
};

/* Category icon + color per dream card */
const CAT_CFG = {
  Education:  { bg: 'bg-blue-100',    text: 'text-blue-600',    d: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
  Health:     { bg: 'bg-emerald-100', text: 'text-emerald-600', d: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  Career:     { bg: 'bg-violet-100',  text: 'text-violet-600',  d: 'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z' },
  Family:     { bg: 'bg-rose-100',    text: 'text-rose-600',    d: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25' },
  Community:  { bg: 'bg-orange-100',  text: 'text-orange-600',  d: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z' },
  Creative:   { bg: 'bg-pink-100',    text: 'text-pink-600',    d: 'M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42' },
  Travel:     { bg: 'bg-amber-100',   text: 'text-amber-600',   d: 'M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418' },
  Technology: { bg: 'bg-cyan-100',    text: 'text-cyan-600',    d: 'M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3' },
  Other:      { bg: 'bg-indigo-100',  text: 'text-indigo-600',  d: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z' },
};
const DEFAULT_CAT = CAT_CFG.Other;

const TABS = [
  { key: 'dreams',       label: 'My Dreams',    icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z' },
  { key: 'fulfillments', label: 'Fulfillments', icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z' },
  { key: 'saved',        label: 'Saved Dreams', icon: 'M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z' },
  { key: 'profile',      label: 'My Profile',   icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
];

/* ─── Sub-components ────────────────────────────────────────────────── */

function TabIcon({ path, className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={path}/>
    </svg>
  );
}

/* Sidebar promo illustration — layered blue/indigo card with star icon */
function SidebarPromo() {
  return (
    <div className="mx-4 mb-4 rounded-2xl border border-blue-100 bg-white p-5 text-center shadow-sm">
      {/* Illustration */}
      <div className="relative w-20 h-20 mx-auto mb-4">
        <div className="absolute inset-2 rounded-xl bg-gradient-to-br from-blue-200 to-indigo-300 opacity-60 transform rotate-6 rounded-2xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md">
          <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
          </svg>
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-indigo-300 opacity-80" />
        <div className="absolute -bottom-0.5 -left-1 w-2 h-2 rounded-full bg-blue-300 opacity-80" />
        <div className="absolute top-2 -left-2 w-1.5 h-1.5 rounded-full bg-blue-200" />
      </div>
      <p className="font-bold text-slate-900 text-sm mb-1">Make more impact</p>
      <p className="text-slate-500 text-xs leading-relaxed mb-4">Fulfill dreams and help change lives.</p>
      <Link to="/dreams"
        className="inline-flex items-center gap-1.5 text-blue-600 text-sm font-semibold hover:text-blue-800 transition-colors">
        Explore Dreams
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
        </svg>
      </Link>
    </div>
  );
}

/* Stat card: icon square left, number+label+description right */
function StatCard({ label, description, value, iconPath, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <svg className={`w-5 h-5 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={iconPath}/>
          </svg>
        </div>
        <div className="min-w-0">
          <div className="text-2xl font-black text-slate-900 leading-none">{value}</div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">{label}</div>
          <div className="text-xs text-slate-400 mt-0.5 truncate">{description}</div>
        </div>
      </div>
    </div>
  );
}

/* Journey tracker matching the mockup */
function DreamJourneyTracker({ status }) {
  const current = JOURNEY.findIndex((s) => s.key === status);
  if (current === -1) return null;

  return (
    <div className="flex items-start mt-5 pt-5 border-t border-slate-100">
      {JOURNEY.map((s, i) => {
        const isDone   = i < current;
        const isActive = i === current;
        const isFuture = i > current;
        return (
          <div key={s.key} className="flex items-center flex-1 min-w-0">
            {/* Node + label */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              {isDone ? (
                <div className={`w-3.5 h-3.5 rounded-full ${s.done}`} />
              ) : isActive ? (
                <div className={`w-4 h-4 rounded-full border-2 bg-white ${s.active.split(' ')[0]}`} />
              ) : (
                <div className="w-3 h-3 rounded-full bg-slate-200" />
              )}
              <span className={`text-[10px] font-semibold leading-none text-center whitespace-nowrap ${
                isActive ? s.active.split(' ')[1] : isDone ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {s.label}
              </span>
            </div>
            {/* Connector line */}
            {i < JOURNEY.length - 1 && (
              <div className={`flex-1 h-px mx-1.5 mb-5 ${isDone ? s.line : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Toast({ msg }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-float text-sm font-semibold z-50 whitespace-nowrap">
      {msg}
    </motion.div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────── */

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
    setSaved((s) => s.filter((d) => d.dream_id !== dreamId));
  };

  if (!profile) return null;

  const firstName      = profile.name?.split(' ')[0] || 'there';
  const fulfilledCount = dreams.filter((d) => d.status === 'fulfilled').length;
  const activeCount    = dreams.filter((d) => ['published', 'matched', 'in_progress'].includes(d.status)).length;
  const unreadNotifs   = notifications.filter((n) => !n.read);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/*
       * Two-column layout below the fixed navbar (pt-16).
       * Sidebar: fixed left, top-16 → bottom-0, w-64.
       * Main:    lg:pl-64 pt-16.
       */}

      {/* ── Left Sidebar ──────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-slate-200 z-30 overflow-y-auto">

        {/* Nav items */}
        <nav className="flex-1 p-3 pt-4 space-y-0.5">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left border-l-[3px]
                  ${active
                    ? 'bg-blue-50 text-blue-700 border-blue-600'
                    : 'text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-900'
                  }`}>
                <TabIcon path={t.icon} />
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Promo card */}
        <SidebarPromo />
      </aside>

      {/* ── Main Content ──────────────────────────────────────────── */}
      <main className="pt-16 lg:pl-64">
        <div className="p-6 lg:p-8 max-w-6xl">

          {/* Welcome header */}
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-black text-slate-900">
                Welcome back, {firstName} <span role="img" aria-label="wave">👋</span>
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Track your dreams and see your impact in the world.
              </p>
            </div>
            <Link to="/submit-dream"
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
              </svg>
              New Dream
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Active Dreams" description="Dreams you've submitted"
              value={activeCount}
              iconBg="bg-blue-50" iconColor="text-blue-600"
              iconPath="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
            <StatCard
              label="Dreams Fulfilled" description="Dreams coming true"
              value={fulfilledCount}
              iconBg="bg-emerald-50" iconColor="text-emerald-600"
              iconPath="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
            <StatCard
              label="Applications" description="Dreams you've applied to"
              value={fulfillments.length}
              iconBg="bg-violet-50" iconColor="text-violet-600"
              iconPath="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
            <StatCard
              label="Saved Dreams" description="Dreams you've saved"
              value={saved.length}
              iconBg="bg-amber-50" iconColor="text-amber-600"
              iconPath="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
            />
          </div>

          {/* Unread notifications banner */}
          {unreadNotifs.length > 0 && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
              <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-blue-900">
                  {unreadNotifs.length} new update{unreadNotifs.length > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-blue-600 mt-0.5 line-clamp-1">{unreadNotifs[0]?.title}</p>
              </div>
              <Link to="/notifications" className="text-xs text-blue-600 font-semibold hover:text-blue-800 flex-shrink-0">
                View all →
              </Link>
            </div>
          )}

          {/* ── Inline Tab Bar ──────────────────────────────────── */}
          <div className="flex items-center border-b border-slate-200 mb-6 overflow-x-auto scrollbar-hide">
            {TABS.map((t) => {
              const active = tab === t.key;
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`relative flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors flex-shrink-0
                    ${active ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>
                  <TabIcon path={t.icon} />
                  {t.label}
                  {active && (
                    <span className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600 rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Tab Content ─────────────────────────────────────── */}
          <AnimatePresence mode="wait">

            {/* MY DREAMS */}
            {tab === 'dreams' && (
              <motion.div key="dreams" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-slate-900">Dream Journey</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Track every dream from submission to fulfillment</p>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-36 bg-white rounded-2xl border border-slate-200 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dreams.map((dream) => {
                      const cat = CAT_CFG[dream.category] || DEFAULT_CAT;
                      return (
                        <motion.div key={dream.id} layout
                          className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-4">
                            {/* Category icon */}
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.bg}`}>
                              <svg className={`w-5 h-5 ${cat.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={cat.d}/>
                              </svg>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-3">
                                <h3 className="font-bold text-slate-900 text-base leading-tight truncate">{dream.title}</h3>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {/* Status badge */}
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${STATUS_BADGE[dream.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                    {dream.status?.replace('_', ' ')}
                                  </span>
                                  {/* 3-dot menu placeholder */}
                                  <button className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                                    </svg>
                                  </button>
                                </div>
                              </div>

                              {/* Meta row */}
                              <div className="flex flex-wrap items-center gap-2.5 mt-1.5">
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md">
                                  {dream.category}
                                </span>
                                {dream.badge && dream.badge !== 'none' && BADGE_CONFIG[dream.badge] && (
                                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${BADGE_CONFIG[dream.badge].color}`}>
                                    {BADGE_CONFIG[dream.badge].label}
                                  </span>
                                )}
                                <span className="flex items-center gap-1 text-xs text-slate-400">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                  </svg>
                                  {new Date(dream.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span className="flex items-center gap-1 text-xs text-slate-400">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                                  </svg>
                                  {dream.support_count} supporters
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Journey tracker */}
                          {dream.status !== 'rejected' && <DreamJourneyTracker status={dream.status} />}

                          {dream.moderator_notes && dream.status === 'rejected' && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                              <p className="text-xs font-semibold text-red-700 mb-1">Moderator Note</p>
                              <p className="text-xs text-red-600 leading-relaxed">{dream.moderator_notes}</p>
                            </div>
                          )}

                          {dream.status === 'matched' && (
                            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-xs text-slate-500">A fulfiller has been matched to your dream</span>
                              <Link to={`/messages/${dream.id}`}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors">
                                Open Chat
                              </Link>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}

                    {/* No more dreams state */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/>
                        </svg>
                      </div>
                      <p className="font-bold text-slate-900 mb-1">
                        {dreams.length === 0 ? 'No dreams submitted yet' : 'No more dreams yet'}
                      </p>
                      <p className="text-slate-500 text-sm mb-6">Create a new dream and start your journey</p>
                      <Link to="/submit-dream"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-sm">
                        Create My Dream
                      </Link>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* FULFILLMENTS */}
            {tab === 'fulfillments' && (
              <motion.div key="fulfillments" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-slate-900">Fulfillment Applications</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Dreams you have applied to fulfill</p>
                </div>

                {fulfillments.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-7 h-7 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
                      </svg>
                    </div>
                    <p className="font-bold text-slate-900 mb-1">No applications yet</p>
                    <p className="text-slate-500 text-sm mb-6">Browse dreams and apply to help someone make their dream real.</p>
                    <Link to="/dreams" className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-sm">
                      Explore Dreams
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {fulfillments.map((req) => {
                      const cat = CAT_CFG[req.dream_category] || DEFAULT_CAT;
                      return (
                        <div key={req.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.bg}`}>
                              <svg className={`w-5 h-5 ${cat.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={cat.d}/>
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs text-slate-400 mb-0.5">Applying to fulfill</p>
                                  <h3 className="font-bold text-slate-900 leading-tight">{req.dream_title}</h3>
                                </div>
                                <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${STATUS_BADGE[req.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                  {req.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-2.5 mt-1.5">
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md">{req.dream_category}</span>
                                <span className="text-xs text-slate-400">
                                  Applied {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                              {req.moderator_notes && (
                                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                  <p className="text-xs text-slate-600">{req.moderator_notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          {req.status === 'approved' && (
                            <div className="mt-3 pt-3 border-t border-slate-100">
                              <Link to={`/messages/${req.dream_id}`}
                                className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors w-fit">
                                Open Messages
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* SAVED DREAMS */}
            {tab === 'saved' && (
              <motion.div key="saved" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-slate-900">Saved Dreams</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Dreams you have bookmarked</p>
                </div>

                {saved.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"/>
                      </svg>
                    </div>
                    <p className="font-bold text-slate-900 mb-1">No saved dreams</p>
                    <p className="text-slate-500 text-sm mb-6">Save dreams you want to follow or fulfill later.</p>
                    <Link to="/dreams" className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-sm">
                      Browse Dreams
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {saved.map((item) => {
                      const cat = CAT_CFG[item.category] || DEFAULT_CAT;
                      return (
                        <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.bg}`}>
                              <svg className={`w-4 h-4 ${cat.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={cat.d}/>
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-slate-900 text-sm leading-tight">{item.title}</h3>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-semibold rounded-md inline-block mt-1">{item.category}</span>
                            </div>
                            <button onClick={() => handleUnsave(item.dream_id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                              </svg>
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${STATUS_BADGE[item.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                              {item.status}
                            </span>
                            <Link to={`/dreams/${item.dream_id}`} className="text-xs text-blue-600 font-semibold hover:text-blue-800">
                              View Dream →
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* PROFILE */}
            {tab === 'profile' && profileForm && (
              <motion.div key="profile" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-slate-900">My Profile</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Manage your identity, mode, and fulfiller bio</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Left: form */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                      <h3 className="font-bold text-slate-900 mb-5">Personal Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          ['Full Name',  'name',     'text', 'Your name'],
                          ['Location',   'location', 'text', 'City, Country'],
                          ['Country',    'country',  'text', 'Country'],
                          ['Website',    'website',  'url',  'https://...'],
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
                        <textarea value={profileForm.bio || ''} rows={3}
                          placeholder="Tell the community about yourself..."
                          onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                          className="input resize-none"/>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                      <h3 className="font-bold text-slate-900 mb-5">Fulfiller Profile</h3>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Fulfiller Bio</label>
                        <textarea value={profileForm.fulfiller_bio || ''} rows={4}
                          placeholder="Describe your skills and what kinds of dreams you'd like to fulfill..."
                          onChange={(e) => setProfileForm({ ...profileForm, fulfiller_bio: e.target.value })}
                          className="input resize-none"/>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Account Mode</label>
                        <div className="flex gap-3">
                          {['dreamer', 'fulfiller', 'both'].map((m) => (
                            <button key={m} onClick={() => setProfileForm({ ...profileForm, mode: m })}
                              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all capitalize ${
                                profileForm.mode === m
                                  ? 'border-blue-600 bg-blue-600 text-white'
                                  : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                              }`}>
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button onClick={handleSaveProfile} disabled={saving}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-colors shadow-sm disabled:opacity-60 text-sm">
                        {saving ? 'Saving…' : 'Save Changes'}
                      </button>
                    </div>
                  </div>

                  {/* Right: impact + trust */}
                  <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                      <h3 className="font-bold text-slate-900 mb-4">Impact</h3>
                      <div className="text-center py-3 border-b border-slate-100 mb-4">
                        <div className="text-4xl font-black text-blue-600 mb-1">{profile.impact_score || 0}</div>
                        <p className="text-slate-500 text-xs">Impact points</p>
                      </div>
                      <div className="space-y-3">
                        {[
                          ['Dreams Submitted', dreams.length,              'text-blue-600'],
                          ['Dreams Fulfilled', fulfilledCount,             'text-emerald-600'],
                          ['Others Helped',    profile.fulfilled_count||0, 'text-violet-600'],
                        ].map(([label, val, cls]) => (
                          <div key={label} className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">{label}</span>
                            <span className={`font-bold text-sm ${cls}`}>{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                      <h3 className="font-bold text-slate-900 mb-3">Trust Score</h3>
                      <div className="text-3xl font-black text-slate-900 mb-1">{profile.trust_score || 100}</div>
                      <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, ((profile.trust_score || 100) / 200) * 100)}%` }} />
                      </div>
                      <p className="text-xs text-slate-500">
                        {(profile.trust_score || 100) >= 80 ? 'Excellent standing' :
                         (profile.trust_score || 100) >= 50 ? 'Good standing' : 'Needs improvement'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {toast && <Toast msg={toast} />}
      </AnimatePresence>
    </div>
  );
}

function tryJSON(val) {
  try { return JSON.parse(val || '[]'); } catch { return []; }
}
