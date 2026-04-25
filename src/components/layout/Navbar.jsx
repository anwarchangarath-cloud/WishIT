import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

const Logo = ({ dark = false }) => (
  <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
    <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-blue">
      <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5l1.8 3.6 4 .6-2.9 2.8.7 4L8 10.5l-3.6 1.9.7-4L2.2 5.7l4-.6L8 1.5z" fill="currentColor"/>
      </svg>
    </div>
    <span className={`font-black text-xl tracking-tight ${dark ? 'text-slate-900' : 'text-white'}`}>WishIT</span>
  </Link>
);

function NotifDropdown({ onClose }) {
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api.getNotifications({ limit: 8 }).then((d) => {
      setNotifs(d.notifications || []);
      setUnread(d.unread_count || 0);
    }).catch(() => {});
  }, []);

  const markAll = async () => {
    await api.markAllNotificationsRead();
    setNotifs((n) => n.map((x) => ({ ...x, read: 1 })));
    setUnread(0);
  };

  const TYPE_CONFIG = {
    dream_approved:       { bg: 'bg-emerald-100', color: 'text-emerald-600', path: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    dream_rejected:       { bg: 'bg-red-100',     color: 'text-red-600',     path: 'M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    fulfillment_received: { bg: 'bg-blue-100',    color: 'text-blue-600',    path: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z' },
    fulfillment_approved: { bg: 'bg-violet-100',  color: 'text-violet-600',  path: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z' },
    message:              { bg: 'bg-sky-100',     color: 'text-sky-600',     path: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z' },
    connection_approved:  { bg: 'bg-emerald-100', color: 'text-emerald-600', path: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
  };

  const defaultConfig = { bg: 'bg-slate-100', color: 'text-slate-500', path: 'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0' };

  return (
    <motion.div initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }} transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-float border border-slate-100 overflow-hidden z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 text-sm">Notifications</span>
          {unread > 0 && <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full">{unread}</span>}
        </div>
        {unread > 0 && <button onClick={markAll} className="text-xs text-blue-600 font-semibold hover:text-blue-800">Mark all read</button>}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifs.length === 0 ? (
          <div className="px-4 py-8 text-center text-slate-400 text-sm">No notifications yet</div>
        ) : notifs.map((n) => {
          const ic = TYPE_CONFIG[n.type] || defaultConfig;
          return (
            <div key={n.id}
              onClick={() => { onClose(); if (n.link) window.location.href = n.link; }}
              className={`flex items-start gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${!n.read ? 'bg-blue-50/40' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${ic.bg}`}>
                <svg className={`w-4 h-4 ${ic.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ic.path}/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${!n.read ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>{n.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.body}</p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
            </div>
          );
        })}
      </div>
      <Link to="/notifications" onClick={onClose}
        className="block text-center text-xs font-semibold text-blue-600 hover:text-blue-800 py-3 border-t border-slate-100 transition-colors">
        View all notifications
      </Link>
    </motion.div>
  );
}

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);
  const dropRef = useRef(null);

  const isLanding = location.pathname === '/';
  const transparent = isLanding && !scrolled;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setMobileOpen(false); setDropOpen(false); setNotifOpen(false); }, [location]);

  useEffect(() => {
    if (!user) return;
    const fetch = () => api.getNotifications({ limit: 1, unread_only: 'true' })
      .then((d) => setUnreadCount(d.unread_count || 0)).catch(() => {});
    fetch();
    const interval = setInterval(fetch, 60000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const dashPath = profile?.role === 'admin' ? '/admin' : profile?.role === 'moderator' ? '/moderator' : '/dashboard';
  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      transparent ? 'bg-transparent' : 'bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm'
    }`}>
      <nav className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <Logo dark={!transparent} />

        <div className="hidden md:flex items-center gap-1">
          {[['Explore Dreams', '/dreams'], ['How It Works', '/#how-it-works'], ['Success Stories', '/stories']].map(([label, to]) => {
            const active = to !== '/' && to !== '/#how-it-works' && location.pathname === to;
            return (
              <Link key={label} to={to}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? transparent ? 'text-white bg-white/15' : 'text-blue-700 bg-blue-50 font-semibold'
                    : transparent ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}>
                {label}
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              {/* Notification Bell */}
              <div ref={notifRef} className="relative">
                <button onClick={() => { setNotifOpen(!notifOpen); setDropOpen(false); }}
                  className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    transparent ? 'hover:bg-white/10 text-white/70 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                  }`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {notifOpen && <NotifDropdown onClose={() => setNotifOpen(false)} />}
                </AnimatePresence>
              </div>

              {/* Messages */}
              <Link to="/messages"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  transparent ? 'hover:bg-white/10 text-white/70 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                }`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/>
                </svg>
              </Link>

              {/* Profile dropdown */}
              <div ref={dropRef} className="relative">
                <button onClick={() => { setDropOpen(!dropOpen); setNotifOpen(false); }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl transition-colors ${
                    transparent ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                  }`}>
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold">
                    {profile?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className={`text-sm font-semibold ${transparent ? 'text-white' : 'text-slate-800'}`}>
                    {profile?.name?.split(' ')[0]}
                  </span>
                  <svg className={`w-4 h-4 transition-transform ${dropOpen ? 'rotate-180' : ''} ${transparent ? 'text-white/60' : 'text-slate-400'}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                <AnimatePresence>
                  {dropOpen && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-float border border-slate-100 py-2 overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900">{profile?.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full capitalize ${
                            profile?.role === 'admin' ? 'bg-slate-900 text-white' :
                            profile?.role === 'moderator' ? 'bg-indigo-100 text-indigo-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>{profile?.role}</span>
                          <span className="text-xs text-slate-400">Trust: {profile?.trust_score || 100}</span>
                        </div>
                      </div>
                      {[
                        [dashPath, 'Dashboard'],
                        ['/submit-dream', 'Submit a Dream'],
                        ['/messages', 'Messages'],
                        ['/notifications', 'Notifications'],
                      ].map(([to, label]) => (
                        <Link key={label} to={to} className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                          {label}
                        </Link>
                      ))}
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link to="/login"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  transparent ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900'
                }`}>
                Sign in
              </Link>
              <Link to="/register"
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  transparent ? 'bg-white text-slate-900 hover:bg-blue-50 shadow-md' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue'
                }`}>
                Get started
              </Link>
            </>
          )}
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden p-2 rounded-xl transition-colors ${transparent ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M3 6h18M3 12h18M3 18h18'}/>
          </svg>
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} className="md:hidden bg-white border-t border-slate-100 overflow-hidden">
            <div className="px-6 py-4 space-y-1">
              {[['Explore Dreams', '/dreams'], ['How It Works', '/#how-it-works'], ['Success Stories', '/stories']].map(([label, to]) => {
                const active = to !== '/' && to !== '/#how-it-works' && location.pathname === to;
                return (
                  <Link key={label} to={to}
                    className={`block px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${active ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}>
                    {label}
                  </Link>
                );
              })}
              <div className="pt-3 border-t border-slate-100 mt-3 space-y-2">
                {user ? (
                  <>
                    <Link to={dashPath} className="block px-3 py-2.5 text-sm font-medium text-slate-700">Dashboard</Link>
                    <Link to="/messages" className="block px-3 py-2.5 text-sm font-medium text-slate-700">Messages</Link>
                    <Link to="/notifications" className="block px-3 py-2.5 text-sm font-medium text-slate-700">
                      Notifications {unreadCount > 0 && `(${unreadCount})`}
                    </Link>
                    <button onClick={handleLogout} className="block w-full text-left px-3 py-2.5 text-sm font-medium text-red-600">Sign out</button>
                  </>
                ) : (
                  <div className="flex gap-3">
                    <Link to="/login" className="flex-1 text-center py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl">Sign in</Link>
                    <Link to="/register" className="flex-1 text-center py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl">Get started</Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
