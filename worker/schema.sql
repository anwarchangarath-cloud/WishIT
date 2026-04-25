CREATE TABLE IF NOT EXISTS users (
  uid TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  mode TEXT NOT NULL DEFAULT 'dreamer',
  trust_score INTEGER DEFAULT 100,
  verified INTEGER DEFAULT 0,
  dream_count INTEGER DEFAULT 0,
  fulfilled_count INTEGER DEFAULT 0,
  bio TEXT,
  skills TEXT DEFAULT '[]',
  interests TEXT DEFAULT '[]',
  location TEXT,
  avatar_url TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dreams (
  id TEXT PRIMARY KEY,
  user_uid TEXT NOT NULL,
  title TEXT NOT NULL,
  story TEXT NOT NULL,
  category TEXT NOT NULL,
  timeline TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  moderator_notes TEXT,
  moderated_by TEXT,
  moderated_at TEXT,
  fulfiller_uid TEXT,
  fulfilled_at TEXT,
  support_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_uid) REFERENCES users(uid)
);

CREATE TABLE IF NOT EXISTS fulfillment_requests (
  id TEXT PRIMARY KEY,
  dream_id TEXT NOT NULL,
  fulfiller_uid TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  moderator_notes TEXT,
  moderated_by TEXT,
  moderated_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (dream_id) REFERENCES dreams(id),
  FOREIGN KEY (fulfiller_uid) REFERENCES users(uid),
  UNIQUE(dream_id, fulfiller_uid)
);

CREATE TABLE IF NOT EXISTS dream_supports (
  id TEXT PRIMARY KEY,
  dream_id TEXT NOT NULL,
  user_uid TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(dream_id, user_uid)
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  dream_id TEXT NOT NULL,
  reporter_uid TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by TEXT,
  reviewed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (dream_id) REFERENCES dreams(id),
  FOREIGN KEY (reporter_uid) REFERENCES users(uid)
);

CREATE TABLE IF NOT EXISTS success_stories (
  id TEXT PRIMARY KEY,
  dream_id TEXT NOT NULL,
  title TEXT NOT NULL,
  story TEXT NOT NULL,
  featured INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_uid TEXT NOT NULL,
  action TEXT NOT NULL,
  target_id TEXT,
  target_type TEXT,
  details TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_dreams_status ON dreams(status);
CREATE INDEX IF NOT EXISTS idx_dreams_user ON dreams(user_uid);
CREATE INDEX IF NOT EXISTS idx_fulfillments_dream ON fulfillment_requests(dream_id);
CREATE INDEX IF NOT EXISTS idx_fulfillments_fulfiller ON fulfillment_requests(fulfiller_uid);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_uid);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
