import { useNavigate } from '@tanstack/react-router';
import { Reorder } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import React, { useState } from 'react';

import { WearablesSearch } from '@/features/settings/components/wearables/wearables-search';
import { Wearable } from '@/types/api';

interface MobileWearablesProps {
  wearables: Wearable[];
}

export function WearablesMobile({ wearables }: MobileWearablesProps) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState(false);
  const [orderedProviders, setOrderedProviders] = useState<string[] | null>(
    null,
  );
  const navigate = useNavigate();

  const wearablesCopy = wearables.slice();

  let filteredWearables: Wearable[] = wearables;
  if (search.length > 0) {
    const q = search.toLowerCase();
    filteredWearables = wearablesCopy.filter((wearable) =>
      wearable.provider.toLowerCase().includes(q),
    );
  }

  const wearableByProvider = new Map<string, Wearable>();
  const filteredProviders: string[] = [];
  for (const wearable of filteredWearables) {
    wearableByProvider.set(wearable.provider, wearable);
    filteredProviders.push(wearable.provider);
  }

  const displayProviders: string[] = [];
  const seen = new Set<string>();
  if (orderedProviders) {
    for (const provider of orderedProviders) {
      if (!wearableByProvider.has(provider)) continue;
      if (seen.has(provider)) continue;
      displayProviders.push(provider);
      seen.add(provider);
    }
  }
  for (const provider of filteredProviders) {
    if (seen.has(provider)) continue;
    displayProviders.push(provider);
    seen.add(provider);
  }

  const itemNodes: React.ReactElement[] = [];
  for (const provider of displayProviders) {
    const wearable = wearableByProvider.get(provider);
    if (!wearable) continue;

    itemNodes.push(
      <Reorder.Item
        value={provider}
        className="flex cursor-pointer items-center rounded-2xl bg-white px-5 py-6"
        key={provider}
        onClick={() => {
          const href = `/settings/integrations/${wearable.provider.toLowerCase()}`;
          void navigate({ href });
        }}
      >
        <div className="flex flex-row items-center gap-x-2">
          <img src={wearable.logo} alt={wearable.provider} className="size-5" />
          <p>{wearable.provider}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          {/* <h3 className="text-[#71717A] whitespace-nowrap">
                    {format(file.uploadedAt, width > 768 ? 'PP' : 'LLL, dd')}
                  </h3> */}
          <div>
            <ChevronRight className="size-4" color="#A1A1AA" />
          </div>
        </div>
      </Reorder.Item>,
    );
  }

  return (
    <div className="mt-12 flex flex-col justify-between md:hidden">
      {/*
              <CreateFile>
                <button className="w-full mb-[26px] space-x-2">
                  <div>
                    <Upload className="h-4 w-4" />
                  </div>
                  <span>Upload document</span>
                </button>
              </CreateFile>
          */}
      <WearablesSearch
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sortFn={() => setSort((prev) => !prev)}
        sorted={sort}
      />
      <Reorder.Group
        axis="y"
        onReorder={setOrderedProviders}
        transition={{ duration: 0.2 }}
        values={displayProviders}
        className="space-y-1"
      >
        {itemNodes}
      </Reorder.Group>
    </div>
  );
}
