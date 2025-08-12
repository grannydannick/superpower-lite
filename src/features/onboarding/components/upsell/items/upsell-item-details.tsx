import { ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';

import { PdfViewer } from '@/components/shared/pdf-viewer';
import { StyledMarkdown } from '@/components/shared/styled-markdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { toast } from '@/components/ui/sonner';
import { Body1, H3, H4 } from '@/components/ui/typography';
import { useOrders } from '@/features/orders/api';
import { useAnalytics } from '@/hooks/use-analytics';
import { useScrollDetection } from '@/hooks/use-scroll-detection';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { cn } from '@/lib/utils';
import { HealthcareService } from '@/types/api';
import { ServiceFaq } from '@/types/service';
import { formatMoney } from '@/utils/format-money';
import {
  getDetailsForService,
  getSampleReportLinkForService,
} from '@/utils/service';

import { ItemPreview } from '../item-preview';

const SampleReportDialog = ({
  url,
  children,
}: {
  url: string;
  children: React.ReactNode;
}) => {
  const { width } = useWindowDimensions();

  if (width <= 768) {
    return (
      <Sheet>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="flex max-h-full flex-col rounded-t-[10px]">
          <PdfViewer name="Sample Report" url={url} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="h-full max-h-[80%] max-w-2xl">
        <PdfViewer name="Sample Report" url={url} />
      </DialogContent>
    </Dialog>
  );
};

export const UpsellItemDetails = ({
  item,
  selectItem,
  goToNext,
}: {
  item: HealthcareService & { tag?: string; faqs?: ServiceFaq[] };
  selectItem: (item: HealthcareService) => void;
  goToNext: () => void;
}) => {
  const { isScrolled, isAtBottom } = useScrollDetection({
    threshold: 180,
    bottomOffset: 10,
  });
  const sampleReportLink = getSampleReportLinkForService(item.name);
  const skipButtonRef = useRef<HTMLButtonElement>(null);

  const { data, isLoading } = useOrders();
  const { track } = useAnalytics();
  const serviceDetails = getDetailsForService(item.name);

  const isAlreadyBooked = useMemo(() => {
    return (
      data?.orders?.find((order) => order.name === item.name) !== undefined
    );
  }, [data, item.name]);

  useEffect(() => {
    if (isAlreadyBooked) {
      toast.success(`${item.name} is already paid`);
    }
  }, [isAlreadyBooked, item.name]);

  // disable skip button if user hasn't scrolled to the bottom of the page
  useEffect(() => {
    const skipButton = skipButtonRef.current;
    if (!skipButton || isAlreadyBooked) return;

    skipButton.disabled = isLoading || !isAtBottom;
  }, [isLoading, isAlreadyBooked, isAtBottom]);

  return (
    <>
      <div className="mx-auto flex size-full flex-col items-start px-6 pt-8 md:mt-0 lg:max-w-[512px] lg:pt-16">
        {item.tag && (
          <Badge
            className={cn(
              'mb-4 rounded-lg bg-vermillion-100 px-2 py-1 text-sm text-vermillion-900 transition-all duration-500',
              isScrolled &&
                '-translate-y-10 opacity-0 lg:translate-y-0 lg:opacity-100',
            )}
          >
            {item.tag}
          </Badge>
        )}
        <div
          className={cn(
            'mb-4 w-full transition-all duration-500',
            isScrolled &&
              '-translate-y-10 opacity-0 lg:translate-y-0 lg:opacity-100',
          )}
        >
          <div className="flex w-full flex-1 items-center justify-between gap-4">
            <H3 className="m-0 mb-1 leading-none text-primary">{item.name}</H3>
          </div>
          <H4 className="m-0 text-primary">
            {isAlreadyBooked ? '$0 (Paid already)' : formatMoney(item.price)}
          </H4>
        </div>
        <Body1 className="mb-8 text-zinc-500 md:order-none">
          {item.description}
        </Body1>

        <div className="w-full pb-64 lg:pb-0">
          <div className="w-full space-y-6">
            {serviceDetails?.faqs
              ? serviceDetails.faqs.map((faq, index) => {
                  return (
                    <div key={index} className="space-y-3">
                      <H4 className="m-0 text-zinc-900">{faq.question}</H4>
                      <StyledMarkdown className="space-y-4 text-zinc-500">
                        {faq.answer}
                      </StyledMarkdown>
                    </div>
                  );
                })
              : null}
          </div>
        </div>
        <div className="sticky top-[calc(100dvh-15rem)] z-50 order-first -mt-80 w-full space-y-2 bg-gradient-to-b from-transparent via-zinc-50 to-zinc-50 pb-6 md:static md:top-0 md:order-none md:mt-0 md:pb-0">
          {sampleReportLink && (
            <div className="mb-4 w-full lg:pb-0">
              <SampleReportDialog url={sampleReportLink.pdf}>
                <Button
                  variant="ghost"
                  className="group mt-8 flex w-full items-center justify-between gap-4 rounded-[20px] bg-zinc-100 px-4 py-3 text-zinc-500 hover:bg-zinc-200/50"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={sampleReportLink.preview}
                      alt="Report Placeholder"
                      className="h-10 w-8 rounded-md object-cover shadow-md transition-all group-hover:-rotate-2 group-hover:scale-105 group-hover:shadow-lg"
                    />
                    <Body1 className="text-zinc-500 transition-all group-hover:text-zinc-600">
                      View sample report
                    </Body1>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-zinc-400 transition-all group-hover:translate-x-0.5 group-hover:text-zinc-500"
                  />
                </Button>
              </SampleReportDialog>
            </div>
          )}
          <Button
            onClick={() => {
              selectItem(item);

              // track service addition
              if (!isAlreadyBooked) {
                track('added_service', {
                  service_name: item.name,
                  amount: item.price,
                  value: item.price,
                });
              }

              // show toast for user feedback
              if (!isAlreadyBooked) {
                toast.success(`${item.name} added`);
              }

              goToNext();
            }}
            disabled={isLoading}
            className="w-full hover:bg-zinc-800"
          >
            {isAlreadyBooked ? 'Next service' : 'Add to cart'}
          </Button>
          <Button
            onClick={goToNext}
            variant="ghost"
            disabled={isLoading || isAlreadyBooked}
            size="icon"
            className="group h-12 w-full flex-1 border border-zinc-100 bg-white text-base text-zinc-500 shadow-sm hover:text-zinc-600 disabled:bg-white/75 disabled:text-zinc-300 disabled:opacity-100 disabled:backdrop-blur-md md:border-transparent md:bg-transparent md:shadow-none"
            ref={skipButtonRef}
          >
            Skip
            <ChevronRight
              size={18}
              className="ml-0.5 size-4 transition-all group-hover:translate-x-0.5"
            />
          </Button>
        </div>
      </div>
      <div
        className={cn(
          'sticky top-8 order-first flex aspect-square size-full max-h-[calc(100dvh-4.5rem)] w-full overflow-hidden px-4 transition-all duration-500 max-lg:items-start lg:-order-first lg:aspect-auto',
        )}
      >
        <div
          className={cn(
            'flex h-auto w-full items-center overflow-hidden rounded-3xl bg-white transition-all lg:bg-transparent',
            isScrolled && 'shadow-md shadow-black/[.03]',
          )}
        >
          <div
            className={cn(
              'relative flex aspect-square h-full items-start justify-between transition-all duration-500',
              isScrolled ? 'w-20 lg:w-full' : 'w-full',
            )}
          >
            {item.image && <ItemPreview image={item.image} />}
          </div>
          <div
            className={cn(
              'flex flex-1 flex-col justify-between overflow-hidden transition-all',
              isScrolled
                ? 'opacity-100 delay-200'
                : 'max-w-0 translate-x-10 opacity-0',
            )}
          >
            <Body1>{item.name}</Body1>
            <Body1 className="text-secondary">
              {isAlreadyBooked ? '$0 (Paid already)' : formatMoney(item.price)}
            </Body1>
          </div>
        </div>
      </div>
    </>
  );
};
