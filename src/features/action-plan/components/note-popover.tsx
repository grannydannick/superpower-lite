import { X } from 'lucide-react';
import React, { ReactNode, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Body2, Body3 } from '@/components/ui/typography';
import { useProducts } from '@/features/action-plan/api/get-products';
import { ACTION_PLAN_INPUT_STYLE } from '@/features/action-plan/const/action-plan-input';
import { usePlan } from '@/features/action-plan/stores/plan-store';
import { useBiomarkers } from '@/features/biomarkers/api/get-biomarkers';
import { STATUS_OPTIONS } from '@/features/biomarkers/const/toolbar-options';
import { useServices } from '@/features/services/api/get-services';
import { cn } from '@/lib/utils';
import { Biomarker, HealthcareService, PlanGoal, Product } from '@/types/api';

interface PopoverOption {
  name: string;
  icon?: JSX.Element;
  image?: string;
}

const options: PopoverOption[] = [
  {
    name: 'Biomarker',
    icon: (
      <img
        src="/action-plan/biomarker-option.webp"
        alt="Biomarker"
        className="size-12 rounded-lg border border-zinc-200"
      />
    ),
  },
  {
    name: 'Product',
    icon: (
      <img
        src="/action-plan/product-option.webp"
        alt="Product"
        className="size-12 rounded-lg border border-zinc-200"
      />
    ),
  },
  {
    name: 'Service',
    icon: (
      <img
        src="/action-plan/service-option.webp"
        alt="Service"
        className="size-12 rounded-lg border border-zinc-200"
      />
    ),
  },
];

interface BiomarkerOption {
  item: Biomarker;
  type: 'BIOMARKER';
}

interface ProductOption {
  item: Product;
  type: 'PRODUCT';
}

interface ServiceOption {
  item: HealthcareService;
  type: 'SERVICE';
}

interface ClinicianNotePopoverInterface {
  goal: PlanGoal; // Pass in the goal to access the goal type
}

