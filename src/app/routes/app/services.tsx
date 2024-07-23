import { QueryClient } from '@tanstack/react-query';
import { NavLink } from 'react-router-dom';

// import { getConsultsQueryOptions } from '@/features/consults/api/get-consults';
import { ConsultsList } from '@/features/consults/components/consults-list';
import { getServicesQueryOptions } from '@/features/services/api/get-services';
import { ServicesList } from '@/features/services/components/services-list';

// export const consultsLoader = (queryClient: QueryClient) => async () => {
//   const query = getConsultsQueryOptions();
//
//   return (
//     queryClient.getQueryData(query.queryKey) ??
//     (await queryClient.fetchQuery(query))
//   );
// };

export const servicesLoader = (queryClient: QueryClient) => async () => {
  const query = getServicesQueryOptions();

  return (
    queryClient.getQueryData(query.queryKey) ??
    (await queryClient.fetchQuery(query))
  );
};

export const ServicesRoute = () => {
  return (
    <div className="space-y-12 sm:space-y-20">
      <div className="flex space-x-6 sm:justify-center">
        <NavLink to={'/app/timeline'}>
          <span className="text-2xl text-zinc-900 opacity-20 sm:text-[20px]">
            Timeline
          </span>
        </NavLink>
        <NavLink to={'/app/services'}>
          <span className="text-2xl text-zinc-900 opacity-100 sm:text-[20px]">
            Services
          </span>
        </NavLink>
      </div>
      <div className="space-y-8 sm:space-y-20">
        <div className="space-y-2 sm:space-y-4">
          <h2 className="text-xl leading-8 text-zinc-900 sm:text-2xl">
            Book a consultation
          </h2>
          <ConsultsList />
        </div>
        <div className="space-y-2 sm:space-y-4">
          <h2 className="text-xl leading-8 text-zinc-900 sm:text-2xl">
            Book a service
          </h2>
          <ServicesList />
        </div>
      </div>
    </div>
  );
};
