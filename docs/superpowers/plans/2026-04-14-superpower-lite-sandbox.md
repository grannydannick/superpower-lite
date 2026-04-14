# Superpower Lite Sandbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a standalone, backend-free fork of superpower-app with expanded MSW mocks, captured fixture data, and zero-config setup.

**Architecture:** Fork superpower-app, strip third-party SDKs, bypass auth to auto-login a seeded user, expand MSW from 12 handler files to full coverage of ~120 endpoints using data captured from the seeded dev environment. Handler helpers keep new handlers concise and DRY.

**Tech Stack:** MSW 2.x, @mswjs/data, openapi-fetch, openapi-react-query, TanStack Query/Router, Vite, Bun

**Spec:** `docs/superpowers/specs/2026-04-14-superpower-lite-sandbox-design.md`

---

## Task 1: Fork and Clone the Repository

**Prerequisites:** GitHub CLI (`gh`) installed, GitHub account `grannydannick`

- [ ] **Step 1: Fork on GitHub**

```bash
gh repo fork superpowerdotcom/superpower-app --clone=false --fork-name superpower-lite-v2
```

- [ ] **Step 2: Clone locally**

```bash
cd /Users/dannygrannick/superpower-dev
git clone https://github.com/grannydannick/superpower-lite-v2.git
cd superpower-lite-v2
```

- [ ] **Step 3: Remove upstream remote**

```bash
git remote remove upstream
git remote -v
```

Expected: only `origin` pointing to `grannydannick/superpower-lite-v2`

- [ ] **Step 4: Install dependencies**

```bash
bun install
```

- [ ] **Step 5: Verify dev server starts**

```bash
bun dev
```

Expected: Vite starts on port 3000. The app will fail to load data (no backend) — that's expected. We just need the build to succeed.

- [ ] **Step 6: Commit baseline**

```bash
git add -A
git commit -m "chore: initial fork from superpower-app"
```

---

## Task 2: Sandbox Environment Config

**Files:**
- Create: `.env`
- Modify: `src/config/env.ts`

- [ ] **Step 1: Create checked-in `.env` with sandbox defaults**

Create `.env` at the repo root:

```env
VITE_APP_API_URL=http://localhost:3000
VITE_APP_AUTH_URL=http://localhost:3000
VITE_APP_SOCIAL_BASE_URL=http://localhost:3000
VITE_APP_WEBSITE_URL=http://localhost:3000
VITE_APP_ENV=sandbox
VITE_APP_ENABLE_API_MOCKING=true
VITE_APP_STRIPE_PUBLISHABLE_KEY=pk_test_sandbox
VITE_APP_VITAL_ENV=sandbox
VITE_APP_GOOGLE_API_KEY=sandbox
VITE_APP_CALENDLY_TOKEN=sandbox
VITE_APP_TYPEFORM_FORM_ID=sandbox
VITE_APP_BRIDGE_ENDPOINT=http://localhost:3000
VITE_APP_BRIDGE_KEY=sandbox
VITE_APP_KLAVIYO_COMPANY_ID=sandbox
VITE_APP_KLAVIYO_LIST_ID=sandbox
VITE_APP_POSTHOG_KEY=
VITE_APP_POSTHOG_HOST=
VITE_APP_SENTRY_DSN=
VITE_APP_NEW_RELIC_APP_ID=
VITE_APP_NEW_RELIC_AGENT_ID=
VITE_APP_NEW_RELIC_ACCOUNT_ID=
VITE_APP_NEW_RELIC_BROWSER_LICENSE_KEY=
```

- [ ] **Step 2: Remove `.env` from `.gitignore`**

In `.gitignore`, remove or comment out the line that ignores `.env`:

```diff
- .env
+ # .env is checked in for sandbox mode
+ .env.local
```

- [ ] **Step 3: Modify `src/config/env.ts` to relax validation in sandbox mode**

Add a sandbox bypass at the top of the validation logic. After the `raw` variable is defined (which reads `import.meta.env`), add:

```typescript
const isSandbox = raw.VITE_APP_ENV === 'sandbox';
```

Then, for each required env var validation, make it optional when `isSandbox` is true. The simplest approach: after the validation block that collects `issues`, wrap the throw in a sandbox check:

```typescript
if (issues.length > 0 && !isSandbox) {
  throw new Error(`Missing or invalid env vars: ${issues.join(', ')}`);
}
```

This lets the app boot with dummy values without crashing.

- [ ] **Step 4: Commit**

```bash
git add .env .gitignore src/config/env.ts
git commit -m "feat: sandbox environment config with checked-in .env"
```

---

## Task 3: Enable MSW in All Build Modes

**Files:**
- Modify: `src/main.tsx`

Currently MSW only loads in DEV mode (`import.meta.env.DEV`). For the sandbox, it should always load.

- [ ] **Step 1: Modify the bootstrap function in `src/main.tsx`**

Replace the DEV-only mocking block:

```typescript
// Before:
if (import.meta.env.DEV) {
  try {
    const [{ scan }, { enableMocking }] = await Promise.all([
      import('react-scan'),
      import('./testing/mocks'),
    ]);

    scan({ enabled: true });
    await enableMocking();
  } catch {
    // ignore – dev tooling is non-critical
  }
}

// After:
try {
  const { enableMocking } = await import('./testing/mocks');
  await enableMocking();
} catch {
  // ignore – mocking is non-critical
}

if (import.meta.env.DEV) {
  try {
    const { scan } = await import('react-scan');
    scan({ enabled: true });
  } catch {
    // ignore – dev tooling is non-critical
  }
}
```

This ensures MSW loads in production builds too (for deploying the sandbox to Vercel etc.), while keeping react-scan as dev-only.

- [ ] **Step 2: Commit**

```bash
git add src/main.tsx
git commit -m "feat: enable MSW in all build modes for sandbox"
```

---

## Task 4: Strip Third-Party SDKs

**Files:**
- Modify: `src/lib/sentry.ts` (or wherever `initSentry` is defined)
- Modify: `src/lib/posthog.tsx` (or wherever `PHProvider` is defined)
- Modify: `src/main.tsx` (New Relic script injection if present)
- Modify: `src/app/provider.tsx`

- [ ] **Step 1: No-op Sentry initialization**

In `src/lib/sentry.ts`, find the `initSentry` function and add a sandbox guard at the top:

```typescript
import { env } from '@/config/env';

export const initSentry = () => {
  if (env.ENV === 'sandbox') return;
  // ... existing Sentry.init() code
};
```

Keep the `Sentry` export (used for error boundaries) but make it a no-op object if needed. The key is that `initSentry()` in main.tsx doesn't crash.

- [ ] **Step 2: No-op PostHog provider**

In the file that defines `PHProvider` (likely `src/lib/posthog.tsx`), add a sandbox bypass:

