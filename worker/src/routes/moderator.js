import { Hono } from 'hono';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { now, audit } from '../utils/helpers.js';

const mod = new Hono();
mod.use('*', authMiddleware(), requireRole('moderator', 'admin'));

// Pending dreams queue
mod.get('/dreams', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT d.*, u.name as dreamer_name, u.email as dreamer_email, u.trust_score
     FROM dreams d JOIN users u ON d.user_uid = u.uid
     WHERE d.status='pending' ORDER BY d.created_at ASC`
  ).all();
  return c.json({ dreams: results });
});

// Approve dream
mod.put('/dreams/:id/approve', async (c) => {
  const user = c.get('user');
  const { notes } = await c.req.json();
  await c.env.DB.prepare(
    `UPDATE dreams SET status='published', moderator_notes=?, moderated_by=?, moderated_at=?, updated_at=? WHERE id=?`
  ).bind(notes || null, user.uid, now(), now(), c.req.param('id')).run();

  await c.env.DB.prepare("UPDATE users SET dream_count=dream_count+1 WHERE uid=(SELECT user_uid FROM dreams WHERE id=?)")
    .bind(c.req.param('id')).run();

  await audit(c.env.DB, user.uid, 'DREAM_APPROVED', c.req.param('id'), 'dream');
  return c.json({ success: true });
});

// Reject dream
mod.put('/dreams/:id/reject', async (c) => {
  const user = c.get('user');
  const { notes } = await c.req.json();
  if (!notes) return c.json({ error: 'Rejection reason required' }, 400);
  await c.env.DB.prepare(
    `UPDATE dreams SET status='rejected', moderator_notes=?, moderated_by=?, moderated_at=?, updated_at=? WHERE id=?`
  ).bind(notes, user.uid, now(), now(), c.req.param('id')).run();

  await audit(c.env.DB, user.uid, 'DREAM_REJECTED', c.req.param('id'), 'dream', { notes });
  return c.json({ success: true });
});

// Pending fulfillment requests
mod.get('/fulfillments', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT fr.*, u.name as fulfiller_name, u.email as fulfiller_email, u.trust_score,
            d.title as dream_title, d.category as dream_category
     FROM fulfillment_requests fr
     JOIN users u ON fr.fulfiller_uid = u.uid
     JOIN dreams d ON fr.dream_id = d.id
     WHERE fr.status='pending' ORDER BY fr.created_at ASC`
  ).all();
  return c.json({ requests: results });
});

// Approve fulfillment
mod.put('/fulfillments/:id/approve', async (c) => {
  const user = c.get('user');
  const { notes } = await c.req.json();
  await c.env.DB.prepare(
    `UPDATE fulfillment_requests SET status='approved', moderator_notes=?, moderated_by=?, moderated_at=? WHERE id=?`
  ).bind(notes || null, user.uid, now(), c.req.param('id')).run();

  const fr = await c.env.DB.prepare('SELECT * FROM fulfillment_requests WHERE id=?').bind(c.req.param('id')).first();
  await c.env.DB.prepare('UPDATE dreams SET fulfiller_uid=? WHERE id=?').bind(fr.fulfiller_uid, fr.dream_id).run();

  await audit(c.env.DB, user.uid, 'FULFILLMENT_APPROVED', c.req.param('id'), 'fulfillment');
  return c.json({ success: true });
});

// Reject fulfillment
mod.put('/fulfillments/:id/reject', async (c) => {
  const user = c.get('user');
  const { notes } = await c.req.json();
  await c.env.DB.prepare(
    `UPDATE fulfillment_requests SET status='rejected', moderator_notes=?, moderated_by=?, moderated_at=? WHERE id=?`
  ).bind(notes || null, user.uid, now(), c.req.param('id')).run();

  await audit(c.env.DB, user.uid, 'FULFILLMENT_REJECTED', c.req.param('id'), 'fulfillment');
  return c.json({ success: true });
});

// Reports queue
mod.get('/reports', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT r.*, d.title as dream_title, u.name as reporter_name
     FROM reports r JOIN dreams d ON r.dream_id=d.id JOIN users u ON r.reporter_uid=u.uid
     WHERE r.status='pending' ORDER BY r.created_at ASC`
  ).all();
  return c.json({ reports: results });
});

// Review report
mod.put('/reports/:id', async (c) => {
  const user = c.get('user');
  const { status } = await c.req.json();
  if (!['reviewed', 'dismissed'].includes(status)) return c.json({ error: 'Invalid status' }, 400);
  await c.env.DB.prepare(
    'UPDATE reports SET status=?, reviewed_by=?, reviewed_at=? WHERE id=?'
  ).bind(status, user.uid, now(), c.req.param('id')).run();
  return c.json({ success: true });
});

// Mod stats
mod.get('/stats', async (c) => {
  const [pendingDreams, pendingFulfillments, pendingReports] = await Promise.all([
    c.env.DB.prepare("SELECT COUNT(*) as count FROM dreams WHERE status='pending'").first(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM fulfillment_requests WHERE status='pending'").first(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM reports WHERE status='pending'").first(),
  ]);
  return c.json({
    pendingDreams: pendingDreams.count,
    pendingFulfillments: pendingFulfillments.count,
    pendingReports: pendingReports.count,
  });
});

export default mod;
