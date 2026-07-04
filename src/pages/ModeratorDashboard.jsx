import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/ui/Modal';
import Navbar from '../components/layout/Navbar';

const URGENCY_CONFIG = {
  critical: { label: 'Critical', color: 'bg-[#3A181E] text-[#FF8F8F] border-[#6E2833]' },
  urgent:   { label: 'Urgent',   color: 'bg-[#3A2D12] text-[#FFB648] border-[#6E5620]' },
  normal:   { label: 'Normal',   color: 'bg-[#101A33] text-[#8B9AC2] border-[#1B2745]' },
};

const BADGE_OPTIONS = ['none', 'verified', 'urgent', 'community_supported', 'featured', 'mod_recommended'];

const SIDEBAR_ITEMS = [
  { key: 'queue',        label: 'Dream Queue',            badgeKey: 'pendingDreams',        icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z' },
  { key: 'fulfillments', label: 'Fulfillment Requests',   badgeKey: 'pendingFulfillments',  icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z' },
  { key: 'completions',  label: 'Pending Completions',    badgeKey: 'pendingCompletions',   icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z' },
  { key: 'reports',      label: 'Reports',                badgeKey: 'pendingReports',       icon: 'M3 3l1.664 9.526A2 2 0 006.636 14h10.728a2 2 0 001.972-1.474L21 3M3 3h18' },
  { key: 'escalations',  label: 'Escalations',            badgeKey: 'openEscalations',      icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z' },
  { key: 'flagged',      label: 'Flagged Users',          badgeKey: null,                   icon: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z' },
];

function Empty({ title, sub }) {
  return (
    <div className="p-16 text-center">
      <div className="w-14 h-14 bg-[#0A2B22] border border-[#153F33] rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-[#2CE5A7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <p className="font-semibold text-[#B5C2E4]">{title}</p>
      <p className="text-[#5F6F9C] text-sm mt-1">{sub}</p>
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

function AuditStep({ label, done }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-[#24C892]' : 'bg-[#1B2745]'}`}>
        {done && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
          </svg>
        )}
      </div>
      <span className={`text-[12px] font-medium ${done ? 'text-[#B5C2E4]' : 'text-[#5F6F9C]'}`}>{label}</span>
    </div>
  );
}

export default function ModeratorDashboard() {
  const { profile } = useAuth();
  const [section, setSection] = useState('queue');
  const [pendingDreams, setPendingDreams] = useState([]);
  const [pendingFulfillments, setPendingFulfillments] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [reports, setReports] = useState([]);
  const [flaggedUsers, setFlaggedUsers] = useState([]);
  const [stats, setStats] = useState({
    pendingDreams: 0, pendingFulfillments: 0, pendingReports: 0,
    urgentDreams: 0, openEscalations: 0, pendingCompletions: 0,
  });
  const [modal, setModal] = useState(null);
  const [notes, setNotes] = useState('');
  const [badge, setBadge] = useState('none');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [noteModal, setNoteModal] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [escalateModal, setEscalateModal] = useState(null);
  const [escalateReason, setEscalateReason] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const [dreamsRes, fulfRes, completionsRes, reportsRes, statsRes, flaggedRes] = await Promise.allSettled([
      api.mod.getPendingDreams(),
      api.mod.getPendingFulfillments(),
      api.mod.getCompletions(),
      api.mod.getReports(),
      api.mod.getStats(),
      api.mod.getFlaggedUsers(),
    ]);
    if (dreamsRes.status === 'fulfilled') setPendingDreams(dreamsRes.value.dreams || []);
    if (fulfRes.status === 'fulfilled') setPendingFulfillments(fulfRes.value.requests || []);
    if (completionsRes.status === 'fulfilled') setCompletions(completionsRes.value.completions || []);
    if (reportsRes.status === 'fulfilled') setReports(reportsRes.value.reports || []);
    if (statsRes.status === 'fulfilled') setStats(statsRes.value);
    if (flaggedRes.status === 'fulfilled') setFlaggedUsers(flaggedRes.value.users || []);
  };

  const handleDreamAction = async (action) => {
    if (action === 'reject' && !notes.trim()) return showToast('Please add a rejection note.');
    setLoading(true);
    try {
      if (action === 'approve') await api.mod.approveDream(modal.id, notes, badge !== 'none' ? badge : undefined);
      else await api.mod.rejectDream(modal.id, notes);
      setPendingDreams((d) => d.filter((dr) => dr.id !== modal.id));
      setStats((s) => ({ ...s, pendingDreams: Math.max(0, s.pendingDreams - 1) }));
      setModal(null); setNotes(''); setBadge('none');
      showToast(`Dream ${action === 'approve' ? 'approved and published' : 'rejected'}.`);
    } catch (err) { showToast(err.message || 'Action failed.'); }
    setLoading(false);
  };

  const handleFulfillmentAction = async (id, action) => {
    setLoading(true);
    try {
      if (action === 'approve') await api.mod.approveFulfillment(id, '');
      else await api.mod.rejectFulfillment(id, 'Does not meet requirements');
      setPendingFulfillments((f) => f.filter((r) => r.id !== id));
      setStats((s) => ({ ...s, pendingFulfillments: Math.max(0, s.pendingFulfillments - 1) }));
      showToast(`Fulfillment request ${action}d.`);
    } catch (err) { showToast(err.message || 'Action failed.'); }
    setLoading(false);
  };

  const handleNotifyDreamer = async (id) => {
    setLoading(true);
    try {
      await api.mod.notifyDreamerCompletion(id);
      setCompletions(prev => prev.map(c => c.id === id ? { ...c, status: 'dreamer_notified' } : c));
      setStats(s => ({ ...s, pendingCompletions: Math.max(0, s.pendingCompletions - 1) }));
      showToast('Dreamer notified for confirmation.');
    } catch (err) { showToast(err.message || 'Action failed.'); }
    setLoading(false);
  };

  const handleReportAction = async (id, status) => {
    try {
      await api.mod.reviewReport(id, status);
      setReports((r) => r.filter((rp) => rp.id !== id));
      setStats((s) => ({ ...s, pendingReports: Math.max(0, s.pendingReports - 1) }));
      showToast('Report reviewed.');
    } catch {}
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    try { await api.mod.addNote(noteModal.id, noteModal.type, noteText); } catch {}
    setNoteModal(null); setNoteText('');
    showToast('Note added.');
  };

  const handleEscalate = async () => {
    if (!escalateReason.trim()) return;
    try { await api.mod.escalate(escalateModal.id, escalateModal.type, escalateReason, '', 'normal'); } catch {}
    setEscalateModal(null); setEscalateReason('');
    showToast('Escalated to admin.');
  };

  if (!profile || !['moderator', 'admin'].includes(profile.role)) return null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <div className="flex" style={{ paddingTop: '64px' }}>

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-[230px] fixed top-0 bottom-0 overflow-y-auto z-20"
          style={{ paddingTop: '64px', background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
          <div className="p-4">
            <div className="flex items-center gap-3 mb-5 p-3 rounded-[14px]" style={{ background: '#251C4E', border: '1px solid #453775' }}>
              <div className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0" style={{ background: '#A78BFF' }}>
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
                </svg>
              </div>
              <div className="min-w-0">
                <div className="font-bold text-[13.5px] truncate" style={{ color: 'var(--text)' }}>{profile.name}</div>
                <div className="text-[11.5px] font-semibold" style={{ color: '#A78BFF' }}>Moderator</div>
              </div>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              {[
                { label: 'Dreams',      value: stats.pendingDreams,       bg: '#3A2D12', color: '#FFC97A' },
                { label: 'Requests',    value: stats.pendingFulfillments, bg: '#12204A', color: '#5B8DFF' },
                { label: 'Completions', value: stats.pendingCompletions,  bg: '#2B1A10', color: '#FF9D5C' },
                { label: 'Reports',     value: stats.pendingReports,      bg: '#3A181E', color: '#FF9D9D' },
              ].map(s => (
                <div key={s.label} className="p-3 rounded-[12px] text-center" style={{ background: s.bg }}>
                  <div className="text-xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[10px] font-bold mt-0.5" style={{ color: s.color, opacity: 0.7 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <p className="text-[10.5px] font-bold uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--text-4)' }}>Navigation</p>
            <nav className="space-y-0.5">
              {SIDEBAR_ITEMS.map(item => {
                const active = section === item.key;
                const count = item.badgeKey ? (stats[item.badgeKey] || 0) : 0;
                return (
                  <button key={item.key} onClick={() => setSection(item.key)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-left transition-all text-[13px]"
                    style={{
                      background: active ? 'var(--navy)' : 'transparent',
                      color: active ? 'white' : 'var(--text-2)',
                      fontWeight: active ? 700 : 600,
                    }}>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon}/>
                    </svg>
                    <span className="flex-1">{item.label}</span>
                    {count > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold"
                        style={{
                          background: active ? 'rgba(255,255,255,0.2)' : (item.key === 'completions' ? '#2B1A10' : '#3A2D12'),
                          color: active ? 'white' : (item.key === 'completions' ? '#FF9D5C' : '#FFC97A'),
                        }}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Mobile bottom bar */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 flex z-40"
          style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
          {SIDEBAR_ITEMS.slice(0, 5).map((item) => {
            const count = item.badgeKey ? (stats[item.badgeKey] || 0) : 0;
            return (
              <button key={item.key} onClick={() => setSection(item.key)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-[9.5px] font-medium transition-colors relative ${
                  section === item.key ? 'text-[#B79CFF]' : 'text-[#5F6F9C]'
                }`}>
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon}/>
                </svg>
                <span>{item.label.split(' ')[0]}</span>
                {count > 0 && <span className="absolute top-2 right-1/4 w-4 h-4 bg-[#FF5C5C] text-white text-[9px] font-bold rounded-full flex items-center justify-center">{count}</span>}
              </button>
            );
          })}
        </div>

        <div className="hidden lg:block flex-shrink-0" style={{ width: '230px' }} />

        {/* Main Content */}
        <main className="flex-1 min-w-0 px-4 lg:px-8 pt-8 pb-28 lg:pb-8">

          {/* DREAM QUEUE */}
          {section === 'queue' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text)', letterSpacing: '-0.03em' }}>Dream Queue</h1>
                  <p className="text-[13px] mt-1" style={{ color: 'var(--text-3)' }}>Review and moderate submitted dreams</p>
                </div>
                <span className="px-3 py-1.5 bg-[#3A2D12] text-[#FFB648] text-sm font-bold rounded-xl border border-[#6E5620]">{stats.pendingDreams} pending</span>
              </div>
              {pendingDreams.length === 0 ? (
                <div className="card-white"><Empty title="Queue is clear!" sub="All dreams have been reviewed."/></div>
              ) : (
                <AnimatePresence>
                  <div className="space-y-4">
                    {pendingDreams.map((dream) => (
                      <motion.div key={dream.id} layout exit={{ opacity: 0, scale: 0.97 }} className="card-white p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="font-bold text-[#E9EEFF] text-lg">{dream.title}</h3>
                              <span className="px-2.5 py-0.5 bg-[#101A33] text-[#8B9AC2] text-xs font-semibold rounded-full">{dream.category}</span>
                              {dream.urgency !== 'normal' && (
                                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${URGENCY_CONFIG[dream.urgency]?.color}`}>
                                  {dream.urgency}
                                </span>
                              )}
                            </div>
                            <p className="text-[#8B9AC2] text-sm leading-relaxed line-clamp-3 mb-3">{dream.story}</p>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-[#5F6F9C]">
                              <span className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-lg bg-[#1A2C5C] flex items-center justify-center text-[#7FA8FF] font-bold text-[10px]">{dream.dreamer_name?.[0]}</div>
                                Trust: {dream.trust_score}
                              </span>
                              {dream.timeline && <span>Timeline: {dream.timeline}</span>}
                              {dream.country && <span>{dream.country}</span>}
                              <span>{new Date(dream.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <button onClick={() => { setModal(dream); setNotes(''); setBadge('none'); }}
                              className="px-4 py-2.5 bg-[#0B1222] text-white text-sm font-semibold rounded-xl hover:bg-[#16213F] transition-colors">
                              Review
                            </button>
                            <button onClick={() => setNoteModal({ id: dream.id, type: 'dream', title: dream.title })}
                              className="px-4 py-2 bg-[#101A33] text-[#B5C2E4] text-sm font-semibold rounded-xl hover:bg-[#22315A] transition-colors">
                              Add Note
                            </button>
                            <button onClick={() => setEscalateModal({ id: dream.id, type: 'dream', title: dream.title })}
                              className="px-4 py-2 bg-[#2B1218] text-[#FF6E6E] border border-[#6E2833] text-sm font-semibold rounded-xl hover:bg-[#3A181E] transition-colors">
                              Escalate
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </div>
          )}

          {/* FULFILLMENT REQUESTS */}
          {section === 'fulfillments' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text)', letterSpacing: '-0.03em' }}>Fulfillment Requests</h1>
                  <p className="text-[13px] mt-1" style={{ color: 'var(--text-3)' }}>Review fulfiller applications</p>
                </div>
              </div>
              {pendingFulfillments.length === 0 ? (
                <div className="card-white"><Empty title="No pending requests" sub="All fulfillment requests have been reviewed."/></div>
              ) : (
                <AnimatePresence>
                  <div className="space-y-4">
                    {pendingFulfillments.map((req) => (
                      <motion.div key={req.id} layout exit={{ opacity: 0, scale: 0.97 }} className="card-white p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-xs text-[#5F6F9C] mb-1">For dream: <span className="font-bold text-[#B5C2E4]">{req.dream_title}</span></p>
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-xl bg-[#1A2C5C] flex items-center justify-center text-[#7FA8FF] font-black">{req.fulfiller_name?.[0]}</div>
                              <div>
                                <div className="font-bold text-[#D6DEF5]">{req.fulfiller_name}</div>
                                <div className="text-xs text-[#5F6F9C]">Trust: {req.trust_score} · {req.fulfilled_count} fulfilled</div>
                              </div>
                            </div>
                            {req.why_help && (
                              <div className="mb-3">
                                <p className="text-xs font-bold text-[#B5C2E4] mb-1">Why they want to help:</p>
                                <p className="text-sm text-[#8B9AC2] bg-[#0E1730] p-3 rounded-xl border border-[#16213F]">{req.why_help}</p>
                              </div>
                            )}
                            {req.how_fulfill && (
                              <div>
                                <p className="text-xs font-bold text-[#B5C2E4] mb-1">How they'll fulfill it:</p>
                                <p className="text-sm text-[#8B9AC2] bg-[#0E1730] p-3 rounded-xl border border-[#16213F]">{req.how_fulfill}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <button onClick={() => handleFulfillmentAction(req.id, 'approve')} disabled={loading}
                              className="px-4 py-2 bg-[#24C892] text-white text-sm font-semibold rounded-xl hover:bg-[#1FA87C] transition-colors disabled:opacity-60">
                              Approve
                            </button>
                            <button onClick={() => handleFulfillmentAction(req.id, 'reject')} disabled={loading}
                              className="px-4 py-2 bg-[#2B1218] text-[#FF6E6E] border border-[#6E2833] text-sm font-semibold rounded-xl hover:bg-[#3A181E] transition-colors disabled:opacity-60">
                              Reject
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </div>
          )}

          {/* PENDING COMPLETIONS */}
          {section === 'completions' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text)', letterSpacing: '-0.03em' }}>Pending Completions</h1>
                  <p className="text-[13px] mt-1" style={{ color: 'var(--text-3)' }}>Review fulfillment completion requests and notify dreamers</p>
                </div>
                {stats.pendingCompletions > 0 && (
                  <span className="px-3 py-1.5 text-sm font-bold rounded-xl border"
                    style={{ background: '#2B1A10', color: '#FF9D5C', borderColor: '#6E4420' }}>
                    {stats.pendingCompletions} pending
                  </span>
                )}
              </div>

              {/* Phase guide */}
              <div className="card-white p-5 mb-6">
                <p className="text-[12px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-4)' }}>Verification Workflow</p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { step: '1', label: 'Fulfiller submits completion', done: true },
                    { step: '2', label: 'Moderator reviews proof', done: false },
                    { step: '3', label: 'Notify dreamer to confirm', done: false },
                    { step: '4', label: 'Dreamer confirms or requests more support', done: false },
                    { step: '5', label: 'Case closed & archived', done: false },
                  ].map(({ step, label, done }) => (
                    <div key={step} className="flex items-center gap-2 px-3 py-2 rounded-[10px] text-[12px]"
                      style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 ${done ? 'bg-[#24C892] text-white' : 'bg-[#101A33] text-[#5F6F9C]'}`}>
                        {done ? '✓' : step}
                      </div>
                      <span style={{ color: done ? '#7BEFC9' : 'var(--text-3)' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {completions.length === 0 ? (
                <div className="card-white"><Empty title="No pending completions" sub="All fulfillment completions have been processed."/></div>
              ) : (
                <AnimatePresence>
                  <div className="space-y-4">
                    {completions.map((comp) => {
                      const isDreamerNotified = comp.status === 'dreamer_notified';
                      return (
                        <motion.div key={comp.id} layout exit={{ opacity: 0, scale: 0.97 }}
                          className="card-white p-6"
                          style={isDreamerNotified ? { border: '1.5px solid #1D5C48' } : { border: '1.5px solid #6E4420' }}>

                          {/* Header row */}
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="font-bold text-[#E9EEFF] text-[15px]">{comp.dream_title}</h3>
                                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full border"
                                  style={{
                                    background: isDreamerNotified ? '#0A2B22' : '#2B1A10',
                                    color: isDreamerNotified ? '#7BEFC9' : '#FF9D5C',
                                    borderColor: isDreamerNotified ? '#1D5C48' : '#6E4420',
                                  }}>
                                  {isDreamerNotified ? '✓ Dreamer Notified' : '⏳ Pending Review'}
                                </span>
                              </div>
                              <p className="text-xs text-[#5F6F9C]">
                                Submitted {new Date(comp.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Fulfiller info */}
                            <div className="p-3 rounded-[12px]" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                              <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-4)' }}>Fulfiller</p>
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-[10px] bg-[#1A2C5C] flex items-center justify-center text-[#7FA8FF] font-black text-[13px] flex-shrink-0">
                                  {comp.fulfiller_name?.[0]}
                                </div>
                                <div>
                                  <div className="font-bold text-[#D6DEF5] text-[13px]">{comp.fulfiller_name}</div>
                                  <div className="text-[11px] text-[#5F6F9C]">Trust: {comp.trust_score} · {comp.fulfilled_count} fulfilled</div>
                                </div>
                              </div>
                            </div>

                            {/* Dreamer info */}
                            <div className="p-3 rounded-[12px]" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                              <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-4)' }}>Dreamer</p>
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-[10px] bg-[#251C4E] flex items-center justify-center text-[#B79CFF] font-black text-[13px] flex-shrink-0">
                                  {comp.dreamer_name?.[0]}
                                </div>
                                <div>
                                  <div className="font-bold text-[#D6DEF5] text-[13px]">{comp.dreamer_name}</div>
                                  <div className="text-[11px] text-[#5F6F9C]">Awaiting confirmation</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Fulfillment note */}
                          {comp.note && (
                            <div className="mb-4">
                              <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-4)' }}>Fulfillment Note</p>
                              <p className="text-[13.5px] text-[#B5C2E4] leading-relaxed bg-[#0E1730] p-3 rounded-[12px] border border-[#16213F]">
                                {comp.note}
                              </p>
                            </div>
                          )}

                          {/* Proof link */}
                          {comp.proof_url && (
                            <div className="mb-4">
                              <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-4)' }}>Proof / Supporting Details</p>
                              <a href={comp.proof_url} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#6495FF] hover:text-[#93B5FF] transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/>
                                </svg>
                                View Proof
                              </a>
                            </div>
                          )}

                          {/* Audit steps */}
                          <div className="mb-4 p-3 rounded-[12px]" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                            <p className="text-[11px] font-bold uppercase tracking-wider mb-2.5" style={{ color: 'var(--text-4)' }}>Audit Trail</p>
                            <div className="space-y-2">
                              <AuditStep label="Fulfiller submitted completion request" done={true} />
                              <AuditStep label="Moderator reviewed proof" done={!!comp.moderator_uid} />
                              <AuditStep label="Dreamer notified for confirmation" done={isDreamerNotified} />
                              <AuditStep label="Dreamer confirmed fulfillment" done={false} />
                              <AuditStep label="Case closed and archived" done={false} />
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3">
                            {!isDreamerNotified ? (
                              <button
                                onClick={() => handleNotifyDreamer(comp.id)}
                                disabled={loading}
                                className="flex items-center gap-2 px-5 py-2.5 text-white font-bold text-sm rounded-xl transition-all disabled:opacity-60"
                                style={{ background: 'linear-gradient(135deg, #2CE5A7 0%, #24C892 100%)', boxShadow: '0 4px 12px rgba(44,229,167,0.25)' }}>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
                                </svg>
                                Notify Dreamer for Confirmation
                              </button>
                            ) : (
                              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                                style={{ background: '#0A2B22', border: '1px solid #1D5C48' }}>
                                <svg className="w-4 h-4 text-[#2CE5A7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <span className="text-[13px] font-semibold text-[#2CE5A7]">Dreamer notified — awaiting confirmation</span>
                              </div>
                            )}
                            <button onClick={() => setNoteModal({ id: comp.dream_id, type: 'dream', title: comp.dream_title })}
                              className="px-4 py-2.5 bg-[#101A33] text-[#B5C2E4] text-sm font-semibold rounded-xl hover:bg-[#22315A] transition-colors">
                              Add Note
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </AnimatePresence>
              )}
            </div>
          )}

          {/* REPORTS */}
          {section === 'reports' && (
            <div>
              <h1 className="text-2xl font-black text-[#E9EEFF] mb-6">Reports</h1>
              {reports.length === 0 ? (
                <div className="card-white"><Empty title="No pending reports" sub="Community looks healthy."/></div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="card-white p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-[#E9EEFF] mb-1">{report.dream_title}</h3>
                          <span className="inline-block px-2.5 py-0.5 bg-[#2B1218] text-[#FF6E6E] border border-[#4A1F28] text-xs font-bold rounded-full mb-2">{report.reason}</span>
                          {report.details && <p className="text-sm text-[#8B9AC2] leading-relaxed mb-2">{report.details}</p>}
                          <p className="text-xs text-[#5F6F9C]">By {report.reporter_name} · {new Date(report.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <button onClick={() => handleReportAction(report.id, 'actioned')}
                            className="px-4 py-2 bg-[#FF5C5C] text-white text-sm font-semibold rounded-xl hover:bg-[#E04848] transition-colors">Take Action</button>
                          <button onClick={() => handleReportAction(report.id, 'dismissed')}
                            className="px-4 py-2 bg-[#101A33] text-[#8B9AC2] text-sm font-semibold rounded-xl hover:bg-[#22315A] transition-colors">Dismiss</button>
                          <button onClick={() => setEscalateModal({ id: report.id, type: 'report', title: report.dream_title })}
                            className="px-4 py-2 bg-[#1D1640] text-[#B79CFF] border border-[#453775] text-sm font-semibold rounded-xl hover:bg-[#251C4E] transition-colors">Escalate</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ESCALATIONS */}
          {section === 'escalations' && (
            <div>
              <h1 className="text-2xl font-black text-[#E9EEFF] mb-6">Escalations</h1>
              <div className="bg-[#0B1222] rounded-2xl border border-[#16213F] shadow-card p-8 text-center">
                <p className="text-[#8B9AC2] text-sm">Escalations you create are sent to the admin for review. Use the Escalate button on any dream, request, or report to flag critical issues.</p>
              </div>
            </div>
          )}

          {/* FLAGGED USERS */}
          {section === 'flagged' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text)', letterSpacing: '-0.03em' }}>Flagged Users</h1>
                <p className="text-[13px] mt-1" style={{ color: 'var(--text-3)' }}>Users with low trust scores</p>
              </div>
              {flaggedUsers.length === 0 ? (
                <div className="card-white"><Empty title="No flagged users" sub="All users have healthy trust scores."/></div>
              ) : (
                <div className="space-y-3">
                  {flaggedUsers.map((u) => (
                    <div key={u.uid} className="card-white p-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#3A181E] flex items-center justify-center text-[#FF8F8F] font-bold">{u.name?.[0]}</div>
                        <div>
                          <div className="font-bold text-[#E9EEFF]">{u.name}</div>
                          <div className="text-xs text-[#5F6F9C]">{u.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-black text-[#FF6E6E]">{u.trust_score}</div>
                          <div className="text-xs text-[#5F6F9C]">Trust</div>
                        </div>
                        <button onClick={() => setEscalateModal({ id: u.uid, type: 'user', title: u.name })}
                          className="px-3 py-2 bg-[#2B1218] text-[#FF6E6E] border border-[#6E2833] text-sm font-semibold rounded-xl hover:bg-[#3A181E] transition-colors">
                          Escalate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Review Dream Modal */}
      <Modal open={!!modal} onClose={() => { setModal(null); setNotes(''); setBadge('none'); }} title="Review Dream" size="lg">
        {modal && (
          <div className="space-y-4">
            <div className="p-5 bg-[#0E1730] rounded-2xl border border-[#16213F]">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="font-bold text-[#E9EEFF]">{modal.title}</h3>
                <span className="px-2.5 py-0.5 bg-[#0B1222] border border-[#1B2745] text-[#8B9AC2] text-xs font-semibold rounded-full">{modal.category}</span>
                {modal.urgency !== 'normal' && <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${URGENCY_CONFIG[modal.urgency]?.color}`}>{modal.urgency}</span>}
              </div>
              <p className="text-sm text-[#8B9AC2] leading-relaxed">{modal.story}</p>
              <div className="flex gap-4 mt-3 text-xs text-[#5F6F9C]">
                {modal.timeline && <span>Timeline: {modal.timeline}</span>}
                {modal.country && <span>{modal.country}</span>}
                <span>Trust: {modal.trust_score}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#B5C2E4] mb-2">Assign Badge (optional)</label>
              <div className="flex flex-wrap gap-2">
                {BADGE_OPTIONS.map((b) => (
                  <button key={b} onClick={() => setBadge(b)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all capitalize ${badge === b ? 'border-[#3D7BFF] bg-[#3D7BFF] text-white' : 'border-[#1B2745] text-[#8B9AC2] hover:border-[#2C3D6E]'}`}>
                    {b.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#B5C2E4] mb-2">
                Moderator Notes <span className="text-[#5F6F9C] font-normal">(required for rejection)</span>
              </label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                placeholder="Add feedback for the dreamer..." className="input resize-none"/>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleDreamAction('reject')} disabled={loading}
                className="flex-1 py-3 bg-[#2B1218] text-[#FF6E6E] border border-[#6E2833] font-semibold rounded-2xl hover:bg-[#3A181E] transition-colors text-sm disabled:opacity-60">
                Reject
              </button>
              <button onClick={() => handleDreamAction('approve')} disabled={loading}
                className="flex-1 py-3 bg-[#24C892] text-white font-bold rounded-2xl hover:bg-[#1FA87C] transition-colors text-sm disabled:opacity-60">
                {loading ? 'Processing…' : 'Approve & Publish'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!noteModal} onClose={() => { setNoteModal(null); setNoteText(''); }} title="Add Case Note">
        {noteModal && (
          <div className="space-y-4">
            <p className="text-sm text-[#8B9AC2]">Adding note to: <strong>{noteModal.title}</strong></p>
            <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={4}
              placeholder="Write your case note..." className="input resize-none"/>
            <div className="flex gap-3">
              <button onClick={() => { setNoteModal(null); setNoteText(''); }} className="flex-1 py-3 bg-[#101A33] text-[#B5C2E4] font-semibold rounded-2xl hover:bg-[#22315A] transition-colors text-sm">Cancel</button>
              <button onClick={handleAddNote} className="flex-1 py-3 bg-[#3D7BFF] text-white font-semibold rounded-2xl hover:bg-[#5B8DFF] transition-colors text-sm">Save Note</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!escalateModal} onClose={() => { setEscalateModal(null); setEscalateReason(''); }} title="Escalate to Admin">
        {escalateModal && (
          <div className="space-y-4">
            <p className="text-sm text-[#8B9AC2]">Escalating: <strong>{escalateModal.title}</strong></p>
            <textarea value={escalateReason} onChange={(e) => setEscalateReason(e.target.value)} rows={4}
              placeholder="Describe the reason for escalation..." className="input resize-none"/>
            <div className="flex gap-3">
              <button onClick={() => { setEscalateModal(null); setEscalateReason(''); }} className="flex-1 py-3 bg-[#101A33] text-[#B5C2E4] font-semibold rounded-2xl hover:bg-[#22315A] transition-colors text-sm">Cancel</button>
              <button onClick={handleEscalate} className="flex-1 py-3 bg-[#FF5C5C] text-white font-semibold rounded-2xl hover:bg-[#E04848] transition-colors text-sm">Escalate</button>
            </div>
          </div>
        )}
      </Modal>

      <AnimatePresence>{toast && <Toast msg={toast}/>}</AnimatePresence>
    </div>
  );
}
