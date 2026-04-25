import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const CATEGORIES = ['All', 'Education', 'Health', 'Career', 'Family', 'Community', 'Creative', 'Travel', 'Technology', 'Other'];
const REASONS = ['Inappropriate content', 'Spam', 'Fake dream', 'Privacy concern', 'Other'];

const CATEGORY_COLORS = {
  Education: 'bg-blue-100 text-blue-700', Health: 'bg-green-100 text-green-700',
  Career: 'bg-purple-100 text-purple-700', Community: 'bg-orange-100 text-orange-700',
  Creative: 'bg-pink-100 text-pink-700', Technology: 'bg-cyan-100 text-cyan-700',
  Family: 'bg-red-100 text-red-700', Travel: 'bg-yellow-100 text-yellow-700',
  Other: 'bg-gray-100 text-gray-600',
};

// Fallback mock data for when API is not connected
const MOCK_DREAMS = [
  { id: '1', title: 'Start My Own Bakery', story: 'I\'ve always dreamed of sharing my grandmother\'s recipes with the world. Her baking brought our whole community together and I want to carry on that legacy by opening a small artisan bakery in my neighborhood.', category: 'Career', support_count: 47, status: 'published' },
  { id: '2', title: 'Medical Treatment Abroad', story: 'My daughter needs specialized treatment only available in a few centers overseas. We have been on a waitlist for 2 years and dream of getting her the care she deserves.', category: 'Health', support_count: 128, status: 'published' },
  { id: '3', title: 'Finish My CS Degree', story: 'I had to drop out due to financial difficulties in my second year but dream of completing my computer science education. I have been teaching myself in the evenings but need formal accreditation.', category: 'Education', support_count: 83, status: 'published' },
  { id: '4', title: 'Build a Community Garden', story: 'Our neighborhood lacks green spaces. I dream of transforming the unused lot on our street into a thriving community garden where children and elderly alike can connect with nature.', category: 'Community', support_count: 61, status: 'published' },
  { id: '5', title: 'Record My First Album', story: 'Music has been my outlet through the hardest times of my life. I\'ve written 12 original songs and dream of recording them professionally to share with the world.', category: 'Creative', support_count: 34, status: 'published' },
  { id: '6', title: 'Learn Coding to Support My Family', story: 'As a single parent, I dream of a career in technology to provide a better future for my kids. I have been learning online but need mentorship and structured guidance.', category: 'Technology', support_count: 92, status: 'published' },
];

