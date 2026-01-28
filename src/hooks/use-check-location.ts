import { useLocation } from 'react-router-dom';

export function useCheckLocation(pathname: string) {
  const location = useLocation();

  return location.pathname.includes(pathname);
}
