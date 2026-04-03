# Onboarding Circle v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the onboarding circle from a custom SVG ring to a compact header + checklist UI that matches the app's existing design system.

**Architecture:** Delete `progress-ring.tsx` and `primer-banner.tsx`. Rewrite `onboarding-circle.tsx` as a header card + item list. Rewrite `source-card.tsx` as a compact row. Update `sources.ts` config to use Lucide icon names. Update modal to use typography components. Store and ChatView integration unchanged.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Lucide icons, framer-motion (minimal), Radix Dialog, Zustand, sonner toast, `@/components/ui/typography`, `@/components/ui/button`

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/features/onboarding-circle/const/sources.ts` | Modify | Replace emoji icons with Lucide names, add `insightTeaser` field |
| `src/features/onboarding-circle/components/progress-ring.tsx` | Delete | No longer needed |
| `src/features/onboarding-circle/components/primer-banner.tsx` | Delete | No longer needed |
| `src/features/onboarding-circle/components/source-row.tsx` | Create | Compact row item (replaces source-card.tsx) |
| `src/features/onboarding-circle/components/source-card.tsx` | Delete | Replaced by source-row.tsx |
| `src/features/onboarding-circle/components/active-indicator.tsx` | Create | Vermillion spinning dots + green check (extracted from checklist-step pattern) |
| `src/features/onboarding-circle/components/onboarding-circle.tsx` | Rewrite | Header card + item list (no ring, no celebration particles) |
| `src/features/onboarding-circle/components/source-detail-modal.tsx` | Modify | Use typography components + Lucide icons |

---

### Task 1: Update source config

**Files:**
- Modify: `src/features/onboarding-circle/const/sources.ts`

- [ ] **Step 1: Rewrite sources.ts**

Replace the entire file. Key changes: remove `icon` (emoji), `colorBg` fields. Add `iconName` (Lucide component name string) and `insightTeaser` (one-line summary). Keep everything else (modal content, earlyInsight, ctaAction, etc).

```ts
// src/features/onboarding-circle/const/sources.ts

export type SourceId = 'intake' | 'wearables' | 'ai-context' | 'labs';

export interface SourceModalContent {
  whyValuable: string;
  whatToDo: string;
  benefits: { iconName: string; title: string; description: string }[];
}

export interface SourceConfig {
  id: SourceId;
  label: string;
  title: string;
  subtitle: string;
  iconName: string;
  color: string;
  timeEstimate: string | null;
  autoComplete: boolean;
  ctaLabel: string;
  ctaAction:
    | { type: 'navigate'; to: string; search?: Record<string, string> }
    | { type: 'none' };
  modal: SourceModalContent;
  earlyInsight: string;
  insightTeaser: string;
}

