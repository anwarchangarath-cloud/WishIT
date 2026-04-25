import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => { await logout(); navigate('/'); };

  const dashboardPath = profile?.role === 'admin' ? '/admin' : profile?.role === 'moderator' ? '/moderator' : '/dashboard';

  const isLanding = location.pathname === '/';

  return (
    <nav className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
      scrolled || !isLanding ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-blue-50' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <span className="text-white font-black text-sm">W</span>
            </div>
            <span className={`font-black text-xl tracking-tight ${scrolled || !isLanding ? 'text-blue-900' : 'text-white'}`}>
              WishIT
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/dreams" className={`text-sm font-medium transition-colors ${scrolled || !isLanding ? 'text-gray-600 hover:text-blue-700' : 'text-white/80 hover:text-white'}`}>
              Explore Dreams
            </Link>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {profile?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{profile?.name?.split(' ')[0]}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-blue-50 py-2"
                    >
                      <Link to={dashboardPath} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                      </Link>
                      <Link to="/submit-dream" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Submit Dream
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant={scrolled || !isLanding ? 'ghost' : 'ghost'} size="sm"
                    className={scrolled || !isLanding ? '' : 'text-white hover:bg-white/10'}>
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant={scrolled || !isLanding ? 'primary' : 'white'} size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            <svg className={`w-6 h-6 ${scrolled || !isLanding ? 'text-blue-900' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="md:hidden bg-white border-t border-blue-50 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              <Link to="/dreams" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-gray-700">Explore Dreams</Link>
              {user ? (
                <>
                  <Link to={dashboardPath} onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-gray-700">Dashboard</Link>
                  <Link to="/submit-dream" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-gray-700">Submit Dream</Link>
                  <button onClick={handleLogout} className="block py-2 text-sm font-medium text-red-600">Sign Out</button>
                </>
              ) : (
                <div className="flex gap-3 pt-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1"><Button variant="secondary" className="w-full" size="sm">Sign In</Button></Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1"><Button className="w-full" size="sm">Get Started</Button></Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
