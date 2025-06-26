import { ContentLayout } from '@/components/layouts';
import { H2 } from '@/components/ui/typography';
import { SettingsListDesktop } from '@/features/settings/components/settings-list-desktop';
import { SettingsListMobile } from '@/features/settings/components/settings-list-mobile';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

export const SettingsRoute = () => {
  const { width } = useWindowDimensions();
  return width > 768 ? (
    <ContentLayout title="Settings">
      <H2>Settings</H2>
      <SettingsListDesktop />
    </ContentLayout>
  ) : (
    <SettingsListMobile />
  );
};