```typescript
import { env } from '@/config/env';

export const PHProvider = ({ children }: { children: React.ReactNode }) => {
  if (env.ENV === 'sandbox') return <>{children}</>;
  // ... existing PostHog initialization
};
```

- [ ] **Step 3: Guard any remaining third-party initializations**

Search for `Stripe`, `Vital`, `Calendly`, `NewRelic` initializations. For each, add the same pattern:

```typescript
if (env.ENV === 'sandbox') return; // or return a no-op
```

Specific files to check:
- Stripe: Look for `loadStripe()` calls — guard them
- Vital: Look for `VitalLink` or `@tryvital` imports — guard them
- Calendly: Look for Calendly embed — guard it
- New Relic: Check `index.html` or `main.tsx` for script injection — remove or guard

- [ ] **Step 4: Verify the app boots without errors**

```bash
bun dev
```

Open browser console — should see no errors from missing API keys or failed SDK initialization.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: no-op third-party SDKs in sandbox mode"
```

---

## Task 5: Auth Bypass

**Files:**
- Modify: `src/testing/mocks/utils.ts`
- Modify: `src/testing/mocks/db.ts`
- Modify: `src/testing/mocks/handlers/auth.ts`
- Modify: `src/testing/mocks/handlers/tasks.ts`

- [ ] **Step 1: Create a default seeded user constant**

In `src/testing/mocks/data/`, create `default-user.ts`:

```typescript
export const DEFAULT_USER = {
  id: 'sandbox-user-001',
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@superpower.com',
  phone: '+15551234567',
  dateOfBirth: '1990-01-15',
  gender: 'MALE',
  password: 'hashed_sandbox',
  role: ['SUPER_ADMIN', 'MEMBER'],
  subscribed: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  adminActor: null,
};

export const DEFAULT_LOGIN = {
  id: 'sandbox-login-001',
  userId: 'sandbox-user-001',
  revoked: false,
};

export const DEFAULT_ADDRESS = {
  id: 'sandbox-address-001',
  line: ['1600 Amphitheatre Parkway'],
  city: 'Mountain View',
  state: 'CA',
  postalCode: '94043',
  use: 'home',
};
```

- [ ] **Step 2: Modify `initializeDb` to seed the default user on first load**

In `src/testing/mocks/db.ts`, update `initializeDb`:

```typescript
import { DEFAULT_USER, DEFAULT_LOGIN } from './data/default-user';

export const initializeDb = async () => {
  const database = await loadDb();
  Object.entries(db).forEach(([key, model]) => {
    const dataEntres = database[key];
    if (dataEntres) {
      dataEntres?.forEach((entry: Record<string, any>) => {
        model.create(entry);
      });
    }
  });

  // Seed default user if not already present
  const existingUser = db.user.findFirst({
    where: { id: { equals: DEFAULT_USER.id } },
  });
  if (!existingUser) {
    db.user.create(DEFAULT_USER);
    db.login.create(DEFAULT_LOGIN);
    await persistDb('user');
    await persistDb('login');
  }
};
```

- [ ] **Step 3: Simplify `requireAuth` to always return the default user**

In `src/testing/mocks/utils.ts`, replace the `requireAuth` function:

```typescript
import { DEFAULT_USER, DEFAULT_LOGIN } from './data/default-user';

export const requireAuth = async (_token?: string) => {
  // Sandbox mode: always return the default user, skip token validation
  const user = db.user.findFirst({
    where: { id: { equals: DEFAULT_USER.id } },
  }) || DEFAULT_USER;

  const login = db.login.findFirst({
    where: { id: { equals: DEFAULT_LOGIN.id } },
  }) || DEFAULT_LOGIN;

  return { user: sanitizeUser(user), login, error: null };
};
```

- [ ] **Step 4: Update the `GET /auth/me` handler to return the seeded user with full profile**

In `src/testing/mocks/handlers/auth.ts`, update the `/auth/me` handler to always return the default user with subscription info:

```typescript
import { DEFAULT_USER, DEFAULT_ADDRESS } from '../data/default-user';

