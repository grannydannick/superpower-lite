import { ContentLayout } from '@/components/layouts';
import { SettingsListDesktop } from '@/features/settings/components/settings-list-desktop';
import { SettingsListMobile } from '@/features/settings/components/settings-list-mobile';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

export const SettingsRoute = () => {
  const { width } = useWindowDimensions();
  return width > 768 ? (
    <ContentLayout title="Settings" bgColor="zinc">
      <SettingsListDesktop />
    </ContentLayout>
  ) : (
    <SettingsListMobile />
  );
};
