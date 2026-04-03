# Daily Brief Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a daily AI-generated health brief that surfaces on the homepage and in the concierge, adapting content based on the member's journey phase and available data layers.

**Architecture:** New `daily-brief` module in ts-ai-chat assembles available data (biomarkers, protocol, wearables, memory, intake), detects the member's journey phase, and generates a personalized brief via LLM. Frontend adds a homepage teaser card and a concierge briefing view, both powered by a single new API endpoint with same-day caching.

**Tech Stack:** ts-ai-chat (oRPC, Prisma, Vercel AI SDK), react-app (TanStack Query, TanStack Router, Tailwind, Radix)

**Spec:** `docs/superpowers/specs/2026-04-02-daily-brief-design.md`

---

## File Structure

### ts-ai-chat (backend)

| File | Responsibility |
|------|---------------|
| `prisma/schema.prisma` | Add `DailyBrief` model |
| `src/daily-brief/daily-brief-router.ts` | oRPC route for `GET /api/v1/daily-brief` |
| `src/daily-brief/daily-brief-generator.ts` | Orchestrates layer assembly, phase detection, LLM call, caching |
| `src/daily-brief/daily-brief-prompt.ts` | System prompt template with phase-aware instructions |
| `src/http/orpc-router.ts` | Register daily-brief router in v1Routes |

### react-app (frontend)

| File | Responsibility |
|------|---------------|
| `src/features/daily-brief/api/get-daily-brief.ts` | API call + TanStack Query hook |
| `src/features/daily-brief/components/daily-brief-teaser.tsx` | Homepage banner (compact, tappable) |
| `src/features/daily-brief/components/daily-brief-card.tsx` | Concierge full briefing card with pills |
| `src/features/daily-brief/components/daily-brief-pills.tsx` | Data source pill badges |
| `src/features/homepage/cards/config.ts` | Register daily-brief-teaser in card registry |
| `src/features/messages/components/ai/preset-messages.ts` | Add `'daily-brief'` preset |
| `src/features/messages/components/ai/chat.tsx` | Render daily-brief-card in concierge empty state |

---

## Task 1: Prisma Model — DailyBrief

**Files:**
- Modify: `ts-ai-chat/prisma/schema.prisma`

- [ ] **Step 1: Add DailyBrief model to schema**

Add at the end of the schema file, before any closing comments:

```prisma
model DailyBrief {
  id        String   @id @default(cuid())
  userId    String
  date      String
  phase     String
  content   String
  layers    String[]
  actionUrl String?
  createdAt DateTime @default(now())

  @@unique([userId, date])
  @@index([userId])
}
```

- [ ] **Step 2: Generate Prisma client**

Run: `cd /Users/dannygrannick/superpower-dev/ts-ai-chat && npm run db:generate`
Expected: Prisma client regenerated successfully.

- [ ] **Step 3: Run migration**

Run: `cd /Users/dannygrannick/superpower-dev/ts-ai-chat && npx prisma migrate dev --name add-daily-brief`
Expected: Migration created and applied.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(daily-brief): add DailyBrief prisma model"
```

---

## Task 2: LLM Prompt Template

**Files:**
- Create: `ts-ai-chat/src/daily-brief/daily-brief-prompt.ts`

- [ ] **Step 1: Create the prompt template file**

```typescript
// ts-ai-chat/src/daily-brief/daily-brief-prompt.ts

export type BriefPhase = 'pre-results' | 'post-results' | 'mid-protocol';

interface BriefContext {
  phase: BriefPhase;
  memberName: string;
  biomarkerSummaries?: string[];
  protocolGoals?: string[];
  protocolActions?: string[];
  protocolCreatedDaysAgo?: number;
  wearablesData?: string;
  recentMemories?: string[];
  intakeGoals?: string[];
}

