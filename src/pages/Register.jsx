import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const ease = [0.22, 1, 0.36, 1];

const MODES = [
  {
    id: 'dreamer',
    emoji: '✦',
    label: "I'm a Dreamer",
    sub: 'Share my dream anonymously',
    points: ['Full anonymity guaranteed', 'Human moderation', 'Safe connections only'],
    grad: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'fulfiller',
    emoji: '♡',
    label: "I'm a Fulfiller",
    sub: 'Help make dreams real',
    points: ['Browse vetted dreams', 'Make a real difference', 'Moderated connections'],
    grad: 'from-emerald-500 to-teal-600',
  },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', password: '', mode: params.get('mode') || 'dreamer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setError('');
    setLoading(true);
    try {
      await register(form.email, form.password, form.name, form.mode);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selected = MODES.find(m => m.id === form.mode);

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[46%] gradient-mesh noise relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-20 w-[440px] h-[440px] rounded-full blur-[130px]" style={{ background: 'rgba(37,99,235,0.14)' }} />
          <div className="absolute -bottom-20 -left-16 w-[360px] h-[360px] rounded-full blur-[110px]" style={{ background: 'rgba(79,70,229,0.10)' }} />
          <div className="absolute inset-0 dot-pattern opacity-50" />
        </div>

        <Link to="/" className="flex items-center gap-2.5 relative z-10 no-min-h">
          <div className="w-9 h-9 rounded-[11px] bg-blue-600 flex items-center justify-center shadow-blue">
            <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L9.6 5.3 13.3 5.8 10.6 8.4 11.3 12 8 10.3 4.7 12 5.4 8.4 2.7 5.8 6.4 5.3Z" fill="currentColor"/>
            </svg>
          </div>
          <span className="font-extrabold text-[18px] text-white" style={{ letterSpacing: '-0.03em' }}>WishIT</span>
        </Link>

        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ease }}>
            <h1 className="font-display text-white mb-5 italic" style={{ fontSize: 'clamp(2.25rem, 3.5vw, 3.25rem)', lineHeight: 1.08 }}>
              Some Dreams<br/>Need The<br/>Right Person.
            </h1>
            <p className="text-white/50 text-[14px] leading-[1.85] max-w-[260px]">
              Join a community where extraordinary things happen between strangers with the same heart.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, ease }}
            className="mt-10 grid grid-cols-2 gap-3">
            {[
              { n: '2,400+', l: 'Dreams shared' },
              { n: '890+',   l: 'Fulfilled' },
              { n: '100%',   l: 'Anonymous' },
              { n: '4.9★',   l: 'Satisfaction' },
            ].map((s) => (
              <div key={s.l} className="glass-dark rounded-[14px] p-3.5 border border-white/[0.07]">
                <div className="font-extrabold text-white text-[1.25rem]" style={{ letterSpacing: '-0.03em' }}>{s.n}</div>
                <div className="text-white/35 text-[11px] mt-0.5 font-medium">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white/30 text-[11.5px] font-medium">Moderated & trusted platform</span>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease }}
          className="w-full max-w-[400px] py-8">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Link to="/" className="flex items-center gap-2.5 no-min-h">
              <div className="w-8 h-8 rounded-[10px] bg-blue-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L9.6 5.3 13.3 5.8 10.6 8.4 11.3 12 8 10.3 4.7 12 5.4 8.4 2.7 5.8 6.4 5.3Z" fill="currentColor"/>
                </svg>
              </div>
              <span className="font-extrabold text-[18px] text-[#0A1628]" style={{ letterSpacing: '-0.03em' }}>WishIT</span>
            </Link>
          </div>

          <div className="mb-6">
            <h2 className="font-extrabold text-[#0A1628] mb-1.5" style={{ fontSize: '1.75rem', letterSpacing: '-0.03em' }}>Create account</h2>
            <p className="text-[#6B7A99] text-[13.5px]">Join thousands making dreams real</p>
          </div>

          {/* Mode selector — visual cards */}
          <div className="grid grid-cols-2 gap-2.5 mb-6">
            {MODES.map((m) => {
              const active = form.mode === m.id;
              return (
                <button key={m.id} type="button" onClick={() => setForm({ ...form, mode: m.id })}
                  className={`relative p-4 rounded-[16px] border-2 text-left transition-all duration-200 ${
                    active ? 'border-blue-600 bg-blue-50/60' : 'border-[#E4EAF4] hover:border-[#C8D5F0] bg-white'
                  }`}>
                  {active && (
                    <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                  )}
                  <div className={`text-xl mb-2.5 ${active ? 'text-blue-600' : 'text-[#9AAAC7]'}`}>{m.emoji}</div>
                  <div className={`font-bold text-[13px] ${active ? 'text-blue-700' : 'text-[#0A1628]'}`}>{m.label}</div>
                  <div className={`text-[11.5px] mt-0.5 ${active ? 'text-blue-500/80' : 'text-[#9AAAC7]'}`}>{m.sub}</div>
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-4 flex items-start gap-3 p-3.5 bg-red-50 border border-red-100 rounded-[14px]">
                <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p className="text-red-600 text-[13px]">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[12.5px] font-bold text-[#3D4F72] mb-1.5 uppercase tracking-[0.06em]">Full name</label>
              <input type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
                className="input" />
            </div>
            <div>
              <label className="block text-[12.5px] font-bold text-[#3D4F72] mb-1.5 uppercase tracking-[0.06em]">Email</label>
              <input type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="input" />
            </div>
            <div>
              <label className="block text-[12.5px] font-bold text-[#3D4F72] mb-1.5 uppercase tracking-[0.06em]">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className="input pr-12" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9AAAC7] hover:text-[#3D4F72] transition-colors no-min-h">
                  {showPass
                    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  }
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full h-[50px] bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-[14px] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
              style={{ fontSize: '14.5px', letterSpacing: '-0.01em', boxShadow: '0 4px 14px rgba(37,99,235,0.30)' }}>
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating account…
                </>
              ) : 'Create free account'}
            </button>
          </form>

          <p className="text-center text-[11px] text-[#9AAAC7] mt-4">
            By creating an account you agree to our{' '}
            <Link to="/terms" className="text-blue-500 hover:underline no-min-h">Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-blue-500 hover:underline no-min-h">Privacy Policy</Link>
          </p>

          <div className="mt-6 pt-5 border-t border-[#E4EAF4] text-center">
            <p className="text-[#6B7A99] text-[13px]">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 transition-colors no-min-h">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
