import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Navbar from '../components/layout/Navbar';

const TABS = ['Pending Dreams', 'Fulfillment Requests', 'Reports'];

const MOCK_PENDING = [
  { id: '1', title: 'Start a Coding Bootcamp', story: 'I want to learn programming to change careers and support my family better. I have been trying self-study but need structured guidance from someone in the industry.', category: 'Technology', timeline: '3-6 months', dreamer_name: 'Anonymous User', trust_score: 100, created_at: new Date().toISOString() },
  { id: '2', title: 'Get Medical Help for My Mother', story: 'My mother has been suffering from a chronic condition that requires specialist treatment. We cannot afford the costs and I dream of finding someone who can help navigate the healthcare system.', category: 'Health', timeline: '1-3 months', dreamer_name: 'Anonymous User', trust_score: 100, created_at: new Date().toISOString() },
];

const MOCK_FULFILLMENTS = [
  { id: '1', dream_title: 'Start a Coding Bootcamp', dream_category: 'Technology', fulfiller_name: 'John D.', fulfiller_email: 'john@example.com', trust_score: 95, message: 'I am a senior software engineer with 10 years experience. I would love to mentor this person.', status: 'pending', created_at: new Date().toISOString() },
];

const MOCK_REPORTS = [
  { id: '1', dream_title: 'Travel to Japan', reason: 'Spam', reporter_name: 'User123', status: 'pending', created_at: new Date().toISOString() },
];

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
    setLoading(true);
    try {
      if (action === 'approve') await api.mod.approveDream(modal.id, notes);
      else await api.mod.rejectDream(modal.id, notes);
      setPendingDreams((d) => d.filter((dr) => dr.id !== modal.id));
      setModal(null); setNotes('');
      showToast(`Dream ${action}d successfully.`);
    } catch (err) { showToast(err.message); }
    setLoading(false);
  };

  const handleFulfillmentAction = async (id, action) => {
    try {
      if (action === 'approve') await api.mod.approveFulfillment(id, '');
      else await api.mod.rejectFulfillment(id, 'Does not meet requirements');
      setPendingFulfillments((f) => f.filter((r) => r.id !== id));
      showToast(`Fulfillment request ${action}d.`);
    } catch {}
  };

  const handleReportAction = async (id, status) => {
    try {
      await api.mod.reviewReport(id, status);
      setReports((r) => r.filter((rp) => rp.id !== id));
      showToast('Report reviewed.');
    } catch {}
  };

  if (!profile || !['moderator', 'admin'].includes(profile.role)) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="pt-6 mb-8">
            <h1 className="text-3xl font-black text-blue-900">Moderator Dashboard</h1>
            <p className="text-gray-500 mt-1">Review and approve dreams, fulfillers, and reports</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Pending Dreams', value: stats.pendingDreams, color: 'text-yellow-600', bg: 'bg-yellow-50' },
              { label: 'Pending Fulfillments', value: stats.pendingFulfillments, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Pending Reports', value: stats.pendingReports, color: 'text-red-600', bg: 'bg-red-50' },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-2xl p-5 border border-opacity-20`}>
                <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-gray-600 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white border border-blue-50 rounded-xl p-1 mb-6">
            {TABS.map((t, i) => (
              <button key={t} onClick={() => setTab(i)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                  tab === i ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-blue-700'
                }`}>
                {t}
              </button>
            ))}
          </div>

          {/* Pending Dreams */}
          {tab === 0 && (
            <div className="space-y-4">
              {pendingDreams.length === 0 ? (
                <div className="bg-white rounded-2xl border border-blue-50 p-12 text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-gray-500">All dreams reviewed! Queue is clear.</p>
                </div>
              ) : pendingDreams.map((dream) => (
                <motion.div key={dream.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl border border-blue-50 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-blue-900 text-lg">{dream.title}</h3>
                        <Badge label={dream.category} type="user" />
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed mb-3">{dream.story}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>Timeline: {dream.timeline || 'Not specified'}</span>
                        <span>Trust Score: {dream.trust_score}</span>
                        <span>{new Date(dream.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button size="sm" onClick={() => setModal({ ...dream, action: 'review' })}>
                        Review
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Fulfillment Requests */}
          {tab === 1 && (
            <div className="space-y-4">
              {pendingFulfillments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-blue-50 p-12 text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-gray-500">No pending fulfillment requests.</p>
                </div>
              ) : pendingFulfillments.map((req) => (
                <div key={req.id} className="bg-white rounded-2xl border border-blue-50 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-2">
                        <span className="text-xs text-gray-400">For dream:</span>
                        <h3 className="font-bold text-blue-900">{req.dream_title}</h3>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                          {req.fulfiller_name?.[0]}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-800">{req.fulfiller_name}</div>
                          <div className="text-xs text-gray-400">Trust: {req.trust_score}/100</div>
                        </div>
                      </div>
                      {req.message && <p className="text-gray-600 text-sm italic">"{req.message}"</p>}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" variant="secondary" onClick={() => handleFulfillmentAction(req.id, 'reject')}>Reject</Button>
                      <Button size="sm" onClick={() => handleFulfillmentAction(req.id, 'approve')}>Approve</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reports */}
          {tab === 2 && (
            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="bg-white rounded-2xl border border-blue-50 p-12 text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-gray-500">No pending reports.</p>
                </div>
              ) : reports.map((report) => (
                <div key={report.id} className="bg-white rounded-2xl border border-blue-50 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-blue-900 mb-1">{report.dream_title}</h3>
                      <div className="text-sm text-gray-600 mb-1"><strong>Reason:</strong> {report.reason}</div>
                      <div className="text-xs text-gray-400">Reported by: {report.reporter_name} · {new Date(report.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" variant="secondary" onClick={() => handleReportAction(report.id, 'dismissed')}>Dismiss</Button>
                      <Button size="sm" variant="danger" onClick={() => handleReportAction(report.id, 'reviewed')}>Take Action</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Dream Modal */}
      <Modal open={!!modal} onClose={() => { setModal(null); setNotes(''); }} title="Review Dream">
        {modal && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <h3 className="font-bold text-blue-900">{modal.title}</h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{modal.story}</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-blue-900 mb-2">Moderator Notes (required for rejection)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                rows={3} placeholder="Add notes for the dreamer (optional for approval, required for rejection)..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div className="flex gap-3">
              <Button variant="danger" className="flex-1" loading={loading} onClick={() => handleDreamAction('reject')}>Reject</Button>
              <Button className="flex-1" loading={loading} onClick={() => handleDreamAction('approve')}>Approve & Publish</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-900 text-white px-6 py-3 rounded-2xl shadow-xl text-sm font-medium z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
