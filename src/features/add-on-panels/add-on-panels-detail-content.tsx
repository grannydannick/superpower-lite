import { AddOnPanelsDetail } from './add-on-panels-detail';
import type { AddOnItem } from './api/add-on-panels';

const AddOnPanelsDetailContent = ({
  item,
  isSelected,
  isToggleDisabled,
  onToggle,
  onClose,
}: {
  item: AddOnItem;
  isSelected: boolean;
  isToggleDisabled: boolean;
  onToggle: () => void;
  onClose: () => void;
}) => {
  const pd = item.productDetails;
  if (pd == null) {
    return null;
  }

  return (
    <AddOnPanelsDetail
      item={item}
      productDetails={pd}
      isSelected={isSelected}
      isToggleDisabled={isToggleDisabled}
      onToggle={onToggle}
      onClose={onClose}
    />
  );
};

export default AddOnPanelsDetailContent;
