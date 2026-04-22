import { getPanelDetailContent } from '@/features/onboarding/data/panel-detail-content';

import { AddOnPanelsDetail } from './add-on-panels-detail';
import type { AddOnItem } from './api/add-on-panels';

const AddOnPanelsDetailContent = ({
  item,
  itemId,
  isSelected,
  isToggleDisabled,
  onToggle,
  onClose,
}: {
  item: AddOnItem;
  itemId: AddOnItem['id'];
  isSelected: boolean;
  isToggleDisabled: boolean;
  onToggle: () => void;
  onClose: () => void;
}) => {
  const content = getPanelDetailContent(itemId);

  if (content == null) return null;

  return (
    <AddOnPanelsDetail
      item={item}
      content={content}
      isSelected={isSelected}
      isToggleDisabled={isToggleDisabled}
      onToggle={onToggle}
      onClose={onClose}
    />
  );
};

export default AddOnPanelsDetailContent;
