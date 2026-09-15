# 18SHOTS Events — V1 Product & Design Specification

Date: 2026-09-15
Status: Final design proposal — approved direction, source of truth for implementation

## 1. Product Goal

Launch a premium, mobile-first event booking experience for 18SHOTS Events that feels like a high-end nightlife/editorial brand rather than a generic event-management or SaaS website.

The first event experience is "Villa After Dark". The system must support manual payment verification for V1 while presenting a polished customer journey from discovery to confirmed entry.

Primary goals:
- Convert visitors into pass bookings quickly.
- Preserve a premium, cinematic nightlife aesthetic.
- Make the manual UPI/UTR verification process feel intentional and trustworthy.
- Give admins a clean workflow to approve or reject submitted payments.
- Keep the architecture simple enough to ship this weekend.

Non-goals for V1:
- Full payment-gateway automation.
- Multi-organizer marketplace features.
- Complex CRM automation.
- Real-time collaborative admin workflows.
- Advanced couponing, referral systems, or loyalty programs.

## 2. Brand Direction

Existing brand cue: black/gold 18SHOTS crest and nightlife positioning.

Visual direction:
- Editorial nightlife.
- Dark, cinematic, high-contrast.
- Fashion-magazine composition rather than card-heavy SaaS UI.
- Real event/villa photography and video should carry the page.
- Gold is a restrained accent, not the dominant surface color.

Reference principles:
- UPPERGROUND: music-label attitude and large typography.
- Finely Crafted: black-space composition and cinematic transitions.
- Club Transit: event-information hierarchy.
- SceneAI "Noire" style references: restrained dark luxury.
- Awwwards-style asymmetry, pacing, image crops, and motion — without copying layouts.

Avoid:
- Purple SaaS gradients.
- Excessive glassmorphism.
- Repetitive rounded cards.
- Gold glow everywhere.
- Generic AI-party imagery in production.
- Decorative animation that slows conversion.

## 3. Design System

### Color
- Background: `#050505`
- Elevated surface: `#0D0D0D`
- Primary text: `#F5F1E8`
- Secondary text: `#8B8984`
- Gold accent: `#C89036`
- Gold highlight: `#E2B85C`
- Divider: `rgba(245,241,232,0.14)`

### Typography
- Display: high-contrast serif or condensed editorial face for event titles.
- UI/body: clean grotesk/sans-serif, e.g. Geist Sans.
- Use display typography sparingly and with large scale.

### Radius
- Editorial/content surfaces: 0–12px.
- Inputs: 10px.
- Pills only when semantically useful.

### Motion
- Subtle masked text reveals.
- Slow image scale/parallax.
- Cross-fades and editorial horizontal movement.
- 150–250ms UI microinteractions.
- 600–1000ms cinematic section reveals.
- Respect `prefers-reduced-motion`.

## 4. Public Website Information Architecture

### 4.1 Header
Desktop:
- Small 18SHOTS logo left.
- Text navigation: The Event / Passes / Gallery / FAQ.
- "Get Passes" CTA right.

Mobile:
- Logo left.
- Menu icon right.
- Sticky bottom or floating "Get Passes" CTA after first scroll.

### 4.2 Hero
Purpose: establish event identity immediately.

Content:
- 18SHOTS EVENTS / 001
- VILLA AFTER DARK
- A PRIVATE NIGHTLIFE EXPERIENCE
- Date
- Chennai / Private Villa
- 7:30 PM onwards
- Strictly 21+
- GET PASSES

Visual:
- Fullscreen real villa/event image or short loop video.
- Large asymmetric title.
- Minimal UI chrome.
- Tiny gold accent and rules.

### 4.3 Event Story / Manifesto
Purpose: emotionally sell the experience.

Copy direction:
- "More Than Just A Party."
- Private villa experience built for good music, great people and unforgettable nights.

