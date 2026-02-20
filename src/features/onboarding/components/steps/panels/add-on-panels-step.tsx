import { ChevronLeft, Plus, Search, X } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';

import { Head } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, Body2, H2, H3 } from '@/components/ui/typography';
import { SUPERPOWER_BLOOD_PANEL, TOTAL_TOXIN_TEST_ID } from '@/const/services';
import { useCreateCredit, useCredits } from '@/features/orders/api/credits';
import { useServices } from '@/features/services/api';
import { usePaymentMethods } from '@/features/settings/api';
import { cn } from '@/lib/utils';
import { HealthcareService } from '@/types/api';
import { formatMoney } from '@/utils/format-money';
import { getServiceImage } from '@/utils/service';

import { useOnboardingAnalytics } from '../../../hooks/use-onboarding-analytics';
import { useOnboardingNavigation } from '../../../hooks/use-onboarding-navigation';
import { useAddOnPanelStore } from '../../../stores/add-on-panel-store';
import { Sequence } from '../../sequence';

const FILTER_OPTIONS = [
  { id: 'all', label: 'All tests' },
  { id: 'metabolic', label: 'Metabolic' },
  { id: 'heart', label: 'Heart health' },
  { id: 'hormones', label: 'Hormones' },
] as const;

type FilterId = (typeof FILTER_OPTIONS)[number]['id'];

const FILTER_KEYWORDS: Record<FilterId, string[]> = {
  all: [],
  metabolic: [
    'metabolic',
    'glucose',
    'insulin',
    'diabetes',
    'energy',
    'weight',
  ],
  heart: ['heart', 'cardio', 'cardiovascular', 'cholesterol', 'lipid'],
  hormones: ['hormone', 'fertility', 'reproductive', 'testosterone', 'thyroid'],
};

const ExploreTestsSearch = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search"
        className="h-11 rounded-full border-none bg-zinc-100 pl-11 pr-10 font-normal text-primary shadow-none outline-none placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-100"
      />
      {value.trim().length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-zinc-400 hover:text-primary"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
};

const FilterPills = ({
  activeFilter,
  onFilterChange,
}: {
  activeFilter: FilterId;
  onFilterChange: (filter: FilterId) => void;
}) => (
  <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
    {FILTER_OPTIONS.map((option) => {
      const isActive = activeFilter === option.id;
      return (
        <Button
          key={option.id}
          type="button"
          size="small"
          variant={isActive ? 'default' : 'outline'}
          className={cn(
            'shrink-0 whitespace-nowrap rounded-full border shadow-none',
            isActive ? 'border-primary' : 'border-zinc-200 text-secondary',
          )}
          onClick={() => onFilterChange(option.id)}
        >
          {option.label}
        </Button>
      );
    })}
  </div>
);