const PHASE_INSTRUCTIONS: Record<BriefPhase, string> = {
  'pre-results': `PHASE: Pre-Results
GOAL: Build context and relationship. Encourage data connections.
TONE: Warm, curious, encouraging.
NUDGES: Connect wearables, complete intake, share health goals, upload previous labs, schedule first test.
DO NOT: Reference lab results or protocol actions (they don't exist yet).`,

  'post-results': `PHASE: Post-Results (first 2 weeks of protocol)
GOAL: Activate protocol. Help the member start habit stacking recommendations into daily life.
TONE: Energizing, specific, actionable.
NUDGES: Start first protocol action, habit stack (tie new habit to existing routine), explain WHY each action matters for their specific biomarkers.
DO NOT: Assume adherence. This is the activation phase — help them start.`,

  'mid-protocol': `PHASE: Mid-Protocol (2+ weeks in)
GOAL: Adherence, motivation, ongoing engagement.
TONE: Coaching, celebrating progress, connecting daily data to long-term trends.
NUDGES: Adherence check-ins, progress celebration, connect daily wearable data to biomarker trends, suggest adjustments when life gets in the way.
DO NOT: Repeat the same nudge every day. Vary the focus.`,
};

export function buildBriefSystemPrompt() {
  return `You are a health coach generating a daily brief for a Superpower member.

RULES:
- Lead with the most actionable data point available.
- Connect wearable data to biomarker context when both are available. This is the key differentiator — Oura doesn't know their glucose is borderline, but you do.
- Reference conversation memory naturally, not robotically.
- End with a conversational hook — a question or suggested action.
- 2-3 sentences maximum. Be concise.
- Feel like a coach checking in, not an alarm or a robot.
- Use the member's first name naturally (not every sentence).
- Never fabricate data. Only reference data provided in the context.`;
}

export function buildBriefUserPrompt(ctx: BriefContext) {
  const sections: string[] = [];

  sections.push(PHASE_INSTRUCTIONS[ctx.phase]);
  sections.push(`Member name: ${ctx.memberName}`);

  if (ctx.biomarkerSummaries != null && ctx.biomarkerSummaries.length > 0) {
    sections.push(`## Biomarker Summaries\n${ctx.biomarkerSummaries.join('\n')}`);
  }

  if (ctx.protocolGoals != null && ctx.protocolGoals.length > 0) {
    sections.push(`## Protocol Goals\n${ctx.protocolGoals.join('\n')}`);
  }

  if (ctx.protocolActions != null && ctx.protocolActions.length > 0) {
    sections.push(`## Protocol Actions\n${ctx.protocolActions.join('\n')}`);
  }

  if (ctx.protocolCreatedDaysAgo != null) {
    sections.push(`Protocol started ${ctx.protocolCreatedDaysAgo} days ago.`);
  }

  if (ctx.wearablesData != null) {
    sections.push(`## Wearables (Last 24h)\n${ctx.wearablesData}`);
  }

  if (ctx.recentMemories != null && ctx.recentMemories.length > 0) {
    sections.push(`## Recent Conversation Context\n${ctx.recentMemories.join('\n')}`);
  }

  if (ctx.intakeGoals != null && ctx.intakeGoals.length > 0) {
    sections.push(`## Member Intake Goals & Priorities\n${ctx.intakeGoals.join('\n')}`);
  }

  sections.push('Generate the daily brief now. 2-3 sentences max.');

  return sections.join('\n\n');
}
```

- [ ] **Step 2: Commit**

```bash
git add src/daily-brief/daily-brief-prompt.ts
git commit -m "feat(daily-brief): add LLM prompt template with phase-aware instructions"
```

---

## Task 3: Brief Generator — Layer Assembly + Phase Detection

**Files:**
- Create: `ts-ai-chat/src/daily-brief/daily-brief-generator.ts`

This is the core orchestrator. It detects the member's phase, assembles available data layers, calls the LLM, and caches the result.

- [ ] **Step 1: Create the generator file**

```typescript
// ts-ai-chat/src/daily-brief/daily-brief-generator.ts

