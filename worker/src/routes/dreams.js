import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { uid, now, audit, paginate } from '../utils/helpers.js';

const dreams = new Hono();

const CATEGORIES = ['Education', 'Health', 'Career', 'Family', 'Community', 'Creative', 'Travel', 'Technology', 'Other'];

// Public: list published dreams
dreams.get('/public', async (c) => {
  const { category, page, limit } = c.req.query();
  const { limit: l, offset } = paginate(page, limit);

  let query = `SELECT id, title, story, category, status, support_count, view_count, created_at
               FROM dreams WHERE status='published'`;
  const params = [];
  if (category) { query += ' AND category=?'; params.push(category); }
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(l, offset);

  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  const total = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM dreams WHERE status='published'${category ? ' AND category=?' : ''}`)
    .bind(...(category ? [category] : [])).first();

  return c.json({ dreams: results, total: total.count });
});

// Public: single dream
dreams.get('/public/:id', async (c) => {
  const dream = await c.env.DB.prepare(
    `SELECT id, title, story, category, timeline, status, support_count, view_count, created_at
     FROM dreams WHERE id=? AND status='published'`
  ).bind(c.req.param('id')).first();
  if (!dream) return c.json({ error: 'Not found' }, 404);

  // Increment view count
  await c.env.DB.prepare('UPDATE dreams SET view_count=view_count+1 WHERE id=?').bind(dream.id).run();
  return c.json({ dream });
});

// Authenticated routes
dreams.use('*', authMiddleware());

// My dreams
dreams.get('/my', async (c) => {
  const user = c.get('user');
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM dreams WHERE user_uid=? ORDER BY created_at DESC'
  ).bind(user.uid).all();
  return c.json({ dreams: results });
});

// Submit dream
dreams.post('/', async (c) => {
  const user = c.get('user');
  const { title, story, category, timeline } = await c.req.json();

  if (!title || !story || !category) return c.json({ error: 'Missing required fields' }, 400);
  if (!CATEGORIES.includes(category)) return c.json({ error: 'Invalid category' }, 400);

  const id = uid();
  await c.env.DB.prepare(
    `INSERT INTO dreams (id, user_uid, title, story, category, timeline, status)
     VALUES (?, ?, ?, ?, ?, ?, 'pending')`
  ).bind(id, user.uid, title, story, category, timeline || null).run();

  await audit(c.env.DB, user.uid, 'DREAM_SUBMITTED', id, 'dream');
  const dream = await c.env.DB.prepare('SELECT * FROM dreams WHERE id=?').bind(id).first();
  return c.json({ dream }, 201);
});

// Update dream (owner, only if draft/rejected)
dreams.put('/:id', async (c) => {
  const user = c.get('user');
  const dream = await c.env.DB.prepare('SELECT * FROM dreams WHERE id=?').bind(c.req.param('id')).first();
  if (!dream) return c.json({ error: 'Not found' }, 404);
  if (dream.user_uid !== user.uid && user.role === 'user') return c.json({ error: 'Forbidden' }, 403);
  if (!['draft', 'rejected'].includes(dream.status)) return c.json({ error: 'Cannot edit in current status' }, 400);

  const { title, story, category, timeline } = await c.req.json();
  await c.env.DB.prepare(
    `UPDATE dreams SET title=COALESCE(?,title), story=COALESCE(?,story),
     category=COALESCE(?,category), timeline=COALESCE(?,timeline), status='pending', updated_at=? WHERE id=?`
  ).bind(title, story, category, timeline, now(), dream.id).run();

  const updated = await c.env.DB.prepare('SELECT * FROM dreams WHERE id=?').bind(dream.id).first();
  return c.json({ dream: updated });
});

// Support a dream
dreams.post('/:id/support', async (c) => {
  const user = c.get('user');
  const dreamId = c.req.param('id');

  const supportId = uid();
  try {
    await c.env.DB.prepare('INSERT INTO dream_supports (id, dream_id, user_uid) VALUES (?,?,?)')
      .bind(supportId, dreamId, user.uid).run();
    await c.env.DB.prepare('UPDATE dreams SET support_count=support_count+1 WHERE id=?').bind(dreamId).run();
    return c.json({ supported: true });
  } catch {
    return c.json({ error: 'Already supported' }, 409);
  }
});

export default dreams;
