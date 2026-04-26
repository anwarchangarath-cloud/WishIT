import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import Navbar from '../components/layout/Navbar';

const ease = [0.22, 1, 0.36, 1];

/* ── Category options with icons ── */
const CATEGORIES = [
  { value: 'Education',  emoji: '🎓', color: 'from-blue-500 to-blue-700' },
  { value: 'Health',     emoji: '🌿', color: 'from-emerald-500 to-teal-600' },
  { value: 'Career',     emoji: '🚀', color: 'from-violet-500 to-purple-700' },
  { value: 'Family',     emoji: '🏠', color: 'from-rose-500 to-pink-600' },
  { value: 'Community',  emoji: '🌍', color: 'from-orange-500 to-amber-600' },
  { value: 'Creative',   emoji: '🎨', color: 'from-pink-500 to-fuchsia-600' },
  { value: 'Travel',     emoji: '✈️',  color: 'from-amber-500 to-yellow-600' },
  { value: 'Technology', emoji: '💡', color: 'from-cyan-500 to-sky-600' },
  { value: 'Other',      emoji: '✦',  color: 'from-slate-500 to-slate-600' },
];

/* ── Urgency options ── */
const URGENCY = [
  { value: 'normal',   label: 'No rush',        desc: 'I have time to wait',          dot: 'bg-slate-400' },
  { value: 'urgent',   label: 'Soon',            desc: 'Help needed within weeks',     dot: 'bg-amber-400' },
  { value: 'critical', label: 'Urgent',          desc: 'Immediate help needed',        dot: 'bg-red-500' },
];

/* ── Timeline options ── */
const TIMELINES = [
  { value: 'Less than 1 month', label: '< 1 month' },
  { value: '1-3 months',        label: '1–3 months' },
  { value: '3-6 months',        label: '3–6 months' },
  { value: '6-12 months',       label: '6–12 months' },
  { value: 'More than a year',  label: '1+ year' },
  { value: 'Flexible',          label: 'Flexible' },
];

/* ── Country list ── */
const COUNTRIES = ['Afghanistan','Australia','Brazil','Canada','China','Egypt','Ethiopia','France','Germany','Ghana','India','Indonesia','Japan','Kenya','Mexico','Netherlands','Nigeria','Pakistan','Russia','Saudi Arabia','South Africa','South Korea','Spain','Turkey','Uganda','Ukraine','United Kingdom','United States','Vietnam','Zimbabwe','Other'];

/* ── Step config (wizard steps) ── */
const TOTAL_STEPS = 5;

function ProgressBar({ step }) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11.5px] font-semibold text-[#9AAAC7]">Step {step + 1} of {TOTAL_STEPS}</span>
        <span className="text-[11.5px] font-semibold text-[#9AAAC7]">{Math.round(((step + 1) / TOTAL_STEPS) * 100)}%</span>
      </div>
      <div className="h-[3px] bg-[#E4EAF4] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
          initial={false}
          animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
          transition={{ duration: 0.4, ease }}
        />
      </div>
    </div>
  );
}

