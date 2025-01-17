import * as React from 'react';

import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Body2, H4 } from '@/components/ui/typography';
import { columns } from '@/features/users/components/columns';
import { UsersDataTable } from '@/features/users/components/data-table';
import { useDebounce } from '@/hooks/use-debounce';

import { useUsers } from '../api';

export const UsersList = () => {
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
        <H4>Log in as User</H4>
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
      <UsersDataTable columns={columns} data={usersQuery.data?.users ?? []} />
    </div>
  );
};
