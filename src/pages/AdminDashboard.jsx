import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/ui/Modal';
import Navbar from '../components/layout/Navbar';

const SIDEBAR = [
  { key: 'overview',    label: 'Overview',        icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z' },
  { key: 'users',       label: 'Users',           icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' },
  { key: 'dreams',      label: 'Dreams',          icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z' },
  { key: 'moderators',  label: 'Moderators',      icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z' },
  { key: 'escalations', label: 'Escalations',     icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z' },
  { key: 'stories',     label: 'Success Stories', icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5' },
  { key: 'audit',       label: 'Audit Log',       icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
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

const KPI_COLORS = {
  blue:    { bg: '#2563EB', text: 'white' },
  emerald: { bg: '#059669', text: 'white' },
  violet:  { bg: '#7C3AED', text: 'white' },
  amber:   { bg: '#D97706', text: 'white' },
  red:     { bg: '#DC2626', text: 'white' },
  sky:     { bg: '#0284C7', text: 'white' },
};

function KPI({ label, value, sub, trend, color = 'blue' }) {
  const c = KPI_COLORS[color];
  return (
    <div className="rounded-[18px] p-5" style={{ background: c.bg, color: c.text }}>
      <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ opacity: 0.65 }}>{label}</p>
      <div className="font-extrabold mb-1" style={{ fontSize: '2.25rem', letterSpacing: '-0.05em', lineHeight: 1 }}>{value}</div>
      {sub && <p className="text-[12px]" style={{ opacity: 0.6 }}>{sub}</p>}
      {trend != null && (
        <div className={`flex items-center gap-1 mt-2 text-[12px] font-bold ${trend >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={trend >= 0 ? 'M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25' : 'M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25'}/>
          </svg>
          {trend >= 0 ? '+' : ''}{trend} today
        </div>
      )}
    </div>
  );
}

function UserRow({ user, onAction, onEdit }) {
  const roleStyle = {
    admin:     { background: 'var(--navy)', color: 'white' },
    moderator: { background: '#EDE9FE', color: '#5B21B6' },
    user:      { background: 'var(--bg)', color: 'var(--text-2)' },
  };
  return (
    <tr className="transition-colors" style={{ borderBottom: '1px solid var(--border)' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[11px] flex items-center justify-center text-white font-extrabold text-[13px] flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}>
            {user.name?.[0]}
          </div>
          <div>
            <div className="font-semibold text-[13.5px] flex items-center gap-2" style={{ color: 'var(--text)' }}>
              {user.name}
              {user.verified === 1 && <span style={{ color: '#10B981', fontSize: '11px' }}>✓</span>}
              {user.banned === 1 && <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded-full" style={{ background: '#FEE2E2', color: '#991B1B' }}>Banned</span>}
              {user.suspended === 1 && <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded-full" style={{ background: '#FEF3C7', color: '#92400E' }}>Suspended</span>}
            </div>
            <div className="text-[12px] truncate max-w-[180px]" style={{ color: 'var(--text-4)' }}>{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <span className="px-2.5 py-1 rounded-full text-[11.5px] font-bold capitalize"
          style={roleStyle[user.role] || roleStyle.user}>{user.role}</span>
      </td>
      <td className="px-4 py-3.5 text-[13px] capitalize" style={{ color: 'var(--text-2)' }}>{user.mode}</td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{
            background: user.trust_score >= 80 ? '#10B981' : user.trust_score >= 50 ? '#F59E0B' : '#EF4444'
          }}/>
          <span className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>{user.trust_score}</span>
        </div>
      </td>
      <td className="px-4 py-3.5 text-[12px]" style={{ color: 'var(--text-4)' }}>
        {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(user)} className="p-1.5 rounded-[8px] transition-colors" title="Edit"
            style={{ color: 'var(--text-4)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--blue)'; e.currentTarget.style.background = 'var(--blue-light)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-4)'; e.currentTarget.style.background = 'transparent'; }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>
          </button>
          {user.banned ? (
            <button onClick={() => onAction('unban', user)} className="p-1.5 rounded-[8px] transition-colors" title="Unban" style={{ color: '#10B981' }}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </button>
          ) : user.suspended ? (
            <button onClick={() => onAction('unsuspend', user)} className="p-1.5 rounded-[8px] transition-colors" title="Unsuspend" style={{ color: '#10B981' }}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </button>
          ) : (
            <>
              <button onClick={() => onAction('suspend', user)} className="p-1.5 rounded-[8px] transition-colors" title="Suspend" style={{ color: '#F59E0B' }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
              </button>
              <button onClick={() => onAction('ban', user)} className="p-1.5 rounded-[8px] transition-colors" title="Ban" style={{ color: '#EF4444' }}>
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
    <motion.div initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.96 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 text-white px-6 py-3 rounded-2xl shadow-float text-[13px] font-semibold z-50 whitespace-nowrap"
      style={{ background: 'var(--navy)' }}>
      {msg}
    </motion.div>
  );
}

function FieldLabel({ children }) {
  return (
    <label className="block text-[12px] font-bold mb-1.5 uppercase tracking-[0.06em]" style={{ color: 'var(--text-2)' }}>
      {children}
    </label>
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
    if (statsR.status === 'fulfilled')   setStats(statsR.value);
    if (usersR.status === 'fulfilled')   setUsers(usersR.value.users || []);
    if (dreamsR.status === 'fulfilled')  setDreams(dreamsR.value.dreams || []);
    if (modsR.status === 'fulfilled')    setModerators(modsR.value.moderators || []);
    if (logsR.status === 'fulfilled')    setLogs(logsR.value.logs || []);
    if (escalR.status === 'fulfilled')   setEscalations(escalR.value.escalations || []);
    if (storiesR.status === 'fulfilled') setStories(storiesR.value.stories || []);
    setLoading(false);
  };

  const handleAction = async () => {
    if (!actionReason.trim() && ['suspend', 'ban'].includes(actionModal.type)) return showToast('Please provide a reason.');
    setLoading(true);
    try {
      if (actionModal.type === 'suspend')   await api.admin.suspendUser(actionModal.user.uid, actionReason);
      else if (actionModal.type === 'unsuspend') await api.admin.unsuspendUser(actionModal.user.uid);
      else if (actionModal.type === 'ban')  await api.admin.banUser(actionModal.user.uid, actionReason);
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

  const filteredUsers = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (!profile || profile.role !== 'admin') return null;

  const thStyle = { color: 'var(--text-3)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', textAlign: 'left' };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <div className="flex" style={{ paddingTop: '64px' }}>

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-[220px] fixed top-0 bottom-0 overflow-y-auto z-20" style={{ paddingTop: '64px' }}
          style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
          <div className="p-4">
            {/* Admin Badge */}
            <div className="p-4 rounded-[16px] mb-5" style={{ background: 'var(--navy)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[11px] flex items-center justify-center text-white font-extrabold"
                  style={{ background: 'rgba(255,255,255,0.12)' }}>
                  {profile.name?.[0]}
                </div>
                <div>
                  <div className="text-white font-bold text-[13.5px]">{profile.name}</div>
                  <div className="text-[11.5px] font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>Master Admin</div>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              {[
                { label: 'Users',     value: stats.totalUsers || 0,      bg: '#EFF6FF', color: '#1D4ED8' },
                { label: 'Dreams',    value: stats.totalDreams || 0,     bg: '#EDE9FE', color: '#5B21B6' },
                { label: 'Reports',   value: stats.pendingReports || 0,  bg: '#FEE2E2', color: '#991B1B' },
                { label: 'Fulfilled', value: stats.fulfilledDreams || 0, bg: '#D1FAE5', color: '#065F46' },
              ].map(s => (
                <div key={s.label} className="p-3 rounded-[12px] text-center" style={{ background: s.bg }}>
                  <div className="text-xl font-extrabold" style={{ color: s.color, letterSpacing: '-0.04em' }}>{s.value}</div>
                  <div className="text-[10px] font-bold mt-0.5" style={{ color: s.color, opacity: 0.7 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <p className="text-[10.5px] font-bold uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--text-4)' }}>Admin Panel</p>
            <nav className="space-y-0.5">
              {SIDEBAR.map(item => {
                const active = section === item.key;
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
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Mobile tab bar */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 flex z-40"
          style={{ background: 'white', borderTop: '1px solid var(--border)' }}>
          {SIDEBAR.slice(0, 5).map(item => (
            <button key={item.key} onClick={() => setSection(item.key)}
              className="flex-1 flex flex-col items-center gap-0.5 py-3 text-[9px] font-medium transition-colors"
              style={{ color: section === item.key ? 'var(--blue)' : 'var(--text-4)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon}/>
              </svg>
              <span>{item.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Sidebar spacer */}
        <div className="hidden lg:block flex-shrink-0" style={{ width: '220px' }} />

        {/* Main */}
        <main className="flex-1 min-w-0 px-4 lg:px-8 pt-8 pb-28 lg:pb-8">

          {/* OVERVIEW */}
          {section === 'overview' && (
            <div>
              <div className="mb-6">
                <h1 className="font-extrabold" style={{ fontSize: '1.5rem', color: 'var(--text)', letterSpacing: '-0.03em' }}>Platform Overview</h1>
                <p className="text-[13px] mt-1" style={{ color: 'var(--text-3)' }}>Real-time platform metrics and analytics</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <KPI label="Total Users"      value={stats.totalUsers || 0}      trend={stats.todayUsers}  color="blue"/>
                <KPI label="Dreams Posted"    value={stats.totalDreams || 0}     trend={stats.todayDreams} color="violet"/>
                <KPI label="Published Dreams" value={stats.publishedDreams || 0} sub="Live on platform"    color="sky"/>
                <KPI label="Dreams Fulfilled" value={stats.fulfilledDreams || 0} sub={`${stats.conversionRate || 0}% conversion`} color="emerald"/>
                <KPI label="Active Matches"   value={stats.matchedDreams || 0}   sub="Connections approved" color="amber"/>
                <KPI label="Pending Reports"  value={stats.pendingReports || 0}  sub="Needs review"        color="red"/>
              </div>

              <div className="card-white overflow-hidden">
                <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
                  <h3 className="font-extrabold text-[15px]" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>Recent Activity</h3>
                  <button onClick={() => setSection('audit')} className="text-[12.5px] font-bold" style={{ color: 'var(--blue)' }}>View all →</button>
                </div>
                <div>
                  {logs.slice(0, 8).map(log => (
                    <div key={log.id} className="flex items-center gap-4 px-6 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${ACTION_COLORS[log.action] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[13px] flex-1" style={{ color: 'var(--text-2)' }}>{log.actor_name || 'System'}</span>
                      <span className="text-[12px] whitespace-nowrap" style={{ color: 'var(--text-4)' }}>
                        {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
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
                  <h1 className="font-extrabold" style={{ fontSize: '1.5rem', color: 'var(--text)', letterSpacing: '-0.03em' }}>User Management</h1>
                  <p className="text-[13px] mt-1" style={{ color: 'var(--text-3)' }}>{users.length} total users</p>
                </div>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="input w-full sm:w-64" style={{ padding: '10px 16px' }}/>
              </div>
              <div className="card-white overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        {['User', 'Role', 'Mode', 'Trust', 'Joined', 'Actions'].map(h => (
                          <th key={h} style={thStyle}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.slice(0, 50).map(user => (
                        <UserRow key={user.uid} user={user}
                          onAction={(type, u) => { setActionModal({ type, user: u }); setActionReason(''); }}
                          onEdit={u => { setEditModal(u); setEditForm({ name: u.name, role: u.role, trust_score: u.trust_score, verified: u.verified }); }}
                        />
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <div className="py-12 text-center text-[13.5px]" style={{ color: 'var(--text-4)' }}>No users found</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* DREAMS */}
          {section === 'dreams' && (
            <div>
              <h1 className="font-extrabold mb-6" style={{ fontSize: '1.5rem', color: 'var(--text)', letterSpacing: '-0.03em' }}>All Dreams</h1>
              <div className="card-white overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        {['Dream', 'Category', 'Status', 'Dreamer', 'Date', 'Actions'].map(h => (
                          <th key={h} style={thStyle}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dreams.slice(0, 50).map(dream => (
                        <tr key={dream.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-[13.5px] max-w-[200px] truncate" style={{ color: 'var(--text)' }}>{dream.title}</div>
                            {dream.badge && dream.badge !== 'none' && <span className="text-[10px] font-bold" style={{ color: 'var(--blue)' }}>{dream.badge}</span>}
                          </td>
                          <td className="px-4 py-3.5 text-[12.5px]" style={{ color: 'var(--text-2)' }}>{dream.category}</td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[11.5px] font-bold capitalize ${
                              dream.status === 'fulfilled' ? 'badge badge-green' :
                              dream.status === 'published' ? 'badge badge-blue' :
                              dream.status === 'rejected'  ? 'badge badge-red' : 'badge badge-amber'
                            }`}>{dream.status}</span>
                          </td>
                          <td className="px-4 py-3.5 text-[13px]" style={{ color: 'var(--text-2)' }}>{dream.dreamer_name}</td>
                          <td className="px-4 py-3.5 text-[12px]" style={{ color: 'var(--text-4)' }}>
                            {new Date(dream.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-4 py-3.5">
                            <button onClick={() => handleDeleteDream(dream.id)} className="p-1.5 rounded-[8px] transition-colors" style={{ color: '#EF4444' }}>
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
                  <h1 className="font-extrabold" style={{ fontSize: '1.5rem', color: 'var(--text)', letterSpacing: '-0.03em' }}>Moderators</h1>
                  <p className="text-[13px] mt-1" style={{ color: 'var(--text-3)' }}>{moderators.length} active moderators</p>
                </div>
                <button onClick={() => setPromoteModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                  Add Moderator
                </button>
              </div>
              <div className="space-y-3">
                {moderators.map(mod => (
                  <div key={mod.uid} className="card-white p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-[14px] flex items-center justify-center text-white font-extrabold text-lg"
                        style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)' }}>{mod.name?.[0]}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[14px]" style={{ color: 'var(--text)' }}>{mod.name}</span>
                          {mod.verified === 1 && <span className="badge badge-green" style={{ fontSize: '10px' }}>Verified</span>}
                        </div>
                        <div className="text-[13px]" style={{ color: 'var(--text-4)' }}>{mod.email}</div>
                        <div className="text-[12px] mt-0.5" style={{ color: 'var(--text-4)' }}>
                          Trust: {mod.trust_score} · Joined {new Date(mod.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveMod(mod.uid)}
                      className="px-4 py-2 rounded-[12px] text-[13px] font-bold transition-colors"
                      style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA' }}>
                      Remove
                    </button>
                  </div>
                ))}
                {moderators.length === 0 && (
                  <div className="card-white p-12 text-center text-[13.5px]" style={{ color: 'var(--text-4)' }}>
                    No moderators yet. Promote a user to get started.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ESCALATIONS */}
          {section === 'escalations' && (
            <div>
              <h1 className="font-extrabold mb-6" style={{ fontSize: '1.5rem', color: 'var(--text)', letterSpacing: '-0.03em' }}>Escalations</h1>
              {escalations.length === 0 ? (
                <div className="card-white p-12 text-center text-[13.5px]" style={{ color: 'var(--text-4)' }}>No open escalations.</div>
              ) : (
                <div className="space-y-4">
                  {escalations.map(esc => (
                    <div key={esc.id} className="card-white p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2.5 py-1 rounded-full text-[11.5px] font-bold ${
                              esc.priority === 'critical' ? 'badge badge-red' :
                              esc.priority === 'high' ? 'badge badge-amber' : 'badge'
                            }`}>{esc.priority}</span>
                            <span className="badge">{esc.target_type}</span>
                          </div>
                          <p className="font-bold text-[14px] mb-1" style={{ color: 'var(--text)' }}>{esc.reason}</p>
                          {esc.details && <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>{esc.details}</p>}
                          <p className="text-[12px] mt-2" style={{ color: 'var(--text-4)' }}>
                            By {esc.escalated_by_name} · {new Date(esc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => handleResolveEscalation(esc.id, 'resolved')}
                            className="px-4 py-2 rounded-[12px] text-[13px] font-bold text-white transition-colors"
                            style={{ background: '#059669' }}>Resolve</button>
                          <button onClick={() => handleResolveEscalation(esc.id, 'dismissed')}
                            className="px-4 py-2 rounded-[12px] text-[13px] font-bold transition-colors"
                            style={{ background: 'var(--bg)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>Dismiss</button>
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
                <h1 className="font-extrabold" style={{ fontSize: '1.5rem', color: 'var(--text)', letterSpacing: '-0.03em' }}>Success Stories</h1>
                <button onClick={() => setStoryModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                  Add Story
                </button>
              </div>
              <div className="space-y-4">
                {stories.map(s => (
                  <div key={s.id} className="card-white p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-[15px]" style={{ color: 'var(--text)' }}>{s.title}</h3>
                          {s.featured === 1 && <span className="badge badge-amber" style={{ fontSize: '10px' }}>Featured</span>}
                        </div>
                        {s.outcome && <p className="text-[13px] font-bold mb-2" style={{ color: '#059669' }}>{s.outcome}</p>}
                        <p className="text-[13px] line-clamp-2" style={{ color: 'var(--text-3)' }}>{s.story}</p>
                        {s.quote && <p className="text-[13px] italic mt-2 font-display" style={{ color: 'var(--text-4)' }}>"{s.quote}"</p>}
                      </div>
                    </div>
                  </div>
                ))}
                {stories.length === 0 && (
                  <div className="card-white p-12 text-center text-[13.5px]" style={{ color: 'var(--text-4)' }}>No success stories yet.</div>
                )}
              </div>
            </div>
          )}

          {/* AUDIT LOG */}
          {section === 'audit' && (
            <div>
              <h1 className="font-extrabold mb-6" style={{ fontSize: '1.5rem', color: 'var(--text)', letterSpacing: '-0.03em' }}>Audit Log</h1>
              <div className="card-white overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        {['Action', 'Actor', 'Target', 'Time'].map(h => (
                          <th key={h} style={thStyle}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map(log => (
                        <tr key={log.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                          <td className="px-4 py-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${ACTION_COLORS[log.action] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                              {log.action.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-[13px]" style={{ color: 'var(--text-2)' }}>
                            {log.actor_name || log.actor_uid?.slice(0, 8)}
                          </td>
                          <td className="px-4 py-3.5 text-[12px]" style={{ color: 'var(--text-4)' }}>
                            {log.target_type} {log.target_id?.slice(0, 8)}
                          </td>
                          <td className="px-4 py-3.5 text-[12px] whitespace-nowrap" style={{ color: 'var(--text-4)' }}>
                            {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
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

      {/* Action Modal */}
      <Modal open={!!actionModal} onClose={() => { setActionModal(null); setActionReason(''); }}
        title={actionModal ? `${actionModal.type.charAt(0).toUpperCase() + actionModal.type.slice(1)} User` : ''}>
        {actionModal && (
          <div className="space-y-4">
            <p className="text-[13.5px]" style={{ color: 'var(--text-2)' }}>
              You are about to <strong>{actionModal.type}</strong> user <strong>{actionModal.user.name}</strong>.
            </p>
            {['suspend', 'ban'].includes(actionModal.type) && (
              <div>
                <FieldLabel>Reason <span style={{ color: '#EF4444' }}>*</span></FieldLabel>
                <textarea value={actionReason} onChange={e => setActionReason(e.target.value)} rows={3}
                  placeholder="Provide a reason..." className="input resize-none"/>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => { setActionModal(null); setActionReason(''); }} className="flex-1 btn-secondary">Cancel</button>
              <button onClick={handleAction} disabled={loading}
                className="flex-1 py-3 font-bold rounded-[14px] transition-colors text-[14px] text-white disabled:opacity-60"
                style={{
                  background: actionModal.type === 'ban' ? '#DC2626' :
                              actionModal.type === 'suspend' ? '#D97706' : '#059669'
                }}>
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
            <div><FieldLabel>Name</FieldLabel>
              <input value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="input"/>
            </div>
            <div><FieldLabel>Role</FieldLabel>
              <select value={editForm.role || 'user'} onChange={e => setEditForm({ ...editForm, role: e.target.value })} className="input">
                {['user', 'moderator', 'admin'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div><FieldLabel>Trust Score</FieldLabel>
              <input type="number" min={0} max={200} value={editForm.trust_score || 100}
                onChange={e => setEditForm({ ...editForm, trust_score: parseInt(e.target.value) })} className="input"/>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="verified" checked={editForm.verified === 1}
                onChange={e => setEditForm({ ...editForm, verified: e.target.checked ? 1 : 0 })} className="w-4 h-4"/>
              <label htmlFor="verified" className="text-[13.5px] font-semibold" style={{ color: 'var(--text-2)' }}>Verified</label>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setEditModal(null); setEditForm({}); }} className="flex-1 btn-secondary">Cancel</button>
              <button onClick={handleEditUser} disabled={loading} className="flex-1 btn-primary disabled:opacity-60">
                {loading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Promote Moderator Modal */}
      <Modal open={promoteModal} onClose={() => { setPromoteModal(false); setPromoteUid(''); }} title="Add Moderator">
        <div className="space-y-4">
          <p className="text-[13.5px]" style={{ color: 'var(--text-2)' }}>Enter the User UID to promote to Moderator. You can find UIDs in User Management.</p>
          <div><FieldLabel>User UID</FieldLabel>
            <input value={promoteUid} onChange={e => setPromoteUid(e.target.value)} placeholder="Paste user UID here..." className="input"/>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setPromoteModal(false); setPromoteUid(''); }} className="flex-1 btn-secondary">Cancel</button>
            <button onClick={handlePromote} className="flex-1 py-3 font-bold rounded-[14px] text-white text-[14px]"
              style={{ background: '#7C3AED' }}>Promote</button>
          </div>
        </div>
      </Modal>

      {/* Add Story Modal */}
      <Modal open={storyModal} onClose={() => setStoryModal(false)} title="Add Success Story" size="lg">
        <div className="space-y-4">
          {[['Title', 'title'], ['Outcome', 'outcome'], ['Quote', 'quote'], ['Dreamer Alias', 'dreamer_alias'], ['Fulfiller Alias', 'fulfiller_alias']].map(([label, key]) => (
            <div key={key}>
              <FieldLabel>{label}</FieldLabel>
              <input type="text" value={storyForm[key] || ''} onChange={e => setStoryForm({ ...storyForm, [key]: e.target.value })} className="input"/>
            </div>
          ))}
          <div><FieldLabel>Story</FieldLabel>
            <textarea value={storyForm.story || ''} rows={4} onChange={e => setStoryForm({ ...storyForm, story: e.target.value })} className="input resize-none"/>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="feat" checked={storyForm.featured}
              onChange={e => setStoryForm({ ...storyForm, featured: e.target.checked })} className="w-4 h-4"/>
            <label htmlFor="feat" className="text-[13.5px] font-semibold" style={{ color: 'var(--text-2)' }}>Featured</label>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStoryModal(false)} className="flex-1 btn-secondary">Cancel</button>
            <button onClick={handleAddStory} className="flex-1 btn-primary">Add Story</button>
          </div>
        </div>
      </Modal>

      <AnimatePresence>{toast && <Toast msg={toast}/>}</AnimatePresence>
    </div>
  );
}
