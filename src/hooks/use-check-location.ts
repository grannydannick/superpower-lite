import { useLocation } from 'react-router';

export function useCheckLocation(pathname: string) {
  const location = useLocation();

  return location.pathname.includes(pathname);
}
