import { Link } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';

import { Body1, Body2, Body3, H2 } from '@/components/ui/typography';
import { useAnalytics } from '@/hooks/use-analytics';
import { usePosthogFeatureFlagEnabled } from '@/hooks/use-posthog-feature-flag-enabled';
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

  const clinicianCallEnabled = usePosthogFeatureFlagEnabled(
    'protocol-inapp-rx-clinician-call',
  );
  const { track } = useAnalytics();

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

      {showDisclaimer && clinicianCallEnabled ? (
        <div className="flex flex-col items-start gap-4 rounded-2xl bg-zinc-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex items-center gap-4">
            <img
              src="/services/doctors/doctors.webp"
              alt="Superpower care team"
              className="h-8 w-auto shrink-0"
            />
            <div className="flex flex-col">
              <Body1>Have questions about a prescription?</Body1>
              <Body2 className="text-secondary">
                Talk to your care team about treatment options.
              </Body2>
            </div>
          </div>
          <Link
            to="/consults/new"
            onClick={() => {
              track('protocol_rx_clinician_call_cta_clicked', {
                source: 'rx_marketplace',
              });
            }}
            className="flex w-full shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm shadow-[0px_2px_2px_0px_rgba(0,0,0,0.02)] transition-colors hover:bg-zinc-50 sm:w-auto"
          >
            Schedule a 1:1 consult
          </Link>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-x-2 gap-y-4 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-4">
        {prescriptions.map((prescription) => (
          <PrescriptionCard key={prescription.id} prescription={prescription} />
        ))}
      </div>
    </section>
  );
};
