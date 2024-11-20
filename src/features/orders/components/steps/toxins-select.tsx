import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@radix-ui/react-accordion';
import { ChevronDown, Loader } from 'lucide-react';
import React, { ReactNode, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  ENVIRONMENTAL_TOXIN_TEST,
  HEAVY_METALS_TEST,
  MYCOTOXINS_TEST,
  TOTAL_TOXIN_TEST,
} from '@/const';
import { ENVIRONMENTAL_TOXIN_PANEL } from '@/const/toxin-panel';
import { HealthcareServiceFooter } from '@/features/orders/components/healthcare-service-footer';
import { useOrder } from '@/features/orders/stores/order-store';
import { useServices } from '@/features/services/api';
import { useStepper } from '@/lib/stepper';
import { cn } from '@/lib/utils';
import { HealthcareService } from '@/types/api';
import { EnvironmentalToxinType } from '@/types/toxin';
import { formatMoney } from '@/utils/format-money';

export function ToxinsSelect(): ReactNode {
  const service = useOrder((s) => s.service);

  const isEnvironmental = Boolean(
    ENVIRONMENTAL_TOXIN_PANEL.find((p) => p.name === service.name),
  );

  const [selectedToxin, setSelectedToxin] = useState<EnvironmentalToxinType>(
    isEnvironmental ? (service.name as EnvironmentalToxinType) : 'Total Toxins',
  );
  const { nextStep } = useStepper((s) => s);
  const { data: servicesData, isLoading: servicesLoading } = useServices();
  const updateService = useOrder((s) => s.updateService);

  useEffect(() => {
    if (servicesData) {
      updateSelectedService(selectedToxin);
    }
  }, [selectedToxin, servicesData]);

  const updateSelectedService = (selectedToxin: EnvironmentalToxinType) => {
    const selectedPanel = servicesData?.services.find(
      (service) => service.name === selectedToxin,
    );

    if (selectedPanel) {
      updateService(selectedPanel);
    }
  };

  if (servicesLoading || !servicesData) {
    return <Loader className="m-auto" />;
  }

  const sortOrder = [
    TOTAL_TOXIN_TEST,
    MYCOTOXINS_TEST,
    ENVIRONMENTAL_TOXIN_TEST,
    HEAVY_METALS_TEST,
  ];

  const filteredAndSortedToxins = servicesData.services
    .filter((service) =>
      ENVIRONMENTAL_TOXIN_PANEL.some((panel) => panel.name === service.name),
    )
    .sort((a, b) => sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name));

  return (
    <>
      <div className="flex flex-col-reverse gap-6 p-6 sm:flex-row md:p-14">
        <div className="flex flex-col justify-between space-y-4">
          <div className="flex flex-col items-start">
            <h1 className="pb-2 text-[32px] text-primary">
              Select Environmental Toxin Package
            </h1>
            <p className="max-w-[554px] text-sm leading-[20px] text-[#71717A]">
              Choose a package to know how heavy metals, pesticides, plastics,
              and other environmental toxins may be harming your health.
              Non-refundable once purchased.
            </p>
          </div>
          <ToxinPanelGroup
            toxinPanels={filteredAndSortedToxins}
            selectedToxin={selectedToxin}
            setSelectedToxin={setSelectedToxin}
          />
        </div>
      </div>
      <HealthcareServiceFooter
        nextBtn={
          <Button
            onClick={nextStep}
            disabled={!location}
            className="w-full md:w-auto"
          >
            Next
          </Button>
        }
      />
    </>
  );
}

function ToxinPanelGroup({
  toxinPanels,
  selectedToxin,
  setSelectedToxin,
}: {
  toxinPanels: HealthcareService[];
  selectedToxin: EnvironmentalToxinType;
  setSelectedToxin: (value: EnvironmentalToxinType) => void;
}): ReactNode {
  return (
    <RadioGroup
      value={selectedToxin}
      onValueChange={setSelectedToxin}
      className="flex w-full flex-col gap-2"
    >
      {toxinPanels.map((toxinPanel, index) => (
        <ToxinPanelSelection
          key={toxinPanel.id}
          toxinPanel={toxinPanel}
          isSelected={toxinPanel.name === selectedToxin}
          onSelect={() =>
            setSelectedToxin(toxinPanel.name as EnvironmentalToxinType)
          }
          index={index}
        />
      ))}
    </RadioGroup>
  );
}

function ToxinPanelSelection({
  toxinPanel,
  isSelected,
  onSelect,
  index,
}: {
  toxinPanel: HealthcareService;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}): JSX.Element {
  const showBadge = index === 0;
  const showAccordion = index !== 0;
  const toxinPackage = ENVIRONMENTAL_TOXIN_PANEL.find(
    (panel) => panel.name === toxinPanel.name,
  );
  const pdfReportSampleLink = toxinPackage?.pdfUrl;
  return (
    <div className="relative cursor-pointer ">
      <div
        className={cn(
          'toxin-package-container flex flex-col border rounded-[20px] p-6',
          isSelected ? 'border-zinc-200' : 'bg-white',
        )}
        role="presentation"
        onClick={onSelect}
      >
        <div className="flex w-full items-start justify-between xs:gap-4 md:gap-0">
          <RadioGroupItem
            className="mr-2 md:hidden"
            value={toxinPanel.name}
            id={toxinPanel.name}
            checked={isSelected}
          />
          <div className="flex-1 flex-row items-center">
            <div className="flex flex-row gap-[10px]">
              <h2 className="leading-6 text-zinc-900">{toxinPanel.name}</h2>
              {showBadge && (
                <Badge className="bg-vermillion-100" variant="default">
                  <span className="text-xs text-[#FC5F2B]">Most popular</span>
                </Badge>
              )}
            </div>
            {showBadge && (
              <p className="mt-1 text-sm leading-5 text-zinc-500">
                {toxinPanel.description}
              </p>
            )}
            {showAccordion && (
              <Accordion type="single" collapsible className="mt-1">
                <AccordionItem value={`item-${index}`}>
                  <AccordionTrigger className="flex flex-row items-center space-x-1 text-sm text-zinc-500 [&[data-state=open]>svg]:rotate-180">
                    See more
                    <ChevronDown className="size-4 shrink-0 transition-transform duration-200" />
                  </AccordionTrigger>
                  <AccordionContent className="overflow-hidden pt-2 transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                    <p className="line-clamp-2 text-sm leading-5 text-zinc-500">
                      {toxinPanel.description}
                    </p>
                    {pdfReportSampleLink && (
                      <a
                        href={pdfReportSampleLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 flex cursor-pointer items-center space-x-1 text-sm text-primary"
                      >
                        <span>View sample report</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="17"
                          viewBox="0 0 16 17"
                          fill="none"
                        >
                          <path
                            d="M4.66797 11.8893L11.3346 5.22266"
                            stroke="#FC5F2B"
                            strokeWidth="1.33333"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M4.66797 5.22266H11.3346V11.8893"
                            stroke="#FC5F2B"
                            strokeWidth="1.33333"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </a>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
            <Label className="mt-1 md:hidden" htmlFor={toxinPanel.name}>
              <span className="text-zinc-500">
                {formatMoney(toxinPanel.price)}
              </span>
            </Label>
          </div>
          <div className="flex h-[48px] items-center space-x-6">
            <Label className="hidden md:block" htmlFor={toxinPanel.name}>
              <span className="text-zinc-500">
                {formatMoney(toxinPanel.price)}
              </span>
            </Label>
            <RadioGroupItem
              className="hidden md:block"
              value={toxinPanel.name}
              id={toxinPanel.name}
              checked={isSelected}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
