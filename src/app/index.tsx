import { MaintenancePage } from '@/components/layouts/maintenance-page';
import { env } from '@/config/env';
import { shouldBypassMaintenance } from '@/utils/maintenance-bypass';

import { AppProvider } from './provider';
import { AppRouter } from './router';

export const App = () => {
  if (env.MAINTENANCE_MODE && !shouldBypassMaintenance()) {
    return <MaintenancePage />;
  }

  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
};
