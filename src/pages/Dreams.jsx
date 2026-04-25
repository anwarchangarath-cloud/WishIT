import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const CATS = ['All', 'Education', 'Health', 'Career', 'Family', 'Community', 'Creative', 'Travel', 'Technology', 'Other'];
const COUNTRIES = ['All', 'United States', 'United Kingdom', 'Canada', 'Australia', 'India', 'Nigeria', 'Kenya', 'Brazil', 'Germany', 'France', 'Other'];
const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'supported', label: 'Most Supported' },
  { value: 'urgent', label: 'Most Urgent' },
];
const BADGES = [
  { value: '', label: 'Any badge' },
  { value: 'verified', label: 'Verified' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'community_supported', label: 'Community Supported' },
  { value: 'featured', label: 'Featured' },
  { value: 'mod_recommended', label: 'Mod Recommended' },
];

const CAT_STYLE = {
  Career: 'bg-violet-50 text-violet-700 border-violet-100',
  Health: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Education: 'bg-blue-50 text-blue-700 border-blue-100',
  Community: 'bg-orange-50 text-orange-700 border-orange-100',
  Creative: 'bg-pink-50 text-pink-700 border-pink-100',
  Technology: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  Family: 'bg-red-50 text-red-700 border-red-100',
  Travel: 'bg-amber-50 text-amber-700 border-amber-100',
  Other: 'bg-slate-50 text-slate-600 border-slate-100',
};

