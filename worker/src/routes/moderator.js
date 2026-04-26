import { Hono } from 'hono';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { uid, now, audit, notify, adjustTrustScore } from '../utils/helpers.js';

const mod = new Hono();
mod.use('*', authMiddleware(), requireRole('moderator', 'admin'));

// ── Dream Queue ──────────────────────────────────────────

mod.get('/dreams', async (c) => {
  const { status = 'pending', page = 1 } = c.req.query();
  const offset = (parseInt(page) - 1) * 30;
  const { results } = await c.env.DB.prepare(`
    SELECT d.*, u.name as dreamer_name, u.email as dreamer_email, u.trust_score, u.verified, u.dream_count
    FROM dreams d JOIN users u ON d.user_uid = u.uid
    WHERE d.status = ? ORDER BY
      CASE d.urgency WHEN 'critical' THEN 0 WHEN 'urgent' THEN 1 ELSE 2 END,
      d.created_at ASC
    LIMIT 30 OFFSET ?
  `).bind(status, offset).all();
  const total = await c.env.DB.prepare("SELECT COUNT(*) as count FROM dreams WHERE status = ?").bind(status).first();
  return c.json({ dreams: results, total: total.count });
});

mod.put('/dreams/:id/approve', async (c) => {
  const user = c.get('user');
  const { notes, badge } = await c.req.json();
  const dream = await c.env.DB.prepare('SELECT * FROM dreams WHERE id = ?').bind(c.req.param('id')).first();
  if (!dream) return c.json({ error: 'Not found' }, 404);

  await c.env.DB.prepare(
    `UPDATE dreams SET status='published', badge=COALESCE(?,badge), moderator_notes=?, moderated_by=?, moderated_at=?, updated_at=? WHERE id=?`
  ).bind(badge || null, notes || null, user.uid, now(), now(), dream.id).run();

  await c.env.DB.prepare("UPDATE users SET dream_count = dream_count + 1 WHERE uid = ?").bind(dream.user_uid).run();
  await adjustTrustScore(c.env.DB, dream.user_uid, 5, 'DREAM_APPROVED', 'Dream approved', dream.id, 'dream');
  await audit(c.env.DB, user.uid, 'DREAM_APPROVED', dream.id, 'dream', { notes });
  await notify(c.env.DB, dream.user_uid, 'dream_approved', 'Your dream was approved!',
    `"${dream.title}" is now live and visible to fulfillers. We'll let you know when someone wants to help.`, '/dashboard');

  return c.json({ success: true });
});

mod.put('/dreams/:id/reject', async (c) => {
  const user = c.get('user');
  const { notes } = await c.req.json();
  if (!notes) return c.json({ error: 'Rejection reason required' }, 400);
  const dream = await c.env.DB.prepare('SELECT * FROM dreams WHERE id = ?').bind(c.req.param('id')).first();
  if (!dream) return c.json({ error: 'Not found' }, 404);

  await c.env.DB.prepare(
    `UPDATE dreams SET status='rejected', moderator_notes=?, moderated_by=?, moderated_at=?, updated_at=? WHERE id=?`
  ).bind(notes, user.uid, now(), now(), dream.id).run();

  await adjustTrustScore(c.env.DB, dream.user_uid, -2, 'DREAM_REJECTED', 'Dream rejected', dream.id, 'dream');
  await audit(c.env.DB, user.uid, 'DREAM_REJECTED', dream.id, 'dream', { notes });
  await notify(c.env.DB, dream.user_uid, 'dream_rejected', 'Update on your dream submission',
    `Your dream "${dream.title}" needs revision. Moderator note: ${notes}`, '/dashboard');

  return c.json({ success: true });
});

mod.put('/dreams/:id/request-info', async (c) => {
  const user = c.get('user');
  const { question } = await c.req.json();
  if (!question) return c.json({ error: 'Question required' }, 400);
  const dream = await c.env.DB.prepare('SELECT * FROM dreams WHERE id = ?').bind(c.req.param('id')).first();
  if (!dream) return c.json({ error: 'Not found' }, 404);

  await c.env.DB.prepare('INSERT INTO moderator_notes (id, moderator_uid, target_id, target_type, note, note_type) VALUES (?,?,?,?,?,?)')
    .bind(uid(), user.uid, dream.id, 'dream', question, 'info_request').run();
  await notify(c.env.DB, dream.user_uid, 'info_requested', 'More information requested',
    `A moderator has asked for more information about "${dream.title}": ${question}`, '/dashboard');

  return c.json({ success: true });
});

// ── Fulfillment Queue ────────────────────────────────────

