# Onboarding Circle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a radial progress hub that replaces the concierge empty-state cards, gamifying pre-lab onboarding into 4 data-collection steps with polished animations and modals.

**Architecture:** Feature module at `src/features/onboarding-circle/` with Zustand store (localStorage-persisted), static source config, and 5 React components. Integrates into `ChatView` by conditionally rendering `<OnboardingCircle />` in place of `<SuggestedActions />`. All state is mocked locally.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, framer-motion (`m` alias), Zustand + persist, Radix Dialog, sonner toast, TanStack Router `useNavigate`.

---

## File Map

| File | Responsibility |
|------|---------------|
| **Create:** `src/features/onboarding-circle/const/sources.ts` | Static config for the 4 data sources — IDs, labels, colors, modal content, early insights |
| **Create:** `src/features/onboarding-circle/stores/onboarding-circle-store.ts` | Zustand store with Set<SourceId> persisted to localStorage |
| **Create:** `src/features/onboarding-circle/components/progress-ring.tsx` | SVG circle with 4 animated arc segments + center countdown |
| **Create:** `src/features/onboarding-circle/components/source-card.tsx` | Individual data source card with pending/complete states |
| **Create:** `src/features/onboarding-circle/components/source-detail-modal.tsx` | Radix Dialog with why/what/get sections + CTA |
| **Create:** `src/features/onboarding-circle/components/primer-banner.tsx` | Locked/unlocked primer banner with progress pips |
| **Create:** `src/features/onboarding-circle/components/onboarding-circle.tsx` | Root component composing all sub-components |
| **Modify:** `src/features/messages/components/ai/chat.tsx:1059-1071` | Swap SuggestedActions for OnboardingCircle in empty state |

---

### Task 1: Source Config and Store

**Files:**
- Create: `src/features/onboarding-circle/const/sources.ts`
- Create: `src/features/onboarding-circle/stores/onboarding-circle-store.ts`

- [ ] **Step 1: Create the source config**

