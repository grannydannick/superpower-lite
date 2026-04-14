# Superpower Lite — Frontend Design Sandbox

**Date:** 2026-04-14
**Status:** Approved
**Goal:** Create a standalone, backend-free clone of the Superpower mobile app frontend for rapid UI/UX prototyping.

## Summary

Fork `superpower-app` into an independent repo (`superpower-lite-v2`) that runs the full app with MSW-intercepted mock data. No backend services, no third-party SDKs, no env secrets. Clone, install, run.

```
git clone → bun install → bun dev → full app on localhost:3000
```

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Mock strategy | Expand existing MSW | Already wired in, industry-standard, keeps app code identical to production |
| Data source | Captured from seeded dev environment | Real data shapes, realistic values, no synthetic guesswork |
| Feature scope | Full app, all features | Design sandbox should exercise all UI surface area |
| Upstream sync | None — fully unsynced fork | Freedom to rip out, redesign, or restructure anything without merge constraints |
| Auth | Auto-bypass on startup | No login screen, land directly on dashboard |
| Third-party SDKs | Removed or no-op'd | Sentry, PostHog, New Relic, Stripe JS, Vital, Calendly — none needed in sandbox |
| Setup complexity | Zero-config | Checked-in `.env`, no Doppler, no backend services |

## Architecture

### Repository Setup

- Fork `superpowerdotcom/superpower-app` to `grannydannick/superpower-lite-v2`
- Remove the `upstream` remote — this is its own repo, not a tracking fork
- If an upstream change is ever needed, cherry-pick it manually

### Environment

Checked-in `.env` with sandbox defaults:

```
VITE_APP_ENABLE_API_MOCKING=true
VITE_APP_API_URL=http://localhost:3000
VITE_APP_AUTH_URL=http://localhost:3000
VITE_APP_ENV=sandbox
VITE_APP_STRIPE_PUBLISHABLE_KEY=pk_test_fake
VITE_APP_GOOGLE_API_KEY=fake
VITE_APP_POSTHOG_KEY=
VITE_APP_SENTRY_DSN=
VITE_APP_NEW_RELIC_APP_ID=
```

No real keys. All third-party SDK initializations guarded behind `env !== 'sandbox'` or removed entirely.

### MSW Mock Layer

**Current state:** 12 handler files covering auth, users, biomarkers, services, consults, messages, phlebotomy, tasks, two-factor, appointments, google, klaviyo.

**Target state:** Handlers for all ~120 endpoints across 24 feature modules.

Handler organization (`src/testing/mocks/handlers/`):
- One file per feature module, mirroring `src/features/` structure
- GET endpoints return captured fixture data
- POST/PUT/PATCH/DELETE endpoints update `@mswjs/data` models and persist to localStorage so mutations feel real within a session

New handler files needed:
- `protocol.ts` — reveal phases, protocol CRUD, Shopify integration
- `orders.ts` — order listing, creation, status
- `billing.ts` — invoices, payment methods, subscriptions, HSA/FSA checkout
- `chat.ts` — chat history, messages, wearable summaries, AI responses
- `questionnaires.ts` — Q&A responses, insights, list management
- `files.ts` — presigned URLs, upload, download, ingest
- `redraw.ts` — schedule, cancel, skip operations
- `prescriptions.ts` — subscriptions, tasks, refill dates
- `recommendations.ts` — product recommendations
- `supplements.ts` — catalog, checkout
- `b2b.ts` — benefits, eligibility, claims
- `wearables.ts` — connected devices, data
- `family-risks.ts` — risk plans
- `avatar.ts` — retrieval, upload
- `announcements.ts` — consent management
- `marketplace.ts` — product catalog
- `summary.ts` — user summary
- `credits.ts` — credit balance, upgrade pricing

### Fixture Data (`src/testing/mocks/data/`)

**Source:** Captured from the running dev stack after `make seed/all`.

**Capture process:**
1. Run full dev stack (`make run/core && make seed/all && cd superpower-app && bun dev`)
2. Run a capture script that authenticates as the seeded user and hits every API endpoint
3. Save each response as a typed TypeScript fixture file in `src/testing/mocks/data/`
4. Check fixtures into the repo