mod.get('/fulfillments', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT fr.*, u.name as fulfiller_name, u.email as fulfiller_email, u.trust_score, u.verified,
           u.fulfilled_count, u.skills, u.location,
           d.title as dream_title, d.category as dream_category, d.urgency as dream_urgency
    FROM fulfillment_requests fr
    JOIN users u ON fr.fulfiller_uid = u.uid
    JOIN dreams d ON fr.dream_id = d.id
    WHERE fr.status = 'pending' ORDER BY d.urgency DESC, fr.created_at ASC
  `).all();
  return c.json({ requests: results });
});

mod.put('/fulfillments/:id/approve', async (c) => {
  const user = c.get('user');
  const { notes } = await c.req.json();
  const fr = await c.env.DB.prepare('SELECT * FROM fulfillment_requests WHERE id = ?').bind(c.req.param('id')).first();
  if (!fr) return c.json({ error: 'Not found' }, 404);

  await c.env.DB.prepare(
    `UPDATE fulfillment_requests SET status='approved', moderator_notes=?, moderated_by=?, moderated_at=? WHERE id=?`
  ).bind(notes || null, user.uid, now(), fr.id).run();

  const dream = await c.env.DB.prepare('SELECT * FROM dreams WHERE id = ?').bind(fr.dream_id).first();
  if (dream && !dream.dream_team) {
    await c.env.DB.prepare("UPDATE dreams SET fulfiller_uid=?, status='matched', updated_at=? WHERE id=?")
      .bind(fr.fulfiller_uid, now(), fr.dream_id).run();
  }

  await adjustTrustScore(c.env.DB, fr.fulfiller_uid, 10, 'FULFILLMENT_APPROVED', 'Fulfillment request approved', fr.id, 'fulfillment');
  await audit(c.env.DB, user.uid, 'FULFILLMENT_APPROVED', fr.id, 'fulfillment');

  if (dream) {
    await notify(c.env.DB, fr.fulfiller_uid, 'fulfillment_approved', 'Your request was approved!',
      `You've been connected to help with "${dream.title}". You can now message the dreamer.`, `/messages/${dream.id}`);
    await notify(c.env.DB, dream.user_uid, 'connection_approved', 'A fulfiller has been connected!',
      `Great news — a fulfiller has been approved to help with "${dream.title}". You can now chat with them.`, `/messages/${dream.id}`);
  }

  return c.json({ success: true });
});

mod.put('/fulfillments/:id/reject', async (c) => {
  const user = c.get('user');
  const { notes } = await c.req.json();
  const fr = await c.env.DB.prepare('SELECT * FROM fulfillment_requests WHERE id = ?').bind(c.req.param('id')).first();
  if (!fr) return c.json({ error: 'Not found' }, 404);

  await c.env.DB.prepare(
    `UPDATE fulfillment_requests SET status='rejected', moderator_notes=?, moderated_by=?, moderated_at=? WHERE id=?`
  ).bind(notes || null, user.uid, now(), fr.id).run();

  const dream = await c.env.DB.prepare('SELECT title FROM dreams WHERE id = ?').bind(fr.dream_id).first();
  await notify(c.env.DB, fr.fulfiller_uid, 'fulfillment_rejected', 'Fulfillment request not approved',
    `Your request to help with "${dream?.title}" was not approved at this time.${notes ? ' Note: ' + notes : ''}`, '/dashboard');

  await audit(c.env.DB, user.uid, 'FULFILLMENT_REJECTED', fr.id, 'fulfillment', { notes });
  return c.json({ success: true });
});

// ── Reports Queue ────────────────────────────────────────

mod.get('/reports', async (c) => {
  const { status = 'pending' } = c.req.query();
  const { results } = await c.env.DB.prepare(`
    SELECT r.*, d.title as dream_title, u.name as reporter_name
    FROM reports r JOIN dreams d ON r.dream_id = d.id JOIN users u ON r.reporter_uid = u.uid
    WHERE r.status = ? ORDER BY r.created_at ASC
  `).bind(status).all();
  return c.json({ reports: results });
});

mod.put('/reports/:id', async (c) => {
  const user = c.get('user');
  const { status, action_taken } = await c.req.json();
  if (!['reviewed', 'dismissed', 'actioned'].includes(status)) return c.json({ error: 'Invalid status' }, 400);
  await c.env.DB.prepare(
    'UPDATE reports SET status=?, action_taken=?, reviewed_by=?, reviewed_at=? WHERE id=?'
  ).bind(status, action_taken || null, user.uid, now(), c.req.param('id')).run();
  await audit(c.env.DB, user.uid, `REPORT_${status.toUpperCase()}`, c.req.param('id'), 'report');
  return c.json({ success: true });
});

// ── Case Notes ───────────────────────────────────────────