```ts
// src/features/onboarding-circle/const/sources.ts

export type SourceId = 'intake' | 'wearables' | 'ai-context' | 'labs';

export interface SourceModalContent {
  whyValuable: string;
  whatToDo: string;
  benefits: { icon: string; title: string; description: string }[];
}

export interface SourceConfig {
  id: SourceId;
  label: string;
  icon: string;
  colorFrom: string;
  colorTo: string;
  colorBg: string;
  timeEstimate: string | null;
  autoComplete: boolean;
  ctaLabel: string;
  ctaAction:
    | { type: 'navigate'; to: string; search?: Record<string, string> }
    | { type: 'none' };
  modal: SourceModalContent;
  earlyInsight: string;
}

export const SOURCES: SourceConfig[] = [
  {
    id: 'intake',
    label: 'Intake',
    icon: '\u{1F4CB}',
    colorFrom: '#FC5F2B',
    colorTo: '#ff8a65',
    colorBg: 'rgba(252,95,43,0.07)',
    timeEstimate: null,
    autoComplete: true,
    ctaLabel: 'Review your intake',
    ctaAction: { type: 'none' },
    modal: {
      whyValuable:
        'Your health questionnaire gives us a baseline — symptoms, goals, medical history, and lifestyle factors that shape your protocol.',
      whatToDo:
        'Already done! Your intake was completed during onboarding.',
      benefits: [
        {
          icon: '\u{1F3AF}',
          title: 'Personalized focus areas',
          description:
            'We identify which biomarkers matter most for your goals',
        },
        {
          icon: '\u26A1',
          title: 'Faster protocol generation',
          description:
            'More context means more targeted recommendations',
        },
        {
          icon: '\u{1F512}',
          title: 'Clinical-grade privacy',
          description:
            'Encrypted and only used for your personalization',
        },
      ],
    },
    earlyInsight:
      'Based on your profile, your top focus areas are **hormonal balance**, **energy optimization**, and **metabolic health**. Your upcoming labs will test 12 biomarkers directly related to these.',
  },
  {
    id: 'wearables',
    label: 'Wearables',
    icon: '\u231A',
    colorFrom: '#3b82f6',
    colorTo: '#60a5fa',
    colorBg: 'rgba(59,130,246,0.07)',
    timeEstimate: '2 min',
    autoComplete: false,
    ctaLabel: 'Connect a wearable',
    ctaAction: {
      type: 'navigate',
      to: '/settings',
      search: { tab: 'integrations' },
    },
    modal: {
      whyValuable:
        'Wearable data adds real-time context — sleep quality, recovery patterns, heart rate trends that lab results alone can\u2019t show.',
      whatToDo:
        'Connect your Apple Health, Oura, Whoop, or other wearable from the integrations page.',
      benefits: [
        {
          icon: '\u{1F634}',
          title: 'Sleep and recovery insights',
          description:
            'Correlate sleep patterns with cortisol and testosterone levels',
        },
        {
          icon: '\u2764\uFE0F',
          title: 'Cardiovascular context',
          description:
            'Resting heart rate and HRV alongside lipid markers',
        },
        {
          icon: '\u{1F4CA}',
          title: 'Continuous monitoring',
          description:
            'Track how protocol changes affect daily metrics',
        },
      ],
    },
    earlyInsight:
      'Your resting heart rate averages **62 bpm** with solid HRV. Sleep efficiency is **87%**, but deep sleep has declined 12% this month \u2014 worth watching alongside cortisol levels.',
  },
  {
    id: 'ai-context',
    label: 'AI context',
    icon: '\u{1F9E0}',
    colorFrom: '#a855f7',
    colorTo: '#c084fc',
    colorBg: 'rgba(168,85,247,0.07)',
    timeEstimate: '3 min',
    autoComplete: false,
    ctaLabel: 'Import conversations',
    ctaAction: {
      type: 'navigate',
      to: '/concierge',
      search: { preset: 'import-memory' },
    },
    modal: {
      whyValuable:
        'Health conversations with ChatGPT or Claude contain valuable context \u2014 symptoms you\u2019ve researched, questions asked, patterns noticed.',
      whatToDo:
        'Import health conversations from AI assistants. We\u2019ll extract symptoms, research themes, and concerns.',
      benefits: [
        {
          icon: '\u{1F50D}',
          title: 'Extract health themes',
          description:
            'Recurring concerns mapped to relevant biomarkers',
        },
        {
          icon: '\u{1F91D}',
          title: 'No cold start',
          description:
            'Your AI coach starts with full context from day one',
        },
        {
          icon: '\u{1F4CE}',
          title: 'Simple export',
          description:
            "Copy-paste or use ChatGPT's built-in export",
        },
      ],
    },
    earlyInsight:
      'Found **3 recurring themes** in your conversations: fatigue and energy levels, thyroid function, and vitamin D. Your panel includes targeted markers for each.',
  },
  {
    id: 'labs',
    label: 'Lab uploads',
    icon: '\u{1F9EA}',
    colorFrom: '#11c182',
    colorTo: '#34d399',
    colorBg: 'rgba(17,193,130,0.07)',
    timeEstimate: '5 min',
    autoComplete: false,
    ctaLabel: 'Upload lab results',
    ctaAction: {
      type: 'navigate',
      to: '/concierge',
      search: { preset: 'upload-labs' },
    },
    modal: {
      whyValuable:
        'Past blood work gives historical baseline \u2014 identify trends, track changes, and compare with your upcoming panel.',
      whatToDo:
        'Upload PDFs or photos of previous blood work from any provider (Quest, Labcorp, etc.).',
      benefits: [
        {
          icon: '\u{1F4C8}',
          title: 'Trend analysis',
          description:
            'See how biomarkers changed over months or years',
        },
        {
          icon: '\u{1F52C}',
          title: 'Deeper interpretation',
          description:
            'Historical context catches patterns a single test misses',
        },
        {
          icon: '\u{1F4C4}',
          title: 'Any format works',
          description:
            'PDFs from Quest, Labcorp, or any provider',
        },
      ],
    },
    earlyInsight:
      'Previous results show **declining vitamin D** (42 \u2192 31 ng/mL) and **rising LDL** over two years. We\u2019ll track both closely and factor trends into your protocol.',
  },
];
```

- [ ] **Step 2: Create the Zustand store**

Follow the pattern from `src/features/onboarding/stores/onboarding-cart-store.ts` — use `persist` with `partialize` for Set serialization and `merge` for deserialization.

```ts
// src/features/onboarding-circle/stores/onboarding-circle-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { SourceId } from '../const/sources';

interface OnboardingCircleState {
  completedSources: Set<SourceId>;
  complete: (source: SourceId) => void;
  reset: () => void;
}

interface OnboardingCirclePersistedState {
  completedSources: string[];
}

const VALID_SOURCE_IDS = new Set<string>([
  'intake',
  'wearables',
  'ai-context',
  'labs',
]);

export const useOnboardingCircleStore = create<OnboardingCircleState>()(
  persist(
    (set) => ({
      completedSources: new Set<SourceId>(['intake']),
      complete: (source) =>
        set((state) => {
          if (state.completedSources.has(source)) return state;
          const next = new Set(state.completedSources);
          next.add(source);
          return { completedSources: next };
        }),
      reset: () =>
        set(() => ({ completedSources: new Set<SourceId>(['intake']) })),
    }),
    {
      name: 'onboarding-circle',
      partialize: (state): OnboardingCirclePersistedState => ({
        completedSources: Array.from(state.completedSources),
      }),
      merge: (persistedState, currentState) => {
        const completedSources: SourceId[] = ['intake'];
        if (
          typeof persistedState === 'object' &&
          persistedState !== null &&
          'completedSources' in persistedState
        ) {
          const maybe = persistedState.completedSources;
          if (Array.isArray(maybe)) {
            for (const id of maybe) {
              if (typeof id === 'string' && VALID_SOURCE_IDS.has(id)) {
                completedSources.push(id as SourceId);
              }
            }
          }
        }
        return {
          ...currentState,
          completedSources: new Set(completedSources),
        };
      },
    },
  ),
);
```

