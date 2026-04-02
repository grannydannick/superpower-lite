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
      whatToDo: 'Already done! Your intake was completed during onboarding.',
      benefits: [
        {
          icon: '\u{1F3AF}',
          title: 'Personalized focus areas',
          description: 'We identify which biomarkers matter most for your goals',
        },
        {
          icon: '\u26A1',
          title: 'Faster protocol generation',
          description: 'More context means more targeted recommendations',
        },
        {
          icon: '\u{1F512}',
          title: 'Clinical-grade privacy',
          description: 'Encrypted and only used for your personalization',
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
    ctaAction: { type: 'navigate', to: '/settings', search: { tab: 'integrations' } },
    modal: {
      whyValuable:
        'Wearable data adds real-time context — sleep quality, recovery patterns, heart rate trends that lab results alone can\u2019t show.',
      whatToDo:
        'Connect your Apple Health, Oura, Whoop, or other wearable from the integrations page.',
      benefits: [
        {
          icon: '\u{1F634}',
          title: 'Sleep and recovery insights',
          description: 'Correlate sleep patterns with cortisol and testosterone levels',
        },
        {
          icon: '\u2764\uFE0F',
          title: 'Cardiovascular context',
          description: 'Resting heart rate and HRV alongside lipid markers',
        },
        {
          icon: '\u{1F4CA}',
          title: 'Continuous monitoring',
          description: 'Track how protocol changes affect daily metrics',
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
    ctaAction: { type: 'navigate', to: '/concierge', search: { preset: 'import-memory' } },
    modal: {
      whyValuable:
        'Health conversations with ChatGPT or Claude contain valuable context \u2014 symptoms you\u2019ve researched, questions asked, patterns noticed.',
      whatToDo:
        'Import health conversations from AI assistants. We\u2019ll extract symptoms, research themes, and concerns.',
      benefits: [
        {
          icon: '\u{1F50D}',
          title: 'Extract health themes',
          description: 'Recurring concerns mapped to relevant biomarkers',
        },
        {
          icon: '\u{1F91D}',
          title: 'No cold start',
          description: 'Your AI coach starts with full context from day one',
        },
        {
          icon: '\u{1F4CE}',
          title: 'Simple export',
          description: "Copy-paste or use ChatGPT's built-in export",
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
    ctaAction: { type: 'navigate', to: '/concierge', search: { preset: 'upload-labs' } },
    modal: {
      whyValuable:
        'Past blood work gives historical baseline \u2014 identify trends, track changes, and compare with your upcoming panel.',
      whatToDo:
        'Upload PDFs or photos of previous blood work from any provider (Quest, Labcorp, etc.).',
      benefits: [
        {
          icon: '\u{1F4C8}',
          title: 'Trend analysis',
          description: 'See how biomarkers changed over months or years',
        },
        {
          icon: '\u{1F52C}',
          title: 'Deeper interpretation',
          description: 'Historical context catches patterns a single test misses',
        },
        {
          icon: '\u{1F4C4}',
          title: 'Any format works',
          description: 'PDFs from Quest, Labcorp, or any provider',
        },
      ],
    },
    earlyInsight:
      'Previous results show **declining vitamin D** (42 \u2192 31 ng/mL) and **rising LDL** over two years. We\u2019ll track both closely and factor trends into your protocol.',
  },
];
