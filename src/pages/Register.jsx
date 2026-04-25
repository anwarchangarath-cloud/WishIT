import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const defaultMode = params.get('mode') || 'dreamer';

  const [form, setForm] = useState({ name: '', email: '', password: '', mode: defaultMode });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="text-white font-black text-lg">W</span>
            </div>
            <span className="text-white font-black text-2xl">WishIT</span>
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">Join WishIT</h1>
          <p className="text-blue-200">Where dreams meet their fulfillers</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
          )}

          {/* Mode selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {['dreamer', 'fulfiller'].map((m) => (
              <button key={m} type="button" onClick={() => setForm({ ...form, mode: m })}
                className={`p-4 rounded-2xl border-2 text-center transition-all duration-200 ${
                  form.mode === m
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-500 hover:border-blue-300'
                }`}>
                <div className="text-2xl mb-1">{m === 'dreamer' ? '✨' : '🤝'}</div>
                <div className="font-bold text-sm capitalize">{m}</div>
                <div className="text-xs mt-0.5 opacity-70">{m === 'dreamer' ? 'Share my dream' : 'Fulfill dreams'}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">Full Name</label>
              <input type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">Email Address</label>
              <input type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">Password</label>
              <input type="password" required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create Account
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            By creating an account you agree to our <Link to="/terms" className="text-blue-600">Terms</Link> and <Link to="/privacy" className="text-blue-600">Privacy Policy</Link>
          </p>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-800">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
