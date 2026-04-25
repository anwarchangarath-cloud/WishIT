-- ═══════════════════════════════════════════════════════
--  WishIT — Full Premium Schema
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS users (
  uid TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',         -- user | moderator | admin
  mode TEXT NOT NULL DEFAULT 'dreamer',      -- dreamer | fulfiller | both
  trust_score INTEGER DEFAULT 100,
  verified INTEGER DEFAULT 0,
  dream_count INTEGER DEFAULT 0,
  fulfilled_count INTEGER DEFAULT 0,
  bio TEXT,
  fulfiller_bio TEXT,
  skills TEXT DEFAULT '[]',
  interests TEXT DEFAULT '[]',
  causes TEXT DEFAULT '[]',
  location TEXT,
  country TEXT,
  website TEXT,
  avatar_url TEXT,
  impact_score INTEGER DEFAULT 0,
  suspended INTEGER DEFAULT 0,
  suspended_at TEXT,
  suspend_reason TEXT,
  banned INTEGER DEFAULT 0,
  banned_at TEXT,
  ban_reason TEXT,
  notification_prefs TEXT DEFAULT '{"dream_approved":true,"dream_rejected":true,"fulfillment_received":true,"fulfillment_approved":true,"messages":true,"updates":true}',
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
  location TEXT,
  country TEXT,
  tags TEXT DEFAULT '[]',
  urgency TEXT NOT NULL DEFAULT 'normal',    -- normal | urgent | critical
  status TEXT NOT NULL DEFAULT 'pending',    -- pending | published | matched | in_progress | fulfilled | rejected
  badge TEXT DEFAULT 'none',                 -- none | verified | urgent | community_supported | featured | mod_recommended
  featured INTEGER DEFAULT 0,
  dream_team INTEGER DEFAULT 0,              -- 1 = multiple fulfillers allowed
  moderator_notes TEXT,
  moderated_by TEXT,
  moderated_at TEXT,
  fulfiller_uid TEXT,
  fulfilled_at TEXT,
  support_count INTEGER DEFAULT 0,
  save_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  match_score_cache TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_uid) REFERENCES users(uid)
);

CREATE TABLE IF NOT EXISTS fulfillment_requests (
  id TEXT PRIMARY KEY,
  dream_id TEXT NOT NULL,
  fulfiller_uid TEXT NOT NULL,
  message TEXT,
  why_help TEXT,
  how_fulfill TEXT,
  experience TEXT,
  verification_doc_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',    -- pending | approved | rejected | withdrawn
  moderator_notes TEXT,
  moderated_by TEXT,
  moderated_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (dream_id) REFERENCES dreams(id),
  FOREIGN KEY (fulfiller_uid) REFERENCES users(uid),
  UNIQUE(dream_id, fulfiller_uid)
);

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

CREATE TABLE IF NOT EXISTS dream_supports (
  id TEXT PRIMARY KEY,
  dream_id TEXT NOT NULL,
  user_uid TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(dream_id, user_uid)
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
  status TEXT DEFAULT 'active',              -- active | closed | flagged
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
  target_type TEXT NOT NULL,                 -- dream | fulfillment | user | report
  note TEXT NOT NULL,
  note_type TEXT DEFAULT 'general',          -- general | flag | info_request | escalation
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
  priority TEXT DEFAULT 'normal',            -- low | normal | high | critical
  status TEXT DEFAULT 'open',                -- open | in_review | resolved | dismissed
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

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  dream_id TEXT NOT NULL,
  reporter_uid TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',    -- pending | reviewed | dismissed | actioned
  reviewed_by TEXT,
  reviewed_at TEXT,
  action_taken TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (dream_id) REFERENCES dreams(id),
  FOREIGN KEY (reporter_uid) REFERENCES users(uid)
);

CREATE TABLE IF NOT EXISTS success_stories (
  id TEXT PRIMARY KEY,
  dream_id TEXT,
  title TEXT NOT NULL,
  story TEXT NOT NULL,
  outcome TEXT,
  quote TEXT,
  dreamer_alias TEXT,
  fulfiller_alias TEXT,
  category TEXT,
  featured INTEGER DEFAULT 0,
  published INTEGER DEFAULT 1,
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

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_uid TEXT NOT NULL,
  action TEXT NOT NULL,
  target_id TEXT,
  target_type TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ── Indexes ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_dreams_status       ON dreams(status);
CREATE INDEX IF NOT EXISTS idx_dreams_user         ON dreams(user_uid);
CREATE INDEX IF NOT EXISTS idx_dreams_category     ON dreams(category);
CREATE INDEX IF NOT EXISTS idx_dreams_urgency      ON dreams(urgency);
CREATE INDEX IF NOT EXISTS idx_dreams_featured     ON dreams(featured);
CREATE INDEX IF NOT EXISTS idx_fulfillments_dream  ON fulfillment_requests(dream_id);
CREATE INDEX IF NOT EXISTS idx_fulfillments_fulfiller ON fulfillment_requests(fulfiller_uid);
CREATE INDEX IF NOT EXISTS idx_reports_status      ON reports(status);
CREATE INDEX IF NOT EXISTS idx_audit_actor         ON audit_logs(actor_uid);
CREATE INDEX IF NOT EXISTS idx_audit_created       ON audit_logs(created_at);
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
