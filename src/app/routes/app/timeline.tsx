import { NavLink } from 'react-router-dom';

export const TimelineRoute = () => {
  return (
    <div className="space-y-12 sm:space-y-20">
      <div className="flex gap-x-4 sm:justify-center sm:gap-x-6">
        <NavLink to={'/app/timeline'}>
          <span className="text-2xl text-zinc-900 opacity-100 sm:text-[20px]">
            Timeline
          </span>
        </NavLink>
        <NavLink to={'/app/services'}>
          <span className="text-2xl text-zinc-900 opacity-20 sm:text-[20px]">
            Services
          </span>
        </NavLink>
      </div>
    </div>
  );
};
