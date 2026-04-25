-- ============================================================
-- WishIT Demo Seed Data
-- Run: npx wrangler d1 execute wishit-db --file=seed.sql
-- ============================================================

-- ── Demo Users ──────────────────────────────────────────────
INSERT OR IGNORE INTO users (uid, email, name, role, mode, trust_score, verified, fulfiller_bio, causes, country, impact_score, created_at) VALUES

-- Master Admin
('demo-admin-001', 'admin@wishit.app', 'Alex Morgan', 'admin', 'both', 200, 1,
 'Platform administrator and co-founder of WishIT.',
 'Education,Health,Community', 'United States', 5000, datetime('now', '-180 days')),

-- Moderator
('demo-mod-001', 'mod@wishit.app', 'Jamie Chen', 'moderator', 'both', 190, 1,
 'Senior community moderator with 5 years in trust & safety.',
 'Health,Family,Community', 'United Kingdom', 3200, datetime('now', '-150 days')),

('demo-mod-002', 'mod2@wishit.app', 'Priya Sharma', 'moderator', 'fulfiller', 185, 1,
 'Volunteer moderator and career counsellor.',
 'Education,Career', 'India', 2100, datetime('now', '-120 days')),

-- Fulfillers
('demo-fulfiller-001', 'tech@wishit.app', 'Marcus Williams', 'user', 'fulfiller', 175, 1,
 'Software engineer and tech mentor. I love helping people break into tech.',
 'Education,Technology,Career', 'United States', 1800, datetime('now', '-90 days')),

('demo-fulfiller-002', 'doctor@wishit.app', 'Dr. Sofia Andersen', 'user', 'fulfiller', 168, 1,
 'Retired GP. I use my network to help people navigate healthcare systems.',
 'Health,Family', 'Germany', 2400, datetime('now', '-110 days')),

('demo-fulfiller-003', 'chef@wishit.app', 'Emmanuel Okafor', 'user', 'fulfiller', 162, 1,
 'Food entrepreneur and culinary mentor. 15 years in the restaurant business.',
 'Career,Creative,Community', 'Nigeria', 1200, datetime('now', '-70 days')),

('demo-fulfiller-004', 'investor@wishit.app', 'Rachel Torres', 'user', 'fulfiller', 179, 1,
 'Angel investor and startup advisor focused on social impact ventures.',
 'Career,Technology,Community', 'Canada', 3100, datetime('now', '-95 days')),

-- Dreamers
('demo-dreamer-001', 'dreamer1@wishit.app', 'Ama Asante', 'user', 'dreamer', 145, 0,
 NULL, 'Education', 'Ghana', 0, datetime('now', '-60 days')),

('demo-dreamer-002', 'dreamer2@wishit.app', 'Carlos Rivera', 'user', 'dreamer', 138, 0,
 NULL, 'Health', 'Brazil', 0, datetime('now', '-55 days')),

('demo-dreamer-003', 'dreamer3@wishit.app', 'Mei Lin', 'user', 'dreamer', 152, 0,
 NULL, 'Career', 'China', 0, datetime('now', '-48 days')),

('demo-dreamer-004', 'dreamer4@wishit.app', 'Hassan Al-Rashid', 'user', 'dreamer', 141, 0,
 NULL, 'Community', 'Jordan', 0, datetime('now', '-42 days')),

('demo-dreamer-005', 'dreamer5@wishit.app', 'Ingrid Larsson', 'user', 'dreamer', 160, 0,
 NULL, 'Creative', 'Sweden', 0, datetime('now', '-35 days')),

('demo-dreamer-006', 'dreamer6@wishit.app', 'Kwame Mensah', 'user', 'both', 155, 0,
 NULL, 'Education,Community', 'Ghana', 0, datetime('now', '-28 days'));


-- ── Demo Dreams ─────────────────────────────────────────────
INSERT OR IGNORE INTO dreams (id, user_uid, title, story, category, status, urgency, badge, featured, support_count, country, timeline, tags, created_at, updated_at) VALUES

