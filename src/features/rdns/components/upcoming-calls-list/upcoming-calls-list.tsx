import { Spinner } from '@/components/ui/spinner';
import { useGetUpcomingCalls } from '@/features/rdns/api/get-upcoming-calls';
import { columns } from '@/features/rdns/components/upcoming-calls-list/columns';
import { UpcomingCallsTable } from '@/features/rdns/components/upcoming-calls-list/data-table';

export const UpcomingCallsList = () => {
  const upcomingCallsQuery = useGetUpcomingCalls();

  if (upcomingCallsQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!upcomingCallsQuery.data) return null;

  return (
    <div className="py-10">
      <UpcomingCallsTable
        columns={columns}
        data={upcomingCallsQuery.data.orders}
      />
    </div>
  );
};
