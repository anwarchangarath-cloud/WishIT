import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { uid, now, audit, notify, adjustTrustScore } from '../utils/helpers.js';

const fulfillments = new Hono();
fulfillments.use('*', authMiddleware());

// Request to fulfill a dream
fulfillments.post('/', async (c) => {
  const user = c.get('user');
  if (user.banned || user.suspended) return c.json({ error: 'Account restricted' }, 403);

  const { dreamId, message, why_help, how_fulfill, experience } = await c.req.json();
  if (!dreamId) return c.json({ error: 'Missing dreamId' }, 400);
  if (!why_help || !how_fulfill) return c.json({ error: 'Please explain why you want to help and how you will fulfill this dream' }, 400);

  const dream = await c.env.DB.prepare("SELECT * FROM dreams WHERE id = ? AND status = 'published'").bind(dreamId).first();
  if (!dream) return c.json({ error: 'Dream not found or not published' }, 404);
  if (dream.user_uid === user.uid) return c.json({ error: 'Cannot fulfill your own dream' }, 400);

  const id = uid();
  try {
    await c.env.DB.prepare(
      `INSERT INTO fulfillment_requests (id, dream_id, fulfiller_uid, message, why_help, how_fulfill, experience, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`
    ).bind(id, dreamId, user.uid, message || null, why_help, how_fulfill, experience || null).run();
  } catch {
    return c.json({ error: 'You have already requested to fulfill this dream' }, 409);
  }

  await audit(c.env.DB, user.uid, 'FULFILLMENT_REQUESTED', id, 'fulfillment', { dreamId });

  await notify(c.env.DB, dream.user_uid, 'fulfillment_received',
    'Someone wants to fulfill your dream!',
    `A verified fulfiller has applied to make "${dream.title}" real. Awaiting moderator review.`,
    '/dashboard');

  const req = await c.env.DB.prepare('SELECT * FROM fulfillment_requests WHERE id = ?').bind(id).first();
  return c.json({ request: req }, 201);
});

// My fulfillment requests (as fulfiller)
fulfillments.get('/my', async (c) => {
  const user = c.get('user');
  const { results } = await c.env.DB.prepare(`
    SELECT fr.*, d.title as dream_title, d.category as dream_category, d.status as dream_status, d.urgency
    FROM fulfillment_requests fr
    JOIN dreams d ON fr.dream_id = d.id
    WHERE fr.fulfiller_uid = ? ORDER BY fr.created_at DESC
  `).bind(user.uid).all();
  return c.json({ requests: results });
});

// Fulfillments for a dream (as dreamer/mod)
fulfillments.get('/dream/:dreamId', async (c) => {
  const user = c.get('user');
  const dream = await c.env.DB.prepare('SELECT user_uid FROM dreams WHERE id = ?').bind(c.req.param('dreamId')).first();
  if (!dream || (dream.user_uid !== user.uid && !['moderator', 'admin'].includes(user.role))) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  const { results } = await c.env.DB.prepare(`
    SELECT fr.*, u.name as fulfiller_name, u.trust_score, u.verified, u.fulfilled_count,
           u.skills, u.location, u.fulfiller_bio
    FROM fulfillment_requests fr
    JOIN users u ON fr.fulfiller_uid = u.uid
    WHERE fr.dream_id = ? ORDER BY fr.created_at DESC
  `).bind(c.req.param('dreamId')).all();
  return c.json({ requests: results });
});

// Withdraw own request
fulfillments.delete('/:id', async (c) => {
  const user = c.get('user');
  const req = await c.env.DB.prepare('SELECT * FROM fulfillment_requests WHERE id = ?').bind(c.req.param('id')).first();
  if (!req || req.fulfiller_uid !== user.uid) return c.json({ error: 'Not found' }, 404);
  if (req.status !== 'pending') return c.json({ error: 'Cannot withdraw a processed request' }, 400);
  await c.env.DB.prepare("UPDATE fulfillment_requests SET status = 'withdrawn' WHERE id = ?").bind(req.id).run();
  return c.json({ success: true });
});

// ── PHASE 6: Fulfiller marks dream as fulfilled ──────────────────────────────

fulfillments.post('/complete', async (c) => {
  const user = c.get('user');
  const { dreamId, note, proofUrl } = await c.req.json();
  if (!dreamId) return c.json({ error: 'Missing dreamId' }, 400);

  const dream = await c.env.DB.prepare("SELECT * FROM dreams WHERE id = ? AND status = 'in_progress'").bind(dreamId).first();
  if (!dream) return c.json({ error: 'Dream not found or not in progress' }, 404);
  if (dream.fulfiller_uid !== user.uid) return c.json({ error: 'Only the fulfiller can initiate completion' }, 403);

  const id = uid();
  await c.env.DB.prepare(
    `INSERT INTO fulfillment_completions (id, dream_id, fulfiller_uid, note, proof_url) VALUES (?, ?, ?, ?, ?)`
  ).bind(id, dreamId, user.uid, note || null, proofUrl || null).run();

  await c.env.DB.prepare("UPDATE dreams SET status='pending_fulfillment', updated_at=? WHERE id=?")
    .bind(now(), dreamId).run();

  await audit(c.env.DB, user.uid, 'FULFILLMENT_COMPLETION_REQUESTED', id, 'fulfillment_completion', { dreamId, note: note || null });

  // Notify all moderators/admins
  const { results: mods } = await c.env.DB.prepare("SELECT uid FROM users WHERE role IN ('moderator','admin')").all();
  for (const mod of mods) {
    await notify(c.env.DB, mod.uid, 'fulfillment_completion_requested',
      'Fulfillment completion pending review',
      `A fulfiller has marked "${dream.title}" as fulfilled. Please review and notify the dreamer.`,
      '/moderator');
  }

  await notify(c.env.DB, dream.user_uid, 'dreamer_confirmation_pending',
    'Your dream may have been fulfilled!',
    `The fulfiller for "${dream.title}" has marked it as fulfilled. A moderator will review and contact you shortly.`,
    '/dashboard');

  return c.json({ success: true, id }, 201);
});

