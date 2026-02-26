import { Link } from '@tanstack/react-router';
import { Syringe, Pill, FileText, Package, ChevronRight } from 'lucide-react';
import React from 'react';

import { HomepageCard } from '../components/homepage-card';

const marketplaceNavigationItems = [
  {
    icon: Syringe,
    label: 'More diagnostic tests',
    tab: 'tests',
  },
  {
    icon: Pill,
    label: 'Shop supplements',
    tab: 'supplements',
  },
  {
    icon: FileText,
    label: 'Shop prescriptions',
    tab: 'prescriptions',
  },
] as const;

export const NavigationCard = () => {
  const links: React.ReactElement[] = [];

  for (const item of marketplaceNavigationItems) {
    const Icon = item.icon;
    links.push(
      <Link
        key={item.tab}
        to="/marketplace"
        search={{ tab: item.tab }}
        className="group flex items-center justify-between rounded-lg"
      >
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center">
            <Icon className="size-5 text-zinc-600" />
          </div>
          <span className="text-base font-medium text-zinc-900">
            {item.label}
          </span>
        </div>
        <ChevronRight className="size-5 text-zinc-400 transition-all group-hover:-mr-1" />
      </Link>,
    );
  }

  links.push(
    <Link
      key="settings-history"
      to="/settings"
      search={{ tab: 'history' }}
      className="group flex items-center justify-between rounded-lg"
    >
      <div className="flex items-center gap-4">
        <div className="flex size-10 items-center justify-center">
          <Package className="size-5 text-zinc-600" />
        </div>
        <span className="text-base font-medium text-zinc-900">
          Order history
        </span>
      </div>
      <ChevronRight className="size-5 text-zinc-400 transition-all group-hover:-mr-1" />
    </Link>,
  );

  return (
    <HomepageCard>
      <div className="flex flex-col gap-2">{links}</div>
    </HomepageCard>
  );
};
