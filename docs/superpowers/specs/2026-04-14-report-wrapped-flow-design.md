# Report Wrapped Flow

**Date:** 2026-04-14
**Status:** Approved
**Depends on:** Data Checklist Redesign (completed)

## Overview

Replace the current "click card → open concierge thread" report experience with a Spotify Wrapped-style full-screen flow. Each data source report renders as a sequence of tappable slides with animated metrics, identity-framed headlines, cross-source connection insights, and pre-loaded CTA questions. Strength slides are shareable.

## Route

New route: `/reports/{sourceId}` (e.g., `/reports/wearables`)

The InsightCarouselCard links here instead of `/concierge/{threadId}`.

## AI Response Format

The report generation prompt is updated to request structured JSON instead of free-form text. The AI returns:

```json
{
  "title": "Your sleep & recovery patterns",
  "source": "wearables",
  "metrics": [
    {
      "value": 62,
      "unit": "bpm",
      "label": "Resting heart rate",
      "identity": "Your heart runs steady",
      "status": "healthy",
      "tag": "Healthy"
    },
    {
      "value": 87,
      "unit": "%",
      "label": "Sleep efficiency",
      "identity": "You're an efficient sleeper",
      "status": "good",
      "tag": "Strong"
    },
    {
      "value": 12,
      "unit": "%",
      "label": "Deep sleep change",
      "direction": "down",
      "identity": "Your deep sleep needs you",
      "status": "alert",
      "tag": "Declining"
    },
    {
      "value": 45,
      "unit": "ms",
      "label": "HRV",
      "identity": "You're a fast recoverer",
      "status": "good",
      "tag": "Strong"
    }
  ],
  "connections": [
    {
      "metricIndex": 0,
      "sources": ["wearables", "intake"],
      "headline": "Your heart is steady — even when it doesn't feel like it.",
      "body": "You mentioned anxiety and a racing heart in your intake. But your Oura data shows consistent 60-64 bpm with no spikes — even on anxious days. The sensation may be perceived rather than cardiac.",
      "callout": { "label": "Worth exploring", "text": "Your AI coach can help distinguish anxiety-driven sensations from cardiac events using your daily data." }
    },
    {
      "metricIndex": 2,
      "sources": ["wearables", "intake", "ai-context"],
      "headline": "Three data points, one pattern.",
      "body": "You flagged fatigue in your intake. You researched cortisol with ChatGPT. Now Oura shows deep sleep declining on high-stress days. All three point to a stress-cortisol axis disrupting recovery.",
      "callout": { "label": "Your upcoming panel", "text": "Cortisol and DHEA-S are included in your bloodwork and will confirm or rule out this hypothesis." }
    },
    {
      "metricIndex": 3,
      "sources": ["wearables", "labs"],
      "headline": "Your baseline is stronger than you think.",
      "body": "Your 2024 labs showed thyroid in range and CRP at 0.8. Combined with steady HRV, your system is resilient. The deep sleep issue is targeted, not systemic.",
      "callout": { "label": "Good news", "text": "A solid baseline means protocol interventions are more likely to produce measurable results quickly." }
    }
  ],
  "correlation": {
    "from": { "emoji": "🏃", "label": "Activity" },
    "to": { "emoji": "🌙", "label": "Deep sleep" },
    "identity": "Movement is your sleep medicine",
    "body": "On 7,000+ step days, your deep sleep averages 22 minutes longer.",
    "connection": {
      "sources": ["wearables", "intake"],
      "headline": "We found a lever for your #1 goal.",
      "body": "You set energy optimization as your top priority. Deep sleep drives next-day energy, and activity drives deep sleep. We'll build activity timing into your protocol.",
      "callout": { "label": "Protocol preview", "text": "Targeting the activity window that maximizes your deep sleep response." }
    }
  },
  "nextSteps": [
    { "emoji": "🎯", "title": "Deep sleep recovery", "detail": "Adaptogens targeting your cortisol pattern" },
    { "emoji": "⚡", "title": "Activity timing", "detail": "Leveraging the 7k+ step → deep sleep connection" },
    { "emoji": "🧪", "title": "Cortisol + DHEA-S panel", "detail": "Confirming the stress-sleep hypothesis" }
  ],
  "ctaQuestions": [
    "Why is my deep sleep dropping?",
    "What should I do about cortisol?",
    "How do I use the activity-sleep link?"
  ],
  "summary": "Strong recovery, solid heart rate — but deep sleep needs attention. Everything points to a stress-cortisol axis."
}
```

## Slide Sequence

For each report, the flow renders this sequence:

1. **Title slide** — source icon, report title, data source badges
2. **For each metric:** metric slide (animated number, identity headline, status tag) → connection slide (big headline, body, callout)
3. **Correlation slide** (if present) → correlation connection slide
4. **What's next slide** — protocol focus areas
5. **CTA slide** — summary + 2-3 pre-loaded question buttons

## Slide Design

### Metric slides
- Full-screen gradient background (color per status: teal=healthy, green=good, vermillion=alert, indigo=neutral)
- **Animated count-up** from 0 to value over ~1.5s
- Large number with unit in center
- **Identity headline** below (e.g., "You're a fast recoverer")
- **Status tag** — small pill below headline, color-coded: green "Strong", vermillion "Declining", teal "Healthy"
- Continue button (glass morphism)

### Connection slides
- Same gradient as preceding metric (visual continuity)
- Source pills at top with connecting "+" between them
- **Big headline first** — large type, centered, emotionally resonant
- Body text below — 2-3 sentences, readable size
- Callout card at bottom — glass card with label + detail
- Continue button

### Correlation slide
- Purple gradient
- Two nodes with emoji + label, animated arrow between them
- Identity headline ("Movement is your sleep medicine")
- One-line supporting stat

### CTA slide
- Dark gradient with subtle warm glow
- Sparkle icon
- Summary text
- **2-3 pre-loaded question buttons** — each navigates to `/concierge` with `defaultMessage` set to the question

### Share functionality
- Slides with `status: "good"` or `status: "healthy"` show a share icon in the top-right
- Tapping generates a branded card (gradient + metric + identity headline + Superpower wordmark)
- Opens native share sheet or copies to clipboard

## Animations (framer-motion)

- **Count-up numbers:** `useCountUp` hook, easing ease-out, 1.5s duration
- **Ring/arc draw:** SVG stroke-dashoffset animated from full to target
- **Gradient background:** subtle hue shift via CSS animation (slow, 10s cycle)
- **Source pills:** stagger animation, fade-in + slide-up, 0.1s delay between each
- **Progressive disclosure on connection slides:** headline fades in first (0.3s), then body (0.5s delay), then callout (0.8s delay)
- **Slide transitions:** horizontal slide with spring physics via framer-motion AnimatePresence
- **Alert slide down-arrow:** continuous bob animation with increasing urgency

## Data Flow

1. Report generation fires `POST /chat/chatv2` with updated prompt requesting JSON
2. Polling extracts the JSON from the assistant response (parse from code fence or raw JSON)
3. Parsed report stored in `report-store` alongside `threadId`, `status`, `title`
4. `/reports/{sourceId}` route reads from `report-store`, renders the Wrapped flow
5. CTA questions navigate to `/concierge` with `defaultMessage`

## Report Store Extension

Add `parsedReport` field to `ReportEntry`:

```typescript
interface ReportEntry {
  threadId: string;
  status: 'generating' | 'ready';
  title: string | null;
  parsedReport: ParsedReport | null;
}
```

## Files to Create

| File | What |
|------|------|
| `src/features/reports/components/report-wrapped-flow.tsx` | Main Wrapped flow component |
| `src/features/reports/components/slides/metric-slide.tsx` | Metric slide with count-up animation |
| `src/features/reports/components/slides/connection-slide.tsx` | Connection insight slide |
| `src/features/reports/components/slides/correlation-slide.tsx` | Correlation visual slide |
| `src/features/reports/components/slides/title-slide.tsx` | Title/intro slide |
| `src/features/reports/components/slides/next-steps-slide.tsx` | What's next slide |
| `src/features/reports/components/slides/cta-slide.tsx` | Final CTA with pre-loaded questions |
| `src/features/reports/components/share-card.tsx` | Share card generation |
| `src/features/reports/hooks/use-count-up.ts` | Animated count-up hook |
| `src/features/reports/types.ts` | ParsedReport type definitions |
| `src/routes/_app.reports.$sourceId.tsx` | Route definition |

## Files to Modify

| File | Change |
|------|------|
| `src/features/homepage/cards/insight-carousel-card.tsx` | Link to `/reports/{sourceId}` instead of `/concierge/{threadId}` |
| `src/features/onboarding-circle/stores/report-store.ts` | Add `parsedReport` to ReportEntry |
| `src/features/homepage/hooks/use-report-polling.ts` | Parse JSON from AI response, update prompt to request JSON |

## Out of Scope

- Sound/haptic feedback
- Offline caching of reports
- Report versioning/history
- Parallax depth effects (nice-to-have, add later)