Treatment:
- Large editorial text.
- One strong portrait/event image.
- Small keywords: MUSIC / PEOPLE / FREEDOM / CONNECTION / MEMORIES.

### 4.4 Experience Strip / Gallery Lead-in
Use real photography for:
- Curated Music
- Selected Crowd
- Private Villa

No generic feature cards. Use image-led editorial blocks with captions.

### 4.5 Event Details
Clear, compact event facts:
- Date
- Time
- Location / area
- 21+ entry rule
- Exact location shared only after confirmation

### 4.6 Passes
Ticket choices:
- Early Bird
- General Pass
- Couple Pass

Visual treatment:
- Editorial ticket rows/blocks, not SaaS pricing cards.
- Large price.
- Thin borders/rules.
- Selected pass gets restrained gold emphasis.
- Each CTA opens the booking sheet with the pass preselected.

### 4.7 Gallery
- Irregular grid.
- Mixed portrait/landscape crops.
- Desktop: editorial stagger and limited parallax.
- Mobile: swipeable/full-width rhythm with intentional cropping.
- No masonry for its own sake; preserve performance.

### 4.8 FAQ
5–6 questions:
- Is the location private?
- Is booking confirmed immediately?
- Refund policy?
- Can I transfer my pass?
- What ID is required?
- How do I receive confirmation?

### 4.9 Final CTA
- "Ready For The Weekend?"
- Limited passes. One night.
- GET YOUR PASS

Footer:
- Instagram
- WhatsApp
- Email
- 21+ notice
- Basic terms/privacy/refund-policy links

## 5. Booking Flow

Booking should be a focused, quiet interface that visually separates itself from the cinematic marketing site.

### Step 1 — Details
Fields:
- Full name
- Mobile number
- Email
- Instagram ID (optional)
- Quantity
- Pass type (preselected from CTA)
- Special request (optional)

Show:
- Selected pass
- Unit price
- Quantity
- Total

Submit creates booking with generated code, e.g. `18SE-1042`.

### Step 2 — Payment
Show:
- Exact amount
- UPI QR
- UPI ID with copy button
- Optional bank-transfer details

After payment:
- UTR / transaction ID required
- Payment screenshot optional but recommended

Status becomes `PAYMENT_SUBMITTED`.

### Step 3 — Pending Verification
Show:
- Booking ID
- Amount
- Progress state
- "Payment under review"
- Confirmation will arrive by WhatsApp/email after verification

### Confirmed Pass
After admin approval:
- Booking ID
- Event name/date
- Pass type and quantity
- Guest name
- Confirmation state
- QR code or secure entry code for check-in

## 6. Admin Experience

### Authentication
- Supabase Auth.
- Admin-only access.

### Dashboard
Metrics:
- Total bookings
- Pending payment review
- Confirmed
- Rejected
- Revenue confirmed
- Pass inventory remaining

### Bookings Table
Columns: Booking ID, Name, Phone, Pass, Qty, Amount, UTR, Status, Created time.
Filters: All, Pending, Confirmed, Rejected, Pass type.

### Booking Detail Drawer
Show:
- Customer details
- Pass and amount
- UTR
- Payment screenshot
- Timeline/status

Actions:
- Confirm payment
- Reject payment
- Add internal note

On confirm:
- Booking status -> CONFIRMED
- Sold count updates
- Confirmed pass becomes active

On reject:
- Booking status -> REJECTED
- Inventory is released if previously reserved

## 7. Data Model

`events`: id, name, slug, event_date, start_time, venue_label, venue_private_details, capacity, status, hero_media_url, created_at

`passes`: id, event_id, name, price, quantity_total, quantity_reserved, quantity_sold, active

`bookings`: id, booking_code, event_id, pass_id, customer_name, phone, email, instagram, quantity, amount, payment_method, utr, payment_proof_url, special_request, status, admin_note, created_at, confirmed_at

`booking_status`: PENDING_PAYMENT, PAYMENT_SUBMITTED, CONFIRMED, REJECTED, CANCELLED, CHECKED_IN

