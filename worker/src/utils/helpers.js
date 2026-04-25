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
