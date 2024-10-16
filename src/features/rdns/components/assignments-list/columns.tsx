import { ColumnDef } from '@tanstack/react-table';

import { AdminUser } from '@/types/api';

import { AssignmentCell } from './assignment-cell';

export const columns: ColumnDef<AdminUser>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'firstName',
    header: 'First name',
  },
  {
    accessorKey: 'lastName',
    header: 'Last name',
  },
  {
    accessorKey: 'stripeCustomerId',
    header: 'Stripe Linked?',
    cell: ({ row }) => {
      return row.original.stripeCustomerId ? 'Y' : 'N';
    },
  },
  {
    accessorKey: 'dateOfBirth',
    header: 'Date of Birth',
    cell: ({ row }) => {
      return row.original.dateOfBirth.split('T')[0];
    },
  },
  {
    accessorKey: 'primaryAddress',
    header: 'Primary State',
    cell: ({ row }) => {
      return row.original.primaryAddress?.address.state || '-';
    },
  },
  {
    accessorKey: 'rdnId',
    header: 'RDN',
    cell: ({ row }) => {
      return (
        <AssignmentCell
          rdnId={row.original.rdnUserAssignment?.rdn.id}
          userId={row.original.id}
        />
      );
    },
  },
];
