# Onboarding Circle v2 — Design Spec

**Date:** 2026-04-01 | **Status:** Draft | **Type:** Redesign of prototype feature

## Problem

Same as v1: new members wait 5-10 days for lab results with nothing to do. The v1 implementation used a custom SVG radial ring that was off-brand — wrong typography, emoji icons, card styles that didn't match the app's design system.

## Solution

Replace the v1 ring-based UI with a compact header + checklist pattern that matches the app's existing design language. Reuses patterns from `checklist-step.tsx` (vermillion active indicator, border treatments), `suggested-actions.tsx` (card dimensions, shadow, chevron), and the app's typography components.

## Integration Point

Same as v1: `ChatView` in `chat.tsx`. The `OnboardingCircle` component replaces `SuggestedActions` when not all sources are complete.

## File Changes

| Action | File | What |
|--------|------|------|
| **Rewrite** | `components/onboarding-circle.tsx` | New root component: header card + item list |
| **Rewrite** | `components/source-card.tsx` | Compact row item with Lucide icons |
| **Modify** | `components/source-detail-modal.tsx` | Use typography components + Lucide icons |
| **Delete** | `components/progress-ring.tsx` | SVG ring no longer needed |
| **Delete** | `components/primer-banner.tsx` | Replaced by header completion state |
| **Keep** | `const/sources.ts` | Update icons from emoji to Lucide component names |
| **Keep** | `stores/onboarding-circle-store.ts` | No changes |

## Component Design

### OnboardingCircle (root)

A `max-w-[548px] mx-auto w-full` flex column with `gap-1.5`. Two parts:

#### Header Card

`rounded-2xl border border-zinc-200 bg-white p-4 shadow-lg shadow-black/5` — matches SuggestedActions card style.

Layout: `flex items-center gap-3`

- **Left:** Vermillion active indicator — the spinning dots SVG from `checklist-step.tsx` (44px circle with rotating orange dots animation). Switches to a static green check circle when all 4 complete.
- **Center (flex-1):**
  - `H4`: "Complete your health profile"
  - `Body3 text-zinc-400`: "1 of 4 sources connected"
- **Right:** Segmented progress bar — 4 rounded segments (`h-1.5 w-6 rounded-full`), vermillion when filled, zinc-100 when empty. `gap-1` between segments.

**Completed state:**
- Static green check circle replaces spinning indicator
- `H4`: "Your health profile is complete"
- `Body3 text-zinc-400`: "Your data is ready to power better insights"
- All 4 segments vermillion

#### Item List

`flex flex-col gap-1.5` below the header. Each item is a `SourceRow`.

### SourceRow

A button element, `rounded-2xl border p-3`. Layout: `flex items-center gap-3`

```
[36px icon]  [flex-1: title + subtitle]  [badge]  [chevron]
```

**Three visual states:**

**1. Next action (first incomplete item):**
- `border-vermillion-900 outline outline-2 outline-vermillion-900/20 bg-white`
- Lucide icon (e.g., `Watch`) in a 36px `rounded-lg` container with source color at 7% opacity, icon stroke in source color
- `Body2 font-medium text-zinc-900` title
- `Body3 text-zinc-400` subtitle (e.g., "Apple Health, Oura, Whoop")
- `Body3` badge in `rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-400`: "2 min"
- `ChevronRight` size 14, `text-zinc-400`
- Hover: `hover:bg-zinc-50`

**2. Pending (not next):**
- `border-zinc-200 bg-white`
- Same layout as next action but no vermillion border/outline
- `opacity-60` on the entire row to de-emphasize
- Hover: `hover:opacity-100 hover:bg-zinc-50`

**3. Completed:**
- `border-zinc-200 bg-zinc-50`
- Icon container gets a small green `Check` icon overlay (size 14, positioned bottom-right of the icon container)
- Title stays as `Body2 font-medium text-zinc-900`
- Subtitle replaced with one-line insight teaser: `Body3 text-zinc-400` (e.g., "Focus areas: hormonal balance, energy, metabolic health")
- Badge: `rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-600 Body3`: "Done"
- No chevron
- Clicking still opens modal to show full early insight

