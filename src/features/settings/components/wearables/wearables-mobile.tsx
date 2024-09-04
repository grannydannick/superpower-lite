import { Reorder } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { WearablesSearch } from '@/features/settings/components/wearables/wearables-search';
import { Wearable } from '@/types/api';

interface MobileWearablesProps {
  wearables: Wearable[];
}

export function WearablesMobile({
  wearables,
}: MobileWearablesProps): JSX.Element {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState(false);
  const navigate = useNavigate();

  const wearablesCopy = wearables.slice();

  let newWearables = search
    ? wearablesCopy.filter((wearable) =>
        wearable.provider.toLowerCase().includes(search.toLowerCase()),
      )
    : wearables;

  return (
    <div className="mt-12 flex flex-col justify-between md:hidden">
      {/*
              <CreateFile>
                <Button className="w-full mb-[26px] space-x-2">
                  <div>
                    <Upload className="h-4 w-4" />
                  </div>
                  <span>Upload Document</span>
                </Button>
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
        onReorder={(newOrder) => {
          newWearables = newOrder;
        }}
        transition={{ duration: 0.2 }}
        values={newWearables}
        className="space-y-1"
      >
        {newWearables.map((wearable) => (
          <Reorder.Item
            value={wearable.provider}
            className="flex cursor-pointer items-center rounded-2xl bg-white px-5 py-6"
            key={wearable.provider}
            onClick={() =>
              navigate(
                `/settings/integrations/${wearable.provider.toLowerCase()}`,
              )
            }
          >
            <div className="flex flex-row items-center gap-x-2">
              <img
                src={wearable.logo}
                alt={wearable.provider}
                className="size-5"
              />
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
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}
