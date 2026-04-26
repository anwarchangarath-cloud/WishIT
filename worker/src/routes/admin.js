import { Hono } from 'hono';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { uid, now, audit, notify, adjustTrustScore } from '../utils/helpers.js';

const admin = new Hono();
admin.use('*', authMiddleware(), requireRole('admin'));

// ── Platform Analytics ───────────────────────────────────

admin.get('/stats', async (c) => {
  const [users, dreams, published, fulfilled, matched, fulfillments,
    reports, messages, todayUsers, todayDreams] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first(),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM dreams').first(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM dreams WHERE status='published'").first(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM dreams WHERE status='fulfilled'").first(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM dreams WHERE status='matched'").first(),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM fulfillment_requests').first(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM reports WHERE status='pending'").first(),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM messages').first(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE date(created_at)=date('now')").first(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM dreams WHERE date(created_at)=date('now')").first(),
  ]);

  const conversionRate = dreams.count > 0 ? Math.round((fulfilled.count / dreams.count) * 100) : 0;

  return c.json({
    totalUsers: users.count, totalDreams: dreams.count, publishedDreams: published.count,
    fulfilledDreams: fulfilled.count, matchedDreams: matched.count,
    totalFulfillments: fulfillments.count, pendingReports: reports.count,
    totalMessages: messages.count, todayUsers: todayUsers.count, todayDreams: todayDreams.count,
    conversionRate,
  });
});

admin.get('/platform-stats', async (c) => {
  const { results: byCategory } = await c.env.DB.prepare(
    "SELECT category, COUNT(*) as count FROM dreams WHERE status='published' GROUP BY category ORDER BY count DESC"
  ).all();
  const { results: byCountry } = await c.env.DB.prepare(
    "SELECT country, COUNT(*) as count FROM dreams WHERE status='published' AND country IS NOT NULL GROUP BY country ORDER BY count DESC LIMIT 10"
  ).all();
  const { results: byStatus } = await c.env.DB.prepare(
    "SELECT status, COUNT(*) as count FROM dreams GROUP BY status"
  ).all();
  const { results: recentActivity } = await c.env.DB.prepare(`
    SELECT date(created_at) as day, COUNT(*) as new_dreams
    FROM dreams WHERE created_at > datetime('now', '-30 days')
    GROUP BY day ORDER BY day DESC
  `).all();
  return c.json({ byCategory, byCountry, byStatus, recentActivity });
});

// ── User Management ──────────────────────────────────────

