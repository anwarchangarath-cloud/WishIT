import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/layout/Navbar';

const ease = [0.22, 1, 0.36, 1];

const NOTIF_ICONS = {
  dream_approved:      { icon: '✓', bg: '#D1FAE5', color: '#065F46' },
  dream_rejected:      { icon: '✕', bg: '#FEE2E2', color: '#991B1B' },
  dream_info_request:  { icon: '?', bg: '#FEF3C7', color: '#92400E' },
  fulfillment_received:{ icon: '✦', bg: '#EFF6FF', color: '#1D4ED8' },
  fulfillment_approved:{ icon: '✓', bg: '#D1FAE5', color: '#065F46' },
  fulfillment_rejected:{ icon: '✕', bg: '#FEE2E2', color: '#991B1B' },
  message:             { icon: '✉', bg: '#EDE9FE', color: '#5B21B6' },
  support_milestone:   { icon: '♡', bg: '#FFE4E6', color: '#9F1239' },
  system:              { icon: 'i', bg: 'var(--bg)', color: 'var(--text-3)' },
};

const FILTERS = [
  { value: 'all',         label: 'All' },
  { value: 'unread',      label: 'Unread' },
  { value: 'dream',       label: 'Dreams' },
  { value: 'fulfillment', label: 'Fulfillments' },
  { value: 'message',     label: 'Messages' },
];

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function NotifItem({ notif, onRead, onDelete }) {
  const cfg = NOTIF_ICONS[notif.type] || NOTIF_ICONS.system;

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.22, ease }}
      className="flex items-start gap-4 p-5 rounded-[18px] transition-all"
      style={{
        background: notif.read ? 'white' : 'var(--blue-light)',
        border: `1px solid ${notif.read ? 'var(--border)' : 'var(--blue-border)'}`,
      }}>

      <div className="flex-shrink-0 w-10 h-10 rounded-[12px] flex items-center justify-center font-bold text-[15px]"
        style={{ background: cfg.bg, color: cfg.color }}>
        {cfg.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[14px]" style={{ color: notif.read ? 'var(--text-2)' : 'var(--text)' }}>
              {notif.title}
            </p>
            <p className="text-[13px] mt-0.5 leading-relaxed" style={{ color: notif.read ? 'var(--text-4)' : 'var(--text-3)' }}>
              {notif.body}
            </p>
            <p className="text-[11.5px] mt-2" style={{ color: 'var(--text-4)' }}>{formatTime(notif.created_at)}</p>
          </div>
          {!notif.read && (
            <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5 animate-pulse" style={{ background: 'var(--blue)' }} />
          )}
        </div>

        <div className="flex items-center gap-3 mt-3">
          {notif.link && (
            <Link to={notif.link} onClick={() => !notif.read && onRead(notif.id)}
              className="text-[12.5px] font-bold transition-colors" style={{ color: 'var(--blue)' }}>
              View →
            </Link>
          )}
          {!notif.read && (
            <button onClick={() => onRead(notif.id)}
              className="text-[12.5px] transition-colors" style={{ color: 'var(--text-4)' }}>
              Mark read
            </button>
          )}
          <button onClick={() => onDelete(notif.id)}
            className="text-[12px] ml-auto transition-colors hover:text-red-400" style={{ color: 'var(--border-dark)' }}>
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
}

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
    if (filter === 'unread')      return !n.read;
    if (filter === 'dream')       return n.type?.startsWith('dream');
    if (filter === 'fulfillment') return n.type?.startsWith('fulfillment');
    if (filter === 'message')     return n.type === 'message';
    return true;
  });

  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      <div className="pt-24 pb-20 max-w-2xl mx-auto px-5">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }}
          className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-extrabold" style={{ fontSize: 'clamp(1.6rem, 3vw, 2rem)', color: 'var(--text)', letterSpacing: '-0.035em' }}>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-[13.5px] mt-1" style={{ color: 'var(--text-3)' }}>
                <span className="font-extrabold" style={{ color: 'var(--blue)' }}>{unreadCount}</span> unread
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }}>
              Mark all read
            </button>
          )}
        </motion.div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6" style={{ scrollbarWidth: 'none' }}>
          {FILTERS.map(f => {
            const active = filter === f.value;
            return (
              <button key={f.value} onClick={() => setFilter(f.value)}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold transition-all"
                style={{
                  background: active ? 'var(--blue)' : 'white',
                  color: active ? 'white' : 'var(--text-2)',
                  border: `1.5px solid ${active ? 'var(--blue)' : 'var(--border)'}`,
                  boxShadow: active ? '0 2px 8px rgba(37,99,235,0.25)' : 'none',
                }}>
                {f.label}
                {f.value === 'unread' && unreadCount > 0 && (
                  <span className="w-4.5 h-4.5 flex items-center justify-center rounded-full text-[10px] font-extrabold"
                    style={{
                      background: active ? 'rgba(255,255,255,0.3)' : 'var(--blue)',
                      color: active ? 'white' : 'white',
                      width: '18px', height: '18px',
                    }}>
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-[18px] animate-pulse"
                style={{ background: 'white', border: '1px solid var(--border)' }}>
                <div className="w-10 h-10 rounded-[12px] flex-shrink-0" style={{ background: 'var(--border)' }} />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 rounded-full w-1/3" style={{ background: 'var(--border)' }} />
                  <div className="h-3 rounded-full w-2/3" style={{ background: 'var(--border)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <div className="text-5xl mb-4">◈</div>
            <p className="font-extrabold mb-1" style={{ color: 'var(--text)', fontSize: '1rem' }}>
              {filter === 'unread' ? "You're all caught up!" : 'No notifications'}
            </p>
            <p className="text-[13.5px]" style={{ color: 'var(--text-4)' }}>
              {filter === 'unread' ? 'Nothing left to read.' : 'Nothing here yet.'}
            </p>
          </motion.div>
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
