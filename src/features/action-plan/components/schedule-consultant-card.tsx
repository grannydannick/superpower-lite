import { ChevronDown } from 'lucide-react';
import { ReactNode, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Body1, H2, H4, Mono } from '@/components/ui/typography';
import { ADVISORY_CALL } from '@/const';
import { HealthcareServiceDialog } from '@/features/orders/components/healthcare-service-dialog';
import { useServices } from '@/features/services/api';
import { cn } from '@/lib/utils';

export const ScheduleConsultDoctorCard: ({
  className,
}: {
  className?: string;
}) => ReactNode = ({ className }) => {
  return (
    <div
      className={cn(
        'cursor-pointer flex bg-zinc-50',
        'gap-3 p-4 w-full rounded-2xl',
        className,
      )}
    >
      <img
        className="size-12 rounded-lg"
        src="/services/1-1_advisory_call.png"
        alt="consult"
      />
      <div className="flex grow flex-col justify-center">
        <div className="flex gap-3">
          <Body1 className="line-clamp-1">Longevity Clinician Consult</Body1>
          {/*<Badge*/}
          {/*  className="max-h-6 bg-zinc-200 text-xs text-black"*/}
          {/*  variant="default"*/}
          {/*>*/}
          {/*  Included*/}
          {/*</Badge>*/}
        </div>
        <p className="mt-1 text-xs text-zinc-400">
          Get expert advice & health planning from the Superpower medical team.
        </p>
      </div>
    </div>
  );
};

export const ConsultationCard: ({
  className,
}: {
  className?: string;
}) => ReactNode = ({ className }) => {
  const [isOpen, setIsOpen] = useState(true);
  const servicesQuery = useServices();
  const advisoryService = servicesQuery.data?.services.find(
    (service) => service.name === ADVISORY_CALL,
  );

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(className)}
    >
      <div className="flex w-full items-center justify-between">
        <H2>Schedule your next consult</H2>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="small">
            <ChevronDown
              className={cn(
                'size-6 text-zinc-900 transition-transform duration-200',
                isOpen ? 'rotate-180' : '',
              )}
            />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="pt-6">
        <H4>Get personalized advice on your action plan</H4>
        <ScheduleConsultDoctorCard className="mt-6 w-full" />
        <div className="mt-8 flex flex-col items-center">
          {advisoryService && (
            <HealthcareServiceDialog healthcareService={advisoryService}>
              <Button variant="default" className="rounded-full">
                Schedule
              </Button>
            </HealthcareServiceDialog>
          )}
          {!advisoryService && (
            <p className="mt-6 max-w-[373px] text-center text-xs uppercase text-black">
              Advisory service not available.
            </p>
          )}
          <Mono className="mt-6 max-w-[373px] text-center opacity-70">
            Most members find it helpful to book a <br />
            consult to discuss their action plan
          </Mono>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
