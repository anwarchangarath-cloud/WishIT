import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { uid } from '../utils/helpers.js';

const saves = new Hono();
saves.use('*', authMiddleware());

saves.get('/my', async (c) => {
  const user = c.get('user');
  const { results } = await c.env.DB.prepare(`
    SELECT ds.*, d.id as dream_id, d.title, d.category, d.status, d.support_count, d.urgency, d.badge
    FROM dream_saves ds
    JOIN dreams d ON ds.dream_id = d.id
    WHERE ds.user_uid = ? AND d.status = 'published'
    ORDER BY ds.created_at DESC
  `).bind(user.uid).all();
  return c.json({ saved: results });
});

saves.post('/dreams/:id', async (c) => {
  const user = c.get('user');
  const dreamId = c.req.param('id');
  const dream = await c.env.DB.prepare("SELECT id FROM dreams WHERE id = ? AND status = 'published'").bind(dreamId).first();
  if (!dream) return c.json({ error: 'Dream not found' }, 404);
  try {
    await c.env.DB.prepare('INSERT INTO dream_saves (id, dream_id, user_uid) VALUES (?, ?, ?)')
      .bind(uid(), dreamId, user.uid).run();
    await c.env.DB.prepare('UPDATE dreams SET save_count = save_count + 1 WHERE id = ?').bind(dreamId).run();
    return c.json({ saved: true });
  } catch {
    return c.json({ error: 'Already saved' }, 409);
  }
});

saves.delete('/dreams/:id', async (c) => {
  const user = c.get('user');
  await c.env.DB.prepare('DELETE FROM dream_saves WHERE dream_id = ? AND user_uid = ?')
    .bind(c.req.param('id'), user.uid).run();
  await c.env.DB.prepare('UPDATE dreams SET save_count = MAX(0, save_count - 1) WHERE id = ?')
    .bind(c.req.param('id')).run();
  return c.json({ saved: false });
});

saves.get('/dreams/:id/check', async (c) => {
  const user = c.get('user');
  const row = await c.env.DB.prepare('SELECT id FROM dream_saves WHERE dream_id = ? AND user_uid = ?')
    .bind(c.req.param('id'), user.uid).first();
  return c.json({ saved: !!row });
});

export default saves;
