# WishIT — Where Dreams Meet Their Fulfillers

A premium, moderated dream fulfillment platform. Dreamers share their most meaningful goals anonymously; Fulfillers apply to help make them real. Every connection is reviewed by a trained human moderator before any contact is made.

[![Deploy Status](https://img.shields.io/badge/status-live-brightgreen)](https://wishit.pages.dev)
[![Platform](https://img.shields.io/badge/platform-Cloudflare-orange)](https://cloudflare.com)
[![Frontend](https://img.shields.io/badge/frontend-React%2019%20%2B%20Vite-blue)](https://vitejs.dev)

**Live Demo:** https://wishit.pages.dev  
**API:** https://wishit-worker.wishitworker.workers.dev

---

## What WishIT Is

WishIT is **not** a crowdfunding platform. No donations, no money changes hands on the platform. It is a connection platform: a safe, moderated space where people can share their dreams and be matched with individuals who have the skills, network, or resources to help make those dreams real.

---

## Features

### Core
- **Anonymous Dream Publishing** — Dreamers share their story publicly without revealing their identity
- **Dream Journey Tracker** — 5-stage visual progress: Pending → Published → Matched → In Progress → Fulfilled
- **Fulfiller Application Flow** — 3-step application (why you → your plan → experience) with moderation review
- **Private Moderated Messaging** — Approval-gated messaging, only available after a match is confirmed
- **Dream Verification Badges** — Verified, Urgent, Community Supported, Featured, Mod Recommended
- **Trust Score System** — Event-based trust scoring for all users (0–200 scale)
- **Save/Follow Dreams** — Authenticated users can bookmark dreams
- **Support Dreams** — Show community interest without committing to fulfill
- **Report System** — Report dreams or users for moderation review
- **Notifications Centre** — Real-time notifications for all platform events
- **Success Stories** — Curated public stories of fulfilled dreams
- **Dream Teams** — Multiple fulfillers can collaborate on a single dream
- **AI-Powered Matching** — Rule-based engine scores fulfiller–dream compatibility
- **Smart Search & Filters** — Filter by category, country, urgency, badge, sort order
- **Fulfiller Public Profiles** — Public profiles with fulfilled dream history
- **Community Challenges** — Platform-wide engagement challenges

### Moderation
- **Dream Approval Queue** — All dreams reviewed before publication
- **Fulfillment Request Review** — Every fulfillment application vetted
- **Case Notes** — Private moderator notes on dreams, users, or requests
- **Escalation Workflow** — Moderators escalate to admin; admin resolves
- **Flagged Users** — Trust-score-based flagging for review
- **Report Queue** — Centralised report review with action tracking

### Admin
- **Platform Analytics** — KPIs: users, dreams, fulfilments, conversion rate
- **User Management** — Search, edit, suspend, and ban users
- **Moderator Management** — Promote/remove moderators
- **Audit Logs** — Full action log for admin accountability
- **Success Stories CRUD** — Manage public success stories
- **Platform Settings** — Global configuration store

---

## User Roles

| Role | Access |
|------|--------|
| `user` (dreamer) | Submit dreams, track journey, notifications, messages |
| `user` (fulfiller) | Apply to fulfill, public profile, messages |
| `user` (both) | All of the above |
| `moderator` | Moderator Dashboard + user access |
| `admin` | Admin Dashboard + full platform control |

---

## Routes

### Public
| Route | Page |
|-------|------|
| `/` | Landing page |
| `/dreams` | Dream marketplace |
| `/stories` | Success stories |
| `/fulfiller/:uid` | Public fulfiller profile |
| `/about`, `/privacy`, `/terms`, `/trust`, `/contact`, `/careers` | Info pages |

### Authenticated
| Route | Page |
|-------|------|
| `/dashboard` | User dashboard |
| `/submit-dream` | Dream submission form |
| `/messages` | Messaging centre |
| `/notifications` | Notifications page |

### Role-Restricted
| Route | Role Required |
|-------|--------------|
| `/moderator` | `moderator` or `admin` |
| `/admin` | `admin` only |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 + Framer Motion |
| Routing | React Router v7 |
| Auth | Firebase Authentication |
| Backend | Cloudflare Workers + Hono |
| Database | Cloudflare D1 (SQLite) |
| Storage | Cloudflare R2 |
| Hosting | Cloudflare Pages + Workers |

---

## Setup

### Prerequisites
- Node.js 18+, npm 9+
- Cloudflare account (Workers, D1, Pages)
- Firebase project (Authentication enabled)

### Install

```bash
git clone https://github.com/anwarchangarath-cloud/WishIT.git
cd wishit && npm install
cd worker && npm install && cd ..
```

### Environment Variables

Create `.env` in project root:

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_WORKER_URL=https://wishit-worker.your-subdomain.workers.dev
```

Update `worker/wrangler.toml`:
```toml
[vars]
FIREBASE_PROJECT_ID = "your_project_id"
ALLOWED_ORIGIN = "https://your-pages.pages.dev"
```

### Database Setup

```bash
npx wrangler d1 create wishit-db
npx wrangler d1 execute wishit-db --file=worker/schema.sql
npx wrangler d1 execute wishit-db --file=worker/seed.sql  # optional demo data
```

### Run Locally

```bash
# Terminal 1
npm run dev

# Terminal 2
cd worker && npx wrangler dev
```

### Deploy

```bash
npm run build
cd worker && npx wrangler deploy && cd ..
npx wrangler pages deploy dist --project-name wishit
```

---

## Demo Accounts

After running `seed.sql`, create these users in Firebase Authentication:

| Email | Role | Demo Focus |
|-------|------|-----------|
| `admin@wishit.app` | Admin | Full platform access |
| `mod@wishit.app` | Moderator | Approval queues |
| `tech@wishit.app` | Fulfiller | Marcus Williams — tech mentor |
| `doctor@wishit.app` | Fulfiller | Dr. Sofia Andersen — medical |
| `dreamer1@wishit.app` | Dreamer | Ama Asante — active dreams & messages |

**Password for all demo accounts:** `Demo@1234`

---

## Project Structure

```
wishit/
├── src/
│   ├── pages/           # All page components
│   ├── components/
│   │   ├── layout/      # Navbar, Footer
│   │   └── ui/          # Modal, Badge, Button
│   ├── contexts/        # AuthContext
│   ├── services/        # api.js — all Worker calls
│   └── firebase/        # Firebase config
├── worker/
│   ├── src/
│   │   ├── routes/      # All API route handlers
│   │   └── utils/       # helpers.js
│   ├── schema.sql        # D1 schema
│   └── seed.sql          # Demo data
└── README.md
```

---

*Built with care for dreams that deserve to come true.*
