import { Link } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';

import { Body3, H2 } from '@/components/ui/typography';
import { Rx } from '@/types/api';

import { COMPOUNDED_PRODUCTS_DISCLAIMER } from '../const';

import { PrescriptionCard } from './prescriptions-card';

type PrescriptionCategoryProps = {
  title: string;
  subtitle?: string;
  prescriptions: Rx[];
  viewAllTab?: 'tests' | 'supplements' | 'prescriptions' | 'orders';
  showDisclaimer?: boolean;
};

export const PrescriptionsCategory = ({
  title,
  subtitle,
  prescriptions,
  viewAllTab,
  showDisclaimer = false,
}: PrescriptionCategoryProps) => {
  const handleViewAllClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col">
          <H2>{title}</H2>
          {subtitle != null ? (
            <H2 className="text-secondary">{subtitle}</H2>
          ) : null}
          {showDisclaimer === true ? (
            <Body3 className="mt-3 text-tertiary">
              {COMPOUNDED_PRODUCTS_DISCLAIMER}
            </Body3>
          ) : null}
        </div>
        {viewAllTab != null ? (
          <Link
            to="/marketplace"
            search={{ tab: viewAllTab }}
            className="inline-flex items-center gap-1 font-medium text-secondary hover:text-primary"
            onClick={handleViewAllClick}
          >
            View all
            <ChevronRight className="size-4" />
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-4 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-4">
        {prescriptions.map((prescription) => (
          <PrescriptionCard key={prescription.id} prescription={prescription} />
        ))}
      </div>
    </section>
  );
};
