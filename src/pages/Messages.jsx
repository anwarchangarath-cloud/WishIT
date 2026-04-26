import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/layout/Navbar';

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ThreadItem({ thread, active, onClick }) {
  return (
    <button onClick={onClick}
      className="w-full text-left px-4 py-3.5 transition-all"
      style={{
        background: active ? 'var(--blue-light)' : 'transparent',
        borderBottom: '1px solid var(--border)',
        borderLeft: active ? '2.5px solid var(--blue)' : '2.5px solid transparent',
      }}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-[12px] flex items-center justify-center font-extrabold text-[13px]"
          style={{
            background: active ? 'var(--blue)' : 'var(--bg)',
            color: active ? 'white' : 'var(--text-2)',
          }}>
          {thread.dream_title?.[0] || '✦'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="text-[13.5px] font-bold truncate" style={{ color: active ? 'var(--blue)' : 'var(--text)' }}>
              {thread.dream_title || 'Dream Connection'}
            </p>
            <span className="text-[11px] flex-shrink-0" style={{ color: 'var(--text-4)' }}>{formatTime(thread.last_message_at)}</span>
          </div>
          <p className="text-[12px] truncate" style={{ color: 'var(--text-3)' }}>{thread.last_message || 'No messages yet'}</p>
          {thread.unread_count > 0 && (
            <span className="inline-flex items-center justify-center text-white text-[10px] font-extrabold rounded-full mt-1"
              style={{ background: 'var(--blue)', width: '18px', height: '18px', fontSize: '10px' }}>
              {thread.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function MessageBubble({ msg, isMe }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}
      className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="flex-shrink-0 w-7 h-7 rounded-[8px] flex items-center justify-center text-[10px] font-extrabold"
        style={{
          background: isMe ? 'var(--blue)' : 'var(--border)',
          color: isMe ? 'white' : 'var(--text-2)',
        }}>
        {isMe ? 'Me' : '?'}
      </div>
      <div className="max-w-[75%] px-4 py-2.5 rounded-[18px] text-[13.5px] leading-relaxed"
        style={{
          background: isMe ? 'var(--blue)' : 'var(--bg)',
          color: isMe ? 'white' : 'var(--text)',
          borderBottomRightRadius: isMe ? '6px' : '18px',
          borderBottomLeftRadius: isMe ? '18px' : '6px',
          border: isMe ? 'none' : '1px solid var(--border)',
        }}>
        {msg.content}
        <p className="text-[11px] mt-1" style={{ color: isMe ? 'rgba(255,255,255,0.55)' : 'var(--text-4)' }}>
          {formatTime(msg.created_at)}
        </p>
      </div>
    </motion.div>
  );
}

function FulfillModal({ dreamTitle, onClose, onSubmit, submitting }) {
  const [note, setNote] = useState('');
  const [proof, setProof] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,13,31,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md card-white p-6 shadow-xl"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-[15px]" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>Mark Dream Fulfilled</h3>
            <p className="text-[12.5px] mt-0.5" style={{ color: 'var(--text-4)' }}>
              Submit completion for moderator review
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0 no-min-h transition-colors hover:bg-[#F4F7FB]"
            style={{ color: 'var(--text-4)' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Dream name pill */}
        <div className="px-3 py-2 rounded-[12px] mb-5 flex items-center gap-2"
          style={{ background: 'var(--blue-light)', border: '1px solid var(--blue-border)' }}>
          <span className="text-[12px] font-bold" style={{ color: 'var(--blue)' }}>Dream:</span>
          <span className="text-[12.5px] font-semibold truncate" style={{ color: 'var(--text-2)' }}>{dreamTitle}</span>
        </div>

        {/* Status change notice */}
        <div className="px-3 py-2.5 rounded-[12px] mb-5 flex items-center gap-2.5"
          style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
          <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#C2410C' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
          </svg>
          <span className="text-[12px] font-semibold" style={{ color: '#C2410C' }}>
            Status will change: <strong>In Progress → Pending Moderator Verification</strong>
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold mb-1.5 uppercase tracking-[0.06em]" style={{ color: 'var(--text-2)' }}>
              Fulfillment Note
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              placeholder="Describe how you fulfilled this dream..."
              className="input resize-none text-[13.5px]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold mb-1.5 uppercase tracking-[0.06em]" style={{ color: 'var(--text-2)' }}>
              Proof / Supporting Details <span className="font-normal text-[11px]" style={{ color: 'var(--text-4)' }}>(optional link)</span>
            </label>
            <input
              type="url"
              value={proof}
              onChange={e => setProof(e.target.value)}
              placeholder="https://... photo, document, or reference"
              className="input text-[13.5px]"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-[14px] font-semibold text-[13.5px] transition-colors"
            style={{ background: 'var(--bg)', color: 'var(--text-2)', border: '1.5px solid var(--border)' }}>
            Cancel
          </button>
          <button
            onClick={() => onSubmit(note, proof)}
            disabled={submitting}
            className="flex-1 py-3 rounded-[14px] font-bold text-[13.5px] text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(16,185,129,0.35)' }}>
            {submitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Submitting…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Submit for Review
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Messages() {
  const { dreamId: urlDreamId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [activeDreamId, setActiveDreamId] = useState(urlDreamId || null);
  const [messages, setMessages] = useState([]);
  const [dreamInfo, setDreamInfo] = useState(null);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [submittingCompletion, setSubmittingCompletion] = useState(false);
  const [toast, setToast] = useState('');
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadThreads();
    return () => clearInterval(pollRef.current);
  }, [user]);

  useEffect(() => {
    if (activeDreamId) {
      loadMessages(activeDreamId);
      clearInterval(pollRef.current);
      pollRef.current = setInterval(() => loadMessages(activeDreamId, true), 5000);
    }
    return () => clearInterval(pollRef.current);
  }, [activeDreamId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadThreads = async () => {
    try {
      const data = await api.getMessageThreads();
      setThreads(data.threads || []);
      if (!activeDreamId && data.threads?.length > 0) {
        setActiveDreamId(data.threads[0].dream_id);
      }
    } catch {}
    setLoading(false);
  };

  const loadMessages = async (dId, silent = false) => {
    if (!silent) setMsgLoading(true);
    try {
      const data = await api.getThread(dId);
      setMessages(data.messages || []);
      if (data.dream) setDreamInfo(data.dream);
    } catch {}
    if (!silent) setMsgLoading(false);
  };

  const send = async () => {
    if (!newMsg.trim() || !activeDreamId || sending) return;
    setSending(true);
    try {
      await api.sendMessage(activeDreamId, newMsg.trim());
      setNewMsg('');
      await loadMessages(activeDreamId, true);
    } catch (e) {
      showToast(e.message || 'Failed to send message');
    }
    setSending(false);
  };

  const handleSubmitCompletion = async (note, proofUrl) => {
    setSubmittingCompletion(true);
    try {
      await api.requestCompletion(activeDreamId, note, proofUrl);
      setShowFulfillModal(false);
      showToast('Completion submitted for moderator review.');
      await loadMessages(activeDreamId, true);
    } catch (e) {
      showToast(e.message || 'Failed to submit completion request');
    }
    setSubmittingCompletion(false);
  };

  const activeThread = threads.find(t => t.dream_id === activeDreamId);
  const isFulfiller = activeThread && user && activeThread.fulfiller_uid === user.uid;
  const canMarkFulfilled = isFulfiller && dreamInfo?.status === 'in_progress';
  const isPendingVerification = dreamInfo?.status === 'pending_fulfillment';

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Navbar />

      <div className="flex-1 flex pt-16 overflow-hidden">
        <div className="flex w-full max-w-6xl mx-auto h-[calc(100vh-4rem)]" style={{ boxShadow: '0 0 0 1px var(--border)' }}>

          {/* Thread list */}
          <div className={`${activeDreamId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[300px] lg:w-[320px] flex-shrink-0`}
            style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
            <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="font-extrabold" style={{ color: 'var(--text)', fontSize: '1.1rem', letterSpacing: '-0.025em' }}>Messages</h2>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-4)' }}>Dream connections</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-10 h-10 rounded-[12px] flex-shrink-0" style={{ background: 'var(--border)' }} />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 rounded-full w-3/4" style={{ background: 'var(--border)' }} />
                        <div className="h-3 rounded-full w-1/2" style={{ background: 'var(--border)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : threads.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="text-4xl mb-4">✦</div>
                  <p className="font-bold text-[14px] mb-1" style={{ color: 'var(--text)' }}>No conversations yet</p>
                  <p className="text-[12.5px] leading-relaxed mb-4" style={{ color: 'var(--text-4)' }}>
                    Messages unlock when a fulfiller request is approved
                  </p>
                  <Link to="/dreams" className="btn-primary" style={{ fontSize: '12.5px', padding: '8px 16px' }}>
                    Browse Dreams
                  </Link>
                </div>
              ) : (
                threads.map(t => (
                  <ThreadItem key={t.id} thread={t} active={t.dream_id === activeDreamId}
                    onClick={() => { setActiveDreamId(t.dream_id); setDreamInfo(null); }} />
                ))
              )}
            </div>
          </div>

          {/* Chat panel */}
          <div className={`${!activeDreamId ? 'hidden md:flex' : 'flex'} flex-col flex-1`} style={{ background: 'white' }}>
            {!activeDreamId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="text-5xl mb-4">✦</div>
                <p className="font-bold text-[15px] mb-1" style={{ color: 'var(--text)' }}>Select a conversation</p>
                <p className="text-[13.5px]" style={{ color: 'var(--text-3)' }}>Choose a thread from the left to start messaging</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                  <button onClick={() => setActiveDreamId(null)}
                    className="md:hidden p-1.5 rounded-[10px] transition-colors no-min-h"
                    style={{ color: 'var(--text-3)' }}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                    </svg>
                  </button>
                  <div className="flex-shrink-0 w-9 h-9 rounded-[12px] flex items-center justify-center font-extrabold text-white text-[13px]"
                    style={{ background: 'var(--blue)' }}>
                    {activeThread?.dream_title?.[0] || '✦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[14px] truncate" style={{ color: 'var(--text)' }}>
                      {activeThread?.dream_title || 'Dream Connection'}
                    </p>
                    <p className="text-[11.5px]" style={{ color: 'var(--text-4)' }}>Private moderated channel</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Pending verification status pill */}
                    {isPendingVerification && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                        style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#F97316' }} />
                        <span className="text-[11px] font-bold" style={{ color: '#C2410C' }}>Pending Verification</span>
                      </div>
                    )}

                    {/* Mark fulfilled button — only for fulfiller when in_progress */}
                    {canMarkFulfilled && (
                      <button
                        onClick={() => setShowFulfillModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] font-bold text-[12px] text-white transition-all hover:shadow-lg no-min-h"
                        style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', boxShadow: '0 2px 8px rgba(16,185,129,0.30)' }}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Mark Dream Fulfilled
                      </button>
                    )}

                    {/* Secure badge */}
                    {!isPendingVerification && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                        style={{ background: '#D1FAE5', border: '1px solid #A7F3D0' }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#10B981' }} />
                        <span className="text-[11.5px] font-bold" style={{ color: '#065F46' }}>Secure</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3.5" style={{ background: 'var(--bg)' }}>
                  {msgLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-6 h-6 rounded-full animate-spin" style={{ border: '2px solid var(--border)', borderTop: '2px solid var(--blue)' }} />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="text-4xl mb-3">✦</div>
                      <p className="font-bold text-[14px] mb-1" style={{ color: 'var(--text)' }}>Start the conversation</p>
                      <p className="text-[12.5px]" style={{ color: 'var(--text-3)' }}>Introduce yourself and discuss how you can help</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-center">
                        <span className="px-3 py-1 rounded-full text-[11.5px] font-medium"
                          style={{ background: 'var(--border)', color: 'var(--text-3)' }}>
                          This conversation is moderated for safety
                        </span>
                      </div>
                      {messages.map(msg => (
                        <MessageBubble key={msg.id} msg={msg} isMe={msg.sender_uid === user.uid} />
                      ))}
                    </>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Pending fulfillment notice */}
                {isPendingVerification && (
                  <div className="px-5 py-3" style={{ background: '#FFF7ED', borderTop: '1px solid #FED7AA' }}>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#C2410C' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <p className="text-[12.5px] font-semibold" style={{ color: '#C2410C' }}>
                        Fulfillment under moderator review — dreamer confirmation pending
                      </p>
                    </div>
                  </div>
                )}

                {/* Input bar */}
                <div className="p-4" style={{ borderTop: isPendingVerification ? 'none' : '1px solid var(--border)', background: 'white' }}>
                  <div className="flex gap-2.5 items-end">
                    <input
                      value={newMsg}
                      onChange={e => setNewMsg(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                      placeholder="Type a message…"
                      className="flex-1 px-4 py-2.5 rounded-[14px] text-[13.5px] outline-none transition-all"
                      style={{
                        border: '1.5px solid var(--border)',
                        color: 'var(--text)',
                        background: 'var(--bg)',
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                    <button onClick={send} disabled={!newMsg.trim() || sending}
                      className="w-10 h-10 rounded-[12px] flex items-center justify-center transition-all flex-shrink-0 no-min-h"
                      style={{
                        background: newMsg.trim() && !sending ? 'var(--blue)' : 'var(--border)',
                        color: newMsg.trim() && !sending ? 'white' : 'var(--text-4)',
                      }}>
                      {sending ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Fulfillment completion modal */}
      <AnimatePresence>
        {showFulfillModal && (
          <FulfillModal
            dreamTitle={activeThread?.dream_title}
            onClose={() => setShowFulfillModal(false)}
            onSubmit={handleSubmitCompletion}
            submitting={submittingCompletion}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.96 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 text-white px-6 py-3 rounded-2xl shadow-float text-[13px] font-semibold z-50 whitespace-nowrap"
            style={{ background: 'var(--navy)' }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
