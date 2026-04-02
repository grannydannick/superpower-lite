import { ChevronRight, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { AnimatedCheckbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/dialog';
import { ScribbleStrikethrough } from '@/components/ui/scribble-strikethrough';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Body1 } from '@/components/ui/typography';
import { AiSuggestions } from '@/features/messages/components/ai-suggestions';
import { ProtocolMarkdown } from '@/features/protocol/components/protocol-markdown';
import { useSupplementProductLookup } from '@/features/protocol/hooks/use-supplement-product-lookup';
import { useAnalytics } from '@/hooks/use-analytics';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/api';

import type { ProtocolAction } from '../../api';
import { SupplementPreview } from '../supplement-preview';

interface TodoItemProps {
  action: ProtocolAction;
  isFirstItem: boolean;
  isLastItem: boolean;
  index?: number;
}

const getTypeLabel = (content: ProtocolAction['content']) => {
  if (content.type === 'lifestyle') {
    const category = (content as { category?: string }).category;
    if (category === 'nutrition') return 'Nutrition';
    if (category === 'exercise') return 'Exercise';
    return 'Lifestyle';
  }

  // Capitalize the first letter of the type
  return content.type.charAt(0).toUpperCase() + content.type.slice(1);
};

const getTypeImage = (content: ProtocolAction['content']) => {
  const type = content.type;
  if (type === 'supplement') return '/protocol/types/supplement-type.png';
  if (type === 'testing') return '/protocol/types/testing-type.webp';
  if (type === 'consultation') return '/protocol/types/consultation-type.webp';
  // lifestyle, medication, and any other types
  return '/protocol/types/lifestyle-type.webp';
};

const getStorageKey = (action: ProtocolAction) =>
  `todo_item_${action.content.type}_${action.title?.slice(0, 50)}`;

const getTodoTitle = (action: ProtocolAction) => {
  if ('todoTitle' in action.content) {
    const todoTitle = action.content.todoTitle?.trim();
    if (todoTitle) return todoTitle;
  }

  return action.title;
};

const isItemChecked = (action: ProtocolAction): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const key = getStorageKey(action);
    const stored = localStorage.getItem(key);
    if (!stored) return false;

    const data = JSON.parse(stored);
    if (!data.date) return false;

    const today = new Date().toDateString();

    if (data.date !== today) {
      return false;
    }

    return true;
  } catch (error) {
    console.warn('Failed to read todo item from localStorage:', error);
    return false;
  }
};

const DetailContent = ({
  title,
  typeLabel,
  typeImage,
  description,
  additionalContent,
  supplementProduct,
}: {
  title: string;
  typeLabel: string;
  typeImage: string;
  description?: string | null;
  additionalContent?: string | null;
  supplementProduct?: Product | null;
}) => (
  <div className="space-y-5 p-5">
    {/* Header with image + title */}
    <div className="flex items-start gap-3">
      <img
        src={typeImage}
        alt={typeLabel}
        className="size-14 shrink-0 rounded-xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
        <span className="text-xs text-secondary">{typeLabel}</span>
      </div>
    </div>

    {supplementProduct && <SupplementPreview product={supplementProduct} />}

    {description && (
      <ProtocolMarkdown
        content={description}
        className="text-[13px] leading-relaxed text-secondary [&>div]:mb-0"
      />
    )}

    {additionalContent && (
      <>
        <hr className="border-zinc-100" />
        <ProtocolMarkdown
          content={additionalContent}
          className="text-[13px] leading-relaxed text-secondary [&>div]:mb-0 [&_h1]:mb-1.5 [&_h1]:mt-5 [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:text-zinc-900 [&_h2]:mb-1.5 [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_h3]:mb-1.5 [&_h3]:mt-5 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-zinc-900"
        />
      </>
    )}

    {/* Superpower AI Suggestions */}
    <hr className="border-zinc-100" />
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-zinc-900">
        Superpower AI Suggestions
      </h3>
      <AiSuggestions
        context={`Protocol action: ${title} (${typeLabel}). ${description ?? ''}`}
        limit={3}
        eventName="protocol_todo_dialog_ai_suggestion_clicked"
        showAskOwn
      />
    </div>
  </div>
);

