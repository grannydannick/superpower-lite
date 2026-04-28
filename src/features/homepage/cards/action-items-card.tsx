import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { type ReactElement } from 'react';

import { ActionableAccordionItem } from '@/components/shared/actionable-accordion';
import { wearablesQuery } from '@/features/homepage/api/queries';
import { HomepageActionAccordion } from '@/features/homepage/components/homepage-action-accordion';
import { useUser } from '@/lib/auth';
import { shouldShowImportMemory } from '@/utils/show-action-conditions';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  onClick: () => void;
}

export const ActionItemsCard = () => {
  const navigate = useNavigate();
  const wearablesQueryResult = useQuery(wearablesQuery());
  const { data: user } = useUser();
  const showImportMemory = shouldShowImportMemory(user?.createdAt);

  const actions: ActionItem[] = [
    {
      id: 'upload-labs',
      title: 'Upload past test records',
      description: 'See trends from your past labs.',
      imageSrc: '/data/file-stack.webp',
      onClick: () => {
        void navigate({
          to: '/concierge',
          search: { preset: 'upload-labs' },
        });
      },
    },
  ];

  const connectedWearables = wearablesQueryResult.data?.wearables ?? [];
  let hasConnectedWearable = false;
  for (const wearable of connectedWearables) {
    if (wearable.status === 'connected') {
      hasConnectedWearable = true;
      break;
    }
  }

  if (wearablesQueryResult.isSuccess && !hasConnectedWearable) {
    actions.push({
      id: 'connect-wearables',
      title: 'Connect your wearables',
      description:
        'Download our iOS App to connect & get personalized insights from your wearable data.',
      imageSrc: '/data/wearables.webp',
      onClick: () => {
        void navigate({
          to: '/settings',
          search: { tab: 'integrations' },
        });
      },
    });
  }

  if (showImportMemory) {
    actions.push({
      id: 'import-memory-superpower-ai',
      title: 'Continue from another AI',
      description: 'Import your conversations and deepen your health story.',
      imageSrc: '/concierge/other_llms.webp',
      onClick: () => {
        void navigate({
          to: '/concierge',
          search: { preset: 'import-memory' },
        });
      },
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
      />,
    );
  }

  return (
    <HomepageActionAccordion title="Action Items" variant="minimal">
      {items}
    </HomepageActionAccordion>
  );
};
