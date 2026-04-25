import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/ui/Modal';
import Navbar from '../components/layout/Navbar';

const URGENCY_CONFIG = {
  critical: { label: 'Critical', color: 'bg-red-100 text-red-700 border-red-200' },
  urgent:   { label: 'Urgent',   color: 'bg-amber-100 text-amber-700 border-amber-200' },
  normal:   { label: 'Normal',   color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const BADGE_OPTIONS = ['none', 'verified', 'urgent', 'community_supported', 'featured', 'mod_recommended'];

const SIDEBAR_ITEMS = [
  { key: 'queue',        label: 'Dream Queue',         badgeKey: 'pendingDreams',        icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z' },
  { key: 'fulfillments', label: 'Fulfillment Requests', badgeKey: 'pendingFulfillments', icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z' },
  { key: 'reports',      label: 'Reports',             badgeKey: 'pendingReports',        icon: 'M3 3l1.664 9.526A2 2 0 006.636 14h10.728a2 2 0 001.972-1.474L21 3M3 3h18' },
  { key: 'escalations',  label: 'Escalations',         badgeKey: 'openEscalations',       icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z' },
  { key: 'flagged',      label: 'Flagged Users',       badgeKey: null,                   icon: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z' },
];

function Empty({ title, sub }) {
  return (
    <div className="p-16 text-center">
      <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <p className="font-semibold text-slate-700">{title}</p>
      <p className="text-slate-400 text-sm mt-1">{sub}</p>
    </div>
  );
}

function Toast({ msg }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-float text-sm font-medium z-50">
      {msg}
    </motion.div>
  );
}

export default function ModeratorDashboard() {
  const { profile } = useAuth();
  const [section, setSection] = useState('queue');
  const [pendingDreams, setPendingDreams] = useState([]);
  const [pendingFulfillments, setPendingFulfillments] = useState([]);
  const [reports, setReports] = useState([]);
  const [flaggedUsers, setFlaggedUsers] = useState([]);
  const [stats, setStats] = useState({ pendingDreams: 0, pendingFulfillments: 0, pendingReports: 0, urgentDreams: 0, openEscalations: 0 });
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
    const [dreamsRes, fulfRes, reportsRes, statsRes, flaggedRes] = await Promise.allSettled([
      api.mod.getPendingDreams(), api.mod.getPendingFulfillments(),
      api.mod.getReports(), api.mod.getStats(), api.mod.getFlaggedUsers(),
    ]);
    if (dreamsRes.status === 'fulfilled') setPendingDreams(dreamsRes.value.dreams || []);
    if (fulfRes.status === 'fulfilled') setPendingFulfillments(fulfRes.value.requests || []);
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
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex pt-16">

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 fixed top-16 bottom-0 overflow-y-auto shadow-sm">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-6 p-3 bg-violet-50 rounded-2xl border border-violet-100">
              <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
                </svg>
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-900 text-sm truncate">{profile.name}</div>
                <div className="text-violet-600 text-xs font-semibold">Moderator</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-5">
              {[
                { label: 'Dreams',    value: stats.pendingDreams,         color: 'bg-amber-50 text-amber-700' },
                { label: 'Requests',  value: stats.pendingFulfillments,   color: 'bg-blue-50 text-blue-700' },
                { label: 'Reports',   value: stats.pendingReports,        color: 'bg-red-50 text-red-700' },
                { label: 'Urgent',    value: stats.urgentDreams,          color: 'bg-orange-50 text-orange-700' },
              ].map((s) => (
                <div key={s.label} className={`p-3 rounded-xl ${s.color} text-center`}>
                  <div className="text-xl font-black">{s.value}</div>
                  <div className="text-[10px] font-semibold mt-0.5 opacity-70">{s.label}</div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2 px-1">Navigation</p>
            <nav className="space-y-0.5">
              {SIDEBAR_ITEMS.map((item) => {
                const count = item.badgeKey ? (stats[item.badgeKey] || 0) : 0;
                return (
                  <button key={item.key} onClick={() => setSection(item.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      section === item.key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon}/>
                    </svg>
                    <span className="flex-1">{item.label}</span>
                    {count > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${section === item.key ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'}`}>
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
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 flex z-40">
          {SIDEBAR_ITEMS.slice(0, 4).map((item) => {
            const count = item.badgeKey ? (stats[item.badgeKey] || 0) : 0;
            return (
              <button key={item.key} onClick={() => setSection(item.key)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-[10px] font-medium transition-colors relative ${
                  section === item.key ? 'text-violet-600' : 'text-slate-400'
                }`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon}/>
                </svg>
                <span>{item.label.split(' ')[0]}</span>
                {count > 0 && <span className="absolute top-2 right-1/4 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 px-4 lg:px-8 pt-8 pb-28 lg:pb-8">

          {/* DREAM QUEUE */}
          {section === 'queue' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Dream Queue</h1>
                  <p className="text-slate-500 text-sm mt-1">Review and moderate submitted dreams</p>
                </div>
                <span className="px-3 py-1.5 bg-amber-100 text-amber-700 text-sm font-bold rounded-xl border border-amber-200">{stats.pendingDreams} pending</span>
              </div>
              {pendingDreams.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-card"><Empty title="Queue is clear!" sub="All dreams have been reviewed."/></div>
              ) : (
                <AnimatePresence>
                  <div className="space-y-4">
                    {pendingDreams.map((dream) => (
                      <motion.div key={dream.id} layout exit={{ opacity: 0, scale: 0.97 }}
                        className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="font-bold text-slate-900 text-lg">{dream.title}</h3>
                              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">{dream.category}</span>
                              {dream.urgency !== 'normal' && (
                                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${URGENCY_CONFIG[dream.urgency]?.color}`}>
                                  {dream.urgency}
                                </span>
                              )}
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-3">{dream.story}</p>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                              <span className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-[10px]">{dream.dreamer_name?.[0]}</div>
                                Trust: {dream.trust_score}
                              </span>
                              {dream.timeline && <span>Timeline: {dream.timeline}</span>}
                              {dream.country && <span>{dream.country}</span>}
                              <span>{new Date(dream.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <button onClick={() => { setModal(dream); setNotes(''); setBadge('none'); }}
                              className="px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors">
                              Review
                            </button>
                            <button onClick={() => setNoteModal({ id: dream.id, type: 'dream', title: dream.title })}
                              className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors">
                              Add Note
                            </button>
                            <button onClick={() => setEscalateModal({ id: dream.id, type: 'dream', title: dream.title })}
                              className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-sm font-semibold rounded-xl hover:bg-red-100 transition-colors">
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
                  <h1 className="text-2xl font-black text-slate-900">Fulfillment Requests</h1>
                  <p className="text-slate-500 text-sm mt-1">Review fulfiller applications</p>
                </div>
              </div>
              {pendingFulfillments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-card"><Empty title="No pending requests" sub="All fulfillment requests have been reviewed."/></div>
              ) : (
                <AnimatePresence>
                  <div className="space-y-4">
                    {pendingFulfillments.map((req) => (
                      <motion.div key={req.id} layout exit={{ opacity: 0, scale: 0.97 }}
                        className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-xs text-slate-400 mb-1">For dream: <span className="font-bold text-slate-700">{req.dream_title}</span></p>
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-black">{req.fulfiller_name?.[0]}</div>
                              <div>
                                <div className="font-bold text-slate-800">{req.fulfiller_name}</div>
                                <div className="text-xs text-slate-400">Trust: {req.trust_score} · {req.fulfilled_count} fulfilled</div>
                              </div>
                            </div>
                            {req.why_help && (
                              <div className="mb-3">
                                <p className="text-xs font-bold text-slate-700 mb-1">Why they want to help:</p>
                                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{req.why_help}</p>
                              </div>
                            )}
                            {req.how_fulfill && (
                              <div>
                                <p className="text-xs font-bold text-slate-700 mb-1">How they'll fulfill it:</p>
                                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{req.how_fulfill}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <button onClick={() => handleFulfillmentAction(req.id, 'approve')} disabled={loading}
                              className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60">
                              Approve
                            </button>
                            <button onClick={() => handleFulfillmentAction(req.id, 'reject')} disabled={loading}
                              className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-sm font-semibold rounded-xl hover:bg-red-100 transition-colors disabled:opacity-60">
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

          {/* REPORTS */}
          {section === 'reports' && (
            <div>
              <h1 className="text-2xl font-black text-slate-900 mb-6">Reports</h1>
              {reports.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-card"><Empty title="No pending reports" sub="Community looks healthy."/></div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900 mb-1">{report.dream_title}</h3>
                          <span className="inline-block px-2.5 py-0.5 bg-red-50 text-red-600 border border-red-100 text-xs font-bold rounded-full mb-2">{report.reason}</span>
                          {report.details && <p className="text-sm text-slate-600 leading-relaxed mb-2">{report.details}</p>}
                          <p className="text-xs text-slate-400">By {report.reporter_name} · {new Date(report.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <button onClick={() => handleReportAction(report.id, 'actioned')}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors">Take Action</button>
                          <button onClick={() => handleReportAction(report.id, 'dismissed')}
                            className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors">Dismiss</button>
                          <button onClick={() => setEscalateModal({ id: report.id, type: 'report', title: report.dream_title })}
                            className="px-4 py-2 bg-violet-50 text-violet-600 border border-violet-200 text-sm font-semibold rounded-xl hover:bg-violet-100 transition-colors">Escalate</button>
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
              <h1 className="text-2xl font-black text-slate-900 mb-6">Escalations</h1>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-8 text-center">
                <p className="text-slate-500 text-sm">Escalations you create are sent to the admin for review. Use the Escalate button on any dream, request, or report to flag critical issues.</p>
              </div>
            </div>
          )}

          {/* FLAGGED USERS */}
          {section === 'flagged' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-black text-slate-900">Flagged Users</h1>
                <p className="text-slate-500 text-sm mt-1">Users with low trust scores</p>
              </div>
              {flaggedUsers.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-card"><Empty title="No flagged users" sub="All users have healthy trust scores."/></div>
              ) : (
                <div className="space-y-3">
                  {flaggedUsers.map((u) => (
                    <div key={u.uid} className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-700 font-bold">{u.name?.[0]}</div>
                        <div>
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-xs text-slate-400">{u.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-black text-red-600">{u.trust_score}</div>
                          <div className="text-xs text-slate-400">Trust</div>
                        </div>
                        <button onClick={() => setEscalateModal({ id: u.uid, type: 'user', title: u.name })}
                          className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 text-sm font-semibold rounded-xl hover:bg-red-100 transition-colors">
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
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="font-bold text-slate-900">{modal.title}</h3>
                <span className="px-2.5 py-0.5 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-full">{modal.category}</span>
                {modal.urgency !== 'normal' && <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${URGENCY_CONFIG[modal.urgency]?.color}`}>{modal.urgency}</span>}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{modal.story}</p>
              <div className="flex gap-4 mt-3 text-xs text-slate-400">
                {modal.timeline && <span>Timeline: {modal.timeline}</span>}
                {modal.country && <span>{modal.country}</span>}
                <span>Trust: {modal.trust_score}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Assign Badge (optional)</label>
              <div className="flex flex-wrap gap-2">
                {BADGE_OPTIONS.map((b) => (
                  <button key={b} onClick={() => setBadge(b)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all capitalize ${badge === b ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    {b.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Moderator Notes <span className="text-slate-400 font-normal">(required for rejection)</span>
              </label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                placeholder="Add feedback for the dreamer..." className="input resize-none"/>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleDreamAction('reject')} disabled={loading}
                className="flex-1 py-3 bg-red-50 text-red-600 border border-red-200 font-semibold rounded-2xl hover:bg-red-100 transition-colors text-sm disabled:opacity-60">
                Reject
              </button>
              <button onClick={() => handleDreamAction('approve')} disabled={loading}
                className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-colors text-sm disabled:opacity-60">
                {loading ? 'Processing…' : 'Approve & Publish'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!noteModal} onClose={() => { setNoteModal(null); setNoteText(''); }} title="Add Case Note">
        {noteModal && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Adding note to: <strong>{noteModal.title}</strong></p>
            <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={4}
              placeholder="Write your case note..." className="input resize-none"/>
            <div className="flex gap-3">
              <button onClick={() => { setNoteModal(null); setNoteText(''); }} className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-2xl hover:bg-slate-200 transition-colors text-sm">Cancel</button>
              <button onClick={handleAddNote} className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition-colors text-sm">Save Note</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!escalateModal} onClose={() => { setEscalateModal(null); setEscalateReason(''); }} title="Escalate to Admin">
        {escalateModal && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Escalating: <strong>{escalateModal.title}</strong></p>
            <textarea value={escalateReason} onChange={(e) => setEscalateReason(e.target.value)} rows={4}
              placeholder="Describe the reason for escalation..." className="input resize-none"/>
            <div className="flex gap-3">
              <button onClick={() => { setEscalateModal(null); setEscalateReason(''); }} className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-2xl hover:bg-slate-200 transition-colors text-sm">Cancel</button>
              <button onClick={handleEscalate} className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-2xl hover:bg-red-700 transition-colors text-sm">Escalate</button>
            </div>
          </div>
        )}
      </Modal>

      <AnimatePresence>{toast && <Toast msg={toast}/>}</AnimatePresence>
    </div>
  );
}
