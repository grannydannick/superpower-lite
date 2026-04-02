import {
  BarChart3,
  BrainCircuit,
  Check,
  ChevronRight,
  ClipboardList,
  FileText,
  Handshake,
  Heart,
  Lock,
  Microscope,
  Moon,
  Paperclip,
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