// ── PHASE 7: Dreamer confirms or requests more support ───────────────────────

fulfillments.post('/:dreamId/dreamer-response', async (c) => {
  const user = c.get('user');
  const { action } = await c.req.json();
  if (!['confirm', 'more_support'].includes(action)) return c.json({ error: 'Invalid action. Use confirm or more_support' }, 400);

  const dream = await c.env.DB.prepare("SELECT * FROM dreams WHERE id = ? AND status = 'pending_fulfillment'")
    .bind(c.req.param('dreamId')).first();
  if (!dream) return c.json({ error: 'Dream not found or not pending confirmation' }, 404);
  if (dream.user_uid !== user.uid) return c.json({ error: 'Only the dreamer can respond to fulfillment confirmation' }, 403);

  const completion = await c.env.DB.prepare(
    "SELECT * FROM fulfillment_completions WHERE dream_id = ? ORDER BY created_at DESC LIMIT 1"
  ).bind(dream.id).first();
  if (!completion) return c.json({ error: 'No completion request found' }, 404);

  if (action === 'confirm') {
    // Mark completion confirmed
    await c.env.DB.prepare("UPDATE fulfillment_completions SET status='confirmed' WHERE id=?")
      .bind(completion.id).run();

    // Mark dream fulfilled
    await c.env.DB.prepare("UPDATE dreams SET status='fulfilled', fulfilled_at=?, updated_at=? WHERE id=?")
      .bind(now(), now(), dream.id).run();

    // Boost fulfiller stats and trust
    await c.env.DB.prepare("UPDATE users SET fulfilled_count=fulfilled_count+1, impact_score=impact_score+20, updated_at=? WHERE uid=?")
      .bind(now(), dream.fulfiller_uid).run();
    await c.env.DB.prepare("UPDATE users SET impact_score=impact_score+5, updated_at=? WHERE uid=?")
      .bind(now(), dream.user_uid).run();
    await adjustTrustScore(c.env.DB, dream.fulfiller_uid, 20, 'DREAM_FULFILLED', 'Successfully fulfilled a dream', dream.id, 'dream');
    await adjustTrustScore(c.env.DB, dream.user_uid, 5, 'DREAM_FULFILLED_DREAMER', 'Dream fulfilled', dream.id, 'dream');

    await audit(c.env.DB, user.uid, 'DREAM_FULFILLED', dream.id, 'dream', { completion_id: completion.id });

    // Phase 8 notifications
    await notify(c.env.DB, dream.user_uid, 'dream_fulfilled_dreamer',
      'Your dream has been fulfilled!',
      `"${dream.title}" has been confirmed as fulfilled. Congratulations on making your dream a reality!`,
      '/dashboard');
    await notify(c.env.DB, dream.fulfiller_uid, 'fulfillment_success',
      'You successfully fulfilled a dream!',
      `The dreamer has confirmed you fulfilled "${dream.title}". Amazing impact!`,
      '/dashboard');

    const { results: mods } = await c.env.DB.prepare("SELECT uid FROM users WHERE role IN ('moderator','admin')").all();
    for (const mod of mods) {
      await notify(c.env.DB, mod.uid, 'case_completed',
        'Case completed and archived',
        `"${dream.title}" has been fulfilled and confirmed by the dreamer. Case closed.`,
        '/moderator');
    }
  } else {
    // Needs more support — return to in_progress
    await c.env.DB.prepare("UPDATE fulfillment_completions SET status='needs_more_support' WHERE id=?")
      .bind(completion.id).run();
    await c.env.DB.prepare("UPDATE dreams SET status='in_progress', updated_at=? WHERE id=?")
      .bind(now(), dream.id).run();

    await audit(c.env.DB, user.uid, 'FULFILLMENT_MORE_SUPPORT_NEEDED', dream.id, 'dream', { completion_id: completion.id });

    await notify(c.env.DB, dream.fulfiller_uid, 'more_support_needed',
      'Dreamer needs more support',
      `The dreamer for "${dream.title}" has indicated more support is needed. Please continue the conversation.`,
      `/messages/${dream.id}`);
    await notify(c.env.DB, dream.user_uid, 'more_support_requested',
      'Support request sent',
      `You've indicated "${dream.title}" needs more support. The fulfiller has been notified.`,
      `/messages/${dream.id}`);
  }

  return c.json({ success: true });
});

export default fulfillments;