-- Published (visible on marketplace)
('dream-001', 'demo-dreamer-001',
 'Complete My Computer Science Degree',
 'Financial hardship forced me to drop out of my CS degree in year two. I had a full scholarship that was cancelled when my father lost his job. I was one year away from graduating. Completing my degree would open doors I thought were permanently closed. I have maintained a 3.8 GPA and know exactly where I want to go — I just need someone to believe in me.',
 'Education', 'published', 'urgent', 'verified', 0, 94,
 'Ghana', '3-6 months', 'scholarship,university,computer-science',
 datetime('now', '-25 days'), datetime('now', '-25 days')),

('dream-002', 'demo-dreamer-002',
 'Get My Daughter Specialised Medical Care',
 'My 8-year-old daughter has been diagnosed with a rare autoimmune condition that requires specialist treatment unavailable in our country. We have exhausted every local option. I am not looking for money — I am looking for someone who has connections, medical knowledge, or experience navigating international healthcare who could help us find the right specialist and understand our options.',
 'Health', 'published', 'critical', 'urgent', 1, 187,
 'Brazil', 'Less than 1 month', 'medical,specialist,autoimmune,child',
 datetime('now', '-18 days'), datetime('now', '-18 days')),

('dream-003', 'demo-dreamer-003',
 'Launch My Own Bakery Inspired by My Grandmother',
 'I have spent 20 years perfecting my grandmother''s recipes. She built a small bakery from nothing in our village and it was the heart of our community. I dream of honouring her legacy by opening a small artisan bakery. I have the recipes, the passion, and I have done the market research. What I need is a mentor who has done this before — someone to guide me through the business side.',
 'Career', 'published', 'normal', 'community_supported', 1, 143,
 'China', '3-6 months', 'bakery,food,entrepreneurship,mentor',
 datetime('now', '-30 days'), datetime('now', '-30 days')),

('dream-004', 'demo-dreamer-004',
 'Build a Free Community Garden for Our Neighbourhood',
 'Our neighbourhood has no green space. Children here have never grown food. An empty lot near our community centre has been unused for 3 years. I dream of transforming it into a shared garden that brings people together, teaches children about nature, and provides fresh produce for families who need it. I need someone with landscaping knowledge and connections to help us get started.',
 'Community', 'published', 'normal', 'featured', 1, 119,
 'Jordan', '6-12 months', 'garden,community,sustainability,children',
 datetime('now', '-22 days'), datetime('now', '-22 days')),

('dream-005', 'demo-dreamer-005',
 'Record My Original Album — Songs That Carried Me Through',
 'I have written 14 songs across the hardest years of my life — through loss, recovery, and rebuilding. I am not looking for fame. I want to record them properly so they can reach someone who needs them. I have basic home recording equipment but I need a producer or sound engineer who can help me turn these demos into something real.',
 'Creative', 'published', 'normal', 'mod_recommended', 0, 76,
 'Sweden', '1-3 months', 'music,recording,album,songwriter',
 datetime('now', '-15 days'), datetime('now', '-15 days')),

('dream-006', 'demo-dreamer-006',
 'Open a Free After-School Tutoring Centre',
 'I am a teacher and I see every day how much children in my community are falling behind — not because they are not capable, but because they do not have support at home. I dream of opening a free after-school tutoring centre. I have a space offered by a local church. I need help with structure, volunteers, and someone who has built something like this before.',
 'Education', 'published', 'urgent', 'verified', 0, 108,
 'Ghana', '1-3 months', 'tutoring,education,children,community-centre',
 datetime('now', '-12 days'), datetime('now', '-12 days')),

-- Matched
('dream-007', 'demo-dreamer-001',
 'Learn to Code and Change Careers',
 'I am 34 and working a job that pays the bills but kills my spirit. I have always wanted to work in tech. I do not need a full bootcamp — I need a mentor who can guide my self-study, review my projects, and help me get my first junior developer role.',
 'Technology', 'matched', 'normal', 'verified', 0, 67,
 'Ghana', '6-12 months', 'coding,career-change,mentorship,web-development',
 datetime('now', '-45 days'), datetime('now', '-10 days')),

