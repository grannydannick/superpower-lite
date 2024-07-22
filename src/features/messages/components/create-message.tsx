// import { Plus } from 'lucide-react';
//
// import { Button } from '@/components/ui/button';
// import { Form, FormDrawer, Textarea } from '@/components/ui/form';
// import { useNotifications } from '@/components/ui/notifications';
//
// import {
//   createMessageInputSchema,
//   useCreateMessage,
// } from '../api/create-message';
//
// export const CreateMessage = () => {
//   const { addNotification } = useNotifications();
//   const createMessageMutation = useCreateMessage({
//     mutationConfig: {
//       onSuccess: () => {
//         addNotification({
//           type: 'success',
//           title: 'Message Send',
//         });
//       },
//     },
//   });
//
//   return (
//     <FormDrawer
//       isDone={createMessageMutation.isSuccess}
//       triggerButton={
//         <Button size="sm" icon={<Plus className="size-4" />}>
//           Create Message
//         </Button>
//       }
//       title="Create Message"
//       submitButton={
//         <Button
//           form="create-message"
//           type="submit"
//           size="sm"
//           isLoading={createMessageMutation.isPending}
//         >
//           Submit
//         </Button>
//       }
//     >
//       <Form
//         id="create-message"
//         onSubmit={(values) => {
//           createMessageMutation.mutate({ data: values });
//         }}
//         schema={createMessageInputSchema}
//       >
//         {({ register, formState }) => (
//           <>
//             <Textarea
//               label="Body"
//               error={formState.errors['body']}
//               registration={register('body')}
//             />
//           </>
//         )}
//       </Form>
//     </FormDrawer>
//   );
// };

import { SendIcon, TimerIcon } from 'lucide-react';
import { useState } from 'react';

import { AnimatedTooltip } from '@/components/ui/animated-tooltip/animated-tooltip';
import { Button } from '@/components/ui/button';
import { Form, Textarea } from '@/components/ui/form';
import { useNotifications } from '@/components/ui/notifications';

import {
  createMessageInputSchema,
  useCreateMessage,
} from '../api/create-message';
import { MD_TEAM } from '../const';

export const CreateMessage = (): JSX.Element => {
  const [message, setMessage] = useState<string>('');

  const { addNotification } = useNotifications();
  const createMessageMutation = useCreateMessage({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Message Send',
        });
      },
    },
  });

  // const sendNoteFn = async (): Promise<void> => {
  //   await mutateAsync({
  //     text: `Your concierge longevity clinician will respond with details about your question.${
  //       message.length > 0 ? `\n\nAdditional Notes:\n\n${message}` : ''
  //     }`,
  //   });
  //
  //   setMessage('');
  // };

  return (
    <div className="container flex flex-col items-center p-0">
      <div className="mt-[72px] hidden flex-col gap-6 md:flex">
        <div className="flex w-full flex-row items-center justify-center">
          <AnimatedTooltip items={MD_TEAM} disablePopover />
        </div>
        <h1 className="text-center text-5xl text-[#18181B]">
          Message your care team
        </h1>
      </div>

      <Form
        id="create-message"
        onSubmit={(values) => {
          createMessageMutation.mutate({ data: values });
        }}
        schema={createMessageInputSchema}
        className="mt-[71px] hidden w-full max-w-[900px] flex-col gap-4 rounded-[32px] bg-white p-5 md:flex"
      >
        {({ register, formState }) => (
          <>
            <Textarea
              label="Body"
              error={formState.errors['body']}
              registration={register('body')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="h-[150px] w-full resize-none rounded-[20px] px-[18px] py-6"
              placeholder="Ask questions about your health, book appointments, and get answers from expert clinicians"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 px-4 ">
                <TimerIcon color="#71717A" className="size-4" />
                <h3 className="text-base text-[#71717A]">{`Response Time: < 8 hrs`}</h3>
              </div>
              <div className="flex items-center gap-5">
                <a className="flex items-center gap-2" href="sms:+12089842571">
                  <SendIcon className="size-4" color="#71717A" />
                  <h3 className="text-[#71717A]">+1 (208) 984-2571</h3>
                </a>
                <Button
                  form="create-message"
                  type="submit"
                  isLoading={createMessageMutation.isPending}
                >
                  Send Message
                </Button>
              </div>
            </div>
          </>
        )}
      </Form>
    </div>
  );
};
