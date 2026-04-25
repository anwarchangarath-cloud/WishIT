import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { now } from '../utils/helpers.js';

const notifications = new Hono();
notifications.use('*', authMiddleware());

notifications.get('/', async (c) => {
  const user = c.get('user');
  const { limit = 30, unread_only } = c.req.query();
  let q = 'SELECT * FROM notifications WHERE user_uid = ?';
  if (unread_only === 'true') q += ' AND read = 0';
  q += ' ORDER BY created_at DESC LIMIT ?';
  const { results } = await c.env.DB.prepare(q).bind(user.uid, parseInt(limit)).all();
  const unread = await c.env.DB.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_uid = ? AND read = 0').bind(user.uid).first();
  return c.json({ notifications: results, unread_count: unread.count });
});

notifications.put('/read-all', async (c) => {
  const user = c.get('user');
  await c.env.DB.prepare('UPDATE notifications SET read = 1 WHERE user_uid = ?').bind(user.uid).run();
  return c.json({ success: true });
});

notifications.put('/:id/read', async (c) => {
  const user = c.get('user');
  await c.env.DB.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_uid = ?')
    .bind(c.req.param('id'), user.uid).run();
  return c.json({ success: true });
});

notifications.delete('/:id', async (c) => {
  const user = c.get('user');
  await c.env.DB.prepare('DELETE FROM notifications WHERE id = ? AND user_uid = ?')
    .bind(c.req.param('id'), user.uid).run();
  return c.json({ success: true });
});

export default notifications;
