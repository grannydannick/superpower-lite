import { ChevronRight, X } from 'lucide-react';
import { memo, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Body2 } from '@/components/ui/typography';
import { useCreateFollowups } from '@/features/messages/api/create-followups';
import { ChatSuggestion } from '@/features/messages/components/chat-suggestion';
import { cn } from '@/lib/utils';

export interface SetupAction {
  id: string;
  title: string;
  subtitle: string;
  imageSrc?: string;
  icon?: ReactNode;
  onClick: () => void;
  onDismiss?: () => void;
}

export type SuggestedActionsVariant = 'welcome' | 'inline';

interface SuggestedActionsProps {
  onSendSuggestion: (text: string) => void;
  setupActions?: SetupAction[];
  variant: SuggestedActionsVariant;
  /** When provided, overrides the internally-fetched explore suggestions */
  suggestionsOverride?: string[];
}

const SUGGESTIONS_COUNT = 3;
const EXPLORE_SUGGESTIONS_CONTEXT = `I'm exploring the Superpower app. Suggest ${SUGGESTIONS_COUNT} short follow-up questions I can ask the AI.`;

/** Edge-fade mask on the horizontal axis. Pair with overflow-x-auto. */
export const HORIZONTAL_EDGE_FADE_MASK =
  '[-webkit-mask-image:linear-gradient(to_right,transparent_0px,black_16px,black_calc(100%-16px),transparent_100%)] [mask-image:linear-gradient(to_right,transparent_0px,black_16px,black_calc(100%-16px),transparent_100%)]';
/** Drops the edge-fade mask + overflow on lg+. */
export const HORIZONTAL_EDGE_FADE_MASK_LG_RESET =
  'lg:overflow-x-visible lg:px-0 lg:[-webkit-mask-image:none] lg:[mask-image:none]';

const SCROLL_ROW =
  'flex w-full flex-row gap-2.5 overflow-x-auto py-4 px-3 scrollbar-none';

function PureSuggestedActions({
  onSendSuggestion,
  setupActions = [],
  variant,
  suggestionsOverride,
}: SuggestedActionsProps) {
  const isWelcome = variant === 'welcome';
  const showPrompts = isWelcome && setupActions.length === 0;
  const animations = isWelcome;

  const { data: fetched = [] } = useCreateFollowups({
    context: EXPLORE_SUGGESTIONS_CONTEXT,
    count: SUGGESTIONS_COUNT,
    enabled: showPrompts && suggestionsOverride == null,
  });
  const suggestions = suggestionsOverride ?? fetched;

  return (
    <div className="flex w-full flex-col">
      {showPrompts && (
        <div
          className={cn(
            SCROLL_ROW,
            HORIZONTAL_EDGE_FADE_MASK,
            HORIZONTAL_EDGE_FADE_MASK_LG_RESET,
            'lg:flex-wrap lg:justify-center',
          )}
        >
          {suggestions.slice(0, SUGGESTIONS_COUNT).map((s) => (
            <ChatSuggestion
              key={s}
              className="min-w-[200px] flex-1 shrink-0 lg:min-w-0 lg:max-w-44"
              suggestion={s}
              disableEnterAnimation={!animations}
              onClick={(e) => {
                e.preventDefault();
                onSendSuggestion(s);
              }}
            />
          ))}
        </div>
      )}
      {setupActions.length > 0 && (
        <div
          className={cn(
            SCROLL_ROW,
            HORIZONTAL_EDGE_FADE_MASK,
            HORIZONTAL_EDGE_FADE_MASK_LG_RESET,
            isWelcome
              ? 'lg:flex-col lg:items-center'
              : 'lg:flex-row lg:flex-nowrap lg:items-stretch lg:justify-between lg:overflow-visible',
          )}
        >
          {setupActions.map((action) => (
            <div
              key={action.id}
              className={cn(
                'group relative',
                isWelcome
                  ? 'min-w-[280px] shrink-0 lg:w-full lg:min-w-0 lg:max-w-[548px]'
                  : 'min-w-[280px] shrink-0 lg:min-w-0 lg:flex-1 lg:basis-0',
              )}
            >
              <Button
                variant="outline"
                onClick={action.onClick}
                className={cn(
                  'group flex w-full items-center justify-between gap-3 rounded-2xl border border-zinc-200 py-2 pl-4 pr-2 text-left shadow-lg shadow-black/5 outline-none transition-colors duration-300 hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-ring',
                  animations && 'animate-in fade-in slide-in-from-bottom-2',
                  action.onDismiss != null && 'pr-10',
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <Body2 className="text-pretty p-0 text-secondary transition-all duration-200 group-hover:text-zinc-700">
                      {action.title}
                    </Body2>
                    <ChevronRight
                      size={14}
                      aria-hidden="true"
                      className="text-zinc-400 transition-transform group-hover:translate-x-0.5"
                    />
                  </div>
                  <Body2 className="whitespace-normal break-words p-0 text-zinc-400">
                    {action.subtitle}
                  </Body2>
                </div>
                <div className="mb-2 -translate-y-1.5 p-1.5 pb-0 rounded-mask">
                  {action.icon ? (
                    <div className="flex size-16 shrink-0 translate-y-1.5 items-center justify-center">
                      {action.icon}
                    </div>
                  ) : (
                    <img
                      src={action.imageSrc}
                      alt=""
                      className="size-16 w-auto shrink-0 translate-y-2.5 object-contain transition-all ease-out group-hover:rotate-3"
                    />
                  )}
                </div>
              </Button>

              {action.onDismiss != null && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    action.onDismiss?.();
                  }}
                  className="absolute right-2 top-2 size-7 rounded-full text-zinc-400 transition-opacity hover:bg-zinc-200 hover:text-zinc-700 lg:opacity-0 lg:group-hover:opacity-100"
                  aria-label={`Dismiss ${action.title}`}
                >
                  <X size={14} />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions);
