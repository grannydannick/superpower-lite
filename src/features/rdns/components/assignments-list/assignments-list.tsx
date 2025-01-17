import * as React from 'react';

import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Body2, H4 } from '@/components/ui/typography';
import { columns } from '@/features/rdns/components/assignments-list/columns';
import { AssignmentsDataTable } from '@/features/rdns/components/assignments-list/data-table';
import { useUsers } from '@/features/users/api';
import { useDebounce } from '@/hooks/use-debounce';

export const AssignmentsList = () => {
  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebounce(search, 500);

  const usersQuery = useUsers({
    queryConfig: {
      enabled: debouncedSearch.length > 2,
    },
    search: debouncedSearch,
  });

  return (
    <div className="space-y-4 py-10">
      <div className="flex items-center gap-2">
        <H4>Assign RDN to User</H4>
        {usersQuery.isLoading ? <Spinner variant="primary" /> : null}
      </div>
      <Body2>
        You can search either by email or id to get user, input at least 3
        characters in the box below
      </Body2>
      <Input
        placeholder="Input at least 3 characters..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <AssignmentsDataTable
        columns={columns}
        data={usersQuery.data?.users ?? []}
      />
    </div>
  );
};
