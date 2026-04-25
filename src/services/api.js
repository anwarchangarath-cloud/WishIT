import { auth } from '../firebase/config';

const BASE = import.meta.env.VITE_WORKER_URL || '';

async function getToken() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

async function request(method, path, body, requireAuth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (requireAuth) {
    headers['Authorization'] = `Bearer ${await getToken()}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

const get  = (path, auth = true) => request('GET', path, null, auth);
const post = (path, body, auth = true) => request('POST', path, body, auth);
const put  = (path, body) => request('PUT', path, body);
const del  = (path) => request('DELETE', path);

export const api = {
  // ── Auth ──────────────────────────────────────────────
  register: (data) => post('/api/auth/register', data, false),
  getMe: (uid) => get(`/api/auth/me/${uid}`, false),

  // ── Users ─────────────────────────────────────────────
  myProfile: () => get('/api/users/me'),
  updateProfile: (data) => put('/api/users/me', data),
  getPublicProfile: (uid) => get(`/api/users/${uid}/public`),

  // ── Dreams — public ───────────────────────────────────
  getPublicDreams: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/api/dreams/public${q ? '?' + q : ''}`, false);
  },
  getPublicDream: (id) => get(`/api/dreams/public/${id}`, false),

  // ── Dreams — authenticated ────────────────────────────
  getMyDreams: () => get('/api/dreams/my'),
  submitDream: (data) => post('/api/dreams', data),
  updateDream: (id, data) => put(`/api/dreams/${id}`, data),
  supportDream: (id) => post(`/api/dreams/${id}/support`, {}),
  setDreamBadge: (id, badge) => put(`/api/dreams/${id}/badge`, { badge }),
  featureDream: (id, featured) => put(`/api/dreams/${id}/feature`, { featured }),
  setDreamStatus: (id, status) => put(`/api/dreams/${id}/status`, { status }),
  getDreamTeam: (id) => get(`/api/dreams/${id}/team`),
  joinDreamTeam: (id, role_in_team) => post(`/api/dreams/${id}/team`, { role_in_team }),

  // ── Fulfillments ──────────────────────────────────────
  requestFulfillment: (dreamId, data) => post('/api/fulfillments', { dreamId, ...data }),
  getMyFulfillments: () => get('/api/fulfillments/my'),
  getDreamFulfillments: (dreamId) => get(`/api/fulfillments/dream/${dreamId}`),
  withdrawFulfillment: (id) => del(`/api/fulfillments/${id}`),

  // ── Reports ───────────────────────────────────────────
  reportDream: (dreamId, reason, details) => post('/api/reports', { dreamId, reason, details }),

  // ── Saves ─────────────────────────────────────────────
  getSavedDreams: () => get('/api/saves/my'),
  saveDream: (id) => post(`/api/saves/dreams/${id}`, {}),
  unsaveDream: (id) => del(`/api/saves/dreams/${id}`),
  checkSaved: (id) => get(`/api/saves/dreams/${id}/check`),

  // ── Notifications ─────────────────────────────────────
  getNotifications: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/api/notifications${q ? '?' + q : ''}`);
  },
  markNotificationRead: (id) => put(`/api/notifications/${id}/read`, {}),
  markAllNotificationsRead: () => put('/api/notifications/read-all', {}),
  deleteNotification: (id) => del(`/api/notifications/${id}`),

  // ── Messages ──────────────────────────────────────────
  getMessageThreads: () => get('/api/messages/threads'),
  getThread: (dreamId) => get(`/api/messages/thread/${dreamId}`),
  sendMessage: (dreamId, content) => post('/api/messages', { dreamId, content }),
  flagThread: (threadId) => put(`/api/messages/thread/${threadId}/flag`, {}),

  // ── Matching ──────────────────────────────────────────
  getMatches: (dreamId) => get(`/api/matching/dream/${dreamId}`),

  // ── Moderator ─────────────────────────────────────────
  mod: {
    getStats: () => get('/api/mod/stats'),
    getPendingDreams: (params = {}) => get(`/api/mod/dreams?${new URLSearchParams(params)}`),
    approveDream: (id, notes, badge) => put(`/api/mod/dreams/${id}/approve`, { notes, badge }),
    rejectDream: (id, notes) => put(`/api/mod/dreams/${id}/reject`, { notes }),
    requestInfo: (id, question) => put(`/api/mod/dreams/${id}/request-info`, { question }),
    getPendingFulfillments: () => get('/api/mod/fulfillments'),
    approveFulfillment: (id, notes) => put(`/api/mod/fulfillments/${id}/approve`, { notes }),
    rejectFulfillment: (id, notes) => put(`/api/mod/fulfillments/${id}/reject`, { notes }),
    getReports: (params = {}) => get(`/api/mod/reports?${new URLSearchParams(params)}`),
    reviewReport: (id, status, action_taken) => put(`/api/mod/reports/${id}`, { status, action_taken }),
    addNote: (targetId, targetType, note, note_type) => post('/api/mod/notes', { targetId, targetType, note, note_type }),
    getNotes: (targetId) => get(`/api/mod/notes/${targetId}`),
    escalate: (targetId, targetType, reason, details, priority) => post('/api/mod/escalate', { targetId, targetType, reason, details, priority }),
    getFlaggedUsers: () => get('/api/mod/flagged-users'),
  },

  // ── Admin ─────────────────────────────────────────────
  admin: {
    getStats: () => get('/api/admin/stats'),
    getPlatformStats: () => get('/api/admin/platform-stats'),
    getUsers: (params = {}) => get(`/api/admin/users?${new URLSearchParams(params)}`),
    getUser: (uid) => get(`/api/admin/users/${uid}`),
    updateUser: (uid, data) => put(`/api/admin/users/${uid}`, data),
    suspendUser: (uid, reason, duration_days) => put(`/api/admin/users/${uid}/suspend`, { reason, duration_days }),
    unsuspendUser: (uid) => put(`/api/admin/users/${uid}/unsuspend`, {}),
    banUser: (uid, reason) => put(`/api/admin/users/${uid}/ban`, { reason }),
    unbanUser: (uid) => put(`/api/admin/users/${uid}/unban`, {}),
    getModerators: () => get('/api/admin/moderators'),
    addModerator: (uid) => post('/api/admin/moderators', { uid }),
    removeModerator: (uid) => del(`/api/admin/moderators/${uid}`),
    getAuditLogs: (params = {}) => get(`/api/admin/audit-logs?${new URLSearchParams(params)}`),
    getDreams: (params = {}) => get(`/api/admin/dreams?${new URLSearchParams(params)}`),
    deleteDream: (id) => del(`/api/admin/dreams/${id}`),
    getEscalations: (params = {}) => get(`/api/admin/escalations?${new URLSearchParams(params)}`),
    resolveEscalation: (id, status, resolution_notes) => put(`/api/admin/escalations/${id}`, { status, resolution_notes }),
    getSuccessStories: () => get('/api/admin/success-stories'),
    addSuccessStory: (data) => post('/api/admin/success-stories', data),
    updateSuccessStory: (id, data) => put(`/api/admin/success-stories/${id}`, data),
    getSettings: () => get('/api/admin/settings'),
    updateSettings: (data) => put('/api/admin/settings', data),
    getChallenges: () => get('/api/admin/challenges'),
    createChallenge: (data) => post('/api/admin/challenges', data),
  },
};
