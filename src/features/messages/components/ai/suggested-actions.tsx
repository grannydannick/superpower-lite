import { UseChatHelpers } from '@ai-sdk/react';
import { motion } from 'framer-motion';
import { memo } from 'react';

import { Button } from '@/components/ui/button';
import { Body2 } from '@/components/ui/typography';

interface SuggestedActionsProps {
  setInput: UseChatHelpers['setInput'];
}

function PureSuggestedActions({ setInput }: SuggestedActionsProps) {
  const suggestedActions = [
    {
      title: 'Supplement recommendations',
      action: 'Recommend me supplements based on my recent biomarker results',
    },
    {
      title: 'Analyse data',
      action: `Analyze my recent biomarkers`,
    },
    {
      title: 'Help me understand',
      action: `Help me understand my latest blood panel results`,
    },
  ];

  return (
    <div className="flex w-full flex-wrap items-center gap-2 lg:justify-center">
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? 'hidden sm:block' : 'block'}
        >
          <Button
            variant="ghost"
            onClick={() => {
              setInput(suggestedAction.action);
            }}
            className="group h-auto w-full flex-1 flex-col items-start justify-start gap-1 rounded-full border px-4 py-2 text-left text-sm transition-all duration-150 hover:bg-zinc-100"
          >
            <Body2 className="text-zinc-400 transition-all duration-150 group-hover:text-zinc-700">
              {suggestedAction.title}
            </Body2>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);
