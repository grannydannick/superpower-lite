# Wearable Connection Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the loop when a wearable is connected — show a celebration modal and generate a background AI insight report, surfaced via persistent toast notification.

**Architecture:** Frontend-only. On wearable connection success, start a background chat session (useChat + transport) that generates an insight report. Show a celebration modal with "Generate my report" CTA. When the AI finishes, fire a toast with link to the chat thread. Persist in localStorage so missed toasts resurface on homepage.

**Tech Stack:** React, @ai-sdk/react (useChat), TanStack Router, sonner (toast), localStorage

**Spec:** `docs/superpowers/specs/2026-04-03-wearable-connection-loop-design.md`

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `src/features/wearables/hooks/use-wearable-report.ts` | Hook managing background chat session — create transport, auto-send prompt, track completion, persist to localStorage, fire toast |
| `src/features/wearables/components/wearable-report-toast.tsx` | Component mounted on homepage that checks localStorage for pending reports and surfaces missed toasts |

### Modified Files

| File | Change |
|------|--------|
| `src/features/settings/components/wearables/wearables-table.tsx` | Uncomment modal import, add state for modal + hook integration, trigger report generation on connection success |
| `src/features/settings/components/wearables/wearable-connected-modal.tsx` | Update CTA copy, add generating state with auto-dismiss |
| `src/routes/_app.index.tsx` | Mount `<WearableReportToast />` for missed toast persistence |

---

## Task 1: Background Report Hook — `use-wearable-report.ts`

**Files:**
- Create: `src/features/wearables/hooks/use-wearable-report.ts`

- [ ] **Step 1: Create the hook file**

```typescript
// src/features/wearables/hooks/use-wearable-report.ts

import { useChat } from '@ai-sdk/react';
import { useNavigate } from '@tanstack/react-router';
import type { UIMessage } from 'ai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { toast } from '@/components/ui/sonner';
import { createChatV2Transport } from '@/features/messages/utils/chatv2-transport';

const STORAGE_KEY = 'wearable-report-pending';

function buildReportPrompt(providerName: string) {
  return `Generate a comprehensive wearables insight report for me. I just connected ${providerName}.

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

Be specific with numbers and data points. This is a detailed report, not a brief.`;
}

interface PendingReport {
  threadId: string;
  providerName: string;
  completedAt: string;
}

function getPendingReport(): PendingReport | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null) return null;
    return JSON.parse(raw) as PendingReport;
  } catch {
    return null;
  }
}

function setPendingReport(report: PendingReport) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(report));
}

export function clearPendingReport() {
  localStorage.removeItem(STORAGE_KEY);
}

export { getPendingReport };

export function useWearableReport() {
  const navigate = useNavigate();
  const transport = useMemo(() => createChatV2Transport<UIMessage>(), []);
  const [providerName, setProviderName] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const autoSentRef = useRef(false);
  const toastFiredRef = useRef(false);

  const threadId = useMemo(() => {
    if (providerName == null) return undefined;
    return `wearable-report-${providerName}-${Date.now()}`;
  }, [providerName]);

  const { messages, sendMessage, status } = useChat({
    id: threadId,
    transport,
    generateId: () => crypto.randomUUID(),
  });

  // Auto-send prompt when chat is ready and provider is set
  useEffect(() => {
    if (providerName == null) return;
    if (status !== 'ready') return;
    if (autoSentRef.current) return;
    if (messages.length > 0) return;

    autoSentRef.current = true;
    void sendMessage({
      text: buildReportPrompt(providerName),
      files: [],
    });
  }, [providerName, status, messages.length, sendMessage]);

  // Detect when generation completes
  useEffect(() => {
    if (providerName == null) return;
    if (threadId == null) return;
    if (!isGenerating) return;
    if (toastFiredRef.current) return;

    // Check if we have an assistant message and status is back to ready
    const hasAssistantMessage = messages.some((m) => m.role === 'assistant');
    if (!hasAssistantMessage) return;
    if (status !== 'ready') return;

    toastFiredRef.current = true;
    setIsGenerating(false);

    // Persist for missed toast recovery
    setPendingReport({
      threadId,
      providerName,
      completedAt: new Date().toISOString(),
    });

    // Fire toast
    toast.success(`Your ${providerName} insights report is ready`, {
      action: {
        label: 'View report →',
        onClick: () => {
          clearPendingReport();
          void navigate({ to: `/concierge/${threadId}` });
        },
      },
      duration: 10000,
    });
  }, [providerName, threadId, isGenerating, messages, status, navigate]);

  const generate = useCallback((provider: string) => {
    autoSentRef.current = false;
    toastFiredRef.current = false;
    setProviderName(provider);
    setIsGenerating(true);
  }, []);

  return { generate, isGenerating };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/wearables/hooks/use-wearable-report.ts
git commit -m "feat(wearables): add background report generation hook"
```

