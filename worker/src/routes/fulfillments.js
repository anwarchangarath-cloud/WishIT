import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { uid, audit, notify, adjustTrustScore } from '../utils/helpers.js';

const fulfillments = new Hono();
fulfillments.use('*', authMiddleware());

// Request to fulfill a dream (expanded application flow)
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

  // Notify the dreamer
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

// Fulfillments for my dream (as dreamer)
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

export default fulfillments;
