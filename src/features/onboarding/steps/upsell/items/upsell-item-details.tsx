import { ChevronRight } from 'lucide-react';
import { useEffect, useMemo } from 'react';

import { PdfViewer } from '@/components/shared/pdf-viewer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { toast } from '@/components/ui/sonner';
import { Body1, Body2, H3, H4 } from '@/components/ui/typography';
import { useOrders } from '@/features/orders/api';
import { ServiceFaqs } from '@/features/services/components/service-faqs';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { HealthcareService } from '@/types/api';
import { ServiceFaq } from '@/types/service';
import { formatMoney } from '@/utils/format-money';
import { getSampleReportLinkForService } from '@/utils/service';

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
  const sampleReportLink = getSampleReportLinkForService(item.name);

  const { data, isLoading } = useOrders();

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

  return (
    <>
      <div className="mx-auto -mt-16 mb-16 flex size-full flex-col items-start px-6 md:mt-0 lg:max-w-[512px] lg:pt-16">
        {item.tag && (
          <Badge className="mb-4 rounded-lg bg-vermillion-100 px-2 py-1 text-sm text-vermillion-900">
            {item.tag}
          </Badge>
        )}
        <div className="mb-4 w-full">
          <div className="flex w-full flex-1 items-center justify-between gap-4">
            <H3 className="m-0 mb-1 leading-none text-primary">{item.name}</H3>
            <Button
              onClick={goToNext}
              variant="ghost"
              disabled={isLoading || isAlreadyBooked}
              size="icon"
              className="group text-base text-zinc-500 hover:text-zinc-600"
            >
              Skip
              <ChevronRight
                size={18}
                className="ml-0.5 size-4 transition-all group-hover:translate-x-0.5"
              />
            </Button>
          </div>
          <H4 className="m-0 text-primary">
            {isAlreadyBooked ? '$0 (Paid already)' : formatMoney(item.price)}
          </H4>
        </div>
        <Body2 className="mb-8 text-zinc-500 md:order-none">
          {item.description}
        </Body2>
        <Button
          onClick={() => {
            selectItem(item);

            // show toast for user feedback
            if (!isAlreadyBooked) {
              toast.success(`${item.name} added`);
            }

            goToNext();
          }}
          disabled={isLoading}
          className="sticky top-[calc(100dvh-4.5rem)] z-50 order-first w-full hover:bg-zinc-800 md:static md:top-0 md:order-none"
        >
          {isAlreadyBooked ? 'Next service' : 'Add to cart'}
        </Button>
        <div className="-mt-2 w-full md:mt-8">
          <ServiceFaqs serviceName={item.name} />
        </div>
        {sampleReportLink && (
          <div className="w-full pb-20 lg:pb-0">
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
      </div>
      <div className="top-8 order-first flex size-full max-h-[calc(100dvh-4.5rem)] px-4 lg:sticky lg:-order-first">
        {item.image && <ItemPreview image={item.image} />}
      </div>
    </>
  );
};