### Source Icons (Lucide)

| Source | Lucide Icon | Color |
|--------|------------|-------|
| Health Intake | `ClipboardList` | `#FC5F2B` |
| Wearables | `Watch` | `#3b82f6` |
| AI Context | `BrainCircuit` | `#a855f7` |
| Lab Uploads | `TestTubes` | `#11c182` |

Icon container: `size-9 rounded-lg flex items-center justify-center` with `background: {color}07` (7% opacity of source color). Icon rendered at size 18 with `stroke={color}`.

### SourceDetailModal (updated)

Same structure as v1 but with design system alignment:

- Header icon: Lucide icon in 52px container (same tint pattern)
- Title: `H4` instead of raw `text-lg font-semibold`
- Subtitle: `Body3 text-zinc-400`
- Description: `Body2 text-zinc-500`
- "What to do" section: same rounded-xl bg-zinc-50 card
- Benefit icons: Lucide icons instead of emoji (generic ones like `Sparkles`, `Heart`, `BarChart3`)
- Benefit title: `Body3 font-semibold text-zinc-900`
- Benefit description: `Body3 text-zinc-500`
- CTA button: existing `Button` component from `@/components/ui/button`, full width

### Dev Controls

Small floating panel, bottom-right, `fixed bottom-6 right-6 z-50`. Only rendered when `process.env.NODE_ENV === 'development'` or a `__dev` query param is present.

- `rounded-xl border border-zinc-200 bg-white p-2 shadow-lg` container
- 4 small toggle buttons (one per source) + a reset button
- `Body3` labels, compact sizing

## Source Config Updates

Update `sources.ts`:
- Remove `icon` (emoji string) field
- Add `iconName` field: `'clipboard-list' | 'watch' | 'brain-circuit' | 'test-tubes'`
- Remove `colorBg` — compute from `colorFrom` + opacity at render time
- Add `insightTeaser` field — short one-line version of the early insight for the completed row state

**Insight teasers:**
| Source | Teaser |
|--------|--------|
| Health Intake | Focus areas: hormonal balance, energy, metabolic health |
| Wearables | Resting HR 62 bpm, sleep efficiency 87% |
| AI Context | 3 themes: fatigue, thyroid function, vitamin D |
| Lab Uploads | Declining vitamin D, rising LDL over 2 years |

## Animations

Minimal — use what the app already does:
- `animate-in fade-in slide-in-from-bottom-2` on card mount (from SuggestedActions pattern)
- `transition-all duration-300` on border/opacity changes
- Spinning dots on active indicator (`animate-spin` with `animationDuration: 4s` from checklist-step)
- Staggered entry: 50ms delay between items
- Toast on completion (existing sonner)

No framer-motion needed for the item list. The active indicator uses CSS `animate-spin`. Keep framer-motion only for the header entrance animation.

## What Gets Deleted

- `components/progress-ring.tsx` — entire file
- `components/primer-banner.tsx` — entire file
- `CelebrationParticles` function in `onboarding-circle.tsx`
- All SVG arc math, gradient defs, glow filters
- Shimmer keyframe added to tailwind config (if only used here)

## Dependencies

- `lucide-react` (already in project)
- `@/components/ui/typography` — `H4`, `Body2`, `Body3`
- `@/components/ui/button` — for modal CTA
- `@/components/ui/dialog` — same as v1
- `@/lib/utils` — `cn()`
- `zustand` store — unchanged from v1
- `sonner` toast — unchanged
- `framer-motion` — only for header entrance, could remove entirely

## Out of Scope

- Dashboard homepage integration (separate effort)
- Real completion state from APIs
- Primer report content
- Server-side state persistence
