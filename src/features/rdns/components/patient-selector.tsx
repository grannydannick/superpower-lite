import { PersonStanding, X } from 'lucide-react';
import moment from 'moment';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Body1 } from '@/components/ui/typography';
import { useRdnPatients } from '@/features/rdns/api/get-rdn-patients';
import { useCurrentPatient } from '@/features/rdns/hooks/use-current-patient';
import { cn } from '@/lib/utils';
import { User } from '@/types/api';

export const PatientSelector = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [filterVal, setFilterVal] = useState('');

  const allowedPath = ['data'];

  const shouldShow = allowedPath.some((path) => pathname.includes(path));

  const { hasAllowedRole, selectedPatient, setPatient, removePatient } =
    useCurrentPatient(() => setOpen(false));

  const { data } = useRdnPatients({
    queryConfig: {
      enabled: hasAllowedRole,
    },
  });

  const formatPatient = (p: User | undefined) => {
    if (!p) {
      return <Body1 className="text-zinc-500">Select member</Body1>;
    }

    const birthDate = moment(p.dateOfBirth).format('MMM D, YYYY');
    const gender = p.gender.charAt(0);

    return (
      <>
        <Body1 className="text-zinc-500">
          {p.firstName} {p.lastName}&nbsp;
          <span className="text-zinc-400">
            ({gender}) - {birthDate}
          </span>
        </Body1>
      </>
    );
  };

  const filteredUsers = data?.patients.filter((p) =>
    `${p.firstName} ${p.lastName}`
      .toLowerCase()
      .includes(filterVal.toLowerCase()),
  );

  if (!hasAllowedRole) {
    return null;
  }

  return (
    <div
      className={cn(
        'sticky top-10 z-50 items-center justify-center',
        shouldShow ? 'sm:flex hidden' : 'hidden',
      )}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className={cn('flex w-fit items-center gap-2')}>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start gap-4 rounded-[42px] border border-zinc-200 bg-white px-5 py-4 shadow-lg',
                selectedPatient ? 'border-vermillion-900' : null,
              )}
            >
              <div className="flex items-center gap-2">
                <PersonStanding className="size-5 min-w-5 text-zinc-400" />
                <Body1 className="text-zinc-500">Member</Body1>
              </div>
              <Separator orientation="vertical" className="h-5" />
              {formatPatient(selectedPatient)}
            </Button>
            {selectedPatient ? (
              <Button
                variant="ghost"
                className="rounded-full border border-zinc-200 bg-white p-4 shadow-lg"
                onClick={removePatient}
              >
                <X />
              </Button>
            ) : null}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto rounded-xl border border-zinc-50 p-0 shadow-xl">
          <div className="flex items-center gap-1 px-6 py-3">
            <Input
              className="rounded-none border-0 p-0 caret-vermillion-900 shadow-none focus-visible:bg-white focus-visible:ring-0"
              placeholder="Search"
              value={filterVal}
              onChange={(e) => setFilterVal(e.target.value)}
            />
            <Button
              variant="ghost"
              className="p-0"
              onClick={() => setFilterVal('')}
            >
              <X className="h-4 min-w-4 text-zinc-400" />
            </Button>
          </div>
          <div className="max-h-[200px] overflow-y-auto p-2">
            {filteredUsers && filteredUsers.length ? (
              filteredUsers.map((p) => {
                return (
                  <div
                    role="presentation"
                    key={p.id}
                    onClick={() => setPatient(p)}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-lg px-4 py-3 hover:bg-zinc-100',
                      selectedPatient?.id === p.id ? 'bg-zinc-100' : null,
                    )}
                  >
                    {formatPatient(p)}
                  </div>
                );
              })
            ) : (
              <div className="rounded-lg px-4 py-3">Nothing found.</div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
