import { type ReactElement } from 'react';

import { ActionableAccordionItem } from '@/components/shared/actionable-accordion';
import { HomepageActionAccordion } from '@/features/homepage/components/homepage-action-accordion';
import { useSetupActions } from '@/features/messages/hooks/use-setup-actions';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  onClick: () => void;
  onDismiss: () => void;
}

export const ActionItemsCard = () => {
  const setup = useSetupActions();

  const actions: ActionItem[] = [];

  if (setup.uploadLabs.visible) {
    actions.push({
      id: 'upload-labs',
      title: 'Upload past test records',
      description: 'See trends from your past labs.',
      imageSrc: '/data/file-stack.webp',
      onClick: setup.uploadLabs.onClick,
      onDismiss: setup.uploadLabs.dismiss,
    });
  }

  if (setup.connectWearables.visible) {
    actions.push({
      id: 'connect-wearables',
      title: 'Connect your wearables',
      description:
        'Download our iOS App to connect & get personalized insights from your wearable data.',
      imageSrc: '/data/wearables.webp',
      onClick: setup.connectWearables.onClick,
      onDismiss: setup.connectWearables.dismiss,
    });
  }

  if (setup.importMemory.visible) {
    actions.push({
      id: 'import-memory-superpower-ai',
      title: 'Continue from another AI',
      description: 'Import your conversations and deepen your health story.',
      imageSrc: '/concierge/other_llms.webp',
      onClick: setup.importMemory.onClick,
      onDismiss: setup.importMemory.dismiss,
    });
  }

  const items: ReactElement[] = [];
  for (const action of actions) {
    items.push(
      <ActionableAccordionItem
        key={action.id}
        title={action.title}
        description={action.description}
        imageSrc={action.imageSrc}
        onClick={action.onClick}
        onDismiss={action.onDismiss}
      />,
    );
  }

  return (
    <HomepageActionAccordion title="Action Items" variant="minimal">
      {items}
    </HomepageActionAccordion>
  );
};
