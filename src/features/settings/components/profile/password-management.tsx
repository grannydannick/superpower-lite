import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Body2, H3 } from '@/components/ui/typography';
import { useResetPassword, useUser } from '@/lib/auth';

export const PasswordManagement = () => {
  const { data: user } = useUser();
  const [emailSent, setEmailSent] = useState(false);

  const resetPasswordMutation = useResetPassword({
    mutationConfig: {
      onSuccess: () => {
        setEmailSent(true);
      },
    },
  });

  const handleSendResetEmail = () => {
    if (user?.email) {
      resetPasswordMutation.mutate({
        data: { email: user.email },
      });
    }
  };

  return (
    <Card className="overflow-visible bg-transparent p-0 shadow-none md:bg-white md:p-10 md:shadow-sm">
      <H3 className="mb-1.5 hidden md:block">Password</H3>
      <div className="space-y-8">
        <Body2 className="text-secondary">
          Change your password by receiving a secure reset link via email.
        </Body2>

        {emailSent ? (
          <div className="inline-flex h-10 items-center rounded-md border border-green-200 bg-green-50 px-4 py-2">
            <Body2 className="text-green-800">
              Please check your inbox for a link to change your password.
            </Body2>
          </div>
        ) : (
          <Button
            onClick={handleSendResetEmail}
            disabled={resetPasswordMutation.isPending}
            className="w-full md:w-auto"
          >
            <span
              className={resetPasswordMutation.isPending ? 'invisible' : ''}
            >
              Change Password
            </span>
            {resetPasswordMutation.isPending && (
              <Spinner className="absolute" />
            )}
          </Button>
        )}

        {resetPasswordMutation.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <Body2 className="text-red-800">
              Failed to send reset email. Please try again.
            </Body2>
          </div>
        )}
      </div>
    </Card>
  );
};
