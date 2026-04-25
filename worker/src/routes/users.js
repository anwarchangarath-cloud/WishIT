import { Hono } from 'hono';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { now } from '../utils/helpers.js';

const users = new Hono();
users.use('*', authMiddleware());

// My full profile
users.get('/me', (c) => c.json({ user: c.get('user') }));

// Update own profile
users.put('/me', async (c) => {
  const user = c.get('user');
  const { name, bio, fulfiller_bio, mode, skills, interests, causes, location, country, website } = await c.req.json();

  await c.env.DB.prepare(
    `UPDATE users SET
     name=COALESCE(?,name), bio=COALESCE(?,bio), fulfiller_bio=COALESCE(?,fulfiller_bio),
     mode=COALESCE(?,mode), skills=COALESCE(?,skills), interests=COALESCE(?,interests),
     causes=COALESCE(?,causes), location=COALESCE(?,location), country=COALESCE(?,country),
     website=COALESCE(?,website), updated_at=? WHERE uid=?`
  ).bind(name, bio, fulfiller_bio, mode,
    skills ? JSON.stringify(skills) : null,
    interests ? JSON.stringify(interests) : null,
    causes ? JSON.stringify(causes) : null,
    location, country, website, now(), user.uid).run();

  const updated = await c.env.DB.prepare('SELECT * FROM users WHERE uid = ?').bind(user.uid).first();
  return c.json({ user: updated });
});

// Public fulfiller profile
users.get('/:uid/public', async (c) => {
  const u = await c.env.DB.prepare(
    `SELECT uid, name, mode, trust_score, verified, fulfilled_count, dream_count,
            bio, fulfiller_bio, skills, interests, causes, location, country,
            website, avatar_url, impact_score, created_at
     FROM users WHERE uid = ? AND banned = 0 AND suspended = 0`
  ).bind(c.req.param('uid')).first();
  if (!u) return c.json({ error: 'Not found' }, 404);

  // Public fulfilled dreams count and recent
  const { results: fulfilledDreams } = await c.env.DB.prepare(`
    SELECT d.id, d.title, d.category, d.fulfilled_at
    FROM dreams d
    JOIN fulfillment_requests fr ON fr.dream_id = d.id AND fr.fulfiller_uid = ? AND fr.status = 'approved'
    WHERE d.status = 'fulfilled'
    ORDER BY d.fulfilled_at DESC LIMIT 5
  `).bind(u.uid).all();

  return c.json({ user: u, fulfilledDreams });
});

// Admin: all users
users.get('/', requireRole('admin'), async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
  return c.json({ users: results });
});

// Admin: update user role
users.put('/:uid/role', requireRole('admin'), async (c) => {
  const { role } = await c.req.json();
  if (!['user', 'moderator', 'admin'].includes(role)) return c.json({ error: 'Invalid role' }, 400);
  await c.env.DB.prepare('UPDATE users SET role=?, updated_at=? WHERE uid=?').bind(role, now(), c.req.param('uid')).run();
  return c.json({ success: true });
});

// Admin: delete user
users.delete('/:uid', requireRole('admin'), async (c) => {
  await c.env.DB.prepare('DELETE FROM users WHERE uid=?').bind(c.req.param('uid')).run();
  return c.json({ success: true });
});

export default users;