function WizardShell({ step, onBack, canBack, children }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col pt-20 pb-10">
        {/* Top progress */}
        <div className="px-5 pt-6 pb-0">
          <ProgressBar step={step} />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-5 py-10">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.28, ease }}>
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Back button */}
        {canBack && (
          <div className="px-5 pb-4 flex justify-center">
            <button onClick={onBack}
              className="flex items-center gap-1.5 text-[#9AAAC7] text-[13px] font-semibold hover:text-[#3D4F72] transition-colors no-min-h">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function NextBtn({ onClick, label = 'Continue', disabled = false, loading = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full h-[52px] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-[16px] transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-6"
      style={{ fontSize: '15px', letterSpacing: '-0.01em', boxShadow: disabled ? 'none' : '0 4px 14px rgba(37,99,235,0.28)' }}>
      {loading ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          {label}
        </>
      ) : (
        <>
          {label}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </>
      )}
    </button>
  );
}

function StepLabel({ children }) {
  return <p className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-blue-600 mb-3">{children}</p>;
}

function StepTitle({ children }) {
  return (
    <h2 className="font-extrabold text-[#0A1628] mb-2.5" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
      {children}
    </h2>
  );
}

function StepSub({ children }) {
  return <p className="text-[#6B7A99] text-[14px] leading-[1.7] mb-7">{children}</p>;
}

export default function SubmitDream() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: '', story: '', category: '', timeline: '', urgency: 'normal',
    location: '', country: '', tags: '', anonymous: true,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!profile) return null;

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const next = (validate) => {
    if (validate) {
      const err = validate();
      if (err) { setError(err); return; }
    }
    setError('');
    setStep(s => s + 1);
  };

  const back = () => { setError(''); setStep(s => s - 1); };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean).join(',') : '',
      };
      await api.submitDream(payload);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F4F7FB]">
        <Navbar />
        <div className="pt-20 min-h-screen flex items-center justify-center p-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="max-w-sm w-full text-center">
            <div className="bg-white rounded-[24px] p-10 border border-[#E4EAF4]" style={{ boxShadow: '0 20px 60px rgba(10,22,40,0.09)' }}>
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5, ease }}
                className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-[20px] flex items-center justify-center mx-auto mb-6"
                style={{ boxShadow: '0 8px 24px rgba(16,185,129,0.30)' }}>
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </motion.div>
              <h2 className="font-extrabold text-[#0A1628] mb-2.5" style={{ fontSize: '1.5rem', letterSpacing: '-0.03em' }}>Dream Submitted!</h2>
              <p className="text-[#6B7A99] text-[13.5px] leading-[1.75] mb-2">Your dream is now under review by our moderation team.</p>
              <p className="text-[#9AAAC7] text-[12.5px] mb-7">We'll notify you once it's approved and published anonymously.</p>

              <div className="p-4 bg-blue-50/70 border border-[#BFDBFE] rounded-[16px] mb-7 text-left">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                  </div>
                  <span className="text-blue-700 text-[12.5px] font-bold">Anonymous & Private</span>
                </div>
                <p className="text-blue-600/75 text-[11.5px] leading-[1.65]">Your identity stays hidden. Only your dream story will be visible to approved fulfillers.</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => navigate('/dashboard')}
                  className="flex-1 h-10 border border-[#E4EAF4] text-[#3D4F72] font-semibold rounded-[12px] hover:bg-[#F4F7FB] transition-colors text-[13px] no-min-h">
                  Dashboard
                </button>
                <button onClick={() => { setSubmitted(false); setStep(0); setForm({ title:'',story:'',category:'',timeline:'',urgency:'normal',location:'',country:'',tags:'',anonymous:true }); }}
                  className="flex-1 h-10 bg-blue-600 text-white font-semibold rounded-[12px] hover:bg-blue-700 transition-colors text-[13px] no-min-h shadow-blue">
                  Another
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ── Step 0: Category ── */
  if (step === 0) return (
    <WizardShell step={0} onBack={() => navigate(-1)} canBack>
      <StepLabel>Step 1 of {TOTAL_STEPS}</StepLabel>
      <StepTitle>What's your dream about?</StepTitle>
      <StepSub>Pick the category that fits best.</StepSub>

      {error && <p className="text-red-500 text-[13px] mb-4 -mt-2">{error}</p>}

      <div className="grid grid-cols-3 gap-2.5">
        {CATEGORIES.map((cat) => {
          const active = form.category === cat.value;
          return (
            <button key={cat.value} onClick={() => set('category', cat.value)}
              className={`flex flex-col items-center gap-2 p-3.5 rounded-[16px] border-2 transition-all duration-200 no-min-h ${
                active ? 'border-blue-600 bg-blue-50/70' : 'border-[#E4EAF4] hover:border-[#C8D5F0] bg-white'
              }`}>
              <span className="text-2xl">{cat.emoji}</span>
              <span className={`text-[11.5px] font-bold text-center leading-tight ${active ? 'text-blue-700' : 'text-[#0A1628]'}`}>
                {cat.value}
              </span>
            </button>
          );
        })}
      </div>

      <NextBtn
        disabled={!form.category}
        onClick={() => next(() => !form.category ? 'Please select a category.' : null)}
        label="Continue"
      />
    </WizardShell>
  );

  /* ── Step 1: Title ── */
  if (step === 1) return (
    <WizardShell step={1} onBack={back} canBack>
      <StepLabel>Step 2 of {TOTAL_STEPS}</StepLabel>
      <StepTitle>Give your dream a title.</StepTitle>
      <StepSub>A short, clear headline for your dream.</StepSub>

      {error && <p className="text-red-500 text-[13px] mb-3 -mt-4">{error}</p>}

      <input
        value={form.title}
        onChange={e => set('title', e.target.value)}
        placeholder="e.g. Complete my CS degree"
        maxLength={120}
        className="input input-lg"
        autoFocus
      />
      <div className="flex justify-between mt-1.5">
        <span className="text-[11.5px] text-[#9AAAC7]">Keep it short and clear</span>
        <span className="text-[11.5px] text-[#9AAAC7]">{form.title.length}/120</span>
      </div>

      <NextBtn
        disabled={!form.title.trim()}
        onClick={() => next(() => !form.title.trim() ? 'Please enter a title.' : null)}
        label="Continue"
      />
    </WizardShell>
  );

  /* ── Step 2: Story ── */
  if (step === 2) return (
    <WizardShell step={2} onBack={back} canBack>
      <StepLabel>Step 3 of {TOTAL_STEPS}</StepLabel>
      <StepTitle>Tell your story.</StepTitle>
      <StepSub>Why does this dream matter to you? What would it change?</StepSub>

      {error && <p className="text-red-500 text-[13px] mb-3 -mt-4">{error}</p>}

      <textarea
        value={form.story}
        onChange={e => set('story', e.target.value)}
        rows={7}
        placeholder="Share what this dream means to you. Be honest and personal — your story is what connects you to the right fulfiller."
        className="input resize-none"
        style={{ borderRadius: '16px', fontSize: '15px', lineHeight: '1.7' }}
        autoFocus
      />
      <div className="flex justify-between mt-1.5">
        <span className={`text-[11.5px] font-medium ${form.story.length < 50 ? 'text-amber-500' : 'text-emerald-500'}`}>
          {form.story.length < 50 ? `${50 - form.story.length} more characters needed` : '✓ Looks good'}
        </span>
        <span className="text-[11.5px] text-[#9AAAC7]">{form.story.length} chars</span>
      </div>

      <div className="mt-4 flex items-start gap-2.5 p-3 bg-[#F4F7FB] rounded-[12px] border border-[#E4EAF4]">
        <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>
        <p className="text-[#6B7A99] text-[12px] leading-[1.6]">Don't include your real name, phone, or email. Your dream is published anonymously.</p>
      </div>

      <NextBtn
        disabled={form.story.length < 50}
        onClick={() => next(() => form.story.length < 50 ? 'Please write at least 50 characters.' : null)}
        label="Continue"
      />
    </WizardShell>
  );

  /* ── Step 3: Urgency + Timeline ── */
  if (step === 3) return (
    <WizardShell step={3} onBack={back} canBack>
      <StepLabel>Step 4 of {TOTAL_STEPS}</StepLabel>
      <StepTitle>How urgent is this?</StepTitle>
      <StepSub>This helps fulfillers prioritize. Be honest.</StepSub>

      <div className="space-y-2.5 mb-6">
        {URGENCY.map((u) => {
          const active = form.urgency === u.value;
          return (
            <button key={u.value} onClick={() => set('urgency', u.value)}
              className={`w-full flex items-center gap-4 p-4 rounded-[14px] border-2 text-left transition-all no-min-h ${
                active ? 'border-blue-600 bg-blue-50/60' : 'border-[#E4EAF4] hover:border-[#C8D5F0] bg-white'
              }`}>
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${u.dot}`} />
              <div>
                <p className={`font-bold text-[14px] ${active ? 'text-blue-700' : 'text-[#0A1628]'}`}>{u.label}</p>
                <p className={`text-[12px] mt-0.5 ${active ? 'text-blue-500/80' : 'text-[#9AAAC7]'}`}>{u.desc}</p>
              </div>
              {active && (
                <div className="ml-auto w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-[12.5px] font-bold text-[#3D4F72] mb-2.5 uppercase tracking-[0.08em]">Timeline (optional)</p>
      <div className="flex flex-wrap gap-2">
        {TIMELINES.map((t) => (
          <button key={t.value} onClick={() => set('timeline', form.timeline === t.value ? '' : t.value)}
            className={`px-3.5 py-2 rounded-[10px] border text-[12.5px] font-semibold transition-all no-min-h ${
              form.timeline === t.value ? 'border-blue-600 bg-blue-600 text-white' : 'border-[#E4EAF4] text-[#3D4F72] hover:border-[#C8D5F0] bg-white'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <NextBtn onClick={() => { setError(''); setStep(4); }} label="Continue" />
    </WizardShell>
  );

  /* ── Step 4: Location + Review ── */
  if (step === 4) return (
    <WizardShell step={4} onBack={back} canBack>
      <StepLabel>Step 5 of {TOTAL_STEPS}</StepLabel>
      <StepTitle>Last step. Review & submit.</StepTitle>
      <StepSub>Check your dream details before submitting.</StepSub>

      {error && (
        <div className="mb-4 flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-[12px]">
          <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-red-600 text-[13px]">{error}</p>
        </div>
      )}

      {/* Location fields — minimal */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label className="block text-[11.5px] font-bold text-[#6B7A99] mb-1.5 uppercase tracking-[0.08em]">Country</label>
          <div className="relative">
            <select value={form.country} onChange={e => set('country', e.target.value)}
              className="input appearance-none pr-8 text-[13.5px]">
              <option value="">Select…</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9AAAC7] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>
        <div>
          <label className="block text-[11.5px] font-bold text-[#6B7A99] mb-1.5 uppercase tracking-[0.08em]">Region</label>
          <input value={form.location} onChange={e => set('location', e.target.value)}
            placeholder="City or region"
            className="input text-[13.5px]" />
        </div>
      </div>

      {/* Review card */}
      <div className="bg-[#F4F7FB] rounded-[16px] border border-[#E4EAF4] p-5 mb-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-extrabold text-[#0A1628] text-[15px] leading-snug mb-1" style={{ letterSpacing: '-0.02em' }}>{form.title}</p>
            <div className="flex items-center gap-2">
              <span className={`badge ${CATEGORIES.find(c=>c.value===form.category)?.value ? `cat-${form.category.toLowerCase()}` : 'badge-slate'}`}>{form.category}</span>
              {form.urgency !== 'normal' && (
                <span className={`badge ${form.urgency === 'critical' ? 'badge-red' : 'badge-amber'} capitalize`}>{form.urgency}</span>
              )}
            </div>
          </div>
          <button onClick={() => setStep(0)} className="text-[11.5px] text-blue-500 font-semibold hover:text-blue-700 no-min-h">Edit</button>
        </div>
        <p className="text-[#6B7A99] text-[12.5px] leading-[1.7] line-clamp-3">{form.story}</p>
        {(form.country || form.timeline) && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#E4EAF4]">
            {form.country && <span className="text-[11.5px] text-[#9AAAC7]">📍 {form.country}</span>}
            {form.timeline && <span className="text-[11.5px] text-[#9AAAC7]">⏱ {form.timeline}</span>}
          </div>
        )}
      </div>

      <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-[12px] mb-1">
        <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
        </svg>
        <p className="text-amber-700 text-[12px] leading-[1.6]">By submitting, you confirm this dream is genuine and contains no personal contact information.</p>
      </div>

      <NextBtn
        onClick={handleSubmit}
        label={loading ? 'Submitting…' : 'Submit Dream'}
        loading={loading}
      />
    </WizardShell>
  );

  return null;
}