import { generateText } from 'ai';
import * as Sentry from '@sentry/node';
import type { PrismaClient } from '@prisma/client';
import type { BriefPhase } from './daily-brief-prompt';
import { buildBriefSystemPrompt, buildBriefUserPrompt } from './daily-brief-prompt';

interface DailyBriefResult {
  brief: string;
  phase: BriefPhase;
  layers: string[];
  actionUrl: string | null;
  generatedAt: string;
}

interface DailyBriefDeps {
  prisma: PrismaClient;
  protocolService: { findLatestActive(userId: string): Promise<any | null> };
  recallService: { searchMemories(input: { userId: string; query: string; limit: number; expand: boolean }): Promise<{ memories: Array<{ content: string }> }> };
  medplumService: { getPatientBundleData(userId: string): Promise<any | undefined> };
  wearableSummaryService: { execute(input: { userId: string }): Promise<{ summary: string; lastUpdatedAt: Date } | null> };
  anthropic: { languageModel(model: string): any };
}

export class DailyBriefGenerator {
  constructor(private deps: DailyBriefDeps) {}

  async generate(userId: string): Promise<DailyBriefResult> {
    const today = new Date().toISOString().slice(0, 10);

    // Check cache
    const cached = await this.deps.prisma.dailyBrief.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    if (cached != null) {
      return {
        brief: cached.content,
        phase: cached.phase as BriefPhase,
        layers: cached.layers,
        actionUrl: cached.actionUrl,
        generatedAt: cached.createdAt.toISOString(),
      };
    }

    // Assemble layers in parallel
    const [biomarkerSummaries, protocol, wearableSummary, memories, patientBundle] =
      await Promise.all([
        this.fetchBiomarkerSummaries(userId),
        this.deps.protocolService.findLatestActive(userId).catch(() => null),
        this.deps.wearableSummaryService.execute({ userId }).catch(() => null),
        this.deps.recallService
          .searchMemories({
            userId,
            query: 'recent topics, recommendations, follow-ups, open threads',
            limit: 5,
            expand: false,
          })
          .catch(() => ({ memories: [] })),
        this.deps.medplumService.getPatientBundleData(userId).catch(() => undefined),
      ]);

    // Detect phase
    const phase = this.detectPhase(biomarkerSummaries, protocol);

    // Track which layers contributed
    const layers: string[] = [];

    // Build context
    const biomarkerTexts: string[] = [];
    if (biomarkerSummaries.length > 0) {
      layers.push('biomarkers');
      for (const bs of biomarkerSummaries) {
        biomarkerTexts.push(`${bs.category}: ${bs.summary}`);
      }
    }

    let protocolGoals: string[] | undefined;
    let protocolActions: string[] | undefined;
    let protocolCreatedDaysAgo: number | undefined;
    if (protocol != null) {
      layers.push('protocol');
      protocolGoals = protocol.goals?.map((g: any) => g.description) ?? [];
      protocolActions = protocol.goals?.flatMap((g: any) =>
        (g.actions ?? []).map((a: any) => a.description),
      ) ?? [];
      const created = new Date(protocol.createdAt);
      protocolCreatedDaysAgo = Math.floor(
        (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24),
      );
    }

    let wearablesData: string | undefined;
    if (wearableSummary != null) {
      layers.push('wearables');
      wearablesData = wearableSummary.summary;
    }

    let recentMemories: string[] | undefined;
    if (memories.memories.length > 0) {
      layers.push('memory');
      recentMemories = memories.memories.map((m) => m.content);
    }

    let intakeGoals: string[] | undefined;
    if (patientBundle != null) {
      layers.push('intake');
      intakeGoals = this.extractIntakeGoals(patientBundle);
    }

    // Extract member name
    const memberName = patientBundle?.patientData?.name?.[0]?.given?.[0] ?? 'there';

    // Generate via LLM
    let brief: string;
    try {
      const result = await generateText({
        model: this.deps.anthropic.languageModel('claude-haiku-4-5-20251001'),
        system: buildBriefSystemPrompt(),
        prompt: buildBriefUserPrompt({
          phase,
          memberName,
          biomarkerSummaries: biomarkerTexts.length > 0 ? biomarkerTexts : undefined,
          protocolGoals,
          protocolActions,
          protocolCreatedDaysAgo,
          wearablesData,
          recentMemories,
          intakeGoals,
        }),
        maxTokens: 256,
      });
      brief = result.text.trim();
    } catch (err) {
      Sentry.logger.error('daily-brief.generate.llm-failed', { userId, error: err });
      // Fallback: try yesterday's brief
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const fallback = await this.deps.prisma.dailyBrief.findUnique({
        where: { userId_date: { userId, date: yesterday } },
      });
      if (fallback != null) {
        return {
          brief: fallback.content,
          phase: fallback.phase as BriefPhase,
          layers: fallback.layers,
          actionUrl: fallback.actionUrl,
          generatedAt: fallback.createdAt.toISOString(),
        };
      }
      brief = `Hey ${memberName}, how are things going? Want to chat about your health journey?`;
    }

    // Persist
    const saved = await this.deps.prisma.dailyBrief.create({
      data: {
        userId,
        date: today,
        phase,
        content: brief,
        layers,
        actionUrl: null,
      },
    });

    return {
      brief: saved.content,
      phase: saved.phase as BriefPhase,
      layers: saved.layers,
      actionUrl: saved.actionUrl,
      generatedAt: saved.createdAt.toISOString(),
    };
  }

