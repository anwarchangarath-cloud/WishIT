import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const ease = [0.22, 1, 0.36, 1];

const CATS = ['All', 'Education', 'Health', 'Career', 'Family', 'Community', 'Creative', 'Travel', 'Technology', 'Other'];
const COUNTRIES = ['All', 'United States', 'United Kingdom', 'Canada', 'Australia', 'India', 'Nigeria', 'Kenya', 'Brazil', 'Germany', 'France', 'Other'];
const SORT_OPTIONS = [
  { value: 'recent',    label: 'Most Recent' },
  { value: 'supported', label: 'Most Supported' },
  { value: 'urgent',    label: 'Most Urgent' },
];
const BADGES = [
  { value: '',                   label: 'Any badge' },
  { value: 'verified',           label: 'Verified' },
  { value: 'urgent',             label: 'Urgent' },
  { value: 'community_supported',label: 'Community Supported' },
  { value: 'featured',           label: 'Featured' },
  { value: 'mod_recommended',    label: 'Mod Recommended' },
];

const CAT_CLS = {
  Career: 'cat-career', Health: 'cat-health', Education: 'cat-education',
  Community: 'cat-community', Creative: 'cat-creative', Technology: 'cat-technology',
  Family: 'cat-family', Travel: 'cat-travel', Other: 'cat-other',
};

const BADGE_CONFIG = {
  verified:            { label: 'Verified',     cls: 'badge-blue',   icon: '✓' },
  urgent:              { label: 'Urgent',        cls: 'badge-red',    icon: '!' },
  community_supported: { label: 'Community',     cls: 'badge-amber',  icon: '★' },
  featured:            { label: 'Featured',      cls: 'badge-violet', icon: '◆' },
  mod_recommended:     { label: 'Recommended',   cls: 'badge-green',  icon: '✦' },
};

const URGENCY_CONFIG = {
  critical: { label: 'Critical', cls: 'badge-red' },
  urgent:   { label: 'Urgent',   cls: 'badge-amber' },
  normal:   null,
};

const ACCENT_BARS = [
  'from-blue-500 to-indigo-500', 'from-violet-500 to-purple-500',
  'from-emerald-500 to-teal-500','from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500','from-sky-500 to-cyan-500',
];

const REPORT_REASONS = ['Inappropriate content', 'Spam or fake', 'Privacy concern', 'Misleading information', 'Other'];

function DreamBadge({ badge }) {
  if (!badge || badge === 'none' || !BADGE_CONFIG[badge]) return null;
  const cfg = BADGE_CONFIG[badge];
  return <span className={`badge ${cfg.cls}`}>{cfg.icon} {cfg.label}</span>;
}

