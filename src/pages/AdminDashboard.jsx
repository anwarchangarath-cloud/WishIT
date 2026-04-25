import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/ui/Modal';
import Navbar from '../components/layout/Navbar';

const SIDEBAR = [
  { key: 'overview',    label: 'Overview',         icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z' },
  { key: 'users',       label: 'User Management',  icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' },
  { key: 'dreams',      label: 'Dreams',           icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z' },
  { key: 'moderators',  label: 'Moderators',       icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z' },
  { key: 'escalations', label: 'Escalations',      icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z' },
  { key: 'stories',     label: 'Success Stories',  icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5' },
  { key: 'audit',       label: 'Audit Log',        icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
];

const ACTION_COLORS = {
  DREAM_APPROVED:       'bg-emerald-50 text-emerald-700 border-emerald-100',
  DREAM_REJECTED:       'bg-red-50 text-red-700 border-red-100',
  FULFILLMENT_APPROVED: 'bg-blue-50 text-blue-700 border-blue-100',
  FULFILLMENT_REJECTED: 'bg-orange-50 text-orange-700 border-orange-100',
  USER_SUSPENDED:       'bg-amber-50 text-amber-700 border-amber-100',
  USER_BANNED:          'bg-red-50 text-red-700 border-red-100',
  MODERATOR_PROMOTED:   'bg-violet-50 text-violet-700 border-violet-100',
  ESCALATION_CREATED:   'bg-rose-50 text-rose-700 border-rose-100',
};

function KPI({ label, value, sub, trend, color = 'blue' }) {
  const colors = {
    blue:    'from-blue-600 to-blue-700',
    emerald: 'from-emerald-600 to-emerald-700',
    violet:  'from-violet-600 to-violet-700',
    amber:   'from-amber-500 to-amber-600',
    red:     'from-red-500 to-red-600',
    sky:     'from-sky-500 to-sky-600',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-2xl p-5 text-white`}>
      <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-2">{label}</p>
      <div className="text-4xl font-black mb-1">{value}</div>
      {sub && <p className="text-white/60 text-xs">{sub}</p>}
      {trend != null && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${trend >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={trend >= 0 ? 'M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25' : 'M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25'}/>
          </svg>
          {trend >= 0 ? '+' : ''}{trend} today
        </div>
      )}
    </div>
  );
}

function UserRow({ user, onAction, onEdit }) {
  const roleColors = {
    admin:     'bg-slate-900 text-white',
    moderator: 'bg-violet-100 text-violet-700',
    user:      'bg-slate-100 text-slate-600',
  };
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user.name?.[0]}
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              {user.name}
              {user.verified === 1 && <span className="text-emerald-500 text-[10px]">✓</span>}
              {user.banned === 1 && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[9px] font-bold rounded-full">Banned</span>}
              {user.suspended === 1 && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded-full">Suspended</span>}
            </div>
            <div className="text-xs text-slate-400 truncate max-w-[180px]">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${roleColors[user.role] || roleColors.user}`}>{user.role}</span>
      </td>
      <td className="px-4 py-3.5 text-sm text-slate-600 capitalize">{user.mode}</td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${user.trust_score >= 80 ? 'bg-emerald-400' : user.trust_score >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}/>
          <span className="text-sm font-semibold text-slate-900">{user.trust_score}</span>
        </div>
      </td>
      <td className="px-4 py-3.5 text-xs text-slate-400">{new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(user)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>
          </button>
          {user.banned ? (
            <button onClick={() => onAction('unban', user)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" title="Unban">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </button>
          ) : user.suspended ? (
            <button onClick={() => onAction('unsuspend', user)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" title="Unsuspend">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </button>
          ) : (
            <>
              <button onClick={() => onAction('suspend', user)} className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Suspend">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
              </button>
              <button onClick={() => onAction('ban', user)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Ban">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
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

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [section, setSection] = useState('overview');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [dreams, setDreams] = useState([]);
  const [moderators, setModerators] = useState([]);
  const [logs, setLogs] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [stories, setStories] = useState([]);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);

  // Modals
  const [actionModal, setActionModal] = useState(null);
  const [actionReason, setActionReason] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [promoteModal, setPromoteModal] = useState(false);
  const [promoteUid, setPromoteUid] = useState('');
  const [storyModal, setStoryModal] = useState(false);
  const [storyForm, setStoryForm] = useState({ title: '', story: '', outcome: '', quote: '', dreamer_alias: '', fulfiller_alias: '', category: '', featured: false });

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    const [statsR, usersR, dreamsR, modsR, logsR, escalR, storiesR] = await Promise.allSettled([
      api.admin.getStats(), api.admin.getUsers(), api.admin.getDreams(),
      api.admin.getModerators(), api.admin.getAuditLogs(),
      api.admin.getEscalations(), api.admin.getSuccessStories(),
    ]);
    if (statsR.status === 'fulfilled') setStats(statsR.value);
    if (usersR.status === 'fulfilled') setUsers(usersR.value.users || []);
    if (dreamsR.status === 'fulfilled') setDreams(dreamsR.value.dreams || []);
    if (modsR.status === 'fulfilled') setModerators(modsR.value.moderators || []);
    if (logsR.status === 'fulfilled') setLogs(logsR.value.logs || []);
    if (escalR.status === 'fulfilled') setEscalations(escalR.value.escalations || []);
    if (storiesR.status === 'fulfilled') setStories(storiesR.value.stories || []);
    setLoading(false);
  };

  const handleAction = async () => {
    if (!actionReason.trim() && ['suspend', 'ban'].includes(actionModal.type)) return showToast('Please provide a reason.');
    setLoading(true);
    try {
      if (actionModal.type === 'suspend') await api.admin.suspendUser(actionModal.user.uid, actionReason);
      else if (actionModal.type === 'unsuspend') await api.admin.unsuspendUser(actionModal.user.uid);
      else if (actionModal.type === 'ban') await api.admin.banUser(actionModal.user.uid, actionReason);
      else if (actionModal.type === 'unban') await api.admin.unbanUser(actionModal.user.uid);
      setActionModal(null); setActionReason('');
      showToast(`User ${actionModal.type}ned successfully.`);
      loadAll();
    } catch (err) { showToast(err.message || 'Action failed.'); }
    setLoading(false);
  };

  const handleEditUser = async () => {
    setLoading(true);
    try {
      await api.admin.updateUser(editModal.uid, editForm);
      setEditModal(null); setEditForm({});
      showToast('User updated.');
      loadAll();
    } catch (err) { showToast(err.message || 'Update failed.'); }
    setLoading(false);
  };

  const handlePromote = async () => {
    if (!promoteUid.trim()) return showToast('Please enter a user UID.');
    try {
      await api.admin.addModerator(promoteUid.trim());
      setPromoteModal(false); setPromoteUid('');
      showToast('User promoted to moderator.');
      loadAll();
    } catch (err) { showToast(err.message || 'Promotion failed.'); }
  };

  const handleRemoveMod = async (uid) => {
    if (!confirm('Remove moderator role from this user?')) return;
    try { await api.admin.removeModerator(uid); showToast('Moderator role removed.'); loadAll(); } catch {}
  };

  const handleResolveEscalation = async (id, status) => {
    try { await api.admin.resolveEscalation(id, status, ''); showToast(`Escalation ${status}.`); loadAll(); } catch {}
  };

  const handleAddStory = async () => {
    try { await api.admin.addSuccessStory(storyForm); setStoryModal(false); showToast('Story added!'); loadAll(); } catch {}
  };

  const handleDeleteDream = async (id) => {
    if (!confirm('Permanently delete this dream?')) return;
    try { await api.admin.deleteDream(id); showToast('Dream deleted.'); loadAll(); } catch {}
  };

  const filteredUsers = users.filter((u) =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (!profile || profile.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex pt-16">

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 fixed top-16 bottom-0 overflow-y-auto shadow-sm">
          <div className="p-5">
            {/* Admin Badge */}
            <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-black">{profile.name?.[0]}</div>
                <div>
                  <div className="text-white font-bold text-sm">{profile.name}</div>
                  <div className="text-slate-400 text-xs font-semibold">Master Admin</div>
                </div>
              </div>
            </div>

            {/* Quick KPIs */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              {[
                { label: 'Users',    value: stats.totalUsers || 0,    color: 'bg-blue-50 text-blue-700' },
                { label: 'Dreams',   value: stats.totalDreams || 0,   color: 'bg-violet-50 text-violet-700' },
                { label: 'Reports',  value: stats.pendingReports || 0, color: 'bg-red-50 text-red-700' },
                { label: 'Fulfilled',value: stats.fulfilledDreams || 0,color: 'bg-emerald-50 text-emerald-700' },
              ].map((s) => (
                <div key={s.label} className={`p-3 rounded-xl ${s.color} text-center`}>
                  <div className="text-xl font-black">{s.value}</div>
                  <div className="text-[10px] font-semibold mt-0.5 opacity-70">{s.label}</div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2 px-1">Admin Panel</p>
            <nav className="space-y-0.5">
              {SIDEBAR.map((item) => (
                <button key={item.key} onClick={() => setSection(item.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                    section === item.key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon}/>
                  </svg>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile tab bar */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 flex z-40">
          {SIDEBAR.slice(0, 5).map((item) => (
            <button key={item.key} onClick={() => setSection(item.key)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-[9px] font-medium transition-colors ${section === item.key ? 'text-blue-600' : 'text-slate-400'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon}/>
              </svg>
              <span>{item.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Main */}
        <main className="flex-1 lg:ml-64 px-4 lg:px-8 pt-8 pb-28 lg:pb-8">

          {/* OVERVIEW */}
          {section === 'overview' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-black text-slate-900">Platform Overview</h1>
                <p className="text-slate-500 text-sm mt-1">Real-time platform metrics and analytics</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <KPI label="Total Users"       value={stats.totalUsers || 0}       trend={stats.todayUsers} color="blue"/>
                <KPI label="Dreams Posted"     value={stats.totalDreams || 0}      trend={stats.todayDreams} color="violet"/>
                <KPI label="Published Dreams"  value={stats.publishedDreams || 0}  sub="Live on platform" color="sky"/>
                <KPI label="Dreams Fulfilled"  value={stats.fulfilledDreams || 0}  sub={`${stats.conversionRate || 0}% conversion`} color="emerald"/>
                <KPI label="Active Matches"    value={stats.matchedDreams || 0}    sub="Connections approved" color="amber"/>
                <KPI label="Pending Reports"   value={stats.pendingReports || 0}   sub="Needs review" color="red"/>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-card">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">Recent Activity</h3>
                  <button onClick={() => setSection('audit')} className="text-xs text-blue-600 font-semibold hover:text-blue-800">View all</button>
                </div>
                <div className="divide-y divide-slate-100">
                  {logs.slice(0, 8).map((log) => (
                    <div key={log.id} className="flex items-center gap-4 px-6 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${ACTION_COLORS[log.action] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm text-slate-700 flex-1">{log.actor_name || 'System'}</span>
                      <span className="text-xs text-slate-400 whitespace-nowrap">{new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* USER MANAGEMENT */}
          {section === 'users' && (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">User Management</h1>
                  <p className="text-slate-500 text-sm mt-1">{users.length} total users</p>
                </div>
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="input w-full sm:w-64 py-2.5"/>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        {['User', 'Role', 'Mode', 'Trust', 'Joined', 'Actions'].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.slice(0, 50).map((user) => (
                        <UserRow key={user.uid} user={user}
                          onAction={(type, u) => { setActionModal({ type, user: u }); setActionReason(''); }}
                          onEdit={(u) => { setEditModal(u); setEditForm({ name: u.name, role: u.role, trust_score: u.trust_score, verified: u.verified }); }}
                        />
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <div className="py-12 text-center text-slate-400 text-sm">No users found</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* DREAMS */}
          {section === 'dreams' && (
            <div>
              <h1 className="text-2xl font-black text-slate-900 mb-6">All Dreams</h1>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        {['Dream', 'Category', 'Status', 'Dreamer', 'Date', 'Actions'].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dreams.slice(0, 50).map((dream) => (
                        <tr key={dream.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-slate-900 text-sm max-w-[200px] truncate">{dream.title}</div>
                            {dream.badge && dream.badge !== 'none' && <span className="text-[10px] text-blue-600 font-semibold">{dream.badge}</span>}
                          </td>
                          <td className="px-4 py-3.5 text-xs text-slate-600">{dream.category}</td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                              dream.status === 'fulfilled' ? 'bg-emerald-100 text-emerald-700' :
                              dream.status === 'published' ? 'bg-blue-100 text-blue-700' :
                              dream.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>{dream.status}</span>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-slate-600">{dream.dreamer_name}</td>
                          <td className="px-4 py-3.5 text-xs text-slate-400">{new Date(dream.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                          <td className="px-4 py-3.5">
                            <button onClick={() => handleDeleteDream(dream.id)}
                              className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODERATORS */}
          {section === 'moderators' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Moderators</h1>
                  <p className="text-slate-500 text-sm mt-1">{moderators.length} active moderators</p>
                </div>
                <button onClick={() => setPromoteModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                  Add Moderator
                </button>
              </div>
              <div className="grid gap-4">
                {moderators.map((mod) => (
                  <div key={mod.uid} className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white font-black text-lg">{mod.name?.[0]}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{mod.name}</span>
                          {mod.verified === 1 && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">Verified</span>}
                        </div>
                        <div className="text-sm text-slate-400">{mod.email}</div>
                        <div className="text-xs text-slate-400 mt-0.5">Trust: {mod.trust_score} · Joined {new Date(mod.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveMod(mod.uid)}
                      className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-sm font-semibold rounded-xl hover:bg-red-100 transition-colors">
                      Remove
                    </button>
                  </div>
                ))}
                {moderators.length === 0 && <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-12 text-center text-slate-400 text-sm">No moderators yet. Promote a user to get started.</div>}
              </div>
            </div>
          )}

          {/* ESCALATIONS */}
          {section === 'escalations' && (
            <div>
              <h1 className="text-2xl font-black text-slate-900 mb-6">Escalations</h1>
              {escalations.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-12 text-center text-slate-400 text-sm">No open escalations.</div>
              ) : (
                <div className="space-y-4">
                  {escalations.map((esc) => (
                    <div key={esc.id} className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${esc.priority === 'critical' ? 'bg-red-100 text-red-700' : esc.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                              {esc.priority}
                            </span>
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full capitalize">{esc.target_type}</span>
                          </div>
                          <p className="font-semibold text-slate-900 mb-1">{esc.reason}</p>
                          {esc.details && <p className="text-sm text-slate-500">{esc.details}</p>}
                          <p className="text-xs text-slate-400 mt-2">By {esc.escalated_by_name} · {new Date(esc.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => handleResolveEscalation(esc.id, 'resolved')}
                            className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors">Resolve</button>
                          <button onClick={() => handleResolveEscalation(esc.id, 'dismissed')}
                            className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors">Dismiss</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SUCCESS STORIES */}
          {section === 'stories' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black text-slate-900">Success Stories</h1>
                <button onClick={() => setStoryModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                  Add Story
                </button>
              </div>
              <div className="grid gap-4">
                {stories.map((s) => (
                  <div key={s.id} className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-slate-900">{s.title}</h3>
                          {s.featured === 1 && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">Featured</span>}
                        </div>
                        {s.outcome && <p className="text-sm text-emerald-600 font-semibold mb-2">{s.outcome}</p>}
                        <p className="text-sm text-slate-600 line-clamp-2">{s.story}</p>
                        {s.quote && <p className="text-sm text-slate-500 italic mt-2">"{s.quote}"</p>}
                      </div>
                    </div>
                  </div>
                ))}
                {stories.length === 0 && <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-12 text-center text-slate-400 text-sm">No success stories yet.</div>}
              </div>
            </div>
          )}

          {/* AUDIT LOG */}
          {section === 'audit' && (
            <div>
              <h1 className="text-2xl font-black text-slate-900 mb-6">Audit Log</h1>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        {['Action', 'Actor', 'Target', 'Time'].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${ACTION_COLORS[log.action] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                              {log.action.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-slate-700">{log.actor_name || log.actor_uid?.slice(0, 8)}</td>
                          <td className="px-4 py-3.5 text-xs text-slate-400">{log.target_type} {log.target_id?.slice(0, 8)}</td>
                          <td className="px-4 py-3.5 text-xs text-slate-400 whitespace-nowrap">{new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Action Modal (suspend/ban/etc.) */}
      <Modal open={!!actionModal} onClose={() => { setActionModal(null); setActionReason(''); }} title={actionModal ? `${actionModal.type.charAt(0).toUpperCase() + actionModal.type.slice(1)} User` : ''}>
        {actionModal && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              You are about to <strong>{actionModal.type}</strong> user <strong>{actionModal.user.name}</strong>.
            </p>
            {['suspend', 'ban'].includes(actionModal.type) && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Reason <span className="text-red-400">*</span></label>
                <textarea value={actionReason} onChange={(e) => setActionReason(e.target.value)} rows={3}
                  placeholder="Provide a reason..." className="input resize-none"/>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => { setActionModal(null); setActionReason(''); }}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-2xl hover:bg-slate-200 transition-colors text-sm">Cancel</button>
              <button onClick={handleAction} disabled={loading}
                className={`flex-1 py-3 font-semibold rounded-2xl transition-colors text-sm disabled:opacity-60 ${
                  actionModal.type === 'ban' ? 'bg-red-600 text-white hover:bg-red-700' :
                  actionModal.type === 'suspend' ? 'bg-amber-600 text-white hover:bg-amber-700' :
                  'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}>
                {loading ? 'Processing…' : 'Confirm'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal open={!!editModal} onClose={() => { setEditModal(null); setEditForm({}); }} title="Edit User">
        {editModal && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
              <input value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="input"/>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Role</label>
              <select value={editForm.role || 'user'} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="input">
                {['user', 'moderator', 'admin'].map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Trust Score</label>
              <input type="number" min={0} max={200} value={editForm.trust_score || 100}
                onChange={(e) => setEditForm({ ...editForm, trust_score: parseInt(e.target.value) })} className="input"/>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="verified" checked={editForm.verified === 1}
                onChange={(e) => setEditForm({ ...editForm, verified: e.target.checked ? 1 : 0 })} className="w-4 h-4"/>
              <label htmlFor="verified" className="text-sm font-semibold text-slate-700">Verified</label>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setEditModal(null); setEditForm({}); }} className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-2xl text-sm">Cancel</button>
              <button onClick={handleEditUser} disabled={loading} className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition-colors text-sm disabled:opacity-60">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Promote Moderator Modal */}
      <Modal open={promoteModal} onClose={() => { setPromoteModal(false); setPromoteUid(''); }} title="Add Moderator">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Enter the User UID to promote to Moderator. You can find UIDs in User Management.</p>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">User UID</label>
            <input value={promoteUid} onChange={(e) => setPromoteUid(e.target.value)} placeholder="Paste user UID here..." className="input"/>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setPromoteModal(false); setPromoteUid(''); }} className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-2xl text-sm">Cancel</button>
            <button onClick={handlePromote} className="flex-1 py-3 bg-violet-600 text-white font-semibold rounded-2xl hover:bg-violet-700 transition-colors text-sm">Promote</button>
          </div>
        </div>
      </Modal>

      {/* Add Story Modal */}
      <Modal open={storyModal} onClose={() => setStoryModal(false)} title="Add Success Story" size="lg">
        <div className="space-y-4">
          {[['Title', 'title', 'text'], ['Outcome', 'outcome', 'text'], ['Quote', 'quote', 'text'], ['Dreamer Alias', 'dreamer_alias', 'text'], ['Fulfiller Alias', 'fulfiller_alias', 'text']].map(([label, key, type]) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
              <input type={type} value={storyForm[key] || ''} onChange={(e) => setStoryForm({ ...storyForm, [key]: e.target.value })} className="input"/>
            </div>
          ))}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Story</label>
            <textarea value={storyForm.story || ''} rows={4} onChange={(e) => setStoryForm({ ...storyForm, story: e.target.value })} className="input resize-none"/>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="feat" checked={storyForm.featured}
              onChange={(e) => setStoryForm({ ...storyForm, featured: e.target.checked })} className="w-4 h-4"/>
            <label htmlFor="feat" className="text-sm font-semibold text-slate-700">Featured</label>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStoryModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-2xl text-sm">Cancel</button>
            <button onClick={handleAddStory} className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition-colors text-sm">Add Story</button>
          </div>
        </div>
      </Modal>

      <AnimatePresence>{toast && <Toast msg={toast}/>}</AnimatePresence>
    </div>
  );
}
