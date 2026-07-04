import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import Navbar from '../components/layout/Navbar';

const ease = [0.22, 1, 0.36, 1];
const TOTAL_STEPS = 6;
const STORAGE_KEY = 'wishit_draft_dream';

const CATEGORIES = [
  { value: 'Education',  emoji: '🎓' },
  { value: 'Health',     emoji: '🌿' },
  { value: 'Career',     emoji: '🚀' },
  { value: 'Community',  emoji: '🌍' },
  { value: 'Creative',   emoji: '🎨' },
  { value: 'Technology', emoji: '💡' },
  { value: 'Family',     emoji: '🏠' },
  { value: 'Other',      emoji: '✦' },
];

const URGENCY = [
  { value: 'normal',   label: 'Normal',   desc: 'No immediate pressure',    dot: '#94A3B8' },
  { value: 'urgent',   label: 'Urgent',   desc: 'Help needed within weeks', dot: '#FFB648' },
  { value: 'critical', label: 'Critical', desc: 'Immediate help needed',    dot: '#FF6E6E' },
];

const SUPPORT_OPTIONS = ['Skills', 'Mentorship', 'Funding', 'Resources', 'Connections', 'Other'];

const EMPTY = {
  title: '', story: '', category: '', urgency: 'normal',
  supportTypes: [], additionalInfo: '', anonymous: true,
};

/* ── Progress bar ── */
function ProgressBar({ step }) {
  const pct = Math.round(((step + 1) / TOTAL_STEPS) * 100);
  return (
    <div style={{ width: '100%', maxWidth: '420px', margin: '0 auto' }}>
      <div className="font-mono" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', color: '#5F6F9C' }}>STEP {step + 1} / {TOTAL_STEPS}</span>
        <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', color: '#4FE3FF' }}>{pct}%</span>
      </div>
      <div style={{ height: '3px', background: '#1B2745', borderRadius: '99px', overflow: 'hidden' }}>
        <motion.div
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease }}
          style={{ height: '100%', background: 'linear-gradient(90deg, #3D7BFF, #4FE3FF)', borderRadius: '99px', boxShadow: '0 0 12px rgba(79,227,255,0.5)' }}
        />
      </div>
    </div>
  );
}