-- Fulfilled
('dream-008', 'demo-dreamer-003',
 'Get My Business Plan Reviewed by an Expert',
 'I have a business plan for a sustainable clothing line. I have been working on it for 6 months. I need someone with real business experience to review it honestly and help me understand if it is viable.',
 'Career', 'fulfilled', 'normal', 'verified', 0, 45,
 'China', 'Less than 1 month', 'business-plan,fashion,sustainability',
 datetime('now', '-60 days'), datetime('now', '-5 days')),

-- Pending (in moderation queue)
('dream-009', 'demo-dreamer-005',
 'Find a Mentor in the Music Industry',
 'I have been producing electronic music for 4 years. I feel I am at a plateau and do not know how to reach the next level. I would love to connect with someone who understands the industry and can give me honest, experienced guidance.',
 'Creative', 'pending', 'normal', 'none', 0, 0,
 'Sweden', 'Flexible', 'music,production,EDM,mentorship',
 datetime('now', '-1 days'), datetime('now', '-1 days')),

-- Rejected
('dream-010', 'demo-dreamer-006',
 'Get Help With My Startup Idea',
 'This is my startup idea...', -- short story (will show rejection feedback)
 'Technology', 'rejected', 'normal', 'none', 0, 0,
 'Ghana', 'Flexible', 'startup',
 datetime('now', '-5 days'), datetime('now', '-2 days'));


-- ── Fulfillment Requests ─────────────────────────────────────
INSERT OR IGNORE INTO fulfillment_requests (id, dream_id, fulfiller_uid, why_help, how_fulfill, experience, status, notes, created_at) VALUES

-- dream-007 matched (Marcus helping with coding mentorship)
('fr-001', 'dream-007', 'demo-fulfiller-001',
 'I was in exactly this situation at 32. I retrained myself and made the switch to software engineering. I know exactly how daunting it feels and exactly what works.',
 'I will provide weekly 1-hour video calls, review all code projects, give feedback on the self-study roadmap, and help with job applications and technical interview prep.',
 '8 years as a software engineer at Google and two startups. Self-taught component to my career.',
 'approved', 'Great match — mentor has lived this journey. Approved for connection.',
 datetime('now', '-12 days')),

-- dream-001 pending fulfillment
('fr-002', 'dream-001', 'demo-fulfiller-004',
 'I run a small education fund and have previously sponsored 4 students to complete degrees. This dream resonated immediately — I know what one year from graduation feels like.',
 'I will cover remaining tuition fees through my education fund and provide a small monthly stipend. I will also provide career mentorship post-graduation.',
 'Angel investor, Stanford MBA, Board member of two education charities.',
 'pending', NULL,
 datetime('now', '-3 days')),

-- dream-002 pending fulfillment
('fr-003', 'dream-002', 'demo-fulfiller-002',
 'I spent 30 years as a GP and my specialist network is extensive. Rare autoimmune conditions in children are actually an area I know well from my career.',
 'I will consult my network of specialists across Europe and the US to identify the most appropriate doctors. I will provide a shortlist with contact details and help the family draft their initial consultation request.',
 '30 years as a GP, 12 years with a focus on paediatric autoimmune conditions.',
 'pending', NULL,
 datetime('now', '-5 days')),

-- dream-008 fulfilled
('fr-004', 'dream-008', 'demo-fulfiller-004',
 'I have reviewed hundreds of business plans as an angel investor and I can tell within minutes what is strong and what is not.',
 'I will do a full written review of the business plan including financial projections, market analysis, and competitive positioning. I will also do a 90-minute video call to go through my feedback.',
 '15 years as an angel investor, 40+ investments, 6 exits.',
 'approved', 'Strong applicant with directly relevant experience.',
 datetime('now', '-55 days'));


