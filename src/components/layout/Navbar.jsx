import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

const Logo = ({ dark = false }) => (
  <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 no-min-h">
    <div className="w-8 h-8 rounded-[10px] bg-[#3D7BFF] flex items-center justify-center shadow-blue flex-shrink-0">
      <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none">
        <path d="M8 2L9.6 5.3 13.3 5.8 10.6 8.4 11.3 12 8 10.3 4.7 12 5.4 8.4 2.7 5.8 6.4 5.3Z" fill="currentColor"/>
      </svg>
    </div>
    <span className={`font-extrabold text-[18px] tracking-tight ${dark ? 'text-[#E9EEFF]' : 'text-white'}`} style={{letterSpacing:'-0.03em'}}>
      WishIT
    </span>
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

  const TYPE_CFG = {
    dream_approved:                  { bg: 'bg-[#0A2B22]',  color: 'text-[#2CE5A7]', icon: '✓' },
    dream_rejected:                  { bg: 'bg-[#2B1218]',      color: 'text-[#FF6E6E]',     icon: '✕' },
    fulfillment_received:            { bg: 'bg-[#12204A]',     color: 'text-[#6495FF]',    icon: '♡' },
    fulfillment_approved:            { bg: 'bg-[#1D1640]',   color: 'text-[#B79CFF]',  icon: '✦' },
    message:                         { bg: 'bg-[#0C2337]',      color: 'text-[#4FC7FF]',     icon: '◉' },
    connection_approved:             { bg: 'bg-[#0A2B22]',  color: 'text-[#2CE5A7]', icon: '◈' },
    fulfillment_completion_requested:{ bg: 'bg-[#2B1A10]',   color: 'text-[#FF9D5C]',  icon: '⟳' },
    dreamer_confirmation_pending:    { bg: 'bg-[#2B2110]',    color: 'text-[#FFB648]',   icon: '⏳' },
    dreamer_confirmation_needed:     { bg: 'bg-[#2B2110]',    color: 'text-[#FFB648]',   icon: '!' },
    dream_fulfilled_dreamer:         { bg: 'bg-[#0A2B22]',  color: 'text-[#2CE5A7]', icon: '★' },
    fulfillment_success:             { bg: 'bg-[#0A2B22]',  color: 'text-[#2CE5A7]', icon: '★' },
    case_completed:                  { bg: 'bg-[#0E1730]',    color: 'text-[#8B9AC2]',   icon: '✓' },
    more_support_needed:             { bg: 'bg-[#2B2110]',    color: 'text-[#FFB648]',   icon: '↩' },
    more_support_requested:          { bg: 'bg-[#12204A]',     color: 'text-[#6495FF]',    icon: '↩' },
  };
  const def = { bg: 'bg-[#0E1730]', color: 'text-[#8B9AC2]', icon: '◎' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.15, ease: [0.22,1,0.36,1] }}
      className="absolute right-0 top-full mt-2.5 w-[320px] bg-[#0B1222] rounded-2xl shadow-xl border border-[#1B2745] overflow-hidden z-50"
      style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 14px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#16213F]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#E9EEFF] text-[13.5px]">Notifications</span>
          {unread > 0 && (
            <span className="px-1.5 py-0.5 bg-[#3D7BFF] text-white text-[10px] font-bold rounded-full min-w-[18px] text-center">
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={markAll} className="text-[11.5px] text-[#6495FF] font-semibold hover:text-[#93B5FF] transition-colors no-min-h">
            Mark all read
          </button>
        )}
      </div>
      <div className="max-h-[300px] overflow-y-auto">
        {notifs.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <div className="text-2xl mb-2">🔔</div>
            <p className="text-[#5F6F9C] text-[13px]">No notifications yet</p>
          </div>
        ) : notifs.map((n) => {
          const ic = TYPE_CFG[n.type] || def;
          return (
            <div key={n.id}
              onClick={() => { onClose(); if (n.link) window.location.href = n.link; }}
              className={`flex items-start gap-3 px-4 py-3 border-b border-[#0C1428] hover:bg-[#0D152B] cursor-pointer transition-colors ${!n.read ? 'bg-[#12204A]/30' : ''}`}>
              <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 text-[13px] ${ic.bg} ${ic.color}`}>
                {ic.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[13px] leading-snug ${!n.read ? 'text-[#E9EEFF] font-semibold' : 'text-[#B5C2E4]'}`}>{n.title}</p>
                <p className="text-[11.5px] text-[#5F6F9C] mt-0.5 line-clamp-2">{n.body}</p>
              </div>
              {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-[#3D7BFF] flex-shrink-0 mt-1.5" />}
            </div>
          );
        })}
      </div>
      <Link to="/notifications" onClick={onClose}
        className="block text-center text-[12px] font-semibold text-[#6495FF] hover:text-[#93B5FF] py-3 border-t border-[#16213F] transition-colors no-min-h">
        View all →
      </Link>
    </motion.div>
  );
}

