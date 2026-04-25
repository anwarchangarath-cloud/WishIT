import { Hono } from 'hono';
import { uid, now } from '../utils/helpers.js';

const auth = new Hono();

// Register user in D1 after Firebase signup
auth.post('/register', async (c) => {
  const { uid: userUid, email, name, mode = 'dreamer' } = await c.req.json();

  if (!userUid || !email || !name) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  const existing = await c.env.DB.prepare('SELECT uid FROM users WHERE uid = ?').bind(userUid).first();
  if (existing) return c.json({ error: 'User already exists' }, 409);

  await c.env.DB.prepare(
    `INSERT INTO users (uid, email, name, role, mode, trust_score, verified, dream_count, fulfilled_count)
     VALUES (?, ?, ?, 'user', ?, 100, 0, 0, 0)`
  ).bind(userUid, email, name, mode).run();

  const user = await c.env.DB.prepare('SELECT * FROM users WHERE uid = ?').bind(userUid).first();
  return c.json({ user }, 201);
});

// Get own profile (token verified via header check, no middleware here — public route but needs uid param)
auth.get('/me/:uid', async (c) => {
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE uid = ?').bind(c.req.param('uid')).first();
  if (!user) return c.json({ error: 'Not found' }, 404);
  return c.json({ user });
});

export default auth;
