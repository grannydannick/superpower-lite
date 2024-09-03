import { ContentLayout } from '@/components/layouts';
import { SettingsList } from '@/features/settings/components/settings-list';

export const SettingsRoute = () => {
  return (
    <ContentLayout title="Settings" bgColor="zinc">
      <SettingsList />
    </ContentLayout>
  );
};
