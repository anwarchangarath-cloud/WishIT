export function uid() {
  return crypto.randomUUID();
}

export function now() {
  return new Date().toISOString();
}

export async function audit(db, actorUid, action, targetId, targetType, details = {}) {
  await db.prepare(
    'INSERT INTO audit_logs (id, actor_uid, action, target_id, target_type, details) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(uid(), actorUid, action, targetId, targetType, JSON.stringify(details)).run();
}

export function paginate(page = 1, limit = 20) {
  const p = Math.max(1, parseInt(page));
  const l = Math.min(100, Math.max(1, parseInt(limit)));
  return { limit: l, offset: (p - 1) * l };
}

export async function notify(db, userUid, type, title, body, link = null) {
  await db.prepare(
    'INSERT INTO notifications (id, user_uid, type, title, body, link) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(uid(), userUid, type, title, body, link).run();
}

export async function adjustTrustScore(db, userUid, delta, eventType, reason, refId = null, refType = null) {
  await db.prepare(
    `UPDATE users SET trust_score = MIN(200, MAX(0, trust_score + ?)), updated_at = ? WHERE uid = ?`
  ).bind(delta, now(), userUid).run();
  await db.prepare(
    `INSERT INTO trust_score_events (id, user_uid, event_type, delta, reason, reference_id, reference_type)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(uid(), userUid, eventType, delta, reason, refId, refType).run();
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { email: _e, suspended_at: _sa, banned_at: _ba, ban_reason: _br, suspend_reason: _sr, ...pub } = user;
  return pub;
}

export function keywordScore(text1 = '', text2 = '') {
  const tokenize = (t) => t.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  const a = new Set(tokenize(text1));
  const b = tokenize(text2);
  if (!a.size || !b.length) return 0;
  const matches = b.filter((w) => a.has(w)).length;
  return Math.round((matches / Math.max(a.size, b.length)) * 100);
}
