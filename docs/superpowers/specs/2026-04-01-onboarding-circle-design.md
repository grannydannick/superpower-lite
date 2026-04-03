# Onboarding Circle — Design Spec

**Date:** 2026-04-01 | **Status:** Draft | **Type:** Prototype feature

## Problem

New members complete checkout and wait 5-10 days for lab results with nothing to do. Members who don't interact in the first week churn at 2x the rate. There's no structured way to collect the data that makes their first results review useful.

## Solution

A radial progress hub that replaces the existing `SuggestedActions` cards in the concierge empty-chat state. It gamifies pre-lab onboarding into 4 data-collection steps, each filling an arc segment, delivering an "early insight," and contributing toward unlocking a richer first-results experience.

## Integration Point

**File:** `src/features/messages/components/ai/chat.tsx`, `ChatView` component (~line 1059).

Replace the `SuggestedActions` block inside the `messages.length === 0` conditional with `<OnboardingCircle />`. When all 4 sources are complete and the user dismisses the circle, fall back to the original `SuggestedActions`.

The `Greeting` component above stays as-is — the circle renders below it in the same flex column.

## File Structure

```
src/features/onboarding-circle/
├── components/
│   ├── onboarding-circle.tsx       # Root — composes ring, cards, primer
│   ├── progress-ring.tsx           # SVG circle with 4 animated arc segments
│   ├── source-card.tsx             # Individual data source card
│   ├── source-detail-modal.tsx     # Radix Dialog — why / what / get + CTA
│   └── primer-banner.tsx           # Locked/unlocked primer state
├── stores/
│   └── onboarding-circle-store.ts  # Zustand + localStorage persist
└── const/
    └── sources.ts                  # Static config for the 4 sources
```

## Data Sources

| Source | ID | Auto-complete | CTA Action | Time Estimate |
|--------|----|---------------|------------|---------------|
| Health Intake | `intake` | Yes (always pre-completed) | N/A | — |
| Wearables | `wearables` | No | Navigate to `/settings?tab=integrations` | 2 min |
| AI Health Context | `ai-context` | No | Navigate to `/concierge?preset=import-memory` | 3 min |
| Lab Uploads | `labs` | No | Navigate to `/concierge?preset=upload-labs` | 5 min |

## State Management

Zustand store persisted to `localStorage` key `onboarding-circle`:

```ts
interface OnboardingCircleState {
  completedSources: Set<SourceId>  // initial: Set(['intake'])
  complete: (source: SourceId) => void
  reset: () => void
}
```

All state is mocked/local for this prototype — no API calls to check real completion.

## Component Details

### OnboardingCircle (root)

Composes all sub-components in a vertical flex column:
1. `ProgressRing` — the SVG circle
2. Tagline — "Connect your data to unlock **early insights**"
3. Label chips — row of small pills with colored dots
4. Section header — "Your data sources" + "X of 4"
5. `SourceCard` x4
6. `PrimerBanner`

Wrapped in a framer-motion `AnimatePresence` for mount/unmount transitions.

### ProgressRing

SVG `viewBox="0 0 260 260"` with:
- 4 track arcs (light gray, `stroke-width: 18`, `stroke-linecap: round`)
- 4 fill arcs on top (gradient strokes, same geometry)
- 8-degree gap between arcs
- Icon circles at arc midpoints (emoji in a tinted circle)
- Center: countdown number (Society italic, large) — hardcoded to "5" for prototype, "days left" label, 4 progress pips

**Arc colors (gradients):**
- Intake: `#FC5F2B` -> `#ff8a65` (vermillion)
- Wearables: `#3b82f6` -> `#60a5fa` (blue)
- AI Context: `#a855f7` -> `#c084fc` (purple)
- Labs: `#11c182` -> `#34d399` (green)

**States per arc:**
- Pending: 18% opacity, no glow filter
- Completed: 100% opacity, SVG gaussian blur glow filter in arc color
- Hover (pending): 55% opacity, stroke-width bumps to 22
- Hover (completed): brightness bump via filter

**Mount animation:** Each arc draws in via `stroke-dashoffset` transition, staggered 150ms apart.

**Completion animation:** Arc sweeps from 0 to full with a 600ms ease-out, icon circle scales up with a spring, progress pip bounces in.

### SourceCard

Border card (`rounded-xl`, `border border-zinc-200`) with:
- Left: colored icon container (42x42, rounded-lg, tinted background) + title + subtitle
- Right: badge — "2 min" (pending) or "Complete" (done, green tint)
- Clicking opens `SourceDetailModal`

**States:**
- Default: white bg, zinc border
- Hover: border darkens, subtle shadow, micro-lift (`translateY(-1px)`)
- Complete: green-tinted border (`rgba(17,193,130,0.25)`), gradient overlay. Body/CTA hidden, insight block shown instead.
- Highlight (after arc click): brand border + brand ring shadow, 1.2s duration

**Insight block** (shown when complete): Green-tinted rounded container with "EARLY INSIGHT" tag + insight text. Fades in with upward slide on completion.

**Card entrance:** Staggered fade-up on mount, 100ms delay between each.

### SourceDetailModal

Radix `Dialog` (existing component in the project). Content:

1. **Header**: Large icon (52x52) + title + subtitle
2. **Why this is valuable**: 1-2 sentence explanation
3. **What to do**: Specific instruction for the user
4. **What you'll get**: 3 benefit rows (icon + title + description)
5. **CTA button**: Full-width, dark bg, navigates based on source type

Backdrop uses `backdrop-blur(4px)` consistent with existing app overlays.

