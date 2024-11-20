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

  // Removing all orders in the past.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sortedOrders = [...upcomingCallsQuery.data.orders]
    .filter((order) => new Date(order.timestamp).getTime() >= today.getTime())
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

  return (
    <div className="py-10">
      <UpcomingCallsTable columns={columns} data={sortedOrders} />
    </div>
  );
};
