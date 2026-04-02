import { DialogClose } from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { ReactNode, useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Body1, H3, H4 } from '@/components/ui/typography';
import { AiSuggestions } from '@/features/messages/components/ai-suggestions';
import { ProtocolMarkdown } from '@/features/protocol/components/protocol-markdown';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

import type { FamilyRisk } from '../api';

import { CitationCard } from './citation-card';
import { FamilyRiskBiomarkerCard } from './family-risk-biomarker-card';

type FamilyRiskDetailDialogProps = {
  children: ReactNode;
  risk: FamilyRisk;
  index: number;
};

export function FamilyRiskDetailDialog({
  children,
  risk,
  index,
}: FamilyRiskDetailDialogProps) {
  const [open, setOpen] = useState(false);
  const { width } = useWindowDimensions();

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
  }, []);

  const content = (
    <div className="relative flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-4">
          <div className="hidden size-6 items-center justify-center rounded-lg bg-zinc-200 text-sm text-secondary lg:flex">
            {index + 1}
          </div>
          <H3 className="text-2xl">{risk.title}</H3>
        </div>
        <DialogClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-secondary"
          >
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogClose>
      </div>

      {/* Inherited Risk Score */}
      {/* <div className="space-y-3">
        <Body3 className="text-zinc-500">Inherited risk score</Body3>
        <InheritedRiskIndicator score={risk.inheritedRiskScore} />
      </div> */}

      {/* Description */}
      <div className="space-y-2">
        {/* <H4>What this means</H4> */}
        <Body1 className="whitespace-pre-line">{risk.description}</Body1>
      </div>

      {/* Why This Matters */}
      {/* todo: what the fuck is this shit, fix this AI nonsense */}
      {risk.whyThisMattersForFamily && (
        <div className="space-y-2">
          <H4>Why this matters for family</H4>
          <ProtocolMarkdown content={risk.whyThisMattersForFamily} />
        </div>
      )}

      {/* Biomarkers */}
      {risk.biomarkers.length > 0 && (
        <div className="space-y-3">
          <H4>Related biomarkers</H4>
          <div className="space-y-2">
            {risk.biomarkers.map((biomarker) => (
              <FamilyRiskBiomarkerCard
                key={biomarker.id}
                biomarkerId={biomarker.id}
                biomarkerName={biomarker.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Actions to Consider */}
      {risk.whatFamilyMembersCanConsider && (
        <div className="space-y-2">
          <H4>Actions to consider</H4>
          <Body1 className="whitespace-pre-line text-zinc-600">
            {risk.whatFamilyMembersCanConsider}
          </Body1>
        </div>
      )}

      {/* Citations / Research Papers */}
      {risk.citations.length > 0 && (
        <div className="space-y-3">
          <H4>Research papers</H4>
          <div className="space-y-2">
            {risk.citations.map((citation) => (
              <CitationCard
                key={citation.doi ?? citation.title}
                citation={citation}
              />
            ))}
          </div>
        </div>
      )}

      {/* Ask Superpower AI */}
      <div className="space-y-3">
        <H4>Ask Superpower AI</H4>
        <AiSuggestions
          context={`I'm looking at my Family Risk Plan, particularly this family risk: ${risk.title}. The description says: ${risk.description}. Please give me some suggestions for questions I can ask regarding this family health risk.`}
          limit={3}
          eventName="clicked_family_risk_ai_suggestion"
          showAskOwn
        />
      </div>
    </div>
  );

  if (width <= 1024) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="flex max-h-full flex-col overflow-y-auto rounded-t-3xl">
          <SheetTitle className="sr-only">{risk.title}</SheetTitle>
          <SheetDescription className="sr-only">
            {risk.description}
          </SheetDescription>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto rounded-3xl p-0">
        <DialogTitle className="sr-only">{risk.title}</DialogTitle>
        <DialogDescription className="sr-only">
          {risk.description}
        </DialogDescription>
        {content}
      </DialogContent>
    </Dialog>
  );
}