On CTA click:
1. Mark source as complete in store
2. Close modal
3. Fire toast notification via existing `sonner`
4. Navigate to the appropriate destination

### PrimerBanner

**Locked state** (< 4 complete):
- Dashed border, muted background
- Title: "Pre-Protocol Primer"
- Subtitle: "Connect X more sources to unlock your health overview."
- 4 progress pips (brand-colored when filled)

**Unlocked state** (all 4 complete):
- Solid brand border, warm gradient background (`#FFF8F5` -> white)
- Outer glow: `box-shadow: 0 0 0 4px rgba(252,95,43,0.06), 0 8px 32px rgba(252,95,43,0.08)`
- Title: "Your Pre-Protocol Primer is ready"
- Shimmer animation across the surface (CSS `@keyframes` — moving linear-gradient, similar to `DuneGradient` shimmer)
- CTA button: brand-colored "View your primer ->"

**Transition:** Animates from locked to unlocked with a 500ms ease — border goes solid, background shifts, glow fades in.

## Visual Polish

### Animations (framer-motion)

| Element | Trigger | Animation |
|---------|---------|-----------|
| Arc segments | Mount | Staggered stroke-dashoffset draw-in, 150ms apart |
| Arc segment | Completion | 600ms sweep fill + glow fade-in |
| Arc icon | Completion | Spring scale pulse (1 -> 1.2 -> 1) |
| Progress pips | State change | `cubic-bezier(0.34, 1.56, 0.64, 1)` bounce-in |
| Source cards | Mount | Staggered fade-up, 100ms apart |
| Card insight | Completion | Fade in + 8px upward slide, 300ms |
| Primer banner | All complete | 500ms border/bg/glow transition |
| Primer shimmer | All complete | Continuous moving highlight |
| Celebration | All complete | CSS particle burst from circle center |

### Celebration Effect

When the 4th source completes: ~10 small colored dots (using the 4 source colors) burst outward from the circle center, scale up, and fade out over 800ms. Pure CSS with `@keyframes` — no library needed.

### Typography

- Countdown number: `font-sans` italic (Society) at `text-5xl`, tight letter-spacing
- Section headers: `font-semibold text-[15px]` with `-0.02em` tracking
- Card titles: `font-semibold text-[15px]`
- Body text: `text-[13px] text-zinc-500`
- Badges: `text-[11px] font-medium`
- Insight tag: `text-[10px] font-bold uppercase tracking-widest`

### Spacing

Generous vertical rhythm — `gap-6` between major sections (ring, cards, primer). Cards use `gap-2.5` between them. Inner card padding `p-4.5`. The whole component sits within `max-w-3xl mx-auto` matching the existing chat width.

### Circle Center Ambient

Subtle radial gradient behind the countdown that intensifies as sources complete:
- 0 complete: transparent
- 1-2: very faint warm glow
- 3-4: soft brand-tinted radial from center

### Text Gradient

"early insights" in the tagline uses a `bg-gradient-to-r from-vermillion to-amber bg-clip-text text-transparent` treatment.

## Source Content

### Health Intake
- **Icon:** clipboard emoji or Lucide `ClipboardList`
- **Early insight:** "Based on your profile, your top focus areas are **hormonal balance**, **energy optimization**, and **metabolic health**. Your upcoming labs will test 12 biomarkers directly related to these."

### Wearables
- **Modal — Why:** "Wearable data adds real-time context — sleep quality, recovery patterns, heart rate trends that lab results alone can't show."
- **Modal — What to do:** "Connect your Apple Health, Oura, Whoop, or other wearable from the integrations page."
- **Modal — What you'll get:** Sleep/recovery insights correlated with cortisol. Cardiovascular context alongside lipid markers. Continuous monitoring as protocols take effect.
- **Early insight:** "Your resting heart rate averages **62 bpm** with solid HRV. Sleep efficiency is **87%**, but deep sleep has declined 12% this month — worth watching alongside cortisol levels."

### AI Health Context
- **Modal — Why:** "Health conversations with ChatGPT or Claude contain valuable context — symptoms you've researched, questions asked, patterns noticed."
- **Modal — What to do:** "Import health conversations from AI assistants. We'll extract symptoms, research themes, and concerns."
- **Modal — What you'll get:** Recurring health themes mapped to biomarkers. No cold start for your AI coach. Full context from day one.
- **Early insight:** "Found **3 recurring themes** in your conversations: fatigue and energy levels, thyroid function, and vitamin D. Your panel includes targeted markers for each."

### Lab Uploads
- **Modal — Why:** "Past blood work gives historical baseline — identify trends, track changes, and compare with your upcoming panel."
- **Modal — What to do:** "Upload PDFs or photos of previous blood work from any provider (Quest, Labcorp, etc.)."
- **Modal — What you'll get:** Historical trend lines. Deeper interpretation that catches patterns a single test misses. Any format works.
- **Early insight:** "Previous results show **declining vitamin D** (42 -> 31 ng/mL) and **rising LDL** over two years. We'll track both closely and factor trends into your protocol."

## Dependencies

- `framer-motion` (already in project)
- `zustand` (already in project)
- Radix `Dialog` (already in `src/components/ui/`)
- `sonner` toast (already in project)
- `cn()` utility (already in project)
- TanStack Router `useNavigate` (already in project)

No new dependencies required.

## Out of Scope

- Real completion state from APIs (this is a mocked prototype)
- Actual primer report content
- Mobile-specific bottom sheet (uses Dialog on all viewports)
- Persisting state server-side
