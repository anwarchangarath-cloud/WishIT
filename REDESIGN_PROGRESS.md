# WishIT Premium Redesign — Progress Tracker

**Target:** Stripe / Linear / Airbnb caliber. Launch-ready for investors, users, App Store.

**Design Direction:**
- Typography: `Instrument Serif` (display) + `Plus Jakarta Sans` (body/UI)
- Color: Navy `#050D1F` / Blue `#2563EB` / White surfaces / `#F4F7FB` background
- Cards: Crisp white, 20–24px radius, 1px `#E4EAF4` borders, premium hover shadows
- Motion: Framer Motion, refined micro-interactions only
- Forms: Wizard-style, one question per step, visual selections, conversational

---

## Checkpoints

### Phase 1 — Design System ✅
- [x] `index.html` — Premium font stack (Instrument Serif + Plus Jakarta Sans)
- [x] `index.css` — Complete design token rebuild

### Phase 2 — Layout Shell ✅
- [x] `Navbar.jsx` — Premium minimal navbar
- [x] `Footer.jsx` — Refined footer

### Phase 3 — Core Pages ✅
- [x] `Landing.jsx` — Full hero + sections rebuild
- [x] `Login.jsx` — Premium split auth
- [x] `Register.jsx` — Premium auth with role selector
- [x] `SubmitDream.jsx` — Conversational wizard (one field per step, visual selectors)

### Phase 4 — App Pages ✅
- [x] `Dreams.jsx` — Premium marketplace
- [x] `Dashboard.jsx` — Premium tabbed dashboard
- [x] `Messages.jsx` — Premium messaging UI
- [x] `Notifications.jsx` — Premium notification center

### Phase 5 — Supporting Pages ✅
- [x] `SuccessStories.jsx` — Premium story gallery
- [x] `NotFound.jsx` — Premium 404
- [x] Mobile bottom navigation component

### Phase 6 — QA & Polish
- [ ] Responsive audit (375 / 430 / 768 / 1024 / 1280 / 1440+)
- [ ] Animation review
- [ ] Empty state audit
- [ ] Loading skeleton review

---

## Design Decisions

1. **Instrument Serif italics** used for emotional display moments (hero headline, dream titles)
2. **Plus Jakarta Sans** for all UI — clean geometric, modern startup feel
3. **Sticky mobile bottom nav** replaces hamburger for app-like experience
4. **SubmitDream wizard** split into 6 micro-steps: Category → Title → Story → Timeline → Location → Review
5. **One field per wizard step** — Typeform-style, full-screen focus
6. **Visual category selector** — icon cards instead of text chips
7. **Register role selector** — large visual cards (Dreamer vs Fulfiller) instead of dropdown
