import { useNavigate } from '@tanstack/react-router';
import { type ReactElement } from 'react';

import {
  ActionableAccordion,
  ActionableAccordionItem,
} from '@/components/shared/actionable-accordion';
import { useWearables } from '@/features/settings/api/get-wearables';
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
  const { data: wearablesData } = useWearables();
  const hasNoWearables =
    (wearablesData?.wearables?.filter((w) => w.status === 'connected') ?? [])
      .length === 0;
  const { data: user } = useUser();
  const showImportMemory = shouldShowImportMemory(user?.createdAt);

  const actions: ActionItem[] = [
    {
      id: 'upload-labs',
      title: 'Unlock your health trends',
      description:
        "Upload past lab results and we'll show you how your biomarkers have changed over time.",
      imageSrc: '/data/file-stack.webp',
      onClick: () => {
        void navigate({
          to: '/concierge',
          search: { preset: 'upload-labs' },
        });
      },
    },
  ];

  if (hasNoWearables) {
    actions.push({
      id: 'connect-wearables',
      title: 'Connect your wearables',
      description:
        'Link Oura, Whoop, or Apple Health to get daily insights that connect your sleep, HRV, and activity to your lab results.',
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
      title: 'Bring your health context',
      description:
        'Already use ChatGPT or Claude for health? Import those conversations so your AI coach knows your full story.',
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
    <ActionableAccordion
      title="Get started"
      defaultOpen
      allowCollapse
      highlighted={false}
      showHeaderIndicator={false}
      showTopSeparator={false}
    >
      {items}
    </ActionableAccordion>
  );
};
