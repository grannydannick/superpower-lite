import { Body1, H2 } from '@/components/ui/typography';
import { RescheduleDialogMode } from '@/features/orders/types/reschedule-dialog-mode';
import { HealthcareService } from '@/types/api';

export const HealthcareServiceRescheduleConfirmation = ({
  mode,
  healthcareService,
}: {
  healthcareService: HealthcareService;
  mode: RescheduleDialogMode;
}) => {
  return (
    <div className="flex flex-col justify-center gap-4 px-6 md:max-w-none md:px-10">
      <img
        src={healthcareService.image}
        className="block size-[70px] rounded-2xl border border-zinc-200 bg-white  object-cover"
        alt={healthcareService.name}
      />
      <div className="max-w-[220px] space-y-4 md:max-w-none">
        <H2 className="text-zinc-900">
          Are you sure you want to {mode} your Superpower Blood Panel?
        </H2>
      </div>
      <Body1 className="text-zinc-500">
        Cancelling less than 24 hours before a scheduled at-home appointment
        will incur a late cancellation fee.
      </Body1>
      {mode === 'cancel' ? (
        <Body1 className="text-zinc-500">
          You can schedule a new appointment from the services page of the
          Superpower app.
        </Body1>
      ) : null}
    </div>
  );
};
