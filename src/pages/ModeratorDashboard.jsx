import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Navbar from '../components/layout/Navbar';

const TABS = [
  { label: 'Pending Dreams', key: 'dreams', icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
    </svg>
  )},
  { label: 'Fulfillment Requests', key: 'fulfillments', icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
    </svg>
  )},
  { label: 'Reports', key: 'reports', icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l1.664 9.526A2 2 0 006.636 14h10.728a2 2 0 001.972-1.474L21 3M3 3h18M3 3l-1 6"/>
    </svg>
  )},
];

const MOCK_PENDING = [
  { id: '1', title: 'Start a Coding Bootcamp', story: 'I want to learn programming to change careers and support my family better. I have been trying self-study but need structured guidance from someone in the industry who can show me the right path forward.', category: 'Technology', timeline: '3-6 months', dreamer_name: 'Anonymous User', trust_score: 100, created_at: new Date().toISOString() },
  { id: '2', title: 'Get Medical Help for My Mother', story: 'My mother has been suffering from a chronic condition that requires specialist treatment. We cannot afford the costs and I dream of finding someone who can help navigate the healthcare system and connect us to the right resources.', category: 'Health', timeline: '1-3 months', dreamer_name: 'Anonymous User', trust_score: 100, created_at: new Date().toISOString() },
];

const MOCK_FULFILLMENTS = [
  { id: '1', dream_title: 'Start a Coding Bootcamp', dream_category: 'Technology', fulfiller_name: 'John D.', fulfiller_email: 'john@example.com', trust_score: 95, message: 'I am a senior software engineer with 10 years experience. I would love to mentor this person through their coding journey.', status: 'pending', created_at: new Date().toISOString() },
];

const MOCK_REPORTS = [
  { id: '1', dream_title: 'Travel to Japan', reason: 'Spam content', reporter_name: 'User123', status: 'pending', created_at: new Date().toISOString() },
];

function EmptyState({ title, sub }) {
  return (
    <div className="p-16 text-center">
      <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <p className="text-slate-700 font-semibold">{title}</p>
      <p className="text-slate-400 text-sm mt-1">{sub}</p>
    </div>
  );
}

