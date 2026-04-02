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
      whyValuable: 'Your health questionnaire gives us a baseline \u2014 symptoms, goals, medical history, and lifestyle factors that shape your protocol.',
      whatToDo: 'Already done! Your intake was completed during onboarding.',
      benefits: [
        { iconName: 'target', title: 'Personalized focus areas', description: 'We identify which biomarkers matter most for your goals' },
        { iconName: 'zap', title: 'Faster protocol generation', description: 'More context means more targeted recommendations' },
        { iconName: 'lock', title: 'Clinical-grade privacy', description: 'Encrypted and only used for your personalization' },
      ],
    },
    earlyInsight: 'Based on your profile, your top focus areas are **hormonal balance**, **energy optimization**, and **metabolic health**. Your upcoming labs will test 12 biomarkers directly related to these.',
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
      whyValuable: 'Wearable data adds real-time context \u2014 sleep quality, recovery patterns, heart rate trends that lab results alone can\u2019t show.',
      whatToDo: 'Connect your Apple Health, Oura, Whoop, or other wearable from the integrations page.',
      benefits: [
        { iconName: 'moon', title: 'Sleep and recovery insights', description: 'Correlate sleep patterns with cortisol and testosterone levels' },
        { iconName: 'heart', title: 'Cardiovascular context', description: 'Resting heart rate and HRV alongside lipid markers' },
        { iconName: 'bar-chart-3', title: 'Continuous monitoring', description: 'Track how protocol changes affect daily metrics' },
      ],
    },
    earlyInsight: 'Your resting heart rate averages **62 bpm** with solid HRV. Sleep efficiency is **87%**, but deep sleep has declined 12% this month \u2014 worth watching alongside cortisol levels.',
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
      whyValuable: 'Health conversations with ChatGPT or Claude contain valuable context \u2014 symptoms you\u2019ve researched, questions asked, patterns noticed.',
      whatToDo: 'Import health conversations from AI assistants. We\u2019ll extract symptoms, research themes, and concerns.',
      benefits: [
        { iconName: 'search', title: 'Extract health themes', description: 'Recurring concerns mapped to relevant biomarkers' },
        { iconName: 'handshake', title: 'No cold start', description: 'Your AI coach starts with full context from day one' },
        { iconName: 'paperclip', title: 'Simple export', description: "Copy-paste or use ChatGPT's built-in export" },
      ],
    },
    earlyInsight: 'Found **3 recurring themes** in your conversations: fatigue and energy levels, thyroid function, and vitamin D. Your panel includes targeted markers for each.',
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
      whyValuable: 'Past blood work gives historical baseline \u2014 identify trends, track changes, and compare with your upcoming panel.',
      whatToDo: 'Upload PDFs or photos of previous blood work from any provider (Quest, Labcorp, etc.).',
      benefits: [
        { iconName: 'trending-up', title: 'Trend analysis', description: 'See how biomarkers changed over months or years' },
        { iconName: 'microscope', title: 'Deeper interpretation', description: 'Historical context catches patterns a single test misses' },
        { iconName: 'file-text', title: 'Any format works', description: 'PDFs from Quest, Labcorp, or any provider' },
      ],
    },
    earlyInsight: 'Previous results show **declining vitamin D** (42 \u2192 31 ng/mL) and **rising LDL** over two years. We\u2019ll track both closely and factor trends into your protocol.',
    insightTeaser: 'Declining vitamin D, rising LDL over 2 years',
  },
];
