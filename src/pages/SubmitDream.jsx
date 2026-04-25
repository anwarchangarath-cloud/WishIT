import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import Button from '../components/ui/Button';
import Navbar from '../components/layout/Navbar';

const CATEGORIES = ['Education', 'Health', 'Career', 'Family', 'Community', 'Creative', 'Travel', 'Technology', 'Other'];
const TIMELINES = ['Less than 1 month', '1-3 months', '3-6 months', '6-12 months', 'More than a year', 'Flexible'];

const STEPS = ['Dream Details', 'Your Story', 'Review & Submit'];

export default function SubmitDream() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ title: '', story: '', category: '', timeline: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!profile) return null;

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await api.submitDream(form);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit dream');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-screen p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full text-center bg-white rounded-3xl p-10 shadow-xl">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-blue-900 mb-3">Dream Submitted!</h2>
            <p className="text-gray-500 mb-2">Your dream is now under review by our moderation team.</p>
            <p className="text-gray-400 text-sm mb-8">We'll notify you once it's approved and published anonymously.</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
              <Button className="flex-1" onClick={() => { setSubmitted(false); setStep(0); setForm({ title: '', story: '', category: '', timeline: '' }); }}>
                Submit Another
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-blue-900 mb-2">Submit Your Dream</h1>
            <p className="text-gray-500">Share your dream — it will be reviewed and published anonymously</p>
          </div>

          {/* Progress */}
          <div className="flex items-center mb-10">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i < step ? 'bg-blue-600 text-white' : i === step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {i < step ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : i + 1}
                </div>
                <div className="ml-2 mr-4 flex-1">
                  <div className={`text-xs font-semibold ${i <= step ? 'text-blue-700' : 'text-gray-400'}`}>{s}</div>
                  {i < STEPS.length - 1 && <div className={`h-0.5 mt-1 rounded ${i < step ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-blue-50">
            {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

            {step === 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-blue-900 mb-2">Dream Title *</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Give your dream a clear, inspiring title..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                  <p className="text-xs text-gray-400 mt-1">This will be displayed publicly (anonymous)</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-blue-900 mb-2">Category *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button key={cat} type="button" onClick={() => setForm({ ...form, category: cat })}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border-2 transition-all ${
                          form.category === cat ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-blue-300'
                        }`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-blue-900 mb-2">Timeline</label>
                  <select value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white">
                    <option value="">Select a timeline...</option>
                    {TIMELINES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-blue-900 mb-2">Your Dream Story *</label>
                  <textarea value={form.story} onChange={(e) => setForm({ ...form, story: e.target.value })}
                    rows={8} placeholder="Tell us about your dream. Why is it important to you? What would it mean for your life? What kind of help or fulfillment are you hoping for?..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none" />
                  <p className="text-xs text-gray-400 mt-1">{form.story.length} characters — be as detailed as you can</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-700 font-medium">🔒 Privacy Reminder</p>
                  <p className="text-xs text-blue-600 mt-1">Do not include your real name, contact info, or any personally identifying details. Your dream will be published anonymously.</p>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h3 className="font-bold text-blue-900">Review Your Dream</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-xs text-gray-400 mb-1">Title</div>
                    <div className="font-semibold text-blue-900">{form.title}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="text-xs text-gray-400 mb-1">Category</div>
                      <div className="font-semibold text-blue-900">{form.category || '—'}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="text-xs text-gray-400 mb-1">Timeline</div>
                      <div className="font-semibold text-blue-900">{form.timeline || '—'}</div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-xs text-gray-400 mb-1">Story</div>
                    <div className="text-sm text-gray-600 leading-relaxed line-clamp-5">{form.story}</div>
                  </div>
                </div>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="text-sm text-yellow-800">
                    By submitting, you confirm this dream is genuine. Our moderators will review it before it goes live.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <Button variant="ghost" onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}>
                ← {step === 0 ? 'Cancel' : 'Back'}
              </Button>
              {step < 2 ? (
                <Button onClick={() => {
                  if (step === 0 && (!form.title || !form.category)) return setError('Please fill in title and category.');
                  if (step === 1 && form.story.length < 50) return setError('Please write a more detailed story (at least 50 characters).');
                  setError('');
                  setStep(step + 1);
                }}>
                  Continue →
                </Button>
              ) : (
                <Button loading={loading} onClick={handleSubmit}>
                  Submit Dream
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