export default function ModeratorDashboard() {
  const { profile } = useAuth();
  const [tab, setTab] = useState(0);
  const [pendingDreams, setPendingDreams] = useState(MOCK_PENDING);
  const [pendingFulfillments, setPendingFulfillments] = useState(MOCK_FULFILLMENTS);
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [stats, setStats] = useState({ pendingDreams: 2, pendingFulfillments: 1, pendingReports: 1 });
  const [modal, setModal] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [dreamsRes, fulfillRes, reportsRes, statsRes] = await Promise.allSettled([
        api.mod.getPendingDreams(), api.mod.getPendingFulfillments(),
        api.mod.getReports(), api.mod.getStats(),
      ]);
      if (dreamsRes.status === 'fulfilled' && dreamsRes.value.dreams?.length > 0) setPendingDreams(dreamsRes.value.dreams);
      if (fulfillRes.status === 'fulfilled' && fulfillRes.value.requests?.length > 0) setPendingFulfillments(fulfillRes.value.requests);
      if (reportsRes.status === 'fulfilled' && reportsRes.value.reports?.length > 0) setReports(reportsRes.value.reports);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
    } catch {}
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleDreamAction = async (action) => {
    if (action === 'reject' && !notes.trim()) return showToast('Please add a note explaining the rejection.');
    setLoading(true);
    try {
      if (action === 'approve') await api.mod.approveDream(modal.id, notes);
      else await api.mod.rejectDream(modal.id, notes);
      setPendingDreams((d) => d.filter((dr) => dr.id !== modal.id));
      setStats((s) => ({ ...s, pendingDreams: Math.max(0, s.pendingDreams - 1) }));
      setModal(null); setNotes('');
      showToast(`Dream ${action === 'approve' ? 'approved and published' : 'rejected'}.`);
    } catch (err) { showToast(err.message || 'Action failed.'); }
    setLoading(false);
  };

  const handleFulfillmentAction = async (id, action) => {
    try {
      if (action === 'approve') await api.mod.approveFulfillment(id, '');
      else await api.mod.rejectFulfillment(id, 'Does not meet requirements');
      setPendingFulfillments((f) => f.filter((r) => r.id !== id));
      setStats((s) => ({ ...s, pendingFulfillments: Math.max(0, s.pendingFulfillments - 1) }));
      showToast(`Fulfillment request ${action}d.`);
    } catch {}
  };

  const handleReportAction = async (id, status) => {
    try {
      await api.mod.reviewReport(id, status);
      setReports((r) => r.filter((rp) => rp.id !== id));
      setStats((s) => ({ ...s, pendingReports: Math.max(0, s.pendingReports - 1) }));
      showToast('Report reviewed.');
    } catch {}
  };

  if (!profile || !['moderator', 'admin'].includes(profile.role)) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Header */}
      <div className="gradient-navy pt-20">
        <div className="w-full max-w-6xl mx-auto px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Moderator Dashboard</h1>
              <p className="text-slate-400 text-sm">Review dreams, fulfillers, and community reports</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto px-6 lg:px-8 pb-16">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 -mt-5 mb-8">
          {[
            { label: 'Pending Dreams', value: stats.pendingDreams, color: 'bg-amber-50 border-amber-100', num: 'text-amber-600', dot: 'bg-amber-400' },
            { label: 'Fulfillment Requests', value: stats.pendingFulfillments, color: 'bg-blue-50 border-blue-100', num: 'text-blue-600', dot: 'bg-blue-400' },
            { label: 'Pending Reports', value: stats.pendingReports, color: 'bg-red-50 border-red-100', num: 'text-red-600', dot: 'bg-red-400' },
          ].map((s) => (
            <div key={s.label} className={`bg-white rounded-2xl border shadow-card p-5 ${s.color}`}>
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                <span className="text-xs text-slate-500 font-medium">{s.label}</span>
              </div>
              <div className={`text-3xl font-black ${s.num}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-100 rounded-2xl p-1.5 mb-6 shadow-card">
          {TABS.map((t, i) => (
            <button key={t.key} onClick={() => setTab(i)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                tab === i ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}>
              {t.icon}
              <span className="hidden sm:block">{t.label}</span>
              {i === 0 && stats.pendingDreams > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${tab === 0 ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-600'}`}>
                  {stats.pendingDreams}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Pending Dreams */}
        {tab === 0 && (
          <AnimatePresence mode="popLayout">
            {pendingDreams.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
                <EmptyState title="Queue is clear!" sub="All submitted dreams have been reviewed." />
              </div>
            ) : (
              <div className="space-y-4">
                {pendingDreams.map((dream) => (
                  <motion.div key={dream.id} layout
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
                    className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-bold text-slate-900 text-lg">{dream.title}</h3>
                          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">{dream.category}</span>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed mb-3 line-clamp-3">{dream.story}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                          {dream.timeline && <span>Timeline: {dream.timeline}</span>}
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
                            </svg>
                            Trust: {dream.trust_score}
                          </span>
                          <span>{new Date(dream.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                      <button onClick={() => setModal({ ...dream, action: 'review' })}
                        className="flex-shrink-0 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors">
                        Review
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        )}

        {/* Fulfillment Requests */}
        {tab === 1 && (
          <AnimatePresence mode="popLayout">
            {pendingFulfillments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
                <EmptyState title="No pending requests" sub="All fulfillment requests have been reviewed." />
              </div>
            ) : (
              <div className="space-y-4">
                {pendingFulfillments.map((req) => (
                  <motion.div key={req.id} layout
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
                    className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-xs text-slate-400 mb-1">Request to fulfill:</p>
                        <h3 className="font-bold text-slate-900 text-lg mb-3">{req.dream_title}</h3>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                            {req.fulfiller_name?.[0]}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800">{req.fulfiller_name}</div>
                            <div className="text-xs text-slate-400">Trust score: {req.trust_score}/100</div>
                          </div>
                        </div>
                        {req.message && (
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-slate-600 text-sm italic leading-relaxed">"{req.message}"</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button onClick={() => handleFulfillmentAction(req.id, 'approve')}
                          className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
                          Approve
                        </button>
                        <button onClick={() => handleFulfillmentAction(req.id, 'reject')}
                          className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-sm font-semibold rounded-xl hover:bg-red-100 transition-colors">
                          Reject
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        )}

        {/* Reports */}
        {tab === 2 && (
          <AnimatePresence mode="popLayout">
            {reports.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
                <EmptyState title="No pending reports" sub="The community is looking good." />
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <motion.div key={report.id} layout
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
                    className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 mb-1">{report.dream_title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2.5 py-0.5 bg-red-50 text-red-600 border border-red-100 text-xs font-semibold rounded-full">{report.reason}</span>
                        </div>
                        <p className="text-xs text-slate-400">Reported by {report.reporter_name} · {new Date(report.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button onClick={() => handleReportAction(report.id, 'reviewed')}
                          className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors">
                          Take Action
                        </button>
                        <button onClick={() => handleReportAction(report.id, 'dismissed')}
                          className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors">
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Review Dream Modal */}
      <Modal open={!!modal} onClose={() => { setModal(null); setNotes(''); }} title="Review Dream" subtitle="Read carefully before deciding">
        {modal && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="font-bold text-slate-900">{modal.title}</h3>
                <span className="px-2.5 py-0.5 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-full">{modal.category}</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{modal.story}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                {modal.timeline && <span>Timeline: {modal.timeline}</span>}
                <span>Trust: {modal.trust_score}/100</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Moderator Notes
                <span className="text-slate-400 font-normal ml-1">(required for rejection)</span>
              </label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Add feedback for the dreamer (optional for approval, required for rejection)…"
                className="input resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleDreamAction('reject')} disabled={loading}
                className="flex-1 py-3 px-4 bg-red-50 text-red-600 border border-red-200 font-semibold rounded-2xl hover:bg-red-100 transition-colors text-sm disabled:opacity-60">
                Reject
              </button>
              <button onClick={() => handleDreamAction('approve')} disabled={loading}
                className="flex-1 py-3 px-4 bg-emerald-600 text-white font-semibold rounded-2xl hover:bg-emerald-700 transition-colors text-sm disabled:opacity-60 shadow-lg">
                {loading ? 'Processing…' : 'Approve & Publish'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-float text-sm font-medium z-50 whitespace-nowrap">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