const BADGE_CONFIG = {
  verified: { label: 'Verified', color: 'bg-blue-100 text-blue-700', icon: '✓' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700', icon: '!' },
  community_supported: { label: 'Community', color: 'bg-orange-100 text-orange-700', icon: '★' },
  featured: { label: 'Featured', color: 'bg-purple-100 text-purple-700', icon: '◆' },
  mod_recommended: { label: 'Recommended', color: 'bg-emerald-100 text-emerald-700', icon: '✦' },
};

const URGENCY_CONFIG = {
  critical: { label: 'Critical', color: 'text-red-600 bg-red-50 border-red-200' },
  urgent: { label: 'Urgent', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  normal: { label: '', color: '' },
};

const REPORT_REASONS = ['Inappropriate content', 'Spam or fake', 'Privacy concern', 'Misleading information', 'Other'];

function DreamBadge({ badge }) {
  if (!badge || badge === 'none' || !BADGE_CONFIG[badge]) return null;
  const cfg = BADGE_CONFIG[badge];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${cfg.color}`}>
      <span>{cfg.icon}</span>{cfg.label}
    </span>
  );
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
      className={`p-1.5 rounded-lg transition-colors ${saved ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
      title={saved ? 'Remove from saved' : 'Save dream'}>
      <svg className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z"/>
      </svg>
    </button>
  );
}

function DreamCard({ dream, onFulfill, onSupport, onReport }) {
  const urgency = URGENCY_CONFIG[dream.urgency];

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col group">
      <div className="p-6 flex flex-col flex-1">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex flex-wrap gap-1.5 flex-1">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex-shrink-0 ${CAT_STYLE[dream.category] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
              {dream.category}
            </span>
            <DreamBadge badge={dream.badge} />
            {urgency?.label && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${urgency.color}`}>
                {urgency.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <SaveButton dreamId={dream.id} initialSaved={dream.is_saved} />
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              Anon
            </span>
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-2.5 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
          {dream.title}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed flex-1 line-clamp-3">{dream.story}</p>

        {/* Meta */}
        <div className="flex items-center gap-3 mt-4 text-xs text-slate-400">
          {dream.country && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              </svg>
              {dream.country}
            </span>
          )}
          {dream.timeline && <span>{dream.timeline}</span>}
        </div>

        {/* Support bar */}
        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
              style={{ width: `${Math.min(100, Math.round((dream.support_count || 0) / 1.5))}%` }} />
          </div>
          <button onClick={() => onSupport(dream.id)}
            className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            {dream.support_count || 0}
          </button>
        </div>
      </div>

      <div className="px-6 pb-6 pt-0 space-y-2">
        <button onClick={() => onFulfill(dream)}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm active:scale-[0.98] transition-all duration-200">
          Make This Dream Real
        </button>
        <button onClick={() => onReport(dream)}
          className="w-full py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
          Report this dream
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
            onClick={onClose} className="fixed inset-0 bg-black/30 z-40 lg:hidden" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-white z-50 shadow-2xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900">Filters</h3>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Country</label>
                  <select value={filters.country} onChange={e => setFilters(f => ({ ...f, country: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {COUNTRIES.map(c => <option key={c} value={c === 'All' ? '' : c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Urgency</label>
                  <div className="space-y-2">
                    {[{ v: '', l: 'Any urgency' }, { v: 'critical', l: 'Critical' }, { v: 'urgent', l: 'Urgent' }, { v: 'normal', l: 'Normal' }].map(o => (
                      <button key={o.v} onClick={() => setFilters(f => ({ ...f, urgency: o.v }))}
                        className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${filters.urgency === o.v ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold' : 'border-slate-200 text-slate-700 hover:border-slate-300'}`}>
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Badge</label>
                  <div className="space-y-2">
                    {BADGES.map(b => (
                      <button key={b.value} onClick={() => setFilters(f => ({ ...f, badge: b.value }))}
                        className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${filters.badge === b.value ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold' : 'border-slate-200 text-slate-700 hover:border-slate-300'}`}>
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Sort by</label>
                  <div className="space-y-2">
                    {SORT_OPTIONS.map(s => (
                      <button key={s.value} onClick={() => setFilters(f => ({ ...f, sort: s.value }))}
                        className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${filters.sort === s.value ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold' : 'border-slate-200 text-slate-700 hover:border-slate-300'}`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={() => setFilters({ country: '', urgency: '', badge: '', sort: 'recent' })}
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
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
    } catch (e) {
      alert(e.message || 'Failed to submit.');
    }
    setLoading(false);
  };

  if (done) return (
    <div className="text-center space-y-4 py-4">
      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
        <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <h3 className="font-bold text-slate-900 text-lg">Application Submitted!</h3>
      <p className="text-slate-500 text-sm">Our moderation team will review your request before any connection is made.</p>
      <button onClick={onClose} className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors">Done</button>
    </div>
  );

  const STEPS = ['Why You?', 'Your Plan', 'Review'];

  return (
    <div className="space-y-5">
      {/* Dream preview */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${CAT_STYLE[dream.category] || ''} mb-2 inline-block`}>{dream.category}</span>
        <h3 className="font-bold text-slate-900 text-sm">{dream.title}</h3>
      </div>

      {/* Mini stepper */}
      <div className="flex gap-2 mb-1">
        {STEPS.map((s, i) => (
          <div key={s} className={`flex-1 h-1 rounded-full transition-colors ${i <= step ? 'bg-blue-600' : 'bg-slate-200'}`} />
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Why do you want to help? <span className="text-red-400">*</span></label>
            <textarea value={form.why_help} onChange={e => setForm(f => ({ ...f, why_help: e.target.value }))} rows={4}
              placeholder="What connects you to this dream? Why do you feel called to help?"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={() => setStep(1)} disabled={!form.why_help.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-40">Continue</button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">How will you fulfill this dream? <span className="text-red-400">*</span></label>
            <textarea value={form.how_fulfill} onChange={e => setForm(f => ({ ...f, how_fulfill: e.target.value }))} rows={4}
              placeholder="Describe your specific plan, resources, skills, or connections you'll use..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Relevant experience (optional)</label>
            <textarea value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} rows={2}
              placeholder="Any experience, credentials, or background relevant to this dream..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">Back</button>
            <button onClick={() => setStep(2)} disabled={!form.how_fulfill.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-40">Review</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-2 text-sm">
            <div className="p-3 bg-slate-50 rounded-xl"><p className="text-xs text-slate-400 mb-1">Why you?</p><p className="text-slate-700">{form.why_help}</p></div>
            <div className="p-3 bg-slate-50 rounded-xl"><p className="text-xs text-slate-400 mb-1">Your plan</p><p className="text-slate-700">{form.how_fulfill}</p></div>
            {form.experience && <div className="p-3 bg-slate-50 rounded-xl"><p className="text-xs text-slate-400 mb-1">Experience</p><p className="text-slate-700">{form.experience}</p></div>}
          </div>
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-amber-700 text-xs">Your request will be reviewed by our moderation team before any connection is made.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">Back</button>
            <button onClick={submit} disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50">
              {loading ? 'Submitting…' : 'Submit Application'}
            </button>
          </div>
        </div>
      )}
    </div>
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

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

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
    } catch {
      setDreams([]);
    }
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
      showToast('Dream supported!');
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
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <div className="gradient-navy pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-blue-400 text-sm font-semibold mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              Dream Marketplace
            </span>
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-4">Discover Dreams</h1>
            <p className="text-slate-400 text-lg">Every dream here is real, reviewed, and published anonymously. Find one that speaks to what you can offer.</p>
          </motion.div>
        </div>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search dreams..." className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* Category pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide flex-1">
              {CATS.map(c => (
                <button key={c} onClick={() => setCat(c)}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${cat === c ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {c}
                </button>
              ))}
            </div>

            {/* Sort (desktop) */}
            <select value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
              className="hidden lg:block px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            {/* Filter button */}
            <button onClick={() => setFilterOpen(true)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${activeFiltersCount > 0 ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
              </svg>
              Filters{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}
            </button>
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFiltersCount > 0 && (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-4">
          <div className="flex flex-wrap gap-2">
            {filters.country && <Chip label={`Country: ${filters.country}`} onRemove={() => setFilters(f => ({ ...f, country: '' }))} />}
            {filters.urgency && <Chip label={`Urgency: ${filters.urgency}`} onRemove={() => setFilters(f => ({ ...f, urgency: '' }))} />}
            {filters.badge && <Chip label={`Badge: ${filters.badge}`} onRemove={() => setFilters(f => ({ ...f, badge: '' }))} />}
            {filters.sort !== 'recent' && <Chip label={`Sort: ${SORT_OPTIONS.find(s => s.value === filters.sort)?.label}`} onRemove={() => setFilters(f => ({ ...f, sort: 'recent' }))} />}
            <button onClick={() => setFilters({ country: '', urgency: '', badge: '', sort: 'recent' })}
              className="px-3 py-1 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors">
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-500 text-sm">
            {loading ? 'Loading…' : <><span className="font-bold text-slate-900">{dreams.length}</span> dreams found</>}
          </p>
          <Link to="/submit-dream">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-sm transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              Post Your Dream
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded-full w-20 mb-4" />
                <div className="h-5 bg-slate-200 rounded-full w-3/4 mb-2" />
                <div className="h-4 bg-slate-200 rounded-full w-full mb-1" />
                <div className="h-4 bg-slate-200 rounded-full w-5/6" />
              </div>
            ))}
          </div>
        ) : dreams.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <h3 className="font-bold text-slate-900 text-xl mb-2">No dreams found</h3>
            <p className="text-slate-500 text-sm">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {dreams.map(d => (
                <DreamCard key={d.id} dream={d} onFulfill={handleFulfill} onSupport={handleSupport} onReport={handleReport} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <Footer />

      {/* Filter panel */}
      <FilterPanel filters={filters} setFilters={setFilters} open={filterOpen} onClose={() => setFilterOpen(false)} />

      {/* Fulfill Modal */}
      {fulfillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setFulfillModal(null)} className="absolute inset-0 bg-black/50" />
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-900 text-lg">Make This Dream Real</h2>
              <button onClick={() => setFulfillModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <FulfillModal dream={fulfillModal} onClose={() => setFulfillModal(null)} />
          </motion.div>
        </div>
      )}

      {/* Report Modal */}
      {reportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setReportModal(null)} className="absolute inset-0 bg-black/50" />
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="font-bold text-slate-900 text-lg mb-1">Report this Dream</h2>
            <p className="text-slate-500 text-sm mb-5">Select a reason below</p>
            <div className="space-y-2 mb-4">
              {REPORT_REASONS.map(r => (
                <button key={r} onClick={() => setReportReason(r)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${reportReason === r ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold' : 'border-slate-200 text-slate-700 hover:border-slate-300'}`}>
                  {r}
                </button>
              ))}
            </div>
            {reportReason && (
              <textarea value={reportDetails} onChange={e => setReportDetails(e.target.value)} rows={2}
                placeholder="Additional details (optional)..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4" />
            )}
            <div className="flex gap-3">
              <button onClick={() => setReportModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={submitReport} disabled={!reportReason || actionLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-40">
                {actionLoading ? 'Submitting…' : 'Submit Report'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 bg-slate-900 text-white text-sm font-semibold rounded-2xl shadow-2xl">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-xs font-semibold text-blue-700">
      {label}
      <button onClick={onRemove} className="hover:text-blue-900 transition-colors">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </span>
  );
}
