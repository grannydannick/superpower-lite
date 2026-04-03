# Daily Brief — Design Spec

**Date:** 2026-04-02
**Linear:** [Superpower Daily Brief](https://linear.app/superpower/project/superpower-daily-brief-55e15ade9c32/overview)
**Scope:** Full-stack, minimal — real backend endpoint with LLM generation, real data queries, frontend integration. No cron job yet (on-demand with caching).

---

## Problem

Members have wearables connected but get no daily feedback loop. Wearables data isn't tied into labs. The AI coach has memory and context but only engages when the member initiates. There's no proactive daily touchpoint progressing the member's health journey.

## Value Proposition

Data readback **filtered through lab profile, care plan, and conversation history.** Oura doesn't know your glucose is borderline. We do.

---

## Architecture

### Approach: Layered Brief

Assemble whichever data layers are available into one cohesive daily message. Members without wearables still get a meaningful brief. Members with the full stack get the richest experience.

### Two Surfaces

1. **Homepage teaser** — replaces the current static AI summary banner. Same position, same shape, now dynamic and personalized. Tapping navigates to `/concierge?preset=daily-brief`.
2. **Concierge daily briefing** — full brief rendered as a special card above the chat input (not a chat message). Shows the complete message + data pills indicating contributing layers. Chat input below for immediate follow-up.

---

## Data Layers (Priority Order)

The generator assembles context from whichever layers return data. Missing layers are simply omitted — the LLM adapts.

### Layer 1: Protocol + Biomarkers (when available)
- Latest results + trends from `BiomarkerSummary`
- Active protocol goals and actions
- **Protocol adherence nudges:** When a member has an active protocol, the brief should nudge activation or adherence to specific recommendations. Connect the nudge to their stated goals — e.g., "Your metabolic protocol includes a post-dinner walk to help with your fasting glucose goal. Have you been fitting those in this week?"

### Layer 2: Wearables (when connected)
- Last 24h from wearables API: sleep score, HRV, steps, bedtime, resting HR
- Connected to biomarker context when available — the key differentiator

### Layer 3: Memory (when available)
- Recall query scoped to last 7 days: open threads, recommendations given, follow-up items
- Referenced naturally in the brief, not robotically

### Layer 4: Intake (always available post-onboarding)
- Questionnaire responses: health goals, conditions, lifestyle
- Used as baseline context when other layers are sparse

### Fallback Cascade

Never show a dead-end. The generator always produces something meaningful:

| Available Data | Brief Style |
|---|---|
| Protocol + Biomarkers + Wearables + Memory | Full: overnight data connected to lab trends, protocol nudge, memory thread |
| Protocol + Biomarkers + Memory | Connect lab trends to protocol goals, reference recent conversation |
| Protocol + Biomarkers only | Protocol adherence nudge with biomarker context |
| Wearables + Intake | Overnight data connected to stated health goals |
| Memory + Intake | Build on recent conversation topics, reference goals |
| Intake only | Engage around stated priorities, invite exploration |
| Nothing meaningful | Generic check-in: "How are things going? Want to chat?" |

---

## Member Journey Phases

The brief evolves based on where the member is in their health journey. Each phase has a distinct goal and tone.

### Phase 1: Pre-Results
**Goal:** Capture more data, build context, establish the relationship.
**Trigger:** No lab results yet (no `BiomarkerSummary` data). Member may have intake, wearables, memory, or just an account.

The brief focuses on learning about the member, encouraging data connections, and building rapport:

> "Hey Danny, you flagged stress management and energy as your top priorities. Want to explore what we can track to start building a baseline?"

> "Morning Danny. Sleep score 82 last night, solid HRV at 63. Once your labs come back, we can connect the dots between your sleep patterns and your bloodwork. For now — your sleep consistency this week has been strong."

> "You mentioned wanting to understand your metabolic health better. Connecting a wearable like Oura would give us daily data to work with alongside your upcoming labs. Want to set that up?"

**Nudges in this phase:** Connect wearables, complete intake, share health goals, upload previous labs, schedule first test.

### Phase 2: Post-Results
**Goal:** Activate protocol. Help the member understand their results and start habit stacking protocol recommendations into daily life.
**Trigger:** Lab results received, protocol generated. Early days of protocol (first ~2 weeks).

The brief shifts to activation — making the protocol real and actionable:

> "Your results are in and your metabolic protocol is ready. The first step is a 20-min post-dinner walk — tonight would be a great time to start. Want to talk through the plan?"

> "Day 3 of your protocol. Your fasting glucose was flagged at 103 — the post-dinner walks and magnesium are specifically targeting that. How did last night go?"

> "Morning Danny. Sleep score 77, HRV 56 — bedtime was ~90 min later than your best window. Your protocol suggests consistent 10:30 PM bedtime for glucose regulation. Want to brainstorm how to make that work with your schedule?"

**Nudges in this phase:** Start first protocol action, habit stack (tie new habit to existing routine), explain *why* each action matters for their specific biomarkers.

### Phase 3: Mid-Protocol
**Goal:** Adherence, motivation, ongoing engagement. Keep the member on track and show progress.
**Trigger:** Protocol active for 2+ weeks. Ongoing.

The brief becomes a coach — checking in on adherence, celebrating progress, connecting daily wearable data to protocol goals:

> "Morning Danny. Sleep score 77, HRV 56 — bedtime was ~90 min later than your best window. With your fasting glucose trending up over 3 tests, a 20-min post-dinner walk today would help offset the late night. Want to dig into the trend?"

> "You started the magnesium protocol 2 weeks ago for sleep. Your HRV has improved 8% — looks like it might be working. Want to review the trend?"

> "Last week you mentioned stress was making it hard to stick to your evening routine. Your fasting glucose is still trending up — want to brainstorm a realistic adjustment to your protocol?"

> "Your protocol suggests limiting alcohol to improve liver enzymes. How's that going this week?"

**Nudges in this phase:** Adherence check-ins, progress celebration, connect daily data to long-term trends, motivate through visible improvement, suggest adjustments when life gets in the way.

---

## Content Strategy

### Tone & Depth
- **Adaptive:** Brief when there's nothing notable (1 sentence), substantive when there's signal (2-3 sentences)
- Lead with the most actionable data point
- Connect wearable data to biomarker context
- Reference memory naturally
- End with a conversational hook — a question or suggested action
- 2-3 sentences max
- Feel like a coach checking in, not an alarm

### Phase Detection

The generator determines the member's phase:

1. **Pre-Results:** No `BiomarkerSummary` data for the user
2. **Post-Results:** `BiomarkerSummary` exists AND protocol created within last 14 days
3. **Mid-Protocol:** Protocol active for 14+ days

The phase is passed to the LLM prompt so it adjusts goal, tone, and nudge type accordingly.

---

## Backend Design

### New Module: `ts-ai-chat/src/daily-brief/`

```
daily-brief/
  daily-brief-router.ts         # oRPC route definition
  daily-brief-generator.ts      # Orchestrates layer assembly + LLM call
  daily-brief-prompt.ts         # System prompt template
```

### Prisma Model

```prisma
model DailyBrief {
  id          String   @id @default(cuid())
  userId      String
  date        String   // "2026-04-02" — one per user per day
  phase       String   // "pre-results" | "post-results" | "mid-protocol"
  content     String   // The generated brief text
  layers      String[] // ["protocol", "wearables", "memory", "intake"]
  actionUrl   String?  // Deep link to relevant chat thread
  createdAt   DateTime @default(now())

  @@unique([userId, date])
}
```

### Endpoint

`GET /api/v1/daily-brief` — authenticated.

### Generation Flow

1. Check cache: look for `DailyBrief` with `(userId, today's date)`
2. Cache hit → return immediately
3. Cache miss → generate:
   a. Detect member phase: check `BiomarkerSummary` existence + protocol creation date
   b. Query `BiomarkerSummary` for latest results + trends
   b. Query active protocol/care plan — goals, actions, adherence status
   c. If wearables connected → fetch last 24h (sleep, HRV, steps, bedtime)
   d. Run memory `recall` — recent topics, open threads, follow-ups (last 7 days)
   e. Query intake/questionnaire data
   f. Assemble context object with available layers
   g. Call LLM (Haiku for speed/cost) with brief prompt + context
4. Persist to `DailyBrief` table
5. Return response

### Response Shape

```ts
{
  brief: string           // The generated message
  phase: string           // "pre-results" | "post-results" | "mid-protocol"
  layers: string[]        // Which layers contributed
  actionUrl?: string      // Deep link if relevant thread exists
  generatedAt: string     // ISO timestamp
}
```

---

## Frontend Design

### New Feature Module: `src/features/daily-brief/`

```
daily-brief/
  api/
    get-daily-brief.ts          # API call via $aiChatApi
  components/
    daily-brief-teaser.tsx       # Homepage banner (compact)
    daily-brief-card.tsx         # Concierge full briefing card
    daily-brief-pills.tsx        # Data source pills
  hooks/
    use-daily-brief.ts           # TanStack Query hook
```

### Homepage Integration

- Register `daily-brief-teaser` in card registry at priority 3 (above all existing cards)
- Replaces/supersedes the current static AI summary banner when a brief is available
- Falls back to existing banner if endpoint fails or returns empty
- Tapping navigates to `/concierge?preset=daily-brief`

### Concierge Integration

- `daily-brief-card` renders when navigated via `?preset=daily-brief`
- Positioned above the chat input, below the greeting
- Shows full brief text + data pills (Sleep 77, HRV 56, Glucose trending, Protocol: Metabolic)
- Chat input below for immediate follow-up questions
- Uses existing `preset` search param pattern — add `'daily-brief'` as new preset type

### Data Fetching

- Uses `$aiChatApi` client (openapi-fetch)
- TanStack Query with `staleTime: Infinity` — once fetched in a session, don't refetch
- Loading state: skeleton shimmer in banner shape

---

## Error Handling

### Frontend
- Endpoint fails → fall back to existing static AI summary banner. No error state shown.
- Loading → skeleton shimmer (reuse existing patterns)

### Backend
- No biomarker data → skip layer, pull from other available sources (intake, memory, wearables, previous labs)
- Wearables API timeout → skip layer, generate with what's available
- Memory search empty → skip layer
- LLM call fails → return cached brief from previous day if exists, otherwise static fallback
- **Rule: always generate something meaningful from whatever data exists**

### Caching
- Backend: one brief per user per day, keyed by `(userId, date)`
- Frontend: `staleTime: Infinity` on query
- No invalidation for V1

---

## Out of Scope (V1)

- Scheduled/cron job for pre-generation
- Push notifications (wake-time delivery)
- Brief history / past briefs view
- User feedback on brief quality
- A/B testing brief styles
- Production hardening (rate limiting, monitoring, alerting)
