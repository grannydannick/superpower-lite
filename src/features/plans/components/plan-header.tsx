import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useBlur } from '@/hooks/use-blur';
import { cn } from '@/lib/utils';

export const CarePlanHeader = () => {
  const navigate = useNavigate();
  const isBlurred = useBlur();

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