const TestCard = ({
  service,
  isSelected,
  onToggle,
  disabled,
}: {
  service: HealthcareService;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) => (
  <div className="flex items-start gap-4 py-4">
    <div className="flex-1 space-y-1">
      <Body1 className="font-medium text-zinc-900">{service.name}</Body1>
      <Body2 className="text-zinc-500">{service.description}</Body2>
      <Body1 className="text-zinc-900">{formatMoney(service.price)}</Body1>
    </div>
    <div className="relative shrink-0">
      <img
        src={getServiceImage(service.name)}
        alt={service.name}
        className="size-20 rounded-lg object-contain"
      />
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={cn(
          'absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border shadow-md transition-colors',
          isSelected
            ? 'border-zinc-800 bg-zinc-950 text-white'
            : 'border-white bg-white text-zinc-900 hover:bg-zinc-50',
          disabled && 'cursor-not-allowed opacity-50',
        )}
        aria-label={isSelected ? 'Remove from cart' : 'Add to cart'}
      >
        {isSelected ? (
          <span className="text-sm font-medium">✓</span>
        ) : (
          <Plus className="size-5" />
        )}
      </button>
    </div>
  </div>
);

const TestCardSkeleton = () => (
  <div className="flex items-start gap-4 py-4">
    <div className="flex-1 space-y-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-5 w-16" />
    </div>
    <Skeleton className="size-20 shrink-0 rounded-lg" />
  </div>
);

export const AddOnPanelsStep = () => {
  const { next, prev } = useOnboardingNavigation();
  const { trackOnboardingCreditPurchase } = useOnboardingAnalytics();
  const { selectedPanelIds, togglePanel, clear } = useAddOnPanelStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');

  const { data: paymentMethodsData } = usePaymentMethods();
  const creditsQuery = useCredits();
  const phlebotomyServicesQuery = useServices({ group: 'phlebotomy' });
  const testKitServicesQuery = useServices({ group: 'test-kit' });
  const phlebotomyKitServicesQuery = useServices({ group: 'phlebotomy-kit' });
  const createCreditMutation = useCreateCredit();

  const existingCreditIds = useMemo(() => {
    const credits = creditsQuery.data?.credits ?? [];
    return new Set(credits.map((c) => c.serviceId));
  }, [creditsQuery.data?.credits]);

  const services = useMemo(() => {
    const rawServices = [
      ...(phlebotomyServicesQuery.data?.services ?? []),
      ...(testKitServicesQuery.data?.services ?? []),
      ...(phlebotomyKitServicesQuery.data?.services ?? []),
    ];

    const filteredServices = rawServices.filter(
      (service) =>
        service.id !== TOTAL_TOXIN_TEST_ID &&
        service.name !== SUPERPOWER_BLOOD_PANEL,
    );

    const orderedServices = filteredServices.sort((a, b) => {
      const rank = (group?: string) => {
        if (group === 'test-kit') return 0;
        if (group === 'phlebotomy') return 1;
        if (group === 'phlebotomy-kit') return 2;
        return 3;
      };

      const rankDiff = rank(a.group) - rank(b.group);
      if (rankDiff !== 0) return rankDiff;

      return a.name.localeCompare(b.name);
    });

    return orderedServices.filter((s) => !existingCreditIds.has(s.id));
  }, [
    phlebotomyServicesQuery.data?.services,
    testKitServicesQuery.data?.services,
    phlebotomyKitServicesQuery.data?.services,
    existingCreditIds,
  ]);

  const filteredServices = useMemo(() => {
    let result = services;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query),
      );
    }

    if (activeFilter !== 'all') {
      const keywords = FILTER_KEYWORDS[activeFilter];
      result = result.filter((s) => {
        const text = `${s.name} ${s.description ?? ''}`.toLowerCase();
        return keywords.some((keyword) => text.includes(keyword));
      });
    }

    return result;
  }, [services, searchQuery, activeFilter]);

  const totalPrice = useMemo(
    () =>
      services
        .filter((s) => selectedPanelIds.has(s.id))
        .reduce((sum, s) => sum + s.price, 0),
    [services, selectedPanelIds],
  );

  const handleToggle = useCallback(
    (service: HealthcareService) => {
      togglePanel(service.id);
    },
    [togglePanel],
  );

  const handleContinue = async () => {
    if (selectedPanelIds.size === 0) {
      next();
      return;
    }

    try {
      await createCreditMutation.mutateAsync({
        data: {
          serviceIds: [...selectedPanelIds],
          paymentMethodId: '',
        },
      });

      const selectedServices = services.filter((s) =>
        selectedPanelIds.has(s.id),
      );
      const purchasedCredits = selectedServices.map((s) => ({
        id: s.id,
        price: s.price,
      }));

      trackOnboardingCreditPurchase({
        credits: purchasedCredits,
        totalValue: totalPrice,
        paymentProvider:
          paymentMethodsData?.paymentMethods?.[0]?.paymentProvider ?? 'unknown',
      });

      clear();
      next();
    } catch {
      next();
    }
  };

  const handleSkip = () => {
    clear();
    next();
  };

  const isLoading =
    phlebotomyServicesQuery.isLoading ||
    testKitServicesQuery.isLoading ||
    phlebotomyKitServicesQuery.isLoading ||
    creditsQuery.isLoading;
  const isPending = createCreditMutation.isPending;

  return (
    <>
      <Head title="Explore Tests" />
      <Sequence.StepLayout className="min-h-screen bg-white">
        <Sequence.StepHeader className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
          <button
            type="button"
            onClick={prev}
            className="flex items-center gap-1 text-zinc-500"
            aria-label="Go back"
          >
            <ChevronLeft className="size-5" />
            <span className="text-sm">Back</span>
          </button>
          <span className="text-sm font-medium text-zinc-900">Marketplace</span>
          <div className="w-14" />
        </Sequence.StepHeader>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 pb-48">
            <div className="mx-auto max-w-lg space-y-6 py-6">
              <H2>Explore tests</H2>

              <ExploreTestsSearch
                value={searchQuery}
                onChange={setSearchQuery}
              />

              <FilterPills
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />

              <div>
                <H3 className="mb-2 text-lg text-zinc-400">Most recommended</H3>

                <div className="divide-y divide-zinc-100">
                  {isLoading &&
                    Array.from({ length: 5 }).map((_, i) => (
                      <TestCardSkeleton key={i} />
                    ))}

                  {!isLoading && filteredServices.length === 0 && (
                    <div className="py-8 text-center">
                      <Body1 className="text-zinc-500">
                        No tests found matching your search.
                      </Body1>
                    </div>
                  )}

                  {!isLoading &&
                    filteredServices.map((service) => (
                      <TestCard
                        key={service.id}
                        service={service}
                        isSelected={selectedPanelIds.has(service.id)}
                        onToggle={() => handleToggle(service)}
                        disabled={isPending}
                      />
                    ))}
                </div>
              </div>
            </div>
          </div>

          <div className="fixed inset-x-0 bottom-0 border-t border-zinc-100 bg-white px-4 pb-8 pt-4">
            <div className="mx-auto max-w-lg space-y-3">
              <Button
                onClick={handleContinue}
                disabled={isPending}
                className="w-full"
              >
                Continue
                {selectedPanelIds.size > 0 && (
                  <span className="ml-2 opacity-80">
                    {formatMoney(totalPrice)}
                  </span>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                disabled={isPending}
                className="w-full"
              >
                Skip to schedule tests
              </Button>
            </div>
          </div>
        </div>
      </Sequence.StepLayout>
    </>
  );
};