- [ ] **Step 3: Verify no lint errors**

Run: `cd /Users/dannygrannick/superpower-dev/react-app && bunx oxlint src/features/onboarding-circle/const/sources.ts src/features/onboarding-circle/stores/onboarding-circle-store.ts`

- [ ] **Step 4: Commit**

```bash
git add src/features/onboarding-circle/const/sources.ts src/features/onboarding-circle/stores/onboarding-circle-store.ts
git commit -m "feat(onboarding-circle): add source config and zustand store"
```

---

### Task 2: Progress Ring SVG

**Files:**
- Create: `src/features/onboarding-circle/components/progress-ring.tsx`

- [ ] **Step 1: Create the progress ring component**

This component renders a 260x260 SVG with 4 arc segments, gradient defs, glow filters, icon circles at midpoints, and a center countdown. Arcs animate on mount via stroke-dashoffset and on completion via opacity/glow transitions.

```tsx
// src/features/onboarding-circle/components/progress-ring.tsx

import { m } from 'framer-motion';
import { useEffect, useState } from 'react';

import { SOURCES, type SourceId } from '../const/sources';

const CX = 130;
const CY = 130;
const R = 105;
const GAP_DEG = 8;
const ARC_SPAN = (360 - GAP_DEG * 4) / 4;
const STROKE_WIDTH = 18;

function polarToCart(angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [CX + R * Math.cos(rad), CY + R * Math.sin(rad)] as const;
}

function arcPath(startAngle: number, endAngle: number) {
  const [x1, y1] = polarToCart(startAngle);
  const [x2, y2] = polarToCart(endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`;
}

function midPoint(startAngle: number, endAngle: number) {
  const mid = (startAngle + endAngle) / 2;
  const rad = ((mid - 90) * Math.PI) / 180;
  return [CX + (R + 28) * Math.cos(rad), CY + (R + 28) * Math.sin(rad)] as const;
}

function arcLength(startAngle: number, endAngle: number) {
  return ((endAngle - startAngle) / 360) * 2 * Math.PI * R;
}

interface ArcDef {
  id: SourceId;
  start: number;
  end: number;
}

const ARCS: ArcDef[] = SOURCES.map((_, i) => ({
  id: SOURCES[i].id,
  start: GAP_DEG / 2 + i * (ARC_SPAN + GAP_DEG),
  end: GAP_DEG / 2 + ARC_SPAN + i * (ARC_SPAN + GAP_DEG),
}));

interface ProgressRingProps {
  completedSources: Set<SourceId>;
  onArcClick: (source: SourceId) => void;
}

