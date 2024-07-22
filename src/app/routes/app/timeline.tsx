import { NavLink } from 'react-router-dom';

export const TimelineRoute = () => {
  return (
    <div className="space-y-20">
      <div className="flex justify-center space-x-6">
        <NavLink to={'/app/timeline'}>
          <span className="text-[20px] text-zinc-900 opacity-100">
            Timeline
          </span>
        </NavLink>
        <NavLink to={'/app/services'}>
          <span className="text-[20px] text-zinc-900 opacity-20">Services</span>
        </NavLink>
      </div>
    </div>
  );
};