mod.post('/notes', async (c) => {
  const user = c.get('user');
  const { targetId, targetType, note, note_type = 'general' } = await c.req.json();
  if (!targetId || !targetType || !note) return c.json({ error: 'Missing fields' }, 400);
  const id = uid();
  await c.env.DB.prepare(
    'INSERT INTO moderator_notes (id, moderator_uid, target_id, target_type, note, note_type) VALUES (?,?,?,?,?,?)'
  ).bind(id, user.uid, targetId, targetType, note, note_type).run();
  return c.json({ success: true, id });
});

mod.get('/notes/:targetId', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT mn.*, u.name as moderator_name
    FROM moderator_notes mn JOIN users u ON mn.moderator_uid = u.uid
    WHERE mn.target_id = ? ORDER BY mn.created_at DESC
  `).bind(c.req.param('targetId')).all();
  return c.json({ notes: results });
});

// ── Escalations ──────────────────────────────────────────

mod.post('/escalate', async (c) => {
  const user = c.get('user');
  const { targetId, targetType, reason, details, priority = 'normal' } = await c.req.json();
  if (!targetId || !targetType || !reason) return c.json({ error: 'Missing fields' }, 400);
  const id = uid();
  await c.env.DB.prepare(
    'INSERT INTO escalations (id, escalated_by, target_id, target_type, reason, details, priority) VALUES (?,?,?,?,?,?,?)'
  ).bind(id, user.uid, targetId, targetType, reason, details || null, priority).run();
  await audit(c.env.DB, user.uid, 'ESCALATION_CREATED', id, 'escalation', { reason, priority });
  return c.json({ success: true, id });
});

// ── Fulfillment Completions Queue ───────────────────────

mod.get('/completions', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT fc.*,
           d.title as dream_title, d.category as dream_category, d.status as dream_status,
           u.name as fulfiller_name, u.email as fulfiller_email, u.trust_score, u.fulfilled_count,
           dreamer.name as dreamer_name, dreamer.email as dreamer_email
    FROM fulfillment_completions fc
    JOIN dreams d ON fc.dream_id = d.id
    JOIN users u ON fc.fulfiller_uid = u.uid
    JOIN users dreamer ON d.user_uid = dreamer.uid
    WHERE fc.status IN ('pending', 'dreamer_notified')
    ORDER BY fc.created_at ASC
  `).all();
  return c.json({ completions: results });
});

mod.put('/completions/:id/notify-dreamer', async (c) => {
  const user = c.get('user');
  const completion = await c.env.DB.prepare('SELECT * FROM fulfillment_completions WHERE id = ?')
    .bind(c.req.param('id')).first();
  if (!completion) return c.json({ error: 'Not found' }, 404);

  await c.env.DB.prepare(
    "UPDATE fulfillment_completions SET status='dreamer_notified', moderator_uid=?, moderator_reviewed_at=? WHERE id=?"
  ).bind(user.uid, now(), completion.id).run();

  const dream = await c.env.DB.prepare('SELECT * FROM dreams WHERE id = ?').bind(completion.dream_id).first();
  if (dream) {
    await notify(c.env.DB, dream.user_uid, 'dreamer_confirmation_needed',
      'Please confirm your dream fulfillment',
      `The fulfiller for "${dream.title}" says they've completed it. Please confirm or let us know if you need more support.`,
      '/dashboard');
    await audit(c.env.DB, user.uid, 'DREAMER_NOTIFIED_FOR_CONFIRMATION', completion.id, 'fulfillment_completion', { dream_id: dream.id });
  }

  return c.json({ success: true });
});

// ── Stats ────────────────────────────────────────────────

mod.get('/stats', async (c) => {
  const [pendingDreams, pendingFulfillments, pendingReports, urgentDreams, openEscalations, pendingCompletions] = await Promise.all([
    c.env.DB.prepare("SELECT COUNT(*) as count FROM dreams WHERE status='pending'").first(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM fulfillment_requests WHERE status='pending'").first(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM reports WHERE status='pending'").first(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM dreams WHERE status='pending' AND urgency IN ('urgent','critical')").first(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM escalations WHERE status='open'").first(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM fulfillment_completions WHERE status IN ('pending','dreamer_notified')").first(),
  ]);
  return c.json({
    pendingDreams: pendingDreams.count,
    pendingFulfillments: pendingFulfillments.count,
    pendingReports: pendingReports.count,
    urgentDreams: urgentDreams.count,
    openEscalations: openEscalations.count,
    pendingCompletions: pendingCompletions.count,
  });
});

// ── All Flagged Users (for review) ───────────────────────

mod.get('/flagged-users', async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT uid, name, email, trust_score, dream_count, fulfilled_count, created_at FROM users WHERE trust_score < 70 AND role = 'user' ORDER BY trust_score ASC LIMIT 50"
  ).all();
  return c.json({ users: results });
});

export default mod;
