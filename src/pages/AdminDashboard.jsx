import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Navbar from '../components/layout/Navbar';

const TABS = ['Overview', 'Users', 'Dreams', 'Moderators', 'Audit Log'];

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

function StatCard({ label, value, trend, color = 'blue' }) {
  const colors = { blue: 'from-blue-600 to-blue-700', green: 'from-green-500 to-green-600', purple: 'from-purple-600 to-purple-700', orange: 'from-orange-500 to-orange-600' };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-2xl p-6 text-white`}>
      <div className="text-3xl font-black mb-1">{value.toLocaleString()}</div>
      <div className="text-white/80 text-sm">{label}</div>
      {trend && <div className="text-white/60 text-xs mt-2">{trend}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState(MOCK_STATS);
  const [users, setUsers] = useState(MOCK_USERS);
  const [dreams, setDreams] = useState([]);
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
    if (!promoteUid) return;
    try {
      await api.admin.addModerator(promoteUid);
      setPromoteModal(false); setPromoteUid('');
      showToast('User promoted to moderator.');
      loadData();
    } catch (err) { showToast(err.message); }
  };

  const handleRemoveMod = async (uid) => {
    if (!confirm('Remove moderator role from this user?')) return;
    try {
      await api.admin.removeModerator(uid);
      showToast('Moderator removed.');
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
          <div className="pt-6 mb-8">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black text-blue-900">Admin Dashboard</h1>
              <span className="px-3 py-1 bg-blue-900 text-white text-xs font-bold rounded-full">MASTER ADMIN</span>
            </div>
            <p className="text-gray-500">Full platform governance and control</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white border border-blue-50 rounded-xl p-1 mb-8 overflow-x-auto">
            {TABS.map((t, i) => (
              <button key={t} onClick={() => setTab(i)}
                className={`flex-shrink-0 py-2 px-5 rounded-lg text-sm font-semibold transition-all ${
                  tab === i ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-blue-700'
                }`}>
                {t}
              </button>
            ))}
          </div>

          {/* Overview */}
          {tab === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard label="Total Users" value={stats.totalUsers} color="blue" trend="Platform members" />
                <StatCard label="Dreams Submitted" value={stats.totalDreams} color="purple" trend="All time" />
                <StatCard label="Dreams Published" value={stats.publishedDreams} color="green" trend="Currently live" />
                <StatCard label="Dreams Fulfilled" value={stats.fulfilledDreams} color="orange" trend="Real impact" />
                <StatCard label="Fulfillment Requests" value={stats.totalFulfillments} color="blue" trend="All time" />
                <StatCard label="Pending Reports" value={stats.pendingReports} color="orange" trend="Need review" />
              </div>

              {/* Trust & Safety */}
              <div className="bg-white rounded-2xl border border-blue-50 p-6">
                <h2 className="font-bold text-blue-900 mb-6">Trust & Safety Controls</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Auto-flag threshold', value: 'Trust score < 50', action: 'Configure' },
                    { label: 'Max reports before review', value: '3 reports', action: 'Configure' },
                    { label: 'New user verification', value: 'Manual review', action: 'Configure' },
                  ].map((ctrl) => (
                    <div key={ctrl.label} className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-400">{ctrl.label}</div>
                        <div className="font-semibold text-sm text-blue-900 mt-0.5">{ctrl.value}</div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => showToast('Coming soon')}>
                        {ctrl.action}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform health */}
              <div className="bg-white rounded-2xl border border-blue-50 p-6">
                <h2 className="font-bold text-blue-900 mb-4">Platform Health</h2>
                <div className="space-y-3">
                  {[
                    { label: 'Dream approval rate', value: stats.publishedDreams / Math.max(stats.totalDreams, 1) * 100, color: 'bg-blue-600' },
                    { label: 'Fulfillment success rate', value: stats.fulfilledDreams / Math.max(stats.publishedDreams, 1) * 100, color: 'bg-green-500' },
                    { label: 'User verification rate', value: 73, color: 'bg-purple-500' },
                  ].map((metric) => (
                    <div key={metric.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{metric.label}</span>
                        <span className="font-bold text-blue-900">{Math.round(metric.value)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${metric.color} rounded-full`} style={{ width: `${metric.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Users */}
          {tab === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-white rounded-2xl border border-blue-50 overflow-hidden">
                <div className="px-6 py-4 border-b border-blue-50 flex items-center justify-between">
                  <h2 className="font-bold text-blue-900">All Users ({users.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['User', 'Role', 'Mode', 'Trust', 'Verified', 'Actions'].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {users.map((u) => (
                        <tr key={u.uid} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                                {u.name?.[0]}
                              </div>
                              <div>
                                <div className="font-semibold text-blue-900">{u.name}</div>
                                <div className="text-xs text-gray-400">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4"><Badge label={u.role} type={u.role} /></td>
                          <td className="px-4 py-4 capitalize text-gray-600">{u.mode}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${u.trust_score}%` }} />
                              </div>
                              <span className="text-xs text-gray-500">{u.trust_score}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <button onClick={() => handleVerify(u.uid, u.verified)}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                u.verified ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-400'
                              }`}>
                              {u.verified ? <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : null}
                            </button>
                          </td>
                          <td className="px-4 py-4">
                            <select value={u.role} onChange={(e) => handleUpdateRole(u.uid, e.target.value)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500">
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-white rounded-2xl border border-blue-50 p-6 text-center py-16">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-gray-500 mb-2">Dream management coming from API</p>
                <p className="text-xs text-gray-400">Connect to Cloudflare Workers to see all platform dreams</p>
              </div>
            </motion.div>
          )}

          {/* Moderators */}
          {tab === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setPromoteModal(true)}>+ Add Moderator</Button>
              </div>
              <div className="bg-white rounded-2xl border border-blue-50 overflow-hidden">
                <div className="px-6 py-4 border-b border-blue-50">
                  <h2 className="font-bold text-blue-900">Moderators ({moderators.length})</h2>
                </div>
                {moderators.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">No moderators yet</div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {moderators.map((mod) => (
                      <div key={mod.uid} className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                            {mod.name?.[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-blue-900">{mod.name}</div>
                            <div className="text-xs text-gray-400">{mod.email}</div>
                          </div>
                        </div>
                        <Button size="sm" variant="danger" onClick={() => handleRemoveMod(mod.uid)}>Remove</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Audit Log */}
          {tab === 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-white rounded-2xl border border-blue-50 overflow-hidden">
                <div className="px-6 py-4 border-b border-blue-50">
                  <h2 className="font-bold text-blue-900">Audit Log</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {logs.map((log) => (
                    <div key={log.id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                        <div>
                          <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">{log.action}</span>
                          <span className="text-sm text-gray-600 ml-2">by {log.actor_name}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Promote Modal */}
      <Modal open={promoteModal} onClose={() => setPromoteModal(false)} title="Promote User to Moderator">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-blue-900 mb-2">User UID</label>
            <input value={promoteUid} onChange={(e) => setPromoteUid(e.target.value)}
              placeholder="Enter the user's Firebase UID..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setPromoteModal(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handlePromote}>Promote</Button>
          </div>
        </div>
      </Modal>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-900 text-white px-6 py-3 rounded-2xl shadow-xl text-sm font-medium z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
