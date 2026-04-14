export const STATUS_GRADIENTS: Record<string, string> = {
  healthy: 'from-[#0c4a6e] via-[#164e63] to-[#134e4a]',
  good: 'from-[#064e3b] via-[#065f46] to-[#047857]',
  alert: 'from-[#7c2d12] via-[#9a3412] to-[#c2410c]',
  neutral: 'from-[#1e1b4b] via-[#312e81] to-[#3730a3]',
};

export const STATUS_GLOW: Record<string, string> = {
  healthy: 'rgba(34,211,238,0.12)',
  good: 'rgba(52,211,153,0.12)',
  alert: 'rgba(252,95,43,0.2)',
  neutral: 'rgba(139,92,246,0.15)',
};

export const STATUS_ACCENT: Record<string, string> = {
  healthy: '#22d3ee',
  good: '#34d399',
  alert: '#FC5F2B',
  neutral: '#a78bfa',
};

export const TAG_COLORS: Record<string, string> = {
  healthy: 'bg-cyan-500/20 text-cyan-300',
  good: 'bg-emerald-500/20 text-emerald-300',
  alert: 'bg-vermillion-500/20 text-vermillion-300',
  neutral: 'bg-violet-500/20 text-violet-300',
};

export const SOURCE_LABELS: Record<string, string> = {
  wearables: 'Oura Ring',
  intake: 'Health Intake',
  'ai-context': 'AI Conversations',
  labs: 'Past Labs',
  goals: 'Your Goals',
};

export const SOURCE_COLORS: Record<string, string> = {
  wearables: '#22d3ee',
  intake: '#FC5F2B',
  'ai-context': '#a78bfa',
  labs: '#34d399',
  goals: '#FC5F2B',
};
