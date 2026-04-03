# Wearable Connection Loop — Design Spec

**Date:** 2026-04-03
**Linear:** [Superpower Daily Brief](https://linear.app/superpower/project/superpower-daily-brief-55e15ade9c32/overview) (related — wearable insights feed into the daily brief)
**Scope:** Frontend-only. No backend changes. Uses existing chat infrastructure.

---

## Problem

When someone connects a wearable, we don't close the loop. No celebration, no summary, no insight. The data starts syncing silently and the user has no reason to engage with it until they stumble onto the data page. We need to connect the dots between their wearable data and their labs, health history, and goals — immediately.

## Solution

Two things happen when a wearable is connected:

1. **Celebration modal** — confirms the connection, explains the value, and lets the user kick off a report
2. **Background AI summary** — a real chat session that generates a comprehensive insight report connecting wearable data to labs, protocol, and goals. Surfaces via toast when ready.

---

## Connection Flow

When a wearable is successfully connected (popup closes, `status === 'connected'` verified):

1. **Immediately:** Start a background chat session with the wearable summary prompt. The AI begins generating before the user sees anything.
2. **Immediately:** Show the celebration modal:
   - Hero image (`/integrations/runner.webp`)
   - "Your {providerName} is connected!"
   - 3 benefit bullets:
     - Live wearables data on your data page
     - AI has full context of your wearables
     - Your protocol connects the dots
   - CTA button: "Generate my report"
3. **On CTA click:** Button text transitions to "We're generating your insights and we'll let you know when your report is ready." Modal auto-dismisses after ~3 seconds.
4. **When AI finishes streaming:** Toast notification appears: "Your {providerName} insights report is ready" with "View report →" action.
5. **If user missed the toast:** Flag persisted in localStorage. On next homepage visit, toast shows again.

### Triggers

This flow runs for **every new wearable connection** — not just the first. Each wearable brings different data (Oura = sleep/HRV, Whoop = strain/recovery, Apple Health = activity) so each deserves its own report.

---

## Background Chat Session

### Prompt

```
Generate a comprehensive wearables insight report for me. I just connected {providerName}.

Analyze my wearable data and connect the dots between:
- My wearable metrics (sleep, HRV, heart rate, steps, activity)
- My lab results and biomarker trends
- My health history and intake goals
- My active protocol recommendations

Structure the report as:
1. Key findings from the wearable data
2. Connections between my wearable data and my labs/biomarkers
3. Actionable insights — what should I focus on based on the combined picture
4. One specific recommendation for this week

Be specific with numbers and data points. This is a detailed report, not a brief.
```

### Implementation

Uses the same `useChat` + `createChatV2Transport` pattern from the daily brief feature. The chat session runs with no visible UI — it just:
- Creates a new chat session with a unique ID
- Auto-sends the prompt
- Tracks `status` — when it transitions to `'ready'` the report is complete
- Stores the thread ID in localStorage for the toast CTA

### Why the Existing Chat API

The AI chat service (ts-ai-chat) already has full access to the member's context — biomarker summaries, wearable data, memory, protocol, intake. A real chat session means the AI uses its full toolset (recall, research, data queries) to generate a grounded report. No new backend needed.

---

## Celebration Modal

### Source

Existing component: `src/features/settings/components/wearables/wearable-connected-modal.tsx` (currently commented out in `wearables-table.tsx`).

### Updates to Existing Modal

- Update CTA from "Get summary" to "Generate my report"
- Add a "generating" state: CTA transitions to "We're generating your insights and we'll let you know when your report is ready."
- Auto-dismiss modal ~3 seconds after transitioning to generating state
- Accept `isGenerating` prop from parent

### Modal States

1. **Default:** Hero image + benefits + "Generate my report" button
2. **Generating:** Button replaced with confirmation text, auto-dismiss countdown
3. **Dismissed:** Modal gone, background generation continues

---

## Toast Notification

### When AI Finishes

```typescript
toast.success(`Your ${providerName} insights report is ready`, {
  action: {
    label: 'View report →',
    onClick: () => navigate({ to: `/concierge/${threadId}` }),
  },
  duration: 10000,
});
```

### Persistence (localStorage)

- **Key:** `wearable-report-pending`
- **Value:** `{ threadId: string, providerName: string, completedAt: string }`
- **Set:** When AI finishes streaming
- **Cleared:** When user clicks "View report →"
- **Checked:** On homepage mount — if key exists, show toast again

---

## File Changes

### Modified Files

| File | Change |
|------|--------|
| `src/features/settings/components/wearables/wearables-table.tsx` | Uncomment modal, add background chat trigger after connection success |
| `src/features/settings/components/wearables/wearable-connected-modal.tsx` | Update CTA copy, add generating state, auto-dismiss |

### New Files

| File | Responsibility |
|------|---------------|
| `src/features/wearables/hooks/use-wearable-report.ts` | Hook managing background chat session — useChat + transport, auto-send prompt, track completion, persist to localStorage, fire toast |
| `src/features/wearables/components/wearable-report-toast.tsx` | Component mounted on homepage that checks localStorage for pending reports and surfaces missed toasts |

### Integration Points

- `wearables-table.tsx` success handler → calls `useWearableReport().generate(providerName)`
- `wearable-connected-modal.tsx` → receives `isGenerating` state from the hook
- Homepage (`_app.index.tsx`) → mounts `<WearableReportToast />` to catch missed toasts

---

## Error Handling

- **Chat session fails:** Silently fail. Don't show error to user — they already got the success modal for the connection itself. The report is a bonus.
- **Toast missed + localStorage cleared:** No problem, the chat thread still exists in their history.
- **User navigates away during generation:** Report is lost (acceptable for frontend-only approach). Can upgrade to backend persistence later.

---

## Out of Scope

- Backend job / pg-boss integration
- Push notifications
- Report history / past reports view
- Surviving browser close mid-generation
- Figma design pixel-perfect implementation (Figma MCP unavailable — using existing modal component with copy updates)