  private detectPhase(
    biomarkerSummaries: Array<{ category: string; summary: string }>,
    protocol: any | null,
  ): BriefPhase {
    const hasBiomarkers = biomarkerSummaries.length > 0;

    if (!hasBiomarkers) {
      return 'pre-results';
    }

    if (protocol != null) {
      const created = new Date(protocol.createdAt);
      const daysSinceCreation = Math.floor(
        (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysSinceCreation <= 14) {
        return 'post-results';
      }
      return 'mid-protocol';
    }

    // Has biomarkers but no protocol — treat as post-results
    return 'post-results';
  }

  private async fetchBiomarkerSummaries(
    userId: string,
  ): Promise<Array<{ category: string; summary: string }>> {
    const summaries = await this.deps.prisma.biomarkerSummary.findMany({
      where: { userId },
    });
    return summaries.map((s) => ({ category: s.category, summary: s.summary }));
  }

  private extractIntakeGoals(patientBundle: any): string[] {
    const goals: string[] = [];
    const questionnaires = patientBundle.questionnaireResponses ?? [];
    for (const qr of questionnaires) {
      const items = qr.item ?? [];
      for (const item of items) {
        if (item.answer != null) {
          for (const answer of item.answer) {
            if (answer.valueString != null) {
              goals.push(`${item.text}: ${answer.valueString}`);
            }
          }
        }
      }
    }
    return goals.slice(0, 10); // Limit to avoid prompt bloat
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/daily-brief/daily-brief-generator.ts
git commit -m "feat(daily-brief): add generator with layer assembly and phase detection"
```

---

## Task 4: oRPC Router + Registration

**Files:**
- Create: `ts-ai-chat/src/daily-brief/daily-brief-router.ts`
- Modify: `ts-ai-chat/src/http/orpc-router.ts`

- [ ] **Step 1: Create the router file**

```typescript
// ts-ai-chat/src/daily-brief/daily-brief-router.ts

import { z } from 'zod';
import { base, authMiddleware, authHeaderSchema } from '../http/orpc';
import { DailyBriefGenerator } from './daily-brief-generator';

const dailyBriefOutputSchema = z.object({
  brief: z.string(),
  phase: z.enum(['pre-results', 'post-results', 'mid-protocol']),
  layers: z.array(z.string()),
  actionUrl: z.string().nullable(),
  generatedAt: z.string(),
});

export const dailyBriefRouter = base.prefix('/daily-brief').router({
  get: base
    .route({
      method: 'GET',
      path: '/',
      inputStructure: 'detailed',
    })
    .input(z.object({ headers: authHeaderSchema }))
    .output(dailyBriefOutputSchema)
    .errors({
      UNAUTHORIZED: { message: 'Unauthorized' },
      INTERNAL_SERVER_ERROR: { message: 'Failed to generate daily brief' },
    })
    .use(authMiddleware)
    .handler(async ({ input, context: { container }, errors }) => {
      const userId = input.headers['x-user-id'];
      if (userId == null) {
        throw errors.UNAUTHORIZED({});
      }

      try {
        const generator = container.get(DailyBriefGenerator);
        const result = await generator.generate(userId);
        return result;
      } catch (err) {
        throw errors.INTERNAL_SERVER_ERROR({});
      }
    }),
});
```

- [ ] **Step 2: Register the router in orpc-router.ts**

In `ts-ai-chat/src/http/orpc-router.ts`, add the import and register the router in `v1Routes`:

Add import at top:
```typescript
import { dailyBriefRouter } from '../daily-brief/daily-brief-router';
```

Add to the `v1Routes` object:
```typescript
const v1Routes = {
  // ... existing routes
  dailyBrief: dailyBriefRouter,
};
```

- [ ] **Step 3: Register DailyBriefGenerator in the DI container**

Find the container setup file (likely `src/container.ts` or similar) and register `DailyBriefGenerator` with its dependencies. The exact registration pattern depends on the DI framework used — follow the existing pattern for services like `GenerateWearableSummaryUseCase`.

- [ ] **Step 4: Commit**

```bash
git add src/daily-brief/daily-brief-router.ts src/http/orpc-router.ts
git commit -m "feat(daily-brief): add oRPC route and register in v1 router"
```

---

## Task 5: Frontend — API Client + Query Hook

**Files:**
- Create: `react-app/src/features/daily-brief/api/get-daily-brief.ts`

- [ ] **Step 1: Create the API + hook file**

```typescript
// react-app/src/features/daily-brief/api/get-daily-brief.ts

import { queryOptions, useQuery } from '@tanstack/react-query';
import { $aiChatApi } from '@/orpc/ai-chat-api';

interface DailyBrief {
  brief: string;
  phase: 'pre-results' | 'post-results' | 'mid-protocol';
  layers: string[];
  actionUrl: string | null;
  generatedAt: string;
}

export function getDailyBriefQueryOptions() {
  return queryOptions({
    queryKey: ['daily-brief'],
    queryFn: async (): Promise<DailyBrief> => {
      const { data, error } = await $aiChatApi.GET('/api/v1/daily-brief');
      if (error != null) {
        throw new Error('Failed to fetch daily brief');
      }
      return data as DailyBrief;
    },
    staleTime: Infinity,
    retry: 1,
  });
}

export function useDailyBrief() {
  return useQuery(getDailyBriefQueryOptions());
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/daily-brief/api/get-daily-brief.ts
git commit -m "feat(daily-brief): add API client and TanStack Query hook"
```

---

## Task 6: Frontend — Data Source Pills Component

**Files:**
- Create: `react-app/src/features/daily-brief/components/daily-brief-pills.tsx`

- [ ] **Step 1: Create the pills component**

```tsx
// react-app/src/features/daily-brief/components/daily-brief-pills.tsx

import { cn } from '@/lib/utils';

interface DailyBriefPillsProps {
  layers: string[];
}

const LAYER_CONFIG: Record<string, { label: string; className: string }> = {
  biomarkers: { label: 'Labs', className: 'bg-vermillion-50 text-vermillion-600' },
  protocol: { label: 'Protocol', className: 'bg-green-50 text-green-600' },
  wearables: { label: 'Wearables', className: 'bg-blue-50 text-blue-600' },
  memory: { label: 'Chat History', className: 'bg-purple-50 text-purple-600' },
  intake: { label: 'Intake', className: 'bg-yellow-50 text-yellow-600' },
};

export function DailyBriefPills({ layers }: DailyBriefPillsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {layers.map((layer) => {
        const config = LAYER_CONFIG[layer];
        if (config == null) return null;
        return (
          <span
            key={layer}
            className={cn(
              'rounded-full px-2.5 py-0.5 font-mono text-xs',
              config.className,
            )}
          >
            {config.label}
          </span>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/daily-brief/components/daily-brief-pills.tsx
git commit -m "feat(daily-brief): add data source pills component"
```

---

## Task 7: Frontend — Homepage Teaser Card

**Files:**
- Create: `react-app/src/features/daily-brief/components/daily-brief-teaser.tsx`
- Modify: `react-app/src/features/homepage/cards/config.ts`

- [ ] **Step 1: Create the teaser component**

```tsx
// react-app/src/features/daily-brief/components/daily-brief-teaser.tsx

import { Link } from '@tanstack/react-router';
import { useDailyBrief } from '../api/get-daily-brief';
import { HomepageCard } from '@/features/homepage/components/homepage-card';

export function DailyBriefTeaser() {
  const { data: brief, isLoading } = useDailyBrief();

  if (isLoading) {
    return (
      <HomepageCard>
        <div className="flex animate-pulse items-center gap-3 p-4">
          <div className="h-9 w-9 rounded-full bg-neutral-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 rounded bg-neutral-200" />
            <div className="h-3 w-1/2 rounded bg-neutral-200" />
          </div>
        </div>
      </HomepageCard>
    );
  }

  if (brief == null) {
    return null;
  }

  return (
    <Link to="/concierge" search={{ preset: 'daily-brief' as any }}>
      <HomepageCard>
        <div className="flex items-center gap-3 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-vermillion-400 to-vermillion-500">
            <span className="text-sm text-white">✦</span>
          </div>
          <p className="font-proreg text-sm leading-snug text-neutral-900">
            {brief.brief}
          </p>
          <span className="shrink-0 text-neutral-400">›</span>
        </div>
      </HomepageCard>
    </Link>
  );
}
```

- [ ] **Step 2: Register in card config**

In `react-app/src/features/homepage/cards/config.ts`, add the daily brief card registration.

Add import at top:
```typescript
import { DailyBriefTeaser } from '@/features/daily-brief/components/daily-brief-teaser';
```

Add config object and register it (following the existing pattern):
```typescript
const dailyBriefCardConfig: CardConfig = {
  id: 'dailyBrief',
  component: DailyBriefTeaser,
  shouldShow: () => true,
  getPriority: () => 3,
};

cardRegistry.register(dailyBriefCardConfig);
```

- [ ] **Step 3: Commit**

```bash
git add src/features/daily-brief/components/daily-brief-teaser.tsx src/features/homepage/cards/config.ts
git commit -m "feat(daily-brief): add homepage teaser card with registry integration"
```

---

## Task 8: Frontend — Concierge Briefing Card

**Files:**
- Create: `react-app/src/features/daily-brief/components/daily-brief-card.tsx`

- [ ] **Step 1: Create the full briefing card**

```tsx
// react-app/src/features/daily-brief/components/daily-brief-card.tsx

import { useDailyBrief } from '../api/get-daily-brief';
import { DailyBriefPills } from './daily-brief-pills';
import { Body2, Body4 } from '@/components/ui/typography';

export function DailyBriefCard() {
  const { data: brief, isLoading } = useDailyBrief();

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-neutral-200" />
          <div className="h-3 w-32 rounded bg-neutral-200" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-neutral-200" />
          <div className="h-3 w-4/5 rounded bg-neutral-200" />
        </div>
      </div>
    );
  }

  if (brief == null) {
    return null;
  }

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-vermillion-400 to-vermillion-500">
          <span className="text-xs text-white">✦</span>
        </div>
        <Body4 className="uppercase tracking-wider text-neutral-400">
          Daily Brief · {today}
        </Body4>
      </div>
      <Body2 className="mb-4 leading-relaxed text-neutral-900">
        {brief.brief}
      </Body2>
      {brief.layers.length > 0 && (
        <DailyBriefPills layers={brief.layers} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/daily-brief/components/daily-brief-card.tsx
git commit -m "feat(daily-brief): add concierge briefing card with data pills"
```

---

## Task 9: Frontend — Concierge Integration (Preset + Empty State)

**Files:**
- Modify: `react-app/src/features/messages/components/ai/preset-messages.ts`
- Modify: `react-app/src/features/messages/components/ai/chat.tsx`

- [ ] **Step 1: Add 'daily-brief' to preset schema**

In `react-app/src/features/messages/components/ai/preset-messages.ts`, update the `CHAT_PRESETS` array:

```typescript
const CHAT_PRESETS = [
  'update-personalization',
  'upload-labs',
  'import-memory',
  'daily-brief',
] as const;
```

Add a preset message for daily-brief to `PRESET_MESSAGES`:

```typescript
const DAILY_BRIEF_MESSAGE = 'Tell me more about my daily brief.';

export const PRESET_MESSAGES = {
  'update-personalization': UPDATE_PERSONALIZATION_MESSAGE,
  'upload-labs': UPLOAD_LABS_MESSAGE,
  'import-memory': IMPORT_MEMORY_MESSAGE,
  'daily-brief': DAILY_BRIEF_MESSAGE,
} satisfies Record<Preset, string>;
```

- [ ] **Step 2: Render DailyBriefCard in concierge empty state**

In `react-app/src/features/messages/components/ai/chat.tsx`, modify the empty state section (around line 1064-1080).

Add import at top:
```typescript
import { DailyBriefCard } from '@/features/daily-brief/components/daily-brief-card';
```

Update the empty state rendering to include the daily brief card above the existing content:

```tsx
{messages.length === 0 && (
  <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
    <Greeting />
    {preset === 'daily-brief' && <DailyBriefCard />}
    <div className="flex w-full">
      {onboardingComplete ? (
        <SuggestedActions
          onSendSuggestion={(text) => {
            void sendMessage({ text, files: [] }, undefined);
          }}
          setupActions={setupActions}
        />
      ) : (
        <OnboardingCircle />
      )}
    </div>
  </div>
)}
```

Note: The `preset` variable should already be available in this component from the search params. Check how it's accessed — it may come via props from `concierge-chat-panel.tsx`. Thread it through if needed.

- [ ] **Step 3: Commit**

```bash
git add src/features/messages/components/ai/preset-messages.ts src/features/messages/components/ai/chat.tsx
git commit -m "feat(daily-brief): integrate briefing card into concierge empty state"
```

---

## Task 10: End-to-End Verification

**Files:** None (testing only)

- [ ] **Step 1: Verify backend compiles**

Run: `cd /Users/dannygrannick/superpower-dev/ts-ai-chat && npm run build`
Expected: No compilation errors.

- [ ] **Step 2: Verify frontend compiles**

Run: `cd /Users/dannygrannick/superpower-dev/react-app && bun check`
Expected: No lint or type errors.

- [ ] **Step 3: Run frontend lint and format**

Run: `cd /Users/dannygrannick/superpower-dev/react-app && bun fmt && bun lint`
Expected: Clean output, no errors.

- [ ] **Step 4: Manual smoke test**

Start the dev environment and verify:
1. Homepage shows the daily brief teaser card at the top
2. Tapping the teaser navigates to `/concierge?preset=daily-brief`
3. Concierge shows the full briefing card with data pills above the chat input
4. Chat input below the briefing card is functional

- [ ] **Step 5: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix(daily-brief): address lint and type issues"
```
