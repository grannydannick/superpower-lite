import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';

type ButtonGroupProps = {
  sourceParam: string;
  onDismiss: () => void;
};

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  sourceParam,
  onDismiss,
}) => {
  const navigate = useNavigate();

  const handleInviteClick = () => {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: 'invite_button_click',
      event_category: 'engagement',
      event_label: sourceParam,
    });
    navigate(`/invite?source=${sourceParam}`);
  };

  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost" onClick={onDismiss}>
        Dismiss
      </Button>
      <Button onClick={handleInviteClick}>Invite a friend</Button>
    </div>
  );
};
