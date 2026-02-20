import { ContentLayout } from '@/components/layouts';
import { AffiliateBody } from '@/features/affiliate/components/affiliate-body';
import { AffiliateHero } from '@/features/affiliate/components/affiliate-hero';

export const AffiliateRoute = () => {
  return (
    <ContentLayout title="Invite friends & family">
      <div className="relative -mt-16 h-[600px] w-full pt-16 md:h-[700px] lg:mt-[-134px]">
        <AffiliateHero />

        <div className="absolute left-1/2 top-0 h-full w-screen -translate-x-1/2 overflow-hidden bg-black">
          <div
            className="pointer-events-none absolute top-0 h-full w-screen"
            style={{
              background:
                'linear-gradient(268deg, #D13A07 0%, #EA6F18 15%, #F08A20 30%, #F38A1F 50%, #EA6F18 75%, #D13A07 100%)',
            }}
          />

          <div className="absolute bottom-0 z-50 h-40 w-full rounded-t-[32px] bg-white" />
        </div>
      </div>
      <div className="relative -top-40 w-full bg-white lg:-top-32">
        <AffiliateBody />
      </div>
    </ContentLayout>
  );
};
