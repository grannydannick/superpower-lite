import { X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { AdvisoryCallButton } from '@/components/shared/advisory-call-button';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useCreateAnnotation } from '@/features/rdns/api/create-annotation';
import { useUpdateAnnotation } from '@/features/rdns/api/update-annotation';
import { useUser } from '@/lib/auth';
import { OrderWithUserInfo } from '@/types/api';

export const ActionCell = ({ order }: { order: OrderWithUserInfo }) => {
  const createNoteMutation = useCreateAnnotation({
    mutationConfig: {
      onSuccess: () => {
        toast.success('Created note.');
      },
    },
  });
  const updateNoteMutation = useUpdateAnnotation({
    mutationConfig: {
      onSuccess: () => {
        toast.success('Updated note.');
      },
    },
  });
  const { data: user } = useUser();

  const existingNote = order.note.length ? order.note[0] : undefined;
  const [note, setNote] = useState(existingNote?.text ?? '');

  return (
    <div className="flex w-full justify-end gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            onClick={() => {
              if (order.note.length) {
                return;
              }

              if (!user?.rdn?.id) {
                toast.error('User is not RDN.');
                return;
              }

              createNoteMutation.mutate({
                serviceRequestId: order.id,
                data: {
                  userId: order.userId,
                  authorId: user?.rdn?.id,
                  text: note,
                },
              });
            }}
          >
            {order.note.length ? 'Edit note' : 'Add note'}
          </Button>
        </DialogTrigger>
        <DialogContent className="p-14">
          <div className="flex w-full items-center justify-between">
            <DialogTitle>Add your note here</DialogTitle>
            <DialogClose>
              <X />
            </DialogClose>
          </div>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
          <Button
            onClick={() => {
              if (!existingNote?.id) {
                toast.error('Cannot edit note at the moment.');
                return;
              }

              updateNoteMutation.mutate({
                data: { text: note },
                annotationId: existingNote?.id,
              });
            }}
          >
            {updateNoteMutation.isPending ? <Spinner /> : 'Save'}
          </Button>
        </DialogContent>
      </Dialog>
      <AdvisoryCallButton order={order} />
    </div>
  );
};