const setItemChecked = (action: ProtocolAction, checked: boolean) => {
  if (typeof window === 'undefined') return;

  try {
    const key = getStorageKey(action);
    if (checked) {
      localStorage.setItem(
        key,
        JSON.stringify({
          date: new Date().toDateString(),
          title: action.title,
          type: action.content.type,
        }),
      );
    } else {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.warn('Failed to save todo item to localStorage:', error);
  }
};

export const TodoItem = ({
  action,
  isFirstItem,
  isLastItem,
  index = 0,
}: TodoItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const isMobile = useIsMobile();
  const { track } = useAnalytics();
  const dialogOpenedAtRef = useRef<string | null>(null);
  const getSupplementProduct = useSupplementProductLookup();

  const supplementProduct =
    action.content.type === 'supplement'
      ? getSupplementProduct(action.content.productId)
      : null;

  useEffect(() => {
    setChecked(isItemChecked(action));
  }, [action]);

  const handleItemClick = () => {
    const openedAt = new Date().toISOString();
    dialogOpenedAtRef.current = openedAt;
    setIsOpen(true);
    track('protocol_dashboard_todo_dialog_opened', {
      action_type: action.content.type,
      action_title: action.title,
    });
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      track('protocol_dashboard_todo_dialog_closed', {
        action_type: action.content.type,
        action_title: action.title,
        opened_at: dialogOpenedAtRef.current,
      });
      dialogOpenedAtRef.current = null;
    }
  };

  const handleCheckboxChange = (newChecked: boolean) => {
    setChecked(newChecked);
    setItemChecked(action, newChecked);
    track(
      newChecked
        ? 'protocol_dashboard_todo_checked'
        : 'protocol_dashboard_todo_unchecked',
      {
        action_type: action.content.type,
        action_title: action.title,
      },
    );
  };

  const todoTitle = getTodoTitle(action);
  const typeLabel = getTypeLabel(action.content);

  return (
    <>
      <div className="mt-[-3px] flex w-full flex-row items-stretch gap-4">
        <div className="flex shrink-0 flex-col items-center justify-center gap-2">
          <div
            className={cn(
              'flex-1 border-r border-dashed',
              isFirstItem ? 'border-transparent' : 'border-zinc-200',
            )}
          />

          <AnimatedCheckbox
            checked={checked}
            onCheckedChange={handleCheckboxChange}
            className="size-6 rounded-[6px] border border-black/10 transition-all duration-150 ease-out data-[state=checked]:bg-vermillion-900 data-[state=unchecked]:bg-white data-[state=unchecked]:hover:bg-zinc-100"
          />
          <div
            className={cn(
              'flex-1 border-r border-dashed',
              isLastItem ? 'border-transparent' : 'border-zinc-200',
            )}
          />
        </div>
        <div className="flex-1 py-2">
          <button
            onClick={handleItemClick}
            className="group w-full rounded-2xl border border-zinc-200 bg-white p-4 shadow shadow-black/[.03] outline-none transition-all"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-3 text-left">
                <img
                  src={getTypeImage(action.content)}
                  alt={getTypeLabel(action.content)}
                  className="size-10 shrink-0 object-cover rounded-mask"
                />
                <span className="relative inline">
                  <Body1 as="span" className="font-medium">
                    {todoTitle}
                  </Body1>
                  <ScribbleStrikethrough
                    isVisible={checked}
                    variant={index % 2 === 0 ? 'wavy' : 'loose'}
                    duration={0.5}
                  />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight className="size-4 text-zinc-400 transition-all duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-zinc-500" />
              </div>
            </div>
          </button>
        </div>
      </div>

      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={handleDialogOpenChange}>
          <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl">
            <SheetClose className="absolute right-3 top-3">
              <Button variant="ghost">
                <X className="size-4" />
              </Button>
            </SheetClose>
            <SheetHeader className="sr-only">
              <SheetTitle>Action Details</SheetTitle>
            </SheetHeader>
            <DetailContent
              title={todoTitle}
              typeLabel={typeLabel}
              typeImage={getTypeImage(action.content)}
              description={action.description}
              additionalContent={action.additionalContent}
              supplementProduct={supplementProduct}
            />
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
          <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
            <button
              type="button"
              onClick={() => handleDialogOpenChange(false)}
              className="absolute right-3 top-3 rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
            >
              <X className="size-4" />
            </button>
            <DialogHeader className="sr-only">
              <DialogTitle>Action Details</DialogTitle>
            </DialogHeader>
            <DetailContent
              title={todoTitle}
              typeLabel={typeLabel}
              typeImage={getTypeImage(action.content)}
              description={action.description}
              additionalContent={action.additionalContent}
              supplementProduct={supplementProduct}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
