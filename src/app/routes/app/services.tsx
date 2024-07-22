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
    <div className="space-y-20">
      <div className="flex justify-center space-x-6">
        <NavLink to={'/'}>
          <span className="text-[20px] text-zinc-900 opacity-20">Timeline</span>
        </NavLink>
        <NavLink to={'/'}>
          <span className="text-[20px] text-zinc-900 opacity-100">
            Services
          </span>
        </NavLink>
      </div>
      <div className="space-y-20">
        <div className="space-y-4">
          <h2 className="text-2xl leading-8 text-zinc-900">
            Book a consultation
          </h2>
          <ConsultsList />
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl leading-8 text-zinc-900">Book a service</h2>
          <ServicesList />
        </div>
      </div>
    </div>
  );
};
