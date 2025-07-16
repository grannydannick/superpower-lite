import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';

export const CarePlanHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="sticky left-0 top-0 z-10 flex w-full justify-between p-5 transition duration-300">
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