-- ── Messages ─────────────────────────────────────────────────
INSERT OR IGNORE INTO message_threads (id, dream_id, dreamer_uid, fulfiller_uid, status, created_at, updated_at) VALUES
('thread-001', 'dream-007', 'demo-dreamer-001', 'demo-fulfiller-001', 'active', datetime('now', '-10 days'), datetime('now', '-2 hours')),
('thread-002', 'dream-008', 'demo-dreamer-003', 'demo-fulfiller-004', 'active', datetime('now', '-50 days'), datetime('now', '-8 days'));

INSERT OR IGNORE INTO messages (id, thread_id, dream_id, sender_uid, content, created_at) VALUES
('msg-001', 'thread-001', 'dream-007', 'demo-fulfiller-001',
 'Hi! Really excited to be your mentor on this journey. I''ve been there myself so I know the doubts you''re feeling are completely normal. Let''s start with a quick video call this week to map out your roadmap. What does your week look like?',
 datetime('now', '-10 days')),
('msg-002', 'thread-001', 'dream-007', 'demo-dreamer-001',
 'Thank you so much — I still can''t believe this is happening. I am free any evening after 7pm GMT. Would Thursday work? I have been working through JavaScript fundamentals and have some questions.',
 datetime('now', '-9 days')),
('msg-003', 'thread-001', 'dream-007', 'demo-fulfiller-001',
 'Thursday 7pm GMT works perfectly. I''ll send a calendar invite. For now, share whatever you''ve been working on — GitHub link or just paste the code — and I''ll take a look before our call.',
 datetime('now', '-9 days')),
('msg-004', 'thread-001', 'dream-007', 'demo-dreamer-001',
 'Here is my first project: a simple to-do app in vanilla JS. I know it is basic but I tried to keep the code clean. github.com/demo/todo-app. Really looking forward to Thursday.',
 datetime('now', '-8 days')),
('msg-005', 'thread-001', 'dream-007', 'demo-fulfiller-001',
 'I looked at your code — this is actually really solid for someone who has been coding for a few weeks. Clean structure, readable variable names. We have a lot to work with here. See you Thursday!',
 datetime('now', '-7 days'));


-- ── Notifications ─────────────────────────────────────────────
INSERT OR IGNORE INTO notifications (id, user_uid, type, title, body, link, read, created_at) VALUES
('notif-001', 'demo-dreamer-001', 'dream_approved', 'Dream Approved!',
 'Your dream "Complete My Computer Science Degree" has been approved and is now live on the platform.',
 '/dashboard', 1, datetime('now', '-25 days')),
('notif-002', 'demo-dreamer-001', 'fulfillment_received', 'Someone wants to fulfill your dream!',
 'A fulfiller has applied to help with "Complete My Computer Science Degree". Our team is reviewing their application.',
 '/dashboard', 1, datetime('now', '-3 days')),
('notif-003', 'demo-dreamer-001', 'fulfillment_approved', 'Connection Approved!',
 'Your fulfillment match for "Learn to Code and Change Careers" has been approved. You can now message each other.',
 '/messages', 0, datetime('now', '-10 days')),
('notif-004', 'demo-dreamer-001', 'message', 'New message from your fulfiller',
 'Marcus Williams sent you a message about your dream.',
 '/messages', 0, datetime('now', '-2 hours')),
('notif-005', 'demo-dreamer-002', 'dream_approved', 'Dream Approved!',
 'Your dream "Get My Daughter Specialised Medical Care" has been approved and is now live.',
 '/dashboard', 1, datetime('now', '-18 days')),
('notif-006', 'demo-dreamer-002', 'fulfillment_received', 'A doctor wants to help!',
 'Dr. Sofia Andersen has applied to help with your daughter''s medical care. Our team is reviewing.',
 '/dashboard', 0, datetime('now', '-5 days')),
('notif-007', 'demo-dreamer-003', 'dream_approved', 'Dream Approved!',
 'Your bakery dream has been approved and is now live on the platform.',
 '/dashboard', 1, datetime('now', '-30 days')),
