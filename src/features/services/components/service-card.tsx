import { ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Body1, Body2, H4 } from '@/components/ui/typography';
import { HealthcareServiceDialogContent } from '@/shared/components';
import { HealthcareService } from '@/types/api';

export const ServiceCard = ({ service }: { service: HealthcareService }) => {
  return (
    <>
      <DesktopCard service={service} />
      <MobileCard service={service} />
    </>
  );
};

const DesktopCard = ({ service }: { service: HealthcareService }) => {
  return (
    <div className="hidden h-[386px] flex-col items-start rounded-3xl border border-zinc-100 bg-zinc-100 sm:flex">
      <img
        src={service.image}
        alt={service.name}
        className="h-[190px] w-full rounded-b-2xl rounded-t-3xl object-cover"
      />
      <div className="flex flex-1 flex-col justify-between sm:p-5">
        <div className="space-y-1">
          <H4 className="line-clamp-2 text-wrap">{service.name}</H4>
          <Body2 className="line-clamp-2 text-wrap text-zinc-500">
            {service.description}
          </Body2>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="white"
              className="border border-zinc-200 px-5 py-3 hover:bg-white/30"
            >
              Get started
            </Button>
          </DialogTrigger>

          <HealthcareServiceDialogContent healthcareService={service}>
            <Button>Have you changed me?</Button>
          </HealthcareServiceDialogContent>
        </Dialog>
      </div>
    </div>
  );
};

const MobileCard = ({ service }: { service: HealthcareService }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center justify-between gap-3 rounded-[20px] bg-zinc-100 px-5 py-4 sm:hidden">
          <img
            src={service.image}
            alt={service.name}
            className="size-9 rounded-lg object-cover"
          />
          <div>
            <Body1 className="line-clamp-1">{service.name}</Body1>
            <Body2 className="line-clamp-1 text-zinc-500">
              {service.description}
            </Body2>
          </div>
          <div className="flex items-center justify-center">
            <ChevronRight className="size-4 text-zinc-500" />
          </div>
        </div>
      </DialogTrigger>
      <HealthcareServiceDialogContent healthcareService={service}>
        <Button>Have you changed me?</Button>
      </HealthcareServiceDialogContent>
    </Dialog>
  );
};