## 8. Technical Stack

Frontend:
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui for functional UI
- Motion for UI transitions
- GSAP/ScrollTrigger only where editorial scroll behavior materially improves the experience
- Lucide icons

Forms:
- React Hook Form
- Zod

Backend:
- Supabase Postgres
- Supabase Auth
- Supabase Storage for payment proofs

Hosting:
- Vercel is the recommended default for speed of deployment.

## 9. Mobile Design Rules

Mobile is not a scaled-down desktop layout.

Hero:
- Full-screen vertical image/video.
- 3-line event title.
- Event metadata condensed into two lines.
- Primary CTA within thumb reach.

Story:
- Single-column.
- Large type alternates with full-width images.

Passes:
- Horizontal swipe or stacked list.
- One pass visually dominant at a time.
- Sticky CTA while a pass is selected.

Booking:
- Full-screen bottom sheet / route-level modal.
- One field group at a time where useful.
- Native-friendly inputs.
- Keyboard-safe layout.

Payment:
- QR remains large enough to scan from a second device.
- UPI ID has one-tap copy.
- Screenshot upload supports camera/photo picker.

Admin mobile:
- Responsive table becomes status cards/list.
- Payment proof opens full-screen.

## 10. Accessibility & Trust

- Meet WCAG AA contrast for functional UI.
- Visible focus states.
- Reduced-motion mode.
- Form error messages tied to fields.
- Explicit 21+ / valid-ID requirement.
- Clear note: booking is not confirmed until payment is verified.
- Display refund/cancellation policy before payment submission.
- Never fake scarcity counts.

## 11. Performance Requirements

- Prioritize LCP under 2.5s on realistic 4G where practical.
- Hero media must be optimized and poster-backed.
- Lazy-load gallery media.
- Avoid heavy WebGL in V1.
- Use GSAP only for a few intentional sequences.
- Ensure mobile does not load unnecessary desktop video variants.

## 12. Build Order

Phase 1 — Foundation: Next.js setup, Tailwind/theme tokens, Supabase project and schema, base layout/navigation.
Phase 2 — Public Experience: hero, event story, gallery/experience, event details, pass selector, FAQ/final CTA.
Phase 3 — Booking: booking sheet, validation, booking record creation, payment step, UTR and screenshot upload, pending screen.
Phase 4 — Admin: admin auth, dashboard, booking table, detail drawer, confirm/reject actions.
Phase 5 — Confirmation: confirmed pass, QR/entry code, inventory reconciliation.
Phase 6 — QA: 1440px desktop, 1280px laptop, 768px tablet, 390px mobile, 360px small mobile, Safari/iOS, Chrome/Android, reduced-motion, form error paths, payment-proof upload, duplicate submit protection.

## 13. Implementation Guardrails for Claude Code

Claude Code must:
- Read this specification before changing code.
- Build one vertical slice at a time.
- Preserve the editorial design direction.
- Avoid introducing new component libraries without a clear need.
- Avoid recreating Aceternity/21st/Magic UI visual effects unless they directly serve the approved design.
- Use shadcn/ui primarily for functional controls, not for the public visual identity.
- Test desktop and mobile after each major section.
- Keep the public website and admin dashboard visually distinct.
- Do not add payment-gateway automation in V1.
- Do not invent final client content, venue, bank details, pricing, policies, or real scarcity numbers.

## 14. Acceptance Criteria

V1 is ready when:
- Visitors can choose a pass and submit their details.
- A unique booking code is created.
- Visitors can see UPI/payment instructions.
- Visitors can submit a UTR and payment proof.
- Admins can review payment evidence.
- Admins can confirm or reject bookings.
- Confirmed bookings receive an active digital pass/QR or entry code.
- Inventory updates correctly.
- The public experience is fully responsive and retains the editorial brand on mobile.
- No customer-facing step looks like an exposed database/admin tool.
