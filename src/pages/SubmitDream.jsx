import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import Navbar from '../components/layout/Navbar';

const CATEGORIES = ['Education', 'Health', 'Career', 'Family', 'Community', 'Creative', 'Travel', 'Technology', 'Other'];
const TIMELINES = ['Less than 1 month', '1-3 months', '3-6 months', '6-12 months', 'More than a year', 'Flexible'];

const STEPS = [
  { label: 'Dream Details', icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
    </svg>
  )},
  { label: 'Your Story', icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/>
    </svg>
  )},
  { label: 'Review', icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  )},
];

const CAT_COLORS = {
  Education: 'blue', Health: 'emerald', Career: 'violet', Family: 'rose',
  Community: 'orange', Creative: 'pink', Travel: 'cyan', Technology: 'indigo', Other: 'slate',
};

function CategoryPill({ cat, selected, onClick }) {
  const color = CAT_COLORS[cat] || 'slate';
  const active = `bg-${color}-600 text-white border-${color}-600`;
  const inactive = 'bg-white text-slate-600 border-slate-200 hover:border-slate-300';
  return (
    <button type="button" onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${selected ? 'border-blue-600 bg-blue-600 text-white' : inactive}`}>
      {cat}
    </button>
  );
}

export default function SubmitDream() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ title: '', story: '', category: '', timeline: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!profile) return null;

  const advance = () => {
    setError('');
    if (step === 0) {
      if (!form.title.trim()) return setError('Please enter a title for your dream.');
      if (!form.category) return setError('Please select a category.');
    }
    if (step === 1) {
      if (form.story.length < 50) return setError('Please write a more detailed story (at least 50 characters).');
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await api.submitDream(form);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit dream. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-screen p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md w-full text-center"
          >
            <div className="bg-white rounded-3xl p-10 shadow-card border border-slate-100">
              <div className="w-20 h-20 gradient-blue rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-blue">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-3">Dream Submitted!</h2>
              <p className="text-slate-500 leading-relaxed mb-2">Your dream is now under review by our moderation team.</p>
              <p className="text-slate-400 text-sm mb-8">We'll notify you once it's approved and published anonymously for fulfillers to discover.</p>

              <div className="p-4 bg-blue-50 rounded-2xl mb-8 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                  </div>
                  <span className="text-blue-700 text-sm font-bold">Anonymous & Private</span>
                </div>
                <p className="text-blue-600 text-xs leading-relaxed">Your identity stays completely hidden. Only your dream story will be visible to approved fulfillers.</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => navigate('/dashboard')}
                  className="flex-1 py-3 px-4 border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 transition-colors text-sm">
                  Dashboard
                </button>
                <button onClick={() => { setSubmitted(false); setStep(0); setForm({ title: '', story: '', category: '', timeline: '' }); }}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition-colors text-sm shadow-blue">
                  Submit Another
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="w-full max-w-2xl mx-auto px-6">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-blue-600 text-sm font-semibold">Anonymous Submission</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-3">Share Your Dream</h1>
            <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
              Your dream will be reviewed, then published anonymously. The right fulfiller will find you.
            </p>
          </div>

          {/* Progress stepper */}
          <div className="flex items-center mb-8">
            {STEPS.map((s, i) => (
              <div key={s.label} className="flex items-center flex-1">
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all font-bold text-sm ${
                    i < step ? 'bg-blue-600 text-white' :
                    i === step ? 'gradient-blue text-white shadow-blue' :
                    'bg-white border-2 border-slate-200 text-slate-400'
                  }`}>
                    {i < step
                      ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                      : s.icon
                    }
                  </div>
                  <span className={`hidden sm:block text-xs font-semibold transition-colors ${i <= step ? 'text-slate-700' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 rounded-full transition-all ${i < step ? 'bg-blue-600' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Form card */}
          <div className="bg-white rounded-3xl shadow-card border border-slate-100 overflow-hidden">
            <div className="p-8">
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
                  <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p className="text-red-600 text-sm">{error}</p>
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="step0"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Dream Title <span className="text-red-400">*</span></label>
                      <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Give your dream a clear, inspiring title…"
                        maxLength={120}
                        className="input" />
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-xs text-slate-400">This appears publicly (your identity stays anonymous)</p>
                        <span className="text-xs text-slate-400">{form.title.length}/120</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">Category <span className="text-red-400">*</span></label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                          <CategoryPill key={cat} cat={cat} selected={form.category === cat}
                            onClick={() => setForm({ ...form, category: cat })} />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Timeline</label>
                      <div className="relative">
                        <select value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                          className="input appearance-none pr-10">
                          <option value="">Select a timeline…</option>
                          {TIMELINES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="step1"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Your Dream Story <span className="text-red-400">*</span></label>
                      <textarea value={form.story} onChange={(e) => setForm({ ...form, story: e.target.value })}
                        rows={9}
                        placeholder="Tell us about your dream. Why is it important to you? What would it mean for your life? What kind of help or connection are you hoping for? Be as detailed as possible — a rich story helps fulfillers understand and connect with your dream."
                        className="input resize-none" />
                      <div className="flex items-center justify-between mt-1.5">
                        <p className={`text-xs ${form.story.length < 50 ? 'text-amber-500' : 'text-emerald-500'} font-medium`}>
                          {form.story.length < 50 ? `${50 - form.story.length} more characters needed` : 'Story looks great!'}
                        </p>
                        <span className="text-xs text-slate-400">{form.story.length} chars</span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
                      <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                      <div>
                        <p className="text-sm text-slate-700 font-semibold">Privacy Reminder</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Do not include your real name, phone number, email, or any personally identifying details. Your dream will be published anonymously.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }} className="space-y-5">
                    <h3 className="font-bold text-slate-900 text-lg">Review your dream</h3>

                    <div className="space-y-3">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-xs text-slate-400 font-medium mb-1">Title</p>
                        <p className="font-bold text-slate-900">{form.title}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-xs text-slate-400 font-medium mb-1">Category</p>
                          <p className="font-bold text-slate-900">{form.category || '—'}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-xs text-slate-400 font-medium mb-1">Timeline</p>
                          <p className="font-bold text-slate-900 text-sm">{form.timeline || '—'}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-xs text-slate-400 font-medium mb-2">Story</p>
                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-6">{form.story}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                      <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"/>
                      </svg>
                      <p className="text-sm text-amber-700">
                        By submitting, you confirm this dream is genuine and you haven't included personal contact information. Our moderators will review it before it goes live.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer nav */}
            <div className="px-8 pb-8 flex items-center justify-between gap-4">
              <button
                onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                </svg>
                {step === 0 ? 'Cancel' : 'Back'}
              </button>

              {step < 2 ? (
                <button onClick={advance}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-blue text-sm">
                  Continue
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-blue text-sm disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Submitting…
                    </>
                  ) : (
                    <>
                      Submit Dream
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
