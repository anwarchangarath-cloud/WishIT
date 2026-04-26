import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { uid, now, notify } from '../utils/helpers.js';

const messages = new Hono();
messages.use('*', authMiddleware());

// List all message threads for current user
messages.get('/threads', async (c) => {
  const user = c.get('user');
  const { results } = await c.env.DB.prepare(`
    SELECT mt.*, d.title as dream_title, d.category as dream_category,
           dreamer.name as dreamer_name, fulfiller.name as fulfiller_name
    FROM message_threads mt
    JOIN dreams d ON mt.dream_id = d.id
    JOIN users dreamer ON mt.dreamer_uid = dreamer.uid
    JOIN users fulfiller ON mt.fulfiller_uid = fulfiller.uid
    WHERE mt.dreamer_uid = ? OR mt.fulfiller_uid = ?
    ORDER BY mt.last_message_at DESC
  `).bind(user.uid, user.uid).all();
  return c.json({ threads: results });
});

// Get or create a thread for a dream + fulfiller pair
messages.get('/thread/:dreamId', async (c) => {
  const user = c.get('user');
  const dreamId = c.req.param('dreamId');

  const dream = await c.env.DB.prepare('SELECT * FROM dreams WHERE id = ?').bind(dreamId).first();
  if (!dream) return c.json({ error: 'Dream not found' }, 404);

  const isParticipant = dream.user_uid === user.uid || dream.fulfiller_uid === user.uid ||
    ['moderator', 'admin'].includes(user.role);
  if (!isParticipant) return c.json({ error: 'Forbidden' }, 403);

  const thread = await c.env.DB.prepare(
    'SELECT * FROM message_threads WHERE dream_id = ? AND (dreamer_uid = ? OR fulfiller_uid = ?)'
  ).bind(dreamId, user.uid, user.uid).first();

  if (!thread) return c.json({ thread: null, messages: [], dream: { id: dream.id, status: dream.status, user_uid: dream.user_uid, fulfiller_uid: dream.fulfiller_uid, title: dream.title } });

  const { results } = await c.env.DB.prepare(`
    SELECT m.*, u.name as sender_name
    FROM messages m JOIN users u ON m.sender_uid = u.uid
    WHERE m.thread_id = ? ORDER BY m.created_at ASC
  `).bind(thread.id).all();

  // Mark messages as read
  const unreadField = dream.user_uid === user.uid ? 'dreamer_unread' : 'fulfiller_unread';
  await c.env.DB.prepare(`UPDATE message_threads SET ${unreadField} = 0 WHERE id = ?`).bind(thread.id).run();
  await c.env.DB.prepare('UPDATE messages SET read = 1 WHERE thread_id = ? AND receiver_uid = ?')
    .bind(thread.id, user.uid).run();

  return c.json({
    thread,
    messages: results,
    dream: { id: dream.id, status: dream.status, user_uid: dream.user_uid, fulfiller_uid: dream.fulfiller_uid, title: dream.title },
  });
});

// Send a message
messages.post('/', async (c) => {
  const user = c.get('user');
  const { dreamId, content } = await c.req.json();
  if (!dreamId || !content?.trim()) return c.json({ error: 'Missing fields' }, 400);

  const dream = await c.env.DB.prepare('SELECT * FROM dreams WHERE id = ?').bind(dreamId).first();
  if (!dream) return c.json({ error: 'Dream not found' }, 404);
  if (!['matched', 'in_progress', 'pending_fulfillment', 'fulfilled'].includes(dream.status)) {
    return c.json({ error: 'Messaging is only available after connection is approved' }, 403);
  }

  const isDreamer = dream.user_uid === user.uid;
  const isFulfiller = dream.fulfiller_uid === user.uid;
  const isMod = ['moderator', 'admin'].includes(user.role);
  if (!isDreamer && !isFulfiller && !isMod) return c.json({ error: 'Forbidden' }, 403);

  const receiverUid = isDreamer ? dream.fulfiller_uid : dream.user_uid;

  let thread = await c.env.DB.prepare(
    'SELECT * FROM message_threads WHERE dream_id = ? AND dreamer_uid = ? AND fulfiller_uid = ?'
  ).bind(dreamId, dream.user_uid, dream.fulfiller_uid).first();

  if (!thread) {
    const threadId = uid();
    await c.env.DB.prepare(
      `INSERT INTO message_threads (id, dream_id, dreamer_uid, fulfiller_uid, last_message, last_message_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(threadId, dreamId, dream.user_uid, dream.fulfiller_uid, content.trim().slice(0, 80), now()).run();
    thread = await c.env.DB.prepare('SELECT * FROM message_threads WHERE id = ?').bind(threadId).first();
  }

  const msgId = uid();
  await c.env.DB.prepare(
    'INSERT INTO messages (id, thread_id, dream_id, sender_uid, receiver_uid, content) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(msgId, thread.id, dreamId, user.uid, receiverUid, content.trim()).run();

  const unreadField = isDreamer ? 'fulfiller_unread' : 'dreamer_unread';
  await c.env.DB.prepare(
    `UPDATE message_threads SET last_message = ?, last_message_at = ?, ${unreadField} = ${unreadField} + 1 WHERE id = ?`
  ).bind(content.trim().slice(0, 80), now(), thread.id).run();

  await notify(c.env.DB, receiverUid, 'message', 'New message received',
    `You have a new message about "${dream.title}"`, `/messages/${dreamId}`);

  const msg = await c.env.DB.prepare('SELECT * FROM messages WHERE id = ?').bind(msgId).first();
  return c.json({ message: msg }, 201);
});

// Mod: flag a thread
messages.put('/thread/:threadId/flag', async (c) => {
  const user = c.get('user');
  if (!['moderator', 'admin'].includes(user.role)) return c.json({ error: 'Forbidden' }, 403);
  await c.env.DB.prepare("UPDATE message_threads SET status = 'flagged' WHERE id = ?")
    .bind(c.req.param('threadId')).run();
  return c.json({ success: true });
});

export default messages;
