import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/lib/auth';
import { capitalize } from '@/utils/format';

export function PersonalInformationForm(): JSX.Element {
  const { data: user } = useUser();

  if (!user) {
    return <div className="md:p-16">No profile information found.</div>;
  }

  const { firstName, lastName, dateOfBirth, gender } = user;

  return (
    <div className="flex flex-col gap-8">
      <div
        className="flex w-full flex-col items-center gap-8 md:flex-row md:gap-4"
        id="personal"
      >
        <div className="w-full space-y-2">
          <Label className="text-sm text-[#71717A]">First Name</Label>
          <Input
            className="bg-white md:bg-[#EFEFEF4D]"
            name="firstName"
            id="firstName"
            value={firstName}
            disabled
          />
        </div>
        <div className="w-full space-y-2">
          <Label className="text-sm text-[#71717A]">Last Name</Label>
          <Input
            className="bg-white md:bg-[#EFEFEF4D]"
            name="lastName"
            id="lastName"
            value={lastName}
            disabled
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-[#71717A]">Birth Date</Label>
        <Input
          className="bg-white md:bg-[#EFEFEF4D]"
          name="dateOfBirth"
          id="dateOfBirth"
          value={new Date(dateOfBirth).toISOString().slice(0, 10)}
          disabled
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm text-[#71717A]">Biological Sex</Label>
        <Input
          className="bg-white md:bg-[#EFEFEF4D]"
          name="gender"
          id="gender"
          value={capitalize(gender.toLowerCase())}
          disabled
        />
      </div>
      <div className="hidden justify-end md:flex">
        <Button disabled>Update</Button>
      </div>
    </div>
  );
}
