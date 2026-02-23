import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import * as z from 'zod';

import { ContentLayout } from '@/components/layouts';
import { Header } from '@/components/shared/header';
import { SettingsListDesktop } from '@/features/settings/components/settings-list-desktop';
import { SettingsListMobile } from '@/features/settings/components/settings-list-mobile';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

const settingsSearchSchema = z.object({
  tab: z
    .enum(['billing', 'membership', 'history', 'integrations'])
    .optional()
    .catch(undefined),
});

export const Route = createFileRoute('/_app/_maps/settings')({
  validateSearch: zodValidator(settingsSearchSchema),
  component: SettingsComponent,
});

function SettingsComponent() {
  const { width } = useWindowDimensions();
  return width > 768 ? (
    <ContentLayout title="Settings">
      <Header title="Settings" />
      <SettingsListDesktop />
    </ContentLayout>
  ) : (
    <SettingsListMobile />
  );
}
