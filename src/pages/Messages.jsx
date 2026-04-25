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
      className={`w-full text-left px-4 py-4 transition-colors border-b border-slate-100 last:border-0 ${active ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
          {thread.dream_title?.[0] || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className={`text-sm font-bold truncate ${active ? 'text-blue-700' : 'text-slate-900'}`}>
              {thread.dream_title || 'Dream Connection'}
            </p>
            <span className="text-xs text-slate-400 flex-shrink-0">{formatTime(thread.last_message_at)}</span>
          </div>
          <p className="text-xs text-slate-500 truncate">{thread.last_message || 'No messages yet'}</p>
          {thread.unread_count > 0 && (
            <span className="inline-flex items-center justify-center w-4 h-4 bg-blue-600 text-white text-xs font-bold rounded-full mt-1">
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
    <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${isMe ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
        {isMe ? 'Me' : '?'}
      </div>
      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
        {msg.content}
        <p className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>{formatTime(msg.created_at)}</p>
      </div>
    </div>
  );
}

export default function Messages() {
  const { dreamId: urlDreamId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [activeDreamId, setActiveDreamId] = useState(urlDreamId || null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

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
      alert(e.message || 'Failed to send message');
    }
    setSending(false);
  };

  const activeThread = threads.find(t => t.dream_id === activeDreamId);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex pt-16 overflow-hidden">
        <div className="flex w-full max-w-6xl mx-auto h-[calc(100vh-4rem)]">

          {/* Thread list */}
          <div className={`${activeDreamId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 flex-shrink-0 bg-white border-r border-slate-100`}>
            <div className="p-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-lg">Messages</h2>
              <p className="text-slate-400 text-xs mt-0.5">Dream connections</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-5 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-10 h-10 bg-slate-200 rounded-xl flex-shrink-0" />
                      <div className="flex-1">
                        <div className="h-4 bg-slate-200 rounded-full w-3/4 mb-2" />
                        <div className="h-3 bg-slate-200 rounded-full w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : threads.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 p-8 text-center h-full">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                    </svg>
                  </div>
                  <p className="font-bold text-slate-900 mb-1">No conversations yet</p>
                  <p className="text-slate-400 text-xs leading-relaxed">Messages unlock when a fulfiller request is approved</p>
                  <Link to="/dreams" className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors">
                    Browse Dreams
                  </Link>
                </div>
              ) : (
                threads.map(t => (
                  <ThreadItem key={t.id} thread={t} active={t.dream_id === activeDreamId}
                    onClick={() => setActiveDreamId(t.dream_id)} />
                ))
              )}
            </div>
          </div>

          {/* Chat panel */}
          <div className={`${!activeDreamId ? 'hidden md:flex' : 'flex'} flex-col flex-1 bg-white`}>
            {!activeDreamId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                  </svg>
                </div>
                <p className="font-bold text-slate-900 mb-1">Select a conversation</p>
                <p className="text-slate-400 text-sm">Choose a thread from the left to start messaging</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 p-4 border-b border-slate-100">
                  <button onClick={() => setActiveDreamId(null)} className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                    </svg>
                  </button>
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
                    {activeThread?.dream_title?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{activeThread?.dream_title || 'Dream Connection'}</p>
                    <p className="text-xs text-slate-400">Private moderated channel</p>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 rounded-full">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span className="text-emerald-700 text-xs font-semibold">Secure</span>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {msgLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                        </svg>
                      </div>
                      <p className="font-bold text-slate-900 text-sm mb-1">Start the conversation</p>
                      <p className="text-slate-400 text-xs">Introduce yourself and discuss how you can help</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-center">
                        <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-500">
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

                {/* Input */}
                <div className="p-4 border-t border-slate-100 bg-white">
                  <div className="flex gap-3">
                    <input
                      value={newMsg}
                      onChange={e => setNewMsg(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                      placeholder="Type a message…"
                      className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={send} disabled={!newMsg.trim() || sending}
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 flex items-center gap-2">
                      {sending ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
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
    </div>
  );
}
