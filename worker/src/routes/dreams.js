import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { uid, now, audit, paginate, notify, adjustTrustScore } from '../utils/helpers.js';

const dreams = new Hono();

const CATEGORIES = ['Education', 'Health', 'Career', 'Family', 'Community', 'Creative', 'Travel', 'Technology', 'Other'];
const URGENCIES  = ['normal', 'urgent', 'critical'];
const BADGES     = ['none', 'verified', 'urgent', 'community_supported', 'featured', 'mod_recommended'];
const PUBLIC_FIELDS = 'id, title, story, category, urgency, status, badge, featured, dream_team, support_count, save_count, view_count, location, country, tags, created_at';

// Public: list published dreams with smart search
dreams.get('/public', async (c) => {
  const { category, urgency, country, badge, sort = 'recent', search, page, limit, featured } = c.req.query();
  const { limit: l, offset } = paginate(page, limit);

  const conditions = ["d.status = 'published'"];
  const params = [];

  if (category) { conditions.push('d.category = ?'); params.push(category); }
  if (urgency)  { conditions.push('d.urgency = ?');  params.push(urgency); }
  if (country)  { conditions.push('d.country = ?');  params.push(country); }
  if (badge && badge !== 'all') { conditions.push('d.badge = ?'); params.push(badge); }
  if (featured === 'true') { conditions.push('d.featured = 1'); }
  if (search) {
    conditions.push('(d.title LIKE ? OR d.story LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = conditions.join(' AND ');
  const orderMap = {
    recent:    'd.created_at DESC',
    supported: 'd.support_count DESC',
    urgent:    "CASE d.urgency WHEN 'critical' THEN 0 WHEN 'urgent' THEN 1 ELSE 2 END, d.created_at DESC",
    views:     'd.view_count DESC',
  };
  const order = orderMap[sort] || orderMap.recent;

  const query = `SELECT ${PUBLIC_FIELDS} FROM dreams d WHERE ${where} ORDER BY ${order} LIMIT ? OFFSET ?`;
  const { results } = await c.env.DB.prepare(query).bind(...params, l, offset).all();
  const total = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM dreams d WHERE ${where}`)
    .bind(...params).first();

  return c.json({ dreams: results, total: total.count, page: parseInt(page) || 1, limit: l });
});

// Public: single dream
dreams.get('/public/:id', async (c) => {
  const dream = await c.env.DB.prepare(
    `SELECT ${PUBLIC_FIELDS}, timeline FROM dreams WHERE id = ? AND status IN ('published','matched','in_progress','fulfilled')`
  ).bind(c.req.param('id')).first();
  if (!dream) return c.json({ error: 'Not found' }, 404);
  await c.env.DB.prepare('UPDATE dreams SET view_count = view_count + 1 WHERE id = ?').bind(dream.id).run();
  return c.json({ dream });
});

// Authenticated routes
dreams.use('*', authMiddleware());

// My dreams
dreams.get('/my', async (c) => {
  const user = c.get('user');
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM dreams WHERE user_uid = ? ORDER BY created_at DESC'
  ).bind(user.uid).all();
  return c.json({ dreams: results });
});

// Submit dream
dreams.post('/', async (c) => {
  const user = c.get('user');
  if (user.banned) return c.json({ error: 'Your account has been banned' }, 403);
  if (user.suspended) return c.json({ error: 'Your account is suspended' }, 403);

  const { title, story, category, timeline, location, country, urgency = 'normal', tags = [] } = await c.req.json();
  if (!title || !story || !category) return c.json({ error: 'Missing required fields' }, 400);
  if (!CATEGORIES.includes(category)) return c.json({ error: 'Invalid category' }, 400);
  if (!URGENCIES.includes(urgency)) return c.json({ error: 'Invalid urgency' }, 400);

  const id = uid();
  await c.env.DB.prepare(
    `INSERT INTO dreams (id, user_uid, title, story, category, timeline, location, country, urgency, tags, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
  ).bind(id, user.uid, title, story, category, timeline || null, location || null, country || null,
    urgency, JSON.stringify(tags)).run();

  await audit(c.env.DB, user.uid, 'DREAM_SUBMITTED', id, 'dream');
  const dream = await c.env.DB.prepare('SELECT * FROM dreams WHERE id = ?').bind(id).first();
  return c.json({ dream }, 201);
});

// Update dream (owner, only if pending/rejected)
dreams.put('/:id', async (c) => {
  const user = c.get('user');
  const dream = await c.env.DB.prepare('SELECT * FROM dreams WHERE id = ?').bind(c.req.param('id')).first();
  if (!dream) return c.json({ error: 'Not found' }, 404);
  if (dream.user_uid !== user.uid && user.role === 'user') return c.json({ error: 'Forbidden' }, 403);
  if (!['pending', 'rejected'].includes(dream.status)) return c.json({ error: 'Cannot edit in current status' }, 400);

  const { title, story, category, timeline, location, country, urgency, tags } = await c.req.json();
  await c.env.DB.prepare(
    `UPDATE dreams SET title=COALESCE(?,title), story=COALESCE(?,story), category=COALESCE(?,category),
     timeline=COALESCE(?,timeline), location=COALESCE(?,location), country=COALESCE(?,country),
     urgency=COALESCE(?,urgency), tags=COALESCE(?,tags), status='pending', updated_at=? WHERE id=?`
  ).bind(title, story, category, timeline, location, country, urgency,
    tags ? JSON.stringify(tags) : null, now(), dream.id).run();

  const updated = await c.env.DB.prepare('SELECT * FROM dreams WHERE id = ?').bind(dream.id).first();
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
    await c.env.DB.prepare('UPDATE dreams SET support_count = support_count + 1 WHERE id = ?').bind(dreamId).run();
    const count = await c.env.DB.prepare('SELECT support_count FROM dreams WHERE id = ?').bind(dreamId).first();
    if (count?.support_count % 10 === 0) {
      const dream = await c.env.DB.prepare('SELECT user_uid, title FROM dreams WHERE id = ?').bind(dreamId).first();
      await notify(c.env.DB, dream.user_uid, 'support', 'Your dream is gaining support!',
        `"${dream.title}" just reached ${count.support_count} supporters`, `/dreams`);
    }
    return c.json({ supported: true });
  } catch {
    return c.json({ error: 'Already supported' }, 409);
  }
});

// Update dream status (mod/admin)
dreams.put('/:id/status', async (c) => {
  const user = c.get('user');
  if (!['moderator', 'admin'].includes(user.role)) return c.json({ error: 'Forbidden' }, 403);
  const { status } = await c.req.json();
  const valid = ['pending', 'published', 'matched', 'in_progress', 'fulfilled', 'rejected'];
  if (!valid.includes(status)) return c.json({ error: 'Invalid status' }, 400);
  await c.env.DB.prepare('UPDATE dreams SET status = ?, updated_at = ? WHERE id = ?')
    .bind(status, now(), c.req.param('id')).run();
  await audit(c.env.DB, user.uid, `DREAM_STATUS_${status.toUpperCase()}`, c.req.param('id'), 'dream');
  return c.json({ success: true });
});

// Set dream badge (mod/admin)
dreams.put('/:id/badge', async (c) => {
  const user = c.get('user');
  if (!['moderator', 'admin'].includes(user.role)) return c.json({ error: 'Forbidden' }, 403);
  const { badge } = await c.req.json();
  if (!BADGES.includes(badge)) return c.json({ error: 'Invalid badge' }, 400);
  await c.env.DB.prepare('UPDATE dreams SET badge = ?, updated_at = ? WHERE id = ?')
    .bind(badge, now(), c.req.param('id')).run();
  await audit(c.env.DB, user.uid, 'DREAM_BADGE_SET', c.req.param('id'), 'dream', { badge });
  return c.json({ success: true });
});

// Feature/unfeature dream (admin)
dreams.put('/:id/feature', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ error: 'Forbidden' }, 403);
  const { featured } = await c.req.json();
  await c.env.DB.prepare('UPDATE dreams SET featured = ?, updated_at = ? WHERE id = ?')
    .bind(featured ? 1 : 0, now(), c.req.param('id')).run();
  return c.json({ success: true });
});

// Dream team: join/leave
dreams.post('/:id/team', async (c) => {
  const user = c.get('user');
  const dream = await c.env.DB.prepare("SELECT * FROM dreams WHERE id = ? AND dream_team = 1 AND status IN ('published','matched')").bind(c.req.param('id')).first();
  if (!dream) return c.json({ error: 'Dream not available for team' }, 404);
  const { role_in_team } = await c.req.json();
  try {
    await c.env.DB.prepare('INSERT INTO dream_team_members (id, dream_id, fulfiller_uid, role_in_team) VALUES (?,?,?,?)')
      .bind(uid(), dream.id, user.uid, role_in_team || null).run();
    return c.json({ joined: true });
  } catch {
    return c.json({ error: 'Already on team' }, 409);
  }
});

dreams.get('/:id/team', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT dtm.*, u.name, u.trust_score, u.verified, u.fulfilled_count
    FROM dream_team_members dtm JOIN users u ON dtm.fulfiller_uid = u.uid
    WHERE dtm.dream_id = ?
  `).bind(c.req.param('id')).all();
  return c.json({ members: results });
});

export default dreams;
