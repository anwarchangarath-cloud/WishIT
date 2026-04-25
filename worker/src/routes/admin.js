import { Hono } from 'hono';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { now } from '../utils/helpers.js';

const admin = new Hono();
admin.use('*', authMiddleware(), requireRole('admin'));

// Platform stats
admin.get('/stats', async (c) => {
  const [users, dreams, published, fulfilled, fulfillments, reports] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first(),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM dreams').first(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM dreams WHERE status='published'").first(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM dreams WHERE status='fulfilled'").first(),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM fulfillment_requests').first(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM reports WHERE status='pending'").first(),
  ]);

  return c.json({
    totalUsers: users.count,
    totalDreams: dreams.count,
    publishedDreams: published.count,
    fulfilledDreams: fulfilled.count,
    totalFulfillments: fulfillments.count,
    pendingReports: reports.count,
  });
});

// All users with pagination
admin.get('/users', async (c) => {
  const { role, page = 1 } = c.req.query();
  const offset = (parseInt(page) - 1) * 50;
  let query = 'SELECT * FROM users';
  const params = [];
  if (role) { query += ' WHERE role=?'; params.push(role); }
  query += ' ORDER BY created_at DESC LIMIT 50 OFFSET ?';
  params.push(offset);
  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  return c.json({ users: results });
});

// Update user (role, trust score, verified)
admin.put('/users/:uid', async (c) => {
  const { role, trust_score, verified } = await c.req.json();
  await c.env.DB.prepare(
    `UPDATE users SET role=COALESCE(?,role), trust_score=COALESCE(?,trust_score),
     verified=COALESCE(?,verified), updated_at=? WHERE uid=?`
  ).bind(role, trust_score, verified !== undefined ? (verified ? 1 : 0) : null, now(), c.req.param('uid')).run();
  return c.json({ success: true });
});

// All moderators
admin.get('/moderators', async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM users WHERE role='moderator' ORDER BY created_at DESC").all();
  return c.json({ moderators: results });
});

// Promote user to moderator
admin.post('/moderators', async (c) => {
  const { uid } = await c.req.json();
  await c.env.DB.prepare("UPDATE users SET role='moderator', updated_at=? WHERE uid=?").bind(now(), uid).run();
  return c.json({ success: true });
});

// Remove moderator
admin.delete('/moderators/:uid', async (c) => {
  await c.env.DB.prepare("UPDATE users SET role='user', updated_at=? WHERE uid=?").bind(now(), c.req.param('uid')).run();
  return c.json({ success: true });
});

// Audit logs
admin.get('/audit-logs', async (c) => {
  const { page = 1, action } = c.req.query();
  const offset = (parseInt(page) - 1) * 50;
  let query = `SELECT al.*, u.name as actor_name FROM audit_logs al
               JOIN users u ON al.actor_uid=u.uid`;
  const params = [];
  if (action) { query += ' WHERE al.action=?'; params.push(action); }
  query += ' ORDER BY al.created_at DESC LIMIT 50 OFFSET ?';
  params.push(offset);
  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  return c.json({ logs: results });
});

// All dreams (any status)
admin.get('/dreams', async (c) => {
  const { status, page = 1 } = c.req.query();
  const offset = (parseInt(page) - 1) * 50;
  let query = 'SELECT d.*, u.name as dreamer_name FROM dreams d JOIN users u ON d.user_uid=u.uid';
  const params = [];
  if (status) { query += ' WHERE d.status=?'; params.push(status); }
  query += ' ORDER BY d.created_at DESC LIMIT 50 OFFSET ?';
  params.push(offset);
  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  return c.json({ dreams: results });
});

// Delete dream
admin.delete('/dreams/:id', async (c) => {
  await c.env.DB.prepare('DELETE FROM dreams WHERE id=?').bind(c.req.param('id')).run();
  return c.json({ success: true });
});

// Success stories
admin.get('/success-stories', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM success_stories ORDER BY created_at DESC').all();
  return c.json({ stories: results });
});

admin.post('/success-stories', async (c) => {
  const { dreamId, title, story, featured } = await c.req.json();
  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    'INSERT INTO success_stories (id, dream_id, title, story, featured) VALUES (?,?,?,?,?)'
  ).bind(id, dreamId, title, story, featured ? 1 : 0).run();
  return c.json({ success: true }, 201);
});

export default admin;
