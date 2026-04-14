import { env } from '@/config/env';
import type { SourceId } from '@/features/onboarding-circle/const/sources';
import { useReportStore } from '@/features/onboarding-circle/stores/report-store';
import type { ParsedReport } from '@/features/reports/types';
import { getActiveLogin } from '@/lib/utils';

const CHAT_PROMPTS: Record<string, string> = {
  wearables:
    'Analyze my wearable data (sleep, HRV, heart rate, steps, activity) and cross-reference with my intake, health goals, and any prior labs. Give me a concise summary of key patterns and what to focus on.',
  labs: 'Analyze my uploaded lab results and identify biomarker trends. Cross-reference with my wearable data, intake, and health goals. Highlight concerning trends and what to watch for.',
  'ai-context':
    'Analyze my imported AI health conversations. Map the themes and concerns against my intake, wearable data, and lab results. What patterns connect across my data?',
};

/**
 * Report templates per source type.
 * These provide the Wrapped flow structure. In the future, these will be
 * populated with real member data from APIs. For now they use representative
 * examples that demonstrate the experience.
 */
const REPORT_TEMPLATES: Record<string, ParsedReport> = {
  wearables: {
    title: 'Your sleep &\nrecovery patterns',
    source: 'wearables',
    metrics: [
      {
        value: 62,
        unit: 'bpm',
        label: 'Resting heart rate',
        identity: 'Your heart runs steady',
        status: 'healthy',
        tag: 'Healthy',
      },
      {
        value: 87,
        unit: '%',
        label: 'Sleep efficiency',
        identity: "You're an efficient sleeper",
        status: 'good',
        tag: 'Strong',
      },
      {
        value: 12,
        unit: '%',
        label: 'Deep sleep change',
        identity: 'Your deep sleep needs you',
        status: 'alert',
        tag: 'Declining',
        direction: 'down',
      },
      {
        value: 45,
        unit: 'ms',
        label: 'HRV',
        identity: "You're a fast recoverer",
        status: 'good',
        tag: 'Strong',
      },
    ],
    connections: [
      {
        metricIndex: 0,
        sources: ['wearables', 'intake'],
        headline: "Your heart is steady — even when it doesn't feel like it.",
        body: 'You mentioned anxiety and a racing heart in your intake. But your Oura data shows consistent 60-64 bpm with no spikes — even on anxious days. The sensation may be perceived rather than cardiac.',
        callout: {
          label: 'Worth exploring',
          text: 'Your AI coach can help distinguish anxiety-driven sensations from cardiac events using your daily data.',
        },
      },
      {
        metricIndex: 2,
        sources: ['wearables', 'intake', 'ai-context'],
        headline: 'Three data points, one pattern.',
        body: 'You flagged fatigue in your intake. You researched cortisol with ChatGPT. Now Oura shows deep sleep declining on high-stress days. All three point to a stress-cortisol axis disrupting recovery.',
        callout: {
          label: 'Your upcoming panel',
          text: 'Cortisol and DHEA-S are included in your bloodwork and will confirm or rule out this hypothesis.',
        },
      },
      {
        metricIndex: 3,
        sources: ['wearables', 'labs'],
        headline: 'Your baseline is stronger than you think.',
        body: 'Your 2024 labs showed thyroid in range and CRP at 0.8. Combined with steady HRV, your system is resilient. The deep sleep issue is targeted, not systemic.',
        callout: {
          label: 'Good news',
          text: 'A solid baseline means protocol interventions are more likely to produce measurable results quickly.',
        },
      },
    ],
    correlation: {
      from: { emoji: '🏃', label: 'Activity' },
      to: { emoji: '🌙', label: 'Deep sleep' },
      identity: 'Movement is your sleep medicine',
      body: 'On 7,000+ step days, your deep sleep averages 22 minutes longer.',
      connection: {
        sources: ['wearables', 'intake'],
        headline: 'We found a lever for your #1 goal.',
        body: "You set energy optimization as your top priority. Deep sleep drives next-day energy, and activity drives deep sleep. We'll build activity timing into your protocol.",
        callout: {
          label: 'Protocol preview',
          text: 'Targeting the activity window that maximizes your deep sleep response.',
        },
      },
    },
    nextSteps: [
      {
        emoji: '🎯',
        title: 'Deep sleep recovery',
        detail: 'Adaptogens targeting your cortisol pattern',
      },
      {
        emoji: '⚡',
        title: 'Activity timing',
        detail: 'Leveraging the 7k+ step → deep sleep connection',
      },
      {
        emoji: '🧪',
        title: 'Cortisol + DHEA-S panel',
        detail: 'Confirming the stress-sleep hypothesis',
      },
    ],
    ctaQuestions: [
      'Why is my deep sleep dropping?',
      'What should I do about cortisol?',
      'How do I use the activity-sleep link?',
    ],
    summary:
      'Strong recovery, solid heart rate — but deep sleep needs attention. Everything points to a stress-cortisol axis.',
  },
  labs: {
    title: 'Your biomarker\ntrends',
    source: 'labs',
    metrics: [
      {
        value: 31,
        unit: 'ng/mL',
        label: 'Vitamin D',
        identity: 'Your D levels are slipping',
        status: 'alert',
        tag: 'Declining',
        direction: 'down',
      },
      {
        value: 142,
        unit: 'mg/dL',
        label: 'LDL Cholesterol',
        identity: 'Your LDL is climbing',
        status: 'alert',
        tag: 'Rising',
        direction: 'up',
      },
      {
        value: 92,
        unit: 'mg/dL',
        label: 'Fasting glucose',
        identity: "You're metabolically stable",
        status: 'healthy',
        tag: 'Healthy',
      },
    ],
    connections: [
      {
        metricIndex: 0,
        sources: ['labs', 'intake'],
        headline: 'Your fatigue has a biomarker behind it.',
        body: 'You flagged low energy in your intake. Vitamin D dropped from 42 to 31 ng/mL over two years — below the 40 ng/mL threshold linked to fatigue. This is likely a contributor.',
        callout: {
          label: 'Actionable',
          text: 'Vitamin D supplementation at 4000 IU/day typically restores levels within 8-12 weeks.',
        },
      },
      {
        metricIndex: 1,
        sources: ['labs', 'wearables'],
        headline: 'Activity and cholesterol are connected in your data.',
        body: 'Your LDL has risen alongside a period of reduced activity in your wearable data. Members who increase activity by 2000+ steps/day typically see LDL improvements within 90 days.',
        callout: {
          label: 'Watch for',
          text: 'Your next panel will show whether the activity changes are moving LDL in the right direction.',
        },
      },
    ],
    correlation: {
      from: { emoji: '☀️', label: 'Vitamin D' },
      to: { emoji: '⚡', label: 'Energy' },
      identity: 'Sunlight drives your energy engine',
      body: 'Your D levels track inversely with the fatigue you reported — as D drops, energy complaints rise.',
      connection: {
        sources: ['labs', 'intake'],
        headline: 'One supplement could shift two problems.',
        body: "Optimizing Vitamin D doesn't just address fatigue — it supports immune function and mood, both flagged in your intake. Your protocol will target this first.",
        callout: {
          label: 'Protocol preview',
          text: 'D3 + K2 supplementation paired with your next retest at 90 days.',
        },
      },
    },
    nextSteps: [
      {
        emoji: '💊',
        title: 'Vitamin D optimization',
        detail: 'D3 + K2 to restore levels above 40 ng/mL',
      },
      {
        emoji: '🏃',
        title: 'Activity prescription',
        detail: 'Targeting the step count that impacts your LDL',
      },
      {
        emoji: '🧪',
        title: '90-day retest',
        detail: 'Tracking D, LDL, and glucose response to protocol',
      },
    ],
    ctaQuestions: [
      'Why is my Vitamin D dropping?',
      'How do I lower my LDL naturally?',
      'What supplements should I start with?',
    ],
    summary:
      'Declining Vitamin D is likely driving your fatigue, and rising LDL correlates with reduced activity. Both are addressable with your protocol.',
  },
  'ai-context': {
    title: 'Your health\nthemes',
    source: 'ai-context',
    metrics: [
      {
        value: 3,
        unit: '',
        label: 'Recurring themes',
        identity: "You've been circling the same questions",
        status: 'neutral',
        tag: 'Patterns found',
      },
      {
        value: 47,
        unit: '',
        label: 'Health mentions',
        identity: 'Your health is top of mind',
        status: 'good',
        tag: 'Engaged',
      },
      {
        value: 8,
        unit: '',
        label: 'Unique concerns',
        identity: "You're asking the right questions",
        status: 'good',
        tag: 'Informed',
      },
    ],
    connections: [
      {
        metricIndex: 0,
        sources: ['ai-context', 'intake'],
        headline: 'Your AI conversations confirm what your body is saying.',
        body: "You've asked about fatigue, thyroid function, and stress recovery across 12 conversations. Your intake flagged the same themes independently — this isn't anxiety, it's pattern recognition.",
        callout: {
          label: 'Validated',
          text: 'Your concerns align with your data. Your protocol will address these directly.',
        },
      },
      {
        metricIndex: 2,
        sources: ['ai-context', 'labs'],
        headline: 'You researched Vitamin D — and you were right to.',
        body: 'Three of your ChatGPT conversations explored Vitamin D and energy. Your uploaded labs confirm D has dropped from 42 to 31 ng/mL. Your intuition was spot on.',
        callout: {
          label: 'Data confirms',
          text: 'Your protocol includes D3 + K2 supplementation targeting the exact deficiency you suspected.',
        },
      },
    ],
    correlation: {
      from: { emoji: '🧠', label: 'Research' },
      to: { emoji: '🎯', label: 'Protocol' },
      identity: 'Your curiosity is your superpower',
      body: '73% of the concerns you researched map directly to biomarkers in your panel.',
      connection: {
        sources: ['ai-context', 'intake', 'labs'],
        headline: 'Everything you investigated matters.',
        body: "The themes from your AI conversations — fatigue, stress, vitamin deficiency — aren't random worries. They map to measurable biomarkers that your protocol will target. You were doing the right research.",
        callout: {
          label: 'Full picture',
          text: 'Your AI coach now has context from your conversations, intake, and labs. No cold start.',
        },
      },
    },
    nextSteps: [
      {
        emoji: '🔗',
        title: 'Unified health context',
        detail: 'Your AI coach starts with your full story',
      },
      {
        emoji: '🎯',
        title: 'Targeted protocol',
        detail: 'Addressing the themes you identified',
      },
      {
        emoji: '📊',
        title: 'Biomarker tracking',
        detail: 'Monitoring the markers behind your concerns',
      },
    ],
    ctaQuestions: [
      'What did you learn from my conversations?',
      'How do my concerns connect to my labs?',
      'What should I focus on first?',
    ],
    summary:
      "Your AI conversations reveal consistent themes — fatigue, stress, vitamin D — that align with your lab data and intake. You've been asking the right questions.",
  },
};

