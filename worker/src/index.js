import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import dreamRoutes from './routes/dreams.js';
import fulfillmentRoutes from './routes/fulfillments.js';
import reportRoutes from './routes/reports.js';
import moderatorRoutes from './routes/moderator.js';
import adminRoutes from './routes/admin.js';

const app = new Hono();

app.use('*', logger());
app.use('*', cors({
  origin: (origin, c) => {
    const allowed = c.env.ALLOWED_ORIGIN?.split(',') || [];
    if (allowed.includes(origin) || origin?.includes('localhost')) return origin;
    return null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

app.get('/', (c) => c.json({ status: 'WishIT API running', version: '1.0.0' }));

app.route('/api/auth', authRoutes);
app.route('/api/users', userRoutes);
app.route('/api/dreams', dreamRoutes);
app.route('/api/fulfillments', fulfillmentRoutes);
app.route('/api/reports', reportRoutes);
app.route('/api/mod', moderatorRoutes);
app.route('/api/admin', adminRoutes);

app.notFound((c) => c.json({ error: 'Not found' }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