**One fixture file per domain:**
- `user.ts` — the seeded user profile, addresses, settings
- `biomarkers.ts` — already exists (63+ markers, 13,888 lines)
- `protocols.ts` — active protocol, plans, supplements
- `orders.ts` — order history with statuses
- `messages.ts` — AI coach conversation history
- `questionnaires.ts` — completed intake responses
- `services.ts` — already exists (16 services)
- `billing.ts` — subscription, invoices, payment methods
- `wearables.ts` — connected devices and recent data
- `files.ts` — uploaded documents metadata
- `redraw.ts` — redraw history
- `prescriptions.ts` — Rx subscriptions
- `recommendations.ts` — product recommendations
- `family-risks.ts` — risk assessment data
- `credits.ts` — credit balance

### `@mswjs/data` Model Expansion

**Current models (5):** user, login, otpCode, consult, message

**Target models (~20):** user, login, otpCode, consult, message, order, protocol, protocolPlan, questionnaire, questionnaireResponse, biomarkerResult, subscription, invoice, address, file, redraw, recommendation, announcement, prescription, credit

Models enable in-session mutations — creating an order, updating a questionnaire response, etc. — that persist to localStorage across page reloads.

### Auth Bypass

- `initializeDb()` seeds the captured user profile with a pre-authenticated session on first load
- `GET /auth/me` always returns the seeded user
- `requireAuth()` always succeeds — no token expiration checks
- `ProtectedRoute` sees a valid session and passes through
- Onboarding, intake, and first-order statuses set to "completed" so the dashboard renders fully populated
- Auth routes (login, register, etc.) still exist and are navigable for prototyping auth UI — they just aren't gatekeepers

### Third-Party SDK Removal

| SDK | Action |
|-----|--------|
| Sentry (`@sentry/react`) | Remove initialization, keep error boundary components |
| PostHog (`posthog-js`) | Remove initialization, no-op the `PHProvider` |
| New Relic | Remove script injection |
| Stripe (`@stripe/stripe-js`, `@stripe/react-stripe-js`) | Remove SDK, mock billing endpoints |
| Vital (`@tryvital/vital-link`) | Remove SDK, mock wearable endpoints |
| Calendly | Remove embed, mock availability data |
| Google Maps (`@vis.gl/react-google-maps`) | Keep if Maps UI is needed for prototyping, otherwise remove |

Guard removals behind `VITE_APP_ENV === 'sandbox'` checks where surgical removal is risky, or remove outright where clean.

## Creation Process

### Step 1 — Fork and strip

1. Fork `superpowerdotcom/superpower-app` → `grannydannick/superpower-lite-v2`
2. Clone locally
3. Remove `upstream` remote
4. Remove/no-op third-party SDKs
5. Check in `.env` with sandbox defaults
6. Verify `bun dev` starts (will have broken pages from missing mock data — that's expected)

### Step 2 — Capture fixtures

1. Run the full dev stack with seeded data: `cd devbox && make run/core && make seed/all`
2. Start the real app: `cd superpower-app && bun dev`
3. Write and run a capture script (`scripts/capture-fixtures.ts`) that:
   - Authenticates as the seeded user
   - Hits every GET endpoint
   - Saves responses as TypeScript fixture files in `src/testing/mocks/data/`
4. Commit fixtures to the repo

### Step 3 — Expand MSW handlers

1. Write handler files for all ~120 endpoints, organized by feature module
2. Wire GET handlers to return captured fixture data
3. Wire mutation handlers to update `@mswjs/data` models with `persistDb()`
4. Expand `@mswjs/data` models to ~20 entities
5. Update `initializeDb()` to seed full fixture dataset on first load

### Step 4 — Auth bypass

1. Modify `initializeDb()` to create the seeded user with a pre-authenticated session
2. Simplify `requireAuth()` to always return the seeded user
3. Set onboarding/intake/order completion flags so dashboard renders fully

### Step 5 — Verify

1. `bun install && bun dev` from a clean clone
2. Click through every major route — dashboard, protocol, orders, data, messages, settings, etc.
3. Fix any endpoints that 404 (missed handlers)
4. Test a few mutations (start an order, send a message) to confirm in-session persistence
5. Verify no console errors from missing SDKs or env vars

## Success Criteria

- `git clone && bun install && bun dev` produces a fully functional app with no backend
- Every page renders with realistic data from the seeded dev environment
- Mutations (creating orders, sending messages, etc.) work within a session
- No third-party SDK errors or missing key warnings in the console
- A designer or developer can modify any component, feature, or route without constraints
