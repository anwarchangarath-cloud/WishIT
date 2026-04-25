import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const MODES = [
  {
    id: 'dreamer',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
      </svg>
    ),
    label: 'I\'m a Dreamer',
    sub: 'Share my dream anonymously',
  },
  {
    id: 'fulfiller',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
      </svg>
    ),
    label: 'I\'m a Fulfiller',
    sub: 'Help make dreams come true',
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

  return (
    <div className="min-h-screen flex">
      {/* Left — brand panel */}
      <div className="hidden lg:flex lg:w-[52%] gradient-navy relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[350px] h-[350px] rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-blue">
            <svg className="w-5 h-5 text-white" viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5l1.8 3.6 4 .6-2.9 2.8.7 4L8 10.5l-3.6 1.9.7-4L2.2 5.7l4-.6L8 1.5z" fill="currentColor"/>
            </svg>
          </div>
          <span className="font-black text-2xl text-white tracking-tight">WishIT</span>
        </Link>

        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h1 className="text-5xl font-black text-white leading-tight mb-6">
              Some Dreams<br/>
              <span className="text-blue-400">Need The<br/>Right Person.</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-sm">
              Join a community where extraordinary things happen between strangers with the same heart.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="mt-10 grid grid-cols-2 gap-4">
            {[
              { number: '12,000+', label: 'Dreams shared' },
              { number: '8,400+', label: 'Dreams fulfilled' },
              { number: '100%', label: 'Anonymous & safe' },
              { number: '4.9★', label: 'User satisfaction' },
            ].map((s) => (
              <div key={s.label} className="glass-dark rounded-2xl p-4">
                <div className="text-2xl font-black text-white">{s.number}</div>
                <div className="text-slate-400 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400 text-xs font-medium">Moderated & trusted platform</span>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
          className="w-full max-w-md py-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1.5l1.8 3.6 4 .6-2.9 2.8.7 4L8 10.5l-3.6 1.9.7-4L2.2 5.7l4-.6L8 1.5z" fill="currentColor"/>
                </svg>
              </div>
              <span className="font-black text-xl text-slate-900 tracking-tight">WishIT</span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Create account</h2>
            <p className="text-slate-500">Join thousands making dreams real</p>
          </div>

          {/* Mode selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {MODES.map((m) => (
              <button key={m.id} type="button" onClick={() => setForm({ ...form, mode: m.id })}
                className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                  form.mode === m.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}>
                {form.mode === m.id && (
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                )}
                <div className={`mb-2 ${form.mode === m.id ? 'text-blue-600' : 'text-slate-400'}`}>{m.icon}</div>
                <div className={`font-bold text-sm ${form.mode === m.id ? 'text-blue-700' : 'text-slate-700'}`}>{m.label}</div>
                <div className={`text-xs mt-0.5 ${form.mode === m.id ? 'text-blue-500' : 'text-slate-400'}`}>{m.sub}</div>
              </button>
            ))}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-5 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p className="text-red-600 text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full name</label>
              <input type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
                className="input" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email address</label>
              <input type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="input" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className="input pr-12" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPass
                    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  }
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-blue disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
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

          <p className="text-center text-xs text-slate-400 mt-4">
            By creating an account you agree to our{' '}
            <Link to="/terms" className="text-blue-600 hover:underline">Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
          </p>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
