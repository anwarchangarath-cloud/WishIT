import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/layout/Navbar';

const NOTIF_ICONS = {
  dream_approved: { icon: '✓', bg: 'bg-emerald-100', color: 'text-emerald-600' },
  dream_rejected: { icon: '✗', bg: 'bg-red-100', color: 'text-red-600' },
  dream_info_request: { icon: '?', bg: 'bg-amber-100', color: 'text-amber-600' },
  fulfillment_received: { icon: '★', bg: 'bg-blue-100', color: 'text-blue-600' },
  fulfillment_approved: { icon: '✓', bg: 'bg-emerald-100', color: 'text-emerald-600' },
  fulfillment_rejected: { icon: '✗', bg: 'bg-red-100', color: 'text-red-600' },
  message: { icon: '✉', bg: 'bg-indigo-100', color: 'text-indigo-600' },
  support_milestone: { icon: '♥', bg: 'bg-rose-100', color: 'text-rose-600' },
  system: { icon: 'i', bg: 'bg-slate-100', color: 'text-slate-600' },
};

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function NotifItem({ notif, onRead, onDelete }) {
  const cfg = NOTIF_ICONS[notif.type] || NOTIF_ICONS.system;

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
      className={`flex items-start gap-4 p-5 rounded-2xl border transition-all ${notif.read ? 'bg-white border-slate-100' : 'bg-blue-50/50 border-blue-100'}`}>

      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${cfg.bg} ${cfg.color}`}>
        {cfg.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold ${notif.read ? 'text-slate-700' : 'text-slate-900'}`}>{notif.title}</p>
            <p className={`text-sm mt-0.5 leading-relaxed ${notif.read ? 'text-slate-400' : 'text-slate-600'}`}>{notif.body}</p>
            <p className="text-xs text-slate-400 mt-2">{formatTime(notif.created_at)}</p>
          </div>
          {!notif.read && (
            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
          )}
        </div>

        <div className="flex items-center gap-3 mt-3">
          {notif.link && (
            <Link to={notif.link}
              onClick={() => !notif.read && onRead(notif.id)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              View →
            </Link>
          )}
          {!notif.read && (
            <button onClick={() => onRead(notif.id)} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
              Mark read
            </button>
          )}
          <button onClick={() => onDelete(notif.id)} className="text-xs text-slate-300 hover:text-red-400 transition-colors ml-auto">
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
}

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'dream', label: 'Dreams' },
  { value: 'fulfillment', label: 'Fulfillments' },
  { value: 'message', label: 'Messages' },
];

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    load();
  }, [user]);

  const load = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch {}
    setLoading(false);
  };

  const markRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(n => n.map(x => ({ ...x, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const deleteNotif = async (id) => {
    const wasUnread = notifications.find(n => n.id === id)?.read === false;
    try {
      await api.deleteNotification(id);
      setNotifications(n => n.filter(x => x.id !== id));
      if (wasUnread) setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'dream') return n.type?.startsWith('dream');
    if (filter === 'fulfillment') return n.type?.startsWith('fulfillment');
    if (filter === 'message') return n.type === 'message';
    return true;
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-24 pb-16 max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-slate-500 text-sm mt-1">
                <span className="font-bold text-blue-600">{unreadCount}</span> unread
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              Mark all read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${filter === f.value ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {f.label}
              {f.value === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 p-5 bg-white rounded-2xl border border-slate-100 animate-pulse">
                <div className="w-10 h-10 bg-slate-200 rounded-xl flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded-full w-1/3 mb-2" />
                  <div className="h-3 bg-slate-200 rounded-full w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
            </div>
            <p className="font-bold text-slate-900 mb-1">No notifications</p>
            <p className="text-slate-400 text-sm">
              {filter === 'unread' ? 'You\'re all caught up!' : 'Nothing here yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map(n => (
                <NotifItem key={n.id} notif={n} onRead={markRead} onDelete={deleteNotif} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
