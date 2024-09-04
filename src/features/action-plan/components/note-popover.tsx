import { HammerIcon, Pill, ServerIcon } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useProducts } from '@/features/action-plan/api/get-products';
import { usePlan } from '@/features/action-plan/stores/plan-store';
import { useBiomarkers } from '@/features/biomarkers/api/get-biomarkers';
import { useServices } from '@/features/services/api/get-services';
import { Biomarker, HealthcareService, Product } from '@/types/api';

interface PopoverOption {
  name: string;
  icon?: JSX.Element;
  image?: string;
}

const options: PopoverOption[] = [
  {
    name: 'Biomarker',
    icon: <HammerIcon width={24} height={24} color="#3F3F46" />,
  },
  { name: 'Product', icon: <Pill width={24} height={24} color="#3F3F46" /> },
  {
    name: 'Service',
    icon: <ServerIcon width={24} height={24} color="#3F3F46" />,
  },
  // { name: 'Template' },
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
  goalIndex: number;
}

export function ClinicianNotePopover({
  goalIndex,
}: ClinicianNotePopoverInterface): JSX.Element {
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
    setOpen(false);
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
        insertGoalItem(selectedBiomarkers, 'BIOMARKER', goalIndex);
        clearSelection();
        break;
      }
      case 'Product':
        insertGoalItem(selectedProducts, 'PRODUCT', goalIndex);
        clearSelection();
        break;
      case 'Service':
        insertGoalItem(selectedServices, 'SERVICE', goalIndex);
        clearSelection();
        break;
      default:
        break;
    }
  };

  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost">+ Add biomarker, product, or service</Button>
      </PopoverTrigger>
      <PopoverContent
        className="relative max-h-[400px] w-[338px] overflow-y-auto !rounded-[20px] p-2"
        onCloseAutoFocus={clearSelection}
      >
        {selectedCategory && (
          <Input
            className="w-full border-none px-[16px] py-[12px] caret-[#FC5F2B] placeholder:text-base placeholder:text-[#E4E4E7]"
            placeholder="protein"
            onChange={(e) => setQuery(e.target.value)}
          />
        )}
        <div className="flex justify-between px-[16px] pb-[8px]">
          {selectedCategory && (
            <div className="flex w-full justify-between">
              <div role="presentation" onClick={clearSelection}>
                <p className="cursor-pointer text-xs text-[#71717A] hover:text-[#FC5F2B]">
                  Cancel
                </p>
              </div>
              <p className="text-xs text-[#A1A1AA]">{getLength()} Selected</p>
            </div>
          )}
        </div>
        {!selectedCategory
          ? options.map((option, index) => (
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
        {selectedCategory && (
          <Button
            className={`sticky bottom-[8px] w-[304px] rounded-[15px] px-[6px] py-[16px] text-base ${
              getLength() > 0
                ? 'bg-[#18181B] hover:bg-[#18181B]'
                : 'bg-[#E4E4E7] text-[#71717A] hover:bg-[#E4E4E7] disabled:opacity-10'
            }`}
            disabled={getLength() === 0}
            onClick={addSelectedItems}
          >
            Insert All
          </Button>
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
      className="flex w-full cursor-pointer items-center gap-[16px] p-[16px]"
      onClick={() => onClick(option.name)}
    >
      <div className="flex size-[48px] items-center justify-center rounded-[8px] border border-black bg-[#F9F9F9]">
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
      <h3 className="text-base text-black">{option.name}</h3>
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
            className="size-[34px] object-contain"
          />
        );
      case 'PRODUCT':
        return (
          <img
            alt={option.item.name}
            src={option.item.image}
            className="size-[34px] object-contain"
          />
        );
      case 'BIOMARKER':
        return (
          <img
            alt={option.item.name}
            src="/services/custom_blood_panel.png"
            className="size-[34px] object-contain"
          />
        );
      default:
        return <>123</>;
    }
  }

  return (
    <div className="flex w-full cursor-pointer items-center justify-between p-[16px]">
      <div className="flex items-center gap-[16px]">
        <div className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-[8px] border border-black bg-[#F9F9F9]">
          {renderImage()}
        </div>
        <h3 className="text-base text-black">{option.item.name}</h3>
      </div>
      <Checkbox checked={checked} onClick={() => onSelect(option.item)} />
    </div>
  );
}
