import { cn } from '@/lib/utils';

interface DailyBriefPillsProps {
  layers: string[];
}

const LAYER_CONFIG: Record<string, { label: string; className: string }> = {
  biomarkers: { label: 'Labs', className: 'bg-vermillion-50 text-vermillion-600' },
  protocol: { label: 'Protocol', className: 'bg-green-50 text-green-600' },
  wearables: { label: 'Wearables', className: 'bg-blue-50 text-blue-600' },
  memory: { label: 'Chat History', className: 'bg-purple-50 text-purple-600' },
  intake: { label: 'Intake', className: 'bg-yellow-50 text-yellow-600' },
};

export function DailyBriefPills({ layers }: DailyBriefPillsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {layers.map((layer) => {
        const config = LAYER_CONFIG[layer];
        if (config == null) return null;
        return (
          <span
            key={layer}
            className={cn(
              'rounded-full px-2.5 py-0.5 font-mono text-xs',
              config.className,
            )}
          >
            {config.label}
          </span>
        );
      })}
    </div>
  );
}
