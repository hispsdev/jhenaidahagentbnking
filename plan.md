# Jhenaidah Pourshova Bank Asia Agent Banking — Plan

## Product scope

Build a public, responsive local microsite for **Jhenaidah Pourshova Bank Asia Agent Bank**. The site must clearly distinguish this outlet from a Bank Asia branch and from the official Bank Asia corporate site. It will explain the outlet’s role in Bank Asia PLC’s agent-banking network, the a2i / Aspire to Innovate partnership, and Digital Centre-based service delivery. It will publish the verified listing details from the supplied Google Maps URL, provide customer query submission, and give authorized staff an admin dashboard to manage submitted queries.

## Implementation approach

- Use the initialized React + Express + tRPC + Drizzle + managed MySQL project.
- Add a `customerQueries` table with contact details, query category, message, consent timestamp, status, notes, and created/updated timestamps. Generate and commit an additive Drizzle migration.
- Expose a public tRPC mutation for validated query submission and admin-only tRPC procedures for listing, updating status/notes, and deleting queries.
- Use the starter Manus OAuth session flow. The dashboard is protected by the existing `adminProcedure`; the owner is automatically marked admin by the starter sync, while other staff can be promoted through the existing application user role if needed.
- Use Wouter for `/` and `/admin`; keep all customer-facing sections on the home route with anchor navigation.
- Keep public site content factual and scoped to agent-banking capabilities; avoid implying full branch services or making unsupported guarantees.
- Add `public/manus-routes.json` for `/` and `/admin`, preserve `/api/health`, and configure the site logo metadata with a durable Bank Asia logo URL.

## Design system

### Considered styles

- **Bank Asia Civic Modern** (0.06): deep blue, cool white, violet accents, and precise service-led layouts.
- **Rural Digital Warmth** (0.04): indigo base with clay and green accents, community photography, and softer cards.
- **Neo-Banking Glass** (0.03): dark navy surfaces, bright cyan gradients, and translucent data panels.

### Chosen direction: Bank Asia Civic Modern

- **Design Movement:** contemporary civic-finance design, blending institutional clarity with the welcoming feel of a trusted local service point.
- **Core Principles:** trustworthy at a glance; locally specific; action-oriented; accessible on low-attention mobile visits.
- **Color Philosophy:** use Bank Asia-inspired royal blue and indigo as the trust foundation, a sharp violet accent for digital-service cues, and warm off-white surfaces so the site feels official without impersonating the main bank website.
- **Layout Paradigm:** a left-anchored editorial flow with a strong hero rail, asymmetric service cards, and a location panel that breaks out of the standard centered grid.
- **Signature Elements:** a diagonal “access ribbon” motif; rounded service tiles with thin blue rules; a compact “verified listing” badge used only near contact information.
- **Interaction Philosophy:** every action should answer a practical question — “What can I do here?”, “Where are you?”, or “How do I ask for help?” Forms use plain language and immediate validation.
- **Animation:** restrained entrance fades and 12–16px upward reveals; button hover shifts are subtle; no looping motion that competes with phone numbers or form fields.
- **Typography System:** `Inter` for interface text and `DM Sans` for display headings, with strong numeric hierarchy and generous line-height for bilingual-name readability.
- **Brand Essence:** “Banking access, closer to home.” Personality: dependable, clear, community-minded.
- **Brand Voice:** direct, warm, and service-led. Example lines: “Your nearby access point for everyday banking support.” / “Tell us what you need and our team will follow up.”
- **Wordmark & Logo:** a custom CSS mark made from a blue rounded square, white access path, and violet dot, paired with the outlet name and a small “Agent Banking” label.
- **Signature Brand Color:** `#143F8C` outlet blue, paired with `#5A39B8` access violet.

## Information architecture

- `/` — landing page with hero, local contact strip, service overview, “how it works” partnership section, Digital Centre feature, query form, and location/contact footer.
- `/admin` — authorized staff dashboard with summary metrics, query table, status filters, details drawer/modal, status and note updates, delete action, and login/unauthorized states.
- `/manus-routes.json` — route manifest for `/` and `/admin`.

## Project structure

- `client/src/pages/Home.tsx` — public landing page and customer query form.
- `client/src/pages/Admin.tsx` — protected dashboard UI and admin actions.
- `client/src/App.tsx` — route registration and providers.
- `client/src/index.css` — global theme, responsive layout, and signature motifs.
- `drizzle/schema.ts` — `customerQueries` table and types.
- `server/db.ts` — customer-query persistence helpers.
- `server/routers.ts` — public submission and admin management procedures.
- `drizzle/0001_customer_queries.sql` — additive schema migration.
- `client/public/manus-routes.json` — route declaration.
- `app.config.ts` — project logo metadata.

## Material constraints

Use verified listing details: **Jhenaidah Pourshova Bank Asia Agent Bank**, Municipality Building, Jhenaidah 7300, Bangladesh; phone **+880 1717-098287**; plus code **G5VF+QQ Jhenaidah, Bangladesh**; listing says it opens at 9:00 AM on Sunday. Link directions to the supplied Google Maps listing. Reference Bank Asia’s official agent-banking page and a2i’s official Digital Centre page in the footer/source note, but do not copy the corporate site wholesale or claim this outlet is a branch.

## Frontend/backend serving

Development uses `pnpm dev` on the initialized port 3000. The Express server exposes `/api/health`, OAuth routes, and tRPC before Vite/static serving. Production uses the existing Dockerfile and `/api/health`; public page content is cache-safe while query APIs remain dynamic.
