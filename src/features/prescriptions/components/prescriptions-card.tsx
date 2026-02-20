import { usePostHog } from 'posthog-js/react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { ProgressiveImage } from '@/components/ui/progressive-image';
import { Body1, Body2, Body3, H4 } from '@/components/ui/typography';
import { Rx } from '@/types/api';
import { getPrescriptionImage } from '@/utils/prescription';

export const PrescriptionCard = ({ prescription }: { prescription: Rx }) => {
  return (
    <>
      <DesktopCard prescription={prescription} />
      <MobileCard prescription={prescription} />
    </>
  );
};

const DesktopCard = ({ prescription }: { prescription: Rx }) => {
  const posthog = usePostHog();
  const navigate = useNavigate();

  const renderButton = () => {
    return (
      <Button
        className="transition-timing-function-[cubic-bezier(0.22,_0.61,_0.35,_1)] pointer-events-none absolute inset-x-4 bottom-4 translate-y-2 opacity-0 blur-sm transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-hover:blur-0"
        size="medium"
      >
        View Product
      </Button>
    );
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className="group relative hidden cursor-pointer flex-col gap-4 overflow-hidden sm:flex"
      onClick={() => {
        posthog?.capture('prescription_card_clicked', {
          prescriptionId: prescription.id,
        });
        navigate(`/prescriptions/${prescription.id}`);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          posthog?.capture('prescription_card_clicked', {
            prescriptionId: prescription.id,
          });
          navigate(`/prescriptions/${prescription.id}`);
        }
      }}
    >
      <div className="relative flex aspect-square items-center rounded-[20px] bg-zinc-50">
        {/* The bg-zinc-50 helps prevent strobing on transparent images; see comment in progressive-image.tsx */}
        <ProgressiveImage
          src={getPrescriptionImage(prescription.name)}
          alt={prescription.name}
          className="h-[300px] w-full rounded-[20px] bg-zinc-50 object-contain"
        />
        {renderButton()}
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between gap-2">
          <H4 className="truncate">{prescription.name}</H4>
          <H4>${prescription.price}</H4>
        </div>
        <Body1 className="text-left text-secondary">
          {prescription.additionalClassification?.[0]}
        </Body1>
      </div>
    </div>
  );
};

const MobileCard = ({ prescription }: { prescription: Rx }) => {
  const posthog = usePostHog();
  const navigate = useNavigate();

  return (
    <div
      role="button"
      tabIndex={0}
      className="flex flex-col gap-2 sm:hidden"
      onClick={() => {
        posthog?.capture('prescription_card_clicked', {
          prescriptionId: prescription.id,
        });
        navigate(`/prescriptions/${prescription.id}`);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          posthog?.capture('prescription_card_clicked', {
            prescriptionId: prescription.id,
          });
          navigate(`/prescriptions/${prescription.id}`);
        }
      }}
    >
      <ProgressiveImage
        src={getPrescriptionImage(prescription.name)}
        alt={prescription.name}
        className="aspect-square w-full rounded-[20px] bg-zinc-50 object-contain"
      />

      <div className="flex flex-col gap-1 [&>*]:text-left">
        <Body3 className="text-secondary">
          {prescription.additionalClassification?.[0]}
        </Body3>
        <Body2 className="line-clamp-1">{prescription.name}</Body2>
        <Body2>${prescription.price}</Body2>
      </div>
    </div>
  );
};