export function ProgressRing({ completedSources, onArcClick }: ProgressRingProps) {
  const [mounted, setMounted] = useState(false);
  const completedCount = completedSources.size;

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="relative mx-auto h-[260px] w-[260px]">
      <svg viewBox="0 0 260 260" className="size-full">
        <defs>
          {SOURCES.map((s) => (
            <linearGradient
              key={`g-${s.id}`}
              id={`g-${s.id}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={s.colorFrom} />
              <stop offset="100%" stopColor={s.colorTo} />
            </linearGradient>
          ))}
          {SOURCES.map((s) => (
            <filter
              key={`glow-${s.id}`}
              id={`glow-${s.id}`}
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feFlood floodColor={s.colorFrom} floodOpacity="0.3" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="shadow" />
              <feMerge>
                <feMergeNode in="shadow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {/* Track arcs */}
        {ARCS.map((arc) => (
          <path
            key={`track-${arc.id}`}
            d={arcPath(arc.start, arc.end)}
            fill="none"
            stroke="#f0eeeb"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
          />
        ))}

        {/* Fill arcs */}
        {ARCS.map((arc, i) => {
          const done = completedSources.has(arc.id);
          const len = arcLength(arc.start, arc.end);
          return (
            <path
              key={`fill-${arc.id}`}
              d={arcPath(arc.start, arc.end)}
              fill="none"
              stroke={`url(#g-${arc.id})`}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              filter={done ? `url(#glow-${arc.id})` : undefined}
              opacity={done ? 1 : 0.18}
              strokeDasharray={len}
              strokeDashoffset={mounted ? 0 : len}
              className="cursor-pointer transition-opacity duration-500 hover:opacity-55"
              style={{
                transition: `stroke-dashoffset ${600 + i * 150}ms cubic-bezier(0.4, 0, 0.2, 1), opacity 500ms ease, filter 300ms ease`,
                ...(done ? { opacity: 1 } : {}),
              }}
              onClick={() => onArcClick(arc.id)}
            />
          );
        })}

        {/* Icon circles at midpoints */}
        {ARCS.map((arc) => {
          const [mx, my] = midPoint(arc.start, arc.end);
          const source = SOURCES.find((s) => s.id === arc.id)!;
          return (
            <g
              key={`icon-${arc.id}`}
              className="cursor-pointer"
              onClick={() => onArcClick(arc.id)}
            >
              <circle
                cx={mx}
                cy={my}
                r={15}
                fill={source.colorFrom}
                fillOpacity={completedSources.has(arc.id) ? 0.15 : 0.08}
                className="transition-all duration-250"
              />
              <text
                x={mx}
                y={my}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="14"
                className="pointer-events-none"
              >
                {source.icon}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Center content */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 w-[140px] -translate-x-1/2 -translate-y-1/2 text-center">
        <m.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="font-sans text-5xl font-light italic leading-none tracking-tight text-zinc-900">
            5
          </div>
          <div className="mt-0.5 text-[11px] font-medium uppercase tracking-widest text-zinc-400">
            days left
          </div>
        </m.div>
        <div className="mt-3 flex justify-center gap-[5px]">
          {[0, 1, 2, 3].map((i) => (
            <m.div
              key={i}
              className="size-1.5 rounded-full"
              initial={{ scale: 0 }}
              animate={{
                scale: 1,
                backgroundColor:
                  i < completedCount ? '#FC5F2B' : '#e0ded9',
              }}
              transition={{
                delay: 0.5 + i * 0.1,
                type: 'spring',
                stiffness: 400,
                damping: 15,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify no lint errors**

Run: `cd /Users/dannygrannick/superpower-dev/react-app && bunx oxlint src/features/onboarding-circle/components/progress-ring.tsx`

- [ ] **Step 3: Commit**

```bash
git add src/features/onboarding-circle/components/progress-ring.tsx
git commit -m "feat(onboarding-circle): add animated SVG progress ring"
```

---

### Task 3: Source Card

**Files:**
- Create: `src/features/onboarding-circle/components/source-card.tsx`

- [ ] **Step 1: Create the source card component**

Card shows pending state (with time estimate badge + description) or complete state (with early insight). Clicking opens the detail modal. Uses framer-motion for entrance stagger and completion transitions.

```tsx
// src/features/onboarding-circle/components/source-card.tsx

import { m } from 'framer-motion';

import { cn } from '@/lib/utils';

import type { SourceConfig } from '../const/sources';

interface SourceCardProps {
  source: SourceConfig;
  isComplete: boolean;
  index: number;
  onClick: () => void;
}

export function SourceCard({ source, isComplete, index, onClick }: SourceCardProps) {
  return (
    <m.button
      type="button"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.1, duration: 0.4, ease: 'easeOut' }}
      onClick={onClick}
      className={cn(
        'group relative w-full overflow-hidden rounded-xl border p-4 text-left transition-all duration-300',
        isComplete
          ? 'border-emerald-200/60 bg-white'
          : 'border-zinc-200 bg-white hover:-translate-y-px hover:border-zinc-300 hover:shadow-md hover:shadow-black/[0.03]',
      )}
    >
      {/* Subtle gradient overlay for completed cards */}
      {isComplete && (
        <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-50/50 to-transparent" />
      )}

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div
            className="flex size-[42px] shrink-0 items-center justify-center rounded-[11px] text-xl"
            style={{ background: source.colorBg }}
          >
            {source.icon}
          </div>
          <div>
            <h4 className="text-[15px] font-semibold leading-snug tracking-tight text-zinc-900">
              {source.label === 'Intake' ? 'Health intake' : source.label === 'AI context' ? 'AI health context' : source.label === 'Lab uploads' ? 'Previous lab results' : source.label}
            </h4>
            <p className="mt-0.5 text-xs text-zinc-400">
              {source.id === 'intake' && 'Symptoms, goals, history'}
              {source.id === 'wearables' && 'Apple Health, Oura, Whoop'}
              {source.id === 'ai-context' && 'ChatGPT, Claude conversations'}
              {source.id === 'labs' && 'Upload past blood work'}
            </p>
          </div>
        </div>

        <span
          className={cn(
            'mt-0.5 shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-medium',
            isComplete
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-zinc-100 text-zinc-400',
          )}
        >
          {isComplete ? 'Complete' : source.timeEstimate ?? '—'}
        </span>
      </div>

      {/* Early insight (shown when complete) */}
      {isComplete && (
        <m.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mt-3.5 rounded-[10px] border border-emerald-100 bg-gradient-to-br from-emerald-50/40 to-emerald-50/10 p-3.5"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-600">
            Early insight
          </span>
          <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-500 [&>strong]:font-semibold [&>strong]:text-zinc-900"
            dangerouslySetInnerHTML={{
              __html: source.earlyInsight.replace(
                /\*\*(.*?)\*\*/g,
                '<strong>$1</strong>',
              ),
            }}
          />
        </m.div>
      )}
    </m.button>
  );
}
```

- [ ] **Step 2: Verify no lint errors**

Run: `cd /Users/dannygrannick/superpower-dev/react-app && bunx oxlint src/features/onboarding-circle/components/source-card.tsx`

- [ ] **Step 3: Commit**

```bash
git add src/features/onboarding-circle/components/source-card.tsx
git commit -m "feat(onboarding-circle): add source card with insight state"
```

---

### Task 4: Source Detail Modal

**Files:**
- Create: `src/features/onboarding-circle/components/source-detail-modal.tsx`

- [ ] **Step 1: Create the detail modal**

Uses the existing Radix Dialog components from `@/components/ui/dialog`. Shows three sections (why / what to do / what you'll get) and a CTA button. On CTA click: marks source complete, fires toast, closes modal, and navigates.

```tsx
// src/features/onboarding-circle/components/source-detail-modal.tsx

import { useNavigate } from '@tanstack/react-router';

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';

import type { SourceConfig } from '../const/sources';
import { useOnboardingCircleStore } from '../stores/onboarding-circle-store';

interface SourceDetailModalProps {
  source: SourceConfig | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TOAST_MESSAGES: Record<string, string> = {
  intake: 'Intake complete \u2014 focus areas identified',
  wearables: 'Wearables connected \u2014 recovery insights ready',
  'ai-context': 'AI context imported \u2014 3 health themes found',
  labs: 'Labs uploaded \u2014 historical trends generated',
};

export function SourceDetailModal({
  source,
  open,
  onOpenChange,
}: SourceDetailModalProps) {
  const navigate = useNavigate();
  const complete = useOnboardingCircleStore((s) => s.complete);

  if (source == null) return null;

  const handleCta = () => {
    complete(source.id);
    onOpenChange(false);
    toast(TOAST_MESSAGES[source.id] ?? 'Step complete');

    if (source.ctaAction.type === 'navigate') {
      void navigate({
        to: source.ctaAction.to,
        search: source.ctaAction.search,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] p-0" preventCloseAutoFocus>
        {/* Drag bar */}
        <div className="mx-auto mt-3.5 h-1 w-10 rounded-full bg-zinc-200" />

        <div className="px-6 pb-8 pt-4">
          {/* Header */}
          <div className="mb-4 flex items-center gap-3.5">
            <div
              className="flex size-[52px] shrink-0 items-center justify-center rounded-[14px] text-[1.6rem]"
              style={{ background: source.colorBg }}
            >
              {source.icon}
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold tracking-tight text-zinc-900">
                {source.id === 'wearables'
                  ? 'Connect Wearables'
                  : source.id === 'ai-context'
                    ? 'Import AI Context'
                    : source.id === 'labs'
                      ? 'Upload Previous Labs'
                      : 'Health Intake'}
              </DialogTitle>
              <p className="mt-0.5 text-[13px] text-zinc-400">
                {source.timeEstimate
                  ? `Takes about ${source.timeEstimate}`
                  : 'Pre-filled from checkout'}
              </p>
            </div>
          </div>

          {/* Why this is valuable */}
          <p className="mb-6 text-sm leading-relaxed text-zinc-500">
            {source.modal.whyValuable}
          </p>

          {/* What to do */}
          <div className="mb-6 rounded-xl bg-zinc-50 p-4">
            <h5 className="mb-1 text-xs font-bold uppercase tracking-widest text-zinc-400">
              What to do
            </h5>
            <p className="text-[13px] leading-relaxed text-zinc-600">
              {source.modal.whatToDo}
            </p>
          </div>

          {/* What you'll get */}
          <div className="mb-7 flex flex-col gap-3.5">
            <h5 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              What you'll unlock
            </h5>
            {source.modal.benefits.map((benefit) => (
              <div key={benefit.title} className="flex gap-3 items-start">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-sm">
                  {benefit.icon}
                </div>
                <div>
                  <h5 className="text-[13px] font-semibold text-zinc-900">
                    {benefit.title}
                  </h5>
                  <p className="mt-0.5 text-xs leading-snug text-zinc-500">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          {source.ctaAction.type !== 'none' && (
            <button
              type="button"
              onClick={handleCta}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-950 px-4 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-zinc-800"
            >
              {source.ctaLabel}
              <span className="transition-transform group-hover:translate-x-0.5">
                \u2192
              </span>
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Verify no lint errors**

Run: `cd /Users/dannygrannick/superpower-dev/react-app && bunx oxlint src/features/onboarding-circle/components/source-detail-modal.tsx`

- [ ] **Step 3: Commit**

```bash
git add src/features/onboarding-circle/components/source-detail-modal.tsx
git commit -m "feat(onboarding-circle): add source detail modal with CTA"
```

---

### Task 5: Primer Banner

**Files:**
- Create: `src/features/onboarding-circle/components/primer-banner.tsx`

- [ ] **Step 1: Create the primer banner**

Two visual states: locked (dashed border, muted) and unlocked (solid brand border, warm glow, shimmer animation). Tracks completion count via pips.

```tsx
// src/features/onboarding-circle/components/primer-banner.tsx

import { m } from 'framer-motion';

import { cn } from '@/lib/utils';

interface PrimerBannerProps {
  completedCount: number;
}

export function PrimerBanner({ completedCount }: PrimerBannerProps) {
  const isUnlocked = completedCount >= 4;

  return (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4 }}
      className={cn(
        'relative overflow-hidden rounded-xl p-5 text-center transition-all duration-500',
        isUnlocked
          ? 'border-[1.5px] border-[#FC5F2B] bg-gradient-to-br from-[#FFF8F5] to-white shadow-[0_0_0_4px_rgba(252,95,43,0.06),0_8px_32px_rgba(252,95,43,0.08)]'
          : 'border-[1.5px] border-dashed border-zinc-200 bg-zinc-50',
      )}
    >
      {/* Shimmer overlay for unlocked state */}
      {isUnlocked && (
        <div className="pointer-events-none absolute inset-0 animate-[shimmer_2.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      )}

      <div className="relative">
        <h4 className="text-[15px] font-semibold tracking-tight text-zinc-900">
          {isUnlocked
            ? 'Your Pre-Protocol Primer is ready'
            : 'Pre-Protocol Primer'}
        </h4>
        <p className="mt-1 text-[13px] leading-snug text-zinc-400">
          {isUnlocked
            ? 'We connected the dots across all your health data. Your comprehensive overview is waiting.'
            : `Connect ${4 - completedCount} more source${4 - completedCount === 1 ? '' : 's'} to unlock your health overview.`}
        </p>

        {isUnlocked ? (
          <m.button
            type="button"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
            className="mt-4 inline-flex items-center gap-2 rounded-[10px] bg-[#FC5F2B] px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-[#e54f20]"
            onClick={() => {
              /* placeholder — no primer report in prototype */
            }}
          >
            View your primer
            <span>\u2192</span>
          </m.button>
        ) : (
          <div className="mt-3.5 flex justify-center gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <m.div
                key={i}
                className="h-1 w-8 rounded-full"
                animate={{
                  backgroundColor: i < completedCount ? '#FC5F2B' : '#e8e6e1',
                }}
                transition={{ duration: 0.4 }}
              />
            ))}
          </div>
        )}
      </div>
    </m.div>
  );
}
```

- [ ] **Step 2: Add shimmer keyframe to Tailwind config**

Check the existing Tailwind config for where custom keyframes are defined, then add the shimmer animation.

Run: `grep -n 'keyframes' /Users/dannygrannick/superpower-dev/react-app/tailwind.config.ts | head -5`

Add to the `keyframes` section in `tailwind.config.ts`:

```ts
shimmer: {
  '0%': { transform: 'translateX(-100%)' },
  '100%': { transform: 'translateX(200%)' },
},
```

And in the `animation` section:

```ts
shimmer: 'shimmer 2.5s ease-in-out infinite',
```

- [ ] **Step 3: Verify no lint errors**

Run: `cd /Users/dannygrannick/superpower-dev/react-app && bunx oxlint src/features/onboarding-circle/components/primer-banner.tsx`

- [ ] **Step 4: Commit**

```bash
git add src/features/onboarding-circle/components/primer-banner.tsx tailwind.config.ts
git commit -m "feat(onboarding-circle): add primer banner with shimmer"
```

---

### Task 6: Root Component + Celebration Effect

**Files:**
- Create: `src/features/onboarding-circle/components/onboarding-circle.tsx`

- [ ] **Step 1: Create the root onboarding circle component**

Composes all sub-components. Manages modal state. Includes celebration particle effect when all 4 complete. Renders label chips between ring and cards.

```tsx
// src/features/onboarding-circle/components/onboarding-circle.tsx

import { AnimatePresence, m } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { SOURCES, type SourceConfig, type SourceId } from '../const/sources';
import { useOnboardingCircleStore } from '../stores/onboarding-circle-store';

import { PrimerBanner } from './primer-banner';
import { ProgressRing } from './progress-ring';
import { SourceCard } from './source-card';
import { SourceDetailModal } from './source-detail-modal';

function CelebrationParticles() {
  const COLORS = ['#FC5F2B', '#3b82f6', '#a855f7', '#11c182'];
  const particles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 360;
    const rad = (angle * Math.PI) / 180;
    const distance = 60 + Math.random() * 40;
    const tx = Math.cos(rad) * distance;
    const ty = Math.sin(rad) * distance;
    return { tx, ty, color: COLORS[i % COLORS.length], delay: i * 0.03 };
  });

  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
      {particles.map((p, i) => (
        <m.div
          key={i}
          className="absolute size-2 rounded-full"
          style={{ backgroundColor: p.color }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{
            x: p.tx,
            y: p.ty,
            scale: [0, 1.5, 0],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 0.8,
            delay: p.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

export function OnboardingCircle() {
  const completedSources = useOnboardingCircleStore((s) => s.completedSources);
  const completedCount = completedSources.size;
  const prevCountRef = useRef(completedCount);
  const [showCelebration, setShowCelebration] = useState(false);
  const [modalSource, setModalSource] = useState<SourceConfig | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (completedCount === 4 && prevCountRef.current < 4) {
      setShowCelebration(true);
      const timeout = setTimeout(() => setShowCelebration(false), 1200);
      return () => clearTimeout(timeout);
    }
    prevCountRef.current = completedCount;
  }, [completedCount]);

  const handleArcClick = (sourceId: SourceId) => {
    const source = SOURCES.find((s) => s.id === sourceId);
    if (source == null) return;

    if (completedSources.has(sourceId)) {
      const card = document.getElementById(`source-card-${sourceId}`);
      card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setModalSource(source);
    setModalOpen(true);
  };

  const handleCardClick = (source: SourceConfig) => {
    if (source.autoComplete) return;
    setModalSource(source);
    setModalOpen(true);
  };

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="mx-auto flex w-full max-w-lg flex-col gap-6 pb-6"
    >
      {/* Progress Ring */}
      <div className="relative">
        <ProgressRing
          completedSources={completedSources}
          onArcClick={handleArcClick}
        />
        <AnimatePresence>
          {showCelebration && <CelebrationParticles />}
        </AnimatePresence>
      </div>

      {/* Tagline */}
      <m.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-center text-sm text-zinc-500"
      >
        Connect your data to unlock{' '}
        <strong className="bg-gradient-to-r from-[#FC5F2B] to-amber-500 bg-clip-text font-semibold text-transparent">
          early insights
        </strong>
      </m.p>

      {/* Label chips */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {SOURCES.map((source) => {
          const done = completedSources.has(source.id);
          return (
            <button
              key={source.id}
              type="button"
              onClick={() => handleArcClick(source.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all',
                done
                  ? 'border border-zinc-200 bg-white text-zinc-900'
                  : 'bg-zinc-100 text-zinc-400',
              )}
            >
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: source.colorFrom }}
              />
              {source.label}
              {done && (
                <span className="text-[10px] font-bold text-emerald-500">
                  \u2713
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Section header */}
      <div className="flex items-baseline justify-between">
        <h3 className="text-[15px] font-semibold tracking-tight text-zinc-900">
          Your data sources
        </h3>
        <span className="text-xs font-medium text-zinc-400">
          {completedCount} of 4
        </span>
      </div>

      {/* Source cards */}
      <div className="flex flex-col gap-2.5">
        {SOURCES.map((source, i) => (
          <div key={source.id} id={`source-card-${source.id}`}>
            <SourceCard
              source={source}
              isComplete={completedSources.has(source.id)}
              index={i}
              onClick={() => handleCardClick(source)}
            />
          </div>
        ))}
      </div>

      {/* Primer banner */}
      <PrimerBanner completedCount={completedCount} />

      {/* Modal */}
      <SourceDetailModal
        source={modalSource}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </m.div>
  );
}
```

- [ ] **Step 2: Verify no lint errors**

Run: `cd /Users/dannygrannick/superpower-dev/react-app && bunx oxlint src/features/onboarding-circle/components/onboarding-circle.tsx`

- [ ] **Step 3: Commit**

```bash
git add src/features/onboarding-circle/components/onboarding-circle.tsx
git commit -m "feat(onboarding-circle): add root component with celebration"
```

---

### Task 7: Integrate into ChatView

**Files:**
- Modify: `src/features/messages/components/ai/chat.tsx:1059-1071`

- [ ] **Step 1: Add import to chat.tsx**

At the top of `src/features/messages/components/ai/chat.tsx`, add the import alongside existing imports:

```ts
import { OnboardingCircle } from '@/features/onboarding-circle/components/onboarding-circle';
import { useOnboardingCircleStore } from '@/features/onboarding-circle/stores/onboarding-circle-store';
```

- [ ] **Step 2: Add store hook in ChatView**

Inside the `ChatView` function (around line 993, after `const { data: user } = useUser();`), add:

```ts
const onboardingComplete = useOnboardingCircleStore(
  (s) => s.completedSources.size >= 4,
);
```

- [ ] **Step 3: Replace SuggestedActions with OnboardingCircle**

In `ChatView`, replace this block (around line 1059-1071):

```tsx
{messages.length === 0 && (
  <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
    <Greeting />
    <div className="flex w-full">
      <SuggestedActions
        onSendSuggestion={(text) => {
          void sendMessage({ text, files: [] }, undefined);
        }}
        setupActions={setupActions}
      />
    </div>
  </div>
)}
```

With:

```tsx
{messages.length === 0 && (
  <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
    <Greeting />
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

- [ ] **Step 4: Run lint and type check**

Run: `cd /Users/dannygrannick/superpower-dev/react-app && bun check`

Fix any issues that arise.

- [ ] **Step 5: Run dev server and verify in browser**

Run: `cd /Users/dannygrannick/superpower-dev/react-app && bun dev`

Open `http://localhost:3000/concierge` and verify:
- The onboarding circle renders in the empty chat state
- Arc draw-on animations play on mount
- Clicking a pending arc opens the detail modal
- Clicking the CTA in the modal marks the source complete
- Completing all 4 shows the celebration + unlocks the primer
- After all 4 complete, the SuggestedActions cards show instead

- [ ] **Step 6: Commit**

```bash
git add src/features/messages/components/ai/chat.tsx
git commit -m "feat(onboarding-circle): integrate into concierge empty state"
```

---

### Task 8: Visual Polish Pass

**Files:**
- Modify: `src/features/onboarding-circle/components/progress-ring.tsx`
- Modify: `src/features/onboarding-circle/components/onboarding-circle.tsx`

- [ ] **Step 1: Add ambient center glow to ProgressRing**

In `progress-ring.tsx`, inside the center content div (after the countdown number div), add a radial gradient background that intensifies with completion:

Replace the outer `<div className="pointer-events-none absolute left-1/2 top-1/2 w-[140px]...">` with:

```tsx
<div
  className="pointer-events-none absolute left-1/2 top-1/2 w-[140px] -translate-x-1/2 -translate-y-1/2 text-center"
  style={{
    background: `radial-gradient(circle, rgba(252,95,43,${completedCount * 0.03}) 0%, transparent 70%)`,
    transition: 'background 0.6s ease',
  }}
>
```

- [ ] **Step 2: Add hover glow to arc fill paths**

In `progress-ring.tsx`, update the fill arc `className` to include hover effects for completed arcs:

```tsx
className={cn(
  'cursor-pointer transition-all duration-300',
  done ? 'hover:brightness-110' : 'hover:opacity-55',
)}
```

Import `cn` at the top:

```ts
import { cn } from '@/lib/utils';
```

- [ ] **Step 3: Run dev and visual QA**

Run: `cd /Users/dannygrannick/superpower-dev/react-app && bun dev`

Open `http://localhost:3000/concierge` and verify:
- Center glow intensifies as sources complete
- Arc hover states work for both pending and completed arcs
- All animations feel smooth (no jank)
- Modal opens/closes cleanly
- Toasts appear on completion
- Celebration particles fire on 4th completion
- Primer banner transitions from locked to unlocked
- Shimmer animation plays on unlocked primer

- [ ] **Step 4: Run format and lint**

Run: `cd /Users/dannygrannick/superpower-dev/react-app && bun fmt && bun lint`

Fix any issues.

- [ ] **Step 5: Commit**

```bash
git add src/features/onboarding-circle/
git commit -m "feat(onboarding-circle): visual polish pass"
```

---

### Task 9: Final Lint, Format, and Deploy Check

**Files:**
- All files in `src/features/onboarding-circle/`
- `src/features/messages/components/ai/chat.tsx`

- [ ] **Step 1: Full lint and format**

Run: `cd /Users/dannygrannick/superpower-dev/react-app && bun fmt && bun lint`

- [ ] **Step 2: Type check**

Run: `cd /Users/dannygrannick/superpower-dev/react-app && bun check`

- [ ] **Step 3: Build check**

Run: `cd /Users/dannygrannick/superpower-dev/react-app && bun run build`

Verify build completes with no errors.

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "chore(onboarding-circle): fix lint and build issues"
```