---

## Task 2: Update Celebration Modal — CTA + Generating State

**Files:**
- Modify: `src/features/settings/components/wearables/wearable-connected-modal.tsx`

- [ ] **Step 1: Update the modal to support generating state**

Replace the entire file content:

```tsx
// src/features/settings/components/wearables/wearable-connected-modal.tsx

import { IconMagnifyingGlass } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconMagnifyingGlass';
import { IconNotes } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconNotes';
import { IconSparklesTwo } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconSparklesTwo';
import { X } from 'lucide-react';
import { type ComponentType, type SVGProps, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

const INFO_ITEMS: {
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;
  text: string;
}[] = [
  {
    icon: IconMagnifyingGlass,
    text: 'Your wearables data is live in your data page',
  },
  {
    icon: IconSparklesTwo,
    text: 'Superpower AI has full context of your wearables data',
  },
  {
    icon: IconNotes,
    text: 'Your protocol will connect the dots',
  },
];

export function WearableConnectedModal({
  providerName,
  open,
  onOpenChange,
  onGenerateReport,
  isGenerating,
}: {
  providerName: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerateReport: () => void;
  isGenerating: boolean;
}) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Auto-dismiss 3 seconds after showing confirmation
  useEffect(() => {
    if (!showConfirmation) return;
    const timer = setTimeout(() => {
      onOpenChange(false);
      setShowConfirmation(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [showConfirmation, onOpenChange]);

  // Reset confirmation state when modal opens
  useEffect(() => {
    if (open) {
      setShowConfirmation(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[99] max-w-[calc(100%-1rem)] overflow-hidden rounded-3xl p-0 outline -outline-offset-1 outline-white/10 xs:max-w-md">
        <DialogTitle className="sr-only">
          Your {providerName} is connected
        </DialogTitle>

        {/* Hero image */}
        <div className="relative">
          <img
            src="/integrations/runner.webp"
            alt=""
            className="h-56 w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
          <DialogClose className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full text-white transition-colors hover:bg-black/20">
            <X className="size-4" />
          </DialogClose>
        </div>

        {/* Content */}
        <div className="space-y-6 px-6 pb-6">
          <h2 className="text-center text-2xl font-semibold">
            Your {providerName} is connected!
          </h2>

          <div className="space-y-4">
            {INFO_ITEMS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <Icon className="size-6 shrink-0 rounded-full bg-vermillion-900/10 p-1 text-vermillion-900" />
                <span className="text-sm text-zinc-700">{text}</span>
              </div>
            ))}
          </div>

          {showConfirmation ? (
            <p className="text-center text-sm text-zinc-500">
              We're generating your insights and we'll let you know when your
              report is ready.
            </p>
          ) : (
            <Button
              className="w-full rounded-xl"
              onClick={() => {
                onGenerateReport();
                setShowConfirmation(true);
              }}
            >
              Generate my report
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/settings/components/wearables/wearable-connected-modal.tsx
git commit -m "feat(wearables): update modal with generate report CTA and auto-dismiss"
```

---

## Task 3: Wire Up Modal + Report Hook in Wearables Table

**Files:**
- Modify: `src/features/settings/components/wearables/wearables-table.tsx`

- [ ] **Step 1: Uncomment modal import and add hook integration**

At the top of `wearables-table.tsx`, replace the commented-out import (line 19):

```typescript
// Replace this line:
// TODO: re-enable once ready — import { WearableConnectedModal } from '@/features/settings/components/wearables/wearable-connected-modal';

// With:
import { WearableConnectedModal } from '@/features/settings/components/wearables/wearable-connected-modal';
import { useWearableReport } from '@/features/wearables/hooks/use-wearable-report';
```

- [ ] **Step 2: Add state and hook inside WearablesTable component**