/* ── Shared wrapper ── */
function Shell({ step, onBack, canBack, children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#05070F', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '80px' }}>
        <div style={{ padding: '24px 20px 0' }}>
          <ProgressBar step={step} />
        </div>
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '36px 20px',
        }}>
          <div style={{ width: '100%', maxWidth: '440px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease }}>
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        {canBack && (
          <div style={{ padding: '0 20px 24px', display: 'flex', justifyContent: 'center' }}>
            <button onClick={onBack} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#5F6F9C', fontSize: '13px', fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Question heading ── */
function Q({ children }) {
  return (
    <h2 className="font-display" style={{
      fontSize: 'clamp(1.5rem, 5vw, 2rem)', color: '#E9EEFF', fontWeight: 400,
      marginBottom: '8px', lineHeight: 1.15, letterSpacing: '-0.02em',
    }}>{children}</h2>
  );
}

function Hint({ children }) {
  return <p style={{ fontSize: '14px', color: '#8B9AC2', lineHeight: 1.7, marginBottom: '28px' }}>{children}</p>;
}

/* ── Continue button ── */
function ContinueBtn({ onClick, disabled = false, label = 'Continue →', loading = false }) {
  const active = !disabled && !loading;
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{
      width: '100%', height: '52px', marginTop: '24px',
      background: active ? '#3D7BFF' : '#1B2745',
      color: active ? '#fff' : '#5F6F9C',
      fontWeight: 700, fontSize: '15px', borderRadius: '14px',
      border: 'none', cursor: active ? 'pointer' : 'not-allowed',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      letterSpacing: '-0.01em',
      boxShadow: active ? '0 4px 14px rgba(61,123,255,0.28)' : 'none',
      transition: 'all 0.2s',
    }}>
      {loading ? 'Submitting…' : label}
    </button>
  );
}

export default function SubmitDream() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /* Restore draft on mount (returning from auth redirect) */
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        setForm(f => ({ ...f, ...draft }));
        if (user && draft.title) setStep(1);
      }
    } catch { /* ignore corrupt drafts */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const next = () => { setError(''); setStep(s => s + 1); };
  const back = () => { setError(''); setStep(s => s - 1); };

  /* After step 0: soft auth gate */
  const goAfterStep0 = () => {
    if (!form.title.trim()) { setError('Please enter your dream.'); return; }
    setError('');
    if (!user) {
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form)); } catch { /* ignore */ }
      navigate('/register?mode=dreamer');
      return;
    }
    next();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await api.submitDream({
        title: form.title,
        story: form.story,
        category: form.category,
        urgency: form.urgency,
        tags: form.supportTypes.join(', '),
        additionalInfo: form.additionalInfo,
        location: '',
        country: '',
        timeline: '',
        anonymous: true,
      });
      try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
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
      <div style={{ minHeight: '100vh', background: '#05070F', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 20px 40px' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            style={{
              width: '100%', maxWidth: '360px', textAlign: 'center',
              background: '#0B1222', borderRadius: '24px',
              padding: '40px', border: '1px solid #1B2745',
              boxShadow: '0 20px 60px rgba(0,0,0,0.09)',
            }}>
            <div style={{
              width: '64px', height: '64px', margin: '0 auto 24px',
              background: 'linear-gradient(135deg, #2CE5A7, #24C892)',
              borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(44,229,167,0.30)',
            }}>
              <svg style={{ width: '32px', height: '32px', color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#E9EEFF', letterSpacing: '-0.03em', marginBottom: '10px' }}>
              Dream Submitted!
            </h2>
            <p style={{ fontSize: '14px', color: '#8B9AC2', lineHeight: 1.75, marginBottom: '6px' }}>
              Your dream is now under review by our moderation team.
            </p>
            <p style={{ fontSize: '13px', color: '#5F6F9C', marginBottom: '28px' }}>
              We'll review it within 48 hours.
            </p>
            <button onClick={() => navigate('/dreams')} style={{
              width: '100%', height: '48px',
              background: '#3D7BFF', color: '#fff',
              fontWeight: 700, fontSize: '14px', borderRadius: '12px',
              border: 'none', cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              boxShadow: '0 4px 14px rgba(61,123,255,0.28)',
            }}>
              Explore Dreams
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ── Step 0: What is your dream? ── */
  if (step === 0) return (
    <Shell step={0} onBack={() => navigate(-1)} canBack>
      <Q>What is your dream?</Q>
      <Hint>A short, clear headline — what would change your life?</Hint>
      {error && <p style={{ color: '#FF6E6E', fontSize: '13px', marginBottom: '12px', marginTop: '-16px' }}>{error}</p>}
      <input
        value={form.title}
        onChange={e => set('title', e.target.value)}
        onKeyDown={e => e.key === 'Enter' && goAfterStep0()}
        placeholder="e.g. Complete my nursing degree"
        maxLength={120}
        autoFocus
        className="input input-lg"
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
        <span style={{ fontSize: '12px', color: '#5F6F9C' }}>Keep it clear and honest</span>
        <span style={{ fontSize: '12px', color: '#5F6F9C' }}>{form.title.length}/120</span>
      </div>
      <ContinueBtn onClick={goAfterStep0} disabled={!form.title.trim()} />
    </Shell>
  );

  /* ── Step 1: Tell us your story ── */
  if (step === 1) return (
    <Shell step={1} onBack={back} canBack>
      <Q>Tell us your story.</Q>
      <Hint>The more honest, the more powerful. Why does this dream matter to you?</Hint>
      {error && <p style={{ color: '#FF6E6E', fontSize: '13px', marginBottom: '12px', marginTop: '-16px' }}>{error}</p>}
      <textarea
        value={form.story}
        onChange={e => set('story', e.target.value)}
        rows={7}
        placeholder="Share what this dream means to you. Don't include personal contact details — your story is published anonymously."
        autoFocus
        className="input"
        style={{ borderRadius: '16px', fontSize: '15px', lineHeight: '1.7', resize: 'none' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
        <span style={{ fontSize: '12px', fontWeight: 500, color: form.story.length < 50 ? '#FFB648' : '#2CE5A7' }}>
          {form.story.length < 50 ? `${50 - form.story.length} more characters` : '✓ Looks good'}
        </span>
        <span style={{ fontSize: '12px', color: '#5F6F9C' }}>{form.story.length} chars</span>
      </div>
      <ContinueBtn
        onClick={() => { if (form.story.length < 50) { setError('Please write at least 50 characters.'); return; } next(); }}
        disabled={form.story.length < 50}
      />
    </Shell>
  );

  /* ── Step 2: What category fits best? ── */
  if (step === 2) return (
    <Shell step={2} onBack={back} canBack>
      <Q>What category fits best?</Q>
      <Hint>Pick the one that matches your dream most closely.</Hint>
      {error && <p style={{ color: '#FF6E6E', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        {CATEGORIES.map(cat => {
          const active = form.category === cat.value;
          return (
            <button key={cat.value} onClick={() => { set('category', cat.value); setError(''); }}
              className="no-min-h"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                padding: '14px 6px', borderRadius: '14px',
                border: active ? '2px solid #3D7BFF' : '2px solid #1B2745',
                background: active ? '#12204A' : '#0B1222',
                cursor: 'pointer', transition: 'all 0.15s',
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              }}>
              <span style={{ fontSize: '22px' }}>{cat.emoji}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: active ? '#3D7BFF' : '#E9EEFF', textAlign: 'center', lineHeight: 1.2 }}>
                {cat.value}
              </span>
            </button>
          );
        })}
      </div>
      <ContinueBtn
        onClick={() => { if (!form.category) { setError('Please pick a category.'); return; } next(); }}
        disabled={!form.category}
      />
    </Shell>
  );

  /* ── Step 3: How urgent is this? ── */
  if (step === 3) return (
    <Shell step={3} onBack={back} canBack>
      <Q>How urgent is this?</Q>
      <Hint>This helps fulfillers prioritise. Be honest.</Hint>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {URGENCY.map(u => {
          const active = form.urgency === u.value;
          return (
            <button key={u.value} onClick={() => set('urgency', u.value)}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '16px', borderRadius: '14px', textAlign: 'left',
                border: active ? '2px solid #3D7BFF' : '2px solid #1B2745',
                background: active ? '#12204A' : '#0B1222',
                cursor: 'pointer', transition: 'all 0.15s',
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: u.dot, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: '14px', color: active ? '#3D7BFF' : '#E9EEFF', margin: 0 }}>{u.label}</p>
                <p style={{ fontSize: '12px', color: active ? '#7FA8FF' : '#5F6F9C', margin: '2px 0 0' }}>{u.desc}</p>
              </div>
              {active && (
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#3D7BFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg style={{ width: '12px', height: '12px' }} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
      <ContinueBtn onClick={next} />
    </Shell>
  );

  /* ── Step 4: What kind of support do you need? ── */
  if (step === 4) return (
    <Shell step={4} onBack={back} canBack>
      <Q>What kind of support do you need?</Q>
      <Hint>Select all that apply.</Hint>
      {error && <p style={{ color: '#FF6E6E', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {SUPPORT_OPTIONS.map(opt => {
          const active = form.supportTypes.includes(opt);
          return (
            <button key={opt}
              className="no-min-h"
              onClick={() => {
                setError('');
                const updated = active
                  ? form.supportTypes.filter(t => t !== opt)
                  : [...form.supportTypes, opt];
                set('supportTypes', updated);
              }}
              style={{
                padding: '10px 18px', borderRadius: '99px',
                border: active ? '2px solid #3D7BFF' : '2px solid #1B2745',
                background: active ? '#3D7BFF' : '#0B1222',
                color: active ? '#fff' : '#B5C2E4',
                fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                transition: 'all 0.15s',
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              }}>
              {opt}
            </button>
          );
        })}
      </div>
      <ContinueBtn
        onClick={() => { if (form.supportTypes.length === 0) { setError('Please select at least one type.'); return; } next(); }}
        disabled={form.supportTypes.length === 0}
      />
    </Shell>
  );

  /* ── Step 5: Anything else? (optional) ── */
  if (step === 5) return (
    <Shell step={5} onBack={back} canBack>
      <Q>Anything else we should know?</Q>
      <Hint>Optional — any extra context that might help the right person find you.</Hint>
      {error && (
        <div style={{ marginBottom: '16px', padding: '12px 14px', background: '#2B1218', border: '1px solid #6E2833', borderRadius: '12px' }}>
          <p style={{ color: '#FF5C5C', fontSize: '13px', margin: 0 }}>{error}</p>
        </div>
      )}
      <textarea
        value={form.additionalInfo}
        onChange={e => set('additionalInfo', e.target.value)}
        rows={5}
        placeholder="Any extra details… (optional)"
        className="input"
        style={{ borderRadius: '16px', fontSize: '15px', lineHeight: '1.7', resize: 'none' }}
      />
      <ContinueBtn onClick={handleSubmit} loading={loading} label="Submit Dream" />
      {!loading && (
        <button onClick={handleSubmit} style={{
          width: '100%', marginTop: '12px', padding: '12px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#5F6F9C', fontSize: '13px', fontWeight: 600,
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}>
          Skip and submit
        </button>
      )}
    </Shell>
  );

  return null;
}