const DASHBOARD_PATHS = ['/dashboard', '/moderator', '/admin', '/messages', '/notifications', '/submit-dream'];

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [navVisible, setNavVisible] = useState(true);
  const notifRef = useRef(null);
  const dropRef = useRef(null);
  const hideTimer = useRef(null);

  const isLanding = location.pathname === '/';
  const transparent = isLanding && !scrolled;
  const dark = !transparent;

  const isDashboard = !!user && DASHBOARD_PATHS.some(p => location.pathname.startsWith(p));

  const showNav = useCallback(() => {
    setNavVisible(true);
    clearTimeout(hideTimer.current);
    if (isDashboard) {
      hideTimer.current = setTimeout(() => setNavVisible(false), 3000);
    }
  }, [isDashboard]);

  // Auto-hide on dashboard pages
  useEffect(() => {
    if (!isDashboard) {
      setNavVisible(true);
      clearTimeout(hideTimer.current);
      return;
    }
    // Start hide timer on mount / route change
    hideTimer.current = setTimeout(() => setNavVisible(false), 3000);

    const handleMouseMove = (e) => {
      if (e.clientY < 8) showNav();
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      clearTimeout(hideTimer.current);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDashboard, location.pathname, showNav]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 32);
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
    const fn = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const dashPath = profile?.role === 'admin' ? '/admin' : profile?.role === 'moderator' ? '/moderator' : '/dashboard';
  const handleLogout = async () => { await logout(); navigate('/'); };

  const NAV_LINKS = [['Explore', '/dreams'], ['How It Works', '/#how-it-works'], ['Stories', '/stories']];

  return (
    <>
      {/* Hover trigger zone — invisible strip at top when nav is hidden */}
      {isDashboard && !navVisible && (
        <div
          className="fixed top-0 inset-x-0 h-2 z-50"
          onMouseEnter={showNav}
        />
      )}
    <header
      onMouseEnter={() => isDashboard && clearTimeout(hideTimer.current)}
      onMouseLeave={() => isDashboard && (hideTimer.current = setTimeout(() => setNavVisible(false), 1500))}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        transparent
          ? 'bg-transparent'
          : 'bg-[#070C18]/85 backdrop-blur-xl border-b border-[#1B2745]'
      }`}
      style={{
        ...(dark ? { boxShadow: '0 1px 12px rgba(0,0,0,0.06)' } : {}),
        transform: navVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), background-color 0.3s, box-shadow 0.3s',
      }}>
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 h-[64px] flex items-center gap-4">

        <Logo dark={dark} />

        {/* Desktop nav links — centered */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-1">
          {NAV_LINKS.map(([label, to]) => {
            const active = to !== '/' && !to.includes('#') && location.pathname === to;
            return (
              <Link key={label} to={to}
                className={`px-4 py-2 rounded-xl text-[13.5px] font-semibold transition-colors no-min-h ${
                  active
                    ? dark ? 'text-[#6495FF] bg-[#12204A]' : 'text-white bg-white/15'
                    : dark ? 'text-[#B5C2E4] hover:text-[#E9EEFF] hover:bg-[#0E1730]' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}>
                {label}
              </Link>
            );
          })}
        </div>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          {user ? (
            <>
              {/* Notif bell */}
              <div ref={notifRef} className="relative">
                <button onClick={() => { setNotifOpen(!notifOpen); setDropOpen(false); }}
                  className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors no-min-h ${
                    dark ? 'text-[#8B9AC2] hover:text-[#E9EEFF] hover:bg-[#0E1730]' : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}>
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-[16px] h-[16px] bg-[#FF5C5C] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
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
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors no-min-h ${
                  dark ? 'text-[#8B9AC2] hover:text-[#E9EEFF] hover:bg-[#0E1730]' : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}>
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/>
                </svg>
              </Link>

              {/* User menu */}
              <div ref={dropRef} className="relative">
                <button onClick={() => { setDropOpen(!dropOpen); setNotifOpen(false); }}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-colors no-min-h ${
                    dark ? 'hover:bg-[#0E1730]' : 'hover:bg-white/10'
                  }`}>
                  <div className="w-7 h-7 rounded-[9px] bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                    {profile?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className={`text-[13px] font-semibold ${dark ? 'text-[#E9EEFF]' : 'text-white'}`}>
                    {profile?.name?.split(' ')[0]}
                  </span>
                  <svg className={`w-3.5 h-3.5 transition-transform ${dropOpen ? 'rotate-180' : ''} ${dark ? 'text-[#5F6F9C]' : 'text-white/50'}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                <AnimatePresence>
                  {dropOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.97 }}
                      transition={{ duration: 0.14 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-[#0B1222] rounded-2xl border border-[#1B2745] py-1.5 overflow-hidden z-50"
                      style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.11), 0 4px 14px rgba(0,0,0,0.06)' }}>
                      <div className="px-4 py-2.5 border-b border-[#16213F]">
                        <p className="text-[13px] font-bold text-[#E9EEFF]">{profile?.name}</p>
                        <p className="text-[11px] text-[#5F6F9C] mt-0.5 capitalize">{profile?.role} · Trust {profile?.trust_score || 100}</p>
                      </div>
                      {[
                        [dashPath, 'Dashboard'],
                        ['/submit-dream', 'Post a Dream'],
                        ['/messages', 'Messages'],
                        ['/notifications', 'Notifications'],
                      ].map(([to, label]) => (
                        <Link key={label} to={to}
                          className="flex items-center px-4 py-2 text-[13px] text-[#B5C2E4] hover:bg-[#0E1730] hover:text-[#E9EEFF] transition-colors no-min-h">
                          {label}
                        </Link>
                      ))}
                      <div className="border-t border-[#16213F] mt-1 pt-1">
                        <button onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2 text-[13px] text-[#FF6E6E] hover:bg-[#2B1218] transition-colors no-min-h">
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
                className={`px-4 py-2 rounded-xl text-[13.5px] font-semibold transition-colors no-min-h ${
                  dark ? 'text-[#B5C2E4] hover:text-[#E9EEFF] hover:bg-[#0E1730]' : 'text-white/75 hover:text-white hover:bg-white/10'
                }`}>
                Sign in
              </Link>
              <Link to="/register"
                className={`px-5 py-2 rounded-xl text-[13.5px] font-semibold transition-all no-min-h ${
                  dark
                    ? 'bg-[#3D7BFF] text-white hover:bg-[#5B8DFF] shadow-blue'
                    : 'bg-[#0B1222] text-[#E9EEFF] hover:bg-[#12204A] border border-white/20'
                }`}>
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden p-2 rounded-xl transition-colors no-min-h ${
            dark ? 'text-[#B5C2E4] hover:bg-[#0E1730]' : 'text-white hover:bg-white/10'
          }`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M3 6h18M3 12h18M3 18h18'}/>
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0B1222] border-t border-[#1B2745] overflow-hidden">
            <div className="px-5 py-4 space-y-1">
              {NAV_LINKS.map(([label, to]) => {
                const active = to !== '/' && !to.includes('#') && location.pathname === to;
                return (
                  <Link key={label} to={to}
                    className={`block px-3 py-2.5 text-[13.5px] font-semibold rounded-xl transition-colors ${
                      active ? 'bg-[#12204A] text-[#7FA8FF]' : 'text-[#B5C2E4] hover:bg-[#0E1730] hover:text-[#E9EEFF]'
                    }`}>
                    {label}
                  </Link>
                );
              })}
              <div className="pt-3 border-t border-[#16213F] mt-3 space-y-1">
                {user ? (
                  <>
                    <div className="flex items-center gap-2.5 px-3 py-2 mb-2">
                      <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[12px] font-bold">
                        {profile?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[#E9EEFF]">{profile?.name}</p>
                        <p className="text-[11px] text-[#5F6F9C] capitalize">{profile?.role}</p>
                      </div>
                    </div>
                    {[[dashPath,'Dashboard'],['/messages','Messages'],['/notifications',`Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`]].map(([to,label]) => (
                      <Link key={to} to={to} className="block px-3 py-2.5 text-[13.5px] font-medium text-[#B5C2E4] hover:bg-[#0E1730] rounded-xl transition-colors">{label}</Link>
                    ))}
                    <button onClick={handleLogout} className="block w-full text-left px-3 py-2.5 text-[13.5px] font-medium text-[#FF6E6E] hover:bg-[#2B1218] rounded-xl transition-colors no-min-h">
                      Sign out
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2.5 pt-1">
                    <Link to="/login" className="flex-1 text-center py-2.5 text-[13.5px] font-semibold text-[#B5C2E4] border border-[#1B2745] rounded-xl hover:bg-[#0E1730] transition-colors">
                      Sign in
                    </Link>
                    <Link to="/register" className="flex-1 text-center py-2.5 text-[13.5px] font-semibold text-white bg-[#3D7BFF] rounded-xl hover:bg-[#5B8DFF] transition-colors shadow-blue">
                      Get started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
    </>
  );
}