export const SOURCES: SourceConfig[] = [
  {
    id: 'intake',
    label: 'Intake',
    title: 'Health intake',
    subtitle: 'Symptoms, goals, history',
    iconName: 'clipboard-list',
    color: '#FC5F2B',
    timeEstimate: null,
    autoComplete: true,
    ctaLabel: 'Review your intake',
    ctaAction: { type: 'none' },
    modal: {
      whyValuable:
        'Your health questionnaire gives us a baseline \u2014 symptoms, goals, medical history, and lifestyle factors that shape your protocol.',
      whatToDo: 'Already done! Your intake was completed during onboarding.',
      benefits: [
        { iconName: 'target', title: 'Personalized focus areas', description: 'We identify which biomarkers matter most for your goals' },
        { iconName: 'zap', title: 'Faster protocol generation', description: 'More context means more targeted recommendations' },
        { iconName: 'lock', title: 'Clinical-grade privacy', description: 'Encrypted and only used for your personalization' },
      ],
    },
    earlyInsight:
      'Based on your profile, your top focus areas are **hormonal balance**, **energy optimization**, and **metabolic health**. Your upcoming labs will test 12 biomarkers directly related to these.',
    insightTeaser: 'Focus areas: hormonal balance, energy, metabolic health',
  },
  {
    id: 'wearables',
    label: 'Wearables',
    title: 'Wearables',
    subtitle: 'Apple Health, Oura, Whoop',
    iconName: 'watch',
    color: '#3b82f6',
    timeEstimate: '2 min',
    autoComplete: false,
    ctaLabel: 'Connect a wearable',
    ctaAction: { type: 'navigate', to: '/settings', search: { tab: 'integrations' } },
    modal: {
      whyValuable:
        'Wearable data adds real-time context \u2014 sleep quality, recovery patterns, heart rate trends that lab results alone can\u2019t show.',
      whatToDo:
        'Connect your Apple Health, Oura, Whoop, or other wearable from the integrations page.',
      benefits: [
        { iconName: 'moon', title: 'Sleep and recovery insights', description: 'Correlate sleep patterns with cortisol and testosterone levels' },
        { iconName: 'heart', title: 'Cardiovascular context', description: 'Resting heart rate and HRV alongside lipid markers' },
        { iconName: 'bar-chart-3', title: 'Continuous monitoring', description: 'Track how protocol changes affect daily metrics' },
      ],
    },
    earlyInsight:
      'Your resting heart rate averages **62 bpm** with solid HRV. Sleep efficiency is **87%**, but deep sleep has declined 12% this month \u2014 worth watching alongside cortisol levels.',
    insightTeaser: 'Resting HR 62 bpm, sleep efficiency 87%',
  },
  {
    id: 'ai-context',
    label: 'AI context',
    title: 'AI health context',
    subtitle: 'ChatGPT, Claude conversations',
    iconName: 'brain-circuit',
    color: '#a855f7',
    timeEstimate: '3 min',
    autoComplete: false,
    ctaLabel: 'Import conversations',
    ctaAction: { type: 'navigate', to: '/concierge', search: { preset: 'import-memory' } },
    modal: {
      whyValuable:
        'Health conversations with ChatGPT or Claude contain valuable context \u2014 symptoms you\u2019ve researched, questions asked, patterns noticed.',
      whatToDo:
        'Import health conversations from AI assistants. We\u2019ll extract symptoms, research themes, and concerns.',
      benefits: [
        { iconName: 'search', title: 'Extract health themes', description: 'Recurring concerns mapped to relevant biomarkers' },
        { iconName: 'handshake', title: 'No cold start', description: 'Your AI coach starts with full context from day one' },
        { iconName: 'paperclip', title: 'Simple export', description: "Copy-paste or use ChatGPT's built-in export" },
      ],
    },
    earlyInsight:
      'Found **3 recurring themes** in your conversations: fatigue and energy levels, thyroid function, and vitamin D. Your panel includes targeted markers for each.',
    insightTeaser: '3 themes: fatigue, thyroid function, vitamin D',
  },
  {
    id: 'labs',
    label: 'Lab uploads',
    title: 'Previous lab results',
    subtitle: 'Upload past blood work',
    iconName: 'test-tubes',
    color: '#11c182',
    timeEstimate: '5 min',
    autoComplete: false,
    ctaLabel: 'Upload lab results',
    ctaAction: { type: 'navigate', to: '/concierge', search: { preset: 'upload-labs' } },
    modal: {
      whyValuable:
        'Past blood work gives historical baseline \u2014 identify trends, track changes, and compare with your upcoming panel.',
      whatToDo:
        'Upload PDFs or photos of previous blood work from any provider (Quest, Labcorp, etc.).',
      benefits: [
        { iconName: 'trending-up', title: 'Trend analysis', description: 'See how biomarkers changed over months or years' },
        { iconName: 'microscope', title: 'Deeper interpretation', description: 'Historical context catches patterns a single test misses' },
        { iconName: 'file-text', title: 'Any format works', description: 'PDFs from Quest, Labcorp, or any provider' },
      ],
    },
    earlyInsight:
      'Previous results show **declining vitamin D** (42 \u2192 31 ng/mL) and **rising LDL** over two years. We\u2019ll track both closely and factor trends into your protocol.',
    insightTeaser: 'Declining vitamin D, rising LDL over 2 years',
  },
];
```

- [ ] **Step 2: Lint check**

Run: `cd /Users/dannygrannick/superpower-dev/react-app && bunx oxlint src/features/onboarding-circle/const/sources.ts`

- [ ] **Step 3: Commit**

```bash
git add src/features/onboarding-circle/const/sources.ts
git commit -m "refactor(onboarding-circle): update source config for v2 redesign"
```

---

### Task 2: Active indicator component

**Files:**
- Create: `src/features/onboarding-circle/components/active-indicator.tsx`

- [ ] **Step 1: Create active-indicator.tsx**

Extract the spinning dots indicator from the pattern in `src/features/onboarding/components/sequences/finish-twin/checklist-step.tsx`. Two variants: active (vermillion spinning dots) and complete (green check circle).

```tsx
// src/features/onboarding-circle/components/active-indicator.tsx

import { Check } from 'lucide-react';

