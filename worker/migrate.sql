-- ── Migrate dreams table ────────────────────────────────
ALTER TABLE dreams ADD COLUMN location TEXT;
ALTER TABLE dreams ADD COLUMN country TEXT;
ALTER TABLE dreams ADD COLUMN urgency TEXT DEFAULT 'normal';
ALTER TABLE dreams ADD COLUMN tags TEXT DEFAULT '[]';
ALTER TABLE dreams ADD COLUMN badge TEXT DEFAULT 'none';
ALTER TABLE dreams ADD COLUMN featured INTEGER DEFAULT 0;
ALTER TABLE dreams ADD COLUMN dream_team INTEGER DEFAULT 0;
ALTER TABLE dreams ADD COLUMN save_count INTEGER DEFAULT 0;
ALTER TABLE dreams ADD COLUMN match_score_cache TEXT;

-- ── Migrate users table ──────────────────────────────────
ALTER TABLE users ADD COLUMN fulfiller_bio TEXT;
ALTER TABLE users ADD COLUMN causes TEXT DEFAULT '[]';
ALTER TABLE users ADD COLUMN country TEXT;
ALTER TABLE users ADD COLUMN website TEXT;
ALTER TABLE users ADD COLUMN impact_score INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN suspended INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN suspended_at TEXT;
ALTER TABLE users ADD COLUMN suspend_reason TEXT;
ALTER TABLE users ADD COLUMN banned INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN banned_at TEXT;
ALTER TABLE users ADD COLUMN ban_reason TEXT;
ALTER TABLE users ADD COLUMN notification_prefs TEXT DEFAULT '{"dream_approved":true,"dream_rejected":true,"fulfillment_received":true,"fulfillment_approved":true,"messages":true,"updates":true}';

-- ── Migrate fulfillment_requests table ───────────────────
ALTER TABLE fulfillment_requests ADD COLUMN why_help TEXT;
ALTER TABLE fulfillment_requests ADD COLUMN how_fulfill TEXT;
ALTER TABLE fulfillment_requests ADD COLUMN experience TEXT;
ALTER TABLE fulfillment_requests ADD COLUMN verification_doc_url TEXT;

-- ── Create missing tables ────────────────────────────────
CREATE TABLE IF NOT EXISTS dream_team_members (
  id TEXT PRIMARY KEY,
  dream_id TEXT NOT NULL,
  fulfiller_uid TEXT NOT NULL,
  role_in_team TEXT,
  joined_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (dream_id) REFERENCES dreams(id),
  FOREIGN KEY (fulfiller_uid) REFERENCES users(uid),
  UNIQUE(dream_id, fulfiller_uid)
);

CREATE TABLE IF NOT EXISTS dream_saves (
  id TEXT PRIMARY KEY,
  dream_id TEXT NOT NULL,
  user_uid TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(dream_id, user_uid)
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  dream_id TEXT NOT NULL,
  sender_uid TEXT NOT NULL,
  receiver_uid TEXT NOT NULL,
  content TEXT NOT NULL,
  read INTEGER DEFAULT 0,
  flagged INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (sender_uid) REFERENCES users(uid)
);

CREATE TABLE IF NOT EXISTS message_threads (
  id TEXT PRIMARY KEY,
  dream_id TEXT NOT NULL,
  dreamer_uid TEXT NOT NULL,
  fulfiller_uid TEXT NOT NULL,
  last_message TEXT,
  last_message_at TEXT,
  dreamer_unread INTEGER DEFAULT 0,
  fulfiller_unread INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(dream_id, fulfiller_uid)
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_uid TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link TEXT,
  read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_uid) REFERENCES users(uid)
);

CREATE TABLE IF NOT EXISTS moderator_notes (
  id TEXT PRIMARY KEY,
  moderator_uid TEXT NOT NULL,
  target_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  note TEXT NOT NULL,
  note_type TEXT DEFAULT 'general',
  resolved INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS escalations (
  id TEXT PRIMARY KEY,
  escalated_by TEXT NOT NULL,
  target_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'open',
  resolved_by TEXT,
  resolved_at TEXT,
  resolution_notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS trust_score_events (
  id TEXT PRIMARY KEY,
  user_uid TEXT NOT NULL,
  event_type TEXT NOT NULL,
  delta INTEGER NOT NULL,
  reason TEXT,
  reference_id TEXT,
  reference_type TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_by TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS community_challenges (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  goal_count INTEGER DEFAULT 10,
  current_count INTEGER DEFAULT 0,
  category TEXT,
  starts_at TEXT,
  ends_at TEXT,
  active INTEGER DEFAULT 1,
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ── Fulfillment completion workflow ─────────────────────
CREATE TABLE IF NOT EXISTS fulfillment_completions (
  id TEXT PRIMARY KEY,
  dream_id TEXT NOT NULL,
  fulfiller_uid TEXT NOT NULL,
  note TEXT,
  proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  moderator_uid TEXT,
  moderator_reviewed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (dream_id) REFERENCES dreams(id),
  FOREIGN KEY (fulfiller_uid) REFERENCES users(uid)
);

-- ── Create missing indexes ───────────────────────────────
CREATE INDEX IF NOT EXISTS idx_dreams_urgency      ON dreams(urgency);
CREATE INDEX IF NOT EXISTS idx_dreams_featured     ON dreams(featured);
CREATE INDEX IF NOT EXISTS idx_fulfillments_fulfiller ON fulfillment_requests(fulfiller_uid);
CREATE INDEX IF NOT EXISTS idx_notifications_user  ON notifications(user_uid);
CREATE INDEX IF NOT EXISTS idx_notifications_read  ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_messages_thread     ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender     ON messages(sender_uid);
CREATE INDEX IF NOT EXISTS idx_threads_dream       ON message_threads(dream_id);
CREATE INDEX IF NOT EXISTS idx_saves_user          ON dream_saves(user_uid);
CREATE INDEX IF NOT EXISTS idx_saves_dream         ON dream_saves(dream_id);
CREATE INDEX IF NOT EXISTS idx_mod_notes_target    ON moderator_notes(target_id);
CREATE INDEX IF NOT EXISTS idx_trust_events_user   ON trust_score_events(user_uid);
CREATE INDEX IF NOT EXISTS idx_escalations_status  ON escalations(status);
CREATE INDEX IF NOT EXISTS idx_completions_dream   ON fulfillment_completions(dream_id);
CREATE INDEX IF NOT EXISTS idx_completions_status  ON fulfillment_completions(status);
