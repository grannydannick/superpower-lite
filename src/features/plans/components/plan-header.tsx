import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const useShowBg = () => {
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    let timeoutId: number;

    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setIsBlurred(window.scrollY > 10);
      }, 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  return isBlurred;
};

export const CarePlanHeader = () => {
  const navigate = useNavigate();
  const isBlurred = useShowBg();

  return (
    <div
      className={cn(
        'sticky z-10 left-0 top-0 flex w-full justify-between p-5 transition duration-300',
        isBlurred
          ? 'bg-opacity-40 bg-white backdrop-blur-md rounded-b-2xl'
          : null,
      )}
    >
      <div className="flex items-center justify-center">
        <Button
          variant="white"
          size="icon"
          className="rounded-full bg-white p-4 shadow-lg hover:bg-white"
          onClick={() => navigate('/')}
        >
          <X className="size-4 text-zinc-600" />
        </Button>
      </div>
    </div>
  );
};