/**
 * Fire report generation for a completed source.
 * 1. Generates the Wrapped report from a template (immediate)
 * 2. Creates a chat thread for the "discuss with AI coach" CTA (background)
 */
export function fireReportGeneration(
  sourceId: SourceId,
  startReport: (sourceId: SourceId, threadId: string) => void,
) {
  const template = REPORT_TEMPLATES[sourceId];
  if (template == null) return;

  const threadId = crypto.randomUUID();

  // Store the report immediately with the template data
  startReport(sourceId, threadId);
  useReportStore.getState().setReport(sourceId, template.title, template);

  // Fire the AI chat thread in the background for the "discuss" CTA
  const chatPrompt = CHAT_PROMPTS[sourceId];
  if (chatPrompt == null) return;

  const accessToken = getActiveLogin()?.accessToken;
  void fetch(`${env.API_URL}/chat/chatv2`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({
      id: threadId,
      message: {
        id: crypto.randomUUID(),
        role: 'user',
        parts: [{ type: 'text', text: chatPrompt }],
      },
    }),
  }).catch((err) => {
    console.warn('Chat thread creation failed:', err);
  });
}

/**
 * No-op — polling is no longer needed since reports are generated from templates.
 * Kept as a hook call for backwards compatibility with ActionItemsCard.
 */
export function useReportPolling() {
  // Reports are now generated immediately from templates in fireReportGeneration.
  // The AI chat thread is fire-and-forget for the "discuss" CTA.
}