admin.get('/users', async (c) => {
  const { role, search, page = 1, suspended, banned } = c.req.query();
  const offset = (parseInt(page) - 1) * 50;
  const conditions = [];
  const params = [];

  if (role) { conditions.push('role = ?'); params.push(role); }
  if (suspended === 'true') { conditions.push('suspended = 1'); }
  if (banned === 'true') { conditions.push('banned = 1'); }
  if (search) { conditions.push('(name LIKE ? OR email LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const query = `SELECT * FROM users ${where} ORDER BY created_at DESC LIMIT 50 OFFSET ?`;
  params.push(offset);

  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  const total = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM users ${where}`)
    .bind(...params.slice(0, -1)).first();

  return c.json({ users: results, total: total.count });
});

admin.get('/users/:uid', async (c) => {
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE uid = ?').bind(c.req.param('uid')).first();
  if (!user) return c.json({ error: 'Not found' }, 404);
  const { results: dreams } = await c.env.DB.prepare(
    'SELECT id, title, status, category, created_at FROM dreams WHERE user_uid = ? ORDER BY created_at DESC LIMIT 10'
  ).bind(user.uid).all();
  const { results: requests } = await c.env.DB.prepare(
    'SELECT fr.id, fr.status, d.title as dream_title FROM fulfillment_requests fr JOIN dreams d ON fr.dream_id = d.id WHERE fr.fulfiller_uid = ? ORDER BY fr.created_at DESC LIMIT 10'
  ).bind(user.uid).all();
  const { results: trustHistory } = await c.env.DB.prepare(
    'SELECT * FROM trust_score_events WHERE user_uid = ? ORDER BY created_at DESC LIMIT 20'
  ).bind(user.uid).all();
  return c.json({ user, dreams, requests, trustHistory });
});

admin.put('/users/:uid', async (c) => {
  const actor = c.get('user');
  const { role, trust_score, verified, bio, name } = await c.req.json();
  if (role && !['user', 'moderator', 'admin'].includes(role)) return c.json({ error: 'Invalid role' }, 400);
  await c.env.DB.prepare(
    `UPDATE users SET role=COALESCE(?,role), trust_score=COALESCE(?,trust_score),
     verified=COALESCE(?,verified), bio=COALESCE(?,bio), name=COALESCE(?,name), updated_at=? WHERE uid=?`
  ).bind(
    role ?? null,
    trust_score ?? null,
    verified !== undefined ? (verified ? 1 : 0) : null,
    bio ?? null,
    name ?? null,
    now(),
    c.req.param('uid')
  ).run();
  await audit(c.env.DB, actor.uid, 'USER_UPDATED', c.req.param('uid'), 'user', { role, trust_score, verified });
  return c.json({ success: true });
});

admin.put('/users/:uid/suspend', async (c) => {
  const actor = c.get('user');
  const { reason, duration_days } = await c.req.json();
  if (!reason) return c.json({ error: 'Reason required' }, 400);
  const suspend_until = duration_days
    ? new Date(Date.now() + duration_days * 86400000).toISOString()
    : null;
  await c.env.DB.prepare(
    'UPDATE users SET suspended=1, suspended_at=?, suspend_reason=?, updated_at=? WHERE uid=?'
  ).bind(now(), reason, now(), c.req.param('uid')).run();
  await audit(c.env.DB, actor.uid, 'USER_SUSPENDED', c.req.param('uid'), 'user', { reason });
  await notify(c.env.DB, c.req.param('uid'), 'account_suspended', 'Account Suspended',
    `Your account has been suspended. Reason: ${reason}`, null);
  return c.json({ success: true });
});

admin.put('/users/:uid/unsuspend', async (c) => {
  const actor = c.get('user');
  await c.env.DB.prepare(
    'UPDATE users SET suspended=0, suspended_at=NULL, suspend_reason=NULL, updated_at=? WHERE uid=?'
  ).bind(now(), c.req.param('uid')).run();
  await audit(c.env.DB, actor.uid, 'USER_UNSUSPENDED', c.req.param('uid'), 'user');
  return c.json({ success: true });
});

admin.put('/users/:uid/ban', async (c) => {
  const actor = c.get('user');
  const { reason } = await c.req.json();
  if (!reason) return c.json({ error: 'Reason required' }, 400);
  await c.env.DB.prepare(
    'UPDATE users SET banned=1, banned_at=?, ban_reason=?, suspended=0, updated_at=? WHERE uid=?'
  ).bind(now(), reason, now(), c.req.param('uid')).run();
  await audit(c.env.DB, actor.uid, 'USER_BANNED', c.req.param('uid'), 'user', { reason });
  return c.json({ success: true });
});

admin.put('/users/:uid/unban', async (c) => {
  const actor = c.get('user');
  await c.env.DB.prepare(
    'UPDATE users SET banned=0, banned_at=NULL, ban_reason=NULL, updated_at=? WHERE uid=?'
  ).bind(now(), c.req.param('uid')).run();
  await audit(c.env.DB, actor.uid, 'USER_UNBANNED', c.req.param('uid'), 'user');
  return c.json({ success: true });
});

// ── Moderator Management ─────────────────────────────────

admin.get('/moderators', async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM users WHERE role = 'moderator' ORDER BY created_at DESC"
  ).all();
  return c.json({ moderators: results });
});

admin.post('/moderators', async (c) => {
  const actor = c.get('user');
  const { uid: targetUid } = await c.req.json();
  const target = await c.env.DB.prepare('SELECT * FROM users WHERE uid = ?').bind(targetUid).first();
  if (!target) return c.json({ error: 'User not found' }, 404);
  await c.env.DB.prepare("UPDATE users SET role='moderator', updated_at=? WHERE uid=?").bind(now(), targetUid).run();
  await audit(c.env.DB, actor.uid, 'MODERATOR_PROMOTED', targetUid, 'user');
  await notify(c.env.DB, targetUid, 'role_changed', 'You are now a Moderator',
    'Congratulations! You have been promoted to Moderator. You can now review and approve dreams.', '/moderator');
  return c.json({ success: true });
});

admin.delete('/moderators/:uid', async (c) => {
  const actor = c.get('user');
  await c.env.DB.prepare("UPDATE users SET role='user', updated_at=? WHERE uid=?").bind(now(), c.req.param('uid')).run();
  await audit(c.env.DB, actor.uid, 'MODERATOR_REMOVED', c.req.param('uid'), 'user');
  return c.json({ success: true });
});

// ── Dream Management ─────────────────────────────────────

admin.get('/dreams', async (c) => {
  const { status, category, page = 1 } = c.req.query();
  const offset = (parseInt(page) - 1) * 50;
  const conditions = [];
  const params = [];
  if (status) { conditions.push('d.status = ?'); params.push(status); }
  if (category) { conditions.push('d.category = ?'); params.push(category); }
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const { results } = await c.env.DB.prepare(
    `SELECT d.*, u.name as dreamer_name, u.email as dreamer_email FROM dreams d JOIN users u ON d.user_uid=u.uid ${where} ORDER BY d.created_at DESC LIMIT 50 OFFSET ?`
  ).bind(...params, offset).all();
  const total = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM dreams d ${where}`).bind(...params).first();
  return c.json({ dreams: results, total: total.count });
});

admin.delete('/dreams/:id', async (c) => {
  const actor = c.get('user');
  await c.env.DB.prepare('DELETE FROM dreams WHERE id = ?').bind(c.req.param('id')).run();
  await audit(c.env.DB, actor.uid, 'DREAM_DELETED', c.req.param('id'), 'dream');
  return c.json({ success: true });
});

// ── Escalations ──────────────────────────────────────────

admin.get('/escalations', async (c) => {
  const { status = 'open' } = c.req.query();
  const { results } = await c.env.DB.prepare(`
    SELECT e.*, u.name as escalated_by_name
    FROM escalations e JOIN users u ON e.escalated_by = u.uid
    WHERE e.status = ? ORDER BY
      CASE e.priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END,
      e.created_at ASC
  `).bind(status).all();
  return c.json({ escalations: results });
});

admin.put('/escalations/:id', async (c) => {
  const actor = c.get('user');
  const { status, resolution_notes } = await c.req.json();
  if (!['in_review', 'resolved', 'dismissed'].includes(status)) return c.json({ error: 'Invalid status' }, 400);
  await c.env.DB.prepare(
    'UPDATE escalations SET status=?, resolved_by=?, resolved_at=?, resolution_notes=? WHERE id=?'
  ).bind(status, actor.uid, now(), resolution_notes || null, c.req.param('id')).run();
  return c.json({ success: true });
});

// ── Audit Logs ───────────────────────────────────────────

admin.get('/audit-logs', async (c) => {
  const { page = 1, action, actor_uid } = c.req.query();
  const offset = (parseInt(page) - 1) * 50;
  const conditions = [];
  const params = [];
  if (action) { conditions.push('al.action LIKE ?'); params.push(`%${action}%`); }
  if (actor_uid) { conditions.push('al.actor_uid = ?'); params.push(actor_uid); }
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const { results } = await c.env.DB.prepare(
    `SELECT al.*, u.name as actor_name FROM audit_logs al LEFT JOIN users u ON al.actor_uid=u.uid ${where} ORDER BY al.created_at DESC LIMIT 50 OFFSET ?`
  ).bind(...params, offset).all();
  const total = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM audit_logs al ${where}`).bind(...params).first();
  return c.json({ logs: results, total: total.count });
});

// ── Success Stories ──────────────────────────────────────

admin.get('/success-stories', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM success_stories ORDER BY created_at DESC'
  ).all();
  return c.json({ stories: results });
});

admin.post('/success-stories', async (c) => {
  const actor = c.get('user');
  const { dreamId, title, story, outcome, quote, dreamer_alias, fulfiller_alias, category, featured } = await c.req.json();
  const id = uid();
  await c.env.DB.prepare(
    `INSERT INTO success_stories (id, dream_id, title, story, outcome, quote, dreamer_alias, fulfiller_alias, category, featured)
     VALUES (?,?,?,?,?,?,?,?,?,?)`
  ).bind(id, dreamId || null, title, story, outcome || null, quote || null,
    dreamer_alias || null, fulfiller_alias || null, category || null, featured ? 1 : 0).run();
  return c.json({ success: true, id }, 201);
});

admin.put('/success-stories/:id', async (c) => {
  const { featured, published } = await c.req.json();
  await c.env.DB.prepare('UPDATE success_stories SET featured=COALESCE(?,featured), published=COALESCE(?,published) WHERE id=?')
    .bind(featured !== undefined ? (featured ? 1 : 0) : null,
      published !== undefined ? (published ? 1 : 0) : null,
      c.req.param('id')).run();
  return c.json({ success: true });
});

// ── Platform Settings ────────────────────────────────────

admin.get('/settings', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM platform_settings').all();
  const settings = {};
  results.forEach((r) => { settings[r.key] = r.value; });
  return c.json({ settings });
});

admin.put('/settings', async (c) => {
  const actor = c.get('user');
  const body = await c.req.json();
  for (const [key, value] of Object.entries(body)) {
    await c.env.DB.prepare(
      'INSERT INTO platform_settings (key, value, updated_by, updated_at) VALUES (?,?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_by=excluded.updated_by, updated_at=excluded.updated_at'
    ).bind(key, String(value), actor.uid, now()).run();
  }
  return c.json({ success: true });
});

// ── Community Challenges ─────────────────────────────────

admin.get('/challenges', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM community_challenges ORDER BY created_at DESC').all();
  return c.json({ challenges: results });
});

admin.post('/challenges', async (c) => {
  const actor = c.get('user');
  const { title, description, goal_count, category, starts_at, ends_at } = await c.req.json();
  const id = uid();
  await c.env.DB.prepare(
    'INSERT INTO community_challenges (id, title, description, goal_count, category, starts_at, ends_at, created_by) VALUES (?,?,?,?,?,?,?,?)'
  ).bind(id, title, description, goal_count || 10, category || null, starts_at || null, ends_at || null, actor.uid).run();
  return c.json({ success: true, id }, 201);
});

export default admin;
