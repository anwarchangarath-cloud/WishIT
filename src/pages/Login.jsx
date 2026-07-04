import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const ease = [0.22, 1, 0.36, 1];

export default function Login() {
  const { login, profile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      setTimeout(() => {
        const role = profile?.role;
        if (role === 'admin') navigate('/admin');
        else if (role === 'moderator') navigate('/moderator');
        else navigate('/dashboard');
      }, 500);
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[48%] gradient-mesh noise relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-24 w-[480px] h-[480px] rounded-full blur-[130px]" style={{ background: 'rgba(61,123,255,0.14)' }} />
          <div className="absolute -bottom-24 -right-16 w-[360px] h-[360px] rounded-full blur-[110px]" style={{ background: 'rgba(79,70,229,0.10)' }} />
          <div className="absolute inset-0 dot-pattern opacity-50" />
        </div>

        <Link to="/" className="flex items-center gap-2.5 relative z-10 no-min-h">
          <div className="w-9 h-9 rounded-[11px] bg-[#3D7BFF] flex items-center justify-center shadow-blue">
            <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L9.6 5.3 13.3 5.8 10.6 8.4 11.3 12 8 10.3 4.7 12 5.4 8.4 2.7 5.8 6.4 5.3Z" fill="currentColor"/>
            </svg>
          </div>
          <span className="font-extrabold text-[18px] text-white" style={{ letterSpacing: '-0.03em' }}>WishIT</span>
        </Link>

        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ease }}>
            <h1 className="font-display text-white mb-5 italic" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', lineHeight: 1.05 }}>
              Welcome<br/>back.
            </h1>
            <p className="text-white/55 text-[15px] leading-[1.85] max-w-[280px]">
              Every day, real dreams find their fulfillers here. Sign in and continue your journey.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, ease }} className="mt-10 space-y-3">
            {[
              { quote: 'My dream of starting a bakery became reality through this platform.', name: 'Priya M.', role: 'Dreamer' },
              { quote: 'Helping fulfill dreams is the most meaningful thing I do each month.', name: 'James K.', role: 'Fulfiller' },
            ].map((t) => (
              <div key={t.name} className="glass-dark rounded-[16px] p-4 border border-white/[0.07]">
                <p className="font-display text-white/75 text-[13.5px] leading-[1.75] italic">"{t.quote}"</p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-6 h-6 rounded-lg bg-[#3D7BFF] flex items-center justify-center text-white text-[10px] font-bold">{t.name[0]}</div>
                  <span className="text-[11px] text-white/40 font-medium">{t.name} · {t.role}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white/35 text-[11.5px] font-medium">Platform Online · Trusted by thousands</span>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#0B1222]">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease }}
          className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Link to="/" className="flex items-center gap-2.5 no-min-h">
              <div className="w-8 h-8 rounded-[10px] bg-[#3D7BFF] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L9.6 5.3 13.3 5.8 10.6 8.4 11.3 12 8 10.3 4.7 12 5.4 8.4 2.7 5.8 6.4 5.3Z" fill="currentColor"/>
                </svg>
              </div>
              <span className="font-extrabold text-[18px] text-[#E9EEFF]" style={{ letterSpacing: '-0.03em' }}>WishIT</span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="font-extrabold text-[#E9EEFF] mb-1.5" style={{ fontSize: '1.875rem', letterSpacing: '-0.03em' }}>Sign in</h2>
            <p className="text-[#8B9AC2] text-[14px]">Enter your credentials to continue</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-start gap-3 p-3.5 bg-[#2B1218] border border-[#4A1F28] rounded-[14px]">
              <svg className="w-4 h-4 text-[#FF6E6E] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p className="text-[#FF6E6E] text-[13px]">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12.5px] font-bold text-[#B5C2E4] mb-2 uppercase tracking-[0.06em]">Email</label>
              <input
                type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="input"
              />
            </div>

            <div>
              <label className="block text-[12.5px] font-bold text-[#B5C2E4] mb-2 uppercase tracking-[0.06em]">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="input pr-12"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5F6F9C] hover:text-[#B5C2E4] transition-colors no-min-h">
                  {showPass
                    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  }
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full h-[50px] bg-[#3D7BFF] hover:bg-[#5B8DFF] text-white font-bold rounded-[14px] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              style={{ fontSize: '14.5px', letterSpacing: '-0.01em', boxShadow: '0 4px 14px rgba(61,123,255,0.30)' }}>
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in…
                </>
              ) : 'Sign in'}
            </button>
          </form>

          <div className="mt-7 pt-6 border-t border-[#1B2745] text-center">
            <p className="text-[#8B9AC2] text-[13px]">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#6495FF] font-bold hover:text-[#7FA8FF] transition-colors no-min-h">
                Create one free
              </Link>
            </p>
          </div>

          {/* Trust signals */}
          <div className="mt-6 flex items-center justify-center gap-4">
            {['Anonymous','Moderated','Secure'].map(t => (
              <div key={t} className="flex items-center gap-1 text-[#5F6F9C] text-[11px] font-medium">
                <svg className="w-3 h-3 text-[#7FA8FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                {t}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
