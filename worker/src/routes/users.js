import { Hono } from 'hono';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { now } from '../utils/helpers.js';

const users = new Hono();
users.use('*', authMiddleware());

users.get('/me', (c) => c.json({ user: c.get('user') }));

users.put('/me', async (c) => {
  const user = c.get('user');
  const { name, bio, mode, skills, interests, location } = await c.req.json();

  await c.env.DB.prepare(
    `UPDATE users SET name=COALESCE(?,name), bio=COALESCE(?,bio), mode=COALESCE(?,mode),
     skills=COALESCE(?,skills), interests=COALESCE(?,interests), location=COALESCE(?,location),
     updated_at=? WHERE uid=?`
  ).bind(name, bio, mode, skills ? JSON.stringify(skills) : null,
    interests ? JSON.stringify(interests) : null, location, now(), user.uid).run();

  const updated = await c.env.DB.prepare('SELECT * FROM users WHERE uid=?').bind(user.uid).first();
  return c.json({ user: updated });
});

// Admin: list all users
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
