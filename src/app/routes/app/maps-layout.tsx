import { APIProvider } from '@vis.gl/react-google-maps';
import { Outlet } from 'react-router';

import { env } from '@/config/env';

export const MapsLayout = () => {
  return (
    <APIProvider apiKey={env.GOOGLE_API_KEY} libraries={['places']}>
      <Outlet />
    </APIProvider>
  );
};