function DreamCard({ dream, onFulfill, onSupport, onReport }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="card-hover bg-white rounded-2xl border border-blue-50 p-6 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${CATEGORY_COLORS[dream.category] || 'bg-gray-100 text-gray-600'}`}>
          {dream.category}
        </span>
        <Badge label={dream.status} type={dream.status} />
      </div>

      <h3 className="text-lg font-bold text-blue-900 mb-2 leading-snug">{dream.title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-4 line-clamp-4">{dream.story}</p>

      <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {dream.support_count} supporting
        </span>
        <span>Anonymous Dreamer</span>
      </div>

      <div className="flex gap-2">
        <Button size="sm" className="flex-1" onClick={() => onFulfill(dream)}>
          Request to Fulfill
        </Button>
        <button onClick={() => onSupport(dream.id)}
          className="p-2 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <button onClick={() => onReport(dream)}
          className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

export default function Dreams() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dreams, setDreams] = useState(MOCK_DREAMS);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [fulfillModal, setFulfillModal] = useState(null);
  const [reportModal, setReportModal] = useState(null);
  const [fulfillMsg, setFulfillMsg] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchDreams();
  }, [selectedCategory]);

  const fetchDreams = async () => {
    setLoading(true);
    try {
      const params = selectedCategory !== 'All' ? { category: selectedCategory } : {};
      const data = await api.getPublicDreams(params);
      if (data.dreams?.length > 0) setDreams(data.dreams);
    } catch {
      // Use mock data if API not connected
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleFulfill = (dream) => {
    if (!user) return navigate('/register?mode=fulfiller');
    setFulfillModal(dream);
  };

  const handleSupport = async (dreamId) => {
    if (!user) return navigate('/login');
    try {
      await api.supportDream(dreamId);
      showToast('Dream supported!');
      setDreams((d) => d.map((dr) => dr.id === dreamId ? { ...dr, support_count: dr.support_count + 1 } : dr));
    } catch { showToast('Could not support dream.'); }
  };

  const handleReport = (dream) => {
    if (!user) return navigate('/login');
    setReportModal(dream);
  };

  const submitFulfillment = async () => {
    setActionLoading(true);
    try {
      await api.requestFulfillment(fulfillModal.id, fulfillMsg);
      setFulfillModal(null);
      setFulfillMsg('');
      showToast('Fulfillment request submitted! Our moderators will review it.');
    } catch (err) {
      showToast(err.message || 'Failed to submit request.');
    } finally {
      setActionLoading(false);
    }
  };

  const submitReport = async () => {
    if (!reportReason) return;
    setActionLoading(true);
    try {
      await api.reportDream(reportModal.id, reportReason);
      setReportModal(null);
      setReportReason('');
      showToast('Report submitted. Thank you for keeping WishIT safe.');
    } catch { showToast('Failed to submit report.'); }
    finally { setActionLoading(false); }
  };

  const filtered = selectedCategory === 'All' ? dreams : dreams.filter((d) => d.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-20">
        {/* Header */}
        <div className="gradient-hero py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-black text-white mb-3">
              Discover Dreams
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-blue-100 mb-8">
              Every dream here belongs to a real person — reviewed, approved, and published anonymously
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-2">
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-white text-blue-700 shadow-lg'
                      : 'glass text-white/80 hover:bg-white/20'
                  }`}>
                  {cat}
                </button>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Dreams grid */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-white rounded-2xl border border-blue-50 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-500 text-sm">{filtered.length} dreams found</p>
                <Button variant="secondary" size="sm" onClick={() => navigate('/submit-dream')}>
                  + Submit Your Dream
                </Button>
              </div>
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filtered.map((dream) => (
                    <DreamCard key={dream.id} dream={dream}
                      onFulfill={handleFulfill} onSupport={handleSupport} onReport={handleReport} />
                  ))}
                </AnimatePresence>
              </motion.div>
              {filtered.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                  <div className="text-5xl mb-4">✨</div>
                  <p className="text-lg font-semibold">No dreams found in this category</p>
                  <p className="text-sm mt-1">Be the first to submit a dream</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />

      {/* Fulfill Modal */}
      <Modal open={!!fulfillModal} onClose={() => setFulfillModal(null)} title="Request to Fulfill This Dream">
        {fulfillModal && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="font-bold text-blue-900">{fulfillModal.title}</div>
              <div className="text-xs text-blue-600 mt-1">{fulfillModal.category}</div>
            </div>
            <div>
              <label className="block text-sm font-bold text-blue-900 mb-2">Why do you want to fulfill this dream?</label>
              <textarea value={fulfillMsg} onChange={(e) => setFulfillMsg(e.target.value)}
                rows={4} placeholder="Tell us about your skills, resources, or passion that makes you the right person to fulfill this dream..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-700">
              Your request will be reviewed by our moderation team before any connection is made.
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setFulfillModal(null)}>Cancel</Button>
              <Button className="flex-1" loading={actionLoading} onClick={submitFulfillment}>Submit Request</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Report Modal */}
      <Modal open={!!reportModal} onClose={() => setReportModal(null)} title="Report This Dream">
        {reportModal && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Select a reason for reporting:</p>
            <div className="space-y-2">
              {REASONS.map((r) => (
                <button key={r} onClick={() => setReportReason(r)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                    reportReason === r ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-blue-300'
                  }`}>
                  {r}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setReportModal(null)}>Cancel</Button>
              <Button variant="danger" className="flex-1" loading={actionLoading} onClick={submitReport}>Submit Report</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-900 text-white px-6 py-3 rounded-2xl shadow-xl text-sm font-medium z-50">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