export function ActiveIndicator() {
  return (
    <div className="relative size-[44px] shrink-0">
      <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        fill="none"
        className="absolute inset-0"
      >
        <g filter="url(#filter0_dd_active_ind)">
          <rect x="8" y="4" width="28" height="28" rx="14" fill="white" shapeRendering="crispEdges" />
          <rect x="8.5" y="4.5" width="27" height="27" rx="13.5" stroke="#E4E4E7" shapeRendering="crispEdges" />
        </g>
        <defs>
          <filter id="filter0_dd_active_ind" x="0" y="0" width="44" height="44" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="4" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dy="2" />
            <feGaussianBlur stdDeviation="1" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.025 0" />
            <feBlend mode="normal" in2="effect1_dropShadow" result="effect2_dropShadow" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow" result="shape" />
          </filter>
        </defs>
      </svg>
      {/* Rotating dots */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="absolute left-3 top-2 animate-spin"
        style={{ animationDuration: '4s' }}
      >
        <circle cx="10" cy="2.29" r="0.625" fill="#FC5F2B" />
        <circle cx="2.29" cy="9.79" r="0.625" fill="#FC5F2B" />
        <circle cx="17.71" cy="9.79" r="0.625" fill="#FC5F2B" />
        <circle cx="10" cy="17.71" r="0.625" fill="#FC5F2B" />
        <circle cx="4.55" cy="4.55" r="0.625" fill="#FC5F2B" />
        <circle cx="4.55" cy="15.3" r="0.625" fill="#FC5F2B" />
        <circle cx="15.3" cy="4.55" r="0.625" fill="#FC5F2B" />
        <circle cx="15.3" cy="15.3" r="0.625" fill="#FC5F2B" />
      </svg>
      {/* Center dot */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="absolute left-3 top-2"
      >
        <circle cx="10" cy="10" r="5.42" fill="#FC5F2B" />
      </svg>
    </div>
  );
}

export function CompleteIndicator() {
  return (
    <div className="flex size-[44px] shrink-0 items-center justify-center">
      <div className="flex size-7 items-center justify-center rounded-full bg-emerald-500">
        <Check size={16} className="text-white" strokeWidth={2.5} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Lint check**

Run: `cd /Users/dannygrannick/superpower-dev/react-app && bunx oxlint src/features/onboarding-circle/components/active-indicator.tsx`

- [ ] **Step 3: Commit**

```bash
git add src/features/onboarding-circle/components/active-indicator.tsx
git commit -m "feat(onboarding-circle): add active/complete indicator components"
```

---

### Task 3: Source row component

**Files:**
- Create: `src/features/onboarding-circle/components/source-row.tsx`
- Delete: `src/features/onboarding-circle/components/source-card.tsx`

- [ ] **Step 1: Create source-row.tsx**

Compact row with three visual states: next-action (vermillion border), pending (neutral, dimmed), completed (muted bg, green badge, insight teaser).

```tsx
// src/features/onboarding-circle/components/source-row.tsx

import {
  BarChart3,
  BrainCircuit,
  Check,
  ChevronRight,
  ClipboardList,
  FileText,
  Heart,
  Lock,
  Microscope,
  Moon,
  Paperclip,
  Handshake,
  Search,
  Target,
  TestTubes,
  TrendingUp,
  Watch,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Body2, Body3 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

import type { SourceConfig } from '../const/sources';

const ICON_MAP: Record<string, LucideIcon> = {
  'clipboard-list': ClipboardList,
  watch: Watch,
  'brain-circuit': BrainCircuit,
  'test-tubes': TestTubes,
  target: Target,
  zap: Zap,
  lock: Lock,
  moon: Moon,
  heart: Heart,
  'bar-chart-3': BarChart3,
  search: Search,
  handshake: Handshake,
  paperclip: Paperclip,
  'trending-up': TrendingUp,
  microscope: Microscope,
  'file-text': FileText,
};

export function getSourceIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? ClipboardList;
}

interface SourceRowProps {
  source: SourceConfig;
  isComplete: boolean;
  isNextAction: boolean;
  onClick: () => void;
}

export function SourceRow({ source, isComplete, isNextAction, onClick }: SourceRowProps) {
  const Icon = getSourceIcon(source.iconName);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-300 animate-in fade-in slide-in-from-bottom-2',
        isComplete && 'border-zinc-200 bg-zinc-50',
        isNextAction && 'border-vermillion-900 bg-white outline outline-2 outline-vermillion-900/20',
        !isComplete && !isNextAction && 'border-zinc-200 bg-white opacity-60 hover:bg-zinc-50 hover:opacity-100',
        isNextAction && 'hover:bg-zinc-50',
      )}
    >
      {/* Icon */}
      <div
        className="relative flex size-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${source.color}12` }}
      >
        <Icon size={18} style={{ color: source.color }} />
        {isComplete && (
          <div className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-emerald-500">
            <Check size={10} className="text-white" strokeWidth={3} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <Body2 className="p-0 font-medium text-zinc-900">{source.title}</Body2>
        <Body3 className="p-0 text-zinc-400">
          {isComplete ? source.insightTeaser : source.subtitle}
        </Body3>
      </div>

      {/* Badge */}
      <Body3
        className={cn(
          'shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 p-0',
          isComplete
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-zinc-100 text-zinc-400',
        )}
      >
        {isComplete ? 'Done' : (source.timeEstimate ?? '\u2014')}
      </Body3>

      {/* Chevron (only for incomplete) */}
      {!isComplete && (
        <ChevronRight size={14} className="shrink-0 text-zinc-400" />
      )}
    </button>
  );
}
```

- [ ] **Step 2: Delete source-card.tsx**

```bash
rm src/features/onboarding-circle/components/source-card.tsx
```

- [ ] **Step 3: Lint check**

Run: `cd /Users/dannygrannick/superpower-dev/react-app && bunx oxlint src/features/onboarding-circle/components/source-row.tsx`

- [ ] **Step 4: Commit**

```bash
git add src/features/onboarding-circle/components/source-row.tsx
git rm src/features/onboarding-circle/components/source-card.tsx
git commit -m "feat(onboarding-circle): add compact source row, delete old card"
```

---

### Task 4: Rewrite root component

**Files:**
- Rewrite: `src/features/onboarding-circle/components/onboarding-circle.tsx`
- Delete: `src/features/onboarding-circle/components/progress-ring.tsx`
- Delete: `src/features/onboarding-circle/components/primer-banner.tsx`

- [ ] **Step 1: Rewrite onboarding-circle.tsx**

Replace the entire file. New structure: header card (with active indicator, title, progress bar) + source row list. No ring, no celebration particles, no primer banner.

```tsx
// src/features/onboarding-circle/components/onboarding-circle.tsx

import { m } from 'framer-motion';
import { useState } from 'react';

import { Body3, H4 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

import { SOURCES, type SourceConfig, type SourceId } from '../const/sources';
import { useOnboardingCircleStore } from '../stores/onboarding-circle-store';

import { ActiveIndicator, CompleteIndicator } from './active-indicator';
import { SourceDetailModal } from './source-detail-modal';
import { SourceRow } from './source-row';

function SegmentedProgress({ completedCount }: { completedCount: number }) {
  return (
    <div className="flex gap-1">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 w-6 rounded-full transition-colors duration-300',
            i < completedCount ? 'bg-vermillion-900' : 'bg-zinc-100',
          )}
        />
      ))}
    </div>
  );
}