export function ClinicianNotePopover({
  goal,
}: ClinicianNotePopoverInterface): ReactNode {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBiomarkers, setSelectedBiomarkers] = useState<Biomarker[]>([]);
  const [selectedServices, setSelectedServices] = useState<HealthcareService[]>(
    [],
  );
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const { insertGoalItem } = usePlan((s) => s);

  const biomarkersQuery = useBiomarkers();
  const servicesQuery = useServices();
  const productsQuery = useProducts();

  // Handle different goal types
  const getValidOptions = () => {
    switch (goal.type) {
      case 'ANNUAL_REPORT_PROTOCOLS':
        // Allow only Products and Services for ANNUAL_REPORT_PROTOCOLS
        return options.filter(
          (option) => option.name === 'Product' || option.name === 'Service',
        );
      case 'ANNUAL_REPORT_PRIMARY':
      case 'DEFAULT':
        // Only allow Biomarkers for ANNUAL_REPORT_PRIMARY
        return options.filter((option) => option.name === 'Biomarker');
      default:
        return options;
    }
  };

  const getButtonLabel = () => {
    switch (goal.type) {
      case 'ANNUAL_REPORT_PRIMARY':
      case 'DEFAULT':
        return '+ Add biomarker';
      case 'ANNUAL_REPORT_PROTOCOLS':
        return '+ Add product or service';
      default:
        return '+ Add biomarker, product, or service';
    }
  };

  const getLength = () => {
    switch (selectedCategory) {
      case 'Service':
        return selectedServices.length;
      case 'Product':
        return selectedProducts.length;
      case 'Biomarker':
        return selectedBiomarkers.length;
      default:
        return 0;
    }
  };

  const updateItems = (option: HealthcareService | Biomarker | Product) => {
    switch (selectedCategory) {
      case 'Biomarker':
        return setSelectedBiomarkers((prev) =>
          prev.find((item) => item.id === option.id)
            ? prev.filter((item) => item.id !== option.id)
            : [...prev, option as Biomarker],
        );
      case 'Product':
        return setSelectedProducts((prev) =>
          prev.find((item) => item.id === option.id)
            ? prev.filter((item) => item.id !== option.id)
            : [...prev, option as Product],
        );
      case 'Service':
        return setSelectedServices((prev) =>
          prev.find((item) => item.id === option.id)
            ? prev.filter((item) => item.id !== option.id)
            : [...prev, option as HealthcareService],
        );
    }
  };

  const clearSelection = () => {
    setSelectedCategory('');
    setQuery('');
    setSelectedBiomarkers([]);
    setSelectedProducts([]);
    setSelectedServices([]);
  };

  const renderList = (): HealthcareService[] | Biomarker[] | Product[] => {
    switch (selectedCategory) {
      case 'Biomarker':
        return (
          biomarkersQuery.data?.biomarkers.filter((biomarker) =>
            biomarker.name.toLowerCase().includes(query.toLowerCase()),
          ) ?? []
        );
      case 'Product':
        return (
          productsQuery.data?.products.filter((product) =>
            product.name.toLowerCase().includes(query.toLowerCase()),
          ) ?? []
        );
      case 'Service':
        return (
          servicesQuery.data?.services.filter((service) =>
            service.name.toLowerCase().includes(query.toLowerCase()),
          ) ?? []
        );
      default:
        return [];
    }
  };

  const renderOption = (option: HealthcareService | Biomarker | Product) => {
    if (
      goal.type === 'ANNUAL_REPORT_PROTOCOLS' &&
      selectedCategory === 'Biomarker'
    ) {
      return null; // Disallow Biomarkers for ANNUAL_REPORT_PROTOCOLS
    }

    switch (selectedCategory) {
      case 'Biomarker':
        return { item: option, type: 'BIOMARKER' } as BiomarkerOption;
      case 'Product':
        return { item: option, type: 'PRODUCT' } as ProductOption;
      case 'Service':
        return { item: option, type: 'SERVICE' } as ServiceOption;
      default:
        return null;
    }
  };

  const addSelectedItems = () => {
    switch (selectedCategory) {
      case 'Biomarker': {
        insertGoalItem(selectedBiomarkers, 'BIOMARKER', goal.id);
        clearSelection();
        break;
      }
      case 'Product':
        insertGoalItem(selectedProducts, 'PRODUCT', goal.id);
        clearSelection();
        break;
      case 'Service':
        insertGoalItem(selectedServices, 'SERVICE', goal.id);
        clearSelection();
        break;
      default:
        break;
    }
  };

  const [open, setOpen] = useState(false);

  // Hide the popover if the goal type is ANNUAL_REPORT_SECONDARY
  if (goal.type === 'ANNUAL_REPORT_SECONDARY') {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="pl-4 text-zinc-400">
          {getButtonLabel()}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[320px] rounded-[20px] p-2"
        onCloseAutoFocus={clearSelection}
      >
        {selectedCategory && (
          <>
            <div className="flex items-center justify-between px-4 py-2">
              <Body3 className="text-zinc-400">{selectedCategory}</Body3>
              <Body3 className="text-zinc-400">{getLength()} Selected</Body3>
            </div>
            <div className="flex items-center px-6 py-3">
              <Input
                className={cn(
                  ACTION_PLAN_INPUT_STYLE,
                  'text-base placeholder:text-base',
                )}
                placeholder="Search..."
                onChange={(e) => setQuery(e.target.value)}
              />
              <X
                className="h-4 min-w-4 cursor-pointer text-zinc-500"
                onClick={clearSelection}
              />
            </div>
          </>
        )}
        {!selectedCategory && (
          <div className="px-4 py-2">
            <Body2 className="text-zinc-400">Select category</Body2>
          </div>
        )}

        <div className="max-h-[220px] overflow-y-auto">
          {!selectedCategory
            ? getValidOptions().map((option, index) => (
                <CategoryBlock
                  key={index}
                  option={option}
                  onClick={(option) => setSelectedCategory(option)}
                />
              ))
            : renderList().map((filteredOption) => (
                <OptionBlock
                  key={filteredOption.id}
                  option={renderOption(filteredOption)}
                  onClick={(option) => updateItems(option)}
                />
              ))}
        </div>

        {selectedCategory && (
          <div className="flex justify-center">
            <Button
              className={cn(
                `mt-3 w-full rounded-2xl px-1.5 py-4`,
                getLength() === 0
                  ? 'bg-zinc-200 text-zinc-500 hover:bg-inherit disabled:opacity-100'
                  : null,
              )}
              disabled={getLength() === 0}
              onClick={addSelectedItems}
            >
              Insert
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function CategoryBlock({
  option,
  onClick,
}: {
  option: PopoverOption;
  onClick: (option: string) => void;
}): JSX.Element {
  return (
    <div
      role="presentation"
      className="flex w-full cursor-pointer items-center gap-[16px] p-[16px] hover:rounded-2xl hover:bg-[#F7F7F7]"
      onClick={() => onClick(option.name)}
    >
      <div className="flex items-center justify-center rounded-[8px] bg-zinc-50">
        {option?.icon ? (
          option.icon
        ) : (
          <img
            alt={option.name}
            src={option.image}
            className="size-[34px] object-contain"
          />
        )}
      </div>
      <p className="text-base text-black">{option.name}</p>
    </div>
  );
}

function OptionBlock({
  option,
  onClick,
}: {
  option: BiomarkerOption | ServiceOption | ProductOption | null;
  onClick: (option: Product | Biomarker | HealthcareService) => void;
}): JSX.Element {
  const [checked, setChecked] = useState(false);

  if (!option) {
    return <></>;
  }

  const onSelect = (option: Product | Biomarker | HealthcareService) => {
    onClick(option);
    setChecked((prev) => !prev);
  };

  function renderImage() {
    switch (option?.type) {
      case 'SERVICE':
        return (
          <img
            alt={option.item.name}
            src={option.item.image}
            className="size-12 rounded-lg border border-zinc-200 bg-zinc-50 object-cover"
          />
        );
      case 'PRODUCT':
        return (
          <img
            alt={option.item.name}
            src={option.item.image}
            className="size-12 rounded-lg border border-zinc-200 bg-zinc-50 object-cover"
          />
        );
      case 'BIOMARKER':
        return (
          <img
            alt={option.item.name}
            src="/services/custom_blood_panel.png"
            className="size-12 rounded-lg border border-zinc-200 bg-zinc-50 object-cover"
          />
        );
      default:
        return null;
    }
  }

  function renderBiomarker(biomarker: Biomarker) {
    const statusOption = STATUS_OPTIONS.find(
      (option) =>
        option.value === biomarker.status.toLowerCase() ||
        option.value.includes(biomarker.status.toLowerCase()),
    );

    // Map status to Tailwind color classes
    const statusColorClasses: Record<string, string> = {
      'green-400': 'bg-green-400',
      'yellow-300': 'bg-yellow-300',
      'fuchsia-400': 'bg-fuchsia-400',
    };

    // Determine the correct color class for the biomarker status
    const statusColor = statusOption
      ? statusColorClasses[statusOption.color]
      : 'bg-gray-300'; // Default color if status is not found

    // Determine the text label for the biomarker status
    const statusText = statusOption ? statusOption.label : 'Unknown';

    return (
      <div className="flex items-center gap-[16px]">
        {renderImage()}
        <div>
          <p className="text-base">{biomarker.name}</p>
          <div className="flex items-center gap-2">
            <div className={`size-2 ${statusColor} rounded-full`} />
            <p className="text-xs text-zinc-400">{statusText}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="presentation"
      className="flex w-full cursor-pointer items-center justify-between p-4 hover:rounded-2xl hover:bg-[#F7F7F7]"
      onClick={() => onSelect(option.item)}
    >
      {option.type === 'BIOMARKER' ? (
        renderBiomarker(option.item as Biomarker)
      ) : (
        <div className="flex items-center gap-[16px]">
          {renderImage()}
          <h3 className="text-base text-black">{option.item.name}</h3>
        </div>
      )}
      <Checkbox checked={checked} />
    </div>
  );
}
