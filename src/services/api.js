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

const get = (path, auth = true) => request('GET', path, null, auth);
const post = (path, body, auth = true) => request('POST', path, body, auth);
const put = (path, body) => request('PUT', path, body);
const del = (path) => request('DELETE', path);

export const api = {
  // Auth
  register: (data) => post('/api/auth/register', data, false),
  getMe: (uid) => get(`/api/auth/me/${uid}`, false),

  // User
  myProfile: () => get('/api/users/me'),
  updateProfile: (data) => put('/api/users/me', data),

  // Dreams - public
  getPublicDreams: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/api/dreams/public${q ? '?' + q : ''}`, false);
  },
  getPublicDream: (id) => get(`/api/dreams/public/${id}`, false),

  // Dreams - authenticated
  getMyDreams: () => get('/api/dreams/my'),
  submitDream: (data) => post('/api/dreams', data),
  updateDream: (id, data) => put(`/api/dreams/${id}`, data),
  supportDream: (id) => post(`/api/dreams/${id}/support`, {}),

  // Fulfillments
  requestFulfillment: (dreamId, message) => post('/api/fulfillments', { dreamId, message }),
  getMyFulfillments: () => get('/api/fulfillments/my'),
  getDreamFulfillments: (dreamId) => get(`/api/fulfillments/dream/${dreamId}`),

  // Reports
  reportDream: (dreamId, reason, details) => post('/api/reports', { dreamId, reason, details }),

  // Moderator
  mod: {
    getPendingDreams: () => get('/api/mod/dreams'),
    approveDream: (id, notes) => put(`/api/mod/dreams/${id}/approve`, { notes }),
    rejectDream: (id, notes) => put(`/api/mod/dreams/${id}/reject`, { notes }),
    getPendingFulfillments: () => get('/api/mod/fulfillments'),
    approveFulfillment: (id, notes) => put(`/api/mod/fulfillments/${id}/approve`, { notes }),
    rejectFulfillment: (id, notes) => put(`/api/mod/fulfillments/${id}/reject`, { notes }),
    getReports: () => get('/api/mod/reports'),
    reviewReport: (id, status) => put(`/api/mod/reports/${id}`, { status }),
    getStats: () => get('/api/mod/stats'),
  },

  // Admin
  admin: {
    getStats: () => get('/api/admin/stats'),
    getUsers: (params = {}) => get(`/api/admin/users?${new URLSearchParams(params)}`),
    updateUser: (uid, data) => put(`/api/admin/users/${uid}`, data),
    getModerators: () => get('/api/admin/moderators'),
    addModerator: (uid) => post('/api/admin/moderators', { uid }),
    removeModerator: (uid) => del(`/api/admin/moderators/${uid}`),
    getAuditLogs: (params = {}) => get(`/api/admin/audit-logs?${new URLSearchParams(params)}`),
    getDreams: (params = {}) => get(`/api/admin/dreams?${new URLSearchParams(params)}`),
    deleteDream: (id) => del(`/api/admin/dreams/${id}`),
    getSuccessStories: () => get('/api/admin/success-stories'),
    addSuccessStory: (data) => post('/api/admin/success-stories', data),
  },
};
