import { Spinner } from '@/components/ui/spinner';
import { useRdnPatients } from '@/features/rdns/api/get-rdn-patients';
import { columns } from '@/features/rdns/components/rdn-patients-list/columns';
import { RdnMembersDataTable } from '@/features/rdns/components/rdn-patients-list/data-table';

export const RdnPatientsList = () => {
  const rdnPatientsQuery = useRdnPatients();

  if (rdnPatientsQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!rdnPatientsQuery.data) return null;

  return (
    <div className="py-10">
      <RdnMembersDataTable
        columns={columns}
        data={rdnPatientsQuery.data.patients}
      />
    </div>
  );
};
