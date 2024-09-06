import { Spinner } from '@/components/ui/spinner';
import { columns } from '@/features/rdns/components/rdns-list/columns';
import { RdnsDataTable } from '@/features/rdns/components/rdns-list/data-table';

import { useRdns } from '../../api/get-rdns';

export const RdnsList = () => {
  const rdnsQuery = useRdns();

  if (rdnsQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!rdnsQuery.data) return null;

  return (
    <div className="py-10">
      <RdnsDataTable columns={columns} data={rdnsQuery.data.rdns} />
    </div>
  );
};