Inside `WearablesTable()`, after the existing state declarations (after line 35), add:

```typescript
  const [connectedProviderName, setConnectedProviderName] = useState<string | null>(null);
  const { generate: generateReport, isGenerating } = useWearableReport();
```

- [ ] **Step 3: Update the connection success handler**

In the popup close handler (around line 101), after `toast.success`, add the modal trigger:

Replace:
```typescript
                  if (connected) {
                    toast.success(`${name} is now connected!`);
                  } else {
                    toast.error(`Connecting ${name} was aborted.`);
                  }
```

With:
```typescript
                  if (connected) {
                    setConnectedProviderName(name);
                    generateReport(name);
                  } else {
                    toast.error(`Connecting ${name} was aborted.`);
                  }
```

- [ ] **Step 4: Replace commented-out modal with working modal**

Replace the commented-out modal block at the bottom of the JSX (lines 211-218):

```tsx
      {/* TODO: re-enable once ready
      <WearableConnectedModal
        providerName={connectedProvider?.name ?? null}
        open={connectedProvider !== null}
        onOpenChange={(open) => {
          if (!open) setConnectedProvider(null);
        }}
      /> */}
```

With:

```tsx
      <WearableConnectedModal
        providerName={connectedProviderName}
        open={connectedProviderName != null}
        onOpenChange={(open) => {
          if (!open) setConnectedProviderName(null);
        }}
        onGenerateReport={() => {}}
        isGenerating={isGenerating}
      />
```

Note: `onGenerateReport` is a no-op because `generateReport(name)` was already called in the success handler (step 3). The report is already generating by the time the modal appears. The CTA in the modal is theatrical — it just transitions to the confirmation text.

- [ ] **Step 5: Commit**

```bash
git add src/features/settings/components/wearables/wearables-table.tsx
git commit -m "feat(wearables): wire up celebration modal and report generation on connect"
```

---

## Task 4: Missed Toast Recovery — `wearable-report-toast.tsx`

**Files:**
- Create: `src/features/wearables/components/wearable-report-toast.tsx`
- Modify: `src/routes/_app.index.tsx`

- [ ] **Step 1: Create the toast recovery component**

```tsx
// src/features/wearables/components/wearable-report-toast.tsx

import { useNavigate } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';

import { toast } from '@/components/ui/sonner';
import {
  clearPendingReport,
  getPendingReport,
} from '@/features/wearables/hooks/use-wearable-report';

export function WearableReportToast() {
  const navigate = useNavigate();
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    const pending = getPendingReport();
    if (pending == null) return;

    toast.success(`Your ${pending.providerName} insights report is ready`, {
      action: {
        label: 'View report →',
        onClick: () => {
          clearPendingReport();
          void navigate({ to: `/concierge/${pending.threadId}` });
        },
      },
      duration: 10000,
    });
  }, [navigate]);

  return null;
}
```

- [ ] **Step 2: Mount on homepage**

In `src/routes/_app.index.tsx`, add the import:

```typescript
import { WearableReportToast } from '@/features/wearables/components/wearable-report-toast';
```

Add the component inside `HomepageComponent`, right before the `<ContentLayout>` return (or inside it as a sibling):

```tsx
  return (
    <ContentLayout
      title="Home"
      variant="homepage"
      className="max-w-[1600px] pt-6 md:space-y-6 lg:py-0"
    >
      <WearableReportToast />
      {/* ... rest of existing JSX */}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/wearables/components/wearable-report-toast.tsx src/routes/_app.index.tsx
git commit -m "feat(wearables): add missed toast recovery on homepage mount"
```

---

## Task 5: Lint, Format, Verify

**Files:** None (verification only)

- [ ] **Step 1: Format and lint**

Run: `cd /Users/dannygrannick/superpower-dev/react-app && bun fmt && bun lint`
Expected: 0 errors (pre-existing warnings OK)

- [ ] **Step 2: Type check**

Run: `cd /Users/dannygrannick/superpower-dev/react-app && npx tsc --noEmit 2>&1 | grep "wearable\|daily-brief"`
Expected: No errors related to wearable or daily-brief files.

- [ ] **Step 3: Fix any issues and commit**

```bash
git add -A
git commit -m "fix(wearables): address lint and type issues"
```

- [ ] **Step 4: Push to deploy**

```bash
git push origin main
```
