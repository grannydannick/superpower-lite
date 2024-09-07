import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useAssignRdn, useRdns } from '@/features/rdns/api';
import { Rdn } from '@/types/api';

export function AssignmentCell({
  rdnId,
  userId,
}: {
  rdnId?: string;
  userId: string;
}): JSX.Element {
  const rdnsQuery = useRdns();
  const assignRdnMutation = useAssignRdn();

  const onValueChange = async (
    rdnId: string,
    userId: string,
  ): Promise<void> => {
    await assignRdnMutation.mutateAsync({
      data: {
        rdnId,
        userId,
      },
    });
  };

  if (rdnsQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!rdnsQuery.data) return <></>;

  return (
    <Select
      onValueChange={(value: string) => onValueChange(value, userId)}
      value={rdnId}
    >
      <SelectTrigger className="rounded-md px-3 py-2 !text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:ring-0 focus:ring-offset-0">
        <SelectValue placeholder="RDN" />
      </SelectTrigger>
      <SelectContent>
        {rdnsQuery.data.rdns.map((rdn: Rdn) => (
          <SelectItem key={rdn.id} value={rdn.id} className="py-2 text-sm">
            {rdn.firstName} {rdn.lastName} {rdn.npi ? `- ${rdn.npi}` : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
