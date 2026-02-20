import { Syringe, Pill, FileText, Package, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

import { HomepageCard } from '../components/homepage-card';

const navigationItems = [
  {
    icon: Syringe,
    label: 'More diagnostic tests',
    to: '/marketplace?tab=tests',
  },
  {
    icon: Pill,
    label: 'Shop supplements',
    to: '/marketplace?tab=supplements',
  },
  {
    icon: FileText,
    label: 'Shop prescriptions',
    to: '/marketplace?tab=prescriptions',
  },
  {
    icon: Package,
    label: 'Order history',
    to: '/settings?tab=history',
  },
];

export const NavigationCard = () => {
  return (
    <HomepageCard>
      <div className="flex flex-col gap-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
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
            </Link>
          );
        })}
      </div>
    </HomepageCard>
  );
};