// In the auth.me handler, replace the response with:
http.get(`${env.API_URL}/auth/me`, async () => {
  await networkDelay();
  return HttpResponse.json({
    ...DEFAULT_USER,
    password: undefined,
    address: [DEFAULT_ADDRESS],
    primaryAddress: DEFAULT_ADDRESS,
    subscribed: true,
  });
}),
```

- [ ] **Step 5: Update the tasks handler so onboarding shows as completed**

In `src/testing/mocks/handlers/tasks.ts`, ensure the onboarding task returns `completed`:

```typescript
http.get(`${env.API_URL}/tasks/:id`, async ({ params }) => {
  await networkDelay();
  const taskName = params.id as string;
  return HttpResponse.json({
    task: {
      id: taskName,
      name: taskName,
      status: 'completed',
      priority: 'asap',
      progress: 100,
    },
  });
}),
```

- [ ] **Step 6: Add a better-auth session endpoint handler**

The `ProtectedRoute` also checks better-auth session. Add a handler for the session endpoint:

```typescript
// In auth.ts handlers array, add:
http.get(`${env.AUTH_URL}/api/auth/get-session`, async () => {
  await networkDelay();
  return HttpResponse.json({
    session: {
      id: 'sandbox-session-001',
      userId: DEFAULT_USER.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    user: {
      id: DEFAULT_USER.id,
      email: DEFAULT_USER.email,
      name: `${DEFAULT_USER.firstName} ${DEFAULT_USER.lastName}`,
      emailVerified: true,
      createdAt: DEFAULT_USER.createdAt,
      updatedAt: DEFAULT_USER.createdAt,
    },
  });
}),
```

- [ ] **Step 7: Verify auth bypass**

```bash
bun dev
```

Open http://localhost:3000. Expected: app loads past the login screen and lands on the dashboard (may show empty data — that's fine, we'll add fixtures next).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: auth bypass with auto-seeded sandbox user"
```

---

## Task 6: Write the Fixture Capture Script

**Files:**
- Create: `scripts/capture-fixtures.ts`

This script runs against the live seeded dev stack, authenticates, hits every GET endpoint, and saves responses as TypeScript fixture files.

**Prerequisites:** The full dev stack must be running with seeded data (`cd devbox && make run/core && make seed/all`, then `cd superpower-app && bun dev` pointing at the real backend).

- [ ] **Step 1: Create the capture script**

Create `scripts/capture-fixtures.ts`:

```typescript
/**
 * Fixture Capture Script
 *
 * Runs against the live seeded dev stack and captures API responses
 * as TypeScript fixture files for the sandbox MSW handlers.
 *
 * Prerequisites:
 *   - devbox running (make run/core && make seed/all)
 *   - ts-server running on port 3001
 *   - ts-ai-chat running on port 3005
 *
 * Usage: bun run scripts/capture-fixtures.ts
 */

const API_URL = 'http://localhost:3001';
const AUTH_EMAIL = 'admin@superpower.com';
const AUTH_PASSWORD = 'superpower_admin';
const OUTPUT_DIR = 'src/testing/mocks/data/captured';

interface EndpointConfig {
  /** File name for the fixture (without extension) */
  name: string;
  /** API path (relative to API_URL) */
  path: string;
  /** Export variable name in the fixture file */
  exportName: string;
}

const ENDPOINTS: EndpointConfig[] = [
  // Biomarkers & Health Data
  { name: 'biomarkers', path: '/rpc/biomarkers', exportName: 'biomarkersFixture' },
  { name: 'biomarker-categories', path: '/rpc/biomarkers/categories', exportName: 'biomarkerCategoriesFixture' },
  { name: 'bio-age', path: '/rpc/biomarkers/bioage/latest', exportName: 'bioAgeFixture' },
  { name: 'health-score', path: '/rpc/biomarkers/healthscore/latest', exportName: 'healthScoreFixture' },

  // Orders
  { name: 'orders', path: '/rpc/orders', exportName: 'ordersFixture' },
  { name: 'orders-all-platforms', path: '/rpc/orders/all-platforms', exportName: 'ordersAllPlatformsFixture' },

  // Services
  { name: 'services', path: '/rpc/services', exportName: 'servicesFixture' },

  // Billing
  { name: 'billing-subscriptions', path: '/rpc/billing/subscriptions', exportName: 'billingSubscriptionsFixture' },
  { name: 'billing-invoices', path: '/rpc/billing/invoices', exportName: 'billingInvoicesFixture' },
  { name: 'billing-methods', path: '/rpc/billing/methods', exportName: 'billingMethodsFixture' },

  // Credits
  { name: 'credits', path: '/rpc/credits', exportName: 'creditsFixture' },

  // Chat / Messages
  { name: 'chat-history', path: '/chat/history', exportName: 'chatHistoryFixture' },

  // Protocol
  { name: 'protocol-latest', path: '/protocol-v2/latest', exportName: 'protocolLatestFixture' },
  { name: 'protocols', path: '/protocol-v2', exportName: 'protocolsFixture' },
  { name: 'protocol-reveal-latest', path: '/protocol-v2/reveal/latest', exportName: 'protocolRevealLatestFixture' },
  { name: 'legacy-protocols', path: '/rpc/protocol', exportName: 'legacyProtocolsFixture' },

  // Questionnaires
  { name: 'questionnaire-responses', path: '/rpc/questionnaire-responses', exportName: 'questionnaireResponsesFixture' },

  // Redraw
  { name: 'redraws', path: '/rpc/redraw', exportName: 'redrawsFixture' },

  // Recommendations
  { name: 'recommendations', path: '/rpc/recommendations', exportName: 'recommendationsFixture' },

  // Wearables
  { name: 'wearables', path: '/rpc/wearables', exportName: 'wearablesFixture' },
  { name: 'wearables-overview', path: '/chat/wearables/overview', exportName: 'wearablesOverviewFixture' },
  { name: 'wearables-summary', path: '/chat/wearables/summary', exportName: 'wearablesSummaryFixture' },

  // Files
  { name: 'files', path: '/rpc/files', exportName: 'filesFixture' },

  // Rx / Prescriptions
  { name: 'rx-catalogs', path: '/rpc/rx/rx-catalogs', exportName: 'rxCatalogsFixture' },

  // Family Risk
  { name: 'family-risk-plan', path: '/rpc/family-risk/plan', exportName: 'familyRiskPlanFixture' },

  // B2B
  { name: 'benefit-claims', path: '/rpc/b2b/benefit-claims', exportName: 'benefitClaimsFixture' },

  // Consults
  { name: 'consults', path: '/rpc/consults', exportName: 'consultsFixture' },

  // Users
  { name: 'users', path: '/rpc/users', exportName: 'usersFixture' },

  // Supplements
  { name: 'supplement-catalog', path: '/rpc/shop/supplement-catalog', exportName: 'supplementCatalogFixture' },

  // Homepage
  { name: 'homepage-recommendations', path: '/rpc/recommendations', exportName: 'homepageRecommendationsFixture' },
];

async function authenticate(): Promise<string> {
  console.log('Authenticating as', AUTH_EMAIL);

  // Step 1: Login to get code
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: AUTH_EMAIL, password: AUTH_PASSWORD }),
  });

  if (!loginRes.ok) {
    // Try better-auth sign-in
    const signInRes = await fetch(`${API_URL}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: AUTH_EMAIL, password: AUTH_PASSWORD }),
    });

    if (!signInRes.ok) {
      throw new Error(`Auth failed: ${signInRes.status} ${await signInRes.text()}`);
    }

    const session = await signInRes.json();
    return session.token;
  }

  const { code } = await loginRes.json();

  // Step 2: Exchange code for token
  const tokenRes = await fetch(`${API_URL}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: '',
    }),
  });

  if (!tokenRes.ok) {
    throw new Error(`Token exchange failed: ${tokenRes.status}`);
  }

  const { access_token } = await tokenRes.json();
  console.log('Authenticated successfully');
  return access_token;
}

async function captureEndpoint(
  token: string,
  endpoint: EndpointConfig,
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const url = `${API_URL}${endpoint.path}`;
  console.log(`  GET ${endpoint.path}`);

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `${res.status}: ${text.slice(0, 200)}` };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

function generateFixtureFile(exportName: string, data: unknown): string {
  const json = JSON.stringify(data, null, 2);
  return `// Auto-generated by scripts/capture-fixtures.ts — do not edit manually
// Captured from seeded dev environment

export const ${exportName} = ${json} as const;
`;
}

async function main() {
  const fs = await import('fs');
  const path = await import('path');

  // Create output directory
  const outDir = path.resolve(OUTPUT_DIR);
  fs.mkdirSync(outDir, { recursive: true });

  // Authenticate
  const token = await authenticate();

  // Capture all endpoints
  console.log(`\nCapturing ${ENDPOINTS.length} endpoints...`);
  const results: { name: string; success: boolean; error?: string }[] = [];

  for (const endpoint of ENDPOINTS) {
    const result = await captureEndpoint(token, endpoint);

    if (result.success) {
      const content = generateFixtureFile(endpoint.exportName, result.data);
      const filePath = path.join(outDir, `${endpoint.name}.ts`);
      fs.writeFileSync(filePath, content, 'utf-8');
      results.push({ name: endpoint.name, success: true });
    } else {
      results.push({ name: endpoint.name, success: false, error: result.error });
    }
  }

  // Generate barrel export
  const indexLines: string[] = [
    '// Auto-generated barrel export for captured fixtures',
    '',
  ];
  for (const endpoint of ENDPOINTS) {
    const result = results.find((r) => r.name === endpoint.name);
    if (result?.success) {
      indexLines.push(
        `export { ${endpoint.exportName} } from './${endpoint.name}';`,
      );
    }
  }
  fs.writeFileSync(path.join(outDir, 'index.ts'), indexLines.join('\n') + '\n');

  // Print summary
  console.log('\n--- Capture Summary ---');
  const succeeded = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);
  console.log(`Captured: ${succeeded.length}/${results.length}`);

  if (failed.length > 0) {
    console.log('\nFailed endpoints:');
    for (const f of failed) {
      console.log(`  ${f.name}: ${f.error}`);
    }
  }

  console.log(`\nFixtures written to ${outDir}/`);
}

main().catch(console.error);
```

- [ ] **Step 2: Commit the script**

```bash
git add scripts/capture-fixtures.ts
git commit -m "feat: add fixture capture script for sandbox data"
```

---

## Task 7: Run the Fixture Capture

**Prerequisites:** Full dev stack running with seeded data.

- [ ] **Step 1: Start the dev stack**

In a separate terminal:

```bash
cd /Users/dannygrannick/superpower-dev/devbox
make run/core
make seed/all
```

Then start the backend:

```bash
cd /Users/dannygrannick/superpower-dev/ts-server
npm run dev
```

And the AI chat service (if protocol endpoints are needed):

```bash
cd /Users/dannygrannick/superpower-dev/ts-ai-chat
bun run dev
```

- [ ] **Step 2: Run the capture script**

```bash
cd /Users/dannygrannick/superpower-dev/superpower-lite-v2
bun run scripts/capture-fixtures.ts
```

Expected: a summary showing how many endpoints were captured. Some may fail (404) if the seeded data doesn't include that entity — that's OK.

- [ ] **Step 3: Review captured fixtures**

```bash
ls src/testing/mocks/data/captured/
```

Open a few files to verify the data looks realistic.

- [ ] **Step 4: For any failed endpoints, create minimal placeholder fixtures**

For endpoints that returned 404/empty, create minimal fixtures that let the page render. Example for an empty orders response:

```typescript
// src/testing/mocks/data/captured/orders.ts
export const ordersFixture = { orders: [] } as const;
```

- [ ] **Step 5: Commit fixtures**

```bash
git add src/testing/mocks/data/captured/
git commit -m "feat: add captured fixture data from seeded dev environment"
```

---

## Task 8: Create Handler Helper Utilities

**Files:**
- Create: `src/testing/mocks/handler-helpers.ts`

All new handlers follow the same pattern. Create helpers to avoid repeating boilerplate.

- [ ] **Step 1: Create handler-helpers.ts**

```typescript
import { HttpResponse, http, type HttpHandler } from 'msw';

import { env } from '@/config/env';

import { networkDelay } from './utils';

/**
 * Create a GET handler that returns static fixture data.
 * Auth is bypassed in sandbox mode, so no token check needed.
 */
export function mockGet(path: string, data: unknown): HttpHandler {
  const url = path.startsWith('http') ? path : `${env.API_URL}${path}`;
  return http.get(url, async () => {
    await networkDelay();
    return HttpResponse.json(data);
  });
}

/**
 * Create a GET handler with dynamic path params.
 * The resolver function receives params and returns the response data.
 */
export function mockGetDynamic(
  path: string,
  resolver: (params: Record<string, string | readonly string[]>) => unknown,
): HttpHandler {
  const url = path.startsWith('http') ? path : `${env.API_URL}${path}`;
  return http.get(url, async ({ params }) => {
    await networkDelay();
    const data = resolver(params);
    if (data == null) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    return HttpResponse.json(data);
  });
}

/**
 * Create a POST handler that returns a success response.
 * For mutations, returns the request body merged with an auto-generated id.
 */
export function mockPost(
  path: string,
  response?: unknown,
): HttpHandler {
  const url = path.startsWith('http') ? path : `${env.API_URL}${path}`;
  return http.post(url, async ({ request }) => {
    await networkDelay();
    if (response !== undefined) {
      return HttpResponse.json(response);
    }
    // Default: echo back the request body with an id
    const body = await request.json().catch(() => ({}));
    return HttpResponse.json({ id: crypto.randomUUID(), ...body });
  });
}

/**
 * Create a PUT handler that returns a success response.
 */
export function mockPut(path: string, response?: unknown): HttpHandler {
  const url = path.startsWith('http') ? path : `${env.API_URL}${path}`;
  return http.put(url, async ({ request }) => {
    await networkDelay();
    if (response !== undefined) {
      return HttpResponse.json(response);
    }
    const body = await request.json().catch(() => ({}));
    return HttpResponse.json(body);
  });
}

/**
 * Create a PATCH handler that returns a success response.
 */
export function mockPatch(path: string, response?: unknown): HttpHandler {
  const url = path.startsWith('http') ? path : `${env.API_URL}${path}`;
  return http.patch(url, async ({ request }) => {
    await networkDelay();
    if (response !== undefined) {
      return HttpResponse.json(response);
    }
    const body = await request.json().catch(() => ({}));
    return HttpResponse.json(body);
  });
}

/**
 * Create a DELETE handler that returns a 204 or success response.
 */
export function mockDelete(path: string, response?: unknown): HttpHandler {
  const url = path.startsWith('http') ? path : `${env.API_URL}${path}`;
  return http.delete(url, async () => {
    await networkDelay();
    if (response !== undefined) {
      return HttpResponse.json(response);
    }
    return new HttpResponse(null, { status: 204 });
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/testing/mocks/handler-helpers.ts
git commit -m "feat: add MSW handler helper utilities"
```

---

## Task 9: Data & Health Handlers

**Files:**
- Create: `src/testing/mocks/handlers/data.ts`
- Create: `src/testing/mocks/handlers/protocol.ts`

- [ ] **Step 1: Create data handlers**

Create `src/testing/mocks/handlers/data.ts`:

```typescript
import {
  biomarkersFixture,
  biomarkerCategoriesFixture,
  bioAgeFixture,
  healthScoreFixture,
} from '../data/captured';
import { mockGet } from '../handler-helpers';

export const dataHandlers = [
  // Biomarkers (replaces existing biomarkers handler with captured data)
  mockGet('/rpc/biomarkers', biomarkersFixture),
  mockGet('/rpc/biomarkers/categories', biomarkerCategoriesFixture),
  mockGet('/rpc/biomarkers/bioage/latest', bioAgeFixture),
  mockGet('/rpc/biomarkers/healthscore/latest', healthScoreFixture),
];
```

Note: If any fixture import fails because that endpoint wasn't captured, replace with a sensible empty default: `mockGet('/rpc/biomarkers/bioage/latest', null)`.

- [ ] **Step 2: Create protocol handlers**

Create `src/testing/mocks/handlers/protocol.ts`:

```typescript
import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import {
  protocolLatestFixture,
  protocolsFixture,
  protocolRevealLatestFixture,
  legacyProtocolsFixture,
  supplementCatalogFixture,
} from '../data/captured';
import { mockGet, mockPost, mockPatch, mockDelete } from '../handler-helpers';
import { networkDelay } from '../utils';

export const protocolHandlers = [
  // Protocol v2 (ai-chat API, proxied through ts-server)
  mockGet('/protocol-v2/latest', protocolLatestFixture),
  mockGet('/protocol-v2', protocolsFixture),
  mockGet('/protocol-v2/reveal/latest', protocolRevealLatestFixture),

  // Protocol v2 with path params
  http.get(`${env.API_URL}/protocol-v2/:protocolId`, async ({ params }) => {
    await networkDelay();
    // Return the latest fixture for any specific protocol lookup
    return HttpResponse.json(protocolLatestFixture);
  }),

  // Mutations
  mockPost('/protocol-v2/reveal/:protocolId/phase/:phase', { success: true }),
  mockPost('/protocol-v2/reveal/:protocolId/shopify', { success: true }),
  mockDelete('/protocol-v2/reveal/:protocolId', { success: true }),
  mockPatch('/protocol-v2/:protocolId/actions/:actionId', { success: true }),

  // Legacy protocol (ts-server)
  mockGet('/rpc/protocol', legacyProtocolsFixture),
  http.get(`${env.API_URL}/rpc/protocol/:id`, async () => {
    await networkDelay();
    const protocols = legacyProtocolsFixture as any;
    const first = Array.isArray(protocols) ? protocols[0] : protocols;
    return HttpResponse.json(first ?? null);
  }),

  // Supplements
  mockGet('/rpc/shop/supplement-catalog', supplementCatalogFixture),
];
```

- [ ] **Step 3: Commit**

```bash
git add src/testing/mocks/handlers/data.ts src/testing/mocks/handlers/protocol.ts
git commit -m "feat: add data and protocol MSW handlers"
```

---

## Task 10: Orders, Billing & Credits Handlers

**Files:**
- Create: `src/testing/mocks/handlers/orders.ts`
- Create: `src/testing/mocks/handlers/billing.ts`
- Create: `src/testing/mocks/handlers/credits.ts`

- [ ] **Step 1: Create orders handlers**

Create `src/testing/mocks/handlers/orders.ts`:

```typescript
import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import {
  ordersFixture,
  ordersAllPlatformsFixture,
} from '../data/captured';
import { mockGet, mockPost, mockPut } from '../handler-helpers';
import { networkDelay } from '../utils';

export const ordersHandlers = [
  mockGet('/rpc/orders', ordersFixture),
  mockGet('/rpc/orders/all-platforms', ordersAllPlatformsFixture),
  mockPost('/rpc/orders', { id: 'new-order-001', status: 'pending' }),
  mockPut('/rpc/orders/:orderId', { success: true }),

  // Phlebotomy locations
  http.get(`${env.API_URL}/rpc/phlebotomy/locations`, async ({ request }) => {
    await networkDelay();
    const url = new URL(request.url);
    const postalCode = url.searchParams.get('postalCode');
    return HttpResponse.json({
      locations: [
        {
          id: 'loc-001',
          name: 'Quest Diagnostics',
          address: `123 Main St, ${postalCode ?? '94043'}`,
          distance: 1.2,
          phone: '555-0100',
        },
        {
          id: 'loc-002',
          name: 'Labcorp',
          address: `456 Oak Ave, ${postalCode ?? '94043'}`,
          distance: 2.5,
          phone: '555-0200',
        },
      ],
    });
  }),
];
```

- [ ] **Step 2: Create billing handlers**

Create `src/testing/mocks/handlers/billing.ts`:

```typescript
import {
  billingSubscriptionsFixture,
  billingInvoicesFixture,
  billingMethodsFixture,
} from '../data/captured';
import { mockGet, mockPost, mockPut, mockDelete } from '../handler-helpers';

export const billingHandlers = [
  mockGet('/rpc/billing/subscriptions', billingSubscriptionsFixture),
  mockGet('/rpc/billing/invoices', billingInvoicesFixture),
  mockGet('/rpc/billing/methods', billingMethodsFixture),

  // Available subscriptions (with optional coupon/state params)
  mockGet('/rpc/billing/subscriptions/available', {
    subscriptions: [
      {
        id: 'plan-annual',
        name: 'Annual Membership',
        price: 499_00,
        interval: 'year',
        description: 'Full access to Superpower platform',
      },
      {
        id: 'plan-monthly',
        name: 'Monthly Membership',
        price: 69_00,
        interval: 'month',
        description: 'Full access to Superpower platform',
      },
    ],
  }),

  // Invoice by ID
  mockGet('/rpc/billing/invoices/:invoiceId', billingInvoicesFixture),

  // Mutations
  mockPost('/rpc/billing/subscriptions', { id: 'sub-001', status: 'active' }),
  mockPost('/rpc/billing/methods/:paymentMethodId', { success: true }),
  mockDelete('/rpc/billing/methods/:paymentMethodId', { success: true }),
  mockPut('/rpc/billing/subscription/cancel', { success: true }),
  mockPost('/rpc/billing/setup-intent', {
    clientSecret: 'seti_sandbox_secret',
  }),
  mockPost('/rpc/billing/hsa-fsa/checkout-session', {
    url: 'https://checkout.stripe.com/sandbox',
  }),
];
```

- [ ] **Step 3: Create credits handlers**

Create `src/testing/mocks/handlers/credits.ts`:

```typescript
import { creditsFixture } from '../data/captured';
import { mockGet, mockPost } from '../handler-helpers';

export const creditsHandlers = [
  mockGet('/rpc/credits', creditsFixture),
  mockPost('/rpc/credits', { id: 'credit-001', type: 'blood_panel' }),
  mockPost('/rpc/credits/upgrade', { success: true }),
  mockGet('/rpc/credits/upgrade/price', {
    price: 149_00,
    currency: 'usd',
  }),
];
```

- [ ] **Step 4: Commit**

```bash
git add src/testing/mocks/handlers/orders.ts src/testing/mocks/handlers/billing.ts src/testing/mocks/handlers/credits.ts
git commit -m "feat: add orders, billing, and credits MSW handlers"
```

---

## Task 11: Communication Handlers (Messages, Chat, Questionnaires)

**Files:**
- Create: `src/testing/mocks/handlers/chat.ts`
- Create: `src/testing/mocks/handlers/questionnaires.ts`

- [ ] **Step 1: Create chat handlers**

The existing `messages.ts` handler covers basic message creation. Create `src/testing/mocks/handlers/chat.ts` for the full chat/messaging API:

```typescript
import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { chatHistoryFixture } from '../data/captured';
import { mockGet, mockPost, mockDelete } from '../handler-helpers';
import { networkDelay } from '../utils';

export const chatHandlers = [
  // Chat history
  mockGet('/chat/history', chatHistoryFixture),

  // Individual chat
  http.get(`${env.API_URL}/chat/:chatId`, async ({ params }) => {
    await networkDelay();
    return HttpResponse.json({
      id: params.chatId,
      title: 'Health Coach Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),

  // Chat messages
  http.get(`${env.API_URL}/chat/:chatId/messages`, async () => {
    await networkDelay();
    return HttpResponse.json({
      messages: [
        {
          id: 'msg-001',
          role: 'assistant',
          content: 'Welcome to Superpower! How can I help you with your health goals today?',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'msg-002',
          role: 'user',
          content: 'Can you explain my latest lab results?',
          createdAt: new Date(Date.now() - 3500000).toISOString(),
        },
        {
          id: 'msg-003',
          role: 'assistant',
          content: 'Of course! Looking at your most recent panel, your key biomarkers are looking great. Your Vitamin D levels have improved significantly since your last test, now in the optimal range at 52 ng/mL. Your lipid panel shows healthy cholesterol ratios, and your inflammatory markers like hs-CRP are well within normal limits.',
          createdAt: new Date(Date.now() - 3400000).toISOString(),
        },
      ],
      nextCursor: null,
    });
  }),

  // Delete chat
  mockDelete('/chat/:chatId', { success: true }),

  // Update chat
  mockPost('/chat/:chatId', { success: true }),

  // Create followups
  mockPost('/chat/followup', {
    followups: [
      'How are you feeling today?',
      'Have you taken your supplements?',
      'Ready to review your latest results?',
    ],
  }),

  // Concierge message
  mockPost('/notifications/concierge', { success: true }),

  // Interaction events
  mockPost('/interaction-event/submit', { success: true }),

  // Wearable chat endpoints
  mockGet('/chat/wearables/overview', { overview: 'Your wearable data shows consistent sleep patterns.' }),
  mockGet('/chat/wearables/summary', { summary: 'Weekly activity summary: 45k steps, 7.2h avg sleep.' }),
  mockGet('/chat/wearables/timeseries', { data: [] }),
  mockGet('/chat/wearables/citation/resolve', { citation: null }),
  mockGet('/chat/wearables/vital/token', { token: 'sandbox-vital-token' }),

  // Biomarker summary (ai-chat)
  http.get(`${env.API_URL}/chat/biomarkers/summary/:category`, async ({ params }) => {
    await networkDelay();
    return HttpResponse.json({
      category: params.category,
      summary: 'Your biomarkers in this category are within optimal ranges. Continue with your current protocol for best results.',
    });
  }),
];
```

- [ ] **Step 2: Create questionnaires handlers**

Create `src/testing/mocks/handlers/questionnaires.ts`:

```typescript
import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { questionnaireResponsesFixture } from '../data/captured';
import { mockGet, mockPost, mockPatch } from '../handler-helpers';
import { networkDelay } from '../utils';

const mockQuestionnaire = (name: string) => ({
  id: `q-${name}`,
  name,
  title: name.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
  description: `Questionnaire: ${name}`,
  questions: [],
  status: 'active',
});

export const questionnairesHandlers = [
  // Questionnaire by ID
  http.get(`${env.API_URL}/rpc/questionnaires/:id`, async ({ params }) => {
    await networkDelay();
    return HttpResponse.json(mockQuestionnaire(params.id as string));
  }),

  // Questionnaires by name (query param)
  http.get(`${env.API_URL}/rpc/questionnaires`, async ({ request }) => {
    await networkDelay();
    const url = new URL(request.url);
    const name = url.searchParams.get('name') ?? 'default';
    return HttpResponse.json(mockQuestionnaire(name));
  }),

  // Questionnaire responses (list)
  mockGet('/rpc/questionnaire-responses', questionnaireResponsesFixture),

  // Questionnaire response by ID
  http.get(`${env.API_URL}/rpc/questionnaire-responses/:id`, async ({ params }) => {
    await networkDelay();
    return HttpResponse.json({
      id: params.id,
      questionnaireName: 'onboarding-primer',
      status: 'completed',
      answers: {},
    });
  }),

  // Create response
  mockPost('/rpc/questionnaire-responses', {
    id: 'qr-new-001',
    status: 'in-progress',
  }),

  // Update response
  mockPatch('/rpc/questionnaire-responses/:id', { success: true }),

  // Insights
  http.get(`${env.API_URL}/rpc/questionnaires/:name/insights`, async ({ params }) => {
    await networkDelay();
    return HttpResponse.json({
      questionnaireName: params.name,
      insights: [],
    });
  }),

  // Rx subscription active check (used by questionnaire feature)
  http.get(`${env.API_URL}/rpc/rx/subscription/:name/active`, async () => {
    await networkDelay();
    return HttpResponse.json({ active: false });
  }),
];
```

- [ ] **Step 3: Commit**

```bash
git add src/testing/mocks/handlers/chat.ts src/testing/mocks/handlers/questionnaires.ts
git commit -m "feat: add chat and questionnaire MSW handlers"
```

---

## Task 12: Service Handlers (Files, Redraw, Rx, Wearables)

**Files:**
- Create: `src/testing/mocks/handlers/files.ts`
- Create: `src/testing/mocks/handlers/redraw-handlers.ts`
- Create: `src/testing/mocks/handlers/rx.ts`
- Create: `src/testing/mocks/handlers/wearables.ts`

- [ ] **Step 1: Create files handlers**

Create `src/testing/mocks/handlers/files.ts`:

```typescript
import { filesFixture } from '../data/captured';
import { mockGet, mockPost, mockDelete } from '../handler-helpers';

export const filesHandlers = [
  mockGet('/rpc/files', filesFixture),
  mockDelete('/rpc/files/:fileId', { success: true }),
  mockGet('/rpc/files/:fileId/presign', {
    url: 'https://sandbox-presigned-url.example.com/file',
  }),
  mockPost('/rpc/files/:fileId/ingest', { success: true }),
];
```

- [ ] **Step 2: Create redraw handlers**

Create `src/testing/mocks/handlers/redraw-handlers.ts`:

```typescript
import { redrawsFixture } from '../data/captured';
import { mockGet, mockPost } from '../handler-helpers';

export const redrawHandlers = [
  mockGet('/rpc/redraw', redrawsFixture),
  mockPost('/rpc/redraw/:serviceRequestId/schedule', { success: true }),
  mockPost('/rpc/redraw/:serviceRequestId/cancel', { success: true }),
  mockPost('/rpc/redraw/:serviceRequestId/skip', { success: true }),
];
```

- [ ] **Step 3: Create rx/prescriptions handlers**

Create `src/testing/mocks/handlers/rx.ts`:

```typescript
import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { rxCatalogsFixture } from '../data/captured';
import { mockGet, mockPost, mockPut } from '../handler-helpers';
import { networkDelay } from '../utils';

export const rxHandlers = [
  mockGet('/rpc/rx/rx-catalogs', rxCatalogsFixture),

  // Patient subscriptions
  http.get(`${env.API_URL}/rpc/rx/patient/:id/subscriptions`, async () => {
    await networkDelay();
    return HttpResponse.json({ subscriptions: [] });
  }),

  // Patient tasks
  http.get(`${env.API_URL}/rpc/rx/patient/:id/tasks`, async () => {
    await networkDelay();
    return HttpResponse.json({ tasks: [] });
  }),

  // Subscription mutations
  mockPost('/rpc/rx/contract/:id/pause', { success: true }),
  mockPost('/rpc/rx/contract/:id/cancel', { success: true }),
  mockPut('/rpc/rx/contract/:id/anchor-date', { success: true }),
];
```

- [ ] **Step 4: Create wearables handlers**

Create `src/testing/mocks/handlers/wearables.ts`:

```typescript
import { wearablesFixture } from '../data/captured';
import { mockGet, mockDelete } from '../handler-helpers';

export const wearablesHandlers = [
  mockGet('/rpc/wearables', wearablesFixture),
  mockDelete('/rpc/wearables/:provider', { success: true }),
];
```

- [ ] **Step 5: Commit**

```bash
git add src/testing/mocks/handlers/files.ts src/testing/mocks/handlers/redraw-handlers.ts src/testing/mocks/handlers/rx.ts src/testing/mocks/handlers/wearables.ts
git commit -m "feat: add files, redraw, rx, and wearables MSW handlers"
```

---

## Task 13: Remaining Handlers (B2B, Family Risk, Avatar, etc.)

**Files:**
- Create: `src/testing/mocks/handlers/b2b.ts`
- Create: `src/testing/mocks/handlers/family-risks.ts`
- Create: `src/testing/mocks/handlers/avatar.ts`
- Create: `src/testing/mocks/handlers/announcements.ts`
- Create: `src/testing/mocks/handlers/recommendations.ts`
- Create: `src/testing/mocks/handlers/supplements.ts`
- Create: `src/testing/mocks/handlers/marketplace.ts`
- Create: `src/testing/mocks/handlers/identity.ts`

- [ ] **Step 1: Create all remaining handler files**

Create `src/testing/mocks/handlers/b2b.ts`:

```typescript
import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { benefitClaimsFixture } from '../data/captured';
import { mockGet, mockPost } from '../handler-helpers';
import { networkDelay } from '../utils';

export const b2bHandlers = [
  mockGet('/rpc/b2b/benefit-claims', benefitClaimsFixture),

  http.get(`${env.API_URL}/rpc/b2b/organizations/:orgId/benefits`, async () => {
    await networkDelay();
    return HttpResponse.json({ benefits: [] });
  }),

  mockPost('/rpc/b2b/organizations/:orgId/benefit-claims/grant', {
    id: 'claim-001',
    status: 'granted',
  }),
  mockPost('/rpc/b2b/send-eligibility-otp', { success: true }),
  mockPost('/rpc/b2b/verify-eligibility-otp', { eligible: true }),
];
```

Create `src/testing/mocks/handlers/family-risks.ts`:

```typescript
import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { familyRiskPlanFixture } from '../data/captured';
import { mockGet } from '../handler-helpers';
import { networkDelay } from '../utils';

export const familyRisksHandlers = [
  mockGet('/rpc/family-risk/plan', familyRiskPlanFixture),

  http.get(`${env.API_URL}/rpc/family-risk/plan/:id`, async () => {
    await networkDelay();
    return HttpResponse.json(familyRiskPlanFixture);
  }),
];
```

Create `src/testing/mocks/handlers/avatar.ts`:

```typescript
import { mockGet, mockPost } from '../handler-helpers';

export const avatarHandlers = [
  // Avatar uses a separate base URL in production, but in sandbox
  // we intercept the same patterns
  mockGet('/ts-user/:username', { avatarUrl: null }),
  mockPost('/avatar', { success: true }),
];
```

Create `src/testing/mocks/handlers/announcements.ts`:

```typescript
import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { mockPost } from '../handler-helpers';
import { networkDelay } from '../utils';

export const announcementsHandlers = [
  // Consent check
  http.get(`${env.API_URL}/rpc/consent`, async ({ request }) => {
    await networkDelay();
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    return HttpResponse.json({
      consented: true,
      type,
    });
  }),

  mockPost('/rpc/consent', { success: true }),
];
```

Create `src/testing/mocks/handlers/recommendations.ts`:

```typescript
import { recommendationsFixture } from '../data/captured';
import { mockGet } from '../handler-helpers';

export const recommendationsHandlers = [
  mockGet('/rpc/recommendations', recommendationsFixture),
];
```

Create `src/testing/mocks/handlers/supplements.ts`:

```typescript
import { mockGet } from '../handler-helpers';

export const supplementsHandlers = [
  mockGet('/rpc/shop/multipass-url', {
    url: 'https://shop.sandbox.superpower.com',
  }),
];
```

Create `src/testing/mocks/handlers/marketplace.ts`:

```typescript
import { mockGet } from '../handler-helpers';

export const marketplaceHandlers = [
  mockGet('/rpc/marketplace/products', { products: [] }),
];
```

Create `src/testing/mocks/handlers/identity.ts`:

```typescript
import { mockPost } from '../handler-helpers';

export const identityHandlers = [
  mockPost('/rpc/identity/create-verification-session', {
    url: 'https://verify.sandbox.example.com',
    sessionId: 'sandbox-session-001',
  }),
];
```

- [ ] **Step 2: Commit**

```bash
git add src/testing/mocks/handlers/b2b.ts src/testing/mocks/handlers/family-risks.ts src/testing/mocks/handlers/avatar.ts src/testing/mocks/handlers/announcements.ts src/testing/mocks/handlers/recommendations.ts src/testing/mocks/handlers/supplements.ts src/testing/mocks/handlers/marketplace.ts src/testing/mocks/handlers/identity.ts
git commit -m "feat: add remaining MSW handlers (b2b, family-risks, avatar, etc.)"
```

---

## Task 14: Wire Up All Handlers

**Files:**
- Modify: `src/testing/mocks/handlers/index.ts`

- [ ] **Step 1: Update the handler index to include all new handlers**

Replace `src/testing/mocks/handlers/index.ts`:

```typescript
import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { networkDelay } from '../utils';

// Existing handlers
import { appointmentsHandlers } from './appointments';
import { authHandlers } from './auth';
import { consultsHandlers } from './consults';
import { googleHandlers } from './google';
import { klaviyoHandlers } from './klaviyo';
import { messagesHandlers } from './messages';
import { phlebotomyHandlers } from './phlebotomy';
import { servicesHandlers } from './services';
import { tasksHandlers } from './tasks';
import { twoFactorHandlers } from './two-factor';
import { usersHandlers } from './users';

// New handlers
import { announcementsHandlers } from './announcements';
import { avatarHandlers } from './avatar';
import { b2bHandlers } from './b2b';
import { billingHandlers } from './billing';
import { chatHandlers } from './chat';
import { creditsHandlers } from './credits';
import { dataHandlers } from './data';
import { familyRisksHandlers } from './family-risks';
import { filesHandlers } from './files';
import { identityHandlers } from './identity';
import { marketplaceHandlers } from './marketplace';
import { ordersHandlers } from './orders';
import { protocolHandlers } from './protocol';
import { questionnairesHandlers } from './questionnaires';
import { recommendationsHandlers } from './recommendations';
import { redrawHandlers } from './redraw-handlers';
import { rxHandlers } from './rx';
import { supplementsHandlers } from './supplements';
import { wearablesHandlers } from './wearables';

export const handlers = [
  // Existing
  ...appointmentsHandlers,
  ...authHandlers,
  ...consultsHandlers,
  ...messagesHandlers,
  ...servicesHandlers,
  ...usersHandlers,
  ...twoFactorHandlers,
  ...phlebotomyHandlers,
  ...googleHandlers,
  ...klaviyoHandlers,
  ...tasksHandlers,

  // New
  ...dataHandlers,
  ...protocolHandlers,
  ...ordersHandlers,
  ...billingHandlers,
  ...creditsHandlers,
  ...chatHandlers,
  ...questionnairesHandlers,
  ...filesHandlers,
  ...redrawHandlers,
  ...rxHandlers,
  ...wearablesHandlers,
  ...b2bHandlers,
  ...familyRisksHandlers,
  ...avatarHandlers,
  ...announcementsHandlers,
  ...recommendationsHandlers,
  ...supplementsHandlers,
  ...marketplaceHandlers,
  ...identityHandlers,

  // Healthcheck
  http.get(`${env.API_URL}/healthcheck`, async () => {
    await networkDelay();
    return HttpResponse.json({ ok: true });
  }),

  // Catch-all for unhandled API requests — log a warning and return 200
  // This prevents the app from crashing on endpoints we missed
  http.all(`${env.API_URL}/*`, async ({ request }) => {
    console.warn(`[MSW] Unhandled ${request.method} ${request.url}`);
    await networkDelay();
    return HttpResponse.json(
      { _sandbox: true, _warning: 'No handler for this endpoint' },
      { status: 200 },
    );
  }),
];
```

Note the catch-all handler at the end — this prevents the app from crashing on any endpoints we missed. It logs a warning to the console so you can identify and add missing handlers.

- [ ] **Step 2: Remove the old biomarkers handler import**

The existing `biomarkersHandlers` in the original handlers/index.ts will conflict with the new `dataHandlers` which covers the same endpoints. Remove the old import:

```diff
- import { biomarkersHandlers } from './biomarkers';
```

And remove `...biomarkersHandlers,` from the handlers array (since `dataHandlers` replaces it with captured data).

- [ ] **Step 3: Commit**

```bash
git add src/testing/mocks/handlers/index.ts
git commit -m "feat: wire up all MSW handlers with catch-all fallback"
```

---

## Task 15: Verification

- [ ] **Step 1: Clean install and start**

```bash
rm -rf node_modules
bun install
bun dev
```

Expected: Vite starts, MSW initializes (you'll see `[MSW] Mocking enabled` in the console).

- [ ] **Step 2: Check the dashboard**

Open http://localhost:3000. Expected:
- No login screen — lands directly on dashboard
- User profile shows the sandbox user
- Dashboard components render (may show empty states for some data)

- [ ] **Step 3: Click through major routes**

Navigate to each section and verify it loads without crashing:
- `/` — Dashboard / Homepage
- `/vault` — Health vault
- `/services` — Services listing
- `/orders` — Order history
- `/data` — Biomarker data
- `/protocol` — Protocol / action plans
- `/concierge` — AI coach chat
- `/settings` — Account settings
- `/marketplace` — Marketplace

- [ ] **Step 4: Check console for unhandled endpoints**

Open browser DevTools console. Look for `[MSW] Unhandled` warnings. For each:
1. Note the method and URL
2. Add a handler in the appropriate handler file
3. Restart and re-check

- [ ] **Step 5: Test a mutation**

Try creating a message in the chat, or any other write operation. Verify:
- The POST succeeds (no error)
- The UI updates optimistically or after refetch

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "fix: address unhandled endpoints found during verification"
```

- [ ] **Step 7: Push to remote**

```bash
git push origin main
```

---

## Endpoint Coverage Summary

| Feature | Handler File | Endpoints | Status |
|---------|-------------|-----------|--------|
| Auth | `auth.ts` (existing + modified) | 7 | Updated |
| Users | `users.ts` (existing) | 3 | Existing |
| Tasks | `tasks.ts` (existing + modified) | 1 | Updated |
| Services | `services.ts` (existing) | 2 | Existing |
| Consults | `consults.ts` (existing) | 2 | Existing |
| Messages | `messages.ts` (existing) | 1 | Existing |
| Phlebotomy | `phlebotomy.ts` (existing) | 2 | Existing |
| Appointments | `appointments.ts` (existing) | 1 | Existing |
| 2FA | `two-factor.ts` (existing) | 2 | Existing |
| Google | `google.ts` (existing) | 1 | Existing |
| Klaviyo | `klaviyo.ts` (existing) | 1 | Existing |
| Data/Biomarkers | `data.ts` (new) | 4 | New |
| Protocol | `protocol.ts` (new) | 11 | New |
| Orders | `orders.ts` (new) | 5 | New |
| Billing | `billing.ts` (new) | 11 | New |
| Credits | `credits.ts` (new) | 4 | New |
| Chat | `chat.ts` (new) | 14 | New |
| Questionnaires | `questionnaires.ts` (new) | 8 | New |
| Files | `files.ts` (new) | 4 | New |
| Redraw | `redraw-handlers.ts` (new) | 4 | New |
| Rx/Prescriptions | `rx.ts` (new) | 6 | New |
| Wearables | `wearables.ts` (new) | 2 | New |
| B2B | `b2b.ts` (new) | 5 | New |
| Family Risks | `family-risks.ts` (new) | 2 | New |
| Avatar | `avatar.ts` (new) | 2 | New |
| Announcements | `announcements.ts` (new) | 2 | New |
| Recommendations | `recommendations.ts` (new) | 1 | New |
| Supplements | `supplements.ts` (new) | 1 | New |
| Marketplace | `marketplace.ts` (new) | 1 | New |
| Identity | `identity.ts` (new) | 1 | New |
| **Catch-all** | `index.ts` | 1 | Safety net |
| **Total** | | **~112** | |