function SaveButton({ dreamId, initialSaved, onToggle }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const toggle = async (e) => {
    e.stopPropagation();
    if (!user) return navigate('/login');
    setLoading(true);
    try {
      if (saved) { await api.unsaveDream(dreamId); setSaved(false); }
      else { await api.saveDream(dreamId); setSaved(true); }
      onToggle?.();
    } catch {}
    setLoading(false);
  };

  return (
    <button onClick={toggle} disabled={loading}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors no-min-h ${
        saved ? 'text-blue-600 bg-blue-50' : 'text-[#C0CBD9] hover:text-[#3D4F72] hover:bg-[#F4F7FB]'
      }`}>
      <svg className="w-3.5 h-3.5" fill={saved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z"/>
      </svg>
    </button>
  );
}

function DreamCard({ dream, onFulfill, onSupport, onReport, index = 0 }) {
  const urgency = URGENCY_CONFIG[dream.urgency];
  const accent = ACCENT_BARS[index % ACCENT_BARS.length];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: index * 0.04, ease }}
      className="group flex flex-col bg-white rounded-[20px] border border-[#E4EAF4] hover:border-[#C8D5F0] hover:shadow-float hover:-translate-y-1.5 transition-all duration-300 overflow-hidden">

      <div className={`h-[2px] w-full bg-gradient-to-r ${accent} flex-shrink-0`} />

      <div className="flex flex-col flex-1 p-5 pb-4">
        {/* Tags row */}
        <div className="flex items-start justify-between gap-2 mb-3.5">
          <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
            <span className={`badge ${CAT_CLS[dream.category] || 'cat-other'}`}>{dream.category}</span>
            <DreamBadge badge={dream.badge} />
            {urgency && <span className={`badge ${urgency.cls}`}>{urgency.label}</span>}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <SaveButton dreamId={dream.id} initialSaved={dream.is_saved} />
            <span className="badge badge-anon">
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              Anon
            </span>
          </div>
        </div>

        <h3 className="font-extrabold text-[#0A1628] text-[14.5px] leading-snug mb-2.5 group-hover:text-blue-600 transition-colors line-clamp-2" style={{ letterSpacing: '-0.02em' }}>
          {dream.title}
        </h3>
        <p className="text-[#6B7A99] text-[13px] leading-[1.75] flex-1 line-clamp-3">{dream.story}</p>

        <div className="flex items-center gap-3 mt-3 text-[11.5px] text-[#9AAAC7]">
          {dream.country && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              </svg>
              {dream.country}
            </span>
          )}
          {dream.timeline && <span>{dream.timeline}</span>}
        </div>

        {/* Support bar */}
        <div className="flex items-center gap-2.5 mt-3.5">
          <div className="flex-1 h-[3px] bg-[#EDF1F7] rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${accent} rounded-full transition-all duration-700`}
              style={{ width: `${Math.min(100, Math.round((dream.support_count || 0) / 1.5))}%` }} />
          </div>
          <button onClick={() => onSupport(dream.id)}
            className="flex items-center gap-1 text-[11.5px] font-semibold text-[#9AAAC7] hover:text-rose-500 transition-colors no-min-h">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            {dream.support_count || 0}
          </button>
        </div>
      </div>

      <div className="px-5 pb-5 space-y-2">
        <button onClick={() => onFulfill(dream)}
          className="w-full h-9 rounded-[12px] text-[12.5px] font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors no-min-h shadow-blue-sm">
          Make This Dream Real →
        </button>
        <button onClick={() => onReport(dream)}
          className="w-full h-7 rounded-[10px] text-[11px] font-medium text-[#C0CBD9] hover:text-[#6B7A99] hover:bg-[#F4F7FB] transition-colors no-min-h">
          Report
        </button>
      </div>
    </motion.div>
  );
}

