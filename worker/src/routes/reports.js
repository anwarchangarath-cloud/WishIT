import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { uid } from '../utils/helpers.js';

const reports = new Hono();
reports.use('*', authMiddleware());

reports.post('/', async (c) => {
  const user = c.get('user');
  const { dreamId, reason, details } = await c.req.json();
  if (!dreamId || !reason) return c.json({ error: 'Missing fields' }, 400);

  const id = uid();
  await c.env.DB.prepare(
    `INSERT INTO reports (id, dream_id, reporter_uid, reason, details, status)
     VALUES (?, ?, ?, ?, ?, 'pending')`
  ).bind(id, dreamId, user.uid, reason, details || null).run();

  return c.json({ success: true }, 201);
});

export default reports;