export function OnboardingCircle() {
  const completedSources = useOnboardingCircleStore((s) => s.completedSources);
  const completedCount = completedSources.size;
  const allComplete = completedCount >= 4;
  const [modalSource, setModalSource] = useState<SourceConfig | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleRowClick = (source: SourceConfig) => {
    if (source.autoComplete && completedSources.has(source.id)) return;
    setModalSource(source);
    setModalOpen(true);
  };

  // Find the first incomplete source to highlight as "next action"
  let nextActionId: SourceId | null = null;
  for (const source of SOURCES) {
    if (!completedSources.has(source.id)) {
      nextActionId = source.id;
      break;
    }
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto flex w-full max-w-[548px] flex-col gap-1.5"
    >
      {/* Header card */}
      <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-lg shadow-black/5">
        {allComplete ? <CompleteIndicator /> : <ActiveIndicator />}
        <div className="min-w-0 flex-1">
          <H4 className="text-zinc-900">
            {allComplete
              ? 'Your health profile is complete'
              : 'Complete your health profile'}
          </H4>
          <Body3 className="p-0 text-zinc-400">
            {allComplete
              ? 'Your data is ready to power better insights'
              : `${completedCount} of 4 sources connected`}
          </Body3>
        </div>
        <SegmentedProgress completedCount={completedCount} />
      </div>

      {/* Source rows */}
      {SOURCES.map((source) => (
        <SourceRow
          key={source.id}
          source={source}
          isComplete={completedSources.has(source.id)}
          isNextAction={source.id === nextActionId}
          onClick={() => handleRowClick(source)}
        />
      ))}

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

- [ ] **Step 2: Delete progress-ring.tsx and primer-banner.tsx**

```bash
rm src/features/onboarding-circle/components/progress-ring.tsx
rm src/features/onboarding-circle/components/primer-banner.tsx
```

- [ ] **Step 3: Lint check**

Run: `cd /Users/dannygrannick/superpower-dev/react-app && bunx oxlint src/features/onboarding-circle/components/onboarding-circle.tsx`

- [ ] **Step 4: Commit**

```bash
git add src/features/onboarding-circle/components/onboarding-circle.tsx
git rm src/features/onboarding-circle/components/progress-ring.tsx src/features/onboarding-circle/components/primer-banner.tsx
git commit -m "feat(onboarding-circle): rewrite as header + checklist UI"
```

---

### Task 5: Update source detail modal

**Files:**
- Modify: `src/features/onboarding-circle/components/source-detail-modal.tsx`

- [ ] **Step 1: Rewrite modal with typography components and Lucide icons**

```tsx
// src/features/onboarding-circle/components/source-detail-modal.tsx

import { useNavigate } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { Body2, Body3, H4 } from '@/components/ui/typography';

import type { SourceConfig } from '../const/sources';
import { useOnboardingCircleStore } from '../stores/onboarding-circle-store';

import { getSourceIcon } from './source-row';

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

export function SourceDetailModal({ source, open, onOpenChange }: SourceDetailModalProps) {
  const navigate = useNavigate();
  const complete = useOnboardingCircleStore((s) => s.complete);

  if (source == null) return null;

  const Icon = getSourceIcon(source.iconName);

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
        <div className="mx-auto mt-3.5 h-1 w-10 rounded-full bg-zinc-200" />

        <div className="px-6 pb-8 pt-4">
          {/* Header */}
          <div className="mb-4 flex items-center gap-3.5">
            <div
              className="flex size-[52px] shrink-0 items-center justify-center rounded-[14px]"
              style={{ backgroundColor: `${source.color}12` }}
            >
              <Icon size={24} style={{ color: source.color }} />
            </div>
            <div>
              <DialogTitle asChild>
                <H4 className="text-zinc-900">{source.title}</H4>
              </DialogTitle>
              <Body3 className="p-0 text-zinc-400">
                {source.timeEstimate
                  ? `Takes about ${source.timeEstimate}`
                  : 'Pre-filled from checkout'}
              </Body3>
            </div>
          </div>

          {/* Why this is valuable */}
          <Body2 className="mb-6 p-0 text-zinc-500">{source.modal.whyValuable}</Body2>

          {/* What to do */}
          <div className="mb-6 rounded-xl bg-zinc-50 p-4">
            <Body3 className="mb-1 p-0 font-bold uppercase tracking-widest text-zinc-400">
              What to do
            </Body3>
            <Body3 className="p-0 leading-relaxed text-zinc-600">
              {source.modal.whatToDo}
            </Body3>
          </div>

          {/* Benefits */}
          <div className="mb-7 flex flex-col gap-3.5">
            <Body3 className="p-0 font-bold uppercase tracking-widest text-zinc-400">
              What you'll unlock
            </Body3>
            {source.modal.benefits.map((benefit) => {
              const BenefitIcon = getSourceIcon(benefit.iconName);
              return (
                <div key={benefit.title} className="flex items-start gap-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                    <BenefitIcon size={14} className="text-zinc-500" />
                  </div>
                  <div>
                    <Body3 className="p-0 font-semibold text-zinc-900">{benefit.title}</Body3>
                    <Body3 className="mt-0.5 p-0 text-zinc-500">{benefit.description}</Body3>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          {source.ctaAction.type !== 'none' && (
            <Button onClick={handleCta} className="w-full">
              {source.ctaLabel} <span className="ml-1">{'\u2192'}</span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Lint check**

Run: `cd /Users/dannygrannick/superpower-dev/react-app && bunx oxlint src/features/onboarding-circle/components/source-detail-modal.tsx`

- [ ] **Step 3: Commit**

```bash
git add src/features/onboarding-circle/components/source-detail-modal.tsx
git commit -m "refactor(onboarding-circle): update modal with typography + Lucide icons"
```

---

### Task 6: Full build check and deploy

**Files:**
- All files in `src/features/onboarding-circle/`
- `src/features/messages/components/ai/chat.tsx` (unchanged but verify no broken imports)

- [ ] **Step 1: Format and lint**

Run: `cd /Users/dannygrannick/superpower-dev/react-app && bun fmt && bun lint`

- [ ] **Step 2: Type check**

Run: `cd /Users/dannygrannick/superpower-dev/react-app && bun check`

- [ ] **Step 3: Build check**

Run: `cd /Users/dannygrannick/superpower-dev/react-app && bun run build`

- [ ] **Step 4: Fix any issues and commit**

```bash
git add -A
git commit -m "chore(onboarding-circle): fix lint and build issues"
```

- [ ] **Step 5: Push to deploy**

```bash
git push origin main
```

Then deploy:
```bash
npx vercel deploy --prod
```
