import { NavLink } from 'react-router-dom';

import { ProgressiveImage } from '@/components/ui/progressive-image';
import { Body1 } from '@/components/ui/typography/body1/body1';
import { Body2 } from '@/components/ui/typography/body2/body2';

const marketplaceList = [
  {
    name: 'Supplements',
    to: '/supplements',
    testid: 'supplements-link',
    image: '/marketplaces/supplements-marketplace.png',
    alt: 'supplements marketplace',
    title: 'Supplement Marketplace',
    description: 'Insider prices on 300+ curated longevity products',
  },
  {
    name: 'Prescriptions',
    to: '/prescriptions',
    testid: 'prescriptions-link',
    image: '/marketplaces/prescriptions-marketplace.png',
    alt: 'prescriptions marketplace',
    title: 'Prescription Marketplace',
    description: 'Access to curated Rx’s like medications or peptides',
  },
];

export const MarketplaceList = () => {
  return (
    <div className="mb-9 grid grid-cols-1 gap-1 sm:gap-x-3 sm:gap-y-9 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
      {marketplaceList.map((marketplace) => (
        <div
          key={marketplace.name}
          className="flex flex-row items-center justify-between gap-4 rounded-3xl border border-zinc-100 bg-zinc-100 p-5"
        >
          <div className="flex flex-row items-center">
            <ProgressiveImage
              src={marketplace.image}
              alt={marketplace.alt}
              className="mr-5 size-[48px] rounded-xl object-cover"
            />
            <div className="flex-col">
              <Body1 className="line-clamp-2 text-wrap">
                {marketplace.title}
              </Body1>
              <Body2 className="line-clamp-2 text-wrap text-zinc-500">
                {marketplace.description}
              </Body2>
            </div>
          </div>

          <NavLink
            key={marketplace.name}
            to={marketplace.to}
            data-testid={marketplace.testid}
          >
            <Body2 className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-3 hover:bg-white/30">
              Open
            </Body2>
          </NavLink>
        </div>
      ))}
    </div>
  );
};