('notif-008', 'demo-dreamer-003', 'support_milestone', '100+ supporters!',
 'Your dream has reached 100 supporters. The community believes in you!',
 '/dashboard', 0, datetime('now', '-10 days'));


-- ── Success Stories ───────────────────────────────────────────
INSERT OR IGNORE INTO success_stories (id, dream_title, outcome, quote, dreamer_alias, fulfiller_alias, category, published, created_at) VALUES
('story-001', 'Complete My CS Degree',
 'After connecting through WishIT, a tech entrepreneur sponsored the final year of tuition for a computer science student in Ghana. She graduated with honours 8 months later and accepted a software engineering role at a fintech startup.',
 'I had accepted that university was over for me. WishIT gave me back the future I thought I had lost.',
 'A dreamer from Ghana', 'A tech entrepreneur from California',
 'Education', 1, datetime('now', '-30 days')),

('story-002', 'Open a Free Community Kitchen',
 'A retired restaurant owner connected with a community leader through WishIT. Together they set up a weekly free community kitchen that now serves over 120 meals every Saturday in their city.',
 'I had the dream but not the know-how. My fulfiller had the know-how but was looking for a purpose. WishIT brought us together perfectly.',
 'A community organiser from Kenya', 'A retired chef from the UK',
 'Community', 1, datetime('now', '-45 days')),

('story-003', 'Get My Son Into University',
 'A single mother dreamed of finding guidance for her academically gifted son who had no family experience with university applications. A university admissions consultant volunteered their expertise through WishIT, and the son secured a place at a top-10 university.',
 'My son is the first in our family to go to university. I could not have navigated the process without the person WishIT connected us with.',
 'A mother from Nigeria', 'A university admissions consultant from Canada',
 'Education', 1, datetime('now', '-60 days')),

('story-004', 'Record My Songs',
 'An independent music producer donated two days of studio time to help a songwriter record an EP. The EP has been streamed over 400,000 times and is helping fund the dreamer''s continued education.',
 'These songs saved my life when I was writing them. Now they''re saving it again.',
 'A songwriter from Sweden', 'An independent music producer',
 'Creative', 1, datetime('now', '-20 days')),

('story-005', 'Restore the Community Library',
 'A tech company CEO connected with a librarian whose community library was facing closure. After visiting personally, the CEO secured corporate sponsorship to keep it open for 5 years and funded a full digital upgrade.',
 'Books changed my life. This library changed hundreds of lives. I just helped keep the doors open.',
 'A librarian from Pakistan', 'A CEO from Singapore',
 'Community', 1, datetime('now', '-15 days'));


-- ── Moderator Notes (for demo context) ──────────────────────
INSERT OR IGNORE INTO moderator_notes (id, target_id, target_type, moderator_uid, note, note_type, created_at) VALUES
('note-001', 'dream-010', 'dream', 'demo-mod-001',
 'Dream story too short and does not meet minimum quality standards. Requested more detail but no response. Rejected after 48 hour wait period.',
 'rejection_reason', datetime('now', '-2 days')),
('note-002', 'fr-001', 'fulfillment', 'demo-mod-001',
 'Excellent applicant. LinkedIn verified, references checked. Lived experience highly relevant to dream. Approved.',
 'approval_note', datetime('now', '-12 days')),
('note-003', 'dream-007', 'dream', 'demo-mod-002',
 'Well-written dream. Urgent but not critical. Good candidate for tech mentorship matching.',
 'review_note', datetime('now', '-45 days'));


-- ── Platform Settings ────────────────────────────────────────
INSERT OR IGNORE INTO platform_settings (key, value) VALUES
('platform_name', 'WishIT'),
('platform_tagline', 'Where Dreams Meet Their Fulfillers'),
('max_active_dreams', '3'),
('moderation_sla_hours', '48'),
('trust_score_new_user', '100'),
('matching_min_score', '15'),
('featured_dreams_limit', '6'),
('maintenance_mode', 'false');
