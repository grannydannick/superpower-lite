import { motion } from 'framer-motion';
import { Dispatch, memo, SetStateAction } from 'react';

import { ChatSuggestion } from '@/features/messages/components/chat-suggestion';
import { useSuggestions } from '@/features/messages/hooks/use-suggestions';

interface SuggestedActionsProps {
  setInput: Dispatch<SetStateAction<string>>;
}

function PureSuggestedActions({ setInput }: SuggestedActionsProps) {
  const { suggestions } = useSuggestions({ enabled: true, max: 3 });

  return (
    <div className="flex min-h-10 w-full grid-cols-3 flex-col items-start justify-start gap-2 lg:grid lg:items-start">
      {suggestions.map((s, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${s}-${index}`}
          className="flex-1"
        >
          <ChatSuggestion
            suggestion={s}
            onClick={(e) => {
              e.preventDefault();
              setInput(s);
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);
