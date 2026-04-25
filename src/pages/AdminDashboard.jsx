import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Navbar from '../components/layout/Navbar';

const TABS = [
  { label: 'Overview', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z' },
  { label: 'Users', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' },
  { label: 'Dreams', icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z' },
  { label: 'Moderators', icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z' },
  { label: 'Audit Log', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
];

const MOCK_STATS = { totalUsers: 1284, totalDreams: 2467, publishedDreams: 1893, fulfilledDreams: 890, totalFulfillments: 3210, pendingReports: 4 };
const MOCK_USERS = [
  { uid: '1', name: 'Sarah M.', email: 'sarah@example.com', role: 'user', mode: 'dreamer', trust_score: 97, verified: 1, dream_count: 2, created_at: new Date().toISOString() },
  { uid: '2', name: 'James K.', email: 'james@example.com', role: 'user', mode: 'fulfiller', trust_score: 88, verified: 0, fulfilled_count: 5, created_at: new Date().toISOString() },
  { uid: '3', name: 'Amira H.', email: 'amira@example.com', role: 'moderator', mode: 'dreamer', trust_score: 100, verified: 1, created_at: new Date().toISOString() },
];
const MOCK_LOGS = [
  { id: '1', actor_name: 'Admin', action: 'DREAM_APPROVED', target_type: 'dream', created_at: new Date().toISOString() },
  { id: '2', actor_name: 'Moderator A', action: 'FULFILLMENT_REJECTED', target_type: 'fulfillment', created_at: new Date().toISOString() },
  { id: '3', actor_name: 'Admin', action: 'USER_PROMOTED', target_type: 'user', created_at: new Date().toISOString() },
];

const ACTION_COLORS = {
  DREAM_APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  DREAM_REJECTED: 'bg-red-50 text-red-700 border-red-100',
  FULFILLMENT_APPROVED: 'bg-blue-50 text-blue-700 border-blue-100',
  FULFILLMENT_REJECTED: 'bg-orange-50 text-orange-700 border-orange-100',
  USER_PROMOTED: 'bg-violet-50 text-violet-700 border-violet-100',
};

function MetricBar({ label, value, max, color = 'bg-blue-500' }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-slate-600">{label}</span>
        <span className="font-bold text-slate-900">{pct}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState(MOCK_STATS);
  const [users, setUsers] = useState(MOCK_USERS);
  const [logs, setLogs] = useState(MOCK_LOGS);
  const [moderators, setModerators] = useState(MOCK_USERS.filter(u => u.role === 'moderator'));
  const [promoteModal, setPromoteModal] = useState(false);
  const [promoteUid, setPromoteUid] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [statsRes, usersRes, logsRes, modsRes] = await Promise.allSettled([
        api.admin.getStats(), api.admin.getUsers(), api.admin.getAuditLogs(), api.admin.getModerators(),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (usersRes.status === 'fulfilled' && usersRes.value.users?.length > 0) setUsers(usersRes.value.users);
      if (logsRes.status === 'fulfilled' && logsRes.value.logs?.length > 0) setLogs(logsRes.value.logs);
      if (modsRes.status === 'fulfilled' && modsRes.value.moderators?.length > 0) setModerators(modsRes.value.moderators);
    } catch {}
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handlePromote = async () => {
    if (!promoteUid.trim()) return showToast('Please enter a user UID.');
    try {
      await api.admin.addModerator(promoteUid.trim());
      setPromoteModal(false); setPromoteUid('');
      showToast('User promoted to moderator.');
      loadData();
    } catch (err) { showToast(err.message || 'Failed to promote user.'); }
  };

  const handleRemoveMod = async (uid) => {
    if (!window.confirm('Remove moderator role from this user?')) return;
    try {
      await api.admin.removeModerator(uid);
      showToast('Moderator role removed.');
      loadData();
    } catch {}
  };

  const handleUpdateRole = async (uid, role) => {
    try {
      await api.admin.updateUser(uid, { role });
      setUsers((u) => u.map((usr) => usr.uid === uid ? { ...usr, role } : usr));
      showToast('User role updated.');
    } catch {}
  };

  const handleVerify = async (uid, verified) => {
    try {
      await api.admin.updateUser(uid, { verified: !verified });
      setUsers((u) => u.map((usr) => usr.uid === uid ? { ...usr, verified: !verified } : usr));
    } catch {}
  };

  if (!profile || profile.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Header */}
      <div className="gradient-navy pt-20">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
                <span className="px-2.5 py-0.5 bg-rose-600 text-white text-xs font-bold rounded-full">MASTER</span>
              </div>
              <p className="text-slate-400 text-sm">Full platform governance and control</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 pb-16">
        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-100 rounded-2xl p-1.5 mb-8 -mt-5 shadow-card overflow-x-auto">
          {TABS.map((t, i) => (
            <button key={t.label} onClick={() => setTab(i)}
              className={`flex-shrink-0 flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                tab === i ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.icon}/>
              </svg>
              <span className="hidden sm:block">{t.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Overview */}
          {tab === 0 && (
            <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Total Users', value: stats.totalUsers, color: 'from-blue-600 to-blue-700', sub: 'Platform members' },
                  { label: 'Dreams Submitted', value: stats.totalDreams, color: 'from-violet-600 to-violet-700', sub: 'All time' },
                  { label: 'Dreams Published', value: stats.publishedDreams, color: 'from-emerald-500 to-emerald-600', sub: 'Currently live' },
                  { label: 'Dreams Fulfilled', value: stats.fulfilledDreams, color: 'from-rose-500 to-rose-600', sub: 'Real impact' },
                  { label: 'Fulfillment Requests', value: stats.totalFulfillments, color: 'from-amber-500 to-amber-600', sub: 'All time' },
                  { label: 'Pending Reports', value: stats.pendingReports, color: 'from-slate-700 to-slate-800', sub: 'Need review' },
                ].map((s) => (
                  <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-6 text-white shadow-card`}>
                    <div className="text-3xl font-black mb-1">{s.value.toLocaleString()}</div>
                    <div className="text-white/90 font-semibold text-sm">{s.label}</div>
                    <div className="text-white/50 text-xs mt-1">{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Platform health */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
                  <h2 className="font-bold text-slate-900 mb-5">Platform Health</h2>
                  <div className="space-y-4">
                    <MetricBar label="Dream approval rate" value={stats.publishedDreams} max={stats.totalDreams} color="bg-blue-500" />
                    <MetricBar label="Fulfillment success rate" value={stats.fulfilledDreams} max={stats.publishedDreams} color="bg-emerald-500" />
                    <MetricBar label="User verification rate" value={73} max={100} color="bg-violet-500" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
                  <h2 className="font-bold text-slate-900 mb-5">Trust & Safety Controls</h2>
                  <div className="space-y-3">
                    {[
                      { label: 'Auto-flag threshold', value: 'Trust score < 50' },
                      { label: 'Max reports before review', value: '3 reports' },
                      { label: 'New user verification', value: 'Manual review' },
                    ].map((ctrl) => (
                      <div key={ctrl.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <div className="text-xs text-slate-400 font-medium">{ctrl.label}</div>
                          <div className="text-sm font-semibold text-slate-800 mt-0.5">{ctrl.value}</div>
                        </div>
                        <button onClick={() => showToast('Configuration coming soon')}
                          className="px-3 py-1.5 text-xs text-slate-600 font-semibold border border-slate-200 rounded-lg hover:bg-white transition-colors">
                          Edit
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Users */}
          {tab === 1 && (
            <motion.div key="users" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-bold text-slate-900">All Users</h2>
                  <span className="text-xs text-slate-400 font-medium">{users.length} members</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {['User', 'Role', 'Mode', 'Trust Score', 'Verified', 'Actions'].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {users.map((u) => (
                        <tr key={u.uid} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {u.name?.[0]}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900">{u.name}</div>
                                <div className="text-xs text-slate-400">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4"><Badge label={u.role} type={u.role} /></td>
                          <td className="px-4 py-4">
                            <span className="capitalize text-slate-600 text-xs font-medium">{u.mode}</span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${u.trust_score >= 80 ? 'bg-emerald-500' : u.trust_score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${u.trust_score}%` }} />
                              </div>
                              <span className="text-xs text-slate-500 font-medium">{u.trust_score}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <button onClick={() => handleVerify(u.uid, u.verified)}
                              className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                                u.verified ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-emerald-400 bg-white'
                              }`}>
                              {u.verified && (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                                </svg>
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-4">
                            <select value={u.role} onChange={(e) => handleUpdateRole(u.uid, e.target.value)}
                              className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700">
                              <option value="user">User</option>
                              <option value="moderator">Moderator</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Dreams */}
          {tab === 2 && (
            <motion.div key="dreams" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-16 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
                  </svg>
                </div>
                <p className="text-slate-600 font-semibold mb-1">Dream management via API</p>
                <p className="text-slate-400 text-sm">Connect to Cloudflare Workers to view and manage all platform dreams</p>
              </div>
            </motion.div>
          )}

          {/* Moderators */}
          {tab === 3 && (
            <motion.div key="mods" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex justify-end">
                <button onClick={() => setPromoteModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm shadow-blue">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                  </svg>
                  Add Moderator
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-900">Moderators ({moderators.length})</h2>
                </div>
                {moderators.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-sm">No moderators yet. Add someone to help review content.</div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {moderators.map((mod) => (
                      <div key={mod.uid} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white font-bold">
                            {mod.name?.[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{mod.name}</div>
                            <div className="text-xs text-slate-400">{mod.email}</div>
                          </div>
                        </div>
                        <button onClick={() => handleRemoveMod(mod.uid)}
                          className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 text-sm font-semibold rounded-xl hover:bg-red-100 transition-colors">
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Audit Log */}
          {tab === 4 && (
            <motion.div key="audit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-900">Audit Log</h2>
                  <p className="text-slate-400 text-xs mt-0.5">All moderator and admin actions</p>
                </div>
                <div className="divide-y divide-slate-50">
                  {logs.map((log) => (
                    <div key={log.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${ACTION_COLORS[log.action] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                          {log.action}
                        </span>
                        <span className="text-sm text-slate-600">by {log.actor_name}</span>
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {new Date(log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Promote Modal */}
      <Modal open={promoteModal} onClose={() => { setPromoteModal(false); setPromoteUid(''); }} title="Promote to Moderator" subtitle="Enter the Firebase UID of the user">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">User Firebase UID</label>
            <input value={promoteUid} onChange={(e) => setPromoteUid(e.target.value)}
              placeholder="e.g. abc123def456…"
              className="input" />
            <p className="text-xs text-slate-400 mt-1.5">Find the UID in the Users tab or Firebase console</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setPromoteModal(false); setPromoteUid(''); }}
              className="flex-1 py-3 px-4 border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 transition-colors text-sm">
              Cancel
            </button>
            <button onClick={handlePromote}
              className="flex-1 py-3 px-4 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition-colors text-sm shadow-blue">
              Promote
            </button>
          </div>
        </div>
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