function FilterPanel({ filters, setFilters, open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 w-72 bg-white z-50 overflow-y-auto"
            style={{ boxShadow: '-20px 0 60px rgba(10,22,40,0.12)' }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-[#0A1628] text-[15px]">Filters</h3>
                <button onClick={onClose} className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[#9AAAC7] hover:bg-[#F4F7FB] hover:text-[#3D4F72] transition-colors no-min-h">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[11.5px] font-bold text-[#6B7A99] mb-2.5 uppercase tracking-[0.10em]">Country</label>
                  <select value={filters.country} onChange={e => setFilters(f => ({ ...f, country: e.target.value }))}
                    className="input text-[13.5px]">
                    {COUNTRIES.map(c => <option key={c} value={c === 'All' ? '' : c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11.5px] font-bold text-[#6B7A99] mb-2.5 uppercase tracking-[0.10em]">Urgency</label>
                  <div className="space-y-1.5">
                    {[{ v: '', l: 'Any urgency' }, { v: 'critical', l: 'Critical' }, { v: 'urgent', l: 'Urgent' }, { v: 'normal', l: 'Normal' }].map(o => (
                      <button key={o.v} onClick={() => setFilters(f => ({ ...f, urgency: o.v }))}
                        className={`w-full text-left px-3.5 py-2.5 rounded-[12px] border text-[13px] transition-all no-min-h ${
                          filters.urgency === o.v
                            ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                            : 'border-[#E4EAF4] text-[#3D4F72] hover:border-[#C8D5F0]'
                        }`}>
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11.5px] font-bold text-[#6B7A99] mb-2.5 uppercase tracking-[0.10em]">Badge</label>
                  <div className="space-y-1.5">
                    {BADGES.map(b => (
                      <button key={b.value} onClick={() => setFilters(f => ({ ...f, badge: b.value }))}
                        className={`w-full text-left px-3.5 py-2.5 rounded-[12px] border text-[13px] transition-all no-min-h ${
                          filters.badge === b.value
                            ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                            : 'border-[#E4EAF4] text-[#3D4F72] hover:border-[#C8D5F0]'
                        }`}>
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11.5px] font-bold text-[#6B7A99] mb-2.5 uppercase tracking-[0.10em]">Sort By</label>
                  <div className="space-y-1.5">
                    {SORT_OPTIONS.map(s => (
                      <button key={s.value} onClick={() => setFilters(f => ({ ...f, sort: s.value }))}
                        className={`w-full text-left px-3.5 py-2.5 rounded-[12px] border text-[13px] transition-all no-min-h ${
                          filters.sort === s.value
                            ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                            : 'border-[#E4EAF4] text-[#3D4F72] hover:border-[#C8D5F0]'
                        }`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={() => setFilters({ country: '', urgency: '', badge: '', sort: 'recent' })}
                  className="w-full h-9 rounded-[12px] border border-[#E4EAF4] text-[13px] font-semibold text-[#6B7A99] hover:bg-[#F4F7FB] transition-colors no-min-h">
                  Clear Filters
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FulfillModal({ dream, onClose }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ why_help: '', how_fulfill: '', experience: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!dream) return null;

  const submit = async () => {
    if (!user) return navigate('/register?mode=fulfiller');
    if (!form.why_help.trim() || !form.how_fulfill.trim()) return;
    setLoading(true);
    try {
      await api.requestFulfillment(dream.id, form);
      setDone(true);
    } catch (e) { alert(e.message || 'Failed to submit.'); }
    setLoading(false);
  };

  if (done) return (
    <div className="text-center py-4 space-y-4">
      <div className="w-14 h-14 bg-emerald-50 rounded-[16px] flex items-center justify-center mx-auto">
        <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <h3 className="font-extrabold text-[#0A1628] text-[17px]" style={{ letterSpacing: '-0.03em' }}>Application Submitted!</h3>
      <p className="text-[#6B7A99] text-[13px] max-w-xs mx-auto">Our moderation team will review your request before any connection is made.</p>
      <button onClick={onClose} className="w-full h-10 rounded-[12px] bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors no-min-h text-[13.5px] shadow-blue">Done</button>
    </div>
  );

  const STEPS = ['Why You?', 'Your Plan', 'Review'];

  return (
    <div className="space-y-4">
      <div className="p-3.5 rounded-[14px] bg-[#F4F7FB] border border-[#E4EAF4]">
        <span className={`badge ${CAT_CLS[dream.category] || 'cat-other'} mb-2 inline-block`}>{dream.category}</span>
        <h3 className="font-bold text-[#0A1628] text-[13.5px]">{dream.title}</h3>
      </div>

      <div className="flex gap-1.5 mb-2">
        {STEPS.map((s, i) => (
          <div key={s} className={`flex-1 h-[3px] rounded-full transition-colors ${i <= step ? 'bg-blue-600' : 'bg-[#E4EAF4]'}`} />
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold text-[#3D4F72] mb-2 uppercase tracking-[0.08em]">Why do you want to help? <span className="text-red-400">*</span></label>
            <textarea value={form.why_help} onChange={e => setForm(f => ({ ...f, why_help: e.target.value }))} rows={4}
              placeholder="What connects you to this dream?"
              className="input resize-none text-[13.5px]" />
          </div>
          <div className="flex gap-2.5">
            <button onClick={onClose} className="flex-1 h-10 rounded-[12px] text-[13px] font-semibold text-[#3D4F72] border border-[#E4EAF4] hover:bg-[#F4F7FB] transition-colors no-min-h">Cancel</button>
            <button onClick={() => setStep(1)} disabled={!form.why_help.trim()}
              className="flex-1 h-10 rounded-[12px] text-[13px] font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-40 no-min-h shadow-blue">Continue</button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold text-[#3D4F72] mb-2 uppercase tracking-[0.08em]">How will you fulfill this? <span className="text-red-400">*</span></label>
            <textarea value={form.how_fulfill} onChange={e => setForm(f => ({ ...f, how_fulfill: e.target.value }))} rows={4}
              placeholder="Your specific plan, resources, skills..."
              className="input resize-none text-[13.5px]" />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-[#3D4F72] mb-2 uppercase tracking-[0.08em]">Relevant experience (optional)</label>
            <textarea value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} rows={2}
              placeholder="Background or credentials..."
              className="input resize-none text-[13.5px]" />
          </div>
          <div className="flex gap-2.5">
            <button onClick={() => setStep(0)} className="flex-1 h-10 rounded-[12px] text-[13px] font-semibold text-[#3D4F72] border border-[#E4EAF4] hover:bg-[#F4F7FB] transition-colors no-min-h">Back</button>
            <button onClick={() => setStep(2)} disabled={!form.how_fulfill.trim()}
              className="flex-1 h-10 rounded-[12px] text-[13px] font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-40 no-min-h shadow-blue">Review</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          {[
            { label: 'Why you?', value: form.why_help },
            { label: 'Your plan', value: form.how_fulfill },
            ...(form.experience ? [{ label: 'Experience', value: form.experience }] : []),
          ].map(({ label, value }) => (
            <div key={label} className="p-3.5 bg-[#F4F7FB] rounded-[12px] border border-[#E4EAF4]">
              <p className="text-[11px] text-[#9AAAC7] font-bold uppercase tracking-[0.08em] mb-1">{label}</p>
              <p className="text-[#3D4F72] text-[13px]">{value}</p>
            </div>
          ))}
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-[12px]">
            <p className="text-amber-700 text-[11.5px]">Your request will be reviewed by our moderation team before any connection is made.</p>
          </div>
          <div className="flex gap-2.5">
            <button onClick={() => setStep(1)} className="flex-1 h-10 rounded-[12px] text-[13px] font-semibold text-[#3D4F72] border border-[#E4EAF4] hover:bg-[#F4F7FB] transition-colors no-min-h">Back</button>
            <button onClick={submit} disabled={loading}
              className="flex-1 h-10 rounded-[12px] text-[13px] font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 no-min-h shadow-blue">
              {loading ? 'Submitting…' : 'Submit Application'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-[#BFDBFE] rounded-full text-[11.5px] font-semibold text-blue-700">
      {label}
      <button onClick={onRemove} className="hover:text-blue-900 transition-colors no-min-h">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </span>
  );
}

export default function Dreams() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState(searchParams.get('category') || 'All');
  const [filters, setFilters] = useState({ country: '', urgency: '', badge: '', sort: 'recent' });
  const [filterOpen, setFilterOpen] = useState(false);
  const [fulfillModal, setFulfillModal] = useState(null);
  const [reportModal, setReportModal] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');
  const searchTimer = useRef(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3200); };

  const fetchDreams = async () => {
    setLoading(true);
    try {
      const params = {};
      if (cat !== 'All') params.category = cat;
      if (filters.country) params.country = filters.country;
      if (filters.urgency) params.urgency = filters.urgency;
      if (filters.badge) params.badge = filters.badge;
      if (filters.sort) params.sort = filters.sort;
      if (search.trim()) params.search = search.trim();
      const data = await api.getPublicDreams(params);
      setDreams(data.dreams || []);
    } catch { setDreams([]); }
    setLoading(false);
  };

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(fetchDreams, search ? 400 : 0);
    return () => clearTimeout(searchTimer.current);
  }, [cat, filters, search]);

  const handleFulfill = (dream) => {
    if (!user) return navigate('/register?mode=fulfiller');
    setFulfillModal(dream);
  };

  const handleSupport = async (id) => {
    if (!user) return navigate('/login');
    try {
      await api.supportDream(id);
      showToast('Dream supported ♡');
      setDreams(d => d.map(dr => dr.id === id ? { ...dr, support_count: (dr.support_count || 0) + 1 } : dr));
    } catch { showToast('Could not support.'); }
  };

  const handleReport = (dream) => { if (!user) return navigate('/login'); setReportModal(dream); };

  const submitReport = async () => {
    if (!reportReason) return;
    setActionLoading(true);
    try {
      await api.reportDream(reportModal.id, reportReason, reportDetails);
      setReportModal(null); setReportReason(''); setReportDetails('');
      showToast('Report submitted. Thank you.');
    } catch { showToast('Failed to submit report.'); }
    setActionLoading(false);
  };

  const activeFiltersCount = [filters.country, filters.urgency, filters.badge, filters.sort !== 'recent' ? filters.sort : ''].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#F4F7FB] overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <div className="gradient-mesh pt-[80px] pb-12 relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-40 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-8 relative">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ ease }}>
            <div className="trust-badge mb-5 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Dream Marketplace
            </div>
            <h1 className="font-extrabold text-white mb-3 leading-tight" style={{ fontSize: 'clamp(1.875rem, 5vw, 2.875rem)', letterSpacing: '-0.04em' }}>
              Discover <span className="gradient-text-blue">Dreams</span>
            </h1>
            <p className="text-white/50 text-[14.5px] leading-[1.8] max-w-md">Every dream here is real, reviewed, and published anonymously. Find one that speaks to what you can offer.</p>
          </motion.div>
        </div>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-[60px] z-30 bg-white/95 backdrop-blur-xl border-b border-[#E4EAF4]" style={{ boxShadow: '0 1px 8px rgba(10,22,40,0.04)' }}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-2.5">
          <div className="flex items-center gap-2.5">
            {/* Search */}
            <div className="relative flex-shrink-0 w-36 sm:w-48">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9AAAC7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full pl-8 pr-3 py-2 border border-[#E4EAF4] rounded-[12px] text-[13px] focus:outline-none focus:border-blue-500 focus:ring-0 bg-[#F4F7FB] placeholder-[#9AAAC7] font-medium" />
            </div>

            {/* Category pills — scrollable */}
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide flex-1">
              {CATS.map(c => (
                <button key={c} onClick={() => setCat(c)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all no-min-h ${
                    cat === c
                      ? 'bg-blue-600 text-white shadow-blue-sm'
                      : 'bg-[#F4F7FB] text-[#3D4F72] hover:bg-[#EDF1F9] border border-[#E4EAF4]'
                  }`}>
                  {c}
                </button>
              ))}
            </div>

            {/* Sort (desktop) */}
            <div className="relative hidden lg:block flex-shrink-0">
              <select value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
                className="pl-3 pr-8 py-2 border border-[#E4EAF4] rounded-[12px] text-[12.5px] font-semibold text-[#3D4F72] focus:outline-none focus:border-blue-500 bg-[#F4F7FB] appearance-none cursor-pointer no-min-h">
                {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#9AAAC7] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>

            {/* Filter button */}
            <button onClick={() => setFilterOpen(true)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-[12px] border text-[12.5px] font-bold transition-colors no-min-h ${
                activeFiltersCount > 0 ? 'bg-blue-600 text-white border-blue-600 shadow-blue-sm' : 'border-[#E4EAF4] text-[#3D4F72] hover:bg-[#F4F7FB]'
              }`}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
              </svg>
              {activeFiltersCount > 0 ? `${activeFiltersCount}` : 'Filter'}
            </button>
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFiltersCount > 0 && (
        <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-4">
          <div className="flex flex-wrap gap-2 items-center">
            {filters.country && <Chip label={`📍 ${filters.country}`} onRemove={() => setFilters(f => ({ ...f, country: '' }))} />}
            {filters.urgency && <Chip label={`⚡ ${filters.urgency}`} onRemove={() => setFilters(f => ({ ...f, urgency: '' }))} />}
            {filters.badge && <Chip label={`✦ ${filters.badge}`} onRemove={() => setFilters(f => ({ ...f, badge: '' }))} />}
            {filters.sort !== 'recent' && <Chip label={`↕ ${SORT_OPTIONS.find(s=>s.value===filters.sort)?.label}`} onRemove={() => setFilters(f => ({ ...f, sort: 'recent' }))} />}
            <button onClick={() => setFilters({ country: '', urgency: '', badge: '', sort: 'recent' })}
              className="text-[11.5px] font-semibold text-[#9AAAC7] hover:text-[#3D4F72] transition-colors no-min-h">
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-5">
          <p className="text-[#6B7A99] text-[13.5px]">
            {loading ? 'Loading…' : <><span className="font-bold text-[#0A1628]">{dreams.length}</span> dreams found</>}
          </p>
          <Link to="/submit-dream">
            <button className="flex items-center gap-2 h-9 px-4 rounded-[12px] bg-blue-600 text-white text-[12.5px] font-bold hover:bg-blue-700 transition-colors no-min-h shadow-blue-sm">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
              Post Your Dream
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-[20px] border border-[#E4EAF4] p-5">
                <div className="h-[2px] bg-gradient-to-r from-[#E4EAF4] to-[#EDF1F7] rounded-full mb-5 skeleton" />
                <div className="flex gap-2 mb-4">
                  <div className="h-5 w-16 skeleton rounded-full" />
                  <div className="h-5 w-10 skeleton rounded-full" />
                </div>
                <div className="h-5 w-3/4 skeleton rounded mb-2.5" />
                <div className="h-3.5 w-full skeleton rounded mb-1.5" />
                <div className="h-3.5 w-5/6 skeleton rounded mb-1.5" />
                <div className="h-3.5 w-4/6 skeleton rounded mb-5" />
                <div className="h-8 skeleton rounded-[12px]" />
              </div>
            ))}
          </div>
        ) : dreams.length === 0 ? (
          <div className="text-center py-28">
            <div className="w-16 h-16 rounded-[20px] bg-[#EDF1F7] flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-[#C0CBD9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <h3 className="font-extrabold text-[#0A1628] text-[18px] mb-2" style={{ letterSpacing: '-0.03em' }}>No dreams found</h3>
            <p className="text-[#6B7A99] text-[13.5px] mb-6">Try adjusting your filters or search term</p>
            <button onClick={() => { setCat('All'); setSearch(''); setFilters({ country:'',urgency:'',badge:'',sort:'recent' }); }}
              className="px-5 py-2.5 rounded-[12px] bg-blue-600 text-white font-bold text-[13.5px] hover:bg-blue-700 transition-colors no-min-h shadow-blue">
              Clear all filters
            </button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {dreams.map((d, i) => (
                <DreamCard key={d.id} dream={d} index={i} onFulfill={handleFulfill} onSupport={handleSupport} onReport={handleReport} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <Footer />

      <FilterPanel filters={filters} setFilters={setFilters} open={filterOpen} onClose={() => setFilterOpen(false)} />

      {/* Fulfill Modal */}
      {fulfillModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div onClick={() => setFulfillModal(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.97, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ ease }}
            className="relative bg-white rounded-t-[24px] sm:rounded-[24px] p-5 w-full max-w-md max-h-[88vh] overflow-y-auto z-10"
            style={{ boxShadow: '0 32px 80px rgba(10,22,40,0.18)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-extrabold text-[#0A1628] text-[16px]" style={{ letterSpacing: '-0.02em' }}>Make This Dream Real</h2>
              <button onClick={() => setFulfillModal(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9AAAC7] hover:bg-[#F4F7FB] transition-colors no-min-h">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <FulfillModal dream={fulfillModal} onClose={() => setFulfillModal(null)} />
          </motion.div>
        </div>
      )}

      {/* Report Modal */}
      {reportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setReportModal(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ease }}
            className="relative bg-white rounded-[20px] p-5 w-full max-w-sm z-10"
            style={{ boxShadow: '0 32px 80px rgba(10,22,40,0.18)' }}>
            <h2 className="font-extrabold text-[#0A1628] text-[16px] mb-1" style={{ letterSpacing: '-0.02em' }}>Report this Dream</h2>
            <p className="text-[#6B7A99] text-[13px] mb-4">Select a reason below</p>
            <div className="space-y-1.5 mb-4">
              {REPORT_REASONS.map(r => (
                <button key={r} onClick={() => setReportReason(r)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-[12px] border text-[13px] transition-all no-min-h ${
                    reportReason === r ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' : 'border-[#E4EAF4] text-[#3D4F72] hover:border-[#C8D5F0]'
                  }`}>
                  {r}
                </button>
              ))}
            </div>
            {reportReason && (
              <textarea value={reportDetails} onChange={e => setReportDetails(e.target.value)} rows={2}
                placeholder="Additional details (optional)…"
                className="input resize-none text-[13.5px] mb-4" />
            )}
            <div className="flex gap-2.5">
              <button onClick={() => setReportModal(null)} className="flex-1 h-10 rounded-[12px] text-[13px] font-semibold text-[#3D4F72] border border-[#E4EAF4] hover:bg-[#F4F7FB] transition-colors no-min-h">Cancel</button>
              <button onClick={submitReport} disabled={!reportReason || actionLoading}
                className="flex-1 h-10 rounded-[12px] text-[13px] font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-40 no-min-h">
                {actionLoading ? 'Submitting…' : 'Report'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ ease }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-[#0A1628] text-white text-[13px] font-semibold rounded-[14px]"
            style={{ boxShadow: '0 8px 32px rgba(10,22,40,0.28)', maxWidth: '90vw', whiteSpace: 'nowrap' }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
